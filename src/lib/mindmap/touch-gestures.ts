export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

export interface GestureState {
  isActive: boolean;
  type: 'none' | 'pan' | 'pinch' | 'tap' | 'long-press';
  startTime: number;
  touches: TouchPoint[];
  initialDistance?: number;
  initialZoom?: number;
  initialPan?: { x: number; y: number };
  momentum?: { vx: number; vy: number };
}

export class TouchGestureHandler {
  private element: HTMLElement;
  private svg: SVGSVGElement;
  private gestureState: GestureState;
  private longPressTimer: number | null = null;
  private momentumTimer: number | null = null;
  private callbacks: {
    onZoom?: (zoom: number, centerX: number, centerY: number) => void;
    onPan?: (deltaX: number, deltaY: number) => void;
    onTap?: (x: number, y: number) => void;
    onLongPress?: (x: number, y: number) => void;
    onMomentumEnd?: () => void;
  };

  private readonly LONG_PRESS_DURATION = 500;
  private readonly TAP_THRESHOLD = 10;
  private readonly PINCH_THRESHOLD = 10;
  private readonly MOMENTUM_FRICTION = 0.95;
  private readonly MIN_MOMENTUM = 0.1;

  constructor(element: HTMLElement, svg: SVGSVGElement, callbacks: typeof TouchGestureHandler.prototype.callbacks = {}) {
    this.element = element;
    this.svg = svg;
    this.callbacks = callbacks;
    
    this.gestureState = {
      isActive: false,
      type: 'none',
      startTime: 0,
      touches: []
    };

    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: true });

    // Mouse events for desktop testing
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

    // Prevent context menu on long press
    this.element.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private getTouchPoints(touches: TouchList): TouchPoint[] {
    const points: TouchPoint[] = [];
    const rect = this.element.getBoundingClientRect();
    
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      points.push({
        id: touch.identifier,
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        timestamp: Date.now()
      });
    }
    
    return points;
  }

  private getDistance(p1: TouchPoint, p2: TouchPoint): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getCenter(points: TouchPoint[]): { x: number; y: number } {
    const sum = points.reduce((acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y
    }), { x: 0, y: 0 });
    
    return {
      x: sum.x / points.length,
      y: sum.y / points.length
    };
  }

  private handleTouchStart(event: TouchEvent): void {
    const touches = this.getTouchPoints(event.touches);
    const now = Date.now();

    this.gestureState = {
      isActive: true,
      type: 'none',
      startTime: now,
      touches: touches
    };

    if (touches.length === 1) {
      // Potential tap or pan
      this.startLongPressTimer(touches[0].x, touches[0].y);
      this.gestureState.initialPan = { x: touches[0].x, y: touches[0].y };
    } else if (touches.length === 2) {
      // Potential pinch
      this.clearLongPressTimer();
      this.gestureState.type = 'pinch';
      this.gestureState.initialDistance = this.getDistance(touches[0], touches[1]);
      this.gestureState.initialZoom = this.getCurrentZoom();
      this.gestureState.initialPan = this.getCenter(touches);
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.gestureState.isActive) return;

    event.preventDefault(); // Prevent scrolling
    
    const touches = this.getTouchPoints(event.touches);
    const prevTouches = this.gestureState.touches;
    
    this.gestureState.touches = touches;

    if (touches.length === 1 && prevTouches.length === 1) {
      this.handleSingleTouchMove(touches[0], prevTouches[0]);
    } else if (touches.length === 2 && prevTouches.length === 2) {
      this.handlePinchMove(touches);
    }
  }

  private handleSingleTouchMove(current: TouchPoint, previous: TouchPoint): void {
    const deltaX = current.x - previous.x;
    const deltaY = current.y - previous.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > this.TAP_THRESHOLD) {
      this.clearLongPressTimer();
      
      if (this.gestureState.type === 'none') {
        this.gestureState.type = 'pan';
      }
      
      if (this.gestureState.type === 'pan') {
        this.callbacks.onPan?.(deltaX, deltaY);
        
        // Calculate momentum
        const timeDelta = current.timestamp - previous.timestamp;
        if (timeDelta > 0) {
          this.gestureState.momentum = {
            vx: deltaX / timeDelta * 16, // Convert to px/frame (60fps)
            vy: deltaY / timeDelta * 16
          };
        }
      }
    }
  }

  private handlePinchMove(touches: TouchPoint[]): void {
    if (!this.gestureState.initialDistance || !this.gestureState.initialZoom) return;

    const currentDistance = this.getDistance(touches[0], touches[1]);
    const scale = currentDistance / this.gestureState.initialDistance;
    const newZoom = this.gestureState.initialZoom * scale;
    
    // Get center point for zoom
    const center = this.getCenter(touches);
    
    this.callbacks.onZoom?.(newZoom, center.x, center.y);
  }

  private handleTouchEnd(event: TouchEvent): void {
    const touches = this.getTouchPoints(event.touches);
    
    if (touches.length === 0) {
      // All touches ended
      this.handleGestureEnd();
    } else {
      // Some touches remain, update state
      this.gestureState.touches = touches;
      
      if (touches.length === 1 && this.gestureState.type === 'pinch') {
        // Transition from pinch to pan
        this.gestureState.type = 'pan';
        this.gestureState.initialPan = { x: touches[0].x, y: touches[0].y };
      }
    }
  }

  private handleTouchCancel(): void {
    this.handleGestureEnd();
  }

  private handleGestureEnd(): void {
    this.clearLongPressTimer();

    // Handle tap
    if (this.gestureState.type === 'none' && this.gestureState.touches.length > 0) {
      const touch = this.gestureState.touches[0];
      this.callbacks.onTap?.(touch.x, touch.y);
    }

    // Start momentum animation if panning ended with velocity
    if (this.gestureState.type === 'pan' && this.gestureState.momentum) {
      this.startMomentumAnimation();
    }

    this.gestureState = {
      isActive: false,
      type: 'none',
      startTime: 0,
      touches: []
    };
  }

  private startLongPressTimer(x: number, y: number): void {
    this.clearLongPressTimer();
    
    this.longPressTimer = window.setTimeout(() => {
      if (this.gestureState.isActive && this.gestureState.type === 'none') {
        this.gestureState.type = 'long-press';
        this.callbacks.onLongPress?.(x, y);
        
        // Add haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    }, this.LONG_PRESS_DURATION);
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private startMomentumAnimation(): void {
    if (!this.gestureState.momentum) return;

    this.clearMomentumTimer();
    
    const animate = () => {
      if (!this.gestureState.momentum) return;
      
      const { vx, vy } = this.gestureState.momentum;
      
      // Apply momentum
      this.callbacks.onPan?.(vx, vy);
      
      // Apply friction
      this.gestureState.momentum.vx *= this.MOMENTUM_FRICTION;
      this.gestureState.momentum.vy *= this.MOMENTUM_FRICTION;
      
      // Continue if momentum is significant
      if (Math.abs(vx) > this.MIN_MOMENTUM || Math.abs(vy) > this.MIN_MOMENTUM) {
        this.momentumTimer = requestAnimationFrame(animate);
      } else {
        this.gestureState.momentum = undefined;
        this.callbacks.onMomentumEnd?.();
      }
    };
    
    this.momentumTimer = requestAnimationFrame(animate);
  }

  private clearMomentumTimer(): void {
    if (this.momentumTimer) {
      cancelAnimationFrame(this.momentumTimer);
      this.momentumTimer = null;
    }
  }

  // Mouse event handlers for desktop testing
  private isMouseDown = false;
  private lastMousePos = { x: 0, y: 0 };

  private handleMouseDown(event: MouseEvent): void {
    this.isMouseDown = true;
    this.lastMousePos = { x: event.clientX, y: event.clientY };
    this.element.style.cursor = 'grabbing';
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isMouseDown) return;

    const deltaX = event.clientX - this.lastMousePos.x;
    const deltaY = event.clientY - this.lastMousePos.y;
    
    this.callbacks.onPan?.(deltaX, deltaY);
    
    this.lastMousePos = { x: event.clientX, y: event.clientY };
  }

  private handleMouseUp(): void {
    this.isMouseDown = false;
    this.element.style.cursor = 'grab';
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    
    const rect = this.element.getBoundingClientRect();
    const centerX = event.clientX - rect.left;
    const centerY = event.clientY - rect.top;
    
    const currentZoom = this.getCurrentZoom();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = currentZoom * zoomFactor;
    
    this.callbacks.onZoom?.(newZoom, centerX, centerY);
  }

  private getCurrentZoom(): number {
    // This should be implemented to return current zoom level
    // For now, return a default value
    return 1.0;
  }

  public destroy(): void {
    this.clearLongPressTimer();
    this.clearMomentumTimer();
    
    // Remove event listeners would go here if needed
    // (In practice, removing listeners is complex with bound methods)
  }

  public setCallbacks(callbacks: typeof TouchGestureHandler.prototype.callbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
}
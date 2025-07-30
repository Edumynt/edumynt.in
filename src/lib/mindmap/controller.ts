import { MindmapParser } from './parser.js';
import { MobileLayoutEngine } from './layout.js';
import { SVGMindmapRenderer } from './renderer.js';
import { TouchGestureHandler } from './touch-gestures.js';
import { MindmapSearch } from './search.js';
import { ProgressTracker } from './progress-tracker.js';
import type { MindmapData, ViewportState, MindmapEvents } from './types.js';

export class MindmapController {
  private container: HTMLElement;
  private svg: SVGSVGElement;
  private parser: MindmapParser;
  private layoutEngine: MobileLayoutEngine;
  private renderer: SVGMindmapRenderer | null = null;
  private gestureHandler: TouchGestureHandler | null = null;
  private searchEngine: MindmapSearch;
  private progressTracker: ProgressTracker | null = null;
  private mindmapData: MindmapData | null = null;
  private viewport: ViewportState;
  private isMobile: boolean;

  constructor(container: HTMLElement, initialContent?: string) {
    this.container = container;
    this.parser = new MindmapParser();
    this.searchEngine = new MindmapSearch();
    this.isMobile = window.innerWidth <= 768;
    
    this.initializeContainer();
    this.initializeViewport();
    this.initializeGestures();
    
    if (initialContent) {
      this.loadContent(initialContent);
    }
  }

  private initializeGestures(): void {
    // Initialize touch gesture handler
    this.gestureHandler = new TouchGestureHandler(this.container, this.svg, {
      onZoom: (zoom: number, centerX: number, centerY: number) => {
        this.handleZoom(zoom, centerX, centerY);
      },
      onPan: (deltaX: number, deltaY: number) => {
        this.handlePan(deltaX, deltaY);
      },
      onTap: (x: number, y: number) => {
        this.handleTap(x, y);
      },
      onLongPress: (x: number, y: number) => {
        this.handleLongPress(x, y);
      },
      onMomentumEnd: () => {
        this.updateInfo();
      }
    });
  }

  private handleZoom(newZoom: number, centerX: number, centerY: number): void {
    // Constrain zoom within bounds
    const constrainedZoom = Math.max(
      this.viewport.bounds.minZoom,
      Math.min(this.viewport.bounds.maxZoom, newZoom)
    );

    if (constrainedZoom !== this.viewport.zoom) {
      // Calculate pan adjustment to zoom towards the center point
      const zoomFactor = constrainedZoom / this.viewport.zoom;
      const newPanX = centerX - (centerX - this.viewport.panX) * zoomFactor;
      const newPanY = centerY - (centerY - this.viewport.panY) * zoomFactor;

      this.renderer?.updateViewport({
        zoom: constrainedZoom,
        panX: newPanX,
        panY: newPanY
      });
    }
  }

  private handlePan(deltaX: number, deltaY: number): void {
    const newPanX = this.viewport.panX + deltaX;
    const newPanY = this.viewport.panY + deltaY;

    // Apply loose bounds to prevent panning too far
    const constrainedPanX = Math.max(
      this.viewport.bounds.minX,
      Math.min(this.viewport.bounds.maxX, newPanX)
    );
    const constrainedPanY = Math.max(
      this.viewport.bounds.minY,
      Math.min(this.viewport.bounds.maxY, newPanY)
    );

    this.renderer?.updateViewport({
      panX: constrainedPanX,
      panY: constrainedPanY
    });
  }

  private handleTap(x: number, y: number): void {
    // Convert screen coordinates to SVG coordinates
    const svgPoint = this.screenToSVG(x, y);
    
    // Find the node at this position
    const clickedNode = this.findNodeAtPosition(svgPoint.x, svgPoint.y);
    
    if (clickedNode) {
      // Toggle node if it has children
      if (clickedNode.children.length > 0) {
        this.parser.toggleNodeCollapse(clickedNode);
        this.rerender();
      }
    }
  }

  private handleLongPress(x: number, y: number): void {
    // Convert screen coordinates to SVG coordinates
    const svgPoint = this.screenToSVG(x, y);
    
    // Find the node at this position
    const clickedNode = this.findNodeAtPosition(svgPoint.x, svgPoint.y);
    
    if (clickedNode) {
      // Center on the node with a smooth animation
      this.centerOnNodeSmooth(clickedNode);
      
      // Show node details (could open a tooltip or modal)
      this.showNodeDetails(clickedNode);
    }
  }

  private screenToSVG(screenX: number, screenY: number): { x: number; y: number } {
    const rect = this.svg.getBoundingClientRect();
    const svgX = (screenX - this.viewport.panX) / this.viewport.zoom;
    const svgY = (screenY - this.viewport.panY) / this.viewport.zoom;
    
    return { x: svgX, y: svgY };
  }

  private findNodeAtPosition(x: number, y: number): any {
    if (!this.mindmapData) return null;

    const traverse = (node: any): any => {
      // Check if point is within node bounds
      const nodeLeft = node.position.x;
      const nodeRight = node.position.x + node.dimensions.width;
      const nodeTop = node.position.y - node.dimensions.height / 2;
      const nodeBottom = node.position.y + node.dimensions.height / 2;

      if (x >= nodeLeft && x <= nodeRight && y >= nodeTop && y <= nodeBottom) {
        return node;
      }

      // Check children if not collapsed
      if (!node.isCollapsed) {
        for (const child of node.children) {
          const found = traverse(child);
          if (found) return found;
        }
      }

      return null;
    };

    return traverse(this.mindmapData.root);
  }

  private centerOnNodeSmooth(node: any): void {
    if (!this.renderer) return;

    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const targetPanX = centerX - (node.position.x + node.dimensions.width / 2) * this.viewport.zoom;
    const targetPanY = centerY - node.position.y * this.viewport.zoom;

    // Animate to the target position
    this.animateViewport({
      panX: targetPanX,
      panY: targetPanY
    }, 300);
  }

  private animateViewport(target: Partial<ViewportState>, duration: number): void {
    const start = { ...this.viewport };
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);

      const current: Partial<ViewportState> = {};
      
      if (target.panX !== undefined) {
        current.panX = start.panX + (target.panX - start.panX) * eased;
      }
      if (target.panY !== undefined) {
        current.panY = start.panY + (target.panY - start.panY) * eased;
      }
      if (target.zoom !== undefined) {
        current.zoom = start.zoom + (target.zoom - start.zoom) * eased;
      }

      this.renderer?.updateViewport(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  private showNodeDetails(node: any): void {
    // Create a temporary tooltip or use existing UI
    console.log('Node details:', {
      title: node.title,
      level: node.level,
      children: node.children.length,
      collapsed: node.isCollapsed
    });
    
    // You could implement a tooltip here
    // this.showTooltip(node);
  }

  private initializeContainer(): void {
    // Create SVG if it doesn't exist
    this.svg = this.container.querySelector('svg') as SVGSVGElement;
    if (!this.svg) {
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svg.setAttribute('class', 'mindmap-svg');
      this.svg.setAttribute('viewBox', '0 0 800 600');
      this.svg.style.width = '100%';
      this.svg.style.height = '100%';
      this.container.appendChild(this.svg);
    }

    // Get container dimensions for layout
    const rect = this.container.getBoundingClientRect();
    this.layoutEngine = new MobileLayoutEngine(
      rect.width || 800, 
      rect.height || 600, 
      this.isMobile
    );
  }

  private initializeViewport(): void {
    this.viewport = {
      zoom: 1,
      panX: 0,
      panY: 0,
      bounds: {
        minZoom: 0.1,
        maxZoom: 3.0,
        minX: -2000,
        maxX: 2000,
        minY: -2000,
        maxY: 2000
      }
    };
  }

  private createEvents(): MindmapEvents {
    return {
      onNodeClick: (node) => {
        // Track node visit
        this.progressTracker?.visitNode(node.id);
        console.log('Node clicked:', node.title);
      },
      
      onNodeExpand: (node) => {
        // Track node expansion
        this.progressTracker?.trackNodeExpansion(node.id);
        this.parser.toggleNodeCollapse(node);
        this.rerender();
      },
      
      onNodeCollapse: (node) => {
        // Track node interaction
        this.progressTracker?.visitNode(node.id);
        this.parser.toggleNodeCollapse(node);
        this.rerender();
      },
      
      onViewportChange: (viewport) => {
        this.viewport = viewport;
        this.updateInfo();
      }
    };
  }

  private rerender(): void {
    if (!this.mindmapData || !this.renderer) return;
    
    // Recalculate layout
    this.layoutEngine.layoutNodes(this.mindmapData.root);
    
    // Re-render
    this.renderer.render(this.mindmapData);
  }

  private updateInfo(): void {
    // Update footer info if elements exist
    const nodeCountEl = document.getElementById('nodeCount');
    const depthInfoEl = document.getElementById('depthInfo');
    
    if (this.mindmapData) {
      if (nodeCountEl) {
        const progressInfo = this.progressTracker ? 
          ` (${this.progressTracker.getVisitedCount()} visited)` : '';
        nodeCountEl.textContent = `${this.mindmapData.totalNodes} nodes${progressInfo}`;
      }
      if (depthInfoEl) {
        const completionInfo = this.progressTracker ? 
          ` • ${this.progressTracker.getCompletionPercentage()}% complete` : '';
        depthInfoEl.textContent = `Max depth: ${this.mindmapData.maxDepth}${completionInfo}`;
      }
    }
  }

  private generateLessonId(): string {
    // Generate a lesson ID based on current page or mindmap content
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    
    if (pathParts.length >= 4 && pathParts[1] === 'courses') {
      return `${pathParts[2]}_${pathParts.slice(3).join('_')}`;
    }
    
    // Fallback: use mindmap title
    return this.mindmapData?.title.toLowerCase().replace(/\s+/g, '_') || 'unknown_lesson';
  }

  private applyProgressVisualization(): void {
    if (!this.progressTracker || !this.mindmapData) return;

    const visitedNodes = this.progressTracker.getVisitedNodes();
    
    // Add visual indicators to visited nodes
    const traverse = (node: any) => {
      const nodeElement = this.svg.querySelector(`[data-node-id="${node.id}"]`);
      if (nodeElement && visitedNodes.has(node.id)) {
        nodeElement.classList.add('visited-node');
        
        // Add a small indicator
        const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        indicator.setAttribute('cx', String(node.position.x + node.dimensions.width - 8));
        indicator.setAttribute('cy', String(node.position.y - node.dimensions.height / 2 + 8));
        indicator.setAttribute('r', '3');
        indicator.setAttribute('fill', 'hsl(var(--primary))');
        indicator.setAttribute('class', 'progress-indicator');
        
        nodeElement.appendChild(indicator);
      }
      
      for (const child of node.children) {
        traverse(child);
      }
    };

    traverse(this.mindmapData.root);
  }

  // Progress methods
  public getProgressSummary(): any {
    return this.progressTracker?.getProgressSummary() || null;
  }

  public resetProgress(): void {
    this.progressTracker?.resetProgress();
    this.applyProgressVisualization();
    this.updateInfo();
  }

  public exportProgress(): string | null {
    return this.progressTracker?.exportProgress() || null;
  }

  public async loadContent(content: string): Promise<void> {
    try {
      // Parse the content
      this.mindmapData = this.parser.parseContent(content);
      
      // Calculate layout
      this.layoutEngine.layoutNodes(this.mindmapData.root);
      
      // Create renderer
      const events = this.createEvents();
      this.renderer = new SVGMindmapRenderer(this.svg, this.viewport, events, this.isMobile);
      
      // Initialize search engine
      this.searchEngine.setMindmapData(this.mindmapData.root);
      
      // Initialize progress tracking
      const lessonId = this.generateLessonId();
      this.progressTracker = new ProgressTracker(lessonId, this.mindmapData.totalNodes);
      
      // Render
      this.renderer.render(this.mindmapData);
      
      // Apply progress visualization
      this.applyProgressVisualization();
      
      // Center view
      this.centerView();
      
      // Update info
      this.updateInfo();
      
      console.log('Mindmap loaded successfully:', this.mindmapData);
      
    } catch (error) {
      console.error('Failed to load mindmap content:', error);
      this.showError('Failed to load mindmap content');
    }
  }

  public async loadFromUrl(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      await this.loadContent(content);
      
    } catch (error) {
      console.error('Failed to load mindmap from URL:', error);
      this.showError(`Failed to load mindmap from ${url}`);
    }
  }

  private showError(message: string): void {
    this.svg.innerHTML = `
      <g>
        <rect width="100%" height="100%" fill="hsl(var(--background))" />
        <text x="50%" y="45%" text-anchor="middle" fill="hsl(var(--destructive))" font-size="16" font-weight="600">
          ⚠️ Error
        </text>
        <text x="50%" y="55%" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="14">
          ${message}
        </text>
      </g>
    `;
  }

  // Control methods
  public zoomIn(): void {
    const newZoom = Math.min(this.viewport.zoom * 1.2, this.viewport.bounds.maxZoom);
    this.renderer?.updateViewport({ zoom: newZoom });
  }

  public zoomOut(): void {
    const newZoom = Math.max(this.viewport.zoom / 1.2, this.viewport.bounds.minZoom);
    this.renderer?.updateViewport({ zoom: newZoom });
  }

  public centerView(): void {
    if (!this.mindmapData) return;
    
    const optimalViewport = this.layoutEngine.getOptimalViewport(this.mindmapData.root);
    this.renderer?.updateViewport(optimalViewport);
  }

  public expandAll(): void {
    if (!this.mindmapData) return;
    
    this.parser.expandToLevel(this.mindmapData.root, 10); // Expand all levels
    this.rerender();
  }

  public collapseAll(): void {
    if (!this.mindmapData) return;
    
    this.parser.expandToLevel(this.mindmapData.root, 1); // Only show root and first level
    this.rerender();
  }

  public resetView(): void {
    this.centerView();
    if (this.mindmapData) {
      this.parser.expandToLevel(this.mindmapData.root, 2); // Show 2 levels by default
      this.rerender();
    }
  }

  // Search methods
  public search(query: string): any[] {
    return this.searchEngine.search(query);
  }

  public navigateToSearchResult(nodeId: string): void {
    if (!this.mindmapData) return;

    const targetNode = this.parser.findNodeById(this.mindmapData.root, nodeId);
    if (!targetNode) return;

    // Expand path to target node
    this.expandPathToNode(targetNode);
    
    // Re-render to show expanded path
    this.rerender();
    
    // Center on the target node
    setTimeout(() => {
      this.centerOnNodeSmooth(targetNode);
    }, 100);
  }

  private expandPathToNode(targetNode: any): void {
    if (!this.mindmapData) return;

    // Find path from root to target
    const path = this.findPathToNode(this.mindmapData.root, targetNode);
    
    // Expand all nodes in the path
    for (const node of path) {
      node.isCollapsed = false;
    }
  }

  private findPathToNode(root: any, target: any): any[] {
    const findPath = (node: any, path: any[] = []): any[] | null => {
      const currentPath = [...path, node];
      
      if (node.id === target.id) {
        return currentPath;
      }
      
      for (const child of node.children) {
        const childPath = findPath(child, currentPath);
        if (childPath) return childPath;
      }
      
      return null;
    };

    return findPath(root) || [];
  }

  public clearSearch(): void {
    this.searchEngine.clearResults();
  }

  public getSuggestions(prefix: string, limit?: number): string[] {
    return this.searchEngine.getSuggestions(prefix, limit);
  }

  public exportAsSVG(): string {
    return this.svg.outerHTML;
  }

  public destroy(): void {
    this.renderer?.destroy();
    this.gestureHandler?.destroy();
    this.progressTracker?.destroy();
    this.svg.innerHTML = '';
  }

  // Getters
  public getMindmapData(): MindmapData | null {
    return this.mindmapData;
  }

  public getViewport(): ViewportState {
    return { ...this.viewport };
  }
}

// Global initialization for mindmap modals
export function initializeMindmapModal(): void {
  const mindmapModal = document.getElementById('mindmapModal');
  const mindmapContainer = document.getElementById('mindmapContainer');
  
  if (!mindmapModal || !mindmapContainer) return;

  let controller: MindmapController | null = null;

  // Initialize controller when modal is opened
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const modal = mutation.target as HTMLElement;
        
        if (modal.classList.contains('active') && !controller) {
          // Modal opened, initialize controller
          controller = new MindmapController(mindmapContainer);
          loadCurrentPageMindmap(controller);
          setupModalControls(controller);
        } else if (!modal.classList.contains('active') && controller) {
          // Modal closed, cleanup
          controller.destroy();
          controller = null;
        }
      }
    });
  });

  observer.observe(mindmapModal, { attributes: true });
}

function setupModalControls(controller: MindmapController): void {
  // Search functionality
  const searchInput = document.getElementById('mindmapSearchInput') as HTMLInputElement;
  const clearSearchBtn = document.getElementById('clearSearch');
  const searchResults = document.getElementById('searchResults');
  const searchResultsList = document.getElementById('searchResultsList');
  const resultsCount = document.getElementById('resultsCount');
  const closeResultsBtn = document.getElementById('closeResults');

  let searchTimeout: number | null = null;

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const query = target.value.trim();

      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Show/hide clear button
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle('hidden', !query);
      }

      if (!query) {
        hideSearchResults();
        return;
      }

      // Debounce search
      searchTimeout = window.setTimeout(() => {
        performSearch(controller, query);
      }, 300);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideSearchResults();
        searchInput.blur();
      }
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
      }
      hideSearchResults();
      controller.clearSearch();
    });
  }

  if (closeResultsBtn) {
    closeResultsBtn.addEventListener('click', hideSearchResults);
  }

  function performSearch(controller: MindmapController, query: string) {
    const results = controller.search(query);
    
    if (!searchResults || !searchResultsList || !resultsCount) return;

    if (results.length === 0) {
      hideSearchResults();
      return;
    }

    // Update results count
    resultsCount.textContent = `${results.length} result${results.length === 1 ? '' : 's'}`;

    // Clear previous results
    searchResultsList.innerHTML = '';

    // Populate results
    results.forEach((result, index) => {
      const resultItem = document.createElement('div');
      resultItem.className = 'search-result-item';
      resultItem.dataset.nodeId = result.node.id;

      const titleElement = document.createElement('div');
      titleElement.className = 'search-result-title';
      
      // Use the search engine's highlight method
      const searchEngine = (controller as any).searchEngine;
      titleElement.innerHTML = searchEngine.highlightText(result.node.title, result.highlightRanges);

      const pathElement = document.createElement('div');
      pathElement.className = 'search-result-path';
      pathElement.textContent = result.path.length > 0 ? result.path.join(' › ') : 'Root level';

      resultItem.appendChild(titleElement);
      resultItem.appendChild(pathElement);

      resultItem.addEventListener('click', () => {
        controller.navigateToSearchResult(result.node.id);
        hideSearchResults();
        if (searchInput) {
          searchInput.blur();
        }
      });

      searchResultsList.appendChild(resultItem);
    });

    // Show results
    searchResults.classList.remove('hidden');
  }

  function hideSearchResults() {
    if (searchResults) {
      searchResults.classList.add('hidden');
    }
  }

  // Hide results when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const searchContainer = document.querySelector('.mindmap-search-container');
    
    if (searchContainer && !searchContainer.contains(target)) {
      hideSearchResults();
    }
  });

  // Zoom controls
  document.getElementById('mindmapZoomIn')?.addEventListener('click', () => {
    controller.zoomIn();
  });

  document.getElementById('mindmapZoomOut')?.addEventListener('click', () => {
    controller.zoomOut();
  });

  // Reset view
  document.getElementById('resetView')?.addEventListener('click', () => {
    controller.resetView();
  });

  // Export
  document.getElementById('exportMindmap')?.addEventListener('click', () => {
    const svgData = controller.exportAsSVG();
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Fullscreen toggle
  document.getElementById('mindmapFullscreen')?.addEventListener('click', () => {
    const modal = document.getElementById('mindmapModal');
    modal?.classList.toggle('fullscreen');
  });
}

async function loadCurrentPageMindmap(controller: MindmapController): Promise<void> {
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  
  if (pathParts.length >= 4 && pathParts[1] === 'courses') {
    const course = pathParts[2];
    const lessonPath = pathParts.slice(3).join('/');
    
    // Try to load from existing mindmap files (client-side detection)
    try {
      await loadMindmapFromExistingContent(controller, course, lessonPath);
    } catch (error) {
      console.warn('Failed to load existing mindmap, using sample:', error);
      await loadSampleMindmap(controller, course, lessonPath);
    }
  }
}

async function loadMindmapFromExistingContent(controller: MindmapController, course: string, lessonPath: string): Promise<void> {
  // Try to construct mindmap URL based on common patterns
  const possibleMindmapUrls = [
    `/courses/${course}/${lessonPath}/5_Mindmap`,
    `/courses/${course}/${lessonPath.split('/').slice(0, -1).join('/')}/5_Mindmap`,
    `/courses/${course}/${lessonPath}-mindmap`,
  ];

  for (const url of possibleMindmapUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const content = await response.text();
        
        // Check if this looks like a mindmap (contains bullet points)
        if (content.includes('- **') || content.includes('* **')) {
          await controller.loadContent(content);
          return;
        }
      }
    } catch (error) {
      // Continue to next URL
      continue;
    }
  }

  throw new Error('No existing mindmap content found');
}

async function loadSampleMindmap(controller: MindmapController, course: string, lessonPath: string): Promise<void> {
  // Enhanced sample content based on the course and lesson
  const sampleMindmapContent = generateSampleMindmap(course, lessonPath);
  await controller.loadContent(sampleMindmapContent);
  
  // Update modal title
  const titleEl = document.getElementById('mindmapTitle');
  const subtitleEl = document.getElementById('mindmapSubtitle');
  
  if (titleEl) titleEl.textContent = 'Sample Mindmap';
  if (subtitleEl) subtitleEl.textContent = `${course} • ${lessonPath}`;
}

function generateSampleMindmap(course: string, lessonPath: string): string {
  const courseTitle = course.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  const lessonTitle = lessonPath.split('/').pop()?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') || 'Lesson Content';

  return `---
title: "${lessonTitle} - Mindmap"
description: "Interactive mindmap for ${lessonTitle}"
course: "${courseTitle}"
---

# ${lessonTitle}

- **${lessonTitle}**
  - **Key Concepts**
    - Primary Theme
      - Supporting Detail 1
      - Supporting Detail 2
    - Secondary Theme
      - Important Point A
      - Important Point B
        - Sub-point B.1
        - Sub-point B.2
  - **Historical Context**
    - Time Period
    - Major Influences
      - Cultural Factors
      - Literary Movements
    - Contemporary Works
  - **Analysis & Interpretation**
    - Literary Techniques
      - Style Elements
      - Narrative Structure
    - Themes & Motifs
      - Central Messages
      - Symbolic Elements
    - Critical Reception
      - Contemporary Reviews
      - Modern Perspectives
  - **Significance & Legacy**
    - Impact on Literature
    - Influence on Later Works
    - Educational Value
      - Learning Objectives
      - Key Takeaways
`;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeMindmapModal();
});
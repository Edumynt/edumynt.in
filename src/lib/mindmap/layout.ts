import type { MindmapNode, LayoutConfig, ViewportState } from './types.js';

export class MobileLayoutEngine {
  private config: LayoutConfig;

  constructor(containerWidth: number, containerHeight: number, isMobile: boolean = true) {
    this.config = {
      nodeSpacing: {
        horizontal: isMobile ? 80 : 120,
        vertical: isMobile ? 60 : 80
      },
      nodeSize: {
        minWidth: isMobile ? 100 : 120,
        minHeight: isMobile ? 40 : 50,
        maxWidth: isMobile ? 180 : 220,
        padding: isMobile ? 12 : 16
      },
      canvas: {
        width: containerWidth,
        height: containerHeight,
        centerX: containerWidth / 2,
        centerY: containerHeight / 2
      },
      mobile: {
        isActive: isMobile,
        touchTargetSize: 44, // Minimum touch target for mobile
        fontSize: isMobile ? 14 : 16
      }
    };
  }

  private calculateSubtreeSize(node: MindmapNode): { width: number; height: number } {
    if (node.children.length === 0 || node.isCollapsed) {
      return {
        width: node.dimensions.width,
        height: node.dimensions.height
      };
    }

    let totalWidth = 0;
    let totalHeight = 0;
    let maxChildWidth = 0;

    for (const child of node.children) {
      const childSize = this.calculateSubtreeSize(child);
      totalHeight += childSize.height + this.config.nodeSpacing.vertical;
      maxChildWidth = Math.max(maxChildWidth, childSize.width);
    }

    // Remove extra spacing from last child
    totalHeight -= this.config.nodeSpacing.vertical;

    return {
      width: node.dimensions.width + this.config.nodeSpacing.horizontal + maxChildWidth,
      height: Math.max(node.dimensions.height, totalHeight)
    };
  }

  private layoutVerticalTree(node: MindmapNode, x: number, y: number): void {
    // Set current node position
    node.position.x = x;
    node.position.y = y;

    if (node.children.length === 0 || node.isCollapsed) {
      return;
    }

    // Calculate total height needed for all children
    let totalChildrenHeight = 0;
    const childSizes: { width: number; height: number }[] = [];

    for (const child of node.children) {
      const childSize = this.calculateSubtreeSize(child);
      childSizes.push(childSize);
      totalChildrenHeight += childSize.height;
    }

    // Add spacing between children
    totalChildrenHeight += (node.children.length - 1) * this.config.nodeSpacing.vertical;

    // Start positioning children from the top
    let currentY = y - totalChildrenHeight / 2;
    const childX = x + node.dimensions.width + this.config.nodeSpacing.horizontal;

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const childSize = childSizes[i];
      
      // Center the child vertically within its allocated space
      const childCenterY = currentY + childSize.height / 2;
      
      this.layoutVerticalTree(child, childX, childCenterY);
      
      // Move to next child position
      currentY += childSize.height + this.config.nodeSpacing.vertical;
    }
  }

  private layoutRadialMobile(node: MindmapNode, centerX: number, centerY: number): void {
    node.position.x = centerX;
    node.position.y = centerY;

    if (node.children.length === 0 || node.isCollapsed) {
      return;
    }

    const radius = this.config.mobile.isActive ? 120 : 150;
    const angleStep = (2 * Math.PI) / node.children.length;
    
    node.children.forEach((child, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const childX = centerX + Math.cos(angle) * radius;
      const childY = centerY + Math.sin(angle) * radius;
      
      this.layoutVerticalTree(child, childX, childY);
    });
  }

  public layoutNodes(root: MindmapNode, layoutType: 'vertical' | 'radial' = 'vertical'): void {
    if (layoutType === 'radial' || root.children.length <= 4) {
      // Use radial layout for root with few children (better for mobile)
      this.layoutRadialMobile(root, this.config.canvas.centerX, this.config.canvas.centerY);
    } else {
      // Use vertical tree layout for complex hierarchies
      this.layoutVerticalTree(root, this.config.canvas.centerX - root.dimensions.width / 2, this.config.canvas.centerY);
    }
  }

  public calculateBounds(root: MindmapNode): { minX: number; maxX: number; minY: number; maxY: number } {
    let minX = root.position.x;
    let maxX = root.position.x + root.dimensions.width;
    let minY = root.position.y - root.dimensions.height / 2;
    let maxY = root.position.y + root.dimensions.height / 2;

    const traverse = (node: MindmapNode) => {
      const nodeLeft = node.position.x;
      const nodeRight = node.position.x + node.dimensions.width;
      const nodeTop = node.position.y - node.dimensions.height / 2;
      const nodeBottom = node.position.y + node.dimensions.height / 2;

      minX = Math.min(minX, nodeLeft);
      maxX = Math.max(maxX, nodeRight);
      minY = Math.min(minY, nodeTop);
      maxY = Math.max(maxY, nodeBottom);

      if (!node.isCollapsed) {
        node.children.forEach(traverse);
      }
    };

    traverse(root);

    // Add padding
    const padding = 50;
    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minY: minY - padding,
      maxY: maxY + padding
    };
  }

  public getOptimalViewport(root: MindmapNode): ViewportState {
    const bounds = this.calculateBounds(root);
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    
    const scaleX = this.config.canvas.width / contentWidth;
    const scaleY = this.config.canvas.height / contentHeight;
    const optimalZoom = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

    // Center the content
    const panX = (this.config.canvas.width - contentWidth * optimalZoom) / 2 - bounds.minX * optimalZoom;
    const panY = (this.config.canvas.height - contentHeight * optimalZoom) / 2 - bounds.minY * optimalZoom;

    return {
      zoom: optimalZoom,
      panX,
      panY,
      bounds: {
        minZoom: 0.1,
        maxZoom: 3.0,
        minX: -contentWidth,
        maxX: contentWidth,
        minY: -contentHeight,
        maxY: contentHeight
      }
    };
  }

  public updateConfig(updates: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  public getConfig(): LayoutConfig {
    return { ...this.config };
  }
}
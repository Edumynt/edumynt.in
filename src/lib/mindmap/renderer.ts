import type { MindmapNode, MindmapData, ViewportState, MindmapEvents } from './types.js';

export class SVGMindmapRenderer {
  private svg: SVGSVGElement;
  private container: SVGGElement;
  private viewport: ViewportState;
  private events: MindmapEvents;
  private isMobile: boolean;

  constructor(
    svgElement: SVGSVGElement, 
    viewport: ViewportState, 
    events: MindmapEvents,
    isMobile: boolean = true
  ) {
    this.svg = svgElement;
    this.viewport = viewport;
    this.events = events;
    this.isMobile = isMobile;
    
    this.initializeSVG();
  }

  private initializeSVG(): void {
    // Clear existing content
    this.svg.innerHTML = '';
    
    // Create main container group
    this.container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.container.setAttribute('class', 'mindmap-container');
    this.svg.appendChild(this.container);

    // Add CSS styles
    this.addStyles();
    
    // Apply initial viewport transform
    this.updateViewport();
  }

  private addStyles(): void {
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
      .mindmap-node {
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .mindmap-node:hover .node-bg {
        fill: hsl(var(--accent));
        stroke: hsl(var(--primary));
        stroke-width: 2;
      }
      
      .mindmap-node:hover .node-text {
        fill: hsl(var(--accent-foreground));
      }
      
      .node-bg {
        fill: hsl(var(--card));
        stroke: hsl(var(--border));
        stroke-width: 1.5;
        rx: 8;
        ry: 8;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
      }
      
      .node-text {
        fill: hsl(var(--card-foreground));
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: ${this.isMobile ? '12px' : '14px'};
        font-weight: 500;
        text-anchor: middle;
        dominant-baseline: middle;
        pointer-events: none;
      }
      
      .node-connection {
        stroke: hsl(var(--muted-foreground));
        stroke-width: 2;
        fill: none;
        opacity: 0.6;
        stroke-dasharray: none;
      }
      
      .node-expand-indicator {
        fill: hsl(var(--muted-foreground));
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: ${this.isMobile ? '10px' : '12px'};
        font-weight: 600;
        text-anchor: middle;
        dominant-baseline: middle;
        pointer-events: none;
      }
      
      .root-node .node-bg {
        fill: hsl(var(--primary));
        stroke: hsl(var(--primary));
        stroke-width: 2;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      }
      
      .root-node .node-text {
        fill: hsl(var(--primary-foreground));
        font-weight: 600;
        font-size: ${this.isMobile ? '14px' : '16px'};
      }
      
      .branch-node .node-bg {
        fill: hsl(var(--secondary));
        stroke: hsl(var(--border));
        stroke-width: 1.5;
      }
      
      .branch-node .node-text {
        fill: hsl(var(--secondary-foreground));
        font-weight: 500;
      }
      
      .leaf-node .node-bg {
        fill: hsl(var(--muted));
        stroke: hsl(var(--border));
        stroke-width: 1;
      }
      
      .leaf-node .node-text {
        fill: hsl(var(--muted-foreground));
        font-size: ${this.isMobile ? '11px' : '13px'};
      }
      
      .collapsed-children {
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
      }
      
      .visited-node .node-bg {
        stroke: hsl(var(--primary));
        stroke-width: 2;
      }
      
      .progress-indicator {
        opacity: 0.8;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      
      /* Dark theme specific enhancements */
      @media (prefers-color-scheme: dark) {
        .node-bg {
          filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3));
        }
        
        .root-node .node-bg {
          filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
        }
        
        .node-connection {
          opacity: 0.7;
        }
        
        .visited-node .node-bg {
          filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 0 1px hsl(var(--primary)));
        }
      }
      
      @media (max-width: 768px) {
        .node-text {
          font-size: 11px;
        }
        .root-node .node-text {
          font-size: 13px;
        }
        .leaf-node .node-text {
          font-size: 10px;
        }
      }
    `;
    
    this.svg.appendChild(style);
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    // Rough character width estimation
    const charWidth = this.isMobile ? 7 : 8;
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word is too long, split it
          lines.push(word.substring(0, maxCharsPerLine));
          currentLine = word.substring(maxCharsPerLine);
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.slice(0, 3); // Limit to 3 lines for mobile
  }

  private createNodeElement(node: MindmapNode): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', `mindmap-node ${node.metadata?.type}-node`);
    group.setAttribute('data-node-id', node.id);
    
    // Ensure minimum touch target size on mobile
    const minSize = this.isMobile ? 44 : 32;
    const width = Math.max(node.dimensions.width, minSize);
    const height = Math.max(node.dimensions.height, minSize);
    
    // Background rectangle
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('class', 'node-bg');
    rect.setAttribute('x', String(node.position.x));
    rect.setAttribute('y', String(node.position.y - height / 2));
    rect.setAttribute('width', String(width));
    rect.setAttribute('height', String(height));
    group.appendChild(rect);
    
    // Text content
    const textLines = this.wrapText(node.title, width - 16);
    const lineHeight = this.isMobile ? 14 : 16;
    const totalTextHeight = textLines.length * lineHeight;
    const startY = node.position.y - totalTextHeight / 2 + lineHeight / 2;
    
    textLines.forEach((line, index) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'node-text');
      text.setAttribute('x', String(node.position.x + width / 2));
      text.setAttribute('y', String(startY + index * lineHeight));
      text.textContent = line;
      group.appendChild(text);
    });
    
    // Expand/collapse indicator for nodes with children
    if (node.children.length > 0) {
      const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      indicator.setAttribute('class', 'node-expand-indicator');
      indicator.setAttribute('x', String(node.position.x + width - 12));
      indicator.setAttribute('y', String(node.position.y - height / 2 + 12));
      indicator.textContent = node.isCollapsed ? `+${node.children.length}` : '−';
      group.appendChild(indicator);
    }
    
    // Add click handler
    group.addEventListener('click', (e) => {
      e.stopPropagation();
      this.events.onNodeClick(node);
      
      if (node.children.length > 0) {
        if (node.isCollapsed) {
          this.events.onNodeExpand(node);
        } else {
          this.events.onNodeCollapse(node);
        }
      }
    });
    
    return group;
  }

  private createConnectionElement(parent: MindmapNode, child: MindmapNode): SVGPathElement {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'node-connection');
    
    const startX = parent.position.x + parent.dimensions.width;
    const startY = parent.position.y;
    const endX = child.position.x;
    const endY = child.position.y;
    
    // Create smooth curved connection
    const midX = startX + (endX - startX) / 2;
    const pathData = `M ${startX} ${startY} Q ${midX} ${startY}, ${midX} ${endY} T ${endX} ${endY}`;
    
    path.setAttribute('d', pathData);
    
    return path;
  }

  private renderNodeAndChildren(node: MindmapNode, connectionsGroup: SVGGElement, nodesGroup: SVGGElement): void {
    // Render connections to children first (so they appear behind nodes)
    if (!node.isCollapsed) {
      for (const child of node.children) {
        const connection = this.createConnectionElement(node, child);
        connectionsGroup.appendChild(connection);
        this.renderNodeAndChildren(child, connectionsGroup, nodesGroup);
      }
    }
    
    // Render the node itself
    const nodeElement = this.createNodeElement(node);
    nodesGroup.appendChild(nodeElement);
  }

  public render(mindmapData: MindmapData): void {
    // Clear container
    this.container.innerHTML = '';
    
    // Create groups for different elements (connections behind nodes)
    const connectionsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    connectionsGroup.setAttribute('class', 'connections');
    this.container.appendChild(connectionsGroup);
    
    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodesGroup.setAttribute('class', 'nodes');
    this.container.appendChild(nodesGroup);
    
    // Render all nodes and connections
    this.renderNodeAndChildren(mindmapData.root, connectionsGroup, nodesGroup);
  }

  public updateViewport(newViewport?: Partial<ViewportState>): void {
    if (newViewport) {
      this.viewport = { ...this.viewport, ...newViewport };
    }
    
    const transform = `translate(${this.viewport.panX}, ${this.viewport.panY}) scale(${this.viewport.zoom})`;
    this.container.setAttribute('transform', transform);
    
    this.events.onViewportChange(this.viewport);
  }

  public centerOnNode(node: MindmapNode): void {
    const svg = this.svg.getBoundingClientRect();
    const centerX = svg.width / 2;
    const centerY = svg.height / 2;
    
    const newPanX = centerX - (node.position.x + node.dimensions.width / 2) * this.viewport.zoom;
    const newPanY = centerY - node.position.y * this.viewport.zoom;
    
    this.updateViewport({ panX: newPanX, panY: newPanY });
  }

  public getViewport(): ViewportState {
    return { ...this.viewport };
  }

  public destroy(): void {
    this.svg.innerHTML = '';
  }
}
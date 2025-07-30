export interface MindmapNode {
  id: string;
  title: string;
  content?: string;
  level: number;
  children: MindmapNode[];
  parent?: MindmapNode;
  isCollapsed: boolean;
  position: {
    x: number;
    y: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  metadata?: {
    type?: 'root' | 'branch' | 'leaf';
    importance?: 'high' | 'medium' | 'low';
    tags?: string[];
  };
}

export interface MindmapData {
  title: string;
  description?: string;
  root: MindmapNode;
  totalNodes: number;
  maxDepth: number;
  metadata?: {
    course?: string;
    chapter?: string;
    tags?: string[];
  };
}

export interface LayoutConfig {
  nodeSpacing: {
    horizontal: number;
    vertical: number;
  };
  nodeSize: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    padding: number;
  };
  canvas: {
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  };
  mobile: {
    isActive: boolean;
    touchTargetSize: number;
    fontSize: number;
  };
}

export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
  bounds: {
    minZoom: number;
    maxZoom: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export interface MindmapEvents {
  onNodeClick: (node: MindmapNode) => void;
  onNodeExpand: (node: MindmapNode) => void;
  onNodeCollapse: (node: MindmapNode) => void;
  onViewportChange: (viewport: ViewportState) => void;
}

export interface ParsedContent {
  frontmatter: {
    title: string;
    description?: string;
    course?: string;
    chapter?: string;
    tags?: string[];
  };
  content: string;
  hierarchicalData: MindmapNode;
}
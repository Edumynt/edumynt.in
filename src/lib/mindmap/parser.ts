import type { MindmapNode, MindmapData, ParsedContent } from './types.js';

export class MindmapParser {
  private idCounter = 0;

  private generateId(): string {
    return `node_${++this.idCounter}`;
  }

  private cleanText(text: string): string {
    return text
      .replace(/^\*+\s*/, '') // Remove bullet points
      .replace(/^\-+\s*/, '') // Remove dashes
      .replace(/^\d+\.\s*/, '') // Remove numbered lists
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .replace(/`(.*?)`/g, '$1') // Remove code markdown
      .trim();
  }

  private calculateNodeLevel(line: string): number {
    const match = line.match(/^(\s*)/);
    const indentLevel = match ? Math.floor(match[1].length / 2) : 0;
    return indentLevel;
  }

  private estimateNodeDimensions(text: string, level: number): { width: number; height: number } {
    const baseWidth = 120;
    const charWidth = 8;
    const lineHeight = 20;
    const padding = 16;
    
    // Calculate width based on text length
    const textWidth = Math.min(text.length * charWidth, 200 - (level * 10));
    const width = Math.max(baseWidth - (level * 15), textWidth + padding);
    
    // Calculate height based on text wrapping
    const maxCharsPerLine = Math.floor((width - padding) / charWidth);
    const lines = Math.ceil(text.length / maxCharsPerLine);
    const height = Math.max(40, lines * lineHeight + padding);
    
    return { width, height };
  }

  private parseBulletPoints(content: string): MindmapNode {
    const lines = content.split('\n').filter(line => line.trim());
    const stack: MindmapNode[] = [];
    let rootNode: MindmapNode | null = null;

    for (const line of lines) {
      // Skip lines that don't look like bullet points
      if (!line.match(/^\s*[-*]\s+/)) {
        continue;
      }

      const level = this.calculateNodeLevel(line);
      const title = this.cleanText(line);
      
      if (!title) continue;

      const dimensions = this.estimateNodeDimensions(title, level);
      
      const node: MindmapNode = {
        id: this.generateId(),
        title,
        level,
        children: [],
        isCollapsed: level > 2, // Auto-collapse deep levels on mobile
        position: { x: 0, y: 0 }, // Will be calculated by layout engine
        dimensions,
        metadata: {
          type: level === 0 ? 'root' : level > 3 ? 'leaf' : 'branch',
          importance: level === 0 ? 'high' : level === 1 ? 'medium' : 'low'
        }
      };

      // Handle root node
      if (level === 0) {
        rootNode = node;
        stack.length = 0;
        stack.push(node);
        continue;
      }

      // Find parent node
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length > 0) {
        const parent = stack[stack.length - 1];
        node.parent = parent;
        parent.children.push(node);
      }

      stack.push(node);
    }

    if (!rootNode) {
      // Create a default root if none found
      rootNode = {
        id: this.generateId(),
        title: 'Mindmap',
        level: 0,
        children: [],
        isCollapsed: false,
        position: { x: 0, y: 0 },
        dimensions: { width: 150, height: 50 },
        metadata: { type: 'root', importance: 'high' }
      };
    }

    return rootNode;
  }

  private extractFrontmatter(rawContent: string): { frontmatter: any; content: string } {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = rawContent.match(frontmatterRegex);
    
    if (!match) {
      return {
        frontmatter: {},
        content: rawContent
      };
    }

    const frontmatterYaml = match[1];
    const content = match[2];
    
    // Simple YAML parser for our needs
    const frontmatter: any = {};
    const lines = frontmatterYaml.split('\n');
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // Handle arrays (simple case)
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
        }
        
        frontmatter[key] = value;
      }
    }

    return { frontmatter, content };
  }

  private calculateStats(node: MindmapNode): { totalNodes: number; maxDepth: number } {
    let totalNodes = 1;
    let maxDepth = node.level;

    for (const child of node.children) {
      const childStats = this.calculateStats(child);
      totalNodes += childStats.totalNodes;
      maxDepth = Math.max(maxDepth, childStats.maxDepth);
    }

    return { totalNodes, maxDepth };
  }

  public parseContent(rawContent: string): MindmapData {
    const { frontmatter, content } = this.extractFrontmatter(rawContent);
    const rootNode = this.parseBulletPoints(content);
    const stats = this.calculateStats(rootNode);

    return {
      title: frontmatter.title || 'Mindmap',
      description: frontmatter.description,
      root: rootNode,
      totalNodes: stats.totalNodes,
      maxDepth: stats.maxDepth,
      metadata: {
        course: frontmatter.course,
        chapter: frontmatter.chapter,
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : []
      }
    };
  }

  // Helper method to find a node by ID
  public findNodeById(root: MindmapNode, id: string): MindmapNode | null {
    if (root.id === id) return root;
    
    for (const child of root.children) {
      const found = this.findNodeById(child, id);
      if (found) return found;
    }
    
    return null;
  }

  // Helper method to toggle node collapse state
  public toggleNodeCollapse(node: MindmapNode): void {
    node.isCollapsed = !node.isCollapsed;
  }

  // Helper method to expand all nodes up to a certain level
  public expandToLevel(root: MindmapNode, targetLevel: number): void {
    const traverse = (node: MindmapNode) => {
      if (node.level < targetLevel) {
        node.isCollapsed = false;
      } else {
        node.isCollapsed = true;
      }
      
      for (const child of node.children) {
        traverse(child);
      }
    };
    
    traverse(root);
  }
}
import type { MindmapNode } from './types.js';

export interface SearchResult {
  node: MindmapNode;
  score: number;
  highlightRanges: Array<{ start: number; end: number }>;
  path: string[];
}

export class MindmapSearch {
  private rootNode: MindmapNode | null = null;
  private searchIndex: Map<string, MindmapNode[]> = new Map();
  private currentResults: SearchResult[] = [];
  private currentQuery: string = '';

  public setMindmapData(rootNode: MindmapNode): void {
    this.rootNode = rootNode;
    this.buildSearchIndex();
  }

  private buildSearchIndex(): void {
    if (!this.rootNode) return;

    this.searchIndex.clear();
    
    const traverse = (node: MindmapNode, path: string[] = []) => {
      const currentPath = [...path, node.title];
      
      // Index individual words
      const words = this.extractWords(node.title);
      for (const word of words) {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, []);
        }
        this.searchIndex.get(word)!.push(node);
      }

      // Index the full title
      const titleKey = node.title.toLowerCase();
      if (!this.searchIndex.has(titleKey)) {
        this.searchIndex.set(titleKey, []);
      }
      this.searchIndex.get(titleKey)!.push(node);

      // Recursively index children
      for (const child of node.children) {
        traverse(child, currentPath);
      }
    };

    traverse(this.rootNode);
  }

  private extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2) // Only words longer than 2 characters
      .filter(word => !this.isStopWord(word));
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'
    ]);
    return stopWords.has(word);
  }

  public search(query: string): SearchResult[] {
    if (!query.trim()) {
      this.currentResults = [];
      this.currentQuery = '';
      return [];
    }

    this.currentQuery = query.toLowerCase().trim();
    const searchTerms = this.extractWords(this.currentQuery);
    const results = new Map<string, SearchResult>();

    // Search for exact matches first
    this.findExactMatches(this.currentQuery, results);

    // Then search for partial matches
    for (const term of searchTerms) {
      this.findPartialMatches(term, results);
    }

    // Convert to array and sort by relevance
    this.currentResults = Array.from(results.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Limit to top 20 results

    return this.currentResults;
  }

  private findExactMatches(query: string, results: Map<string, SearchResult>): void {
    if (!this.rootNode) return;

    const traverse = (node: MindmapNode, path: string[] = []) => {
      const currentPath = [...path, node.title];
      const nodeText = node.title.toLowerCase();
      
      if (nodeText.includes(query)) {
        const nodeId = node.id;
        const existingResult = results.get(nodeId);
        const matchScore = this.calculateScore(nodeText, query, true);
        
        if (!existingResult || matchScore > existingResult.score) {
          results.set(nodeId, {
            node,
            score: matchScore,
            highlightRanges: this.findHighlightRanges(nodeText, query),
            path: currentPath.slice(0, -1) // Exclude current node from path
          });
        }
      }

      for (const child of node.children) {
        traverse(child, currentPath);
      }
    };

    traverse(this.rootNode);
  }

  private findPartialMatches(term: string, results: Map<string, SearchResult>): void {
    const matchingNodes = this.searchIndex.get(term) || [];
    
    for (const node of matchingNodes) {
      const nodeId = node.id;
      const existingResult = results.get(nodeId);
      const nodeText = node.title.toLowerCase();
      const matchScore = this.calculateScore(nodeText, term, false);
      
      if (!existingResult || matchScore > existingResult.score) {
        const path = this.getNodePath(node);
        results.set(nodeId, {
          node,
          score: matchScore,
          highlightRanges: this.findHighlightRanges(nodeText, term),
          path: path.slice(0, -1) // Exclude current node from path
        });
      }
    }
  }

  private calculateScore(text: string, query: string, isExactMatch: boolean): number {
    let score = 0;
    
    // Base score for match type
    if (isExactMatch) {
      score += 100;
      
      // Bonus for exact phrase match
      if (text === query) {
        score += 50;
      }
      
      // Bonus for match at beginning
      if (text.startsWith(query)) {
        score += 25;
      }
    } else {
      score += 50;
      
      // Bonus for word boundary matches
      const wordBoundaryRegex = new RegExp(`\\b${query}\\b`, 'i');
      if (wordBoundaryRegex.test(text)) {
        score += 25;
      }
    }
    
    // Length penalty (shorter matches are better)
    score -= Math.max(0, text.length - query.length) * 0.1;
    
    // Node depth bonus (higher level nodes are more important)
    const node = this.findNodeByText(text);
    if (node) {
      score += Math.max(0, 5 - node.level) * 5;
    }
    
    return score;
  }

  private findHighlightRanges(text: string, query: string): Array<{ start: number; end: number }> {
    const ranges: Array<{ start: number; end: number }> = [];
    let startIndex = 0;
    
    while (true) {
      const index = text.indexOf(query, startIndex);
      if (index === -1) break;
      
      ranges.push({
        start: index,
        end: index + query.length
      });
      
      startIndex = index + 1;
    }
    
    return ranges;
  }

  private getNodePath(targetNode: MindmapNode): string[] {
    if (!this.rootNode) return [];

    const findPath = (node: MindmapNode, path: string[] = []): string[] | null => {
      const currentPath = [...path, node.title];
      
      if (node.id === targetNode.id) {
        return currentPath;
      }
      
      for (const child of node.children) {
        const childPath = findPath(child, currentPath);
        if (childPath) return childPath;
      }
      
      return null;
    };

    return findPath(this.rootNode) || [];
  }

  private findNodeByText(text: string): MindmapNode | null {
    if (!this.rootNode) return null;

    const traverse = (node: MindmapNode): MindmapNode | null => {
      if (node.title.toLowerCase() === text) {
        return node;
      }
      
      for (const child of node.children) {
        const found = traverse(child);
        if (found) return found;
      }
      
      return null;
    };

    return traverse(this.rootNode);
  }

  public getCurrentResults(): SearchResult[] {
    return [...this.currentResults];
  }

  public getCurrentQuery(): string {
    return this.currentQuery;
  }

  public getResultCount(): number {
    return this.currentResults.length;
  }

  public clearResults(): void {
    this.currentResults = [];
    this.currentQuery = '';
  }

  // Get suggestions for auto-complete
  public getSuggestions(prefix: string, limit: number = 5): string[] {
    if (!prefix.trim()) return [];

    const prefixLower = prefix.toLowerCase();
    const suggestions: string[] = [];
    
    for (const [key] of this.searchIndex) {
      if (key.startsWith(prefixLower) && suggestions.length < limit) {
        suggestions.push(key);
      }
    }
    
    return suggestions.sort();
  }

  // Highlight search terms in text
  public highlightText(text: string, ranges: Array<{ start: number; end: number }>): string {
    if (ranges.length === 0) return text;

    let highlightedText = '';
    let lastIndex = 0;

    // Sort ranges by start position
    const sortedRanges = ranges.sort((a, b) => a.start - b.start);

    for (const range of sortedRanges) {
      // Add text before highlight
      highlightedText += text.substring(lastIndex, range.start);
      
      // Add highlighted text
      highlightedText += `<mark class="search-highlight">${text.substring(range.start, range.end)}</mark>`;
      
      lastIndex = range.end;
    }

    // Add remaining text
    highlightedText += text.substring(lastIndex);

    return highlightedText;
  }
}
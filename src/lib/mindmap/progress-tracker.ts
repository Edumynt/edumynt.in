export interface NodeVisit {
  nodeId: string;
  timestamp: number;
  duration: number; // How long the node was focused
  expandCount: number; // How many times it was expanded/collapsed
}

export interface LearningProgress {
  lessonId: string;
  totalNodes: number;
  visitedNodes: Set<string>;
  nodeVisits: Map<string, NodeVisit>;
  sessionStart: number;
  lastActivity: number;
  completionPercentage: number;
}

export class ProgressTracker {
  private progress: LearningProgress;
  private currentFocusedNode: string | null = null;
  private focusStartTime: number = 0;
  private storageKey: string;

  constructor(lessonId: string, totalNodes: number) {
    this.storageKey = `mindmap_progress_${lessonId}`;
    this.progress = this.loadProgress() || {
      lessonId,
      totalNodes,
      visitedNodes: new Set(),
      nodeVisits: new Map(),
      sessionStart: Date.now(),
      lastActivity: Date.now(),
      completionPercentage: 0
    };
    
    // Update total nodes in case the mindmap has changed
    this.progress.totalNodes = totalNodes;
    this.updateCompletionPercentage();
  }

  private loadProgress(): LearningProgress | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return null;

      const data = JSON.parse(stored);
      
      // Convert serialized Sets and Maps back to their proper types
      return {
        ...data,
        visitedNodes: new Set(data.visitedNodes || []),
        nodeVisits: new Map(data.nodeVisits || []),
      };
    } catch (error) {
      console.warn('Failed to load progress:', error);
      return null;
    }
  }

  private saveProgress(): void {
    try {
      // Convert Sets and Maps to serializable formats
      const serializable = {
        ...this.progress,
        visitedNodes: Array.from(this.progress.visitedNodes),
        nodeVisits: Array.from(this.progress.nodeVisits.entries()),
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(serializable));
    } catch (error) {
      console.warn('Failed to save progress:', error);
    }
  }

  private updateCompletionPercentage(): void {
    this.progress.completionPercentage = this.progress.totalNodes > 0 
      ? (this.progress.visitedNodes.size / this.progress.totalNodes) * 100 
      : 0;
  }

  public visitNode(nodeId: string): void {
    const now = Date.now();
    
    // End focus on previous node if any
    if (this.currentFocusedNode && this.currentFocusedNode !== nodeId) {
      this.endNodeFocus();
    }

    // Start focusing on new node
    this.currentFocusedNode = nodeId;
    this.focusStartTime = now;

    // Mark as visited
    this.progress.visitedNodes.add(nodeId);
    this.progress.lastActivity = now;

    // Update or create visit record
    const existingVisit = this.progress.nodeVisits.get(nodeId);
    if (existingVisit) {
      existingVisit.timestamp = now;
    } else {
      this.progress.nodeVisits.set(nodeId, {
        nodeId,
        timestamp: now,
        duration: 0,
        expandCount: 0
      });
    }

    this.updateCompletionPercentage();
    this.saveProgress();
  }

  public endNodeFocus(): void {
    if (!this.currentFocusedNode || !this.focusStartTime) return;

    const visit = this.progress.nodeVisits.get(this.currentFocusedNode);
    if (visit) {
      const focusDuration = Date.now() - this.focusStartTime;
      visit.duration += focusDuration;
      this.progress.lastActivity = Date.now();
      this.saveProgress();
    }

    this.currentFocusedNode = null;
    this.focusStartTime = 0;
  }

  public trackNodeExpansion(nodeId: string): void {
    this.visitNode(nodeId); // Also counts as a visit
    
    const visit = this.progress.nodeVisits.get(nodeId);
    if (visit) {
      visit.expandCount++;
      this.saveProgress();
    }
  }

  public getVisitedNodes(): Set<string> {
    return new Set(this.progress.visitedNodes);
  }

  public isNodeVisited(nodeId: string): boolean {
    return this.progress.visitedNodes.has(nodeId);
  }

  public getNodeVisitData(nodeId: string): NodeVisit | null {
    return this.progress.nodeVisits.get(nodeId) || null;
  }

  public getCompletionPercentage(): number {
    return Math.round(this.progress.completionPercentage);
  }

  public getVisitedCount(): number {
    return this.progress.visitedNodes.size;
  }

  public getTotalNodes(): number {
    return this.progress.totalNodes;
  }

  public getSessionDuration(): number {
    return Date.now() - this.progress.sessionStart;
  }

  public getLastActivity(): number {
    return this.progress.lastActivity;
  }

  public getProgressSummary(): {
    visitedCount: number;
    totalNodes: number;
    completionPercentage: number;
    sessionDuration: number;
    mostVisitedNodes: Array<{ nodeId: string; visits: number; duration: number }>;
  } {
    // Get most visited nodes
    const nodeStats = Array.from(this.progress.nodeVisits.entries())
      .map(([nodeId, visit]) => ({
        nodeId,
        visits: visit.expandCount + 1, // +1 for initial visit
        duration: visit.duration
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    return {
      visitedCount: this.getVisitedCount(),
      totalNodes: this.getTotalNodes(),
      completionPercentage: this.getCompletionPercentage(),
      sessionDuration: this.getSessionDuration(),
      mostVisitedNodes: nodeStats
    };
  }

  public resetProgress(): void {
    this.progress = {
      lessonId: this.progress.lessonId,
      totalNodes: this.progress.totalNodes,
      visitedNodes: new Set(),
      nodeVisits: new Map(),
      sessionStart: Date.now(),
      lastActivity: Date.now(),
      completionPercentage: 0
    };
    
    this.currentFocusedNode = null;
    this.focusStartTime = 0;
    
    this.saveProgress();
  }

  public exportProgress(): string {
    const summary = this.getProgressSummary();
    const data = {
      summary,
      detailedVisits: Array.from(this.progress.nodeVisits.entries()).map(([nodeId, visit]) => ({
        nodeId,
        ...visit,
        timestamp: new Date(visit.timestamp).toISOString()
      }))
    };
    
    return JSON.stringify(data, null, 2);
  }

  // Clean up when component is destroyed
  public destroy(): void {
    this.endNodeFocus();
    this.saveProgress();
  }

  // Static method to get all lesson progress keys
  public static getAllProgressKeys(): string[] {
    const keys: string[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mindmap_progress_')) {
          keys.push(key);
        }
      }
    } catch (error) {
      console.warn('Failed to get progress keys:', error);
    }
    
    return keys;
  }

  // Static method to clear all progress
  public static clearAllProgress(): void {
    const keys = ProgressTracker.getAllProgressKeys();
    
    try {
      for (const key of keys) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('Failed to clear all progress:', error);
    }
  }
}
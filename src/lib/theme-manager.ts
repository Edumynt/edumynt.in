// Theme Management System - Shared across all pages

export class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
          document.documentElement.classList.toggle('dark', e.matches);
        }
      });
    }
  }

  toggle(event?: Event) {
    const isDark = document.documentElement.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    
    // Create animated transition if event provided
    if (event) {
      this.createThemeTransition(event, newTheme);
    }
    
    // Update theme immediately so colors can transition naturally
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: newTheme } 
    }));
  }

  getCurrentTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  setTheme(theme: 'light' | 'dark') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
    
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme } 
    }));
  }

  private createThemeTransition(event: Event, newTheme: string) {
    // Get the button position
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Get all elements that should transition
    const elements = document.querySelectorAll('*');
    const maxDistance = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
    
    // Calculate distance and delay for each element
    elements.forEach((element: Element, index) => {
      const elementRect = element.getBoundingClientRect();
      const elementCenterX = elementRect.left + elementRect.width / 2;
      const elementCenterY = elementRect.top + elementRect.height / 2;
      
      // Calculate distance from button center to element center
      const distance = Math.sqrt(
        Math.pow(elementCenterX - centerX, 2) + Math.pow(elementCenterY - centerY, 2)
      );
      
      // Calculate delay based on distance with eased curve
      const normalizedDistance = distance / maxDistance;
      const easedDelay = normalizedDistance < 0.5 
        ? 2 * normalizedDistance * normalizedDistance 
        : 1 - Math.pow(-2 * normalizedDistance + 2, 3) / 2;
      const delay = easedDelay * 1000; // Max 1000ms delay
      
      // Store original transition
      const htmlElement = element as HTMLElement;
      const originalTransition = htmlElement.style.transition;
      
      // Set custom transition with delay
      setTimeout(() => {
        htmlElement.style.transition = 'background-color 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), fill 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        // Trigger a small visual ripple effect with bounce
        if (element === button) {
          htmlElement.style.transform = 'scale(1.05)';
          htmlElement.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
          setTimeout(() => {
            htmlElement.style.transform = '';
          }, 300);
        }
        
        // Reset transition after animation
        setTimeout(() => {
          htmlElement.style.transition = originalTransition;
        }, 600);
      }, delay);
    });
  }
}

// Auto-initialize theme manager when imported
let themeManager: ThemeManager;

export function initTheme() {
  if (!themeManager) {
    themeManager = new ThemeManager();
  }
  return themeManager;
}

// Initialize immediately
export default initTheme();
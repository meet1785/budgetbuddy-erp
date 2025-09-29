/**
 * Search utility functions for highlighting and filtering results
 */

export interface SearchResult {
  type: 'budget' | 'expense' | 'transaction' | 'user' | 'category';
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  path: string;
}

/**
 * Get highlight ID from URL search params
 */
export const getHighlightId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('highlight');
};

/**
 * Check if an item should be highlighted
 */
export const shouldHighlight = (itemId: string): boolean => {
  const highlightId = getHighlightId();
  return highlightId === itemId;
};

/**
 * Get highlight classes for an element
 */
export const getHighlightClasses = (itemId: string): string => {
  return shouldHighlight(itemId) 
    ? 'bg-primary/10 border-primary/20 ring-2 ring-primary/20 animate-pulse' 
    : '';
};

/**
 * Scroll to highlighted element
 */
export const scrollToHighlighted = () => {
  if (typeof window === 'undefined') return;
  
  setTimeout(() => {
    const highlightId = getHighlightId();
    if (highlightId) {
      const element = document.getElementById(highlightId) || 
                    document.querySelector(`[data-id="${highlightId}"]`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, 500);
};

/**
 * Remove highlight from URL
 */
export const clearHighlight = () => {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  url.searchParams.delete('highlight');
  window.history.replaceState({}, '', url.toString());
};
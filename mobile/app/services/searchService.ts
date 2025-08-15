import { TKosherItem } from '../types';

export interface SearchOptions {
  searchTerm: string;
  searchFields?: (keyof TKosherItem)[];
  caseSensitive?: boolean;
}

export class SearchService {
  private static readonly DEFAULT_SEARCH_FIELDS: (keyof TKosherItem)[] = [
    'name',
    'company', 
    'kosherCertification',
    'notes'
  ];

  /**
   * Filters kosher items based on search criteria
   */
  static filterItems(
    items: TKosherItem[], 
    options: SearchOptions
  ): TKosherItem[] {
    // Safety check for items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return [];
    }

    const { 
      searchTerm, 
      searchFields = this.DEFAULT_SEARCH_FIELDS,
      caseSensitive = false 
    } = options;

    // Return all items if no search term
    if (!searchTerm || searchTerm.trim() === '') {
      return items;
    }

    const normalizedSearchTerm = caseSensitive 
      ? searchTerm.trim() 
      : searchTerm.trim().toLowerCase();

    try {
      return items.filter(item => {
        // Safety check for item
        if (!item || typeof item !== 'object') {
          return false;
        }

        return searchFields.some(field => {
          const fieldValue = item[field];
          
          // Skip null/undefined/empty fields
          if (!fieldValue || fieldValue === '') return false;
          
          try {
            const normalizedFieldValue = caseSensitive
              ? String(fieldValue)
              : String(fieldValue).toLowerCase();

            return normalizedFieldValue.includes(normalizedSearchTerm);
          } catch (error) {
            console.warn('Error processing field value:', field, fieldValue, error);
            return false;
          }
        });
      });
    } catch (error) {
      console.error('Error in filterItems:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Get search suggestions based on existing items
   */
  static getSearchSuggestions(
    items: TKosherItem[], 
    field: keyof TKosherItem = 'name',
    limit: number = 5
  ): string[] {
    const suggestions = new Set<string>();
    
    items.forEach(item => {
      const fieldValue = item[field];
      if (fieldValue) {
        // Add whole value
        suggestions.add(String(fieldValue));
        
        // Add individual words for better suggestions
        const words = String(fieldValue).split(/\s+/);
        words.forEach(word => {
          if (word.length > 2) { // Only add words longer than 2 chars
            suggestions.add(word);
          }
        });
      }
    });

    return Array.from(suggestions)
      .sort()
      .slice(0, limit);
  }

  /**
   * Highlight search term in text
   */
  static highlightSearchTerm(text: string, searchTerm: string): string {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Advanced search with multiple criteria
   */
  static advancedFilter(
    items: TKosherItem[],
    filters: {
      name?: string;
      company?: string;
      certification?: string;
      hasImage?: boolean;
      hasNotes?: boolean;
    }
  ): TKosherItem[] {
    return items.filter(item => {
      // Name filter
      if (filters.name && !item.name?.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }

      // Company filter
      if (filters.company && !item.company?.toLowerCase().includes(filters.company.toLowerCase())) {
        return false;
      }

      // Certification filter
      if (filters.certification && !item.kosherCertification?.toLowerCase().includes(filters.certification.toLowerCase())) {
        return false;
      }

      // Image filter
      if (filters.hasImage !== undefined) {
        const hasImage = Boolean(item.imgSrc && item.imgSrc !== '');
        if (filters.hasImage !== hasImage) {
          return false;
        }
      }

      // Notes filter
      if (filters.hasNotes !== undefined) {
        const hasNotes = Boolean(item.notes && item.notes.trim() !== '');
        if (filters.hasNotes !== hasNotes) {
          return false;
        }
      }

      return true;
    });
  }
}
# Search Functionality Documentation

## Overview
The BudgetBuddy ERP application now includes a comprehensive search functionality in the header that allows users to quickly find and navigate to budgets, expenses, transactions, users, and categories.

## Features

### 🔍 Universal Search
- **Location**: Header search bar (top of every page)
- **Keyboard Shortcut**: `Ctrl+K` (or `Cmd+K` on Mac)
- **Escape**: `Esc` key to close search results

### 📊 Search Categories
1. **Budgets** - Search by name or category
2. **Expenses** - Search by description, category, or vendor
3. **Transactions** - Search by description, category, or account
4. **Users** - Search by name, email, or department
5. **Categories** - Search by name or description

### 🎯 Search Results
- **Real-time results** as you type
- **Categorized results** with icons and badges
- **Limited to 10 results** for performance
- **Result details** show relevant information (amounts in ₹, categories, etc.)

### ✨ Navigation & Highlighting
- **Click to navigate** to the relevant page
- **Auto-highlighting** of the searched item on the destination page
- **Smooth scrolling** to the highlighted item
- **Visual feedback** with toast notifications

## Usage Examples

### Basic Search
1. Click on the search bar or press `Ctrl+K`
2. Type your search query (e.g., "marketing", "office supplies", "john doe")
3. Click on any result to navigate to that item

### Keyboard Navigation
- `Ctrl+K` - Focus search bar
- `Esc` - Close search results
- `Arrow keys` - Navigate through results (when implemented)
- `Enter` - Select highlighted result (when implemented)

### Search Queries Examples
- `"marketing"` - Find marketing budgets, expenses, or categories
- `"office"` - Find office-related expenses or supplies
- `"john@company.com"` - Find user by email
- `"operations"` - Find operations budget or related items

## Implementation Details

### Files Modified/Created:
- `src/components/layout/header.tsx` - Main search interface
- `src/hooks/use-search.tsx` - Custom search hook
- `src/utils/search.ts` - Search utilities and highlighting
- `src/components/data-table/DataTable.tsx` - Added row highlighting support
- `src/pages/Budgets.tsx` - Example implementation with highlighting

### Key Components:
- **useSearch Hook** - Handles search logic and state
- **Search Results Popover** - Displays formatted results
- **Highlighting System** - Visual feedback for navigation
- **DataTable Integration** - Row highlighting support

### Currency Formatting:
- All amounts displayed in ₹ (Indian Rupees)
- Consistent formatting using `formatCurrency` utility
- Proper locale formatting (`en-IN`)

## Technical Features

### Performance Optimizations:
- **Debounced search** - Prevents excessive API calls
- **Limited results** - Maximum 10 results per search
- **Efficient filtering** - Client-side search for fast results

### Accessibility:
- **Keyboard navigation** support
- **Screen reader** friendly with proper ARIA labels
- **Focus management** for better UX

### Visual Design:
- **Consistent theming** with the rest of the application
- **Icons** for different result types
- **Badges** to indicate result categories
- **Smooth animations** and transitions

## Future Enhancements

### Planned Features:
- **Recent searches** - Show recently searched items
- **Search history** - Persistent search history
- **Advanced filters** - Filter by date, amount range, status
- **Saved searches** - Save frequent search queries
- **Global keyboard shortcuts** - Navigate results with arrow keys

### Backend Integration:
- **Server-side search** - For large datasets
- **Search analytics** - Track popular searches
- **Indexed search** - Full-text search capabilities
- **Search suggestions** - Auto-complete functionality

## Troubleshooting

### Common Issues:
1. **No results showing** - Check if data is loaded in the context
2. **Highlighting not working** - Ensure the page implements the highlighting utilities
3. **Search not opening** - Check if Popover component is properly imported

### Debug Tips:
- Check browser console for any errors
- Verify that the search hook is receiving data from context
- Ensure proper URL parameters for highlighting (`?highlight=item-id`)

## Code Examples

### Using the Search Hook:
```tsx
import { useSearch } from '@/hooks/use-search';

const MyComponent = () => {
  const { searchQuery, setSearchQuery, searchResults, hasResults } = useSearch();
  
  return (
    <div>
      <input 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
      />
      {hasResults && (
        <div>
          {searchResults.map(result => (
            <div key={result.id}>{result.title}</div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Implementing Highlighting:
```tsx
import { getHighlightClasses, scrollToHighlighted } from '@/utils/search';

const MyPage = () => {
  useEffect(() => {
    scrollToHighlighted(); // Scroll to highlighted item on page load
  }, []);

  return (
    <div>
      {items.map(item => (
        <div 
          key={item.id} 
          id={item.id}
          className={getHighlightClasses(item.id)}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
};
```

## Support
For any issues or questions about the search functionality, please check the implementation files or create an issue in the project repository.
import React from 'react';
import { Search, Plus } from 'lucide-react';

export function SearchBar({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSearch,
  actionText,
  onAction,
  filterElement,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="bar">
      {filterElement}
      <div className="in">
        <Search size={17} strokeWidth={1.8} />
        <input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <button type="button" className="pb" onClick={onSearch}>
        <Search size={17} strokeWidth={1.8} />
        Search
      </button>
      {actionText && (
        <button type="button" className="pb" onClick={onAction}>
          <Plus size={17} strokeWidth={1.8} />
          {actionText}
        </button>
      )}
    </div>
  );
}

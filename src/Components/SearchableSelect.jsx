// components/SearchableSelect/SearchableSelect.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Search, ChevronDown, X, Check } from 'lucide-react';

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  loading = false,
  noOptionsMessage = "No options found",
  searchPlaceholder = "Search...",
  maxHeight = "60"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef(null);

  const filteredOptions = useMemo(() => {
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const selectedOption = options.find(opt => opt.value === value);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
    }
  }, [isOpen, searchTerm]);

  const handleSelect = (value) => {
    onChange(value);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          Math.min(prev + 1, filteredOptions.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div 
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
      ref={wrapperRef}
    >
      <div
        className={`flex items-center justify-between p-2 border rounded-md cursor-pointer ${disabled || loading ? 'bg-gray-100 text-gray-400' : 'bg-white hover:border-gray-400'} ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'}`}
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        tabIndex={disabled || loading ? -1 : 0}
      >
        <span className={`truncate flex-1 ${!selectedOption?.label ? 'text-gray-400' : ''}`}>
          {selectedOption?.label || placeholder}
        </span>
        
        {value && !disabled && !loading && (
          <button
            onClick={clearSelection}
            className="mr-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        {loading ? (
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        ) : (
          <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''} ${disabled || loading ? 'text-gray-400' : 'text-gray-500'}`} />
        )}
      </div>

      {isOpen && (
        <div className={`absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg`}>
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className={`max-h-${maxHeight} overflow-y-auto`}>
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-gray-500">{noOptionsMessage}</div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`px-4 py-2 cursor-pointer flex items-center justify-between ${highlightedIndex === index ? 'bg-blue-50' : ''} ${value === option.value ? 'bg-blue-100 font-medium' : 'hover:bg-gray-50'}`}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

SearchableSelect.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  noOptionsMessage: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  maxHeight: PropTypes.string
};

export default SearchableSelect;
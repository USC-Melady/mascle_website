import React, { useState, useRef, useEffect } from 'react';
import './CustomDropdown.css';

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the selected option's label
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputClick = () => {
    setIsOpen(true);
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`custom-dropdown ${className}`} ref={dropdownRef}>
      <div className="dropdown-input-wrapper" onClick={handleInputClick}>
        <input
          ref={inputRef}
          type="text"
          className={`form-control dropdown-input ${!value && required ? 'border-warning' : ''}`}
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          readOnly={!isOpen}
        />
        <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'} dropdown-icon`}></i>
      </div>
      
      {isOpen && (
        <div className="dropdown-menu-custom show">
          <div className="dropdown-items-container">
            {filteredOptions.length === 0 ? (
              <div className="dropdown-item-custom no-results">No results found</div>
            ) : (
              filteredOptions.map((option) => {
                const isCategory = option.value.startsWith('__category_');
                return (
                  <div
                    key={option.value}
                    className={`dropdown-item-custom ${option.value === value ? 'active' : ''} ${isCategory ? 'category-header' : ''}`}
                    onClick={() => !isCategory && handleSelect(option.value)}
                    style={{ 
                      cursor: isCategory ? 'default' : 'pointer',
                      fontWeight: isCategory ? 'bold' : 'normal',
                      color: isCategory ? '#666' : 'inherit',
                      backgroundColor: isCategory ? '#f8f9fa' : 'transparent'
                    }}
                  >
                    {option.label}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;

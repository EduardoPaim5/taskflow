import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  label: string;
  value: string;
  icon?: ReactNode;
  onClick?: () => void;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, align = 'left' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`absolute mt-2 w-48 rounded-2xl overflow-hidden z-50 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(230, 245, 255, 0.9) 100%)',
            backdropFilter: 'blur(16px)',
            border: '2px solid rgba(255, 255, 255, 0.7)',
            boxShadow: '0 8px 32px rgba(0, 100, 180, 0.15), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/50 transition-colors text-left"
              style={{ color: '#1a365d' }}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-aero flex items-center justify-between gap-2"
      >
        <span className={selectedOption ? '' : 'text-gray-400'}>
          {selectedOption?.label || placeholder || 'Selecione...'}
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: '#4a6fa5' }} />
      </button>

      {isOpen && (
        <div 
          className="absolute mt-2 w-full rounded-2xl overflow-hidden z-[100]"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(230, 245, 255, 0.95) 100%)',
            backdropFilter: 'blur(16px)',
            border: '2px solid rgba(255, 255, 255, 0.7)',
            boxShadow: '0 8px 32px rgba(0, 100, 180, 0.15), inset 0 1px 0 rgba(255,255,255,1)',
            maxHeight: '250px',
            overflowY: 'auto',
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-cyan-100/50 transition-colors font-medium ${
                option.value === value ? 'bg-cyan-100/60' : ''
              }`}
              style={{ 
                color: option.value === value ? '#0288D1' : '#1a365d',
                borderBottom: '1px solid rgba(200, 230, 255, 0.3)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// src/components/Toolbar/ResponsiveDropdown.tsx
import { type FC, useState, useRef, useEffect } from 'react';
import { MoreVertical, ChevronRight } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  element?: React.ReactNode;
  disabled?: boolean;
}

interface ResponsiveDropdownProps {
  items: DropdownItem[];
  darkMode: boolean;
  trigger?: React.ReactNode;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  mobilePosition?: 'bottom-sheet' | 'dropdown';
}

const ResponsiveDropdown: FC<ResponsiveDropdownProps> = ({
  items,
  darkMode,
  trigger,
  position = 'bottom-right',
  mobilePosition = 'bottom-sheet',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle mobile bottom sheet
  if (isMobile && mobilePosition === 'bottom-sheet') {
    return (
      <>
        <div ref={triggerRef} onClick={() => setIsOpen(true)}>
          {trigger || (
            <button
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-gray-100'
              }`}
              title="More options"
            >
              <MoreVertical size={20} />
            </button>
          )}
        </div>

        {/* Bottom Sheet Overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Bottom Sheet */}
            <div 
              ref={dropdownRef}
              className={`absolute bottom-0 left-0 right-0 max-h-[80vh] rounded-t-2xl ${
                darkMode ? 'bg-gray-900' : 'bg-white'
              } shadow-2xl transform transition-transform duration-300`}
            >
              {/* Handle */}
              <div className="flex justify-center p-3">
                <div className={`w-12 h-1 rounded-full ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-300'
                }`} />
              </div>

              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-lg font-medium ${
                  darkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  Options
                </h3>
              </div>

              {/* Menu Items */}
              <div className="overflow-y-auto max-h-[60vh]">
                {items.map((item, index) => (
                  <div key={index}>
                    {item.element ? (
                      <div className="px-6 py-3">{item.element}</div>
                    ) : (
                      <button
                        onClick={() => {
                          item.onClick?.();
                          setIsOpen(false);
                        }}
                        disabled={item.disabled}
                        className={`w-full px-6 py-4 text-left flex items-center justify-between ${
                          darkMode 
                            ? 'hover:bg-gray-800 text-gray-200 disabled:text-gray-500' 
                            : 'hover:bg-gray-50 text-gray-900 disabled:text-gray-400'
                        } transition-colors`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon && (
                            <div className={`p-1.5 rounded ${
                              darkMode ? 'bg-gray-800' : 'bg-gray-100'
                            }`}>
                              {item.icon}
                            </div>
                          )}
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <ChevronRight size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsOpen(false)}
                  className={`w-full py-3 rounded-lg text-center font-medium ${
                    darkMode 
                      ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop/Tablet dropdown
  const positionClasses = {
    'bottom-left': 'top-full left-0 mt-1',
    'bottom-right': 'top-full right-0 mt-1',
    'top-left': 'bottom-full left-0 mb-1',
    'top-right': 'bottom-full right-0 mb-1',
  };

  return (
    <div className="relative">
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <button
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-gray-800' 
                : 'hover:bg-gray-100'
            }`}
            title="More options"
          >
            <MoreVertical size={20} />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 min-w-[200px] rounded-lg shadow-lg border ${
            darkMode 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          } ${positionClasses[position]}`}
        >
          {items.map((item, index) => (
            <div key={index}>
              {item.element ? (
                <div className="px-4 py-2">{item.element}</div>
              ) : (
                <button
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  disabled={item.disabled}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 ${
                    darkMode 
                      ? 'hover:bg-gray-800 text-gray-200 disabled:text-gray-500' 
                      : 'hover:bg-gray-50 text-gray-900 disabled:text-gray-400'
                  } transition-colors ${index < items.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                >
                  {item.icon && (
                    <div className={`p-1.5 rounded ${
                      darkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      {item.icon}
                    </div>
                  )}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResponsiveDropdown;
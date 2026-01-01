// src/components/Toolbar/DarkModeToggle.tsx
import type { FC } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export interface DarkModeToggleProps {
  /** Current dark mode state */
  darkMode: boolean;
  /** Callback when dark mode is toggled */
  onToggle: () => void;
  /** Whether to show system theme option */
  allowSystemTheme?: boolean;
  /** Current theme mode */
  themeMode?: 'light' | 'dark' | 'system';
  /** Callback when theme mode is changed */
  onThemeModeChange?: (mode: 'light' | 'dark' | 'system') => void;
  /** Size of the toggle */
  size?: 'sm' | 'md' | 'lg';
  /** Show tooltip on hover */
  showTooltip?: boolean;
  /** Custom class names */
  className?: string;
  /** Accessible label */
  ariaLabel?: string;
}

const DarkModeToggle: FC<DarkModeToggleProps> = ({
  darkMode,
  onToggle,
  allowSystemTheme = false,
  themeMode = 'light',
  onThemeModeChange,
  size = 'md',
  showTooltip = true,
  className = '',
  ariaLabel = 'Toggle dark mode',
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      iconSize: 16,
      buttonSize: 'p-1.5',
      selectSize: 'text-xs',
    },
    md: {
      iconSize: 20,
      buttonSize: 'p-2',
      selectSize: 'text-sm',
    },
    lg: {
      iconSize: 24,
      buttonSize: 'p-3',
      selectSize: 'text-base',
    },
  };

  const { iconSize, buttonSize, selectSize } = sizeConfig[size];

  // Simple toggle if no system theme selection
  if (!allowSystemTheme || !onThemeModeChange) {
    return (
      <div className="relative">
        <button
          onClick={onToggle}
          className={`
            ${buttonSize}
            rounded-lg
            transition-all
            duration-300
            focus:outline-none
            focus:ring-2
            focus:ring-offset-2
            ${darkMode
              ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 focus:ring-blue-400'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 focus:ring-blue-500'
            }
            shadow-sm
            hover:shadow-md
            active:scale-95
            ${className}
          `}
          aria-label={ariaLabel}
          title={showTooltip ? (darkMode ? 'Switch to light mode' : 'Switch to dark mode') : undefined}
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            {/* Sun icon */}
            <Sun
              size={iconSize}
              className={`
                absolute
                transition-all
                duration-500
                ${darkMode
                  ? 'text-yellow-300 opacity-0 scale-0 rotate-90'
                  : 'text-yellow-500 opacity-100 scale-100 rotate-0'
                }
              `}
              strokeWidth={darkMode ? 2 : 2.5}
            />
            
            {/* Moon icon */}
            <Moon
              size={iconSize}
              className={`
                absolute
                transition-all
                duration-500
                ${darkMode
                  ? 'text-blue-300 opacity-100 scale-100 rotate-0'
                  : 'text-gray-500 opacity-0 scale-0 -rotate-90'
                }
              `}
              strokeWidth={darkMode ? 2.5 : 2}
            />
          </div>
        </button>
        
        {/* Animated glow effect */}
        <div
          className={`
            absolute
            inset-0
            rounded-lg
            transition-opacity
            duration-300
            -z-10
            blur-sm
            ${darkMode
              ? 'bg-blue-500/20 opacity-100'
              : 'bg-yellow-500/10 opacity-50'
            }
          `}
        />
      </div>
    );
  }

  // Advanced toggle with system theme option
  return (
    <div className="relative group">
      {/* Toggle button */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggle}
          className={`
            ${buttonSize}
            rounded-l-lg
            rounded-r-none
            transition-all
            duration-300
            focus:outline-none
            focus:ring-2
            focus:ring-offset-2
            ${darkMode
              ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 focus:ring-blue-400'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 focus:ring-blue-500'
            }
            shadow-sm
            hover:shadow-md
            active:scale-95
            ${className}
          `}
          aria-label={ariaLabel}
          title={showTooltip ? 'Toggle dark/light mode' : undefined}
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            {themeMode === 'system' ? (
              <Monitor
                size={iconSize}
                className={`
                  transition-colors
                  duration-300
                  ${darkMode ? 'text-gray-300' : 'text-gray-600'}
                `}
              />
            ) : darkMode ? (
              <Moon
                size={iconSize}
                className="text-blue-300"
                strokeWidth={2.5}
              />
            ) : (
              <Sun
                size={iconSize}
                className="text-yellow-500"
                strokeWidth={2.5}
              />
            )}
          </div>
        </button>
        
        {/* Theme mode dropdown */}
        <div className="relative">
          <select
            value={themeMode}
            onChange={(e) => onThemeModeChange(e.target.value as 'light' | 'dark' | 'system')}
            className={`
              ${selectSize}
              ${buttonSize}
              rounded-r-lg
              rounded-l-none
              border-l-0
              appearance-none
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              ${darkMode
                ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 focus:ring-blue-400'
                : 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200 focus:ring-blue-500'
              }
              cursor-pointer
              shadow-sm
              hover:shadow-md
              pr-8
              ${className}
            `}
            aria-label="Select theme mode"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
          
          {/* Custom dropdown arrow */}
          <div
            className={`
              absolute
              right-2
              top-1/2
              transform
              -translate-y-1/2
              pointer-events-none
              transition-colors
              duration-300
              ${darkMode ? 'text-gray-400' : 'text-gray-500'}
            `}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Tooltip for system theme */}
      {showTooltip && themeMode === 'system' && (
        <div
          className={`
            absolute
            bottom-full
            left-1/2
            transform
            -translate-x-1/2
            mb-2
            px-3
            py-1.5
            rounded-lg
            text-xs
            font-medium
            whitespace-nowrap
            opacity-0
            group-hover:opacity-100
            transition-opacity
            duration-200
            pointer-events-none
            z-50
            ${darkMode
              ? 'bg-gray-800 text-gray-200 shadow-lg'
              : 'bg-gray-900 text-gray-100 shadow-lg'
            }
          `}
        >
          Using system theme
          {/* Tooltip arrow */}
          <div
            className={`
              absolute
              top-full
              left-1/2
              transform
              -translate-x-1/2
              border-8
              border-transparent
              ${darkMode
                ? 'border-t-gray-800'
                : 'border-t-gray-900'
              }
            `}
          />
        </div>
      )}
      
      {/* Animated indicator for current mode */}
      <div
        className={`
          absolute
          -bottom-1
          left-1/2
          transform
          -translate-x-1/2
          w-8
          h-1
          rounded-full
          transition-all
          duration-500
          ${themeMode === 'system'
            ? 'w-12 bg-gradient-to-r from-blue-400 to-purple-500'
            : themeMode === 'dark'
            ? 'w-8 bg-gradient-to-r from-blue-500 to-indigo-600'
            : 'w-8 bg-gradient-to-r from-yellow-400 to-orange-500'
          }
        `}
      />
    </div>
  );
};

export default DarkModeToggle;
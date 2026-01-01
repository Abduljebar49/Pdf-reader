// src/components/Toolbar/PageControls.tsx
import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PageControlsProps {
  totalPages: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  darkMode?: boolean;
  compact?: boolean;
}

const PageControls: FC<PageControlsProps> = ({
  totalPages,
  currentPage,
  onPageChange,
  onPrevPage,
  onNextPage,
  darkMode = false,
  compact = false,
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* Previous Page Button */}
      {(onPrevPage || onPageChange) && (
        <button
          onClick={onPrevPage || (() => onPageChange?.(currentPage - 1))}
          disabled={currentPage <= 1}
          className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
            darkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-200 text-gray-600'
          }`}
          title="Previous Page"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Page Input */}
      {onPageChange && (
        <div className="flex items-center gap-2">
          {!compact && (
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Page
            </span>
          )}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (!isNaN(page) && page >= 1 && page <= totalPages) {
                  onPageChange(page);
                }
              }}
              className={`w-16 px-3 py-1.5 text-center rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              } transition-colors`}
            />
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              / {totalPages}
            </span>
          </div>
        </div>
      )}

      {/* Next Page Button */}
      {(onNextPage || onPageChange) && (
        <button
          onClick={onNextPage || (() => onPageChange?.(currentPage + 1))}
          disabled={currentPage >= totalPages}
          className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
            darkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-200 text-gray-600'
          }`}
          title="Next Page"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

export default PageControls;
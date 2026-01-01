// src/components/Toolbar.tsx
import { type FC } from "react";
import { 
  ZoomIn, ZoomOut, Maximize2,
  Sun, Moon, Grid3x3, Columns, Layout, ChevronLeft, ChevronRight 
} from "lucide-react";

interface ToolbarProps {
  onFileSelected?: (file: File) => void;
  filePathSpan?: string;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomToFit?: () => void;
  onZoomToWidth?: () => void;
  onZoomChange?: (zoom: number) => void;  
  onZoomToPage?: () => void;
  currentZoom?: number;
  onPrint?: () => void;
  onDownload?: () => void;
  onSearch?: (query: string) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  scrollMode?: 'vertical' | 'horizontal' | 'horizontal-single';
  onToggleScrollMode?: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
}

const Toolbar: FC<ToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  onZoomToWidth,
  onZoomToPage,
  currentZoom = 1,
  darkMode = false,
  onToggleDarkMode,
  totalPages = 0,
  currentPage = 1,
  onPageChange,
  scrollMode = 'vertical',
  onToggleScrollMode,
  onPrevPage,
  onNextPage,
}) => {
  const getScrollModeIcon = () => {
    switch (scrollMode) {
      case 'vertical': return <Grid3x3 size={18} />;
      case 'horizontal': return <Columns size={18} />;
      case 'horizontal-single': return <Layout size={18} />;
      default: return <Grid3x3 size={18} />;
    }
  };

  const getScrollModeText = () => {
    switch (scrollMode) {
      case 'vertical': return 'Vertical';
      case 'horizontal': return 'Horizontal';
      case 'horizontal-single': return 'Single Page';
      default: return 'Vertical';
    }
  };

  return (
    <div className={`flex flex-col ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b transition-colors duration-200`}>
      <div className="flex items-center justify-end px-4 py-2">
        <div className="flex items-center gap-4">
          {onToggleScrollMode && (
            <button
              onClick={onToggleScrollMode}
              className={`p-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors`}
              title={`Switch view mode (Current: ${getScrollModeText()})`}
            >
              {getScrollModeIcon()}
              <span className="text-sm">{getScrollModeText()}</span>
            </button>
          )}

          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
          </button>
        </div>
      </div>

      <div className={`flex items-center justify-between px-4 py-2 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {onPrevPage && onNextPage && (
              <div className="flex items-center gap-1 ml-4">
                <button
                  onClick={onPrevPage}
                  disabled={currentPage <= 1}
                  className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-300 disabled:opacity-30' : 'hover:bg-gray-200 text-gray-600 disabled:opacity-30'} transition-colors`}
                  title="Previous Page"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={onNextPage}
                  disabled={Boolean(totalPages) && currentPage >= totalPages}
                  className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-300 disabled:opacity-30' : 'hover:bg-gray-200 text-gray-600 disabled:opacity-30'} transition-colors`}
                  title="Next Page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>

          {totalPages > 0 && (
            <div className="flex items-center gap-2">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Page
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 disabled:opacity-30 text-gray-700'}`}
                >
                  ←
                </button>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (!isNaN(page) && page >= 1 && page <= totalPages) {
                      onPageChange?.(page);
                    }
                  }}
                  className={`w-16 px-3 py-1 text-center rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  / {totalPages}
                </span>
                <button
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 disabled:opacity-30 text-gray-700'}`}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onZoomOut}
              className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} transition-colors`}
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            
            <div className="flex items-center gap-1">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {Math.round(currentZoom * 100)}%
              </span>
            </div>
            
            <button
              onClick={onZoomIn}
              className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} transition-colors`}
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onZoomToFit}
              className={`px-3 py-1 text-sm rounded ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} transition-colors`}
              title="Fit to Screen"
            >
              Fit
            </button>
            <button
              onClick={onZoomToWidth}
              className={`px-3 py-1 text-sm rounded ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} transition-colors`}
              title="Fit to Width"
            >
              Fit Width
            </button>
            <button
              onClick={onZoomToPage}
              className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} transition-colors`}
              title="Actual Size"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
// src/components/Toolbar/ZoomControls.tsx
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { FC } from 'react';

interface ZoomControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomToFit?: () => void;
  onZoomToWidth?: () => void;
  onZoomToPage?: () => void;
  onZoomChange?: (zoom: number) => void;
  currentZoom?: number;
  darkMode?: boolean;
}

const ZoomControls: FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  onZoomToWidth,
  onZoomToPage,
  onZoomChange,
  currentZoom = 1,
  darkMode = false,
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onZoomOut}
          className={`p-2 rounded-lg transition-colors ${
            darkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-200 text-gray-600'
          }`}
          title="Zoom Out"
          disabled={!onZoomOut}
        >
          <ZoomOut size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          {onZoomChange ? (
            <select
              value={`${Math.round(currentZoom * 100)}%`}
              onChange={(e) => {
                const zoom = parseFloat(e.target.value) / 100;
                onZoomChange(zoom);
              }}
              className={`px-3 py-1 rounded border text-sm ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {[50, 75, 100, 125, 150, 200, 300].map((percent) => (
                <option key={percent} value={percent}>{percent}%</option>
              ))}
            </select>
          ) : (
            <span className={`text-sm px-3 py-1 rounded ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {Math.round(currentZoom * 100)}%
            </span>
          )}
        </div>
        
        <button
          onClick={onZoomIn}
          className={`p-2 rounded-lg transition-colors ${
            darkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-200 text-gray-600'
          }`}
          title="Zoom In"
          disabled={!onZoomIn}
        >
          <ZoomIn size={20} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        {onZoomToFit && (
          <button
            onClick={onZoomToFit}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-200 text-gray-600'
            }`}
            title="Fit to Screen"
          >
            Fit
          </button>
        )}
        {onZoomToWidth && (
          <button
            onClick={onZoomToWidth}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-200 text-gray-600'
            }`}
            title="Fit to Width"
          >
            Width
          </button>
        )}
        {onZoomToPage && (
          <button
            onClick={onZoomToPage}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-200 text-gray-600'
            }`}
            title="Actual Size"
          >
            <Maximize2 size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ZoomControls;
// src/components/PDFViewer/Sidebar.tsx
import { type FC, useState, useEffect } from 'react';
import { BookOpen, Image, MessageSquare, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import type pdfjsLib from '../pdfWorker';
import ThumbnailsPanel from './ThumbnailsPanel';
import OutlinePanel from './OutlinePanel';
import AnnotationsPanel from './AnnotationsPanel';

interface SidebarProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  currentPage: number;
  onPageSelect: (page: number) => void;
  darkMode: boolean;
  width?: number;
  position?: 'left' | 'right';
  showThumbnails?: boolean;
  showOutline?: boolean;
  showAnnotations?: boolean;
  onClose?: () => void;
}

type PanelType = 'thumbnails' | 'outline' | 'annotations';

const Sidebar: FC<SidebarProps> = ({
  pdfDoc,
  currentPage,
  onPageSelect,
  darkMode,
  width = 240,
  position = 'left',
  showThumbnails = true,
  showOutline = false,
  showAnnotations = false
}) => {
  const [activePanel, setActivePanel] = useState<PanelType>('thumbnails');
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  if (!pdfDoc) return null;

  const panels = [
    showThumbnails && { id: 'thumbnails' as PanelType, label: 'Pages', icon: Image },
    showOutline && { id: 'outline' as PanelType, label: 'Outline', icon: BookOpen },
    showAnnotations && { id: 'annotations' as PanelType, label: 'Comments', icon: MessageSquare },
  ].filter(Boolean);

  // Mobile overlay sidebar
  if (isMobile && collapsed) {
    return (
      <div className="md:hidden fixed left-0 top-0 bottom-0 z-40">
        <button
          onClick={() => setCollapsed(false)}
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-r-lg shadow-lg ${
            darkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' 
              : 'bg-white hover:bg-gray-100 text-gray-800'
          }`}
          title="Show sidebar"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  // Mobile expanded sidebar
  if (isMobile) {
    return (
      <div className="md:hidden fixed inset-0 z-50">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50"
          onClick={() => setCollapsed(true)}
        />
        
        {/* Sidebar */}
        <div 
          className={`absolute top-0 left-0 bottom-0 w-[85vw] max-w-[320px] ${
            darkMode ? 'bg-gray-900' : 'bg-gray-50'
          } shadow-2xl transform transition-transform duration-300`}
          style={{ transform: collapsed ? 'translateX(-100%)' : 'translateX(0)' }}
        >
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className="font-semibold">Navigation</h3>
            <button
              onClick={() => setCollapsed(true)}
              className={`p-2 rounded-lg ${
                darkMode 
                  ? 'hover:bg-gray-800 text-gray-400' 
                  : 'hover:bg-gray-200 text-gray-500'
              }`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Panel Selector */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {panels.map((panel:any) => (
              <button
                key={panel!.id}
                onClick={() => setActivePanel(panel!.id)}
                className={`flex-1 p-3 text-center text-sm font-medium transition-colors ${
                  activePanel === panel!.id
                    ? darkMode 
                      ? 'bg-gray-800 text-blue-400' 
                      : 'bg-white text-blue-600'
                    : darkMode 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {panel!.label}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="h-[calc(100vh-140px)] overflow-y-auto">
            {activePanel === 'thumbnails' && (
              <ThumbnailsPanel
                pdfDoc={pdfDoc}
                currentPage={currentPage}
                onPageSelect={(page) => {
                  onPageSelect(page);
                  setCollapsed(true); // Auto-close on mobile
                }}
                darkMode={darkMode}
                thumbnailScale={0.1}
                showPageNumbers={true}
              />
            )}
            {activePanel === 'outline' && (
              <OutlinePanel
                pdfDoc={pdfDoc}
                onPageSelect={(page) => {
                  onPageSelect(page);
                  setCollapsed(true);
                }}
                darkMode={darkMode}
              />
            )}
            {activePanel === 'annotations' && (
              <AnnotationsPanel
                pdfDoc={pdfDoc}
                darkMode={darkMode}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tablet/Desktop sidebar
  return (
    <div 
      className={`hidden md:flex h-full ${
        position === 'left' ? 'border-r' : 'border-l'
      } ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
      } transition-all duration-300 ${collapsed ? 'w-12' : ''}`}
      style={!collapsed ? { width: `${isTablet ? 200 : width}px` } : {}}
    >
      {/* Panel Selector */}
      <div className={`flex ${
        collapsed ? 'flex-col' : position === 'left' ? 'flex-col' : 'flex-col-reverse'
      } ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-2`}>
        {panels.map((panel:any) => {
          const Icon = panel!.icon;
          return (
            <button
              key={panel!.id}
              onClick={() => setActivePanel(panel!.id)}
              className={`p-3 rounded-lg transition-colors mb-1 ${
                activePanel === panel!.id
                  ? darkMode 
                    ? 'bg-gray-700 text-blue-400' 
                    : 'bg-white text-blue-600 shadow-sm'
                  : darkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                    : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
              }`}
              title={collapsed ? panel!.label : undefined}
            >
              <Icon size={20} />
            </button>
          );
        })}
        
        {/* Collapse/Expand button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-3 rounded-lg transition-colors mt-auto ${
            darkMode 
              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
              : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {position === 'left' ? (
            collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />
          ) : (
            collapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />
          )}
        </button>
      </div>

      {/* Panel Content (hidden when collapsed) */}
      {!collapsed && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className={`p-4 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activePanel === 'thumbnails' && (
              <ThumbnailsPanel
                pdfDoc={pdfDoc}
                currentPage={currentPage}
                onPageSelect={onPageSelect}
                darkMode={darkMode}
                thumbnailScale={isTablet ? 0.12 : 0.15}
                showPageNumbers={true}
              />
            )}
            {activePanel === 'outline' && (
              <OutlinePanel
                pdfDoc={pdfDoc}
                onPageSelect={onPageSelect}
                darkMode={darkMode}
              />
            )}
            {activePanel === 'annotations' && (
              <AnnotationsPanel
                pdfDoc={pdfDoc}
                darkMode={darkMode}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
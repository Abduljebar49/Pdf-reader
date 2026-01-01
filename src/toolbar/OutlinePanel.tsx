// src/components/PDFViewer/OutlinePanel.tsx
import  { type FC, useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FileText, Hash } from 'lucide-react';
import type pdfjsLib from '../pdfWorker';

interface OutlineItem {
  title: string;
  pageNumber: number;
  items?: OutlineItem[];
  expanded?: boolean;
}

interface OutlinePanelProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  onPageSelect: (page: number) => void;
  darkMode: boolean;
}

const OutlinePanel: FC<OutlinePanelProps> = ({
  pdfDoc,
  onPageSelect,
  darkMode,
}) => {
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOutline = async () => {
      try {
        const pdfOutline = await pdfDoc.getOutline();
        if (pdfOutline) {
          const parseOutline = async (items: any[]): Promise<OutlineItem[]> => {
            const parsed: OutlineItem[] = [];
            
            for (const item of items) {
              try {
                // Get the destination page number
                let pageNumber = 1;
                if (item.dest) {
                  if (Array.isArray(item.dest)) {
                    // Direct destination array
                    const dest = await pdfDoc.getDestination(item.dest);
                    if (dest && dest[0]) {
                      const page = await pdfDoc.getPageIndex(dest[0]);
                      pageNumber = page + 1;
                    }
                  } else if (typeof item.dest === 'string') {
                    // Named destination
                    const dest = await pdfDoc.getDestination(item.dest);
                    if (dest && dest[0]) {
                      const page = await pdfDoc.getPageIndex(dest[0]);
                      pageNumber = page + 1;
                    }
                  }
                }
                
                const outlineItem: OutlineItem = {
                  title: item.title || 'Untitled',
                  pageNumber,
                  expanded: false,
                };
                
                if (item.items && item.items.length > 0) {
                  outlineItem.items = await parseOutline(item.items);
                }
                
                parsed.push(outlineItem);
              } catch (error) {
                console.warn('Error parsing outline item:', error);
              }
            }
            
            return parsed;
          };
          
          const parsedOutline = await parseOutline(pdfOutline);
          setOutline(parsedOutline);
        }
      } catch (error) {
        console.error('Error loading outline:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOutline();
  }, [pdfDoc]);

  const toggleItem = (items: OutlineItem[], path: number[]): OutlineItem[] => {
    return items.map((item, index) => {
      if (path.length === 1 && path[0] === index) {
        return { ...item, expanded: !item.expanded };
      }
      if (path.length > 1 && path[0] === index && item.items) {
        return {
          ...item,
          items: toggleItem(item.items, path.slice(1))
        };
      }
      return item;
    });
  };

  const handleToggle = (path: number[]) => {
    setOutline(prev => toggleItem(prev, path));
  };

  const renderOutlineItem = (item: OutlineItem, depth: number = 0, path: number[] = []) => {
    const hasChildren = item.items && item.items.length > 0;
    
    return (
      <div key={`${item.title}-${item.pageNumber}-${depth}`}>
        <div className="flex items-center">
          {/* Indentation */}
          <div className="flex" style={{ width: `${depth * 20}px` }} />
          
          {/* Expand/collapse button */}
          {hasChildren ? (
            <button
              onClick={() => handleToggle([...path])}
              className={`p-1 mr-1 rounded hover:opacity-80 ${
                darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.expanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          ) : (
            <div className="w-6" /> 
          )}
          
          {/* Outline item */}
          <button
            onClick={() => onPageSelect(item.pageNumber)}
            className={`flex-1 text-left px-2 py-2 rounded transition-colors ${
              darkMode 
                ? 'hover:bg-gray-800 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                {hasChildren ? (
                  <FileText size={14} className="shrink-0" />
                ) : (
                  <Hash size={14} className="shrink-0" />
                )}
                <span className="text-sm truncate" title={item.title}>
                  {item.title}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                darkMode 
                  ? 'bg-gray-700 text-gray-400' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {item.pageNumber}
              </span>
            </div>
          </button>
        </div>
        
        {/* Render children if expanded */}
        {hasChildren && item.expanded && item.items && (
          <div className="ml-6">
            {item.items.map((child, childIndex) =>
              renderOutlineItem(child, depth + 1, [...path, childIndex])
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`h-full overflow-y-auto ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="p-4">
        <div className="mb-4">
          <h4 className={`text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Document Outline
          </h4>
          {outline.length === 0 && !loading && (
            <p className={`text-xs italic ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No outline available for this document
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2 ${
                darkMode ? 'border-gray-400' : 'border-gray-500'
              }`} />
              <p className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Loading outline...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {outline.map((item, index) => renderOutlineItem(item, 0, [index]))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlinePanel;
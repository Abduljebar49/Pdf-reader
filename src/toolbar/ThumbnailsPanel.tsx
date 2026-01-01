// src/components/PDFViewer/ThumbnailsPanel.tsx
import { type FC, useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import type pdfjsLib from '../pdfWorker';

interface ThumbnailsPanelProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  currentPage: number;
  onPageSelect: (page: number) => void;
  darkMode: boolean;
  thumbnailScale?: number;
  showPageNumbers?: boolean;
}

const ThumbnailsPanel: FC<ThumbnailsPanelProps> = ({
  pdfDoc,
  currentPage,
  onPageSelect,
  darkMode,
  thumbnailScale = 0.15,
  showPageNumbers = true,
}) => {
  const [thumbnails, setThumbnails] = useState<Array<{
    pageNum: number;
    dataUrl: string;
    width: number;
    height: number;
  }>>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState<Set<number>>(new Set());
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to load thumbnails lazily
  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const newVisible = new Set(visiblePages);
        entries.forEach((entry) => {
          const pageElement = entry.target as HTMLElement;
          const pageNum = parseInt(pageElement.dataset.pageNum || '0');
          
          if (entry.isIntersecting) {
            newVisible.add(pageNum);
          } else {
            newVisible.delete(pageNum);
          }
        });
        setVisiblePages(newVisible);
      },
      { root: containerRef.current, rootMargin: '200px' }
    );

    const elements = containerRef.current.querySelectorAll('[data-page-thumbnail]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [pdfDoc, visiblePages]);

  // Load thumbnail for a specific page
  const loadThumbnail = useCallback(async (pageNum: number) => {
    if (!pdfDoc || loadingThumbnails.has(pageNum)) return;

    setLoadingThumbnails(prev => new Set(prev).add(pageNum));
    
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: thumbnailScale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvas,
        canvasContext: context,
        viewport,
      }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      setThumbnails(prev => {
        const newThumbnails = [...prev];
        const existingIndex = newThumbnails.findIndex(t => t.pageNum === pageNum);
        
        if (existingIndex >= 0) {
          newThumbnails[existingIndex] = {
            pageNum,
            dataUrl,
            width: viewport.width,
            height: viewport.height,
          };
        } else {
          newThumbnails.push({
            pageNum,
            dataUrl,
            width: viewport.width,
            height: viewport.height,
          });
        }
        
        return newThumbnails.sort((a, b) => a.pageNum - b.pageNum);
      });
    } catch (error) {
      console.error('Error loading thumbnail for page', pageNum, error);
    } finally {
      setLoadingThumbnails(prev => {
        const next = new Set(prev);
        next.delete(pageNum);
        return next;
      });
    }
  }, [pdfDoc, thumbnailScale, loadingThumbnails]);

  // Load visible thumbnails
  useEffect(() => {
    visiblePages.forEach(pageNum => {
      if (!thumbnails.some(t => t.pageNum === pageNum)) {
        loadThumbnail(pageNum);
      }
    });
  }, [visiblePages, thumbnails, loadThumbnail]);

  // Pre-load first few thumbnails
  useEffect(() => {
    if (pdfDoc) {
      const pagesToPreload = Math.min(3, pdfDoc.numPages);
      for (let i = 1; i <= pagesToPreload; i++) {
        if (!thumbnails.some(t => t.pageNum === i)) {
          loadThumbnail(i);
        }
      }
    }
  }, [pdfDoc, thumbnails, loadThumbnail]);

  return (
    <div 
      ref={containerRef}
      className={`h-full overflow-y-auto ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className="p-4">
        <div className="mb-4">
          <h4 className={`text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Pages ({pdfDoc.numPages})
          </h4>
          <p className={`text-xs ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Click a thumbnail to jump to page
          </p>
        </div>

        <div className="space-y-3">
          {Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1).map((pageNum) => {
            const thumbnail = thumbnails.find(t => t.pageNum === pageNum);
            const isLoading = loadingThumbnails.has(pageNum);
            
            return (
              <button
                key={pageNum}
                data-page-thumbnail
                data-page-num={pageNum}
                onClick={() => onPageSelect(pageNum)}
                className={`w-full text-left rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  currentPage === pageNum
                    ? darkMode
                      ? 'border-blue-500 ring-2 ring-blue-500/50'
                      : 'border-blue-500 ring-2 ring-blue-300'
                    : darkMode
                    ? 'border-gray-700 hover:border-gray-600 hover:ring-1 hover:ring-gray-600'
                    : 'border-gray-300 hover:border-gray-400 hover:ring-1 hover:ring-gray-300'
                } ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                title={`Go to page ${pageNum}`}
              >
                {/* Thumbnail Container */}
                <div className="relative">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className={`w-5 h-5 animate-spin ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    </div>
                  ) : thumbnail ? (
                    <img
                      src={thumbnail.dataUrl}
                      alt={`Page ${pageNum} thumbnail`}
                      className="w-full h-auto"
                      style={{
                        aspectRatio: `${thumbnail.width} / ${thumbnail.height}`,
                      }}
                    />
                  ) : (
                    <div 
                      className="w-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
                      style={{
                        aspectRatio: '8.5 / 11', // Default A4 ratio
                      }}
                    />
                  )}
                  
                  {/* Page number overlay */}
                  {showPageNumbers && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white'
                        : darkMode
                        ? 'bg-gray-800/90 text-gray-300'
                        : 'bg-white/90 text-gray-700'
                    }`}>
                      {pageNum}
                    </div>
                  )}
                </div>
                
                {/* Current page indicator */}
                {currentPage === pageNum && (
                  <div className={`h-1 ${
                    darkMode ? 'bg-blue-500' : 'bg-blue-500'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThumbnailsPanel;
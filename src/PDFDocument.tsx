// src/components/PDFViewer/PDFDocument.tsx
import { type FC, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type pdfjsLib from './pdfWorker';


interface PDFDocumentProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  currentPage: number;
  scale: number;
  scrollMode: 'vertical' | 'horizontal' | 'horizontal-single';
  pageDimensions: Array<{ width: number; height: number }>;
  darkMode: boolean;
  onPageChange?: (page: number) => void;
  pageGap?: number;
}

const PDFDocument: FC<PDFDocumentProps> = ({
  pdfDoc,
  currentPage,
  scale,
  scrollMode,
  pageDimensions,
  darkMode,
  onPageChange,
  pageGap = 40,
}) => {
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Render a specific page
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDoc || pageNum < 1 || pageNum > pdfDoc.numPages) return;

    const canvas = canvasRefs.current[pageNum - 1];
    if (!canvas) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const context = canvas.getContext('2d');
      
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set background
      context.fillStyle = darkMode ? '#374151' : '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvas,
        canvasContext: context,
        viewport,
      }).promise;
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
    }
  }, [pdfDoc, scale, darkMode]);

  // Render current page(s) based on scroll mode
  useEffect(() => {
    if (!pdfDoc || pageDimensions.length === 0) return;

    if (scrollMode === 'horizontal-single') {
      // Render current page and neighbors for smooth transitions
      const pagesToRender = [currentPage];
      if (currentPage > 1) pagesToRender.push(currentPage - 1);
      if (currentPage < pdfDoc.numPages) pagesToRender.push(currentPage + 1);
      
      pagesToRender.forEach(pageNum => renderPage(pageNum));
    } else {
      // Render all pages (could be optimized to render only visible pages)
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        renderPage(i);
      }
    }
  }, [pdfDoc, currentPage, scale, scrollMode, pageDimensions, renderPage]);

  // Handle page navigation
  const goToPrevPage = () => {
    if (currentPage > 1) {
      onPageChange?.(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < pdfDoc.numPages) {
      onPageChange?.(currentPage + 1);
    }
  };

  // Calculate total dimensions for scroll container
  const getContainerStyle = () => {
    if (scrollMode === 'horizontal-single') {
      return {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      };
    }

    let totalWidth = 0;
    let totalHeight = 0;

    pageDimensions.forEach((dim, index) => {
      if (scrollMode === 'vertical') {
        totalHeight += dim.height * scale + (index < pageDimensions.length - 1 ? pageGap : 0);
        totalWidth = Math.max(totalWidth, dim.width * scale);
      } else {
        totalWidth += dim.width * scale + (index < pageDimensions.length - 1 ? pageGap : 0);
        totalHeight = Math.max(totalHeight, dim.height * scale);
      }
    });

    return {
      width: scrollMode === 'vertical' ? '100%' : `${totalWidth}px`,
      height: scrollMode === 'vertical' ? `${totalHeight}px` : '100%',
      display: 'flex',
      flexDirection: scrollMode === 'vertical' ? 'column' : 'row' as 'column' | 'row',
      alignItems: 'center',
      justifyContent: scrollMode === '' ? 'center' : 'flex-start',
      gap: `${pageGap}px`,
    };
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
    >
      {/* Navigation buttons for single page mode */}
      {scrollMode === 'horizontal-single' && (
        <>
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full shadow-lg transition-all disabled:opacity-30 ${
              darkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-800'
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= pdfDoc.numPages}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full shadow-lg transition-all disabled:opacity-30 ${
              darkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-800'
            }`}
            aria-label="Next page"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Scroll container */}
      <div
        ref={scrollContainerRef}
        className={`h-full w-full ${scrollMode === 'horizontal-single' ? '' : 'scroll-smooth'}`}
        style={{
          overflowX: scrollMode === 'horizontal' ? 'auto' : 'hidden',
          overflowY: scrollMode === 'vertical' ? 'auto' : 'hidden',
        }}
      >
        <div style={getContainerStyle()}>
          {scrollMode === 'horizontal-single' ? (
            // Single page view
            <div
              key={currentPage}
              className="shadow-2xl transition-all duration-300"
              style={{
                width: `${pageDimensions[currentPage - 1]?.width * scale || 800}px`,
                height: `${pageDimensions[currentPage - 1]?.height * scale || 1000}px`,
                backgroundColor: darkMode ? '#374151' : '#ffffff',
              }}
            >
              <canvas
                ref={(el) => {
                  if (el) canvasRefs.current[currentPage - 1] = el;
                }}
                className="w-full h-full"
              />
            </div>
          ) : (
            // Multi-page view
            Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={pageNum}
                className={`shadow-xl transition-all ${
                  currentPage === pageNum ? 'ring-2 ring-blue-500/50' : ''
                }`}
                style={{
                  width: `${pageDimensions[pageNum - 1]?.width * scale || 600}px`,
                  height: `${pageDimensions[pageNum - 1]?.height * scale || 800}px`,
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                }}
              >
                <canvas
                  ref={(el) => {
                    if (el) canvasRefs.current[pageNum - 1] = el;
                  }}
                  className="w-full h-full"
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Page indicator for single page mode */}
      {scrollMode === 'horizontal-single' && (
        <div
          className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 rounded-full backdrop-blur-sm ${
            darkMode
              ? 'bg-gray-800/80 text-gray-200'
              : 'bg-white/80 text-gray-800'
          } shadow-lg`}
        >
          <span className="text-sm font-medium">
            Page {currentPage} of {pdfDoc.numPages}
          </span>
        </div>
      )}
    </div>
  );
};

export default PDFDocument;
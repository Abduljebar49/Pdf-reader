// src/components/PDFViewer/PDFViewer.tsx
import { useState, useEffect, useCallback, type FC } from "react";
import PDFDocument from "./PDFDocument";
import { Loader2, Smartphone, Tablet, Monitor } from "lucide-react";
import type { ToolbarProps } from "./Toolbar";
import type { PDFViewerConfig, ScrollMode, ViewerTheme } from "./types";
import pdfjsLib from "./pdfWorker";
import { useMediaQuery } from "./hooks/useMediaQuery";
import Toolbar from "./Toolbar";
import Sidebar from "./toolbar/Sidebar";



export interface PDFViewerProps extends Partial<ToolbarProps> {
  // Core props
  pdfUrl?: string;
  file?: File;
  
  // Configuration
  config?: PDFViewerConfig;
  
  // Sidebar
  showSidebar?: boolean;
  sidebarWidth?: number;
  sidebarPosition?: 'left' | 'right';
  
  // Theme
  theme?: ViewerTheme;
  
  // Responsive
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
  
  // Callbacks
  onLoad?: (pdfDoc: pdfjsLib.PDFDocumentProxy) => void;
  onError?: (error: Error) => void;
  onPageChange?: (page: number) => void;
  onZoomChange?: (zoom: number) => void;
}

const PDFViewer: FC<PDFViewerProps> = ({
  pdfUrl,
  file,
  config = {},
  showSidebar = true,
  sidebarWidth = 240,
  sidebarPosition = 'left',
  theme = 'system',
  mobileBreakpoint = 768,
  tabletBreakpoint = 1024,
  onLoad,
  onError,
  onPageChange,
  onZoomChange,
  ...toolbarProps
}) => {
  // Merge config with defaults
  const {
    enableDarkMode = true,
    enableZoom = true,
    enablePageNavigation = true,
    enableViewModeToggle = true,
    enableFileUpload = true,
    enableSearch = true,
    enablePrint = true,
    enableDownload = true,
    defaultZoom = 1,
    minZoom = 0.25,
    maxZoom = 3,
    defaultScrollMode = 'vertical',
    showThumbnails = true,
    showOutline = false,
    showAnnotations = false,
    enableKeyboardNavigation = true
  } = config;

  // Responsive breakpoints
  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);
  const isTablet = useMediaQuery(`(min-width: ${mobileBreakpoint + 1}px) and (max-width: ${tabletBreakpoint}px)`);


  // State
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(defaultZoom);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollMode, setScrollMode] = useState<ScrollMode>(() => {
    // Auto-select appropriate scroll mode based on device
    if (isMobile) return 'vertical' as ScrollMode;
    return defaultScrollMode;
  });
  const [pageDimensions, setPageDimensions] = useState<
    Array<{ width: number; height: number }>
  >([]);
  const [fileName, setFileName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile && showSidebar);
  
  // Theme handling
  const [darkMode, setDarkMode] = useState(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Auto-close sidebar on mobile when page changes
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      // Auto-close sidebar after page change on mobile for better UX
      const timer = setTimeout(() => {
        setSidebarOpen(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentPage, isMobile, sidebarOpen]);

  // Auto-adjust scroll mode on device change
  useEffect(() => {
    if (isMobile && scrollMode !== 'vertical') {
      setScrollMode('vertical');
    }
  }, [isMobile, scrollMode]);

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfUrl && !file) return;

      try {
        setIsLoading(true);
        const source = file 
          ? { data: new Uint8Array(await file.arrayBuffer()) }
          : { url: pdfUrl };

        const loadedPdf = await pdfjsLib.getDocument({
          ...source,
          cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
          cMapPacked: true,
        }).promise;

        setPdfDoc(loadedPdf);
        setFileName(file?.name || pdfUrl?.split("/").pop() || "Document.pdf");
        
        // Calculate page dimensions
        const dimensions: Array<{ width: number; height: number }> = [];
        for (let i = 1; i <= loadedPdf.numPages; i++) {
          const page = await loadedPdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          dimensions.push({ width: viewport.width, height: viewport.height });
        }
        setPageDimensions(dimensions);

        onLoad?.(loadedPdf);
      } catch (error) {
        console.error("Error loading PDF:", error);
        onError?.(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [pdfUrl, file, onLoad, onError]);

  // Handle file upload
  const handleFileSelected = useCallback((file: File) => {
    setFileName(file.name);
    toolbarProps.onFileSelected?.(file);
  }, [toolbarProps]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  }, [onPageChange]);

  // Handle zoom
  const handleZoom = useCallback((type: "in" | "out" | "fit" | "width" | "page") => {
    const newScale = {
      'in': Math.min(scale + 0.1, maxZoom),
      'out': Math.max(scale - 0.1, minZoom),
      'fit': 1, // Calculate based on container
      'width': 1, // Calculate based on width
      'page': 1,
    }[type];

    setScale(newScale);
    onZoomChange?.(newScale);
  }, [scale, maxZoom, minZoom, onZoomChange]);

  // Toggle scroll mode
  const toggleScrollMode = useCallback(() => {
    const modes: ScrollMode[] = ["vertical", "horizontal", "horizontal-single"];
    const currentIndex = modes.indexOf(scrollMode);
    setScrollMode(modes[(currentIndex + 1) % modes.length]);
  }, [scrollMode]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardNavigation || !pdfDoc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          if (currentPage > 1) handlePageChange(currentPage - 1);
          break;
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          if (currentPage < pdfDoc.numPages) handlePageChange(currentPage + 1);
          break;
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoom('in');
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoom('out');
          }
          break;
        case 'Escape':
          if (isMobile && sidebarOpen) {
            setSidebarOpen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pdfDoc, currentPage, handlePageChange, handleZoom, enableKeyboardNavigation, isMobile, sidebarOpen]);

  const DeviceIndicator = () => {
    if (!import.meta.env.DEV) return null;
    
    return (
      <div className={`fixed top-2 left-2 z-50 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 ${
        darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700 shadow'
      }`}>
        {isMobile ? (
          <>
            <Smartphone size={12} />
            Mobile
          </>
        ) : isTablet ? (
          <>
            <Tablet size={12} />
            Tablet
          </>
        ) : (
          <>
            <Monitor size={12} />
            Desktop
          </>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`flex flex-col h-screen w-screen ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      } transition-colors duration-200 overflow-hidden`}
    >
      <DeviceIndicator />
      
      {/* Toolbar */}
      <Toolbar
        {...toolbarProps}
        onFileSelected={enableFileUpload ? handleFileSelected : undefined}
        filePathSpan={fileName}
        onZoomIn={enableZoom ? () => handleZoom('in') : undefined}
        onZoomOut={enableZoom ? () => handleZoom('out') : undefined}
        onZoomToFit={enableZoom ? () => handleZoom('fit') : undefined}
        onZoomToWidth={enableZoom ? () => handleZoom('width') : undefined}
        onZoomToPage={enableZoom ? () => handleZoom('page') : undefined}
        currentZoom={scale}
        darkMode={darkMode}
        onToggleDarkMode={enableDarkMode ? () => setDarkMode(!darkMode) : undefined}
        totalPages={pdfDoc?.numPages || 0}
        currentPage={currentPage}
        onPageChange={enablePageNavigation ? handlePageChange : undefined}
        scrollMode={scrollMode}
        onToggleScrollMode={enableViewModeToggle ? toggleScrollMode : undefined}
        onPrevPage={enablePageNavigation ? () => handlePageChange(currentPage - 1) : undefined}
        onNextPage={enablePageNavigation ? () => handlePageChange(currentPage + 1) : undefined}
        showSidebarToggle={showSidebar}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        showFileUpload={enableFileUpload}
        showZoomControls={enableZoom}
        showPageControls={enablePageNavigation}
        showViewModeToggle={enableViewModeToggle && !isMobile} // Hide on mobile
        showSearch={enableSearch && !isMobile} // Hide search on mobile
        showPrint={enablePrint && !isMobile} // Hide print on mobile
        showDownload={enableDownload && !isMobile} // Hide download on mobile
        showDarkModeToggle={enableDarkMode}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            pdfDoc={pdfDoc}
            currentPage={currentPage}
            onPageSelect={handlePageChange}
            darkMode={darkMode}
            width={isTablet ? 200 : sidebarWidth}
            position={sidebarPosition}
            showThumbnails={showThumbnails}
            showOutline={showOutline}
            showAnnotations={showAnnotations}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* PDF Document */}
        <div className="flex-1 relative overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className={`text-center p-6 rounded-2xl max-w-sm w-full ${
                darkMode ? "bg-gray-800" : "bg-white"
              } shadow-xl`}>
                <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${
                  darkMode ? "text-blue-400" : "text-blue-500"
                }`} />
                <h4 className={`text-lg font-semibold mb-2 ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}>
                  Loading PDF
                </h4>
                <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                  {isMobile ? "Opening document..." : "Please wait while we load the document..."}
                </p>
              </div>
            </div>
          ) : !pdfDoc ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className={`text-center p-8 rounded-2xl max-w-md w-full ${
                darkMode ? "bg-gray-800" : "bg-white"
              } shadow-xl`}>
                <h3 className={`text-xl font-semibold mb-3 ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}>
                  {isMobile ? "No PDF" : "No PDF Loaded"}
                </h3>
                <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {enableFileUpload 
                    ? isMobile 
                      ? "Select a PDF to view" 
                      : "Select a PDF file to begin viewing"
                    : "Load a PDF using the pdfUrl prop"
                  }
                </p>
                {enableFileUpload && (
                  <div className="space-y-3">
                    <button
                      onClick={() =>
                        document
                          .querySelector<HTMLInputElement>('input[type="file"]')
                          ?.click()
                      }
                      className="w-full px-6 py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      {isMobile ? "Browse" : "Browse PDF"}
                    </button>
                    {!isMobile && (
                      <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                        or drag and drop a PDF file
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <PDFDocument
              pdfDoc={pdfDoc}
              currentPage={currentPage}
              scale={scale}
              scrollMode={scrollMode}
              pageDimensions={pageDimensions}
              darkMode={darkMode}
              onPageChange={handlePageChange}
              pageGap={isMobile ? 20 : 40}
            />
          )}
        </div>
      </div>

      {/* Mobile Gesture Indicator */}
      {isMobile && pdfDoc && (
        <div className={`md:hidden absolute bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full ${
          darkMode 
            ? 'bg-gray-800/90 text-gray-300' 
            : 'bg-white/90 text-gray-700'
        } text-sm font-medium shadow-lg backdrop-blur-sm`}>
          <span>👆 Swipe to navigate pages</span>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
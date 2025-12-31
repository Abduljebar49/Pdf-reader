// src/components/PDFViewer.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import Toolbar from "./Toolbar";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import PageThumbnails from "./PageThumbnails";
import pdfjsLib from "./pdfWorker";

// Define scroll modes
type ScrollMode = "vertical" | "horizontal" | "horizontal-single";

interface PDFViewerProps {
  scrollMode?: ScrollMode;
  pdfUrl?: string; // Add this prop
}

const PDFViewer = ({
  scrollMode: initialScrollMode,
  pdfUrl,
}: PDFViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pagesToRender, setPagesToRender] = useState<number[]>([]);
  const [scale, setScale] = useState(1);
  const [fileName, setFileName] = useState("");
  const [pageDimensions, setPageDimensions] = useState<
    Array<{ width: number; height: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollMode, setScrollMode] = useState<ScrollMode>(
    initialScrollMode || "vertical"
  );
  // Used to temporarily disable scroll listener updates during programmatic scrolling
  const [isScrolling, setIsScrolling] = useState(false);
  // const [searchResults, setSearchResults] = useState<number[]>([]);
  const [fitMode, setFitMode] = useState<"width" | "page" | "fit">("page");

  const minZoom = 0.5;
  const maxZoom = 3.0;
  const PAGE_GAP = 40; // Standardized gap between pages

  useEffect(() => {
    if (pdfUrl) {
      loadPdfFromUrl(pdfUrl);
    }
  }, [pdfUrl]);

  const loadPdfFromUrl = async (url: string) => {
    try {
      setIsLoading(true);
      setFileName(url.split("/").pop() || "Document.pdf");
      const loadedPdf = await pdfjsLib.getDocument({
        url: url,
        cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
        cMapPacked: true,
      }).promise;

      setPdfDoc(loadedPdf);
      setPagesToRender(
        Array.from({ length: loadedPdf.numPages }, (_, i) => i + 1)
      );
      await calculateDimensions();
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading PDF from URL:", error);
      setIsLoading(false);
    }
  };

  const calculateDimensions = useCallback(async () => {
    if (!pdfDoc) return;

    const dimensions: Array<{ width: number; height: number }> = [];
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      dimensions.push({ width: viewport.width, height: viewport.height });
    }
    setPageDimensions(dimensions);
  }, [pdfDoc]);


  // Calculate scale for fit modes
  const calculateFitScale = useCallback(() => {
    const container = containerRef.current;
    const page = pageDimensions[currentPage - 1];

    if (!container || !page) return 1;

    const padding = 48; // Account for padding

    const containerWidth = Math.max(container.clientWidth - padding, 1);
    const containerHeight = Math.max(container.clientHeight - padding, 1);

    const widthScale = containerWidth / page.width;
    const heightScale = containerHeight / page.height;

    switch (fitMode) {
      case "width":
        return widthScale;
      case "fit":
        return Math.min(widthScale, heightScale);
      default:
        return 1;
    }
  }, [fitMode, pageDimensions, currentPage]);

  // Update scale when fit mode changes
  useEffect(() => {
    if (fitMode !== "page" && pdfDoc) {
      const newScale = calculateFitScale();
      setScale(Math.min(Math.max(newScale, minZoom), maxZoom));
    }
  }, [fitMode, pdfDoc, calculateFitScale]);

  // Load File
  const handleFileSelected = (file: File) => {
    setFileName(file.name);
    canvasRef.current = [];
    setIsLoading(true);
    setCurrentPage(1);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const typedArray = new Uint8Array(reader.result as ArrayBuffer);
        const loadedPdf = await pdfjsLib.getDocument({
          data: typedArray,
          cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
          cMapPacked: true,
        }).promise;

        setPdfDoc(loadedPdf);
        setPagesToRender(
          Array.from({ length: loadedPdf.numPages }, (_, i) => i + 1)
        );
        await calculateDimensions();
      } catch (error) {
        console.error("Error loading PDF:", error);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const renderPage = async (num: number, canvas: HTMLCanvasElement) => {
    if (!pdfDoc || !canvas) return;

    // Cancel any existing render task if needed (omitted for brevity, but good practice)
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale });

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvas,
      canvasContext: context,
      viewport,
    }).promise;
  };

  // Trigger Render for specific pages
  useEffect(() => {
    if (pdfDoc && pagesToRender.length > 0) {
      if (scrollMode === "horizontal-single") {
        const pages = [currentPage];
        // Pre-render neighbors for smoother transitions
        if (currentPage > 1) pages.push(currentPage - 1);
        if (currentPage < pdfDoc.numPages) pages.push(currentPage + 1);

        pages.forEach((pageNum) => {
          const index = pageNum - 1;
          const canvas = canvasRef.current[index];
          if (canvas) renderPage(pageNum, canvas);
        });
      } else {
        // In other modes, render visible pages (optimization could be added here)
        pagesToRender.forEach((pageNum, i) => {
          const canvas = canvasRef.current[i];
          if (canvas) renderPage(pageNum, canvas);
        });
      }
    }
  }, [pdfDoc, pagesToRender, scale, currentPage, scrollMode]);

  // --- FIXED SCROLL TO PAGE FUNCTION ---
  const scrollToPage = (pageNumber: number) => {
    // If single mode, just set state, no physical scroll needed (View changes via React)
    if (scrollMode === "horizontal-single") {
      setCurrentPage(pageNumber);
      return;
    }

    const container = scrollContainerRef.current; // FIX: Use scrollContainerRef
    if (!container || pageDimensions.length === 0) return;

    setIsScrolling(true); // Lock scroll listener

    let targetPosition = 0;

    if (scrollMode === "vertical") {
      // Sum height of all previous pages + gaps
      for (let i = 0; i < pageNumber - 1; i++) {
        targetPosition += pageDimensions[i].height * scale + PAGE_GAP;
      }
      container.scrollTo({
        top: targetPosition, // Removed initialPadding to align top exactly
        behavior: "smooth",
      });
    } else if (scrollMode === "horizontal") {
      // Sum width of all previous pages + gaps
      for (let i = 0; i < pageNumber - 1; i++) {
        targetPosition += pageDimensions[i].width * scale + PAGE_GAP;
      }
      container.scrollTo({
        left: targetPosition,
        behavior: "smooth",
      });
    }

    setCurrentPage(pageNumber);

    // Release lock after animation
    setTimeout(() => setIsScrolling(false), 800);
  };

  // Handle Scroll (Dual Mode)
  const handleScroll = useCallback(() => {
    if (
      !scrollContainerRef.current ||
      pageDimensions.length === 0 ||
      isScrolling || // Don't calculate if we are animating via button click
      scrollMode === "horizontal-single"
    )
      return;

    const container = scrollContainerRef.current;
    let foundPage = 1;

    if (scrollMode === "vertical") {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      let accumulatedHeight = 0;

      for (let i = 0; i < pageDimensions.length; i++) {
        const pageHeight = pageDimensions[i].height * scale;
        // Check if the middle of the viewport intersects this page
        if (scrollTop + containerHeight / 3 < accumulatedHeight + pageHeight) {
          foundPage = i + 1;
          break;
        }
        accumulatedHeight += pageHeight + PAGE_GAP;
      }
    } else {
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      let accumulatedWidth = 0;

      for (let i = 0; i < pageDimensions.length; i++) {
        const pageWidth = pageDimensions[i].width * scale;
        if (scrollLeft + containerWidth / 3 < accumulatedWidth + pageWidth) {
          foundPage = i + 1;
          break;
        }
        accumulatedWidth += pageWidth + PAGE_GAP;
      }
    }

    if (foundPage !== currentPage) {
      setCurrentPage(foundPage);
    }
  }, [pageDimensions, scale, isScrolling, currentPage, scrollMode]);

  // Bind Scroll Listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || scrollMode === "horizontal-single") return;

    // Use passive listener for better performance
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll, scrollMode]);

  // Handle Zoom
  const handleZoom = (type: "in" | "out" | "fit" | "width" | "page") => {
    if (type === "in") {
      setScale((s) => Math.min(s + 0.2, maxZoom));
      if (fitMode !== "page") setFitMode("page");
    }
    if (type === "out") {
      setScale((s) => Math.max(s - 0.2, minZoom));
      if (fitMode !== "page") setFitMode("page");
    }
    if (type === "page") {
      setScale(1);
      setFitMode("page");
    }

    if (type === "width") {
      setFitMode("width");
    }
    if (type === "fit") {
      setFitMode("fit");
    }
  };

  // Handle page navigation
  const goToPrevPage = () => {
    if (currentPage > 1) {
      scrollToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (pdfDoc && currentPage < pdfDoc.numPages) {
      scrollToPage(currentPage + 1);
    }
  };

  // Toggle scroll mode
  const toggleScrollMode = () => {
    const modes: ScrollMode[] = ["vertical", "horizontal", "horizontal-single"];
    const currentIndex = modes.indexOf(scrollMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setScrollMode(nextMode);
    // Reset to page 1 or stay on current page but re-align?
    // Usually easier to trigger a scroll to current page after mode switch:
    setTimeout(() => scrollToPage(currentPage), 100);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pdfDoc) return;

      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goToPrevPage();
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goToNextPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pdfDoc, currentPage]); // Remove dependencies that cause loops

  return (
    <div
      className={`flex flex-col h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      } transition-colors duration-200`}
    >
      <Toolbar
        onFileSelected={handleFileSelected}
        filePathSpan={fileName}
        onZoomIn={() => handleZoom("in")}
        onZoomOut={() => handleZoom("out")}
        onZoomToFit={() => handleZoom("fit")}
        onZoomToWidth={() => handleZoom("width")}
        onZoomToPage={() => handleZoom("page")}
        currentZoom={scale}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        totalPages={pdfDoc?.numPages || 0}
        currentPage={currentPage}
        onPageChange={scrollToPage}
        scrollMode={scrollMode}
        onToggleScrollMode={toggleScrollMode}
        onPrevPage={goToPrevPage}
        onNextPage={goToNextPage}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Thumbnails Sidebar */}
        <PageThumbnails
          pdfDoc={pdfDoc}
          currentPage={currentPage}
          onPageSelect={scrollToPage}
          darkMode={darkMode}
        />

        {/* Main PDF Area Wrapper */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden bg-gray-500/10"
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Loader2
                  className={`w-10 h-10 animate-spin mx-auto mb-4 ${
                    darkMode ? "text-blue-400" : "text-blue-500"
                  }`}
                />
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                  Loading PDF...
                </p>
              </div>
            </div>
          ) : !pdfDoc ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`text-center p-8 rounded-2xl ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } shadow-xl`}
              >
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    darkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  No PDF Selected
                </h3>
                <button
                  onClick={() =>
                    document
                      .querySelector<HTMLInputElement>('input[type="file"]')
                      ?.click()
                  }
                  className="px-6 py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all"
                >
                  Browse PDF
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Floating Navigation Buttons - Only for Single Page Mode generally, but kept for user preference */}
              {scrollMode === "horizontal-single" && (
                <>
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage <= 1}
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full shadow-lg transition-all ${
                      darkMode
                        ? "bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30"
                        : "bg-white hover:bg-gray-100 text-gray-800 disabled:opacity-30"
                    }`}
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <button
                    onClick={goToNextPage}
                    disabled={pdfDoc && currentPage >= pdfDoc.numPages}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full shadow-lg transition-all ${
                      darkMode
                        ? "bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30"
                        : "bg-white hover:bg-gray-100 text-gray-800 disabled:opacity-30"
                    }`}
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Fixed Scroll Container */}
              <div
                ref={scrollContainerRef}
                className={`h-full w-full scroll-smooth ${
                  scrollMode === "vertical"
                    ? "overflow-y-auto overflow-x-hidden"
                    : scrollMode === "horizontal"
                    ? "overflow-x-auto overflow-y-hidden"
                    : "overflow-hidden"
                }`}
              >
                <div
                  ref={pageContainerRef}
                  className={`flex ${
                    scrollMode === "vertical"
                      ? "flex-col items-center" // Center pages horizontally in vertical mode
                      : scrollMode === "horizontal"
                      ? "flex-row items-center" // Center pages vertically in horizontal mode
                      : "flex-row items-center justify-center"
                  } gap-10 p-6 min-h-full min-w-full`}
                  style={
                    scrollMode === "horizontal-single"
                      ? { height: "100%", width: "100%" }
                      : {}
                  }
                >
                  {scrollMode === "horizontal-single" ? (
                    // Single page view - only show current page
                    <div
                      key={currentPage}
                      className="flex h-full w-full shadow-2xl transition-all shrink-0 ring-4 ring-blue-500/50"
                      style={{
                        width: `${
                          (pageDimensions[currentPage - 1]?.width || 800) *
                          scale
                        }px`,
                        height: `${
                          (pageDimensions[currentPage - 1]?.height || 1000) *
                          scale
                        }px`,
                      }}
                    >
                      <canvas
                        ref={(el) => {
                          if (el) canvasRef.current[currentPage - 1] = el;
                        }}
                        className="w-full h-full block bg-white"
                      />
                    </div>
                  ) : (
                    // Multi-page view
                    pagesToRender.map((pageNum, i) => (
                      <div
                        key={pageNum}
                        className={`relative shadow-2xl transition-all shrink-0 ${
                          currentPage === pageNum
                            ? "ring-4 ring-blue-500/50"
                            : ""
                        }`}
                        style={{
                          width: `${
                            (pageDimensions[i]?.width || 600) * scale
                          }px`,
                          height: `${
                            (pageDimensions[i]?.height || 800) * scale
                          }px`,
                        }}
                      >
                        <canvas
                          ref={(el) => {
                            if (el) canvasRef.current[i] = el;
                          }}
                          className="w-full h-full block bg-white"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Page Indicator for Single Page Mode */}
              {scrollMode === "horizontal-single" && (
                <div
                  className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 rounded-full ${
                    darkMode
                      ? "bg-gray-800/80 text-gray-200"
                      : "bg-white/80 text-gray-800"
                  } shadow-lg backdrop-blur-sm`}
                >
                  <span className="text-sm font-medium">
                    Page {currentPage} of {pdfDoc?.numPages || 0}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;

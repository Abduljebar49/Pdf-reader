// src/components/PageThumbnails.tsx
import { type FC, useEffect, useRef } from "react";
import type pdfjsLib from "./pdfWorker";

interface PageThumbnailsProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  currentPage: number;
  onPageSelect: (page: number) => void;
  darkMode: boolean;
}

const PageThumbnails: FC<PageThumbnailsProps> = ({
  pdfDoc,
  currentPage,
  onPageSelect,
  darkMode,
}) => {
  const thumbnailRefs = useRef<HTMLCanvasElement[]>([]);

  useEffect(() => {
    if (!pdfDoc) return;

    const renderThumbnails = async () => {
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        // Smaller scale for thumbnails to improve performance
        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = thumbnailRefs.current[i - 1];

        if (!canvas) continue;

        const context = canvas.getContext("2d");
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;
      }
    };

    renderThumbnails();
  }, [pdfDoc]);

  if (!pdfDoc) return null;

  return (
    <div
      className={`w-48 overflow-y-auto flex-shrink-0 ${
        darkMode
          ? "bg-gray-900 border-r border-gray-800"
          : "bg-gray-100 border-r border-gray-200"
      }`}
    >
      <div className="p-4">
        <h3
          className={`text-sm font-semibold mb-4 ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Pages ({pdfDoc.numPages})
        </h3>
        <div className="space-y-3">
          {Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageSelect(pageNum)}
                className={`w-full text-left rounded-lg overflow-hidden border transition-all ${
                  currentPage === pageNum
                    ? darkMode
                      ? "border-blue-500 ring-2 ring-blue-500/50"
                      : "border-blue-500 ring-2 ring-blue-300"
                    : darkMode
                    ? "border-gray-700 hover:border-gray-600"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {/* Removed the Page Number text div below, kept only canvas */}
                <div className={`p-2 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                  <canvas
                    ref={(el) => {
                      if (el) thumbnailRefs.current[pageNum - 1] = el;
                    }}
                    className="w-full h-auto block"
                  />
                </div>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PageThumbnails;

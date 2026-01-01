// src/components/Toolbar/Toolbar.tsx
import { type FC } from "react";
import {
  ZoomIn,
  ZoomOut,
  Grid3x3,
  Columns,
  Layout,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Printer,
  Download,
  Menu,
  MoreVertical,
} from "lucide-react";
import { useMediaQuery } from "./hooks/useMediaQuery";
import ZoomControls from "./toolbar/ZoomControls";
import PageControls from "./toolbar/PageControls";
import ViewModeToggle from "./toolbar/ViewModeToggle";
import DarkModeToggle from "./toolbar/DarkModeToggle";
import ResponsiveDropdown from "./toolbar/ResponsiveDropdown";

export interface ToolbarProps {
  // File handling
  onFileSelected?: (file: File) => void;
  filePathSpan?: string;
  showFileUpload?: boolean;

  // Zoom controls
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomToFit?: () => void;
  onZoomToWidth?: () => void;
  onZoomToPage?: () => void;
  onZoomChange?: (zoom: number) => void;
  currentZoom?: number;
  showZoomControls?: boolean;

  // Action buttons
  onPrint?: () => void;
  onDownload?: () => void;
  onSearch?: (query: string) => void;
  showPrint?: boolean;
  showDownload?: boolean;
  showSearch?: boolean;

  // Theme
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  showDarkModeToggle?: boolean;

  // Page navigation
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  showPageControls?: boolean;

  // View modes
  scrollMode?: "vertical" | "horizontal" | "horizontal-single";
  onToggleScrollMode?: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  showViewModeToggle?: boolean;

  // Customization
  customButtons?: React.ReactNode[];
  showSidebarToggle?: boolean;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;

  // UI State
  isLoading?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
}

const Toolbar: FC<ToolbarProps> = ({
  onFileSelected,
  filePathSpan,
  showFileUpload = true,
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  onZoomToWidth,
  onZoomToPage,
  onZoomChange,
  currentZoom = 1,
  showZoomControls = true,
  onPrint,
  onDownload,
  onSearch,
  showPrint = true,
  showDownload = true,
  showSearch = true,
  darkMode = false,
  onToggleDarkMode,
  showDarkModeToggle = true,
  totalPages = 0,
  currentPage = 1,
  onPageChange,
  showPageControls = true,
  scrollMode = "vertical",
  onToggleScrollMode,
  onPrevPage,
  onNextPage,
  showViewModeToggle = true,
  customButtons = [],
  showSidebarToggle = true,
  onToggleSidebar,
  sidebarOpen = true,
  showCloseButton = false,
  onClose,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const isDesktop = !isMobile && !isTablet;

  // Determine which controls to show in overflow menu
  const getOverflowMenuItems = () => {
    const items = [];

    if (showViewModeToggle && onToggleScrollMode) {
      items.push({
        label:
          scrollMode === "vertical"
            ? "Vertical View"
            : scrollMode === "horizontal"
            ? "Horizontal View"
            : "Single Page",
        icon:
          scrollMode === "vertical" ? (
            <Grid3x3 size={16} />
          ) : scrollMode === "horizontal" ? (
            <Columns size={16} />
          ) : (
            <Layout size={16} />
          ),
        onClick: onToggleScrollMode,
      });
    }

    if (showSearch && onSearch) {
      items.push({
        label: "Search",
        icon: <Search size={16} />,
        onClick: () => onSearch(""),
      });
    }

    if (showPrint && onPrint) {
      items.push({
        label: "Print",
        icon: <Printer size={16} />,
        onClick: onPrint,
      });
    }

    if (showDownload && onDownload) {
      items.push({
        label: "Download",
        icon: <Download size={16} />,
        onClick: onDownload,
      });
    }

    if (customButtons.length > 0) {
      items.push(
        ...customButtons.map((button, index) => ({
          label: `Custom ${index + 1}`,
          element: button,
        }))
      );
    }

    return items;
  };

  const overflowItems = getOverflowMenuItems();

  return (
    <div
      className={`flex flex-col ${
        darkMode
          ? "bg-gray-900 border-gray-700 text-gray-100"
          : "bg-white border-gray-200 text-gray-800"
      } border-b transition-all duration-200 shadow-sm`}
    >
      {/* Top Bar - Main Actions */}
      <div className="flex items-center justify-between px-3 md:px-4 py-2">
        {/* Left Section - File & Sidebar Controls */}
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          {showSidebarToggle && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className={`p-2 rounded-lg transition-colors shrink-0 ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <Menu size={20} />
            </button>
          )}

          {filePathSpan && isDesktop && (
            <div
              className={`text-sm px-3 py-1 rounded truncate max-w-xs ${
                darkMode
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {filePathSpan}
            </div>
          )}

          {filePathSpan && (isMobile || isTablet) && (
            <div className="hidden sm:block">
              <div
                className={`text-sm px-3 py-1 rounded truncate max-w-[200px] ${
                  darkMode
                    ? "bg-gray-800 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {filePathSpan}
              </div>
            </div>
          )}
        </div>

        {/* Center Section - Page Controls (when no sidebar or on mobile) */}
        {((!sidebarOpen && showPageControls) ||
          (isMobile && showPageControls)) &&
          totalPages > 0 && (
            <div className="hidden md:flex flex-1 justify-center">
              <PageControls
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={onPageChange}
                darkMode={darkMode}
                compact={isMobile || isTablet}
              />
            </div>
          )}

        {/* Right Section - Utility Controls */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* Desktop: Show all controls */}
          {isDesktop && (
            <>
              {/* Custom Buttons */}
              {customButtons.map((button, index) => (
                <div key={index} className="hidden lg:block">
                  {button}
                </div>
              ))}

              {/* View Mode */}
              {showViewModeToggle && onToggleScrollMode && (
                <div className="hidden lg:block">
                  <ViewModeToggle
                    scrollMode={scrollMode}
                    onToggle={onToggleScrollMode}
                    darkMode={darkMode}
                  />
                </div>
              )}

              {/* Search */}
              {showSearch && onSearch && (
                <button
                  className={`p-2 rounded-lg transition-colors hidden lg:block ${
                    darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                  }`}
                  title="Search"
                >
                  <Search size={20} />
                </button>
              )}

              {/* Dark Mode */}
              {showDarkModeToggle && onToggleDarkMode && (
                <DarkModeToggle
                  darkMode={darkMode}
                  onToggle={onToggleDarkMode}
                  size="md"
                />
              )}

              {/* Action Buttons */}
              {showPrint && onPrint && (
                <button
                  onClick={onPrint}
                  className={`p-2 rounded-lg transition-colors hidden lg:block ${
                    darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                  }`}
                  title="Print"
                >
                  <Printer size={20} />
                </button>
              )}

              {showDownload && onDownload && (
                <button
                  onClick={onDownload}
                  className={`p-2 rounded-lg transition-colors hidden lg:block ${
                    darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                  }`}
                  title="Download"
                >
                  <Download size={20} />
                </button>
              )}
            </>
          )}

          {/* Tablet: Show condensed controls */}
          {isTablet && (
            <>
              {/* Dark Mode (always visible) */}
              {showDarkModeToggle && onToggleDarkMode && (
                <DarkModeToggle
                  darkMode={darkMode}
                  onToggle={onToggleDarkMode}
                  size="md"
                />
              )}

              {/* Overflow menu for tablet */}
              {overflowItems.length > 0 && (
                <ResponsiveDropdown
                  items={overflowItems}
                  darkMode={darkMode}
                  trigger={
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                      }`}
                      title="More options"
                    >
                      <MoreVertical size={20} />
                    </button>
                  }
                />
              )}
            </>
          )}

          {/* Mobile: Minimal controls */}
          {isMobile && (
            <>
              {/* Dark Mode (always visible) */}
              {showDarkModeToggle && onToggleDarkMode && (
                <div className="hidden sm:block">
                  <DarkModeToggle
                    darkMode={darkMode}
                    onToggle={onToggleDarkMode}
                    size="sm"
                  />
                </div>
              )}

              {/* Overflow menu for mobile */}
              {overflowItems.length > 0 && (
                <ResponsiveDropdown
                  items={overflowItems}
                  darkMode={darkMode}
                  trigger={
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                      }`}
                      title="More options"
                    >
                      <MoreVertical size={20} />
                    </button>
                  }
                  position="bottom-right"
                />
              )}
            </>
          )}

          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ml-1 ${
                darkMode
                  ? "hover:bg-gray-800 hover:text-red-400"
                  : "hover:bg-gray-100 hover:text-red-600"
              }`}
              title="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Bar - Zoom & Page Controls (Responsive Layout) */}
      {(showZoomControls || showPageControls) && (
        <div
          className={`flex items-center justify-between px-3 md:px-4 py-2 ${
            darkMode ? "bg-gray-800/50" : "bg-gray-50"
          }`}
        >
          {/* Left - Page Controls (mobile top, desktop left) */}
          {showPageControls && totalPages > 0 && (
            <div
              className={`${
                isMobile
                  ? "w-full justify-center mb-2"
                  : isTablet
                  ? "flex-1"
                  : "flex-1"
              } flex items-center`}
            >
              {isMobile ? (
                // Mobile: Full width page controls
                <div className="w-full flex flex-col items-center gap-2">
                  <PageControls
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                    onPrevPage={onPrevPage}
                    onNextPage={onNextPage}
                    darkMode={darkMode}
                    compact={true}
                    // mobile={true}
                  />
                  {filePathSpan && (
                    <div
                      className={`text-xs px-2 py-1 rounded truncate max-w-full ${
                        darkMode
                          ? "bg-gray-800 text-gray-400"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {filePathSpan}
                    </div>
                  )}
                </div>
              ) : (
                // Tablet/Desktop: Normal page controls
                <PageControls
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={onPageChange}
                  onPrevPage={onPrevPage}
                  onNextPage={onNextPage}
                  darkMode={darkMode}
                  compact={isTablet}
                />
              )}
            </div>
          )}

          {/* Center - Zoom Controls */}
          {showZoomControls && (
            <div
              className={`${
                isMobile
                  ? "w-full justify-center"
                  : isTablet
                  ? "flex-1 justify-center"
                  : "flex-1 justify-center"
              } flex items-center`}
            >
              {isMobile ? (
                // Mobile: Simplified zoom controls
                <div className="w-full flex justify-center">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={onZoomOut}
                      className={`p-2 rounded-lg ${
                        darkMode
                          ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                      }`}
                      title="Zoom Out"
                    >
                      <ZoomOut size={18} />
                    </button>
                    <span
                      className={`text-sm px-3 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {Math.round(currentZoom * 100)}%
                    </span>
                    <button
                      onClick={onZoomIn}
                      className={`p-2 rounded-lg ${
                        darkMode
                          ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                      }`}
                      title="Zoom In"
                    >
                      <ZoomIn size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                // Tablet/Desktop: Full zoom controls
                <ZoomControls
                  onZoomIn={onZoomIn}
                  onZoomOut={onZoomOut}
                  onZoomToFit={onZoomToFit}
                  onZoomToWidth={onZoomToWidth}
                  onZoomToPage={onZoomToPage}
                  onZoomChange={onZoomChange}
                  currentZoom={currentZoom}
                  darkMode={darkMode}
                  // compact={isTablet}
                />
              )}
            </div>
          )}

          {/* Right - Spacer for alignment */}
          {!isMobile && <div className="flex-1"></div>}
        </div>
      )}

      {/* Mobile Floating Action Button */}
      {isMobile && showPageControls && totalPages > 0 && (
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <div
            className={`rounded-full p-3 shadow-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={onPrevPage}
                disabled={currentPage <= 1}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-30"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-30"
                }`}
                title="Previous page"
              >
                <ChevronLeft size={20} />
              </button>
              <div
                className={`text-center min-w-[60px] px-3 py-1 rounded-full ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <span className="text-sm font-medium">
                  {currentPage}/{totalPages}
                </span>
              </div>
              <button
                onClick={onNextPage}
                disabled={currentPage >= totalPages}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-30"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-30"
                }`}
                title="Next page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;

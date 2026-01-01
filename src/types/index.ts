// src/types/index.ts
export type ScrollMode = 'vertical' | 'horizontal' | 'horizontal-single';
export type ViewerTheme = 'light' | 'dark' | 'system';

export interface PDFViewerConfig {
  // Feature toggles
  enableDarkMode?: boolean;
  enableZoom?: boolean;
  enablePageNavigation?: boolean;
  enableViewModeToggle?: boolean;
  enableFileUpload?: boolean;
  enableSearch?: boolean;
  enablePrint?: boolean;
  enableDownload?: boolean;
  
  // Display options
  defaultZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  defaultScrollMode?: ScrollMode;
  showThumbnails?: boolean;
  showOutline?: boolean;
  showAnnotations?: boolean;
  pageGap?: number;
  
  // UI/UX options
  enableKeyboardNavigation?: boolean;
  enableSmoothScrolling?: boolean;
  showPageNumbers?: boolean;
  showDocumentTitle?: boolean;
  
  // Customization
  className?: string;
  toolbarClassName?: string;
  sidebarClassName?: string;
  documentClassName?: string;
}

export interface PDFViewerProps {
  // Source
  pdfUrl?: string;
  file?: File;
  
  // Configuration
  config?: PDFViewerConfig;
  
  // Layout
  showSidebar?: boolean;
  sidebarWidth?: number;
  sidebarPosition?: 'left' | 'right';
  
  // Theme
  theme?: ViewerTheme;
  
  // Callbacks
  onLoad?: (pdfDoc: any) => void;
  onError?: (error: Error) => void;
  onPageChange?: (page: number) => void;
  onZoomChange?: (zoom: number) => void;
  onFileSelect?: (file: File) => void;
  
  // Custom components
  customToolbar?: React.ReactNode;
  customSidebar?: React.ReactNode;
  customLoadingComponent?: React.ReactNode;
  customErrorComponent?: React.ReactNode;
  customNoDocumentComponent?: React.ReactNode;
}
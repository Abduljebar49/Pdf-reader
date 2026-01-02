# React PDF Viewer Library

A modern, feature-rich PDF viewer component built with React, TypeScript, and Vite. This library provides a responsive PDF viewing experience with extensive customization options.

## ✨ Features

### 📱 **Responsive Design**
- Mobile-first approach with adaptive layouts
- Touch-friendly controls with gesture support
- Optimized for all screen sizes (mobile, tablet, desktop)
- Bottom-sheet navigation on mobile devices

### 🎨 **Customization**
- Configurable toolbar with toggle options
- Multiple view modes (vertical, horizontal, single page)
- Custom sidebar panels (thumbnails, outline, annotations)
- Theme support (light, dark, system)
- Custom CSS classes for styling

### 🔧 **Core Features**
- High-performance PDF rendering with pdf.js
- Zoom controls (in/out, fit to width, fit to page)
- Page navigation with keyboard shortcuts
- Search functionality
- Print and download support
- File upload with drag & drop
- Smooth scrolling and transitions

### 🎯 **UI/UX Enhancements**
- Smooth animations and transitions
- Loading states with skeleton screens
- Error handling with recovery options
- Accessible with ARIA labels
- Keyboard navigation support
- Touch gesture support

## 📦 Installation

```bash
npm install @abduljebar/pdf-viewer
# or
yarn add @abduljebar/pdf-viewer
```

## 🚀 Quick Start

```tsx
import { PDFViewer } from '@abduljebar/pdf-viewer';
import '@abduljebar/pdf-viewer/dist/style.css';

function App() {
  return (
    <div style={{ height: '100vh' }}>
      <PDFViewer
        pdfUrl="/document.pdf"
        config={{
          enableDarkMode: true,
          enableZoom: true,
          enablePageNavigation: true,
          defaultZoom: 1,
          defaultScrollMode: 'vertical',
          showThumbnails: true,
          showOutline: true,
        }}
        theme="system"
        onPageChange={(page) => console.log('Page:', page)}
        onZoomChange={(zoom) => console.log('Zoom:', zoom)}
      />
    </div>
  );
}
```

## 📖 Documentation

### Basic Usage

```tsx
import { PDFViewer } from '@abduljebar/pdf-viewer';

function MyPDFViewer() {
  return (
    <PDFViewer
      pdfUrl="https://example.com/document.pdf"
      config={{
        enableDarkMode: true,
        enableZoom: true,
        enablePageNavigation: true,
      }}
    />
  );
}
```

### With File Upload

```tsx
function PDFUploadViewer() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <PDFViewer
      file={file}
      config={{
        enableFileUpload: true,
      }}
      onFileSelect={(selectedFile) => {
        setFile(selectedFile);
        console.log('File selected:', selectedFile.name);
      }}
    />
  );
}
```

### Advanced Configuration

```tsx
<PDFViewer
  pdfUrl="/document.pdf"
  config={{
    // Feature toggles
    enableDarkMode: true,
    enableZoom: true,
    enablePageNavigation: true,
    enableViewModeToggle: true,
    enableFileUpload: true,
    enableSearch: true,
    enablePrint: true,
    enableDownload: true,
    
    // Display options
    defaultZoom: 1,
    minZoom: 0.25,
    maxZoom: 3,
    defaultScrollMode: 'vertical',
    showThumbnails: true,
    showOutline: true,
    showAnnotations: false,
    pageGap: 40,
    
    // UI/UX options
    enableKeyboardNavigation: true,
    enableSmoothScrolling: true,
    showPageNumbers: true,
    showDocumentTitle: true,
  }}
  
  // Layout
  showSidebar={true}
  sidebarWidth={280}
  sidebarPosition="left"
  
  // Theme
  theme="system"
  
  // Callbacks
  onLoad={(pdfDoc) => console.log('PDF loaded:', pdfDoc)}
  onError={(error) => console.error('Error:', error)}
  onPageChange={(page) => console.log('Page changed:', page)}
  onZoomChange={(zoom) => console.log('Zoom changed:', zoom)}
  
  // Custom components
  customToolbar={<MyCustomToolbar />}
  customSidebar={<MyCustomSidebar />}
  customLoadingComponent={<MyLoadingSpinner />}
/>
```

## 🏗️ Component Architecture

```
src/
├── components/
│   ├── PDFViewer/
│   │   ├── PDFViewer.tsx          # Main component
│   │   ├── Sidebar.tsx            # Responsive sidebar
│   │   ├── PDFDocument.tsx        # PDF rendering
│   │   ├── ThumbnailsPanel.tsx    # Page thumbnails
│   │   ├── OutlinePanel.tsx       # Document outline
│   │   └── AnnotationsPanel.tsx   # Comments & highlights
│   │
│   └── Toolbar/
│       ├── Toolbar.tsx            # Main toolbar
│       ├── ZoomControls.tsx       # Zoom functionality
│       ├── PageControls.tsx       # Page navigation
│       ├── ViewModeToggle.tsx     # View mode switcher
│       ├── DarkModeToggle.tsx     # Theme toggle
│       ├── FileUpload.tsx         # File upload
│       └── ResponsiveDropdown.tsx # Mobile dropdown
│
├── hooks/
│   └── useMediaQuery.ts           # Responsive hooks
│
├── types/
│   └── index.ts                   # TypeScript definitions
│
└── utils/
    └── pdfWorker.ts              # PDF.js setup
```

## 🎨 Styling

The library uses Tailwind CSS for styling. You can customize the appearance by:

1. **Overriding CSS variables:**
```css
:root {
  --pdf-primary: #2563eb;
  --pdf-secondary: #64748b;
  --pdf-background: #ffffff;
  --pdf-foreground: #1f2937;
}
```

2. **Using custom classes:**
```tsx
<PDFViewer
  className="my-custom-class"
  toolbarClassName="my-toolbar-class"
  sidebarClassName="my-sidebar-class"
  documentClassName="my-document-class"
/>
```

3. **Extending Tailwind config:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'pdf-primary': '#2563eb',
        'pdf-secondary': '#64748b',
      },
    },
  },
}
```

## 📱 Responsive Breakpoints

| Device | Breakpoint | Features |
|--------|------------|----------|
| Mobile | < 768px | Bottom navigation, simplified controls, touch gestures |
| Tablet | 768px - 1024px | Condensed toolbar, medium sidebar |
| Desktop | > 1024px | Full toolbar, full sidebar, all features |

## 🎯 Performance

- **Lazy loading**: Components load on demand
- **Virtual scrolling**: Only visible pages are rendered
- **Image optimization**: Thumbnails use appropriate resolutions
- **Memory management**: Proper cleanup of resources
- **Bundle optimization**: Code splitting for faster loads

## 🔧 Development

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd pdf-viewer-library

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Project Structure
```
.
├── src/                    # Source code
├── dist/                   # Built files
├── examples/               # Usage examples
├── tests/                  # Test files
├── docs/                   # Documentation
└── package.json
```

### Building for Distribution
```bash
# Build library
npm run build:lib

# Build documentation
npm run build:docs

# Publish to npm
npm publish
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📄 API Reference

### PDFViewer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pdfUrl` | `string` | - | URL of the PDF to load |
| `file` | `File` | - | PDF file object |
| `config` | `PDFViewerConfig` | `{}` | Configuration object |
| `theme` | `'light' | 'dark' | 'system'` | `'system'` | Theme mode |
| `showSidebar` | `boolean` | `true` | Show/hide sidebar |
| `sidebarWidth` | `number` | `240` | Sidebar width in pixels |
| `sidebarPosition` | `'left' | 'right'` | `'left'` | Sidebar position |
| `onLoad` | `function` | - | Called when PDF loads |
| `onError` | `function` | - | Called on error |
| `onPageChange` | `function` | - | Called when page changes |
| `onZoomChange` | `function` | - | Called when zoom changes |

### PDFViewerConfig

```typescript
interface PDFViewerConfig {
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
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Document new features
- Update README when necessary
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering engine
- [Lucide React](https://lucide.dev/) - Beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📞 Support

<!-- - **Documentation**: [Read the docs](https://your-library/docs) -->
- **Issues**: [GitHub Issues](https://github.com/abduljebar49/pdf-viewer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/abduljebar49/pdf-viewer/discussions)
- **Email**: abduljebar49@gmail.com

## 🚀 Roadmap

- [ ] Text selection and copying
- [ ] Annotation creation and editing
- [ ] Form filling support
- [ ] PDF/A compliance
- [ ] Multi-language support
- [ ] Plugin system
- [ ] Offline support
- [ ] Cloud storage integration

---

Made with ❤️ by Abduljebar Sani
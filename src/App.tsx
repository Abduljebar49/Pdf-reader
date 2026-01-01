import PDFViewer from "./PDFViewer";

function App() {
  return (
    <div className="h-screen">
      <PDFViewer
        pdfUrl="http://192.168.1.2:3000/uploads/1767084333334-hrrbv5srm1l.pdf"
        config={{
          enableDarkMode: true,
          enableZoom: true,
          enablePageNavigation: true,
          defaultZoom: 1,
          defaultScrollMode: "horizontal-single",
          showThumbnails: true,
          showOutline: true,
        }}
        theme="system"
        showSidebar={false}
        sidebarWidth={240}
        mobileBreakpoint={768}
        tabletBreakpoint={1024}
        onPageChange={(page) => console.log("Page changed:", page)}
        onZoomChange={(zoom) => console.log("Zoom changed:", zoom)}
      />
    </div>
  );
}

export default App;

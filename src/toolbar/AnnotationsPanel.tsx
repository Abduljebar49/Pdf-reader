// src/components/PDFViewer/AnnotationsPanel.tsx
import { type FC, useState, useEffect } from 'react';
import { MessageSquare, User, Calendar, ArrowRight, Filter } from 'lucide-react';
import type pdfjsLib from '../pdfWorker';

interface Annotation {
  id: string;
  pageNumber: number;
  type: 'text' | 'highlight' | 'strikeout' | 'underline' | 'ink' | 'stamp';
  content?: string;
  author?: string;
  date?: Date;
  color?: string;
  rect?: number[]; // [x1, y1, x2, y2]
}

interface AnnotationsPanelProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  darkMode: boolean;
  onJumpToAnnotation?: (pageNumber: number, rect?: number[]) => void;
}

const AnnotationsPanel: FC<AnnotationsPanelProps> = ({
  pdfDoc,
  darkMode,
  onJumpToAnnotation,
}) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'comments' | 'highlights'>('all');

  useEffect(() => {
    const loadAnnotations = async () => {
      try {
        const allAnnotations: Annotation[] = [];
        
        // Load annotations from all pages
        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          try {
            const page = await pdfDoc.getPage(pageNum);
            const annots = await page.getAnnotations();
            
            annots.forEach((annot: any) => {
              // Only include relevant annotation types
              if (['Text', 'Highlight', 'StrikeOut', 'Underline', 'Ink', 'Stamp'].includes(annot.subtype)) {
                const annotation: Annotation = {
                  id: `${pageNum}-${annot.id}`,
                  pageNumber: pageNum,
                  type: annot.subtype.toLowerCase() as Annotation['type'],
                  content: annot.contents || annot.title,
                  author: annot.title || annot.name || 'Unknown',
                  date: annot.modificationDate ? new Date(annot.modificationDate) : undefined,
                  color: annot.color 
                    ? `#${annot.color.map((c: number) => Math.round(c * 255).toString(16).padStart(2, '0')).join('')}`
                    : undefined,
                  rect: annot.rect,
                };
                
                allAnnotations.push(annotation);
              }
            });
          } catch (error) {
            console.warn(`Error loading annotations from page ${pageNum}:`, error);
          }
        }
        
        setAnnotations(allAnnotations);
      } catch (error) {
        console.error('Error loading annotations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnnotations();
  }, [pdfDoc]);

  const filteredAnnotations = annotations.filter(annot => {
    if (filter === 'comments') return annot.type === 'text';
    if (filter === 'highlights') return ['highlight', 'strikeout', 'underline'].includes(annot.type);
    return true;
  });

  const getAnnotationIcon = (type: Annotation['type']) => {
    switch (type) {
      case 'text':
        return <MessageSquare size={14} />;
      case 'highlight':
        return <div className="w-3 h-4 bg-yellow-400/50" />;
      case 'strikeout':
        return <div className="w-3 h-0.5 bg-red-400" />;
      case 'underline':
        return <div className="w-3 h-0.5 bg-blue-400" />;
      case 'ink':
        return <div className="w-3 h-3 rounded-full border border-gray-400" />;
      case 'stamp':
        return <div className="w-3 h-3 border border-dashed border-gray-400" />;
      default:
        return <MessageSquare size={14} />;
    }
  };

  const getAnnotationTypeLabel = (type: Annotation['type']) => {
    switch (type) {
      case 'text': return 'Comment';
      case 'highlight': return 'Highlight';
      case 'strikeout': return 'Strikeout';
      case 'underline': return 'Underline';
      case 'ink': return 'Drawing';
      case 'stamp': return 'Stamp';
      default: return 'Annotation';
    }
  };

  const handleJumpToAnnotation = (annotation: Annotation) => {
    if (onJumpToAnnotation) {
      onJumpToAnnotation(annotation.pageNumber, annotation.rect);
    }
  };

  return (
    <div className={`h-full overflow-y-auto ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className={`text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Annotations ({annotations.length})
            </h4>
            <div className="flex items-center gap-1">
              <Filter size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className={`text-xs px-2 py-1 rounded border ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-300' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <option value="all">All</option>
                <option value="comments">Comments</option>
                <option value="highlights">Highlights</option>
              </select>
            </div>
          </div>
          
          {annotations.length === 0 && !loading && (
            <p className={`text-xs italic ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No annotations found in this document
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
                Loading annotations...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAnnotations.map((annotation) => (
              <div
                key={annotation.id}
                className={`p-3 rounded-lg transition-colors cursor-pointer ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                }`}
                onClick={() => handleJumpToAnnotation(annotation)}
              >
                {/* Annotation header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      {getAnnotationIcon(annotation.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {getAnnotationTypeLabel(annotation.type)}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          darkMode 
                            ? 'bg-gray-700 text-gray-400' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          Page {annotation.pageNumber}
                        </span>
                      </div>
                      {annotation.author && (
                        <div className="flex items-center gap-1 text-xs mt-0.5">
                          <User size={10} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                            {annotation.author}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ArrowRight size={14} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                </div>

                {/* Annotation content */}
                {annotation.content && (
                  <p className={`text-sm line-clamp-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {annotation.content}
                  </p>
                )}

                {/* Annotation footer */}
                <div className="flex items-center justify-between mt-2">
                  {annotation.date && (
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar size={10} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {annotation.date.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {annotation.color && (
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: annotation.color }}
                      title={`Color: ${annotation.color}`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotationsPanel;
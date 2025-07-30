import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranscriptError {
  line: number;
  column: number;
  original: string;
  suggested: string;
  confidence: number;
  type: 'spelling' | 'grammar' | 'audio_mismatch' | 'legal_term';
}

interface TranscriptViewerProps {
  transcript: string;
  errors: TranscriptError[];
}

const getErrorColor = (type: string) => {
  switch (type) {
    case 'spelling':
      return 'bg-destructive/20 text-destructive';
    case 'grammar':
      return 'bg-warning/20 text-warning';
    case 'audio_mismatch':
      return 'bg-primary/20 text-primary';
    case 'legal_term':
      return 'bg-accent/20 text-accent-foreground';
    default:
      return 'bg-muted/20 text-muted-foreground';
  }
};

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcript,
  errors
}) => {
  const lines = transcript.split('\n');

  const renderLineWithErrors = (line: string, lineNumber: number) => {
    const lineErrors = errors.filter(error => error.line === lineNumber + 1);
    
    if (lineErrors.length === 0) {
      return <span>{line}</span>;
    }

    let renderedLine = line;
    
    // Sort errors by column position (reverse order for replacement)
    const sortedErrors = [...lineErrors].sort((a, b) => b.column - a.column);
    
    sortedErrors.forEach(error => {
      const start = error.column - 1;
      const end = start + error.original.length;
      const before = renderedLine.substring(0, start);
      const after = renderedLine.substring(end);
      
      const errorSpan = `<span class="relative inline-block ${getErrorColor(error.type)} px-1 rounded cursor-pointer group">
        ${error.original}
        <span class="absolute bottom-full left-0 bg-popover text-popover-foreground p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs whitespace-nowrap z-10">
          Suggested: "${error.suggested}" (${Math.round(error.confidence * 100)}% confidence)
        </span>
      </span>`;
      
      renderedLine = before + errorSpan + after;
    });
    
    return <span dangerouslySetInnerHTML={{ __html: renderedLine }} />;
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Transcript Preview
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {lines.length} lines
            </Badge>
            <Badge variant="outline" className="text-xs">
              {errors.length} errors found
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded border bg-background/50 p-4">
          <div className="font-mono text-sm space-y-1">
            {lines.map((line, index) => (
              <div key={index} className="flex gap-4">
                <span className="text-muted-foreground text-xs w-8 text-right">
                  {index + 1}
                </span>
                <div className="flex-1">
                  {renderLineWithErrors(line, index)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Error Legend */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="text-xs text-muted-foreground">Error Types:</div>
          <Badge className="bg-destructive/20 text-destructive text-xs">Spelling</Badge>
          <Badge className="bg-warning/20 text-warning text-xs">Grammar</Badge>
          <Badge className="bg-primary/20 text-primary text-xs">Audio Mismatch</Badge>
          <Badge className="bg-accent/20 text-accent-foreground text-xs">Legal Term</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
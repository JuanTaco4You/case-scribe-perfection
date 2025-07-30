import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Clock, Target } from 'lucide-react';

interface AnalysisError {
  line: number;
  column: number;
  original: string;
  suggested: string;
  confidence: number;
  type: 'spelling' | 'grammar' | 'audio_mismatch' | 'legal_term';
}

interface AnalysisData {
  errors: AnalysisError[];
  statistics: {
    totalErrors: number;
    confidenceScore: number;
    processingTime: number;
  };
}

interface AnalysisResultsProps {
  data: AnalysisData;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data }) => {
  const getErrorTypeIcon = (type: string) => {
    switch (type) {
      case 'spelling':
        return '📝';
      case 'grammar':
        return '📖';
      case 'audio_mismatch':
        return '🔊';
      case 'legal_term':
        return '⚖️';
      default:
        return '❓';
    }
  };

  const getErrorTypeName = (type: string) => {
    switch (type) {
      case 'spelling':
        return 'Spelling Error';
      case 'grammar':
        return 'Grammar Issue';
      case 'audio_mismatch':
        return 'Audio Mismatch';
      case 'legal_term':
        return 'Legal Terminology';
      default:
        return 'Unknown';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-success';
    if (confidence >= 0.7) return 'text-warning';
    return 'text-destructive';
  };

  const errorsByType = data.errors.reduce((acc, error) => {
    acc[error.type] = (acc[error.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{data.statistics.totalErrors}</p>
                <p className="text-xs text-muted-foreground">Errors Found</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(data.statistics.confidenceScore * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Confidence Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{data.statistics.processingTime}s</p>
                <p className="text-xs text-muted-foreground">Processing Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Breakdown */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Error Breakdown by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(errorsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getErrorTypeIcon(type)}</span>
                  <span className="font-medium">{getErrorTypeName(type)}</span>
                </div>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Error List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Detailed Error Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.errors.map((error, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{getErrorTypeIcon(error.type)}</span>
                      <Badge variant="outline" className="text-xs">
                        {getErrorTypeName(error.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Line {error.line}, Column {error.column}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Original:</span>
                        <code className="bg-destructive/20 text-destructive px-2 py-1 rounded text-sm">
                          {error.original}
                        </code>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Suggested:</span>
                        <code className="bg-success/20 text-success px-2 py-1 rounded text-sm">
                          {error.suggested}
                        </code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getConfidenceColor(error.confidence)}`}>
                        {Math.round(error.confidence * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={error.confidence * 100} 
                      className="w-16 h-2 mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
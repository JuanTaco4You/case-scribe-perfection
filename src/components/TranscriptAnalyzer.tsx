import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from './FileUpload';
import { TranscriptViewer } from './TranscriptViewer';
import { AnalysisResults } from './AnalysisResults';
import { N8NWorkflow } from './N8NWorkflow';
import { Scale, FileText, Volume2, Sparkles, Download, Workflow } from 'lucide-react';

interface AnalysisData {
  errors: Array<{
    line: number;
    column: number;
    original: string;
    suggested: string;
    confidence: number;
    type: 'spelling' | 'grammar' | 'audio_mismatch' | 'legal_term';
  }>;
  statistics: {
    totalErrors: number;
    confidenceScore: number;
    processingTime: number;
  };
}

export const TranscriptAnalyzer: React.FC = () => {
  const { toast } = useToast();
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [correctedTranscript, setCorrectedTranscript] = useState<string>('');

  const handleAnalyze = async () => {
    if (!transcriptFile || !audioFile) {
      toast({
        title: "Missing Files",
        description: "Please upload both transcript and audio files",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate analysis process with realistic steps
      const steps = [
        { name: "Reading transcript file...", duration: 1000 },
        { name: "Processing audio file...", duration: 2000 },
        { name: "Transcribing audio with AI...", duration: 3000 },
        { name: "Comparing transcripts...", duration: 2000 },
        { name: "Identifying errors...", duration: 1500 },
        { name: "Generating corrections...", duration: 2000 },
        { name: "Finalizing analysis...", duration: 500 }
      ];

      let currentProgress = 0;
      for (const [index, step] of steps.entries()) {
        toast({
          title: "Processing",
          description: step.name,
          duration: step.duration,
        });
        
        await new Promise(resolve => setTimeout(resolve, step.duration));
        currentProgress = ((index + 1) / steps.length) * 100;
        setProgress(currentProgress);
      }

      // Mock analysis results
      const mockAnalysis: AnalysisData = {
        errors: [
          {
            line: 15,
            column: 23,
            original: "councelor",
            suggested: "counselor",
            confidence: 0.95,
            type: "spelling"
          },
          {
            line: 42,
            column: 18,
            original: "their",
            suggested: "there",
            confidence: 0.87,
            type: "audio_mismatch"
          },
          {
            line: 67,
            column: 8,
            original: "subpeona",
            suggested: "subpoena",
            confidence: 0.98,
            type: "legal_term"
          }
        ],
        statistics: {
          totalErrors: 3,
          confidenceScore: 0.93,
          processingTime: 12.5
        }
      };

      setAnalysisData(mockAnalysis);
      setCorrectedTranscript("Mock corrected transcript content...");

      toast({
        title: "Analysis Complete",
        description: `Found ${mockAnalysis.errors.length} potential errors with ${Math.round(mockAnalysis.statistics.confidenceScore * 100)}% confidence`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "An error occurred during transcript analysis",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!correctedTranscript) return;
    
    const blob = new Blob([correctedTranscript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corrected_transcript_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">
              Court Transcript Analyzer
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered transcript analysis and correction for legal professionals. 
            Upload your caseCatalyst files for automated error detection and correction.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Upload Files
              </TabsTrigger>
              <TabsTrigger value="analyze" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2" disabled={!analysisData}>
                <Download className="h-4 w-4" />
                Results
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                N8N Workflow
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Transcript File
                    </CardTitle>
                    <CardDescription>
                      Upload your caseCatalyst transcript file (.txt, .rtf, or .doc)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      file={transcriptFile}
                      onFileSelect={setTranscriptFile}
                      accept=".txt,.rtf,.doc,.docx"
                      label="Drop transcript file here or click to browse"
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-primary" />
                      Audio File
                    </CardTitle>
                    <CardDescription>
                      Upload the corresponding audio recording (.wav, .mp3, or .m4a)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      file={audioFile}
                      onFileSelect={setAudioFile}
                      accept=".wav,.mp3,.m4a,.aac"
                      label="Drop audio file here or click to browse"
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleAnalyze}
                  disabled={!transcriptFile || !audioFile || isProcessing}
                  variant="professional"
                  size="xl"
                  className="min-w-[200px]"
                >
                  {isProcessing ? "Analyzing..." : "Start Analysis"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="analyze" className="space-y-6">
              {isProcessing ? (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Analysis in Progress</CardTitle>
                    <CardDescription>
                      AI is analyzing your transcript and audio files...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">
                      {Math.round(progress)}% Complete
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Ready to Analyze</CardTitle>
                    <CardDescription>
                      Upload your files in the Upload tab to begin analysis
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {analysisData && (
                <>
                  <AnalysisResults data={analysisData} />
                  <div className="flex justify-center gap-4">
                    <Button onClick={handleDownload} variant="accent" size="lg">
                      <Download className="h-4 w-4 mr-2" />
                      Download Corrected Transcript
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="workflow" className="space-y-6">
              <N8NWorkflow />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
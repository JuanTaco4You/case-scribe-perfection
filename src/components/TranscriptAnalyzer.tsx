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
  const [downloads, setDownloads] = useState<{
    txt: { b64: string; name: string; mime: string };
    docx: { b64: string; name: string; mime: string };
  } | null>(null);

  const downloadBase64 = (b64: string, filename: string, mime: string) => {
    const bytes = atob(b64);
    const buf = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
    const blob = new Blob([buf], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

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
      if (!transcriptFile || !audioFile) return; // Should not happen due to button disable logic, but good for type safety
      const formData = new FormData();
      formData.append('transcript', transcriptFile);
      formData.append('audio', audioFile);

      // Simulate progress while uploading and processing
      setProgress(10);
      toast({ title: "Uploading files...", duration: 2000 });
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      setProgress(50);
      toast({ title: "Analyzing transcript...", description: "This may take a moment.", duration: 4000 });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setProgress(100);

      setAnalysisData(data.analysis);
      setCorrectedTranscript(data.correctedTranscript);
      setDownloads({
        txt: { b64: data.downloads.txt_base64, name: data.downloads.filenames.txt, mime: 'text/plain' },
        docx: { b64: data.downloads.docx_base64, name: data.downloads.filenames.docx, mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      });

      toast({
        title: "Analysis Complete",
        description: `Found ${data.analysis.errors.length} potential errors with ${Math.round(data.analysis.statistics.confidenceScore * 100)}% confidence`,
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
                    <Button
                      onClick={() => downloads && downloadBase64(downloads.txt.b64, downloads.txt.name, downloads.txt.mime)}
                      variant="accent"
                      size="lg"
                      disabled={!downloads}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download .txt
                    </Button>
                    <Button
                      onClick={() => downloads && downloadBase64(downloads.docx.b64, downloads.docx.name, downloads.docx.mime)}
                      variant="accent"
                      size="lg"
                      disabled={!downloads}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download .docx
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
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, Play, Settings, Workflow } from 'lucide-react';

export const N8NWorkflow: React.FC = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [autoDownload, setAutoDownload] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState('');

  const workflowJson = {
    name: 'Court Transcript Analysis Workflow',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'transcript-analysis',
          responseMode: 'onReceived',
          options: {}
        },
        id: '1',
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [240, 300]
      },
      {
        parameters: {
          url: 'https://api.openai.com/v1/audio/transcriptions',
          authentication: 'headerAuth',
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: 'Authorization',
                value: 'Bearer {{ $env.OPENAI_API_KEY }}'
              }
            ]
          },
          sendBody: true,
          bodyParameters: {
            parameters: [
              {
                name: 'file',
                value: '={{ $json.audioFile }}'
              },
              {
                name: 'model',
                value: 'whisper-1'
              }
            ]
          }
        },
        id: '2',
        name: 'Audio Transcription',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 3,
        position: [460, 300]
      },
      {
        parameters: {
          mode: 'combine',
          combineBy: 'mergeByIndex',
          options: {}
        },
        id: '3',
        name: 'Merge',
        type: 'n8n-nodes-base.merge',
        typeVersion: 2,
        position: [680, 300]
      },
      {
        parameters: {
          url: 'https://api.openai.com/v1/chat/completions',
          authentication: 'headerAuth',
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: 'Authorization',
                value: 'Bearer {{ $env.OPENAI_API_KEY }}'
              }
            ]
          },
          sendBody: true,
          bodyParameters: {
            parameters: [
              {
                name: 'model',
                value: 'gpt-4'
              },
              {
                name: 'messages',
                value: '=[{"role": "system", "content": "You are a legal transcript correction AI. Compare the original transcript with the audio transcription and identify errors, then provide a corrected version with high accuracy for court use."}, {"role": "user", "content": "Original transcript: {{ $json.originalTranscript }}\\n\\nAudio transcription: {{ $json.audioTranscription }}\\n\\nPlease identify errors and provide corrections."}]'
              }
            ]
          }
        },
        id: '4',
        name: 'AI Correction',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 3,
        position: [900, 300]
      },
      {
        parameters: {
          operation: 'sendEmail',
          fromEmail: 'noreply@courttranscripts.ai',
          toEmail: '={{ $json.notificationEmail }}',
          subject: 'Transcript Analysis Complete',
          emailFormat: 'html',
          message: '=<h2>Court Transcript Analysis Complete</h2><p>Your transcript has been analyzed and corrected. The results are attached to this email.</p><p><strong>Analysis Summary:</strong></p><ul><li>Total errors found: {{ $json.errorCount }}</li><li>Confidence score: {{ $json.confidenceScore }}%</li></ul>'
        },
        id: '5',
        name: 'Send Notification',
        type: 'n8n-nodes-base.emailSend',
        typeVersion: 2,
        position: [1120, 300]
      }
    ],
    connections: {
      'Webhook': {
        main: [
          [
            {
              node: 'Audio Transcription',
              type: 'main',
              index: 0
            }
          ]
        ]
      },
      'Audio Transcription': {
        main: [
          [
            {
              node: 'Merge',
              type: 'main',
              index: 0
            }
          ]
        ]
      },
      'Merge': {
        main: [
          [
            {
              node: 'AI Correction',
              type: 'main',
              index: 0
            }
          ]
        ]
      },
      'AI Correction': {
        main: [
          [
            {
              node: 'Send Notification',
              type: 'main',
              index: 0
            }
          ]
        ]
      }
    }
  };

  const copyWorkflow = () => {
    navigator.clipboard.writeText(JSON.stringify(workflowJson, null, 2));
    toast({
      title: "Copied to clipboard",
      description: "N8N workflow JSON has been copied to your clipboard",
    });
  };

  const downloadWorkflow = () => {
    const blob = new Blob([JSON.stringify(workflowJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'court-transcript-analysis-workflow.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const testWorkflow = () => {
    if (!webhookUrl) {
      toast({
        title: "Missing webhook URL",
        description: "Please enter your N8N webhook URL to test the workflow",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Test workflow",
      description: "This would send a test request to your N8N webhook",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Workflow className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">
              N8N Automation Workflow
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automate your court transcript analysis with this N8N workflow. 
            Process files automatically and receive notifications when complete.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Workflow Overview */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Workflow Overview
              </CardTitle>
              <CardDescription>
                This automated workflow processes court transcripts and audio files using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-sm">Webhook</h3>
                  <p className="text-xs text-muted-foreground">Receives files</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-sm">Audio AI</h3>
                  <p className="text-xs text-muted-foreground">Transcribes audio</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-sm">Merge Data</h3>
                  <p className="text-xs text-muted-foreground">Combines inputs</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <h3 className="font-semibold text-sm">AI Analysis</h3>
                  <p className="text-xs text-muted-foreground">Finds errors</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">5</span>
                  </div>
                  <h3 className="font-semibold text-sm">Notification</h3>
                  <p className="text-xs text-muted-foreground">Sends results</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Configuration */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Workflow Configuration</CardTitle>
              <CardDescription>
                Set up your N8N workflow with these parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">N8N Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-n8n-instance.com/webhook/transcript-analysis"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input
                  id="notification-email"
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="lawyer@lawfirm.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-download"
                  checked={autoDownload}
                  onCheckedChange={setAutoDownload}
                />
                <Label htmlFor="auto-download">Auto-download corrected transcripts</Label>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Required Environment Variables</CardTitle>
              <CardDescription>
                Set these in your N8N instance for the workflow to function
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <code className="text-sm font-mono">OPENAI_API_KEY</code>
                    <p className="text-xs text-muted-foreground">OpenAI API key for GPT-4 and Whisper</p>
                  </div>
                  <Badge variant="outline">Required</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <code className="text-sm font-mono">SMTP_HOST</code>
                    <p className="text-xs text-muted-foreground">Email server for notifications</p>
                  </div>
                  <Badge variant="outline">Optional</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow JSON */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Workflow JSON</CardTitle>
              <CardDescription>
                Import this JSON into your N8N instance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={JSON.stringify(workflowJson, null, 2)}
                  readOnly
                  className="h-40 font-mono text-xs"
                />
                <div className="flex gap-2">
                  <Button onClick={copyWorkflow} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy JSON
                  </Button>
                  <Button onClick={downloadWorkflow} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON
                  </Button>
                  <Button onClick={testWorkflow} variant="professional" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Test Workflow
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Copy the workflow JSON above</li>
                <li>Open your N8N instance and create a new workflow</li>
                <li>Paste the JSON to import the workflow</li>
                <li>Set the required environment variables</li>
                <li>Activate the webhook node</li>
                <li>Configure email settings for notifications</li>
                <li>Test the workflow with sample files</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
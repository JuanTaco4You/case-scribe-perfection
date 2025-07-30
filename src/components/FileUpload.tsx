import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  accept: string;
  label: string;
  maxSize?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  file,
  onFileSelect,
  accept,
  label,
  maxSize = 100 * 1024 * 1024 // 100MB default
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, ext) => {
      acc[`application/${ext.replace('.', '')}`] = [ext];
      acc[`audio/${ext.replace('.', '')}`] = [ext];
      acc[`text/${ext.replace('.', '')}`] = [ext];
      return acc;
    }, {} as any),
    maxSize,
    multiple: false
  });

  const removeFile = () => {
    onFileSelect(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
            isDragActive
              ? "border-accent bg-accent/10"
              : "border-border hover:border-accent hover:bg-accent/5"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive ? "Drop the file here..." : label}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Max file size: {formatFileSize(maxSize)}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-secondary/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <Button
              onClick={removeFile}
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive/80"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {fileRejections.length > 0 && (
        <div className="text-sm text-destructive">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name}>
              {errors.map(error => (
                <p key={error.code}>{error.message}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
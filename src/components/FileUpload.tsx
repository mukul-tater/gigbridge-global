import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Upload, FileText, Image, X, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  storage_key: string;
}

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function FileUpload({
  accept = "image/*,application/pdf",
  multiple = false,
  maxSize = 10,
  onUploadComplete,
  onUploadError,
  disabled = false,
  className = ""
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File ${file.name} exceeds ${maxSize}MB limit`;
    }

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const isValidType = allowedTypes.some(type => {
      if (type === 'image/*') {
        return file.type.startsWith('image/');
      }
      if (type === 'application/pdf') {
        return file.type === 'application/pdf';
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `File ${file.name} has invalid type. Allowed types: ${accept}`;
    }

    return null;
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        toast({
          title: 'Invalid file',
          description: validationError,
          variant: 'destructive',
        });
        return;
      }
      validFiles.push(file);
    }

    if (!multiple && validFiles.length > 1) {
      toast({
        title: 'Multiple files not allowed',
        description: 'Please select only one file',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFiles(validFiles);
    setUploadError(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select files to upload',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      // Create FormData
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 100);

      // Upload to our edge function
      const response = await supabase.functions.invoke('upload', {
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.error) {
        throw new Error(response.error.message || 'Upload failed');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Upload failed');
      }

      const uploadedFiles = response.data.files as UploadedFile[];
      
      toast({
        title: 'Upload successful',
        description: `${uploadedFiles.length} file(s) uploaded successfully`,
      });

      // Clear selected files
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call success callback
      onUploadComplete?.(uploadedFiles);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      onUploadError?.(errorMessage);
      
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const retry = () => {
    setUploadError(null);
    handleUpload();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Selection Area */}
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          {accept === "image/*,application/pdf" ? "Images and PDF files" : accept} (Max {maxSize}MB)
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelection}
          disabled={isUploading || disabled}
          className="w-full cursor-pointer"
        />
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Selected Files:</h4>
          {selectedFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center space-x-3 p-3 bg-secondary rounded-lg">
              {file.type.startsWith('image/') ? (
                <Image className="w-6 h-6 text-primary" />
              ) : (
                <FileText className="w-6 h-6 text-red-500" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={isUploading}
                className="p-1 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {/* Upload Button */}
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || disabled || selectedFiles.length === 0}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-center text-muted-foreground">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {uploadError}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={retry}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Upload
          </Button>
        </div>
      )}
    </div>
  );
}
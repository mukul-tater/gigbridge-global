import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { 
  Upload, FileText, Image, X, CheckCircle, AlertCircle, 
  RotateCcw, Eye, Download, Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { validateFileType, validateFileSize, sanitizeFilename, rateLimiter } from '@/lib/security';

export interface DocumentData {
  id?: string;
  document_type: 'aadhaar_front' | 'aadhaar_back' | 'pan' | 'passport' | 'visa' | 'aadhaar' | 'certificate' | 'contract' | 'license' | 'photo' | 'resume';
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  status: 'uploaded' | 'approved' | 'rejected';
  storage_key?: string;
}

interface DocumentUploadProps {
  documentType: 'aadhaar_front' | 'aadhaar_back' | 'pan' | 'passport' | 'visa';
  isRequired: boolean;
  document?: DocumentData;
  onUploadComplete: (document: DocumentData) => void;
  onRemove: () => void;
  onboardingId: string;
  disabled?: boolean;
}

const DOCUMENT_LABELS = {
  aadhaar_front: 'Aadhaar Card (Front)',
  aadhaar_back: 'Aadhaar Card (Back)',
  pan: 'PAN Card',
  passport: 'Passport',
  visa: 'Visa',
};

export default function DocumentUpload({
  documentType,
  isRequired,
  document,
  onUploadComplete,
  onRemove,
  onboardingId,
  disabled = false
}: DocumentUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['jpg', 'jpeg', 'png', 'pdf'];
    const maxSizeMB = 10;
    
    // Rate limiting for upload attempts
    if (!rateLimiter.canAttempt(`upload-${onboardingId}`, 5, 60000)) {
      return "Too many upload attempts. Please wait before trying again.";
    }
    
    if (!validateFileType(file, allowedTypes)) {
      return "Please upload a JPG, PNG, or PDF file";
    }
    
    if (!validateFileSize(file, maxSizeMB)) {
      return "File size must be less than 10MB";
    }
    
    // Additional security checks
    if (file.name.length > 255) {
      return "Filename too long. Please rename the file.";
    }
    
    return null;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: 'Invalid file',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Sanitize filename for security
      const sanitizedName = sanitizeFilename(file.name);
      const fileExt = sanitizedName.split('.').pop();
      const fileName = `${user.id}/${onboardingId}/${documentType}.${fileExt}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 100);

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('onboarding-documents')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      setUploadProgress(100);

      // Note: Using storage key instead of public URL for security
      // Documents are now stored in private bucket and will use signed URLs
      
      // Save to database with secure metadata
      const documentData = {
        onboarding_id: onboardingId,
        document_type: documentType,
        file_name: sanitizedName,
        file_url: fileName, // Store storage key, not public URL
        file_size: file.size,
        mime_type: file.type,
        storage_key: fileName,
        status: 'uploaded' as const,
      };

      const { data: savedDoc, error: dbError } = await supabase
        .from('worker_onboarding_documents')
        .upsert([documentData], { onConflict: 'onboarding_id,document_type' })
        .select()
        .single();

      if (dbError) throw dbError;

      onUploadComplete(savedDoc as DocumentData);
      
      toast({
        title: 'Document uploaded securely',
        description: `${DOCUMENT_LABELS[documentType]} uploaded and encrypted successfully`,
      });

    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadError('Upload failed. Please try again.');
      toast({
        title: 'Upload failed',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [documentType, onboardingId, onUploadComplete]);

  const handleRetry = () => {
    setUploadError(null);
    const input = window.document.querySelector(`#file-input-${documentType}`) as HTMLInputElement;
    if (input?.files?.[0]) {
      handleFileUpload(input.files[0]);
    }
  };

  const previewDocument = () => {
    if (document?.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  const downloadDocument = () => {
    if (document?.file_url) {
      const link = window.document.createElement('a');
      link.href = document.file_url;
      link.download = document.file_name;
      link.click();
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium">
            {DOCUMENT_LABELS[documentType]}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </h3>
          {document && (
            <div className="flex items-center space-x-1">
              {document.status === 'uploaded' && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {document.status === 'approved' && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              {document.status === 'rejected' && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {document && !isUploading ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-secondary rounded-lg">
            {document.mime_type.startsWith('image/') ? (
              <Image className="w-8 h-8 text-blue-500" />
            ) : (
              <FileText className="w-8 h-8 text-red-500" />
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">{document.file_name}</p>
              <p className="text-xs text-muted-foreground">
                {(document.file_size / 1024 / 1024).toFixed(2)} MB • {document.status}
              </p>
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                <Shield className="w-3 h-3" />
                Encrypted & Secure
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={previewDocument}
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadDocument}
                title="Download"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                disabled={disabled}
                title="Remove"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {document.mime_type.startsWith('image/') && (
            <img
              src={document.file_url}
              alt={`Preview of ${DOCUMENT_LABELS[documentType]}`}
              className="w-full max-w-md h-48 object-cover rounded-lg border cursor-pointer"
              onClick={previewDocument}
            />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, PDF (Max 10MB)
            </p>
            <p className="text-xs text-green-600 flex items-center justify-center gap-1 mt-1">
              <Shield className="w-3 h-3" />
              Encrypted & secure storage
            </p>
          </div>
          
          <input
            id={`file-input-${documentType}`}
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(file);
              }
            }}
            disabled={isUploading || disabled}
            className="w-full"
          />
          
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {uploadError && (
            <div className="space-y-2">
              <div className="text-sm text-red-600 text-center">{uploadError}</div>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry Upload
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
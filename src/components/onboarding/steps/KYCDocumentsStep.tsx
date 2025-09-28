import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Upload, FileText, Image, X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Document {
  id?: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  status: 'uploaded' | 'approved' | 'rejected';
}

interface KYCDocumentsStepProps {
  data: Document[];
  onComplete: (data: Document[]) => void;
  onValidationChange: (isValid: boolean) => void;
  onboardingId: string | null;
}

const REQUIRED_DOCUMENTS = ['aadhaar_front', 'aadhaar_back', 'pan'];
const OPTIONAL_DOCUMENTS = ['passport', 'visa'];

const DOCUMENT_LABELS = {
  aadhaar_front: 'Aadhaar Card (Front)',
  aadhaar_back: 'Aadhaar Card (Back)',
  pan: 'PAN Card',
  passport: 'Passport',
  visa: 'Visa',
};

export default function KYCDocumentsStep({ 
  data, 
  onComplete, 
  onValidationChange, 
  onboardingId 
}: KYCDocumentsStepProps) {
  const [documents, setDocuments] = useState<Document[]>(data || []);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    const hasAllRequired = REQUIRED_DOCUMENTS.every(type => 
      documents.some(doc => doc.document_type === type)
    );
    onValidationChange(hasAllRequired);
    onComplete(documents);
  }, [documents, onValidationChange, onComplete]);

  const handleFileUpload = async (
    file: File, 
    documentType: string
  ) => {
    if (!onboardingId) {
      toast({
        title: 'Error',
        description: 'Onboarding session not initialized',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Files must be under 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only JPG, PNG, and PDF files are allowed',
        variant: 'destructive',
      });
      return;
    }

    setUploading(documentType);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('onboarding-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('onboarding-documents')
        .getPublicUrl(fileName);

      // Save to database
      const documentData = {
        onboarding_id: onboardingId,
        document_type: documentType,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        storage_key: fileName,
      };

      const { data: savedDoc, error: dbError } = await supabase
        .from('worker_onboarding_documents')
        .upsert([documentData], { onConflict: 'onboarding_id,document_type' })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update local state
      setDocuments(prev => {
        const filtered = prev.filter(doc => doc.document_type !== documentType);
        return [...filtered, savedDoc];
      });

      toast({
        title: 'Document uploaded',
        description: `${DOCUMENT_LABELS[documentType]} uploaded successfully`,
      });

    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(null);
    }
  };

  const removeDocument = async (documentType: string) => {
    try {
      const doc = documents.find(d => d.document_type === documentType);
      if (!doc) return;

      // Remove from storage
      const { error: storageError } = await supabase.storage
        .from('onboarding-documents')
        .remove([doc.file_name]);

      if (storageError) console.error('Storage deletion error:', storageError);

      // Remove from database
      const { error: dbError } = await supabase
        .from('worker_onboarding_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      // Update local state
      setDocuments(prev => prev.filter(d => d.document_type !== documentType));

      toast({
        title: 'Document removed',
        description: `${DOCUMENT_LABELS[documentType]} removed successfully`,
      });

    } catch (error) {
      console.error('Error removing document:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove document',
        variant: 'destructive',
      });
    }
  };

  const getDocumentStatus = (documentType: string) => {
    return documents.find(doc => doc.document_type === documentType);
  };

  const renderDocumentUpload = (
    documentType: string,
    isRequired: boolean
  ) => {
    const document = getDocumentStatus(documentType);
    const isUploading = uploading === documentType;

    return (
      <Card key={documentType} className="p-4">
        <div className="flex items-center justify-between mb-4">
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

        {document ? (
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
                  {(document.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDocument(documentType)}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {document.mime_type.startsWith('image/') && (
              <img
                src={document.file_url}
                alt={`Preview of ${DOCUMENT_LABELS[documentType]}`}
                className="w-full max-w-md h-48 object-cover rounded-lg border"
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
            </div>
            
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file, documentType);
                }
              }}
              disabled={isUploading}
              className="w-full"
            />
            
            {isUploading && (
              <div className="space-y-2">
                <Progress value={33} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Uploading...
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  const requiredDocsUploaded = REQUIRED_DOCUMENTS.every(type => 
    documents.some(doc => doc.document_type === type)
  );

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-950 dark:border-blue-800">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          KYC Document Requirements
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Aadhaar (front & back) and PAN are mandatory for verification</li>
          <li>• Upload clear scans/photos showing all corners, no glare</li>
          <li>• Documents must be valid and belong to you</li>
          <li>• Files should be under 10MB in JPG, PNG, or PDF format</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Required Documents</h3>
        <div className="grid gap-4">
          {REQUIRED_DOCUMENTS.map(type => 
            renderDocumentUpload(type, true)
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Optional Documents</h3>
        <p className="text-sm text-muted-foreground">
          These documents can help with visa applications and international placements
        </p>
        <div className="grid gap-4">
          {OPTIONAL_DOCUMENTS.map(type => 
            renderDocumentUpload(type, false)
          )}
        </div>
      </div>

      {!requiredDocsUploaded && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 dark:bg-amber-950 dark:border-amber-800">
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            Please upload all required documents (Aadhaar front, Aadhaar back, and PAN) to continue.
          </p>
        </div>
      )}
    </div>
  );
}
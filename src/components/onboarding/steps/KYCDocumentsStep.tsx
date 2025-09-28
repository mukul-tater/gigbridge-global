import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DocumentUpload, { DocumentData } from '../DocumentUpload';

interface KYCDocumentsStepProps {
  data: DocumentData[];
  onComplete: (data: DocumentData[]) => void;
  onValidationChange: (isValid: boolean) => void;
  onboardingId: string | null;
}

const REQUIRED_DOCUMENTS = ['aadhaar_front', 'aadhaar_back', 'pan'] as const;
const OPTIONAL_DOCUMENTS = ['passport', 'visa'] as const;

export default function KYCDocumentsStep({ 
  data, 
  onComplete, 
  onValidationChange, 
  onboardingId 
}: KYCDocumentsStepProps) {
  const [documents, setDocuments] = useState<DocumentData[]>(data || []);

  useEffect(() => {
    const hasAllRequired = REQUIRED_DOCUMENTS.every(type => 
      documents.some(doc => doc.document_type === type)
    );
    onValidationChange(hasAllRequired);
    onComplete(documents);
  }, [documents, onValidationChange, onComplete]);

  useEffect(() => {
    // Load existing documents on mount
    if (onboardingId) {
      loadExistingDocuments();
    }
  }, [onboardingId]);

  const loadExistingDocuments = async () => {
    if (!onboardingId) return;
    
    try {
      const { data: existingDocs, error } = await supabase
        .from('worker_onboarding_documents')
        .select('*')
        .eq('onboarding_id', onboardingId);

      if (error) throw error;
      setDocuments((existingDocs || []) as DocumentData[]);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleDocumentUpload = (document: DocumentData) => {
    setDocuments(prev => {
      const filtered = prev.filter(doc => doc.document_type !== document.document_type);
      return [...filtered, document];
    });
  };

  const removeDocument = async (documentType: 'aadhaar_front' | 'aadhaar_back' | 'pan' | 'passport' | 'visa') => {
    try {
      const doc = documents.find(d => d.document_type === documentType);
      if (!doc) return;

      // Remove from storage if storage_key exists
      if (doc.storage_key) {
        const { error: storageError } = await supabase.storage
          .from('onboarding-documents')
          .remove([doc.storage_key]);

        if (storageError) console.error('Storage deletion error:', storageError);
      }

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
        description: 'Document removed successfully',
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

  const getDocument = (documentType: 'aadhaar_front' | 'aadhaar_back' | 'pan' | 'passport' | 'visa') => {
    return documents.find(doc => doc.document_type === documentType);
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
          {REQUIRED_DOCUMENTS.map(type => (
            <DocumentUpload
              key={type}
              documentType={type}
              isRequired={true}
              document={getDocument(type)}
              onUploadComplete={handleDocumentUpload}
              onRemove={() => removeDocument(type)}
              onboardingId={onboardingId!}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Optional Documents</h3>
        <p className="text-sm text-muted-foreground">
          These documents can help with visa applications and international placements
        </p>
        <div className="grid gap-4">
          {OPTIONAL_DOCUMENTS.map(type => (
            <DocumentUpload
              key={type}
              documentType={type}
              isRequired={false}
              document={getDocument(type)}
              onUploadComplete={handleDocumentUpload}
              onRemove={() => removeDocument(type)}
              onboardingId={onboardingId!}
            />
          ))}
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
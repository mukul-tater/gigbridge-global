-- Add new document types to the existing enum
ALTER TYPE document_type ADD VALUE 'aadhaar_front';
ALTER TYPE document_type ADD VALUE 'aadhaar_back'; 
ALTER TYPE document_type ADD VALUE 'pan';
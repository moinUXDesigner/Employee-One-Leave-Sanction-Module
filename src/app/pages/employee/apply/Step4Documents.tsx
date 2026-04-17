import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Upload, File, X, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface Step4Props {
  documents: File[];
  onUpdate: (data: { documents: File[] }) => void;
  onNext: () => void;
  onBack: () => void;
  leaveType: any;
  isMedicalLeave: boolean;
}

export function Step4Documents({
  documents,
  onUpdate,
  onNext,
  onBack,
  leaveType,
  isMedicalLeave,
}: Step4Props) {
  const [dragActive, setDragActive] = useState(false);

  const requiredDocs = leaveType?.requiredDocuments || [];
  const needsMedicalCert = leaveType?.medicalCertificateRequired || isMedicalLeave;

  const allRequiredDocs = [
    ...requiredDocs,
    ...(needsMedicalCert && !requiredDocs.includes('Medical Certificate')
      ? ['Medical Certificate']
      : []),
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onUpdate({ documents: [...documents, ...newFiles] });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      onUpdate({ documents: [...documents, ...newFiles] });
    }
  };

  const removeFile = (index: number) => {
    const newDocs = documents.filter((_, i) => i !== index);
    onUpdate({ documents: newDocs });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const canProceed = allRequiredDocs.length === 0 || documents.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upload Documents</h2>
        <p className="text-muted-foreground">
          Upload required supporting documents for your leave application
        </p>
      </div>

      {/* Required Documents Info */}
      {allRequiredDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>
              Please upload the following documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {allRequiredDocs.map((doc, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{doc}</span>
                  <Badge variant="outline" className="ml-auto">Required</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Drag and drop files or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, JPG, PNG up to 10MB each
              </p>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Browse Files
            </Button>
          </div>

          {/* Uploaded Files List */}
          {documents.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Files ({documents.length})</Label>
              <div className="space-y-2">
                {documents.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <File className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {allRequiredDocs.length > 0 && documents.length === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please upload at least one document. Required documents are listed above.
          </AlertDescription>
        </Alert>
      )}

      {allRequiredDocs.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No documents are required for this leave type. You can skip this step or upload
            supporting documents if needed.
          </AlertDescription>
        </Alert>
      )}

      {leaveType?.fitnessCertificateOnReturn && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Note: You will need to submit a fitness certificate when you return from this leave.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg flex justify-between gap-3 z-50">
        <Button variant="outline" onClick={onBack} className="flex-1 sm:flex-none">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          size="lg"
          className="flex-1 sm:flex-none"
        >
          Next: Check Eligibility
        </Button>
      </div>
    </div>
  );
}

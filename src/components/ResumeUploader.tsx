'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeInput } from '@/types/resume';

interface ResumeUploaderProps {
  onResumeUpload: (resume: ResumeInput) => void;
  disabled?: boolean;
}

export default function ResumeUploader({ onResumeUpload, disabled = false }: ResumeUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [disabled]);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const base64String = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        const resumeInput: ResumeInput = {
          content: base64String,
          filename: selectedFile.name,
          type: 'pdf'
        };

        onResumeUpload(resumeInput);
      };

      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      alert('Please enter your resume content.');
      return;
    }

    if (textInput.trim().length < 100) {
      alert('Resume content seems too short. Please provide a complete resume.');
      return;
    }

    const resumeInput: ResumeInput = {
      content: textInput.trim(),
      type: 'text'
    };

    onResumeUpload(resumeInput);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Upload Your Resume</CardTitle>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Choose between PDF upload or paste your resume text directly
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" disabled={disabled}>PDF Upload</TabsTrigger>
            <TabsTrigger value="text" disabled={disabled}>Paste Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-6">
            <div className="space-y-4">
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${dragActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={!disabled ? openFileDialog : undefined}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileInputChange}
                  disabled={disabled}
                />
                
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  
                  {selectedFile ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-600">
                        Selected: {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        {dragActive ? 'Drop your PDF here' : 'Click to upload or drag & drop'}
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF files only, up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedFile && (
                <div className="flex justify-center">
                  <Button 
                    onClick={handleFileUpload}
                    disabled={disabled}
                    className="w-full max-w-xs"
                  >
                    Analyze PDF Resume
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="text" className="mt-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="resume-text" className="block text-sm font-medium mb-2">
                  Paste your resume content below
                </label>
                <Textarea
                  id="resume-text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your complete resume text here... Include all sections like contact information, experience, education, skills, etc."
                  className="min-h-[300px] text-sm"
                  disabled={disabled}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Characters: {textInput.length} (minimum 100 recommended)
                </p>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={handleTextSubmit}
                  disabled={disabled || textInput.trim().length < 100}
                  className="w-full max-w-xs"
                >
                  Analyze Text Resume
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
'use client';

import { useState } from 'react';
import ResumeUploader from '@/components/ResumeUploader';
import JobRoleSelector from '@/components/JobRoleSelector';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnalysisResults from '@/components/AnalysisResults';
import PrivacyDisclaimer from '@/components/PrivacyDisclaimer';
import { Button } from '@/components/ui/button';
import { ResumeInput, ResumeAnalysis, UploadStatus, AnalysisResponse } from '@/types/resume';

type AppStep = 'upload' | 'role-selection' | 'analyzing' | 'results';

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [resume, setResume] = useState<ResumeInput | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const handleResumeUpload = async (resumeInput: ResumeInput) => {
    setResume(resumeInput);
    setUploadStatus({
      status: 'uploading',
      progress: 25,
      message: 'Processing your resume...'
    });

    try {
      // For PDF files, parse the content
      if (resumeInput.type === 'pdf') {
        setUploadStatus({
          status: 'processing',
          progress: 50,
          message: 'Extracting text from PDF...'
        });

        const parseResponse = await fetch('/api/parse-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileData: resumeInput.content,
            filename: resumeInput.filename
          })
        });

        const parseResult = await parseResponse.json();
        
        if (!parseResult.success) {
          throw new Error(parseResult.error || 'Failed to parse PDF');
        }

        // Update resume with parsed text
        setResume({
          ...resumeInput,
          content: parseResult.text
        });
      }

      setUploadStatus({
        status: 'complete',
        progress: 100,
        message: 'Resume processed successfully!'
      });

      // Move to role selection after a brief delay
      setTimeout(() => {
        setCurrentStep('role-selection');
        setUploadStatus({ status: 'idle', progress: 0, message: '' });
      }, 1500);

    } catch (error) {
      console.error('Resume processing error:', error);
      setUploadStatus({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Failed to process resume'
      });
    }
  };

  const handleRoleSelection = async (jobRole: string, jobDescription?: string) => {
    if (!resume) {
      alert('No resume found. Please upload your resume first.');
      return;
    }

    setCurrentStep('analyzing');
    setUploadStatus({
      status: 'analyzing',
      progress: 10,
      message: 'Starting AI analysis...'
    });

    try {
      // Update progress during analysis
      const progressInterval = setInterval(() => {
        setUploadStatus(prev => {
          if (prev.progress < 90) {
            return {
              ...prev,
              progress: prev.progress + 10,
              message: prev.progress < 50 ? 'Analyzing resume structure...' : 'Generating tailored feedback...'
            };
          }
          return prev;
        });
      }, 2000);

      const analysisResponse = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume,
          jobRole,
          jobDescription
        })
      });

      clearInterval(progressInterval);

      const result: AnalysisResponse = await analysisResponse.json();

      if (!result.success || !result.analysis) {
        throw new Error(result.error || 'Analysis failed');
      }

      setAnalysis(result.analysis);
      setUploadStatus({
        status: 'complete',
        progress: 100,
        message: `Analysis complete! (${(result.processingTime || 0) / 1000}s)`
      });

      // Move to results after a brief delay
      setTimeout(() => {
        setCurrentStep('results');
      }, 2000);

    } catch (error) {
      console.error('Analysis error:', error);
      setUploadStatus({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Analysis failed'
      });
    }
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setResume(null);
    setAnalysis(null);
    setUploadStatus({ status: 'idle', progress: 0, message: '' });
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Smart Resume Reviewer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Get AI-powered, tailored feedback on your resume to optimize it for your dream job. 
            Upload your resume and specify your target role for personalized analysis.
          </p>
        </div>

        {/* Privacy Disclaimer */}
        <PrivacyDisclaimer />

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { step: 'upload', label: 'Upload Resume', number: 1 },
              { step: 'role-selection', label: 'Select Role', number: 2 },
              { step: 'analyzing', label: 'AI Analysis', number: 3 },
              { step: 'results', label: 'View Results', number: 4 }
            ].map(({ step, label, number }) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${currentStep === step || 
                    (step === 'upload' && ['role-selection', 'analyzing', 'results'].includes(currentStep)) ||
                    (step === 'role-selection' && ['analyzing', 'results'].includes(currentStep)) ||
                    (step === 'analyzing' && currentStep === 'results')
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {number}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {label}
                </span>
                {number < 4 && (
                  <div className="ml-4 w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {currentStep === 'upload' && (
            <ResumeUploader 
              onResumeUpload={handleResumeUpload}
              disabled={uploadStatus.status !== 'idle'}
            />
          )}

          {currentStep === 'role-selection' && (
            <JobRoleSelector 
              onRoleSelect={handleRoleSelection}
              disabled={false}
            />
          )}

          {(currentStep === 'analyzing' || (uploadStatus.status !== 'idle' && uploadStatus.status !== 'complete')) && (
            <div className="flex justify-center">
              <LoadingSpinner status={uploadStatus} />
            </div>
          )}

          {currentStep === 'results' && analysis && (
            <AnalysisResults 
              analysis={analysis}
              onStartOver={handleStartOver}
            />
          )}

          {/* Error State with Retry */}
          {uploadStatus.status === 'error' && (
            <div className="flex flex-col items-center space-y-4 p-6 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Oops! Something went wrong
                </h3>
                <p className="text-red-600 dark:text-red-400 mb-4">
                  {uploadStatus.message}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={handleStartOver}
                  className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300"
                >
                  Start Over
                </Button>
                <Button 
                  onClick={() => {
                    if (currentStep === 'analyzing' && resume) {
                      // Retry analysis - we need to trigger role selection again
                      setCurrentStep('role-selection');
                      setUploadStatus({ status: 'idle', progress: 0, message: '' });
                    } else {
                      // Retry upload
                      setUploadStatus({ status: 'idle', progress: 0, message: '' });
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Powered by OpenAI GPT-4 for intelligent resume analysis. 
            Your data is processed securely and not stored.
          </p>
        </div>
      </div>
    </div>
  );
}
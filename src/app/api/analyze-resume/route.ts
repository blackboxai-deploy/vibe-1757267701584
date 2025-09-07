import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume, generateQuickScore } from '@/lib/resume-analyzer';
import { validateOpenAIKey } from '@/lib/openai';
import { ResumeInput, AnalysisResponse } from '@/types/resume';

// Set timeout for analysis requests (5 minutes)
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check if OpenAI API key is configured
    if (!validateOpenAIKey()) {
      return NextResponse.json({
        success: false,
        error: 'AI analysis service is not configured. Please contact the administrator.'
      } as AnalysisResponse, { status: 503 });
    }

    // Parse request body
    const { resume, jobRole, jobDescription } = await request.json();

    // Validate inputs
    if (!resume || !resume.content) {
      return NextResponse.json({
        success: false,
        error: 'Resume content is required'
      } as AnalysisResponse, { status: 400 });
    }

    if (!jobRole || jobRole.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Job role is required'
      } as AnalysisResponse, { status: 400 });
    }

    // Validate resume content length
    const resumeContent = resume.content.trim();
    if (resumeContent.length < 100) {
      return NextResponse.json({
        success: false,
        error: 'Resume content is too short. Please provide a complete resume with at least 100 characters.'
      } as AnalysisResponse, { status: 400 });
    }

    // For PDF resumes, the content should already be parsed text
    // For text resumes, we use the content directly
    let finalResumeContent = resumeContent;

    // If it's a PDF type but the content looks like base64, we need to parse it first
    if (resume.type === 'pdf' && resume.content.length > 1000 && !resume.content.includes('\n')) {
      // This looks like base64 data that wasn't parsed, try to handle it
      try {
        const parseResponse = await fetch(`${request.url.replace('/analyze-resume', '/parse-pdf')}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: resume.content,
            filename: resume.filename
          })
        });

        if (parseResponse.ok) {
          const parseResult = await parseResponse.json();
          if (parseResult.success) {
            finalResumeContent = parseResult.text;
          }
        }
      } catch (error) {
        console.error('Failed to parse PDF content:', error);
      }
    }

    // Generate quick score for validation
    const quickScore = generateQuickScore(finalResumeContent);
    if (quickScore < 20) {
      return NextResponse.json({
        success: false,
        error: 'Resume content appears to be incomplete or improperly formatted. Please ensure your resume includes contact information, experience, and skills sections.'
      } as AnalysisResponse, { status: 400 });
    }

    // Create structured resume input
    const structuredResume: ResumeInput = {
      content: finalResumeContent,
      type: resume.type || 'text',
      filename: resume.filename
    };

    // Perform AI-powered analysis
    console.log(`Starting resume analysis for job role: ${jobRole}`);
    const analysis = await analyzeResume(
      structuredResume,
      jobRole.trim(),
      jobDescription?.trim()
    );

    const processingTime = Date.now() - startTime;
    console.log(`Resume analysis completed in ${processingTime}ms`);

    // Return successful analysis
    return NextResponse.json({
      success: true,
      analysis,
      processingTime
    } as AnalysisResponse);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Resume analysis API error:', error);
    
    let errorMessage = 'Failed to analyze resume. Please try again.';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific error types
      if (error.message.includes('API key')) {
        statusCode = 503;
        errorMessage = 'AI analysis service is temporarily unavailable. Please try again later.';
      } else if (error.message.includes('too short') || error.message.includes('required')) {
        statusCode = 400;
      } else if (error.message.includes('timeout') || error.message.includes('rate limit')) {
        statusCode = 429;
        errorMessage = 'Service is busy. Please try again in a few minutes.';
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      processingTime
    } as AnalysisResponse, { status: statusCode });
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to analyze resumes.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to analyze resumes.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to analyze resumes.' },
    { status: 405 }
  );
}
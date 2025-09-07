import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Dynamic imports to avoid build issues
    const { parsePDFBuffer, cleanExtractedText, validatePDFFile } = await import('@/lib/pdf-parser');
    
    // Get the request data
    const { fileData, filename } = await request.json();

    if (!fileData) {
      return NextResponse.json(
        { success: false, error: 'No file data provided' },
        { status: 400 }
      );
    }

    // Convert base64 string to Buffer
    let buffer: Buffer;
    try {
      const base64Data = fileData.replace(/^data:.*,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid file data format' },
        { status: 400 }
      );
    }

    // Validate the PDF file
    const validation = validatePDFFile(buffer, 10); // 10MB limit
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Parse the PDF
    const parseResult = await parsePDFBuffer(buffer);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error },
        { status: 400 }
      );
    }

    // Clean the extracted text
    const cleanedText = cleanExtractedText(parseResult.text || '');
    
    if (!cleanedText || cleanedText.length < 50) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Extracted text is too short or empty. Please ensure your PDF contains readable text content.' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: cleanedText,
      filename: filename || 'resume.pdf',
      metadata: parseResult.metadata
    });

  } catch (error) {
    console.error('PDF parsing API error:', error);
    
    let errorMessage = 'Failed to process PDF file';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
interface PDFParseResult {
  success: boolean;
  text?: string;
  error?: string;
  metadata?: {
    pages: number;
    info?: any;
  };
}

/**
 * Parse PDF buffer and extract text content
 * @param buffer PDF file buffer
 * @returns Promise with parsed text or error
 */
export async function parsePDFBuffer(buffer: Buffer): Promise<PDFParseResult> {
  try {
    // Dynamic import to avoid build issues
    const pdfParse = await import('pdf-parse').then(module => module.default);
    
    // Validate input
    if (!buffer || buffer.length === 0) {
      return {
        success: false,
        error: 'Empty or invalid PDF buffer provided'
      };
    }

    // Parse PDF
    const data = await pdfParse(buffer);

    // Validate extracted text
    if (!data.text || data.text.trim().length === 0) {
      return {
        success: false,
        error: 'No text content found in PDF. This might be a scanned document or image-based PDF.'
      };
    }

    return {
      success: true,
      text: data.text.trim(),
      metadata: {
        pages: data.numpages,
        info: data.info
      }
    };

  } catch (error) {
    console.error('PDF parsing error:', error);
    
    // Provide specific error messages for common issues
    let errorMessage = 'Failed to parse PDF file';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        errorMessage = 'Invalid PDF file format. Please ensure the file is a valid PDF.';
      } else if (error.message.includes('password')) {
        errorMessage = 'Password-protected PDFs are not supported. Please upload an unprotected PDF.';
      } else if (error.message.includes('corrupted')) {
        errorMessage = 'PDF file appears to be corrupted. Please try uploading a different file.';
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Clean and normalize extracted text from PDF
 * @param text Raw text from PDF extraction
 * @returns Cleaned text suitable for analysis
 */
export function cleanExtractedText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    // Remove excessive whitespace and normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    
    // Remove PDF artifacts and special characters
    .replace(/[^\x20-\x7E\n]/g, '') // Keep only printable ASCII + newlines
    .replace(/^\s*[\d\s]*\s*$/gm, '') // Remove page numbers or number-only lines
    
    // Clean up common PDF extraction issues
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add spaces between camelCase
    .replace(/(\w)(\d)/g, '$1 $2') // Add spaces between letters and numbers
    .replace(/(\d)(\w)/g, '$1 $2') // Add spaces between numbers and letters
    
    // Final cleanup
    .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
    .trim();
}

/**
 * Validate PDF file size and basic properties
 * @param buffer PDF file buffer
 * @param maxSizeMB Maximum allowed file size in MB
 * @returns Validation result
 */
export function validatePDFFile(buffer: Buffer, maxSizeMB: number = 10): { valid: boolean; error?: string } {
  // Check buffer exists and has content
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'No file content received' };
  }

  // Check file size
  const fileSizeMB = buffer.length / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    return { 
      valid: false, 
      error: `File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed size of ${maxSizeMB}MB` 
    };
  }

  // Check PDF magic number (basic PDF validation)
  const header = buffer.toString('ascii', 0, 8);
  if (!header.startsWith('%PDF-')) {
    return { valid: false, error: 'File is not a valid PDF format' };
  }

  return { valid: true };
}

/**
 * Extract resume sections from parsed text using common patterns
 * @param text Cleaned resume text
 * @returns Object with identified sections
 */
export function extractResumeSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  
  // Common section headers (case insensitive)
  const sectionPatterns = {
    contact: /^(contact|personal\s+information|contact\s+information)[\s:]*$/im,
    summary: /^(summary|professional\s+summary|profile|objective|career\s+objective)[\s:]*$/im,
    experience: /^(experience|work\s+experience|professional\s+experience|employment)[\s:]*$/im,
    education: /^(education|academic\s+background|educational\s+background)[\s:]*$/im,
    skills: /^(skills|technical\s+skills|core\s+competencies|expertise)[\s:]*$/im,
    projects: /^(projects|personal\s+projects|key\s+projects|project\s+experience)[\s:]*$/im,
    certifications: /^(certifications?|licenses?|professional\s+certifications?)[\s:]*$/im
  };

  const lines = text.split('\n');
  let currentSection = 'other';
  let sectionContent: Record<string, string[]> = {
    contact: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    other: []
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Check if this line is a section header
    let foundSection = false;
    for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(trimmedLine)) {
        currentSection = sectionName;
        foundSection = true;
        break;
      }
    }

    // If not a section header, add to current section
    if (!foundSection) {
      sectionContent[currentSection].push(trimmedLine);
    }
  }

  // Convert arrays to strings
  for (const [key, value] of Object.entries(sectionContent)) {
    sections[key] = value.join('\n').trim();
  }

  return sections;
}
import { callOpenAI, createResumeAnalysisPrompt } from './openai';
import { ResumeAnalysis, ResumeInput, PREDEFINED_JOB_ROLES } from '../types/resume';

/**
 * Analyze resume content using OpenAI GPT-4
 * @param resumeInput Resume content and metadata
 * @param jobRole Target job role
 * @param jobDescription Optional job description for more targeted analysis
 * @returns Promise with detailed analysis results
 */
export async function analyzeResume(
  resumeInput: ResumeInput,
  jobRole: string,
  jobDescription?: string
): Promise<ResumeAnalysis> {
  try {
    // Validate inputs
    if (!resumeInput.content || resumeInput.content.trim().length < 100) {
      throw new Error('Resume content is too short or empty. Please provide a complete resume.');
    }

    if (!jobRole || jobRole.trim().length === 0) {
      throw new Error('Job role is required for targeted analysis.');
    }

    // Create the analysis prompt
    const prompt = createResumeAnalysisPrompt(
      resumeInput.content,
      jobRole,
      jobDescription
    );

    // Call OpenAI API for analysis
    const rawAnalysis = await callOpenAI(prompt);

    // Validate and structure the response
    const analysis = validateAndStructureAnalysis(rawAnalysis);

    // Enhance analysis with job-specific insights
    const enhancedAnalysis = enhanceAnalysisWithJobInsights(analysis, jobRole);

    return enhancedAnalysis;

  } catch (error) {
    console.error('Resume analysis error:', error);
    throw new Error(`Failed to analyze resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate and structure the raw OpenAI response
 * @param rawAnalysis Raw response from OpenAI
 * @returns Structured and validated analysis
 */
function validateAndStructureAnalysis(rawAnalysis: any): ResumeAnalysis {
  // Default structure in case of incomplete response
  const defaultAnalysis: ResumeAnalysis = {
    overallScore: 0,
    maxOverallScore: 100,
    summary: 'Unable to generate analysis summary.',
    sections: [],
    keyFindings: {
      strengths: [],
      majorIssues: [],
      missingSkills: [],
      atsCompatibility: 0,
      improvementPriority: []
    },
    jobAlignment: {
      matchScore: 0,
      relevantExperience: [],
      skillGaps: [],
      recommendations: []
    }
  };

  // Validate and merge with defaults
  return {
    overallScore: Math.max(0, Math.min(100, rawAnalysis.overallScore || 0)),
    maxOverallScore: 100,
    summary: rawAnalysis.summary || defaultAnalysis.summary,
    sections: Array.isArray(rawAnalysis.sections) ? rawAnalysis.sections : [],
    keyFindings: {
      strengths: Array.isArray(rawAnalysis.keyFindings?.strengths) ? rawAnalysis.keyFindings.strengths : [],
      majorIssues: Array.isArray(rawAnalysis.keyFindings?.majorIssues) ? rawAnalysis.keyFindings.majorIssues : [],
      missingSkills: Array.isArray(rawAnalysis.keyFindings?.missingSkills) ? rawAnalysis.keyFindings.missingSkills : [],
      atsCompatibility: Math.max(0, Math.min(10, rawAnalysis.keyFindings?.atsCompatibility || 0)),
      improvementPriority: Array.isArray(rawAnalysis.keyFindings?.improvementPriority) ? rawAnalysis.keyFindings.improvementPriority : []
    },
    jobAlignment: {
      matchScore: Math.max(0, Math.min(10, rawAnalysis.jobAlignment?.matchScore || 0)),
      relevantExperience: Array.isArray(rawAnalysis.jobAlignment?.relevantExperience) ? rawAnalysis.jobAlignment.relevantExperience : [],
      skillGaps: Array.isArray(rawAnalysis.jobAlignment?.skillGaps) ? rawAnalysis.jobAlignment.skillGaps : [],
      recommendations: Array.isArray(rawAnalysis.jobAlignment?.recommendations) ? rawAnalysis.jobAlignment.recommendations : []
    }
  };
}

/**
 * Enhance analysis with job-specific insights based on predefined roles
 * @param analysis Base analysis from OpenAI
 * @param jobRole Target job role
 * @returns Enhanced analysis with additional insights
 */
function enhanceAnalysisWithJobInsights(analysis: ResumeAnalysis, jobRole: string): ResumeAnalysis {
  // Find matching predefined role
  const predefinedRole = PREDEFINED_JOB_ROLES.find(
    role => role.title.toLowerCase() === jobRole.toLowerCase() ||
             role.id === jobRole.toLowerCase().replace(/\s+/g, '-')
  );

  if (predefinedRole) {
    // Check for missing common skills for this role
    const commonSkills = predefinedRole.commonSkills.map(skill => skill.toLowerCase());
    const resumeText = analysis.sections.find(section => section.name.toLowerCase().includes('skill'))?.feedback.join(' ').toLowerCase() || '';
    
    const missingCommonSkills = commonSkills.filter(skill => 
      !resumeText.includes(skill.toLowerCase()) && 
      !analysis.keyFindings.missingSkills.some(missing => missing.toLowerCase().includes(skill.toLowerCase()))
    );

    if (missingCommonSkills.length > 0) {
      // Add to missing skills if not already there
      const newMissingSkills = missingCommonSkills
        .map(skill => predefinedRole.commonSkills.find(cs => cs.toLowerCase() === skill) || skill)
        .filter(skill => !analysis.keyFindings.missingSkills.includes(skill));
      
      analysis.keyFindings.missingSkills.push(...newMissingSkills);
    }

    // Add role-specific recommendations
    const roleSpecificRecommendations = generateRoleSpecificRecommendations(predefinedRole, analysis);
    analysis.jobAlignment.recommendations.push(...roleSpecificRecommendations);
  }

  return analysis;
}

/**
 * Generate role-specific recommendations based on predefined role data
 * @param role Predefined job role information
 * @param analysis Current analysis results
 * @returns Array of role-specific recommendations
 */
function generateRoleSpecificRecommendations(
  role: typeof PREDEFINED_JOB_ROLES[0], 
  analysis: ResumeAnalysis
): string[] {
  const recommendations: string[] = [];

  // Category-specific recommendations
  switch (role.category.toLowerCase()) {
    case 'technology':
      if (analysis.overallScore < 70) {
        recommendations.push(`Consider adding more specific technical projects that demonstrate ${role.commonSkills.slice(0, 3).join(', ')} experience`);
      }
      recommendations.push('Ensure your technical skills section includes both the technologies you used and the context/projects where you applied them');
      break;

    case 'management':
      if (analysis.keyFindings.missingSkills.some(skill => skill.toLowerCase().includes('leadership'))) {
        recommendations.push('Add specific examples of team leadership, project management, and stakeholder communication achievements');
      }
      recommendations.push('Quantify your management impact with team sizes, budget responsibilities, and measurable outcomes');
      break;

    case 'design':
      recommendations.push('Include a portfolio link and mention specific design tools, methodologies, and user research experience');
      if (analysis.overallScore < 75) {
        recommendations.push('Highlight user-centered design processes and measurable improvements to user experience');
      }
      break;

    case 'marketing':
      recommendations.push('Include specific metrics for campaigns, growth rates, and ROI to demonstrate marketing impact');
      if (!analysis.sections.some(section => section.name.toLowerCase().includes('project'))) {
        recommendations.push('Add a projects section showcasing successful marketing campaigns and their measurable results');
      }
      break;

    case 'sales':
      recommendations.push('Quantify sales achievements with specific numbers, percentages, and quota attainment records');
      recommendations.push('Highlight relationship-building skills and experience with CRM systems and sales processes');
      break;

    case 'analysis':
      recommendations.push('Emphasize analytical methodologies, data sources, and business impact of your analytical work');
      if (analysis.keyFindings.missingSkills.some(skill => skill.toLowerCase().includes('sql'))) {
        recommendations.push('Consider adding SQL, Excel, or other data analysis tools to strengthen your technical profile');
      }
      break;
  }

  // Remove duplicates and limit recommendations
  return Array.from(new Set(recommendations)).slice(0, 3);
}

/**
 * Generate quick resume score for initial validation
 * @param resumeContent Resume text content
 * @returns Quick assessment score (0-100)
 */
export function generateQuickScore(resumeContent: string): number {
  let score = 0;
  const content = resumeContent.toLowerCase();

  // Length check (30 points max)
  const wordCount = resumeContent.split(/\s+/).length;
  if (wordCount > 150) score += 10;
  if (wordCount > 300) score += 10;
  if (wordCount > 500) score += 10;

  // Contact information (20 points max)
  if (content.includes('@') || content.includes('email')) score += 10;
  if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(content)) score += 10;

  // Experience indicators (30 points max)
  const experienceKeywords = ['experience', 'worked', 'managed', 'led', 'developed', 'created', 'achieved'];
  const experienceMatches = experienceKeywords.filter(keyword => content.includes(keyword)).length;
  score += Math.min(15, experienceMatches * 2);

  // Education (10 points max)
  if (content.includes('education') || content.includes('degree') || content.includes('university')) score += 5;
  if (content.includes('bachelor') || content.includes('master') || content.includes('phd')) score += 5;

  // Skills (10 points max)
  if (content.includes('skills') || content.includes('technical')) score += 5;
  const skillsCount = (content.match(/\b(javascript|python|java|sql|excel|project management|leadership)\b/g) || []).length;
  score += Math.min(5, skillsCount);

  return Math.min(100, score);
}
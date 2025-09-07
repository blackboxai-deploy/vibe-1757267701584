import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
});

export default openai;

// System prompt for resume analysis
export const RESUME_ANALYSIS_SYSTEM_PROMPT = `You are an expert resume reviewer and career counselor with 15+ years of experience in recruitment and talent acquisition. Your task is to provide comprehensive, constructive feedback on resumes to help job seekers optimize their applications for specific roles.

Analyze resumes across these key dimensions:
1. **Contact Information**: Completeness, professionalism, ATS compatibility
2. **Professional Summary**: Relevance, impact, keyword optimization
3. **Work Experience**: Achievement focus, quantifiable results, relevance to target role
4. **Education**: Relevance, presentation, additional qualifications
5. **Skills**: Technical/soft skill balance, role alignment, credibility
6. **Projects**: Innovation, business impact, technical complexity
7. **Certifications**: Industry relevance, recency, credibility
8. **Overall Formatting**: ATS compatibility, readability, professional appearance

For each section, provide:
- **Score** (0-10 scale)
- **Specific feedback** with actionable improvements
- **Strengths** to highlight and expand
- **Issues** that need immediate attention
- **Suggestions** for enhancement

Focus on:
- **Job-role alignment** - How well does the resume match the target position?
- **ATS optimization** - Will this pass applicant tracking systems?
- **Achievement quantification** - Are accomplishments measurable and impactful?
- **Keyword optimization** - Does it include relevant industry terms?
- **Professional presentation** - Is it clean, readable, and well-structured?

Be constructive, specific, and actionable in your feedback. Prioritize improvements by impact.`;

export const createResumeAnalysisPrompt = (
  resumeContent: string,
  jobRole: string,
  jobDescription?: string
) => {
  const jobContext = jobDescription 
    ? `**Target Job Description:**\n${jobDescription}\n\n`
    : `**Target Job Role:** ${jobRole}\n\n`;

  return `${jobContext}**Resume Content:**\n${resumeContent}\n\n**Instructions:**
Please analyze this resume for the specified role and provide a comprehensive review in the following JSON format:

{
  "overallScore": <number 0-100>,
  "maxOverallScore": 100,
  "summary": "<2-3 sentence overall assessment>",
  "sections": [
    {
      "name": "<section name>",
      "score": <number 0-10>,
      "maxScore": 10,
      "feedback": ["<specific feedback point 1>", "<specific feedback point 2>"],
      "suggestions": ["<improvement suggestion 1>", "<improvement suggestion 2>"],
      "strengths": ["<strength 1>", "<strength 2>"],
      "issues": ["<issue 1>", "<issue 2>"]
    }
  ],
  "keyFindings": {
    "strengths": ["<top 3-5 resume strengths>"],
    "majorIssues": ["<top 3-5 critical issues to fix>"],
    "missingSkills": ["<skills mentioned in job role/description but missing from resume>"],
    "atsCompatibility": <number 0-10>,
    "improvementPriority": ["<top 3 improvements in priority order>"]
  },
  "jobAlignment": {
    "matchScore": <number 0-10>,
    "relevantExperience": ["<relevant experience highlights>"],
    "skillGaps": ["<skills gaps compared to job requirements>"],
    "recommendations": ["<top 3 tailoring recommendations>"]
  }
}

Ensure all scores are realistic and justified. Focus on actionable, specific feedback that will genuinely improve the candidate's chances.`;
};

// Helper function to validate OpenAI API key
export const validateOpenAIKey = (): boolean => {
  const apiKey = process.env.OPENAI_API_KEY;
  return !!(apiKey && apiKey.length > 0 && apiKey !== 'your-openai-api-key-here');
};

// Helper function to handle OpenAI API calls with error handling
export const callOpenAI = async (prompt: string, systemPrompt: string = RESUME_ANALYSIS_SYSTEM_PROMPT) => {
  try {
    if (!validateOpenAIKey()) {
      throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response received from OpenAI API');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};
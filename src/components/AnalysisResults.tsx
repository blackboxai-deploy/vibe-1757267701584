'use client';

import { ResumeAnalysis } from '@/types/resume';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface AnalysisResultsProps {
  analysis: ResumeAnalysis;
  onStartOver?: () => void;
}

export default function AnalysisResults({ analysis, onStartOver }: AnalysisResultsProps) {
  const getScoreColor = (score: number, maxScore: number = 10) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };



  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Overall Score Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Resume Analysis Results</CardTitle>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore, 100)}`}>
                  {analysis.overallScore}
                </div>
                <div className="text-gray-500 text-sm">out of 100</div>
              </div>
            </div>
            <div className="max-w-2xl mx-auto">
              <Progress value={analysis.overallScore} className="h-3" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {analysis.summary}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="sections" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sections">Section Analysis</TabsTrigger>
          <TabsTrigger value="findings">Key Findings</TabsTrigger>
          <TabsTrigger value="alignment">Job Alignment</TabsTrigger>
          <TabsTrigger value="recommendations">Action Items</TabsTrigger>
        </TabsList>

        {/* Section Analysis */}
        <TabsContent value="sections" className="space-y-4">
          <div className="grid gap-4">
            {analysis.sections.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{section.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <span className={`text-2xl font-bold ${getScoreColor(section.score, section.maxScore)}`}>
                        {section.score}/{section.maxScore}
                      </span>
                    </div>
                  </div>
                  <Progress value={(section.score / section.maxScore) * 100} className="h-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.strengths.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Strengths</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {section.strengths.map((strength, idx) => (
                          <li key={idx} className="text-green-600 dark:text-green-400">{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.issues.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Issues to Address</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {section.issues.map((issue, idx) => (
                          <li key={idx} className="text-red-600 dark:text-red-400">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.feedback.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Detailed Feedback</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {section.feedback.map((feedback, idx) => (
                          <li key={idx} className="text-gray-700 dark:text-gray-300">{feedback}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">Improvement Suggestions</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {section.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-purple-600 dark:text-purple-400">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Key Findings */}
        <TabsContent value="findings" className="space-y-4">
          <div className="grid gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">Top Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.keyFindings.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Major Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400">Major Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.keyFindings.majorIssues.map((issue, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{issue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Missing Skills */}
            {analysis.keyFindings.missingSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-700 dark:text-orange-400">Missing Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keyFindings.missingSkills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="border-orange-300 text-orange-700 dark:text-orange-400">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ATS Compatibility */}
            <Card>
              <CardHeader>
                <CardTitle>ATS Compatibility Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className={`text-3xl font-bold ${getScoreColor(analysis.keyFindings.atsCompatibility)}`}>
                    {analysis.keyFindings.atsCompatibility}/10
                  </div>
                  <div className="flex-1">
                    <Progress value={analysis.keyFindings.atsCompatibility * 10} className="h-3" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  This score indicates how well your resume will perform with Applicant Tracking Systems (ATS).
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Job Alignment */}
        <TabsContent value="alignment" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Role Match Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`text-3xl font-bold ${getScoreColor(analysis.jobAlignment.matchScore)}`}>
                    {analysis.jobAlignment.matchScore}/10
                  </div>
                  <div className="flex-1">
                    <Progress value={analysis.jobAlignment.matchScore * 10} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Relevant Experience */}
            {analysis.jobAlignment.relevantExperience.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-400">Relevant Experience Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.jobAlignment.relevantExperience.map((exp, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{exp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Skill Gaps */}
            {analysis.jobAlignment.skillGaps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-700 dark:text-orange-400">Skill Gaps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.jobAlignment.skillGaps.map((gap, idx) => (
                      <Badge key={idx} variant="outline" className="border-orange-300 text-orange-700 dark:text-orange-400">
                        {gap}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-6">
            {/* Improvement Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Top Priority Improvements</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {analysis.keyFindings.improvementPriority.map((priority, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-sm">{priority}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Job-Specific Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Job-Specific Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.jobAlignment.recommendations.map((recommendation, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-6">
        <Button variant="outline" onClick={onStartOver}>
          Analyze Another Resume
        </Button>
        <Button onClick={() => window.print()}>
          Save/Print Analysis
        </Button>
      </div>
    </div>
  );
}
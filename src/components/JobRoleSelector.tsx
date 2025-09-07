'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PREDEFINED_JOB_ROLES, JobRole } from '@/types/resume';

interface JobRoleSelectorProps {
  onRoleSelect: (role: string, description?: string) => void;
  disabled?: boolean;
}

export default function JobRoleSelector({ onRoleSelect, disabled = false }: JobRoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [customRole, setCustomRole] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  // Group roles by category
  const rolesByCategory = PREDEFINED_JOB_ROLES.reduce<Record<string, JobRole[]>>((acc, role) => {
    if (!acc[role.category]) {
      acc[role.category] = [];
    }
    acc[role.category].push(role);
    return acc;
  }, {});

  const handleRoleSelect = (roleTitle: string) => {
    setSelectedRole(roleTitle);
    setShowCustomInput(false);
    setCustomRole('');
  };

  const handleCustomRoleSelect = () => {
    setShowCustomInput(true);
    setSelectedRole('');
  };

  const handleSubmit = () => {
    const finalRole = showCustomInput ? customRole.trim() : selectedRole;
    
    if (!finalRole) {
      alert('Please select or enter a job role.');
      return;
    }

    onRoleSelect(finalRole, jobDescription.trim() || undefined);
  };

  const getSelectedRoleInfo = (): JobRole | null => {
    return PREDEFINED_JOB_ROLES.find(role => role.title === selectedRole) || null;
  };

  const isValid = () => {
    return showCustomInput ? customRole.trim().length > 0 : selectedRole.length > 0;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Target Job Role</CardTitle>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Select your target job role for tailored resume analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Predefined Roles */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Popular Job Roles</h3>
          {Object.entries(rolesByCategory).map(([category, roles]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {category}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.title)}
                    disabled={disabled}
                    className={`
                      p-4 text-left border rounded-lg transition-all hover:shadow-md
                      ${selectedRole === role.title
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="font-medium text-sm">{role.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {role.commonSkills.slice(0, 3).join(', ')}
                      {role.commonSkills.length > 3 && '...'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Role Input */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Custom Job Role</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCustomRoleSelect}
              disabled={disabled}
              className={showCustomInput ? 'bg-blue-50 dark:bg-blue-950 border-blue-500' : ''}
            >
              {showCustomInput ? 'Custom Role Selected' : 'Enter Custom Role'}
            </Button>
          </div>

          {showCustomInput && (
            <div className="space-y-2">
              <Label htmlFor="custom-role">Job Role Title</Label>
              <Input
                id="custom-role"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g., Senior Full Stack Developer, Digital Marketing Specialist..."
                disabled={disabled}
              />
            </div>
          )}
        </div>

        {/* Selected Role Info */}
        {selectedRole && !showCustomInput && (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Selected: {selectedRole}
            </h4>
            {getSelectedRoleInfo() && (
              <div className="space-y-2">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-medium">Category:</span> {getSelectedRoleInfo()?.category}
                </p>
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                    Common Skills for this Role:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {getSelectedRoleInfo()?.commonSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Job Description (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="job-description" className="flex items-center gap-2">
            Job Description 
            <span className="text-xs text-gray-500 font-normal">(Optional - for more targeted analysis)</span>
          </Label>
          <Textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the specific job description here for more targeted analysis. Include requirements, responsibilities, and desired qualifications..."
            className="min-h-[120px] text-sm"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500">
            Adding a job description will provide more specific feedback tailored to the exact role requirements.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleSubmit}
            disabled={disabled || !isValid()}
            size="lg"
            className="w-full max-w-xs"
          >
            Continue with Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
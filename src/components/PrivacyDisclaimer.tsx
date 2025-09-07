'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PrivacyDisclaimer() {
  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <div className="flex items-start space-x-2">
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">i</span>
        </div>
        <div className="flex-1">
          <AlertTitle className="text-blue-900 dark:text-blue-100 text-sm font-semibold mb-1">
            Privacy & AI Processing Notice
          </AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Secure Processing:</strong> Your resume is processed temporarily and deleted immediately after analysis.</li>
              <li><strong>AI Analysis:</strong> We use OpenAI GPT-4 to provide intelligent feedback on your resume.</li>
              <li><strong>No Storage:</strong> We do not store, save, or share your resume content with third parties.</li>
              <li><strong>Confidential:</strong> All data is processed securely and confidentially for analysis purposes only.</li>
            </ul>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
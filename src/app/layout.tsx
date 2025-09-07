import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Smart Resume Reviewer - AI-Powered Resume Analysis',
  description: 'Get tailored, constructive feedback on your resume using advanced AI. Optimize your resume for specific job roles and improve your chances of landing your dream job.',
  keywords: 'resume, CV, analysis, AI, job search, career, feedback, optimization, ATS',
  authors: [{ name: 'Smart Resume Reviewer' }],
  openGraph: {
    title: 'Smart Resume Reviewer - AI-Powered Resume Analysis',
    description: 'Get tailored, constructive feedback on your resume using advanced AI.',
    type: 'website',
    locale: 'en_US',
  },
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 antialiased">
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}
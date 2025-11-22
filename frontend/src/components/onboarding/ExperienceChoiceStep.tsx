'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Upload, FileText, ArrowRight, ArrowLeft } from 'lucide-react'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'

interface ExperienceChoiceStepProps {
  onNext: () => void
  onPrev: () => void
}

export default function ExperienceChoiceStep({ onNext, onPrev }: ExperienceChoiceStepProps) {
  const { experienceChoice, setExperienceChoice } = useOnboardingStore()

  const handleChoice = (choice: 'resume' | 'manual') => {
    setExperienceChoice(choice)
  }

  const handleContinue = () => {
    if (experienceChoice) {
      onNext()
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>How would you like to share your experience?</CardTitle>
        <CardDescription>
          Choose how you'd prefer to provide your professional background. Both options work equally well.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Resume Upload Option */}
          <div
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
              experienceChoice === 'resume'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleChoice('resume')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-3 rounded-full ${
                experienceChoice === 'resume' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Upload className={`w-8 h-8 ${
                  experienceChoice === 'resume' ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Upload Resume</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Quick and easy - we'll automatically extract your experience, skills, and achievements
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Supports PDF, DOCX, TXT</li>
                  <li>• AI analyzes your background</li>
                  <li>• Extracts quantifiable achievements</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Manual Entry Option */}
          <div
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
              experienceChoice === 'manual'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleChoice('manual')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-3 rounded-full ${
                experienceChoice === 'manual' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <FileText className={`w-8 h-8 ${
                  experienceChoice === 'manual' ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Enter Manually</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Have full control - describe your roles, achievements, and skills in detail
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Step-by-step role entry</li>
                  <li>• Focus on behavioral stories</li>
                  <li>• Add specific achievements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {experienceChoice && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800 font-medium">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              {experienceChoice === 'resume'
                ? 'Great! Upload your resume on the next screen.'
                : 'Perfect! Tell us about your experience manually.'
              }
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button
            onClick={onPrev}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!experienceChoice}
            className="flex-1"
            size="lg"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

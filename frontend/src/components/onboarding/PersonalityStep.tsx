'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Brain, ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'

interface PersonalityStepProps {
  onNext: () => void
  onPrev: () => void
}

export default function PersonalityStep({ onNext, onPrev }: PersonalityStepProps) {
  const { personalityData, setPersonalityData } = useOnboardingStore()
  const [formData, setFormData] = useState({
    work_style: personalityData?.work_style || '',
    communication: personalityData?.communication || '',
    strengths: personalityData?.strengths || '',
    challenges: personalityData?.challenges || '',
    writing_sample: personalityData?.writing_sample || '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    // Basic validation
    if (!formData.work_style.trim() || !formData.communication.trim()) {
      return
    }

    setPersonalityData(formData)
    onNext()
  }

  const isValid = formData.work_style.trim() && formData.communication.trim()

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6" />
          Tell Us About Yourself
        </CardTitle>
        <CardDescription>
          This helps us understand your communication style and create personalized answers that sound authentically like you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            How would you describe your work style? *
          </label>
          <Textarea
            placeholder="e.g., I'm analytical and detail-oriented, preferring structured approaches with clear goals and metrics..."
            value={formData.work_style}
            onChange={(e) => handleChange('work_style', e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            How do you typically communicate in professional settings? *
          </label>
          <Textarea
            placeholder="e.g., I'm direct and concise, focusing on key points and actionable outcomes..."
            value={formData.communication}
            onChange={(e) => handleChange('communication', e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            What are your key strengths?
          </label>
          <Textarea
            placeholder="e.g., Problem-solving, leadership, adaptability, attention to detail..."
            value={formData.strengths}
            onChange={(e) => handleChange('strengths', e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            What areas are you working to improve?
          </label>
          <Textarea
            placeholder="e.g., Public speaking, delegation, time management..."
            value={formData.challenges}
            onChange={(e) => handleChange('challenges', e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Optional: Writing sample (helps match your voice)
          </label>
          <Textarea
            placeholder="Paste any professional writing - email, report, presentation, blog post..."
            value={formData.writing_sample}
            onChange={(e) => handleChange('writing_sample', e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            This helps our AI better understand your writing style and vocabulary level
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex-1"
            size="lg"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          * Required fields
        </p>
      </CardContent>
    </Card>
  )
}

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
    <div className="w-full">
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          <span className="text-2xl">📝</span>
          Tell Us About Yourself
        </h2>
        <p className="text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#7D8B92' }}>
          We'll use this to learn how you communicate and shape answers that sound authentically like you.
        </p>
      </div>
      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium mb-2 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            How would you describe your work style? <span className="text-green-600">*</span>
          </label>
          <Textarea
            placeholder="e.g., I'm analytical and detail-oriented, preferring structured approaches with clear goals and metrics..."
            value={formData.work_style}
            onChange={(e) => handleChange('work_style', e.target.value)}
            rows={3}
            className="resize-none rounded-2xl border-2 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            How do you typically communicate in professional settings? <span className="text-green-600">*</span>
          </label>
          <Textarea
            placeholder="e.g., I'm direct and concise, focusing on key points and actionable outcomes..."
            value={formData.communication}
            onChange={(e) => handleChange('communication', e.target.value)}
            rows={3}
            className="resize-none rounded-2xl border-2 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            What are your key strengths?
          </label>
          <Textarea
            placeholder="e.g., Problem-solving, leadership, adaptability, attention to detail..."
            value={formData.strengths}
            onChange={(e) => handleChange('strengths', e.target.value)}
            rows={2}
            className="resize-none rounded-2xl border-2 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            What areas are you working to improve?
          </label>
          <Textarea
            placeholder="e.g., Public speaking, delegation, time management..."
            value={formData.challenges}
            onChange={(e) => handleChange('challenges', e.target.value)}
            rows={2}
            className="resize-none rounded-2xl border-2 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 block" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Optional: Writing sample (helps match your voice)
          </label>
          <Textarea
            placeholder="Paste any professional writing - email, report, presentation, blog post..."
            value={formData.writing_sample}
            onChange={(e) => handleChange('writing_sample', e.target.value)}
            rows={4}
            className="resize-none rounded-2xl border-2 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          />
          <p className="text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#7D8B92' }}>
            This helps our AI better understand your writing style and vocabulary level
          </p>
        </div>

        <div className="flex gap-4 pt-6">
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex-1 bg-gradient-to-r from-[#7fffd2] to-[#28d98a] text-white rounded-full px-8 py-6 text-lg font-semibold shadow-[0_8px_25px_rgba(40,217,138,0.35)] hover:shadow-[0_12px_35px_rgba(40,217,138,0.45)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
          * Required fields
        </p>
      </div>
    </div>
  )
}

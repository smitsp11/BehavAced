'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Progress } from '@/components/ui/Progress'
import { Upload, Sparkles, Brain, CheckCircle2 } from 'lucide-react'
import { uploadResume, submitPersonality, generateStories } from '@/lib/api'
import { fileToBase64, getFileExtension } from '@/lib/utils'

interface OnboardingFlowProps {
  onComplete: (userId: string) => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string>('')
  
  // Step 1: Resume Upload
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  
  // Step 2: Personality Questions
  const [questionnaire, setQuestionnaire] = useState({
    work_style: '',
    communication: '',
    strengths: '',
    challenges: '',
  })
  const [writingSample, setWritingSample] = useState('')

  const handleResumeUpload = async () => {
    if (!resumeFile) return

    setLoading(true)
    try {
      const base64Content = await fileToBase64(resumeFile)
      const fileExt = getFileExtension(resumeFile.name)
      
      const response = await uploadResume(base64Content, resumeFile.name, fileExt)
      
      if (response.success) {
        setUserId(response.user_id)
        setStep(2)
      }
    } catch (error: any) {
      alert(error.message || 'Failed to upload resume')
    } finally {
      setLoading(false)
    }
  }

  const handlePersonalitySubmit = async () => {
    setLoading(true)
    try {
      const responses = {
        user_id: userId,
        ...questionnaire
      }
      
      await submitPersonality(responses, writingSample)
      setStep(3)
      
      // Generate stories in background
      await generateStories(userId)
      
      // Complete onboarding
      setTimeout(() => {
        onComplete(userId)
      }, 2000)
      
    } catch (error: any) {
      alert(error.message || 'Failed to submit personality')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome to BehavAced
          </h1>
          <p className="text-muted-foreground">
            Let's build your behavioral interview cognition engine
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={(step / 3) * 100} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Step {step} of 3</span>
            <span>{Math.round((step / 3) * 100)}% Complete</span>
          </div>
        </div>

        {/* Step 1: Resume Upload */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Upload Your Resume
              </CardTitle>
              <CardDescription>
                We'll analyze your experience and extract your stories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {resumeFile ? resumeFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, or TXT (max 10MB)
                  </p>
                </label>
              </div>

              <Button
                onClick={handleResumeUpload}
                disabled={!resumeFile || loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Analyzing Resume...' : 'Continue'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Personality Questionnaire */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6" />
                Tell Us About Yourself
              </CardTitle>
              <CardDescription>
                This helps us match your authentic communication style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  How would you describe your work style?
                </label>
                <Textarea
                  placeholder="e.g., I'm analytical and detail-oriented, preferring structured approaches..."
                  value={questionnaire.work_style}
                  onChange={(e) =>
                    setQuestionnaire({ ...questionnaire, work_style: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  How do you typically communicate in professional settings?
                </label>
                <Textarea
                  placeholder="e.g., I'm direct and concise, focusing on key points..."
                  value={questionnaire.communication}
                  onChange={(e) =>
                    setQuestionnaire({ ...questionnaire, communication: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  What are your key strengths?
                </label>
                <Input
                  placeholder="e.g., Problem-solving, leadership, adaptability"
                  value={questionnaire.strengths}
                  onChange={(e) =>
                    setQuestionnaire({ ...questionnaire, strengths: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  What areas are you working to improve?
                </label>
                <Input
                  placeholder="e.g., Public speaking, time management"
                  value={questionnaire.challenges}
                  onChange={(e) =>
                    setQuestionnaire({ ...questionnaire, challenges: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Optional: Provide a writing sample (helps match your voice)
                </label>
                <Textarea
                  placeholder="Paste any professional writing - email, essay, blog post..."
                  value={writingSample}
                  onChange={(e) => setWritingSample(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                onClick={handlePersonalitySubmit}
                disabled={!questionnaire.work_style || !questionnaire.communication || loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Analyzing Profile...' : 'Complete Setup'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Processing */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 animate-pulse" />
                Building Your Profile
              </CardTitle>
              <CardDescription>
                AI is analyzing your experiences and creating your story bank...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 py-8">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <span>Resume analyzed</span>
              </div>
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <span>Communication style profiled</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Generating personalized stories...</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


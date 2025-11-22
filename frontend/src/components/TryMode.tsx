git 'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Sparkles, MessageSquare, ArrowRight, Play, Star, Clock, Target } from 'lucide-react'
import { generateDemoAnswer } from '@/lib/api'

// Sample questions for quick testing
interface TryModeProps {
  onStartOnboarding: () => void
}

interface DemoAnswer {
  success: boolean
  answer: string
  structure: string
  key_points: string[]
  estimated_time_seconds: number
}

const SAMPLE_QUESTIONS = [
  "Tell me about a time you led a team through a challenging project",
  "Describe a situation where you solved a complex technical problem",
  "Tell me about a time you had to adapt to a major change at work",
  "Give me an example of when you turned around a failing project",
  "Describe a time you had to work with a difficult team member"
]

export default function TryMode({ onStartOnboarding }: TryModeProps) {
  const [question, setQuestion] = useState('')
  const [demoAnswer, setDemoAnswer] = useState<DemoAnswer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerateDemo = async () => {
    if (!question.trim()) return

    setLoading(true)
    setError('')
    setDemoAnswer(null)

    try {
      const result = await generateDemoAnswer(question.trim())
      setDemoAnswer(result)
    } catch (err: any) {
      setError(err.message || 'Failed to generate demo answer')
    } finally {
      setLoading(false)
    }
  }

  const handleSampleQuestionClick = (sampleQuestion: string) => {
    setQuestion(sampleQuestion)
    // Auto-generate for sample questions
    setTimeout(() => handleGenerateDemo(), 100)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            BehavAced
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered behavioral interview coaching that adapts to your authentic voice
          </p>

          {/* Try It Now Section */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Try It Now
              </CardTitle>
              <CardDescription>
                Ask any behavioral interview question and see how our AI creates compelling answers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., Tell me about a time you led a team through a challenging project..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                className="resize-none"
              />

              <Button
                onClick={handleGenerateDemo}
                disabled={!question.trim() || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating Answer...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Generate Demo Answer
                  </>
                )}
              </Button>

              {/* Sample Questions */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">Try these sample questions:</p>
                <div className="grid gap-2">
                  {SAMPLE_QUESTIONS.map((sampleQ, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSampleQuestionClick(sampleQ)}
                      className="text-left justify-start h-auto py-2 px-3 text-xs"
                      disabled={loading}
                    >
                      {sampleQ}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Answer Display */}
          {error && (
            <Card className="max-w-2xl mx-auto mb-8 border-red-200">
              <CardContent className="pt-6">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {demoAnswer && (
            <Card className="max-w-4xl mx-auto mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Demo Answer
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {demoAnswer.structure}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(demoAnswer.estimated_time_seconds)}
                    </span>
                  </div>
                </div>
                <CardDescription>
                  High-quality example answer demonstrating best practices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {demoAnswer.answer}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Key Points:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {demoAnswer.key_points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Ready for Personalized Coaching?</h2>
              <p className="text-gray-600 mb-6">
                Upload your resume and answer a few questions about your communication style.
                Our AI will create personalized answers that match your authentic voice and story bank.
              </p>
              <Button
                onClick={onStartOnboarding}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Get Started - It's Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-3">
                Takes ~3 minutes • No account required • All data processed locally
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose BehavAced?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Personalization</h3>
                <p className="text-gray-600">
                  Our AI analyzes your communication style and creates answers that sound authentically like you.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Story Bank Generation</h3>
                <p className="text-gray-600">
                  Extract and organize your professional stories into a searchable bank for instant retrieval.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Behavioral Interview Focus</h3>
                <p className="text-gray-600">
                  Specifically designed for behavioral interviews with STAR/SOAR structure and quantifiable results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FadeIn, SlideUp, HoverCard, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { motion } from 'framer-motion'
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
    // Just set the question, don't auto-submit
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
          <FadeIn>
            <div className="flex items-center justify-center mb-6">
              <div className="gradient-primary p-4 rounded-full shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-gradient mb-4">
              BehavAced
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              AI-powered behavioral interview coaching that adapts to your authentic voice and creates personalized answers that sound like you
            </p>
          </FadeIn>

          {/* Try It Now Section */}
          <SlideUp className="mb-8">
            <HoverCard className="max-w-2xl mx-auto">
              <Card className="card-floating">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <motion.button
                      onClick={handleGenerateDemo}
                      disabled={!question.trim() || loading}
                      className={`
                        relative flex items-center justify-center p-3 rounded-full transition-all duration-300
                        ${!question.trim() || loading 
                          ? 'bg-gray-200 cursor-not-allowed opacity-50' 
                          : 'gradient-primary cursor-pointer shadow-lg'
                        }
                      `}
                      whileHover={!question.trim() || loading ? {} : {
                        scale: 1.15,
                        y: -4,
                        boxShadow: '0 20px 25px -5px rgba(102, 126, 234, 0.4), 0 10px 10px -5px rgba(102, 126, 234, 0.2)',
                      }}
                      whileTap={!question.trim() || loading ? {} : { scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17
                      }}
                      aria-label="Generate demo answer"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Play className="w-5 h-5 text-white" strokeWidth={2.5} />
                      )}
                    </motion.button>
                    Try It Now
                  </CardTitle>
                  <CardDescription>
                    Ask any behavioral interview question and see how our AI creates compelling answers that demonstrate best practices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="e.g., Tell me about a time you led a team through a challenging project..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault()
                        if (question.trim() && !loading) {
                          handleGenerateDemo()
                        }
                      }
                    }}
                    rows={3}
                    className="resize-none"
                  />

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

                  {/* Output Display - Show below question in same card */}
                  {error && (
                    <FadeIn>
                      <div className="mt-4 p-4 rounded-lg border border-red-200 bg-red-50/50">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    </FadeIn>
                  )}

                  {demoAnswer && (
                    <FadeIn>
                      <div className="mt-4 space-y-4">
                        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-yellow-500" />
                              <h4 className="font-semibold text-lg">Demo Answer</h4>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                                <Target className="w-4 h-4" />
                                {demoAnswer.structure}
                              </span>
                              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
                                <Clock className="w-4 h-4" />
                                {formatTime(demoAnswer.estimated_time_seconds)}
                              </span>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-lg mb-3">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {demoAnswer.answer}
                            </p>
                          </div>
                          <div className="border-t pt-3">
                            <h5 className="font-semibold mb-2 text-sm">Key Points:</h5>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                              {demoAnswer.key_points.map((point, index) => (
                                <li key={index}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </FadeIn>
                  )}
                </CardContent>
              </Card>
            </HoverCard>
          </SlideUp>


          {/* CTA Section */}
          <FadeIn>
            <div className="text-center">
              <HoverCard className="glass p-8 rounded-2xl max-w-2xl mx-auto card-floating">
                <h2 className="text-3xl font-bold mb-4 text-gradient">Ready for Personalized Coaching?</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Upload your resume and share your communication style.
                  Our AI will create personalized answers that match your authentic voice and story bank.
                </p>
                <Button
                  onClick={onStartOnboarding}
                  className="gradient-primary hover:opacity-90 btn-soft text-white border-0"
                  size="lg"
                >
                  Get Started - It's Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Takes ~3 minutes • No account required • All data processed locally
                </p>
              </HoverCard>
            </div>
          </FadeIn>
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

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { FadeIn, SlideUp, HoverCard, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { motion } from 'framer-motion'
import { Sparkles, MessageSquare, ArrowRight, Play, Star, Clock, Target, Upload, FileText, Brain, CheckCircle2 } from 'lucide-react'
import { generateDemoAnswer } from '@/lib/api'

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
  { text: "Tell me about a time you led a team through a challenging project", emoji: "👥" },
  { text: "Describe a situation where you solved a complex technical problem", emoji: "🔧" },
  { text: "Tell me about a time you had to adapt to a major change at work", emoji: "🔄" },
  { text: "Give me an example of when you turned around a failing project", emoji: "🎯" },
  { text: "Describe a time you had to work with a difficult team member", emoji: "💬" }
]

export default function TryMode({ onStartOnboarding }: TryModeProps) {
  const [question, setQuestion] = useState('')
  const [demoAnswer, setDemoAnswer] = useState<DemoAnswer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Diagnostic: Log API URL on mount and test backend connection
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    console.log('🔍 TryMode loaded - API URL:', apiUrl)
    console.log('🔍 Environment variable NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
    
    // Test backend connection on mount
    fetch(`${apiUrl}/health`)
      .then(res => res.json())
      .then(data => console.log('✅ Backend health check successful:', data))
      .catch(err => {
        console.error('❌ Backend health check failed:', err)
        console.error('   This means the frontend cannot reach the backend at:', apiUrl)
      })
  }, [])

  const handleGenerateDemo = async () => {
    if (!question.trim()) return

    setLoading(true)
    setError('')
    setDemoAnswer(null)

    try {
      console.log('Generating demo answer for question:', question.trim())
      const result = await generateDemoAnswer(question.trim())
      console.log('Demo answer result:', result)
      
      // Handle both response formats
      if (result && result.success && result.answer) {
        setDemoAnswer({
          success: result.success,
          answer: result.answer,
          structure: result.structure || 'STAR',
          key_points: result.key_points || [],
          estimated_time_seconds: result.estimated_time_seconds || 60
        })
      } else if (result && result.answer) {
        setDemoAnswer({
          success: true,
          answer: result.answer,
          structure: result.structure || 'STAR',
          key_points: result.key_points || [],
          estimated_time_seconds: result.estimated_time_seconds || 60
        })
      } else {
        console.error('Unexpected response format:', result)
        throw new Error('Invalid response format from server')
      }
    } catch (err: any) {
      console.error('Error generating demo answer:', err)
      
      let errorMessage = 'c'
      
      if (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('Load failed')) {
        errorMessage += 'Unable to connect to the server. Please ensure:\n'
        errorMessage += '1. Backend is running at http://localhost:8000\n'
        errorMessage += '2. Next.js dev server has been restarted\n'
        errorMessage += '3. Check browser console for more details'
      } else if (err.message.includes('timeout')) {
        errorMessage += 'Request timed out. The server is taking too long to respond.'
      } else if (err.message.includes('CORS') || err.message.includes('OPTIONS')) {
        errorMessage += 'CORS error. Please check that the backend CORS settings allow requests from http://localhost:3000'
      } else {
        errorMessage += err.message || 'Please try again.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSampleQuestionClick = (sampleQuestion: string) => {
    setQuestion(sampleQuestion)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
  }

  return (
    <div className="min-h-screen gradient-mint-hero">
      {/* Background Accent Blob */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-3xl -z-10" />
      
      {/* Hero Section - Two Column Layout */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar with Logo */}
          <FadeIn>
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center gap-3">
                <div className="gradient-green p-3 rounded-2xl shadow-lg green-glow">
                  <span className="text-3xl">🧠</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-playfair" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: 'normal', letterSpacing: 'normal' }}>
                  <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                    BehavAced
                  </span>
                </h1>
              </div>
            </div>
          </FadeIn>

          {/* Two Column Hero Layout */}
          <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
            {/* Left Column: Headline + Input */}
            <FadeIn>
              <div className="space-y-6">
                <h2 className="text-5xl md:text-6xl leading-tight font-playfair">
                  Ace Your Behavioral Interviews With AI That{' '}
                  <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                    Sounds Like You
                  </span>
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Upload your resume. Share your style. Get personalized answers that match your authentic voice.
                </p>

                {/* Try It Input Box - Glassmorphic */}
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      placeholder="Ask any behavioral question... e.g., 'Tell me about a time you led a team'"
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
                      rows={4}
                      className="glassmorphic-input rounded-3xl p-6 text-lg resize-none w-full"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                    />
                  </div>

                  {/* Play Button - Green Gradient with Sparkles */}
                  <motion.button
                    onClick={handleGenerateDemo}
                    disabled={!question.trim() || loading}
                    className={`
                      relative gradient-green rounded-full px-7 py-4 text-black text-lg
                      shadow-lg shadow-green-400/40 flex items-center gap-2 mx-auto
                      ${!question.trim() || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      ${!question.trim() || loading ? '' : 'sparkle'}
                    `}
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                    whileHover={!question.trim() || loading ? {} : {
                      scale: 1.05,
                      y: -2,
                      boxShadow: '0 20px 25px -5px rgba(40, 217, 138, 0.4), 0 10px 10px -5px rgba(40, 217, 138, 0.2)',
                    }}
                    whileTap={!question.trim() || loading ? {} : { scale: 0.98 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 17
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" fill="currentColor" />
                        Generate Answer
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Output Display - Show below input */}
                {error && (
                  <FadeIn>
                    <div className="p-4 rounded-2xl border-2 border-red-200 bg-red-50/80 backdrop-blur-sm">
                      <p className="text-red-600 text-sm whitespace-pre-line">{error}</p>
                    </div>
                  </FadeIn>
                )}

                {demoAnswer && (
                  <FadeIn>
                    <div className="p-6 rounded-3xl border-2 border-green-200 bg-white/90 backdrop-blur-sm shadow-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                          <h4 className="font-bold text-xl" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Demo Answer</h4>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="px-3 py-1 bg-green-100 rounded-full text-green-700 font-medium" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                            {demoAnswer.structure}
                          </span>
                          <span className="px-3 py-1 bg-emerald-100 rounded-full text-emerald-700 font-medium flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                            <Clock className="w-4 h-4" />
                            {formatTime(demoAnswer.estimated_time_seconds)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-5 rounded-2xl mb-4">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                          {demoAnswer.answer}
                        </p>
                      </div>
                      {demoAnswer.key_points && demoAnswer.key_points.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                          <h5 className="font-semibold mb-2 text-sm text-gray-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Key Points:</h5>
                          <ul className="space-y-1 text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                            {demoAnswer.key_points.map((point, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </FadeIn>
                )}
              </div>
            </FadeIn>

            {/* Right Column: Playful Floating Elements */}
            <SlideUp>
              <div className="relative h-full min-h-[500px]">
                {/* Floating Speech Bubbles */}
                <motion.div
                  className="absolute top-20 right-0 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-2 border-green-100 float-element"
                  style={{ animationDelay: '0s' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📚</span>
                      <div>
                        <p className="font-medium text-gray-800" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Your personal story bank</p>
                        <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>is ready ✨</p>
                      </div>
                    </div>
                </motion.div>

                <motion.div
                  className="absolute top-60 right-20 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-2 border-emerald-100 float-element"
                  style={{ animationDelay: '1s' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-800" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Analysis Complete</p>
                        <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>Voice matched ✓</p>
                      </div>
                    </div>
                </motion.div>

                <motion.div
                  className="absolute bottom-20 right-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-xl border-2 border-green-200 float-element"
                  style={{ animationDelay: '2s' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="text-center">
                    <span className="text-4xl mb-2 block">🎯</span>
                    <p className="font-bold text-gray-800 text-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>STAR Format</p>
                    <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>Perfect every time</p>
                  </div>
                </motion.div>
              </div>
            </SlideUp>
          </div>

          {/* Sample Questions - Horizontal Scroll Pills */}
          <SlideUp>
            <div className="mb-16">
              <p className="text-sm font-semibold text-gray-600 mb-4 text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Try these sample questions:</p>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {SAMPLE_QUESTIONS.map((sampleQ, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSampleQuestionClick(sampleQ.text)}
                    disabled={loading}
                    className="pill-card flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-xl">{sampleQ.emoji}</span>
                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{sampleQ.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </SlideUp>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white/50 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
              How It Works
            </h2>
            <p className="text-center text-gray-600 text-lg mb-12" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>Super simple. Super powerful.</p>
            
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StaggerItem>
                <div className="bg-white rounded-3xl p-8 border-2 border-green-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className="text-5xl mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>1️⃣</div>
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Upload Your Resume</h3>
                  <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    AI analyzes your communication patterns, vocabulary, and writing style.
                  </p>
                </div>
              </StaggerItem>
              
              <StaggerItem>
                <div className="bg-white rounded-3xl p-8 border-2 border-green-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className="text-5xl mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>2️⃣</div>
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Build Your Story Bank</h3>
                  <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    Your experiences → structured STAR/Soar stories organized by competency.
                  </p>
                </div>
              </StaggerItem>
              
              <StaggerItem>
                <div className="bg-white rounded-3xl p-8 border-2 border-green-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className="text-5xl mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>3️⃣</div>
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Generate Personalized Answers</h3>
                  <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    Every answer matches your tone + strengths. Sound authentically you.
                  </p>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </div>

      {/* Value Prop Section - Single Floating Card */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <HoverCard>
              <Card className="card-floating bg-white/80 backdrop-blur-sm border-2 border-green-100 rounded-3xl p-12">
                <h2 className="text-4xl font-extrabold text-center mb-12" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
                  Why Choose BehavAced?
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-4xl">✨</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                      ✨ AI-Powered Personalization
                    </h3>
                    <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      Our AI analyzes your communication style and creates answers that sound authentically like you.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-4xl">📚</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                      📚 Smart Story Bank
                    </h3>
                    <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      Extract and organize your professional stories into a searchable bank for instant retrieval.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-green-100 to-teal-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-4xl">🎯</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                      🎯 Behavioral Interview Focus
                    </h3>
                    <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      Specifically designed for behavioral interviews with STAR/SOAR structure and quantifiable results.
                    </p>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-green-100 flex items-center justify-center gap-4 flex-wrap">
                  <span className="text-sm text-gray-500">✨</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">Matches your authentic voice</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">No generic templates</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">Ready in seconds</span>
                </div>
              </Card>
            </HoverCard>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold text-center mb-12" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
              Loved by Students & Job Seekers
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-100 rounded-3xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🚀</div>
                  <div>
                    <p className="font-bold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                      "I finally aced my Amazon behavioral interview! 🚀"
                    </p>
                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      The personalized answers matched my communication style perfectly. Felt natural and confident.
                    </p>
                    <p className="text-xs text-gray-500 mt-3 italic" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>— Sarah, Software Engineer</p>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-100 rounded-3xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⏱️</div>
                  <div>
                    <p className="font-bold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                      "This saved me HOURS of prep time."
                    </p>
                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      No more staring at blank pages. AI generated perfect STAR-formatted answers in seconds.
                    </p>
                    <p className="text-xs text-gray-500 mt-3 italic" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>— Michael, MBA Student</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Big Gradient CTA Band */}
      <div className="gradient-green-cta py-16 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-6xl opacity-20 float-element">🌿</span>
          <span className="text-6xl opacity-20 float-element ml-20" style={{ animationDelay: '1s' }}>✨</span>
          <span className="text-6xl opacity-20 float-element ml-20" style={{ animationDelay: '2s' }}>📘</span>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
              Ready to Master Your Behavioral Interviews?
            </h2>
            <p className="text-xl text-white/90 mb-8" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
              Get AI answers in your authentic voice.
            </p>
            <motion.button
              onClick={onStartOnboarding}
              className="bg-white text-green-600 rounded-full px-8 py-4 text-lg shadow-2xl flex items-center gap-2 mx-auto"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started - It's Free
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <p className="text-white/80 text-sm mt-4">
              Takes ~3 minutes • No account required • All data processed locally
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-white to-green-50/30 py-12 border-t border-green-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🧠</span>
                  <span className="font-black text-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900 }}>BehavAced</span>
                </div>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  AI-powered behavioral interview coaching
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Product</h4>
                <ul className="space-y-2 text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  <li>Features</li>
                  <li>Pricing</li>
                  <li>Demo</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Company</h4>
                <ul className="space-y-2 text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  <li>About</li>
                  <li>Blog</li>
                  <li>Contact</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Legal</h4>
                <ul className="space-y-2 text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  <li>Privacy</li>
                  <li>Terms</li>
                  <li>Security</li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-green-100 text-center text-sm text-gray-500">
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>© 2024 BehavAced. Made with 💚 for students and job seekers.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

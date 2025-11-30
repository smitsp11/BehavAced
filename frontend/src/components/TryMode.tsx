'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { FadeIn, SlideUp, HoverCard, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { motion } from 'framer-motion'
import { Sparkles, MessageSquare, ArrowRight, Play, Star, Clock, Target, Upload, FileText, Brain, CheckCircle2 } from 'lucide-react'
import { generateDemoAnswer } from '@/lib/api'

interface DemoAnswer {
  success: boolean
  answer: string
  structure: string
  key_points: string[]
  estimated_time_seconds: number
}

const SAMPLE_QUESTIONS = [
  { text: "Tell me about a time you led a team through a challenging project" },
  { text: "Describe a situation where you solved a complex technical problem" },
  { text: "Tell me about a time you had to adapt to a major change at work" },
  { text: "Give me an example of when you turned around a failing project" },
  { text: "Describe a time you had to work with a difficult team member" }
]

export default function TryMode() {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [demoAnswer, setDemoAnswer] = useState<DemoAnswer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const sampleQuestionsRef = useRef<HTMLDivElement>(null)
  
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

  // Infinite scroll wheel effect - seamless looping on manual scroll
  useEffect(() => {
    if (!sampleQuestionsRef.current) return

    const container = sampleQuestionsRef.current
    const singleSetWidth = container.scrollWidth / 2 // Since we duplicate items, half is one full set

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      
      // If scrolled past the first set, reset to equivalent position in first set
      if (scrollLeft >= singleSetWidth) {
        container.scrollLeft = scrollLeft - singleSetWidth
      }
      // If scrolled before start (can happen with momentum scrolling), jump to equivalent position in second set
      else if (scrollLeft < 0) {
        container.scrollLeft = singleSetWidth + scrollLeft
      }
    }

    container.addEventListener('scroll', handleScroll)
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
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
    <div className="min-h-screen relative">
      {/* Hero Section - Clean Single Column Layout with Gradient Background */}
      <div className="relative bg-gradient-to-r from-[#A8F2C8] to-[#FFE2C7]">
      <div className="container mx-auto px-4 pb-[140px] pt-16">
          <div className="max-w-4xl mx-auto mb-16">
            {/* Headline + Input */}
            <FadeIn>
              <div className="space-y-8">
                <div className="space-y-6 text-center">
                  <h1 className="text-[48px] md:text-[64px] leading-[1.1] tracking-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#1a1a1a' }}>
                    Ace Your Behavioural
                    <br />
                    Interviews{' '}
                    <span style={{ fontFamily: "'Allura', cursive", fontStyle: 'italic', fontWeight: 400 }}>
                      with AI
                  </span>
                </h1>
                  <p className="text-base text-gray-700 leading-relaxed whitespace-nowrap mx-auto" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    Upload your resume. Share your style. Get personalized answers in your voice.
                  </p>
                </div>

                {/* Liquid Glass Input Bar - Unified Background */}
                <div className="relative max-w-2xl mx-auto">
                  <motion.div 
                    className="flex items-center rounded-full overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                      backdropFilter: 'blur(18px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(18px) saturate(180%)',
                      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                    whileHover={{
                      boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div 
                      className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide" 
                      style={{ minWidth: 0 }}
                      onWheel={(e) => {
                        // Enable horizontal scrolling with mouse wheel (Shift + wheel or just wheel)
                        if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                          e.preventDefault()
                          e.currentTarget.scrollLeft += e.deltaY || e.deltaX
                        }
                      }}
                    >
                      <input
                        type="text"
                      placeholder="Ask any behavioral question... e.g., 'Tell me about a time you led a team'"
                      value={question}
                        onChange={(e) => {
                          setQuestion(e.target.value)
                          // Auto-scroll to end when typing
                          const container = e.target.parentElement
                          if (container) {
                            requestAnimationFrame(() => {
                              container.scrollLeft = container.scrollWidth - container.clientWidth
                            })
                          }
                        }}
                      onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          if (question.trim() && !loading) {
                            handleGenerateDemo()
                          }
                        }
                      }}
                        className="w-full px-6 py-4 text-base border-none outline-none placeholder:text-gray-500/70 bg-transparent"
                        style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          fontWeight: 400,
                          backgroundColor: 'transparent',
                          background: 'transparent',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          whiteSpace: 'nowrap',
                          minWidth: 'max-content'
                        }}
                        onFocus={(e) => {
                          // Auto-scroll to end when focused if text is long
                          const container = e.target.parentElement
                          if (container) {
                            requestAnimationFrame(() => {
                              if (container.scrollWidth > container.clientWidth) {
                                container.scrollLeft = container.scrollWidth - container.clientWidth
                              }
                            })
                          }
                        }}
                    />
                  </div>
                  <motion.button
                    onClick={handleGenerateDemo}
                    disabled={!question.trim() || loading}
                    className={`
                        relative px-8 py-4 text-base font-semibold
                        flex items-center gap-2 mr-1 group
                      ${!question.trim() || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        transition-all duration-200
                      `}
                      style={{ 
                        fontFamily: 'Inter, sans-serif', 
                        fontWeight: 600,
                        backgroundColor: 'transparent',
                        background: 'transparent',
                        backdropFilter: 'none',
                        WebkitBackdropFilter: 'none',
                        boxShadow: 'none',
                        border: 'none',
                        color: '#1f2937',
                        outline: 'none',
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        margin: 0,
                        padding: '1rem 2rem',
                        borderRadius: 0
                      }}
                    whileHover={!question.trim() || loading ? {} : {
                        scale: 1.02,
                    }}
                    whileTap={!question.trim() || loading ? {} : { scale: 0.98 }}
                    >
                      <div 
                        className="absolute inset-0 rounded-r-full transition-all duration-200 group-hover:opacity-100"
                        style={{
                          background: !question.trim() || loading 
                            ? 'linear-gradient(135deg, rgba(168, 242, 200, 0.2) 0%, rgba(40, 217, 138, 0.15) 100%)'
                            : 'linear-gradient(135deg, rgba(168, 242, 200, 0.3) 0%, rgba(40, 217, 138, 0.25) 100%)',
                          pointerEvents: 'none',
                          zIndex: 0,
                          opacity: 1
                        }}
                        onMouseEnter={(e) => {
                          if (!question.trim() || loading) return;
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168, 242, 200, 0.4) 0%, rgba(40, 217, 138, 0.35) 100%)';
                        }}
                        onMouseLeave={(e) => {
                          if (!question.trim() || loading) return;
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168, 242, 200, 0.3) 0%, rgba(40, 217, 138, 0.25) 100%)';
                        }}
                      />
                      <div className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
                            <span className="hidden sm:inline">Generating...</span>
                      </>
                    ) : (
                      <>
                            <Play className="w-4 h-4" fill="currentColor" />
                            <span className="hidden sm:inline">Generate</span>
                      </>
                    )}
                      </div>
                  </motion.button>
                  </motion.div>
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
                          <Star className="w-6 h-6 text-green-500 fill-green-500" />
                          <h3 className="text-[22px] font-bold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Demo Answer</h3>
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
                        <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                          {demoAnswer.answer}
                        </p>
                      </div>
                      {demoAnswer.key_points && demoAnswer.key_points.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-[22px] font-bold mb-2 text-gray-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Key Points:</h4>
                          <ul className="space-y-1 text-base text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
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

          {/* Sample Questions - Integrated into Hero */}
          <FadeIn>
            <div className="mt-12">
              <p className="text-base font-medium text-gray-600 mb-4 text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Try these sample questions:</p>
                <div 
                  ref={sampleQuestionsRef}
                  className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                {SAMPLE_QUESTIONS.map((sampleQ, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSampleQuestionClick(sampleQ.text)}
                    disabled={loading}
                    className="pill-card flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                      <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, letterSpacing: '-0.01em' }}>{sampleQ.text}</span>
                    </motion.button>
                  ))}
                  {/* Duplicate items for seamless loop */}
                  {SAMPLE_QUESTIONS.map((sampleQ, index) => (
                    <motion.button
                      key={`duplicate-${index}`}
                      onClick={() => handleSampleQuestionClick(sampleQ.text)}
                      disabled={loading}
                      className="pill-card flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, letterSpacing: '-0.01em' }}>{sampleQ.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </FadeIn>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="pt-[160px] pb-[160px]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-[48px] md:text-[64px] font-bold text-center mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
              How It Works
            </h2>
            <p className="text-center text-gray-700 text-xl md:text-2xl mb-20 max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
              Super simple. Super powerful.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              {/* Step 1 */}
              <div className="px-8 py-12 text-center relative">
                <div className="text-[80px] md:text-[120px] font-semibold mb-6 leading-none" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
                  1
                </div>
                <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#1a1a1a' }}>
                  Upload Your Resume
                </h3>
                <p className="text-base text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  AI analyzes your writing style and communication patterns.
                </p>
                {/* Vertical divider */}
                <div className="hidden md:block absolute top-0 right-0 bottom-0 w-[1px] bg-[#E6E6E6]" />
              </div>
              
              {/* Step 2 */}
              <div className="px-8 py-12 text-center relative">
                <div className="text-[80px] md:text-[120px] font-semibold mb-6 leading-none" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
                  2
                </div>
                <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#1a1a1a' }}>
                  Build Your Story Bank
                </h3>
                <p className="text-base text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Organize experiences into structured STAR stories.
                </p>
                {/* Vertical divider */}
                <div className="hidden md:block absolute top-0 right-0 bottom-0 w-[1px] bg-[#E6E6E6]" />
              </div>
              
              {/* Step 3 */}
              <div className="px-8 py-12 text-center relative">
                <div className="text-[80px] md:text-[120px] font-semibold mb-6 leading-none" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
                  3
                </div>
                <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#1a1a1a' }}>
                  Personalized Answers
                </h3>
                <p className="text-base text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Voice-matched, structured responses in your authentic style.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slogan Section */}
      <div className="pt-[120px] pb-[120px]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[48px] md:text-[64px] leading-[1.1] tracking-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#1a1a1a' }}>
              Where experience
              <br />
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>meets </span>
              <span style={{ fontFamily: "'Allura', cursive", fontStyle: 'italic', fontWeight: 400 }}>excellence</span>
            </h2>
          </div>
        </div>
      </div>

      {/* CTA Section - Dark Rounded Container with Two Buttons */}
      <div className="pt-[120px] pb-[120px]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Dark Rounded Rectangle Container */}
            <div 
              className="rounded-3xl p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8"
              style={{
                background: '#0F1011'
              }}
            >
              {/* Left: Headline */}
              <div className="flex-1">
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-medium text-white leading-tight mb-2"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  Experience AI That Sounds Like You.
                </h2>
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-medium text-white leading-tight"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  Start Preparing With Your Authentic Voice.
                </h2>
              </div>

              {/* Right: Two Pill Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
                {/* Filled Button */}
                <motion.button
                  onClick={() => router.push('/onboarding')}
                  className="bg-white text-gray-900 rounded-full px-8 py-5 text-lg font-semibold flex items-center gap-3 hover:bg-gray-100 transition-all duration-300"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Try It Now
                  <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </motion.button>

                {/* Outlined Button */}
                <motion.button
                  onClick={() => {
                    const element = document.getElementById('how-it-works')
                    element?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="border-2 border-white/30 text-white rounded-full px-8 py-5 text-lg font-semibold flex items-center gap-3 hover:border-white/50 hover:bg-white/5 transition-all duration-300"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  See How It Works
                  <div className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </motion.button>
              </div>
                </div>
          </div>
        </div>
      </div>

      {/* Value Prop Section - Floating Cards */}
      <div className="pt-[60px] pb-[140px]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2 leading-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, background: 'linear-gradient(135deg, #28d98a 0%, #6fffc5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: '1.1', paddingBottom: '4px' }}>
                  +200
                </div>
                <p className="text-sm md:text-base text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  answers generated
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2 leading-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, background: 'linear-gradient(135deg, #28d98a 0%, #6fffc5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: '1.1', paddingBottom: '4px' }}>
                  +150
                </div>
                <p className="text-sm md:text-base text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  students helped
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2 leading-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, background: 'linear-gradient(135deg, #28d98a 0%, #6fffc5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: '1.1', paddingBottom: '4px' }}>
                  95%
                </div>
                <p className="text-sm md:text-base text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  report increased confidence
                </p>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 tracking-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
              Your Interview Prep, Reimagined With AI
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Feature Card 1 */}
              <motion.div
                className="bg-white rounded-2xl p-8 text-center border border-gray-100 transition-all duration-300 hover:-translate-y-1"
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                }}
                whileHover={{
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-green-50 to-emerald-50">
                  <span className="text-3xl">✨</span>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                  AI That Sounds Like You
                </h3>
                <p className="text-base text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Our AI analyzes your communication style and creates answers that sound authentically like you.
                </p>
              </motion.div>

              {/* Feature Card 2 */}
              <motion.div
                className="bg-white rounded-2xl p-8 text-center border border-gray-100 transition-all duration-300 hover:-translate-y-1"
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                }}
                whileHover={{
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-green-50 to-emerald-50">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                  Your Personal Story Bank
                </h3>
                <p className="text-base text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Extract and organize your professional stories into a searchable bank for instant retrieval.
                </p>
              </motion.div>

              {/* Feature Card 3 */}
              <motion.div
                className="bg-white rounded-2xl p-8 text-center border border-gray-100 transition-all duration-300 hover:-translate-y-1"
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                }}
                whileHover={{
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-green-50 to-emerald-50">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                  Made for Interviews
                </h3>
                <p className="text-base text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Specifically designed for behavioral interviews with STAR/SOAR structure and quantifiable results.
                </p>
              </motion.div>
            </div>

            {/* Bullet Points as Pills */}
            <div className="flex items-center justify-center gap-3 flex-wrap mt-8">
              <motion.div
                className="bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm shadow-md flex items-center gap-2"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px' }}
                whileHover={{ scale: 1.05 }}
              >
                <span>✨</span>
                <span className="text-gray-700">Matches your authentic voice</span>
              </motion.div>
              <motion.div
                className="bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm shadow-md flex items-center gap-2"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px' }}
                whileHover={{ scale: 1.05 }}
              >
                <span>⚡</span>
                <span className="text-gray-700">No generic templates</span>
              </motion.div>
              <motion.div
                className="bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm shadow-md flex items-center gap-2"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px' }}
                whileHover={{ scale: 1.05 }}
              >
                <span>🔍</span>
                <span className="text-gray-700">Ready in seconds</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section - Dark Background */}
      <div className="pt-[120px] pb-[140px] bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
              Loved by Students & Job Seekers
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              {/* Big Testimonial Card - Left */}
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-xl">
                <div className="flex items-start gap-6">
                  {/* Photo/Silhouette */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-green-200 to-emerald-200 flex items-center justify-center text-2xl font-bold text-green-700" style={{ fontFamily: "'Playfair Display', serif" }}>
                        S
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 leading-relaxed" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                      "I finally aced my Amazon behavioral interview!"
                    </p>
                    <p className="text-base text-gray-600 mb-6 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      The personalized answers matched my communication style perfectly. Felt natural and confident throughout the entire process.
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Sarah</p>
                      <span className="text-gray-400">•</span>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>Software Engineer</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats Card - Right */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 md:p-10 shadow-xl border border-green-100">
                <div className="h-full flex flex-col justify-center">
                  <div className="text-center mb-6">
                    <div className="text-5xl md:text-6xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, background: 'linear-gradient(135deg, #28d98a 0%, #6fffc5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      95%
                    </div>
                    <p className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                      Report Increased Confidence
                    </p>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <span className="text-lg">✓</span>
                      </div>
                      <p className="text-base text-gray-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                        Average 3x faster prep time
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <span className="text-lg">✓</span>
                      </div>
                      <p className="text-base text-gray-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                        Voice-matched responses
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <span className="text-lg">✓</span>
                      </div>
                      <p className="text-base text-gray-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                        STAR format guaranteed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-green-100/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🧠</span>
                  <span className="font-black text-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900 }}>BehavAced</span>
                </div>
                <p className="text-base text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  AI-powered behavioral interview coaching
                </p>
              </div>
              <div>
                <h3 className="text-[22px] font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Product</h3>
                <ul className="space-y-2 text-base text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  <li>Features</li>
                  <li>Pricing</li>
                  <li>Demo</li>
                </ul>
              </div>
              <div>
                <h3 className="text-[22px] font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Company</h3>
                <ul className="space-y-2 text-base text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  <li>About</li>
                  <li>Blog</li>
                  <li>Contact</li>
                </ul>
              </div>
              <div>
                <h3 className="text-[22px] font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Legal</h3>
                <ul className="space-y-2 text-base text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  <li>Privacy</li>
                  <li>Terms</li>
                  <li>Security</li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-green-100 text-center text-sm text-gray-500">
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px' }}>© 2025 BehavAced. Made with 💚 for students and job seekers.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

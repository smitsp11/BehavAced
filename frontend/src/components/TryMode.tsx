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
                  <h1 className="text-[48px] md:text-[64px] leading-[1.1] tracking-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                    Ace Your Behavioural Interviews{' '}
                    <span className="text-[52px] md:text-[68px]" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}>
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
      <div className="pt-[120px] pb-[140px]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-center mb-12" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
              How It Works
            </h2>
            <p className="text-center text-gray-700 text-lg mb-12" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>Super simple. Super powerful.</p>
            
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StaggerItem>
                <div className="bg-white rounded-3xl p-8 border-2 border-green-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className="flex items-center justify-center w-16 h-16 mb-6 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full shadow-md">
                    <span className="text-3xl font-playfair text-green-700" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>1</span>
                  </div>
                  <h3 className="text-[22px] font-bold mb-3 text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Upload Your Resume</h3>
                  <p className="text-base text-gray-600 leading-relaxed text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    AI analyzes your communication patterns, vocabulary, and writing style.
                  </p>
                </div>
              </StaggerItem>
              
              <StaggerItem>
                <div className="bg-white rounded-3xl p-8 border-2 border-green-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className="flex items-center justify-center w-16 h-16 mb-6 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full shadow-md">
                    <span className="text-3xl font-playfair text-green-700" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>2</span>
                  </div>
                  <h3 className="text-[22px] font-bold mb-3 text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Build Your Story Bank</h3>
                  <p className="text-base text-gray-600 leading-relaxed text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    Your experiences → structured STAR/Soar stories organized by competency.
                  </p>
                </div>
              </StaggerItem>
              
              <StaggerItem>
                <div className="bg-white rounded-3xl p-8 border-2 border-green-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className="flex items-center justify-center w-16 h-16 mb-6 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full shadow-md">
                    <span className="text-3xl font-playfair text-green-700" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>3</span>
                  </div>
                  <h3 className="text-[22px] font-bold mb-3 text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Personalized Answers</h3>
                  <p className="text-base text-gray-600 leading-relaxed text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    Every answer matches your tone + strengths. Sound authentically you.
                  </p>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </div>

      {/* Value Prop Section - Floating Cards */}
      <div className="pt-[120px] pb-[140px]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-extrabold text-center mb-14 tracking-tight" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, maxWidth: '80%', marginLeft: 'auto', marginRight: 'auto' }}>
              Why Choose BehavAced?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Feature Card 1 */}
              <motion.div
                className="bg-gradient-to-br from-green-50/80 to-emerald-50/60 backdrop-blur-sm border border-green-200/40 rounded-3xl p-8 text-center shadow-[0_12px_40px_rgba(0,180,90,0.15)] hover:shadow-[0_16px_50px_rgba(0,180,90,0.2)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="bg-gradient-to-br from-green-200 via-emerald-200 to-lime-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_8px_30px_rgba(120,255,190,0.35)] relative overflow-hidden"
                  whileHover={{ rotate: 1, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.span
                    className="text-5xl relative z-10"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ✨
                  </motion.span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
                </motion.div>
                <h3 className="text-[22px] font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                  AI That Sounds Like You
                </h3>
                <div className="w-12 h-1 bg-gradient-to-r from-green-300 to-emerald-300 mx-auto mb-6 rounded-full shadow-[0_0_10px_rgba(120,255,190,0.5)]" />
                <p className="text-base text-gray-700 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Our AI analyzes your communication style and creates answers that sound authentically like you.
                </p>
              </motion.div>

              {/* Feature Card 2 */}
              <motion.div
                className="bg-gradient-to-br from-green-50/80 to-emerald-50/60 backdrop-blur-sm border border-green-200/40 rounded-3xl p-8 text-center shadow-[0_12px_40px_rgba(0,180,90,0.15)] hover:shadow-[0_16px_50px_rgba(0,180,90,0.2)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="bg-gradient-to-br from-green-200 via-emerald-200 to-lime-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_8px_30px_rgba(120,255,190,0.35)] relative overflow-hidden"
                  whileHover={{ rotate: 1, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.span
                    className="text-5xl relative z-10"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  >
                    📚
                  </motion.span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
                </motion.div>
                <h3 className="text-[22px] font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                  Your Personal Story Bank
                </h3>
                <div className="w-12 h-1 bg-gradient-to-r from-green-300 to-emerald-300 mx-auto mb-6 rounded-full shadow-[0_0_10px_rgba(120,255,190,0.5)]" />
                <p className="text-base text-gray-700 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Extract and organize your professional stories into a searchable bank for instant retrieval.
                </p>
              </motion.div>

              {/* Feature Card 3 */}
              <motion.div
                className="bg-gradient-to-br from-green-50/80 to-emerald-50/60 backdrop-blur-sm border border-green-200/40 rounded-3xl p-8 text-center shadow-[0_12px_40px_rgba(0,180,90,0.15)] hover:shadow-[0_16px_50px_rgba(0,180,90,0.2)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="bg-gradient-to-br from-green-200 via-emerald-200 to-lime-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_8px_30px_rgba(120,255,190,0.35)] relative overflow-hidden"
                  whileHover={{ rotate: 1, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.span
                    className="text-5xl relative z-10"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                  >
                    🎯
                  </motion.span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
                </motion.div>
                <h3 className="text-[22px] font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                  Made for Interviews
                </h3>
                <div className="w-12 h-1 bg-gradient-to-r from-green-300 to-emerald-300 mx-auto mb-6 rounded-full shadow-[0_0_10px_rgba(120,255,190,0.5)]" />
                <p className="text-base text-gray-700 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
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

      {/* Testimonial Section */}
      <div className="pt-[120px] pb-[140px]">
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
                    <p className="text-[22px] font-bold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                      "I finally aced my Amazon behavioral interview! 🚀"
                    </p>
                    <p className="text-base text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      The personalized answers matched my communication style perfectly. Felt natural and confident.
                    </p>
                    <p className="text-sm text-gray-500 mt-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>— Sarah, Software Engineer</p>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-100 rounded-3xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⏱️</div>
                  <div>
                    <p className="text-[22px] font-bold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                      "This saved me HOURS of prep time."
                    </p>
                    <p className="text-base text-gray-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      No more staring at blank pages. AI generated perfect STAR-formatted answers in seconds.
                    </p>
                    <p className="text-sm text-gray-500 mt-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>— Michael, MBA Student</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Big Gradient CTA Band */}
      <div className="pt-[120px] pb-[140px] relative overflow-hidden">
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Floating Emoji Above Title */}
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.span
                className="text-4xl block"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                ✨
              </motion.span>
            </motion.div>

            {/* Improved Headline */}
            <motion.h2
              className="text-4xl font-extrabold text-gray-800 mb-4 leading-tight tracking-tight"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Ready to Master Your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#28d98a] to-[#6fffc5] font-bold">
                Behavioral Interviews
              </span>
              ?
            </motion.h2>
            
            <motion.p
              className="text-lg text-gray-700 mb-8"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Get AI answers in your authentic voice.
            </motion.p>

            {/* Improved CTA Button */}
            <motion.button
              onClick={() => router.push('/onboarding')}
              className="bg-gradient-to-r from-[#7fffd2] to-[#28d98a] text-white rounded-full px-10 py-5 text-lg font-semibold shadow-[0_8px_25px_rgba(40,217,138,0.35)] flex items-center gap-2 mx-auto hover:shadow-[0_12px_35px_rgba(40,217,138,0.45)] transition-all duration-300"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started - It's Free
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.button>

            {/* Improved Subtitle as Pills */}
            <motion.div
              className="flex items-center justify-center gap-3 flex-wrap mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className="px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm shadow-sm text-sm text-gray-700 font-medium" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px' }}>
                • Takes 3 minutes
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm shadow-sm text-sm text-gray-700 font-medium" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px' }}>
                • No account required
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm shadow-sm text-sm text-gray-700 font-medium" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px' }}>
                • Local processing
              </span>
            </motion.div>
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

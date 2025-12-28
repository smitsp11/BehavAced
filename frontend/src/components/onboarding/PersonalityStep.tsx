'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { ArrowRight, ArrowLeft, Brain } from 'lucide-react'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { createPersonalitySnapshot } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'

interface PersonalityStepProps {
  onNext: () => void
  onPrev: () => void
}

const TOTAL_STEPS = 5

// Keywords to highlight in emerald green
const KEYWORDS = [
  'analytical', 'detail-oriented', 'structured', 'methodical', 'proactive',
  'direct', 'concise', 'collaborative', 'data-driven', 'leadership',
  'problem-solving', 'adaptability', 'communication', 'impatient', 'delegation',
  'time management', 'public speaking', 'conflict', 'teamwork', 'innovation'
]

const STEP_INFO = [
  {
    number: '01',
    title: 'Identity',
    description: 'Understanding your core work style helps us match your authentic voice.'
  },
  {
    number: '02',
    title: 'Voice',
    description: 'How you communicate reveals your natural speaking patterns.'
  },
  {
    number: '03',
    title: 'Experience',
    description: 'Your strengths shape the stories we\'ll help you tell.'
  },
  {
    number: '04',
    title: 'Analysis',
    description: 'Growth areas help us craft balanced, honest responses.'
  },
  {
    number: '05',
    title: 'Refinement',
    description: 'Optional writing sample for deeper voice matching.'
  }
]

export default function PersonalityStep({ onNext, onPrev }: PersonalityStepProps) {
  const { 
    personalityData, 
    setPersonalityData, 
    userId,
    setBackgroundTaskStatus 
  } = useOnboardingStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    work_style: personalityData?.work_style || '',
    communication: personalityData?.communication || '',
    strengths: personalityData?.strengths || '',
    challenges: personalityData?.challenges || '',
    writing_sample: personalityData?.writing_sample || '',
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Highlight keywords in text
  const highlightKeywords = (text: string) => {
    if (!text) return text
    let highlighted = text
    KEYWORDS.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      highlighted = highlighted.replace(regex, (match) => 
        `<span class="text-emerald-600 font-semibold">${match}</span>`
      )
    })
    return highlighted
  }

  // Show analyzing indicator when user types
  useEffect(() => {
    const currentField = getCurrentField()
    if (currentField && formData[currentField as keyof typeof formData].length > 10) {
      setIsAnalyzing(true)
      const timer = setTimeout(() => setIsAnalyzing(false), 2000)
      return () => clearTimeout(timer)
    } else {
      setIsAnalyzing(false)
    }
  }, [formData, currentStep])

  const getCurrentField = () => {
    switch (currentStep) {
      case 1: return 'work_style'
      case 2: return 'communication'
      case 3: return 'strengths'
      case 4: return 'challenges'
      case 5: return 'writing_sample'
      default: return null
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1)
      // Focus textarea on next step
      setTimeout(() => textareaRef.current?.focus(), 100)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      setTimeout(() => textareaRef.current?.focus(), 100)
    } else {
      onPrev()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (canProceed()) {
          handleNext()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentStep, formData])

  const handleSubmit = () => {
    if (!formData.work_style.trim() || !formData.communication.trim() || !formData.strengths.trim() || !formData.challenges.trim()) {
      return
    }

    setPersonalityData(formData)
    
    if (userId) {
      startPersonalitySnapshotBackground(formData)
    }
    
    onNext()
  }

  const startPersonalitySnapshotBackground = async (data: typeof formData) => {
    setBackgroundTaskStatus('personalitySnapshot', 'processing')
    
    try {
      const responses = {
        work_style: data.work_style,
        communication: data.communication,
        strengths: data.strengths,
        challenges: data.challenges,
      }
      
      createPersonalitySnapshot(userId!, responses, data.writing_sample)
        .then(() => {
          setBackgroundTaskStatus('personalitySnapshot', 'completed')
        })
        .catch((error: any) => {
          console.error('Background personality snapshot failed:', error)
          setBackgroundTaskStatus('personalitySnapshot', 'error', error.message || 'Failed to create personality snapshot')
        })
    } catch (error: any) {
      console.error('Error starting personality snapshot:', error)
      setBackgroundTaskStatus('personalitySnapshot', 'error', error.message || 'Failed to start personality snapshot')
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.work_style.trim().length > 0
      case 2:
        return formData.communication.trim().length > 0
      case 3:
        return formData.strengths.trim().length > 0
      case 4:
        return formData.challenges.trim().length > 0
      default:
        return true
    }
  }

  const getQuestion = () => {
    switch (currentStep) {
      case 1:
        return "How would you describe your work style?"
      case 2:
        return "How do you typically communicate in professional settings?"
      case 3:
        return "What are your key strengths?"
      case 4:
        return "What areas are you working to improve?"
      case 5:
        return "Optional: Writing sample (helps match your voice)"
      default:
        return ""
    }
  }

  const getPlaceholder = () => {
    switch (currentStep) {
      case 1:
        return "e.g., I'm analytical and detail-oriented, preferring structured approaches with clear goals and metrics..."
      case 2:
        return "e.g., I'm direct and concise, focusing on key points and actionable outcomes..."
      case 3:
        return "e.g., Problem-solving, leadership, adaptability, attention to detail..."
      case 4:
        return "e.g., Public speaking, delegation, time management..."
      case 5:
        return "Paste any professional writing - email, report, presentation, blog post..."
      default:
        return ""
    }
  }

  const getCurrentValue = () => {
    switch (currentStep) {
      case 1:
        return formData.work_style
      case 2:
        return formData.communication
      case 3:
        return formData.strengths
      case 4:
        return formData.challenges
      case 5:
        return formData.writing_sample
      default:
        return ""
    }
  }

  const handleInputChange = (value: string) => {
    switch (currentStep) {
      case 1:
        handleChange('work_style', value)
        break
      case 2:
        handleChange('communication', value)
        break
      case 3:
        handleChange('strengths', value)
        break
      case 4:
        handleChange('challenges', value)
        break
      case 5:
        handleChange('writing_sample', value)
        break
    }
  }

  const slideUpVariants = {
    enter: {
      y: 50,
      opacity: 0
    },
    center: {
      y: 0,
      opacity: 1
    },
    exit: {
      y: -50,
      opacity: 0
    }
  }

  return (
    <div className="w-full h-full bg-stone-50 flex">
      {/* LEFT SIDEBAR - Coach's Guide (30%) */}
      <div className="w-[30%] border-r border-stone-200 p-8 flex flex-col">
        <div className="mb-8">
          <h2 className="font-serif text-2xl text-stone-900 mb-2">The Executive Diagnostic</h2>
          <p className="font-sans text-sm text-stone-600 leading-relaxed">
            A private consultation to understand your authentic communication style.
          </p>
        </div>

        {/* Vertical Step Counter */}
        <div className="flex-1 space-y-6">
          {STEP_INFO.map((step, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 transition-all duration-300 ${
                index + 1 === currentStep
                  ? 'opacity-100'
                  : index + 1 < currentStep
                  ? 'opacity-60'
                  : 'opacity-40'
              }`}
            >
              <div className="flex-shrink-0">
                <span
                  className={`font-serif italic font-light text-3xl block ${
                    index + 1 === currentStep
                      ? 'text-black'
                      : index + 1 < currentStep
                      ? 'text-stone-400'
                      : 'text-stone-300'
                  }`}
                >
                  {step.number}
                </span>
              </div>
              <div className="flex-1 pt-1">
                <h3
                  className={`font-serif text-lg mb-1 ${
                    index + 1 === currentStep
                      ? 'text-stone-900'
                      : 'text-stone-600'
                  }`}
                >
                  {step.title}
                </h3>
                <p className="font-sans text-xs text-stone-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE - Writing Desk (70%) */}
      <div className="flex-1 p-12 flex flex-col">
        {/* Question - Massive Serif Headline */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={slideUpVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="mb-8"
          >
            <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-4 leading-tight">
              {getQuestion()}
              {currentStep <= 4 && <span className="text-emerald-600 ml-2">*</span>}
            </h1>
          </motion.div>
        </AnimatePresence>

        {/* Analyzing Indicator */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 text-sm text-emerald-600"
          >
            <Brain className="w-4 h-4 animate-pulse" />
            <span className="font-sans">Analyzing communication pattern...</span>
          </motion.div>
        )}

        {/* Ghost Input - Minimal Underline Style */}
        <div className="flex-1 flex flex-col">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={getCurrentValue()}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={getPlaceholder()}
              rows={12}
              className="w-full h-full resize-none bg-transparent border-0 border-b-2 border-stone-300 focus:border-emerald-500 focus:ring-0 rounded-none p-0 text-lg font-sans text-stone-900 placeholder:text-stone-400 transition-all duration-300"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                lineHeight: '1.8',
                boxShadow: 'none',
                outline: 'none'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  if (canProceed()) {
                    handleNext()
                  }
                }
              }}
            />
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <div>
              {currentStep > 1 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="px-6 py-3 border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {canProceed() && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-stone-500 font-sans"
                >
                  Press <kbd className="px-2 py-1 bg-stone-100 rounded text-xs">⌘ Enter</kbd> to continue
                </motion.p>
              )}
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-stone-900 text-white px-8 py-3 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              >
                {currentStep === TOTAL_STEPS ? 'Continue' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

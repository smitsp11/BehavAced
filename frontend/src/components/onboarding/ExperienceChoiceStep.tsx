'use client'

import { Button } from '@/components/ui/Button'
import { UploadCloud, PenLine, ArrowRight, ArrowLeft } from 'lucide-react'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { motion } from 'framer-motion'

interface ExperienceChoiceStepProps {
  onNext: () => void
  onPrev: () => void
}

export default function ExperienceChoiceStep({ onNext, onPrev }: ExperienceChoiceStepProps) {
  const { setExperienceChoice } = useOnboardingStore()

  const handleSelectPath = (path: 'resume' | 'manual') => {
    setExperienceChoice(path)
    // Immediately transition to next step
    onNext()
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col justify-center min-h-[60vh] px-12 md:px-24">
      
      {/* The Big Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-16"
      >
        <h2 className="font-serif text-5xl md:text-6xl text-stone-900 leading-tight">
          How should we build <br />
          <span className="italic text-stone-400">your profile?</span>
        </h2>
      </motion.div>

      {/* The Options (Vertical Stack) */}
      <div className="space-y-6 mb-12">
        
        {/* OPTION A: UPLOAD */}
        <motion.button 
          onClick={() => handleSelectPath('resume')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="group w-full text-left p-8 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-stone-200/50 border border-transparent hover:border-stone-100 transition-all duration-300 flex items-start gap-6"
        >
          {/* Icon Circle */}
          <div className="w-16 h-16 rounded-full bg-stone-100 group-hover:bg-emerald-100 flex items-center justify-center shrink-0 transition-colors">
            <UploadCloud className="w-8 h-8 text-stone-500 group-hover:text-emerald-700" strokeWidth={1.5} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-serif text-3xl text-stone-900 group-hover:text-emerald-900 transition-colors">
                Auto-Extract Resume
              </h3>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-full">
                Fastest
              </span>
            </div>
            <p className="font-sans text-stone-500 text-lg group-hover:text-stone-600 leading-relaxed max-w-md">
              We'll parse your PDF to automatically extract skills, roles, and key achievements.
            </p>
          </div>

          {/* Arrow (Visible on Hover) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
            <ArrowRight className="w-8 h-8 text-stone-300 group-hover:text-emerald-500" />
          </div>
        </motion.button>

        {/* OPTION B: MANUAL */}
        <motion.button 
          onClick={() => handleSelectPath('manual')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="group w-full text-left p-8 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-stone-200/50 border border-transparent hover:border-stone-100 transition-all duration-300 flex items-start gap-6"
        >
          <div className="w-16 h-16 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center shrink-0 transition-colors">
            <PenLine className="w-8 h-8 text-stone-500 group-hover:text-stone-800" strokeWidth={1.5} />
          </div>

          <div className="flex-1">
            <h3 className="font-serif text-3xl text-stone-900 group-hover:text-stone-800 transition-colors mb-1">
              Guided Manual Entry
            </h3>
            <p className="font-sans text-stone-500 text-lg group-hover:text-stone-600 leading-relaxed max-w-md">
              Build your profile step-by-step using our behavioral story framework.
            </p>
          </div>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
            <ArrowRight className="w-8 h-8 text-stone-300" />
          </div>
        </motion.button>

      </div>

      {/* Navigation - Back Button Only */}
      <div className="flex items-center">
        <Button
          onClick={onPrev}
          variant="outline"
          className="px-6 py-3 border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  )
}

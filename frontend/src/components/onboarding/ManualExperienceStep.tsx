'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Plus, X, Calendar, MapPin, ArrowRight, ArrowLeft } from 'lucide-react'
import { useOnboardingStore, ManualExperienceData } from '@/lib/stores/onboardingStore'
import { motion } from 'framer-motion'

interface ManualExperienceStepProps {
  onNext: () => void
  onPrev: () => void
}

export default function ManualExperienceStep({ onNext, onPrev }: ManualExperienceStepProps) {
  const { setManualExperienceData, setUserId } = useOnboardingStore()
  const [roleTitle, setRoleTitle] = useState('')
  const [company, setCompany] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [location, setLocation] = useState('')
  const [achievements, setAchievements] = useState([''])

  const addAchievement = () => {
    setAchievements([...achievements, ''])
  }

  const removeAchievement = (index: number) => {
    if (achievements.length > 1) {
      setAchievements(achievements.filter((_, i) => i !== index))
    }
  }

  const updateAchievement = (index: number, value: string) => {
    const newAchievements = [...achievements]
    newAchievements[index] = value
    setAchievements(newAchievements)
  }

  const handleSaveAndContinue = () => {
    if (!roleTitle.trim() || !company.trim()) {
      return
    }

    // Create experience entry
    const experienceEntry = {
      role_title: roleTitle,
      company: company,
      location: location,
      start_date: dateRange.split('—')[0]?.trim() || '',
      end_date: dateRange.split('—')[1]?.trim() || '',
      description: '',
      achievements: achievements.filter(a => a.trim()),
      skills_used: []
    }

    const manualData: ManualExperienceData = {
      experiences: [experienceEntry],
      additional_skills: []
    }

    setManualExperienceData(manualData)

    // Generate a UUID-like user ID if we don't have one
    const userId = crypto.randomUUID()
    setUserId(userId)

    onNext()
  }

  const canContinue = roleTitle.trim().length > 0 && company.trim().length > 0

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col overflow-y-auto px-12 md:px-24 py-8">
      
      {/* The Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h2 className="font-serif text-4xl md:text-5xl text-stone-900 leading-tight mb-2">
          Where did you make <br />
          <span className="italic text-stone-400">your mark?</span>
        </h2>
        <p className="font-sans text-stone-500 text-base">
          Focus on your most recent or relevant role.
        </p>
      </motion.div>

      {/* The "Mad Libs" Inputs (Role & Company) */}
      <div className="space-y-4 mb-6">
        
        {/* Role & Company Group */}
        <div className="space-y-4">
          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-emerald-600 transition-colors font-sans">
              I worked as a...
            </label>
            <input 
              type="text" 
              placeholder="Senior Product Manager"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full bg-transparent text-3xl md:text-4xl font-serif text-stone-900 placeholder:text-stone-200 border-b-2 border-stone-200 focus:border-stone-900 focus:outline-none py-3 transition-all focus:ring-0"
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-emerald-600 transition-colors font-sans">
              At company...
            </label>
            <input 
              type="text" 
              placeholder="Tech Corp Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-transparent text-3xl md:text-4xl font-serif text-stone-900 placeholder:text-stone-200 border-b-2 border-stone-200 focus:border-stone-900 focus:outline-none py-3 transition-all focus:ring-0"
            />
          </div>
        </div>

        {/* The Metadata (Dates & Location) - Subtle Row */}
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3 text-stone-400 focus-within:text-stone-900 transition-colors group">
            <Calendar className="w-4 h-4" />
            <input 
              type="text" 
              placeholder="2020 — Present"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-b border-stone-200 focus:border-stone-900 focus:outline-none py-1 w-40 text-base font-sans focus:ring-0"
            />
          </div>
          <div className="flex items-center gap-3 text-stone-400 focus-within:text-stone-900 transition-colors group">
            <MapPin className="w-4 h-4" />
            <input 
              type="text" 
              placeholder="New York / Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent border-b border-stone-200 focus:border-stone-900 focus:outline-none py-1 w-48 text-base font-sans focus:ring-0"
            />
          </div>
        </div>

      </div>

      {/* The "Wins" Section (Editorial List) */}
      <div className="space-y-3 mb-6">
        <h3 className="font-serif text-2xl text-stone-900">
          Key Achievements
        </h3>
        <p className="text-stone-400 text-sm mb-3 font-sans">
          What did you build, lead, or improve?
        </p>

        {achievements.map((achievement, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start gap-4 group"
          >
            <span className="mt-4 w-2 h-2 rounded-full bg-emerald-200 group-focus-within:bg-emerald-500 transition-colors flex-shrink-0" />
            <textarea
              rows={2}
              placeholder="e.g. Led a team of 5 to reduce latency by 40%..."
              value={achievement}
              onChange={(e) => updateAchievement(index, e.target.value)}
              className="flex-1 bg-transparent text-lg text-stone-600 placeholder:text-stone-200 border-b border-stone-100 focus:border-stone-300 focus:outline-none py-2 resize-none font-sans focus:ring-0"
            />
            {index > 0 && (
              <button
                onClick={() => removeAchievement(index)}
                className="mt-3 text-stone-300 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        ))}

        <button 
          onClick={addAchievement}
          className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-xs hover:text-emerald-800 transition-colors mt-4 font-sans"
        >
          <Plus className="w-4 h-4" /> Add another achievement
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pb-8">
        <Button
          onClick={onPrev}
          variant="outline"
          className="px-6 py-3 border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-4">
          {canContinue && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-stone-500 font-sans"
            >
              Press <kbd className="px-2 py-1 bg-stone-100 rounded text-xs">⌘ Enter</kbd> to continue
            </motion.p>
          )}
          <Button
            onClick={handleSaveAndContinue}
            disabled={!canContinue}
            className="bg-stone-900 text-white px-8 py-3 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                if (canContinue) {
                  handleSaveAndContinue()
                }
              }
            }}
          >
            Save & Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

    </div>
  )
}

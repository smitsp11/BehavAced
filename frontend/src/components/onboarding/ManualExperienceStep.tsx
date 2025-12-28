'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Plus, X, Calendar, MapPin, ArrowRight, ArrowLeft, Briefcase } from 'lucide-react'
import { useOnboardingStore, ManualExperienceData } from '@/lib/stores/onboardingStore'
import { motion } from 'framer-motion'

interface ManualExperienceStepProps {
  onNext: () => void
  onPrev: () => void
}

interface SavedRole {
  role_title: string
  company: string
  location: string
  start_date: string
  end_date: string
  achievements: string[]
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const getYears = () => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear; i >= currentYear - 50; i--) {
    years.push(i)
  }
  return years
}

export default function ManualExperienceStep({ onNext, onPrev }: ManualExperienceStepProps) {
  const { setManualExperienceData, setUserId } = useOnboardingStore()
  
  // Store the list of completed roles
  const [savedRoles, setSavedRoles] = useState<SavedRole[]>([])
  
  // Store the current form data
  const [roleTitle, setRoleTitle] = useState('')
  const [company, setCompany] = useState('')
  const [startMonth, setStartMonth] = useState('')
  const [startYear, setStartYear] = useState('')
  const [endMonth, setEndMonth] = useState('')
  const [endYear, setEndYear] = useState('')
  const [isPresent, setIsPresent] = useState(false)
  const [location, setLocation] = useState('')
  const [achievements, setAchievements] = useState([''])
  
  const years = getYears()

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

  const resetForm = () => {
    setRoleTitle('')
    setCompany('')
    setStartMonth('')
    setStartYear('')
    setEndMonth('')
    setEndYear('')
    setIsPresent(false)
    setLocation('')
    setAchievements([''])
  }

  const createExperienceEntry = () => {
    const startDate = startMonth && startYear 
      ? `${startMonth} ${startYear}` 
      : ''
    const endDate = isPresent 
      ? 'Present' 
      : (endMonth && endYear ? `${endMonth} ${endYear}` : '')

    return {
      role_title: roleTitle,
      company: company,
      location: location,
      start_date: startDate,
      end_date: endDate,
      achievements: achievements.filter(a => a.trim())
    }
  }

  const saveAndAddAnother = () => {
    if (!roleTitle.trim() || !company.trim()) return

    const experienceEntry = createExperienceEntry()
    
    // Add current to saved stack
    setSavedRoles([...savedRoles, experienceEntry])
    
    // Reset form for next entry
    resetForm()
    
    // Scroll to top to show the new empty form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const removeSavedRole = (index: number) => {
    setSavedRoles(savedRoles.filter((_, i) => i !== index))
  }

  const handleSaveAndContinue = () => {
    if (!roleTitle.trim() || !company.trim()) {
      // If current form is empty but we have saved roles, proceed with those
      if (savedRoles.length > 0) {
        const manualData: ManualExperienceData = {
          experiences: savedRoles.map(role => ({
            ...role,
            description: '',
            skills_used: []
          })),
          additional_skills: []
        }
        setManualExperienceData(manualData)
        const userId = crypto.randomUUID()
        setUserId(userId)
        onNext()
      }
      return
    }

    // Create experience entry from current form
    const currentEntry = createExperienceEntry()

    // Combine saved roles with current entry
    const allExperiences = [...savedRoles, currentEntry]

    const manualData: ManualExperienceData = {
      experiences: allExperiences.map(role => ({
        ...role,
        description: '',
        skills_used: []
      })),
      additional_skills: []
    }

    setManualExperienceData(manualData)

    // Generate a UUID-like user ID if we don't have one
    const userId = crypto.randomUUID()
    setUserId(userId)

    onNext()
  }

  const canContinue = roleTitle.trim().length > 0 && company.trim().length > 0 || savedRoles.length > 0

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col overflow-y-auto px-12 md:px-24 py-8 pb-32">
      
      {/* THE "CHAPTER STACK" (Saved Roles Summary) */}
      {savedRoles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 font-sans">
            Experience Added ({savedRoles.length})
          </p>
          
          {savedRoles.map((role, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-6 bg-white border border-stone-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 flex-shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-xl text-stone-900">{role.role_title}</h4>
                  <p className="text-sm text-stone-500 font-sans">
                    {role.company} • {role.start_date} {role.end_date ? `— ${role.end_date}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeSavedRole(idx)}
                className="text-stone-300 hover:text-red-400 px-4 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
          
          <div className="h-px w-full bg-stone-200 my-6" />
        </motion.div>
      )}

      {/* The Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h2 className="font-serif text-4xl md:text-5xl text-stone-900 leading-tight mb-2">
          {savedRoles.length === 0 ? "Where did you make" : "What else did you"} <br />
          <span className="italic text-stone-400">
            {savedRoles.length === 0 ? "your mark?" : "accomplish?"}
          </span>
        </h2>
        {savedRoles.length === 0 && (
          <p className="font-sans text-stone-500 text-base">
            Focus on your most recent or relevant role.
          </p>
        )}
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
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              {/* Start Date */}
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                className="bg-transparent border-b border-stone-200 focus:border-stone-900 focus:outline-none py-1 pr-8 text-base font-sans focus:ring-0 cursor-pointer appearance-none text-stone-600 focus:text-stone-900"
              >
                <option value="" disabled className="text-stone-400">Month</option>
                {MONTHS.map((month) => (
                  <option key={month} value={month} className="text-stone-900">
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                className="bg-transparent border-b border-stone-200 focus:border-stone-900 focus:outline-none py-1 pr-8 text-base font-sans focus:ring-0 cursor-pointer appearance-none text-stone-600 focus:text-stone-900"
              >
                <option value="" disabled className="text-stone-400">Year</option>
                {years.map((year) => (
                  <option key={year} value={year} className="text-stone-900">
                    {year}
                  </option>
                ))}
              </select>
              <span className="text-stone-300 mx-1">—</span>
              {/* End Date or Present */}
              {!isPresent ? (
                <>
                  <select
                    value={endMonth}
                    onChange={(e) => setEndMonth(e.target.value)}
                    className="bg-transparent border-b border-stone-200 focus:border-stone-900 focus:outline-none py-1 pr-8 text-base font-sans focus:ring-0 cursor-pointer appearance-none text-stone-600 focus:text-stone-900"
                  >
                    <option value="" disabled className="text-stone-400">Month</option>
                    {MONTHS.map((month) => (
                      <option key={month} value={month} className="text-stone-900">
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    className="bg-transparent border-b border-stone-200 focus:border-stone-900 focus:outline-none py-1 pr-8 text-base font-sans focus:ring-0 cursor-pointer appearance-none text-stone-600 focus:text-stone-900"
                  >
                    <option value="" disabled className="text-stone-400">Year</option>
                    {years.map((year) => (
                      <option key={year} value={year} className="text-stone-900">
                        {year}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <span className="text-stone-600 text-base font-sans">Present</span>
              )}
              <button
                type="button"
                onClick={() => setIsPresent(!isPresent)}
                className="ml-2 text-xs text-stone-400 hover:text-emerald-600 transition-colors font-sans underline"
              >
                {isPresent ? 'Set end date' : 'or Present'}
              </button>
            </div>
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

      {/* THE ACTION AREA */}
      <div className="mt-8 flex flex-col md:flex-row items-center gap-4 border-t border-stone-100 pt-8 pb-8">
        
        {/* Secondary: Back */}
        <Button
          onClick={onPrev}
          variant="outline"
          className="px-6 py-3 border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50 md:mr-auto"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-4 ml-auto">
          {/* Action 1: Add Another (The "Loop" Button) */}
          {(roleTitle.trim() || company.trim()) && (
            <button 
              onClick={saveAndAddAnother}
              disabled={!roleTitle.trim() || !company.trim()}
              className="group flex items-center gap-3 px-6 py-3 rounded-full border border-stone-200 text-stone-600 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            >
              <Plus className="w-4 h-4" />
              <span className="font-bold tracking-wide text-xs uppercase">Add Another Role</span>
            </button>
          )}

          {/* Action 2: Finish (The "Next" Button) */}
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
            <span className="font-bold tracking-wide text-xs uppercase">Save & Continue</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

    </div>
  )
}

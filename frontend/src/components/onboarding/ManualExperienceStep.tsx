'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Plus, Trash2, ArrowRight, ArrowLeft, Save } from 'lucide-react'
import { useOnboardingStore, ManualExperienceEntry, ManualExperienceData } from '@/lib/stores/onboardingStore'

interface ManualExperienceStepProps {
  onNext: () => void
  onPrev: () => void
}

export default function ManualExperienceStep({ onNext, onPrev }: ManualExperienceStepProps) {
  const { manualExperienceData, setManualExperienceData, setUserId } = useOnboardingStore()
  const [currentEntry, setCurrentEntry] = useState<ManualExperienceEntry>({
    role_title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
    achievements: [],
    skills_used: []
  })
  const [currentAchievement, setCurrentAchievement] = useState('')
  const [currentSkill, setCurrentSkill] = useState('')
  const [additionalSkills, setAdditionalSkills] = useState<string[]>(
    manualExperienceData?.additional_skills || []
  )

  const addAchievement = () => {
    if (currentAchievement.trim()) {
      setCurrentEntry(prev => ({
        ...prev,
        achievements: [...prev.achievements, currentAchievement.trim()]
      }))
      setCurrentAchievement('')
    }
  }

  const removeAchievement = (index: number) => {
    setCurrentEntry(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }))
  }

  const addSkill = () => {
    if (currentSkill.trim()) {
      setCurrentEntry(prev => ({
        ...prev,
        skills_used: [...prev.skills_used, currentSkill.trim()]
      }))
      setCurrentSkill('')
    }
  }

  const removeSkill = (index: number) => {
    setCurrentEntry(prev => ({
      ...prev,
      skills_used: prev.skills_used.filter((_, i) => i !== index)
    }))
  }

  const addAdditionalSkill = () => {
    if (currentSkill.trim() && !additionalSkills.includes(currentSkill.trim())) {
      setAdditionalSkills(prev => [...prev, currentSkill.trim()])
      setCurrentSkill('')
    }
  }

  const removeAdditionalSkill = (skill: string) => {
    setAdditionalSkills(prev => prev.filter(s => s !== skill))
  }

  const saveEntry = () => {
    if (!currentEntry.role_title.trim() || !currentEntry.company.trim()) {
      return
    }

    const newData: ManualExperienceData = {
      experiences: [...(manualExperienceData?.experiences || []), currentEntry],
      additional_skills: additionalSkills
    }

    setManualExperienceData(newData)

    // Reset form
    setCurrentEntry({
      role_title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: '',
      description: '',
      achievements: [],
      skills_used: []
    })
  }

  const removeEntry = (index: number) => {
    const newData: ManualExperienceData = {
      experiences: (manualExperienceData?.experiences || []).filter((_, i) => i !== index),
      additional_skills: additionalSkills
    }
    setManualExperienceData(newData)
  }

  const handleContinue = () => {
    // Generate a UUID-like user ID if we don't have one
    const userId = crypto.randomUUID()
    setUserId(userId)
    onNext()
  }

  const hasValidData = (manualExperienceData?.experiences || []).length > 0

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Tell Us About Your Experience</CardTitle>
        <CardDescription>
          Add your professional roles and achievements. Focus on behavioral stories that demonstrate leadership, problem-solving, and impact.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Experience Form */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Add Experience</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role Title *</label>
              <Input
                placeholder="e.g., Senior Software Engineer"
                value={currentEntry.role_title}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, role_title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company *</label>
              <Input
                placeholder="e.g., Tech Corp"
                value={currentEntry.company}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                placeholder="e.g., San Francisco, CA"
                value={currentEntry.location}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input
                  placeholder="e.g., Jan 2020"
                  value={currentEntry.start_date}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input
                  placeholder="e.g., Present"
                  value={currentEntry.end_date}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Role Description</label>
            <Textarea
              placeholder="Describe your responsibilities and the team/context you worked in..."
              value={currentEntry.description}
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Achievements */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Key Achievements</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="e.g., Increased system performance by 40% through optimization"
                value={currentAchievement}
                onChange={(e) => setCurrentAchievement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
              />
              <Button onClick={addAchievement} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {currentEntry.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                  <span className="text-sm flex-1">{achievement}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAchievement(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Used */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Skills Used</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="e.g., Python, React, AWS"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {currentEntry.skills_used.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  {skill}
                  <button onClick={() => removeSkill(index)}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <Button
            onClick={saveEntry}
            disabled={!currentEntry.role_title.trim() || !currentEntry.company.trim()}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </div>

        {/* Saved Experiences */}
        {(manualExperienceData?.experiences || []).length > 0 && (
          <div>
            <h3 className="font-semibold mb-4">Your Experience ({manualExperienceData.experiences.length})</h3>
            <div className="space-y-3">
              {manualExperienceData.experiences.map((exp, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{exp.role_title} at {exp.company}</h4>
                      <p className="text-sm text-gray-600">{exp.location} • {exp.start_date} - {exp.end_date || 'Present'}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEntry(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-gray-700 mb-2">{exp.description}</p>
                  )}
                  {exp.achievements.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium">Achievements:</p>
                      <ul className="text-sm text-gray-600 ml-4">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i}>• {achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {exp.skills_used.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {exp.skills_used.map((skill, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Skills */}
        <div>
          <label className="block text-sm font-medium mb-2">Additional Skills</label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="e.g., Leadership, Project Management"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAdditionalSkill()}
            />
            <Button onClick={addAdditionalSkill} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {additionalSkills.map((skill, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm flex items-center gap-1"
              >
                {skill}
                <button onClick={() => removeAdditionalSkill(skill)}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={onPrev}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!hasValidData}
            className="flex-1"
            size="lg"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

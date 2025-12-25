'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookOpen, ChevronDown, ChevronUp, Filter, Eye, Star, X, Upload, PenLine, Sparkles } from 'lucide-react'
import { getStories } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface StoryBankProps {
  userId: string
}

interface Story {
  story_id: string
  title: string
  situation: string
  task: string
  actions: string[]
  result: string
  reflection?: string
  themes: string[]
  competencies: string[]
  star_version?: string
  compressed_version?: string
}

export default function StoryBank({ userId }: StoryBankProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedStory, setExpandedStory] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedStoryDetail, setSelectedStoryDetail] = useState<Story | null>(null)
  const [activeVersion, setActiveVersion] = useState<'star' | 'soar'>('star')

  // Get unique categories from stories
  const categories = ['all', ...Array.from(new Set(stories.flatMap(story => story.themes || [])))]

  // Filter stories based on selected category
  const filteredStories = selectedCategory === 'all'
    ? stories
    : stories.filter(story => story.themes?.includes(selectedCategory))

  useEffect(() => {
    loadStories()
  }, [userId])

  const loadStories = async () => {
    try {
      const response = await getStories(userId)
      if (response.success) {
        setStories(response.stories || [])
      }
    } catch (error) {
      console.error('Failed to load stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStory = (storyId: string) => {
    setExpandedStory(expandedStory === storyId ? null : storyId)
  }

  const openDetailModal = (story: Story) => {
    setSelectedStoryDetail(story)
    setShowDetailModal(true)
    setActiveVersion('star')
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedStoryDetail(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your stories...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (stories.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Empty State Hero */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-emerald-100 blur-xl opacity-60" />
            <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-50 to-stone-100 border-2 border-stone-200 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-emerald-600" />
            </div>
          </div>
          <h1 className="font-serif text-3xl font-semibold text-stone-900 mb-3">
            Your Story Bank is Empty
          </h1>
          <p className="text-stone-500 text-lg max-w-md mx-auto">
            Build your collection of interview-ready stories. We'll help you structure them using the STAR method.
          </p>
        </div>

        {/* CTA Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Upload Resume CTA */}
          <button
            onClick={() => window.location.href = '/onboarding'}
            className="bg-white border border-stone-200 p-6 rounded-2xl hover:shadow-lg hover:shadow-stone-200/50 hover:border-emerald-200 hover:-translate-y-1 transition-all text-left group"
          >
            <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
              <Upload className="w-6 h-6 text-emerald-700" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-900 mb-2 group-hover:text-emerald-700 transition-colors">
              Upload Your Resume
            </h3>
            <p className="text-sm text-stone-500">
              We'll automatically extract and structure stories from your work experience.
            </p>
            <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Get started <span className="ml-1">→</span>
            </div>
          </button>

          {/* Write Manually CTA */}
          <button
            onClick={() => {/* TODO: Open manual story form */}}
            className="bg-white border border-stone-200 p-6 rounded-2xl hover:shadow-lg hover:shadow-stone-200/50 hover:border-emerald-200 hover:-translate-y-1 transition-all text-left group"
          >
            <div className="bg-stone-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-stone-200 transition-colors">
              <PenLine className="w-6 h-6 text-stone-700" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-900 mb-2 group-hover:text-emerald-700 transition-colors">
              Write Your First Story
            </h3>
            <p className="text-sm text-stone-500">
              Manually add a story using our guided STAR framework template.
            </p>
            <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Start writing <span className="ml-1">→</span>
            </div>
          </button>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-amber-800">Pro Tip</h4>
          </div>
          <p className="text-sm text-amber-900">
            The best interview stories come from <strong>challenging situations</strong> where you made a real impact. 
            Think about times you solved problems, led initiatives, or overcame obstacles.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Story Bank</CardTitle>
          <CardDescription>
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} ready for interviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter by theme:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredStories.length} of {stories.length} stories
          </p>
        </CardContent>
      </Card>

      {filteredStories.map((story) => (
        <Card key={story.story_id} className="overflow-hidden">
          <CardHeader
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => toggleStory(story.story_id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{story.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {story.themes?.slice(0, 3).map((theme, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    openDetailModal(story)
                  }}
                  className="gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Details
                </Button>
                {expandedStory === story.story_id ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </div>
          </CardHeader>

          {expandedStory === story.story_id && (
            <CardContent className="space-y-4 border-t">
              <div>
                <h4 className="font-semibold mb-2">Situation</h4>
                <p className="text-sm text-muted-foreground">{story.situation}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Task</h4>
                <p className="text-sm text-muted-foreground">{story.task}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Actions</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {story.actions?.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Result</h4>
                <p className="text-sm text-muted-foreground">{story.result}</p>
              </div>

              {story.reflection && (
                <div>
                  <h4 className="font-semibold mb-2">Reflection</h4>
                  <p className="text-sm text-muted-foreground">{story.reflection}</p>
                </div>
              )}

              {story.competencies && story.competencies.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Competencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {story.competencies.map((comp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {story.star_version && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Full STAR Answer</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {story.star_version}
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}

      {/* Detail Modal */}
      {showDetailModal && selectedStoryDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{selectedStoryDetail.title}</h2>
                <Button variant="ghost" size="sm" onClick={closeDetailModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Story Themes and Competencies */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedStoryDetail.themes?.map((theme, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
                {selectedStoryDetail.competencies && (
                  <div className="flex flex-wrap gap-2">
                    {selectedStoryDetail.competencies.map((comp, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Version Tabs */}
              <div className="flex gap-2 mb-6">
                <Button
                  variant={activeVersion === 'star' ? 'default' : 'outline'}
                  onClick={() => setActiveVersion('star')}
                  className="gap-2"
                >
                  <Star className="w-4 h-4" />
                  STAR Version
                </Button>
                <Button
                  variant={activeVersion === 'soar' ? 'default' : 'outline'}
                  onClick={() => setActiveVersion('soar')}
                  className="gap-2"
                >
                  <Star className="w-4 h-4" />
                  SOAR Version
                </Button>
              </div>

              {/* Story Content */}
              <div className="space-y-4">
                {activeVersion === 'star' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">STAR Format</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-primary">Situation</h4>
                        <p className="text-muted-foreground mt-1">{selectedStoryDetail.situation}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Task</h4>
                        <p className="text-muted-foreground mt-1">{selectedStoryDetail.task}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Action</h4>
                        <ul className="list-disc list-inside text-muted-foreground mt-1">
                          {selectedStoryDetail.actions?.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Result</h4>
                        <p className="text-muted-foreground mt-1">{selectedStoryDetail.result}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeVersion === 'soar' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">SOAR Format</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-primary">Situation</h4>
                        <p className="text-muted-foreground mt-1">{selectedStoryDetail.situation}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Obstacle</h4>
                        <p className="text-muted-foreground mt-1">{selectedStoryDetail.task}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Action</h4>
                        <ul className="list-disc list-inside text-muted-foreground mt-1">
                          {selectedStoryDetail.actions?.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">Result</h4>
                        <p className="text-muted-foreground mt-1">{selectedStoryDetail.result}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedStoryDetail.reflection && (
                  <div>
                    <h4 className="font-medium text-primary">Reflection</h4>
                    <p className="text-muted-foreground mt-1">{selectedStoryDetail.reflection}</p>
                  </div>
                )}

                {selectedStoryDetail.star_version && activeVersion === 'star' && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Full STAR Answer</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedStoryDetail.star_version}
                      </p>
                    </div>
                  </div>
                )}

                {selectedStoryDetail.compressed_version && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Compressed Version (30 seconds)</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedStoryDetail.compressed_version}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


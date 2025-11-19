'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { getStories } from '@/lib/api'

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
      <Card>
        <CardHeader>
          <CardTitle>Your Story Bank</CardTitle>
          <CardDescription>
            No stories found. Please complete the onboarding flow to generate your story bank.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <BookOpen className="w-16 h-16 mx-auto mb-4" />
            <p>Your personalized stories will appear here</p>
          </div>
        </CardContent>
      </Card>
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
      </Card>

      {stories.map((story) => (
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
              {expandedStory === story.story_id ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
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
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import QuestionAsker from '@/components/QuestionAsker'
import StoryBank from '@/components/StoryBank'
import PracticeMode from '@/components/PracticeMode'
import { BookOpen, MessageSquare, Mic, Trophy } from 'lucide-react'

interface DashboardProps {
  userId: string
}

export default function Dashboard({ userId }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'ask' | 'stories' | 'practice' | 'stats'>('ask')

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">BehavAced Dashboard</h1>
          <p className="text-muted-foreground">
            Your AI-powered behavioral interview coach
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === 'ask' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ask')}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Ask Question
          </Button>
          <Button
            variant={activeTab === 'stories' ? 'default' : 'outline'}
            onClick={() => setActiveTab('stories')}
            className="gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Story Bank
          </Button>
          <Button
            variant={activeTab === 'practice' ? 'default' : 'outline'}
            onClick={() => setActiveTab('practice')}
            className="gap-2"
          >
            <Mic className="w-4 h-4" />
            Practice Mode
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'default' : 'outline'}
            onClick={() => setActiveTab('stats')}
            className="gap-2"
          >
            <Trophy className="w-4 h-4" />
            Progress
          </Button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'ask' && <QuestionAsker userId={userId} />}
          {activeTab === 'stories' && <StoryBank userId={userId} />}
          {activeTab === 'practice' && <PracticeMode userId={userId} />}
          {activeTab === 'stats' && (
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>Track your improvement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-16 h-16 mx-auto mb-4" />
                  <p>Stats and analytics coming soon!</p>
                  <p className="text-sm mt-2">
                    Keep practicing to see your progress here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}


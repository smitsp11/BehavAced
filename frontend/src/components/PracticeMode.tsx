'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Progress } from '@/components/ui/Progress'
import { Mic, Square, Sparkles, TrendingUp } from 'lucide-react'
import { scorePractice } from '@/lib/api'

interface PracticeModeProps {
  userId: string
}

export default function PracticeMode({ userId }: PracticeModeProps) {
  const [question, setQuestion] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const [recordingTime, setRecordingTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const samplePracticeQuestions = [
    "Tell me about a time you showed leadership",
    "Describe a conflict you resolved",
    "Tell me about a failure and what you learned",
  ]

  const handleStartRecording = () => {
    // For MVP, we'll use text input instead of actual audio recording
    // In production, this would use MediaRecorder API
    setIsRecording(true)
    startTimeRef.current = Date.now()
    
    timerRef.current = setInterval(() => {
      setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const handleSubmitPractice = async () => {
    if (!question.trim() || !transcript.trim()) return

    setLoading(true)

    try {
      const response = await scorePractice(
        userId,
        question,
        undefined, // audioBase64 - not implemented in MVP
        transcript,
        recordingTime
      )

      if (response.success) {
        setResult(response)
      }
    } catch (error: any) {
      alert(error.message || 'Failed to score practice')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setQuestion('')
    setTranscript('')
    setResult(null)
    setRecordingTime(0)
  }

  const ScoreCard = ({ label, score }: { label: string; score: number }) => (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold">{score}/100</span>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Practice Input */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Practice Mode</CardTitle>
            <CardDescription>
              Answer out loud, get instant feedback, and improve
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Question to Practice
              </label>
              <Textarea
                placeholder="Enter a behavioral question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
              />
            </div>

            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {!isRecording ? (
                <div>
                  <Mic className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    For MVP: Type your answer below
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Voice recording coming soon!
                  </p>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Square className="w-8 h-8 text-white fill-white" />
                  </div>
                  <p className="text-lg font-bold text-red-500 mb-2">Recording...</p>
                  <p className="text-2xl font-mono">{recordingTime}s</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Answer (Type or speak)
              </label>
              <Textarea
                placeholder="Type your practice answer here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={6}
                disabled={isRecording}
              />
            </div>

            <div className="flex gap-2">
              {!result && (
                <Button
                  onClick={handleSubmitPractice}
                  disabled={!question.trim() || !transcript.trim() || loading}
                  className="flex-1 gap-2"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4" />
                  {loading ? 'Analyzing...' : 'Get Feedback'}
                </Button>
              )}
              {result && (
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  Practice Another
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Practice Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {samplePracticeQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setQuestion(q)}
                className="w-full text-left p-3 rounded-lg border hover:bg-accent hover:border-primary transition-colors text-sm"
              >
                {q}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div>
        {result ? (
          <div className="space-y-4">
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Your Scores
                </CardTitle>
                <CardDescription>Based on AI analysis of your answer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScoreCard label="Overall" score={result.attempt?.overall_score || 0} />
                <ScoreCard label="Clarity" score={result.attempt?.clarity_score || 0} />
                <ScoreCard label="Structure" score={result.attempt?.structure_score || 0} />
                <ScoreCard label="Confidence" score={result.attempt?.confidence_score || 0} />
                <ScoreCard label="Pacing" score={result.attempt?.pacing_score || 0} />
              </CardContent>
            </Card>

            {result.attempt?.filler_words_count > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filler Words</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">
                    Detected {result.attempt.filler_words_count} filler word(s)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.attempt?.filler_words || {}).map(
                      ([word, count]: [string, any]) => (
                        <span
                          key={word}
                          className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm"
                        >
                          {word}: {count}
                        </span>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {result.attempt?.strengths && result.attempt.strengths.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.attempt.strengths.map((strength: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm">
                        <span className="text-green-500">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {result.attempt?.improvements && result.attempt.improvements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Areas to Improve</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.attempt.improvements.map((improvement: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm">
                        <span className="text-yellow-500">→</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {result.improved_answer?.improved_version && (
              <Card className="border-2 border-green-500">
                <CardHeader>
                  <CardTitle className="text-lg">Improved Version</CardTitle>
                  <CardDescription>
                    Here's a stronger version in your authentic voice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {result.improved_answer.improved_version}
                    </p>
                  </div>

                  {result.improved_answer?.coaching_tips && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium text-sm">Coaching Tips:</h4>
                      <ul className="space-y-1">
                        {result.improved_answer.coaching_tips.map((tip: string, idx: number) => (
                          <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                            <span>•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Mic className="w-16 h-16 mx-auto mb-4" />
                <p>Answer a question to get instant feedback</p>
                <p className="text-sm mt-2">
                  We'll analyze your structure, clarity, and confidence
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


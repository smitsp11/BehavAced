'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Progress } from '@/components/ui/Progress'
import { Mic, Square, Sparkles, TrendingUp, Play, Pause, Volume2 } from 'lucide-react'
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

  // Audio recording state
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(null)

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const samplePracticeQuestions = [
    "Tell me about a time you showed leadership",
    "Describe a conflict you resolved",
    "Tell me about a failure and what you learned",
  ]

  // Check microphone permissions on mount
  useEffect(() => {
    checkMicrophonePermission()
    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [])

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      setMicPermissionGranted(result.state === 'granted')
    } catch (error) {
      // Fallback: try to get user media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
        setMicPermissionGranted(true)
      } catch {
        setMicPermissionGranted(false)
      }
    }
  }

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      streamRef.current = stream
      audioChunksRef.current = []

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        setAudioDuration(recordingTime)

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions and try again.')
      setMicPermissionGranted(false)
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const handlePlayAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const handleSubmitPractice = async () => {
    if (!question.trim()) return
    if (!transcript.trim() && !audioBlob) {
      alert('Please either type your answer or record audio')
      return
    }

    setLoading(true)

    try {
      const response = await scorePractice(
        userId,
        question,
        audioBlob || undefined, // API will handle Blob to base64 conversion
        transcript || undefined,
        audioDuration || recordingTime
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
    setAudioBlob(null)
    setAudioDuration(0)
    setIsPlaying(false)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
  }

  const ScoreCard = ({ label, score }: { label: string; score: number }) => {
    const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-600'
      if (score >= 60) return 'text-orange-600'
      return 'text-red-600'
    }

    const getProgressColor = (score: number) => {
      if (score >= 80) return 'bg-green-500'
      if (score >= 60) return 'bg-orange-500'
      return 'bg-red-500'
    }

    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{label}</span>
          <span className={`text-lg font-bold ${getScoreColor(score)}`}>{score}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    )
  }

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

            <div className="border-2 border-dashed rounded-lg p-6">
              {!audioBlob && !isRecording ? (
                <div className="text-center">
                  <Mic className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Record your answer or type below
                  </p>
                  {micPermissionGranted === false && (
                    <p className="text-xs text-red-600 mb-2">
                      Microphone access denied. Please enable microphone permissions.
                    </p>
                  )}
                  <Button
                    onClick={handleStartRecording}
                    disabled={micPermissionGranted === false}
                    className="gap-2"
                  >
                    <Mic className="w-4 h-4" />
                    Start Recording
                  </Button>
                </div>
              ) : isRecording ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-lg font-bold text-red-500 mb-2">Recording...</p>
                  <p className="text-2xl font-mono mb-4">{recordingTime}s</p>

                  {/* Simple waveform visualization */}
                  <div className="flex items-end justify-center gap-1 h-8 mb-4">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div
                        key={i}
                        className="bg-red-400 rounded-sm animate-pulse"
                        style={{
                          width: '3px',
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>

                  <Button
                    onClick={handleStopRecording}
                    variant="outline"
                    className="gap-2 border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Square className="w-4 h-4" />
                    Stop Recording
                  </Button>
                </div>
              ) : audioBlob ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Volume2 className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-green-600 font-medium mb-2">Recording Complete</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Duration: {audioDuration || recordingTime}s
                  </p>

                  {/* Audio playback controls */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Button
                      onClick={handlePlayAudio}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Button
                      onClick={() => {
                        setAudioBlob(null)
                        setAudioUrl(null)
                        setRecordingTime(0)
                        setAudioDuration(0)
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Record Again
                    </Button>
                  </div>

                  {/* Hidden audio element for playback */}
                  {audioUrl && (
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={handleAudioEnded}
                      className="hidden"
                    />
                  )}
                </div>
              ) : null}
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
                  disabled={!question.trim() || (!transcript.trim() && !audioBlob) || loading}
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
          <div className="space-y-6">
            {/* Overall Score Card */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Overall Score
                </CardTitle>
                <CardDescription>Based on AI analysis of your answer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {result.attempt?.overall_score || 0}
                  </div>
                  <div className="text-lg text-muted-foreground mb-4">out of 100</div>
                  <Progress value={result.attempt?.overall_score || 0} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Detailed Score Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Scores</CardTitle>
                <CardDescription>Breakdown of your performance across different dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ScoreCard label="Clarity" score={result.attempt?.clarity_score || 0} />
                  <ScoreCard label="Structure" score={result.attempt?.structure_score || 0} />
                  <ScoreCard label="Confidence" score={result.attempt?.confidence_score || 0} />
                  <ScoreCard label="Pacing" score={result.attempt?.pacing_score || 0} />
                </div>
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
                        <span className="text-green-500">→</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {result.improved_answer?.improved_version && (
              <Card className="border-2 border-green-500 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    Improved Version
                  </CardTitle>
                  <CardDescription>
                    Here's a stronger version tailored to your communication style
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white border border-green-200 p-6 rounded-lg shadow-sm">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {result.improved_answer.improved_version}
                    </p>
                  </div>

                  {result.improved_answer?.changes_made && result.improved_answer.changes_made.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Key Improvements Made:
                      </h4>
                      <div className="grid gap-2">
                        {result.improved_answer.changes_made.map((change: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-sm bg-green-50 p-2 rounded">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>{change}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.improved_answer?.coaching_tips && result.improved_answer.coaching_tips.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Coaching Tips:
                      </h4>
                      <div className="grid gap-2">
                        {result.improved_answer.coaching_tips.map((tip: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-sm bg-blue-50 p-2 rounded">
                            <span className="text-blue-600 mt-0.5">💡</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
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


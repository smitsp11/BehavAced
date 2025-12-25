'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { 
  Mic, 
  Square, 
  Sparkles, 
  TrendingUp, 
  Play, 
  Pause, 
  Volume2,
  RotateCcw,
  ChevronRight,
  Lightbulb,
  Eye,
  List,
  Clock,
  CheckCircle
} from 'lucide-react'
import { scorePractice } from '@/lib/api'

interface PracticeModeProps {
  userId: string
}

export default function PracticeMode({ userId }: PracticeModeProps) {
  const [question, setQuestion] = useState("Tell me about a time you had to deliver bad news to a stakeholder.")
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showExample, setShowExample] = useState(false)
  const [showBullets, setShowBullets] = useState(false)

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

  const sampleQuestions = [
    "Tell me about a time you showed leadership",
    "Describe a conflict you resolved with a colleague",
    "Tell me about a failure and what you learned",
    "Describe a time you had to influence without authority",
    "Tell me about your biggest professional achievement",
  ]

  const exampleAnswer = `"When I was leading the product launch at my previous company, we discovered a critical bug just 48 hours before release. I had to inform the VP of Sales that we'd need to delay the launch, which meant missing our Q4 revenue targets.

I scheduled a private meeting, came prepared with the root cause analysis, a revised timeline, and a mitigation plan for affected clients. Instead of just delivering bad news, I presented it as a decision point with options. The VP appreciated my transparency and proactive approach, and we actually strengthened our relationship with clients by personally reaching out before the delay became public."`

  const bulletPoints = [
    "Set the context clearly (product launch, critical bug)",
    "Show ownership of the situation",
    "Demonstrate proactive problem-solving",
    "Quantify the impact where possible",
    "End with a positive outcome or learning",
  ]

  // Check microphone permissions on mount
  useEffect(() => {
    checkMicrophonePermission()
    return () => {
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

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setRecordingTime(0)
      setShowExample(false)
      setShowBullets(false)

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
      alert('Please record your answer first')
      return
    }

    setLoading(true)

    try {
      const response = await scorePractice(
        userId,
        question,
        audioBlob || undefined,
        transcript || undefined,
        audioDuration || recordingTime
      )

      if (response.success) {
        setResult(response)
      }
    } catch (error: any) {
      // Mock result for demo
      setResult({
        attempt: {
          overall_score: 78,
          clarity_score: 82,
          structure_score: 75,
          confidence_score: 80,
          pacing_score: 74,
          strengths: [
            "Clear explanation of the situation",
            "Good use of specific details",
            "Demonstrated ownership"
          ],
          improvements: [
            "Could quantify the business impact more",
            "Add more about the stakeholder's reaction",
            "Consider a stronger closing statement"
          ]
        },
        improved_answer: {
          improved_version: "Here's a more polished version of your answer...",
          changes_made: ["Added quantifiable metrics", "Strengthened the result statement"],
          coaching_tips: ["Practice the opening 10 seconds until it's natural"]
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setTranscript('')
    setResult(null)
    setRecordingTime(0)
    setAudioBlob(null)
    setAudioDuration(0)
    setIsPlaying(false)
    setShowExample(false)
    setShowBullets(false)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
  }

  const handleNewQuestion = () => {
    handleReset()
    const currentIndex = sampleQuestions.indexOf(question)
    const nextIndex = (currentIndex + 1) % sampleQuestions.length
    setQuestion(sampleQuestions[nextIndex])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Show results view
  if (result) {
    return <ResultsView result={result} onReset={handleReset} onNewQuestion={handleNewQuestion} />
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* The Question Card (The Prompter) */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 text-center">
        <span className="text-xs font-bold tracking-widest text-stone-400 uppercase mb-4 block">
          Current Question
        </span>
        <h2 className="font-serif text-3xl text-stone-900 leading-tight mb-6">
          "{question}"
        </h2>
        
        {/* Helper Actions */}
        <div className="flex justify-center gap-6">
          <button 
            onClick={() => setShowExample(!showExample)}
            className="text-sm text-stone-500 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showExample ? 'Hide Example' : 'See Example Answer'}
          </button>
          <button 
            onClick={() => setShowBullets(!showBullets)}
            className="text-sm text-stone-500 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
          >
            <List className="w-4 h-4" />
            {showBullets ? 'Hide Bullets' : 'Show Key Points'}
          </button>
        </div>

        {/* Example Answer (Expandable) */}
        {showExample && (
          <div className="mt-6 p-6 bg-stone-50 rounded-xl text-left border border-stone-100">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Example Answer</span>
            </div>
            <p className="text-stone-700 text-sm leading-relaxed italic">
              {exampleAnswer}
            </p>
          </div>
        )}

        {/* Bullet Points (Expandable) */}
        {showBullets && (
          <div className="mt-6 p-6 bg-emerald-50 rounded-xl text-left border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Key Points to Hit</span>
            </div>
            <ul className="space-y-2">
              {bulletPoints.map((point, idx) => (
                <li key={idx} className="text-stone-700 text-sm flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* The Recorder (The Stage) */}
      <div className={`
        rounded-3xl p-12 flex flex-col items-center justify-center border-2 transition-all
        ${isRecording 
          ? 'bg-rose-50 border-rose-200' 
          : audioBlob 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-stone-100 border-dashed border-stone-200 hover:border-emerald-300'
        }
      `}>
        {!audioBlob && !isRecording ? (
          <>
            {/* Ready State - Big Mic Button */}
            <button 
              onClick={handleStartRecording}
              disabled={micPermissionGranted === false}
              className="w-28 h-28 bg-white rounded-full shadow-xl shadow-stone-300/50 flex items-center justify-center mb-6 hover:scale-105 hover:shadow-2xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic className="w-12 h-12 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
            </button>
            
            {micPermissionGranted === false ? (
              <p className="text-rose-600 font-medium mb-2">Microphone access denied</p>
            ) : (
              <p className="text-stone-600 font-medium">Tap to start recording</p>
            )}
            <div className="flex items-center gap-1.5 text-stone-400 text-sm mt-2">
              <Clock className="w-4 h-4" />
              <span>Maximum time: 2:00</span>
            </div>

            {/* Idle Audio Visualizer */}
            <div className="flex gap-1 h-8 items-center mt-8 opacity-40">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1.5 bg-stone-400 rounded-full"
                  style={{ height: `${12 + (i % 3) * 8}px` }}
                />
              ))}
            </div>
          </>
        ) : isRecording ? (
          <>
            {/* Recording State */}
            <div className="relative mb-6">
              <div className="absolute inset-0 w-28 h-28 rounded-full bg-rose-400/30 animate-ping" />
              <div className="relative w-28 h-28 bg-rose-500 rounded-full shadow-xl flex items-center justify-center">
                <Mic className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <div className="text-5xl font-mono text-stone-900 font-bold mb-2">
              {formatTime(recordingTime)}
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-rose-600 font-medium">Recording...</span>
            </div>

            {/* Live Audio Visualizer */}
            <div className="flex gap-1 h-12 items-center mb-8">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1.5 bg-rose-400 rounded-full animate-pulse"
                  style={{ 
                    height: `${Math.random() * 40 + 12}px`,
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: `${0.3 + Math.random() * 0.2}s`
                  }}
                />
              ))}
            </div>

            <button 
              onClick={handleStopRecording}
              className="bg-white hover:bg-stone-50 text-rose-600 px-8 py-3 rounded-full font-medium shadow-lg border border-rose-200 transition-all flex items-center gap-2"
            >
              <Square className="w-5 h-5" />
              Stop Recording
            </button>
          </>
        ) : audioBlob ? (
          <>
            {/* Completed State */}
            <div className="w-28 h-28 bg-emerald-500 rounded-full shadow-xl flex items-center justify-center mb-6">
              <Volume2 className="w-12 h-12 text-white" />
            </div>
            
            <p className="text-emerald-700 font-semibold text-lg mb-1">Recording Complete</p>
            <p className="text-stone-500 text-sm mb-6">Duration: {formatTime(audioDuration || recordingTime)}</p>

            {/* Audio Playback */}
            <div className="flex items-center gap-3 mb-8">
              <button 
                onClick={handlePlayAudio}
                className="bg-white hover:bg-stone-50 text-stone-700 px-5 py-2.5 rounded-full font-medium shadow-md border border-stone-200 transition-all flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play Back'}
              </button>
              <button 
                onClick={handleReset}
                className="bg-white hover:bg-stone-50 text-stone-500 px-5 py-2.5 rounded-full font-medium shadow-md border border-stone-200 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Re-record
              </button>
            </div>

            {/* Submit Button */}
            <button 
              onClick={handleSubmitPractice}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-full font-semibold shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              {loading ? 'Analyzing...' : 'Get Feedback'}
            </button>

            {audioUrl && (
              <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnded} className="hidden" />
            )}
          </>
        ) : null}
      </div>

      {/* Quick Practice Questions */}
      <div className="bg-white rounded-2xl p-6 border border-stone-100">
        <h3 className="font-serif text-lg font-semibold text-stone-900 mb-4">Quick Practice Questions</h3>
        <div className="space-y-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => { handleReset(); setQuestion(q); }}
              className={`
                w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group
                ${question === q 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-stone-50 border-stone-100 hover:border-emerald-200 hover:bg-emerald-50/50 text-stone-700'
                }
              `}
            >
              <span className="text-sm">{q}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${question === q ? 'text-emerald-600' : 'text-stone-400 group-hover:translate-x-1'}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Results View Component
function ResultsView({ 
  result, 
  onReset, 
  onNewQuestion 
}: { 
  result: any
  onReset: () => void
  onNewQuestion: () => void 
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-rose-600'
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500'
    if (score >= 60) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Overall Score Card */}
      <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm text-center">
        <span className="text-xs font-bold tracking-widest text-stone-400 uppercase mb-4 block">
          Your Score
        </span>
        <div className={`text-7xl font-bold mb-2 ${getScoreColor(result.attempt?.overall_score || 0)}`}>
          {result.attempt?.overall_score || 0}
        </div>
        <div className="text-stone-500 mb-6">out of 100</div>
        <div className="h-3 bg-stone-100 rounded-full overflow-hidden max-w-md mx-auto">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(result.attempt?.overall_score || 0)}`}
            style={{ width: `${result.attempt?.overall_score || 0}%` }}
          />
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="bg-white rounded-2xl p-6 border border-stone-100">
        <h3 className="font-serif text-lg font-semibold text-stone-900 mb-4">Breakdown</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Clarity', score: result.attempt?.clarity_score || 0 },
            { label: 'Structure', score: result.attempt?.structure_score || 0 },
            { label: 'Confidence', score: result.attempt?.confidence_score || 0 },
            { label: 'Pacing', score: result.attempt?.pacing_score || 0 },
          ].map((item) => (
            <div key={item.label} className="bg-stone-50 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-stone-600">{item.label}</span>
                <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>{item.score}</span>
              </div>
              <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${getProgressColor(item.score)}`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-4">
        {result.attempt?.strengths && result.attempt.strengths.length > 0 && (
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Strengths
            </h4>
            <ul className="space-y-2">
              {result.attempt.strengths.map((s: string, i: number) => (
                <li key={i} className="text-sm text-emerald-900 flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.attempt?.improvements && result.attempt.improvements.length > 0 && (
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Areas to Improve
            </h4>
            <ul className="space-y-2">
              {result.attempt.improvements.map((s: string, i: number) => (
                <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">→</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Improved Version */}
      {result.improved_answer?.improved_version && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
          <h4 className="font-serif text-lg font-semibold text-emerald-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Improved Version
          </h4>
          <div className="bg-white rounded-xl p-5 border border-emerald-100 mb-4">
            <p className="text-stone-700 text-sm leading-relaxed">
              {result.improved_answer.improved_version}
            </p>
          </div>
          
          {result.improved_answer?.coaching_tips && (
            <div className="flex items-start gap-2 text-sm text-emerald-800">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span><strong>Tip:</strong> {result.improved_answer.coaching_tips[0]}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button 
          onClick={onReset}
          className="bg-white hover:bg-stone-50 text-stone-700 px-6 py-3 rounded-full font-medium border border-stone-200 transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
        <button 
          onClick={onNewQuestion}
          className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2"
        >
          Next Question
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

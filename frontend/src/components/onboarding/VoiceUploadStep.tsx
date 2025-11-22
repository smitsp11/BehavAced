'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Mic, MicOff, Square, ArrowRight, ArrowLeft, Volume2 } from 'lucide-react'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'

interface VoiceUploadStepProps {
  onNext: () => void
  onPrev: () => void
}

export default function VoiceUploadStep({ onNext, onPrev }: VoiceUploadStepProps) {
  const { setVoiceFile, setSkipVoice, skipVoice } = useOnboardingStore()
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))

        // Create a File object from the blob
        const file = new File([blob], 'voice-sample.wav', { type: 'audio/wav' })
        setVoiceFile(file)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSkip = () => {
    setSkipVoice(true)
    setVoiceFile(null)
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    onNext()
  }

  const handleContinue = () => {
    if (audioBlob || skipVoice) {
      onNext()
    }
  }

  const handleRecordAgain = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setVoiceFile(null)
    setRecordingTime(0)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-6 h-6" />
          Voice Sample (Optional)
        </CardTitle>
        <CardDescription>
          Record a short voice sample to help our AI better match your speaking style and tone. This step is completely optional.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recording Interface */}
        <div className="text-center">
          {!audioBlob && !isRecording && (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Mic className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600">
                Click the button below to start recording. We'll capture your natural speaking voice.
              </p>
              <Button
                onClick={startRecording}
                size="lg"
                className="bg-red-500 hover:bg-red-600"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            </div>
          )}

          {isRecording && (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                <Mic className="w-10 h-10 text-red-600" />
              </div>
              <div>
                <p className="text-lg font-mono text-red-600 mb-2">{formatTime(recordingTime)}</p>
                <p className="text-gray-600">Recording... Speak naturally about your work style.</p>
              </div>
              <Button
                onClick={stopRecording}
                variant="outline"
                size="lg"
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </Button>
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <Volume2 className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <p className="text-green-600 font-medium mb-2">Recording Complete!</p>
                <p className="text-gray-600 mb-4">Duration: {formatTime(recordingTime)}</p>
                {audioUrl && (
                  <audio controls className="w-full max-w-sm mx-auto">
                    <source src={audioUrl} type="audio/wav" />
                  </audio>
                )}
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleRecordAgain} variant="outline">
                  Record Again
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Why record your voice?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• AI learns your natural speaking pace and tone</li>
            <li>• Answers sound more authentically like you</li>
            <li>• Better matches your communication style</li>
            <li>• Improves overall answer quality</li>
          </ul>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Not ready to record? No problem!</p>
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800"
          >
            Skip Voice Sample
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={onPrev}
            variant="outline"
            className="flex-1"
            disabled={isRecording}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!audioBlob && !skipVoice}
            className="flex-1"
            size="lg"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Privacy Note */}
        <p className="text-xs text-gray-500 text-center">
          Voice samples are processed locally and never stored on external servers.
        </p>
      </CardContent>
    </Card>
  )
}

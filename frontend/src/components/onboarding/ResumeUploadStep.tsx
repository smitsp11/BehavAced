'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Upload, FileText, X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { uploadResume } from '@/lib/api'
import { fileToBase64, getFileExtension } from '@/lib/utils'

interface ResumeUploadStepProps {
  onNext: () => void
  onPrev: () => void
}

const ANALYZING_PHRASES = [
  'Learning who you are',
  'Parsing your experience',
  'Extracting your stories',
  'Understanding your style',
  'Analyzing achievements',
  'Reading your background',
  'Processing your resume',
  'Discovering your voice'
]

export default function ResumeUploadStep({ onNext, onPrev }: ResumeUploadStepProps) {
  const { resumeFile, setResumeFile, setUserId, setBackgroundTaskStatus } = useOnboardingStore()
  const [uploading, setUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [error, setError] = useState('')
  const [analyzingPhrase, setAnalyzingPhrase] = useState(ANALYZING_PHRASES[0])
  const [phraseIndex, setPhraseIndex] = useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Rotate through analyzing phrases while uploading
  useEffect(() => {
    if (uploading) {
      const interval = setInterval(() => {
        setPhraseIndex((prev) => {
          const nextIndex = (prev + 1) % ANALYZING_PHRASES.length
          setAnalyzingPhrase(ANALYZING_PHRASES[nextIndex])
          return nextIndex
        })
      }, 1500) // Change phrase every 1.5 seconds

      return () => clearInterval(interval)
    } else {
      // Reset to first phrase when not uploading
      setPhraseIndex(0)
      setAnalyzingPhrase(ANALYZING_PHRASES[0])
    }
  }, [uploading])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      const validExtensions = ['.pdf', '.docx', '.doc', '.txt']

      const fileExt = getFileExtension(file.name).toLowerCase()
      const isValidType = validTypes.includes(file.type) || validExtensions.some(ext => fileExt === ext)

      if (!isValidType) {
        setError('Please select a PDF, DOCX, or TXT file')
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setResumeFile(file)
      setError('')
    }
  }

  const handleRemoveFile = () => {
    setResumeFile(null)
    setUploadComplete(false)
    setError('')
  }

  const handleUpload = async () => {
    if (!resumeFile) return

    setUploading(true)
    setError('')

    try {
      const base64Content = await fileToBase64(resumeFile)
      const fileExt = getFileExtension(resumeFile.name)

      // TEMPORARILY DISABLED: Background processing for design testing
      // Mark resume processing as in progress
      // setBackgroundTaskStatus('resumeProcessing', 'processing')
      
      const response = await uploadResume(base64Content, resumeFile.name, fileExt)

      if (response.success) {
        setUserId(response.user_id)
        setUploadComplete(true)
        // TEMPORARILY DISABLED: Background processing for design testing
        // Mark as completed - resume processing continues in background (already handled by backend)
        // setBackgroundTaskStatus('resumeProcessing', 'completed')
        // Proceed to next step immediately
        onNext()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload resume')
      // TEMPORARILY DISABLED: Background processing for design testing
      // setBackgroundTaskStatus('resumeProcessing', 'error', err.message || 'Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Upload Your Resume
        </CardTitle>
        <CardDescription>
          We'll analyze your experience and automatically extract stories, skills, and achievements for behavioral interviews.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        {!resumeFile && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload"
            />
            <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500 mb-4">
                PDF, DOCX, or TXT (max 10MB)
              </p>
              <Button 
                variant="outline" 
                size="lg"
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                Choose File
              </Button>
            </div>
          </div>
        )}

        {/* File Preview */}
        {resumeFile && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{resumeFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(resumeFile.size)}</p>
                </div>
              </div>
              {!uploadComplete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Upload Status */}
            {uploadComplete && (
              <div className="mt-4 flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Resume uploaded successfully!</span>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={onPrev}
            variant="outline"
            className="px-6 py-6 rounded-full border-2 border-gray-200 hover:border-green-400 transition-all"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
            disabled={uploading}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!resumeFile || uploading || uploadComplete}
            className={`flex-1 bg-gradient-to-r from-[#7fffd2] to-[#28d98a] text-white rounded-full px-8 py-6 text-lg font-semibold shadow-[0_8px_25px_rgba(40,217,138,0.35)] hover:shadow-[0_12px_35px_rgba(40,217,138,0.45)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {analyzingPhrase}
              </>
            ) : uploadComplete ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Upload Complete
              </>
            ) : resumeFile ? (
              <>
                Upload & Analyze
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 text-center">
          Your resume is processed locally and securely. We extract behavioral interview stories, skills, and achievements.
        </div>
      </CardContent>
    </Card>
  )
}

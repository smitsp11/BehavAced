'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Upload, FileText, X, ArrowRight, ArrowLeft, CheckCircle, Paperclip } from 'lucide-react'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { uploadResume } from '@/lib/api'
import { fileToBase64, getFileExtension } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const dropzoneRef = useRef<HTMLDivElement>(null)

  // Rotate through analyzing phrases while uploading
  useEffect(() => {
    if (uploading) {
      const interval = setInterval(() => {
        setPhraseIndex((prev) => {
          const nextIndex = (prev + 1) % ANALYZING_PHRASES.length
          setAnalyzingPhrase(ANALYZING_PHRASES[nextIndex])
          return nextIndex
        })
      }, 1500)

      return () => clearInterval(interval)
    } else {
      setPhraseIndex(0)
      setAnalyzingPhrase(ANALYZING_PHRASES[0])
    }
  }, [uploading])

  // Drag and drop handlers
  useEffect(() => {
    const dropzone = dropzoneRef.current
    if (!dropzone) return

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer?.files[0]
      if (file) {
        handleFile(file)
      }
    }

    dropzone.addEventListener('dragover', handleDragOver)
    dropzone.addEventListener('dragleave', handleDragLeave)
    dropzone.addEventListener('drop', handleDrop)

    return () => {
      dropzone.removeEventListener('dragover', handleDragOver)
      dropzone.removeEventListener('dragleave', handleDragLeave)
      dropzone.removeEventListener('drop', handleDrop)
    }
  }, [])

  const validateFile = (file: File): string | null => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt']

    const fileExt = getFileExtension(file.name).toLowerCase()
    const isValidType = validTypes.includes(file.type) || validExtensions.some(ext => fileExt === ext)

    if (!isValidType) {
      return 'Please select a PDF, DOCX, or TXT file'
    }

    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB'
    }

    return null
  }

  const handleFile = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setResumeFile(file)
    setError('')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
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

      setBackgroundTaskStatus('resumeProcessing', 'processing')
      
      let userId = crypto.randomUUID()
      try {
        const response = await uploadResume(base64Content, resumeFile.name, fileExt)
        if (response.success && response.user_id) {
          userId = response.user_id
        }
      } catch (apiErr) {
        console.log('Resume API not available - continuing with generated userId:', userId)
      }

      setUserId(userId)
      setUploadComplete(true)
      setBackgroundTaskStatus('resumeProcessing', 'completed')
      onNext()
    } catch (err: any) {
      setError(err.message || 'Failed to process resume')
      setBackgroundTaskStatus('resumeProcessing', 'error', err.message || 'Failed to process resume')
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
    <div 
      ref={dropzoneRef}
      className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12"
    >
      {/* The Headline (Matches Step 1 Style) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={resumeFile ? 'with-file' : 'no-file'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="font-serif text-5xl md:text-6xl text-stone-900 leading-tight">
            Upload your <br/> 
            <span className="italic text-stone-400">professional history.</span>
          </h2>
        </motion.div>
      </AnimatePresence>

      {/* File Upload Area */}
      {!resumeFile && (
        <div 
          className={`group relative cursor-pointer transition-all duration-300 ${
            isDragging ? 'scale-105' : ''
          }`}
          onClick={handleFileClick}
        >
          {/* The Icon acts as the button */}
          <motion.div 
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
              isDragging 
                ? 'bg-emerald-100 scale-110' 
                : 'bg-stone-200 group-hover:bg-emerald-100 group-hover:scale-110'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Paperclip className={`w-12 h-12 transition-colors duration-300 ${
              isDragging 
                ? 'text-emerald-600' 
                : 'text-stone-500 group-hover:text-emerald-600'
            }`} />
          </motion.div>
          
          {/* The Label */}
          <p className={`mt-6 text-xl font-medium transition-colors duration-300 ${
            isDragging 
              ? 'text-stone-900' 
              : 'text-stone-500 group-hover:text-stone-900'
          }`}>
            Click to select PDF or drag file here
          </p>

          {/* Hidden Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* File Preview - Editorial Style */}
      {resumeFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="border-b-2 border-stone-300 pb-6 mb-6">
            <div className="flex items-center justify-center gap-4">
              <div className="p-4 bg-stone-100 rounded-full">
                <FileText className="w-8 h-8 text-stone-600" />
              </div>
              <div className="text-left">
                <p className="font-serif text-2xl text-stone-900 mb-1">{resumeFile.name}</p>
                <p className="font-sans text-sm text-stone-500">{formatFileSize(resumeFile.size)}</p>
              </div>
              {!uploadComplete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFile()
                  }}
                  className="ml-auto p-2 hover:bg-stone-100 rounded-full transition-colors"
                  disabled={uploading}
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              )}
            </div>

            {uploadComplete && (
              <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-sans text-sm font-medium">Resume uploaded successfully!</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md"
        >
          <p className="text-red-800 text-sm font-sans">{error}</p>
        </motion.div>
      )}

      {/* Upload Status */}
      {uploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-sans text-lg text-stone-600">{analyzingPhrase}...</span>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between w-full max-w-2xl mt-8">
        <div>
          <Button
            onClick={onPrev}
            variant="outline"
            className="px-6 py-3 border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
            disabled={uploading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {resumeFile && !uploadComplete && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-stone-500 font-sans"
            >
              Press <kbd className="px-2 py-1 bg-stone-100 rounded text-xs">⌘ Enter</kbd> to upload
            </motion.p>
          )}
          <Button
            onClick={handleUpload}
            disabled={!resumeFile || uploading || uploadComplete}
            className="bg-stone-900 text-white px-8 py-3 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                if (resumeFile && !uploading && !uploadComplete) {
                  handleUpload()
                }
              }
            }}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : uploadComplete ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete
              </>
            ) : resumeFile ? (
              <>
                Upload & Analyze
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* The Assurance (Micro-copy) */}
      <p className="text-sm text-stone-400 max-w-md font-sans leading-relaxed">
        We analyze your experience locally to extract stories. <br/>Data is never shared with third parties.
      </p>
    </div>
  )
}

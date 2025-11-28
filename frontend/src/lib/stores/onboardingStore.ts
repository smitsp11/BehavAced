import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types for onboarding data
export interface PersonalityQuestionnaire {
  work_style: string
  communication: string
  strengths: string
  challenges: string
  writing_sample?: string
}

export interface ManualExperienceEntry {
  role_title: string
  company: string
  location?: string
  start_date: string
  end_date?: string
  description: string
  achievements: string[]
  skills_used: string[]
}

export interface ManualExperienceData {
  experiences: ManualExperienceEntry[]
  education?: any
  additional_skills: string[]
}

export type OnboardingStep =
  | 'personality'
  | 'experience-choice'
  | 'resume-upload'
  | 'manual-experience'
  | 'voice-upload'
  | 'processing'
  | 'complete'

export type BackgroundTaskStatus = 'idle' | 'processing' | 'completed' | 'error'

export interface BackgroundTask {
  status: BackgroundTaskStatus
  error?: string
}

export interface BackgroundTasks {
  personalitySnapshot: BackgroundTask
  resumeProcessing: BackgroundTask
  storyBrain: BackgroundTask
}

export interface OnboardingState {
  // Current step
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]

  // User data
  userId: string | null

  // Step data
  personalityData: PersonalityQuestionnaire | null
  experienceChoice: 'resume' | 'manual' | null
  resumeFile: File | null
  manualExperienceData: ManualExperienceData | null
  voiceFile: File | null
  skipVoice: boolean

  // Processing state
  isProcessing: boolean
  processingStep: string
  processingProgress: number

  // Error handling
  error: string | null

  // Background tasks
  backgroundTasks: BackgroundTasks

  // Actions
  setStep: (step: OnboardingStep) => void
  completeStep: (step: OnboardingStep) => void
  setUserId: (userId: string) => void
  setPersonalityData: (data: PersonalityQuestionnaire) => void
  setExperienceChoice: (choice: 'resume' | 'manual') => void
  setResumeFile: (file: File | null) => void
  setManualExperienceData: (data: ManualExperienceData) => void
  setVoiceFile: (file: File | null) => void
  setSkipVoice: (skip: boolean) => void
  setProcessing: (isProcessing: boolean, step?: string, progress?: number) => void
  setError: (error: string | null) => void
  setBackgroundTaskStatus: (task: keyof BackgroundTasks, status: BackgroundTaskStatus, error?: string) => void
  getBackgroundTaskStatus: (task: keyof BackgroundTasks) => BackgroundTask
  reset: () => void

  // Computed properties
  isStepCompleted: (step: OnboardingStep) => boolean
  canProceedToStep: (step: OnboardingStep) => boolean
  getNextStep: () => OnboardingStep | null
  getPrevStep: () => OnboardingStep | null
}

const initialBackgroundTasks: BackgroundTasks = {
  personalitySnapshot: { status: 'idle' },
  resumeProcessing: { status: 'idle' },
  storyBrain: { status: 'idle' },
}

const initialState = {
  currentStep: 'personality' as OnboardingStep,
  completedSteps: [] as OnboardingStep[],
  userId: null as string | null,
  personalityData: null as PersonalityQuestionnaire | null,
  experienceChoice: null as 'resume' | 'manual' | null,
  resumeFile: null as File | null,
  manualExperienceData: null as ManualExperienceData | null,
  voiceFile: null as File | null,
  skipVoice: false,
  isProcessing: false,
  processingStep: '',
  processingProgress: 0,
  error: null as string | null,
  backgroundTasks: initialBackgroundTasks,
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      completeStep: (step) => set((state) => ({
        completedSteps: state.completedSteps.includes(step)
          ? state.completedSteps
          : [...state.completedSteps, step]
      })),

      setUserId: (userId) => set({ userId }),

      setPersonalityData: (data) => set({ personalityData: data }),

      setExperienceChoice: (choice) => set({ experienceChoice: choice }),

      setResumeFile: (file) => set({ resumeFile: file }),

      setManualExperienceData: (data) => set({ manualExperienceData: data }),

      setVoiceFile: (file) => set({ voiceFile: file }),

      setSkipVoice: (skip) => set({ skipVoice: skip }),

      setProcessing: (isProcessing, step = '', progress = 0) => set({
        isProcessing,
        processingStep: step,
        processingProgress: progress
      }),

      setError: (error) => set({ error }),

      setBackgroundTaskStatus: (task, status, error) => set((state) => ({
        backgroundTasks: {
          ...state.backgroundTasks,
          [task]: {
            status,
            error: error || undefined,
          },
        },
      })),

      getBackgroundTaskStatus: (task) => get().backgroundTasks[task],

      reset: () => set({ ...initialState, backgroundTasks: initialBackgroundTasks }),

      isStepCompleted: (step) => get().completedSteps.includes(step),

      canProceedToStep: (step) => {
        const state = get()
        switch (step) {
          case 'personality':
            return true
          case 'experience-choice':
            return state.isStepCompleted('personality')
          case 'resume-upload':
          case 'manual-experience':
            return state.isStepCompleted('experience-choice')
          case 'voice-upload':
            return state.isStepCompleted('resume-upload') || state.isStepCompleted('manual-experience')
          case 'processing':
            return (state.isStepCompleted('resume-upload') || state.isStepCompleted('manual-experience')) &&
                   (state.isStepCompleted('voice-upload') || state.skipVoice)
          case 'complete':
            return state.isStepCompleted('processing')
          default:
            return false
        }
      },

      getNextStep: () => {
        const state = get()
        const stepOrder: OnboardingStep[] = [
          'personality',
          'experience-choice',
          'resume-upload',
          'manual-experience',
          'voice-upload',
          'processing',
          'complete'
        ]

        const currentIndex = stepOrder.indexOf(state.currentStep)
        if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
          return null
        }

        // Skip certain steps based on choices
        let nextIndex = currentIndex + 1
        while (nextIndex < stepOrder.length) {
          const nextStep = stepOrder[nextIndex]

          // Skip resume upload if manual chosen
          if (nextStep === 'resume-upload' && state.experienceChoice === 'manual') {
            nextIndex++
            continue
          }

          // Skip manual experience if resume chosen
          if (nextStep === 'manual-experience' && state.experienceChoice === 'resume') {
            nextIndex++
            continue
          }

          // Skip voice upload if user chose to skip
          if (nextStep === 'voice-upload' && state.skipVoice) {
            nextIndex++
            continue
          }

          return nextStep
        }

        return null
      },

      getPrevStep: () => {
        const state = get()
        const stepOrder: OnboardingStep[] = [
          'personality',
          'experience-choice',
          'resume-upload',
          'manual-experience',
          'voice-upload',
          'processing',
          'complete'
        ]

        const currentIndex = stepOrder.indexOf(state.currentStep)
        if (currentIndex <= 0) {
          return null
        }

        let prevIndex = currentIndex - 1
        while (prevIndex >= 0) {
          const prevStep = stepOrder[prevIndex]

          // Skip steps that were conditionally skipped
          if (prevStep === 'resume-upload' && state.experienceChoice === 'manual') {
            prevIndex--
            continue
          }
          if (prevStep === 'manual-experience' && state.experienceChoice === 'resume') {
            prevIndex--
            continue
          }

          return prevStep
        }

        return null
      },
    }),
    {
      name: 'behavaced-onboarding',
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        userId: state.userId,
        personalityData: state.personalityData,
        experienceChoice: state.experienceChoice,
        manualExperienceData: state.manualExperienceData,
        skipVoice: state.skipVoice,
      }),
    }
  )
)

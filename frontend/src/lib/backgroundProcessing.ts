/**
 * Background Processing Service
 * Handles all onboarding processing tasks in the background
 */

import { useOnboardingStore, PersonalityQuestionnaire, ManualExperienceData } from '@/lib/stores/onboardingStore'

interface ProcessingData {
  userId: string
  personalityData: PersonalityQuestionnaire | null
  experienceChoice: 'resume' | 'manual' | null
  resumeFile: File | null
  manualExperienceData: ManualExperienceData | null
  voiceFile: File | null
}

// Track if processing has already started to prevent duplicates
let processingStarted = false

/**
 * Start all background processing tasks
 * TEMPORARILY DISABLED - Just marks everything as complete for UI testing
 */
export async function startBackgroundProcessing(data: ProcessingData): Promise<void> {
  // Prevent duplicate runs
  if (processingStarted) {
    console.log('⚠️ Background processing already started, skipping duplicate call')
    return
  }
  processingStarted = true

  const { userId } = data

  const store = useOnboardingStore.getState()
  
  // Check if already completed
  if (store.backgroundTasks.overall.status === 'completed') {
    console.log('⚠️ Background processing already completed, skipping')
    return
  }

  console.log('🚀 Background processing DISABLED for testing - marking all as complete for user:', userId)

  // Mark overall processing as started
  store.setBackgroundTaskStatus('overall', 'processing')

  // Simulate brief processing delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Mark all tasks as complete without making API calls
  store.setBackgroundTaskStatus('personalitySnapshot', 'completed')
  store.setBackgroundTaskStatus('resumeProcessing', 'completed')
  store.setBackgroundTaskStatus('stories', 'completed')
  store.setBackgroundTaskStatus('storyBrain', 'completed')
  store.setBackgroundTaskStatus('overall', 'completed')

  console.log('🎉 Background processing skipped - all marked as complete!')
}


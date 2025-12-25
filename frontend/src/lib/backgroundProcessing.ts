/**
 * Background Processing Service
 * Handles all onboarding processing tasks in the background
 */

import { 
  createPersonalitySnapshot, 
  processManualExperience, 
  generateStories, 
  generateStoryBrain 
} from '@/lib/api'
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
 * This runs personality snapshot, experience processing, stories, and story brain generation
 * all in parallel where possible
 */
export async function startBackgroundProcessing(data: ProcessingData): Promise<void> {
  // Prevent duplicate runs
  if (processingStarted) {
    console.log('⚠️ Background processing already started, skipping duplicate call')
    return
  }
  processingStarted = true

  const { 
    userId, 
    personalityData, 
    experienceChoice, 
    manualExperienceData 
  } = data

  const store = useOnboardingStore.getState()
  
  // Check if already completed
  if (store.backgroundTasks.overall.status === 'completed') {
    console.log('⚠️ Background processing already completed, skipping')
    return
  }

  // Mark overall processing as started
  store.setBackgroundTaskStatus('overall', 'processing')

  console.log('🚀 Starting background processing for user:', userId)

  // Run all tasks in parallel
  const tasks: Promise<void>[] = []

  // Task 1: Personality Snapshot
  if (personalityData) {
    const personalityTask = (async () => {
      try {
        store.setBackgroundTaskStatus('personalitySnapshot', 'processing')
        console.log('📝 Processing personality snapshot...')
        
        const responses = {
          work_style: personalityData.work_style,
          communication: personalityData.communication,
          strengths: personalityData.strengths,
          challenges: personalityData.challenges,
        }
        
        await createPersonalitySnapshot(userId, responses, personalityData.writing_sample)
        store.setBackgroundTaskStatus('personalitySnapshot', 'completed')
        console.log('✅ Personality snapshot completed')
      } catch (error: any) {
        console.error('❌ Personality snapshot failed:', error)
        store.setBackgroundTaskStatus('personalitySnapshot', 'error', error.message)
      }
    })()
    tasks.push(personalityTask)
  } else {
    store.setBackgroundTaskStatus('personalitySnapshot', 'completed')
  }

  // Task 2: Manual Experience Processing (if applicable)
  if (experienceChoice === 'manual' && manualExperienceData) {
    const experienceTask = (async () => {
      try {
        store.setBackgroundTaskStatus('resumeProcessing', 'processing')
        console.log('💼 Processing manual experience...')
        
        await processManualExperience(
          userId,
          manualExperienceData.experiences,
          undefined,
          manualExperienceData.additional_skills
        )
        store.setBackgroundTaskStatus('resumeProcessing', 'completed')
        console.log('✅ Manual experience processed')
      } catch (error: any) {
        console.error('❌ Manual experience processing failed:', error)
        store.setBackgroundTaskStatus('resumeProcessing', 'error', error.message)
      }
    })()
    tasks.push(experienceTask)
  } else if (experienceChoice === 'resume') {
    // Resume was already processed during upload, mark as completed
    store.setBackgroundTaskStatus('resumeProcessing', 'completed')
  }

  // Wait for personality and experience to complete before generating stories
  await Promise.allSettled(tasks)

  // Task 3: Generate Stories (depends on experience data)
  try {
    store.setBackgroundTaskStatus('stories', 'processing')
    console.log('📚 Generating stories...')
    
    await generateStories(userId)
    store.setBackgroundTaskStatus('stories', 'completed')
    console.log('✅ Stories generated')
  } catch (error: any) {
    console.error('❌ Story generation failed:', error)
    store.setBackgroundTaskStatus('stories', 'error', error.message)
  }

  // Task 4: Generate Story Brain (depends on stories)
  try {
    store.setBackgroundTaskStatus('storyBrain', 'processing')
    console.log('🧠 Generating story brain...')
    
    await generateStoryBrain(userId)
    store.setBackgroundTaskStatus('storyBrain', 'completed')
    console.log('✅ Story brain generated')
  } catch (error: any) {
    console.error('❌ Story brain generation failed:', error)
    store.setBackgroundTaskStatus('storyBrain', 'error', error.message)
  }

  // Mark overall as completed
  store.setBackgroundTaskStatus('overall', 'completed')
  console.log('🎉 All background processing completed!')
}


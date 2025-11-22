/**
 * API Client for BehavAced Backend
 */

// Get API URL - prioritize env var, but ensure we always have a valid URL
const getApiUrl = () => {
  // In browser, check if env var is available
  if (typeof window !== 'undefined') {
    // Next.js embeds NEXT_PUBLIC_ vars at build time
    const envUrl = process.env.NEXT_PUBLIC_API_URL
    if (envUrl) {
      return envUrl
    }
  }
  // Fallback to localhost
  return 'http://localhost:8000'
}

const API_URL = getApiUrl()

// Log API URL in development for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔧 API Client initialized')
  console.log('   API_URL:', API_URL)
  console.log('   NEXT_PUBLIC_API_URL from env:', process.env.NEXT_PUBLIC_API_URL)
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Profile API
export const uploadResume = async (fileContent: string, fileName: string, fileType: string) => {
  const response = await fetch(`${API_URL}/api/profile/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_content: fileContent,
      file_name: fileName,
      file_type: fileType,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to upload resume')
  }

  return response.json()
}

export const submitPersonality = async (responses: any, writingSample?: string) => {
  const response = await fetch(`${API_URL}/api/profile/personality`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      responses,
      writing_sample: writingSample,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to analyze personality')
  }

  return response.json()
}

export const getProfile = async (userId: string) => {
  const response = await fetch(`${API_URL}/api/profile/${userId}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile')
  }

  return response.json()
}

// Stories API
export const generateStories = async (userId: string) => {
  const response = await fetch(`${API_URL}/api/stories/generate/${userId}`, {
    method: 'POST',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to generate stories')
  }

  return response.json()
}

export const getStories = async (userId: string) => {
  const response = await fetch(`${API_URL}/api/stories/${userId}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch stories')
  }

  return response.json()
}

// Question & Answer API
export const generateAnswer = async (userId: string, question: string, context?: { company?: string; role?: string }) => {
  const response = await fetch(`${API_URL}/api/answers/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      question,
      company_context: context?.company,
      role_context: context?.role,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to generate answer')
  }

  return response.json()
}

// Practice API
export const scorePractice = async (
  userId: string,
  question: string,
  audioBase64?: string | Blob,
  transcript?: string,
  durationSeconds?: number
) => {
  let processedAudioBase64: string | undefined

  // Convert Blob to base64 if needed
  if (audioBase64 instanceof Blob) {
    processedAudioBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data:audio/webm;base64, prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(audioBase64)
    })
  } else {
    processedAudioBase64 = audioBase64
  }

  const response = await fetch(`${API_URL}/api/practice/score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      question,
      audio_base64: processedAudioBase64,
      transcript,
      duration_seconds: durationSeconds || 0,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to score practice')
  }

  return response.json()
}

export const getPracticeHistory = async (userId: string, limit = 10) => {
  const response = await fetch(`${API_URL}/api/practice/history/${userId}?limit=${limit}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch practice history')
  }

  return response.json()
}

// Practice Plan API
export const generatePlan = async (userId: string, durationDays = 7, focusAreas?: string[]) => {
  const response = await fetch(`${API_URL}/api/plans/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      duration_days: durationDays,
      focus_areas: focusAreas,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to generate plan')
  }

  return response.json()
}

export const getPlan = async (userId: string) => {
  const response = await fetch(`${API_URL}/api/plans/${userId}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch plan')
  }

  return response.json()
}

// Demo API
export const generateDemoAnswer = async (
  question: string,
  companyContext?: string,
  roleContext?: string,
  industry?: string
) => {
  console.log('🚀 STEP 1: generateDemoAnswer called')
  console.log('   Question:', question)
  console.log('   Current API_URL value:', API_URL)
  console.log('   process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

  try {
    const requestUrl = `${API_URL}/api/demo/answer`
    const requestBody = JSON.stringify({
      question,
      company_context: companyContext,
      role_context: roleContext,
      industry,
    })
    
    console.log('🚀 STEP 2: Preparing fetch request')
    console.log('   Request URL:', requestUrl)
    console.log('   Request method: POST')
    console.log('   Request body:', requestBody)
    
    // Test if we can reach the health endpoint first
    console.log('🚀 STEP 2.5: Testing health endpoint first...')
    try {
      const healthResponse = await fetch(`${API_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
      })
      console.log('   Health check status:', healthResponse.status)
      const healthData = await healthResponse.json()
      console.log('   Health check response:', healthData)
    } catch (healthError: any) {
      console.error('   ❌ Health check failed:', healthError)
      console.error('   Error name:', healthError.name)
      console.error('   Error message:', healthError.message)
      console.error('   Error stack:', healthError.stack)
      throw new Error(`Cannot reach backend at ${API_URL}. Health check failed: ${healthError.message}`)
    }
    
    console.log('🚀 STEP 3: Making actual API request...')
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    console.log('🚀 STEP 4: Received response')
    console.log('   Response status:', response.status)
    console.log('   Response statusText:', response.statusText)
    console.log('   Response ok:', response.ok)
    console.log('   Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorMessage = 'Failed to generate demo answer'
      try {
        const error = await response.json()
        console.error('   Error response body:', error)
        errorMessage = error.detail || error.message || errorMessage
      } catch (e) {
        console.error('   Could not parse error response as JSON')
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    console.log('🚀 STEP 5: Parsing response JSON...')
    const data = await response.json()
    console.log('🚀 STEP 6: Response parsed successfully')
    console.log('   Response data:', data)
    
    // Ensure the response has the expected structure
    if (!data.success || !data.answer) {
      console.error('❌ Invalid response structure:', data)
      throw new Error('Invalid response format from server')
    }
    
    console.log('✅ SUCCESS: Returning valid response')
    return data
  } catch (error: any) {
    clearTimeout(timeoutId)
    
    console.error('❌ ERROR CAUGHT in generateDemoAnswer')
    console.error('   Error type:', typeof error)
    console.error('   Error name:', error?.name)
    console.error('   Error message:', error?.message)
    console.error('   Error stack:', error?.stack)
    console.error('   Error object:', error)
    
    // Handle different error types
    if (error.name === 'AbortError') {
      console.error('   → AbortError: Request was aborted (timeout or cancelled)')
      throw new Error('Request timed out. The server is taking too long to respond. Please try again.')
    }
    
    // Check for network errors
    const errorMsg = error?.message || ''
    if (errorMsg.includes('Failed to fetch') || 
        errorMsg.includes('NetworkError') ||
        errorMsg.includes('Network request failed') ||
        errorMsg.includes('Load failed') ||
        errorMsg.includes('fetch')) {
      console.error('   → Network/Fetch error detected')
      console.error('   → This usually means the browser cannot reach the server')
      throw new Error(`Unable to connect to the server at ${API_URL}. Please check if the backend is running.`)
    }
    
    if (errorMsg.includes('CORS') || errorMsg.includes('OPTIONS')) {
      console.error('   → CORS error detected')
      throw new Error('CORS error. Please check that the backend CORS settings allow requests from http://localhost:3000')
    }
    
    // Re-throw other errors with original message
    console.error('   → Re-throwing original error')
    throw error
  }
}

// Personalized Answers API
export const generatePersonalizedAnswer = async (
  userId: string,
  question: string,
  companyContext?: string,
  roleContext?: string
) => {
  const response = await fetch(`${API_URL}/api/answers/personalized`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      question,
      company_context: companyContext,
      role_context: roleContext,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to generate personalized answer')
  }

  return response.json()
}

// Dev API (only available in development)
const isDev = process.env.NODE_ENV === 'development'

export const saveCachedProfile = async (userId: string) => {
  if (!isDev) {
    throw new Error('This function is only available in development')
  }
  
  const response = await fetch(`${API_URL}/api/dev/save-profile/${userId}`, {
    method: 'POST',
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to save cached profile')
  }

  return response.json()
}

export const loadCachedProfile = async () => {
  if (!isDev) {
    throw new Error('This function is only available in development')
  }
  
  const response = await fetch(`${API_URL}/api/dev/load-profile`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to load cached profile')
  }

  return response.json()
}

export const getCacheStatus = async () => {
  if (!isDev) {
    throw new Error('This function is only available in development')
  }
  
  const response = await fetch(`${API_URL}/api/dev/cache-status`)
  
  if (!response.ok) {
    throw new Error('Failed to get cache status')
  }

  return response.json()
}

export const clearCache = async () => {
  if (!isDev) {
    throw new Error('This function is only available in development')
  }

  const response = await fetch(`${API_URL}/api/dev/clear-cache`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to clear cache')
  }

  return response.json()
}

// Onboarding API
export const createPersonalitySnapshot = async (userId: string, responses: any, writingSample?: string) => {
  const response = await fetch(`${API_URL}/api/onboarding/personality`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      responses,
      writing_sample: writingSample,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to create personality snapshot')
  }

  return response.json()
}

export const processManualExperience = async (userId: string, experiences: any[], education?: any, additionalSkills?: string[]) => {
  const response = await fetch(`${API_URL}/api/onboarding/manual-experience`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      experiences,
      education,
      additional_skills: additionalSkills || [],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to process manual experience')
  }

  return response.json()
}

export const uploadVoice = async (userId: string, audioBase64: string, durationSeconds: number) => {
  const response = await fetch(`${API_URL}/api/onboarding/voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      audio_base64: audioBase64,
      duration_seconds: durationSeconds,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to upload voice sample')
  }

  return response.json()
}

export const generateStoryBrain = async (userId: string) => {
  const response = await fetch(`${API_URL}/api/story-brain/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to generate story brain')
  }

  return response.json()
}


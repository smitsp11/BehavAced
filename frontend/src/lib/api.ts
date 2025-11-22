/**
 * API Client for BehavAced Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
  audioBase64?: string,
  transcript?: string,
  durationSeconds?: number
) => {
  const response = await fetch(`${API_URL}/api/practice/score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      question,
      audio_base64: audioBase64,
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
  const response = await fetch(`${API_URL}/api/demo/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      company_context: companyContext,
      role_context: roleContext,
      industry,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to generate demo answer')
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


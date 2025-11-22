# Phase 6 - "Cluely Energy" System Architecture

## Overview

Phase 6 introduces the refined "Cluely Energy" design system with soft gradients, floating cards, and calm transitions. This document outlines the implemented design system, motion primitives, and future system interfaces for scalable development.

## 🎨 Design System - "Cluely Energy"

### Color Palette
```css
/* Primary gradients - soft and calming */
--primary-start: hsl(252, 100%, 67%)  /* Soft blue */
--primary-end: hsl(243, 75%, 59%)    /* Soft purple */

/* Secondary gradients */
--secondary-start: hsl(188, 100%, 67%)  /* Soft teal */
--secondary-end: hsl(180, 100%, 67%)   /* Soft cyan */

/* Status colors - softer variants */
--success: hsl(142, 76%, 36%)
--warning: hsl(38, 92%, 50%)
--error: hsl(0, 84%, 60%)
--info: hsl(199, 89%, 48%)
```

### Typography
- **Primary Font**: Inter (system font stack)
- **Headings**: Poppins (Google Fonts)
- **Mono**: JetBrains Mono (code)
- **Line Heights**: Refined for better readability
- **Letter Spacing**: Optimized for headings

### Component Styles

#### Floating Cards
```css
.card-floating {
  box-shadow:
    0 10px 25px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.card-floating:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 40px -4px rgba(0, 0, 0, 0.15),
    0 8px 16px -4px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}
```

#### Soft Buttons
```css
.btn-soft {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease-out;
}

.btn-soft:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}
```

#### Glass Morphism
```css
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
```

## 🎭 Motion System

### Framer Motion Primitives

#### Basic Transitions
```tsx
<FadeIn>        // Opacity fade
<SlideUp>       // Slide up with fade
<SlideIn>       // Slide in from right
<ScaleIn>       // Scale with fade
```

#### Advanced Components
```tsx
<HoverCard>     // Card with hover animations
<HoverButton>   // Button with press feedback
<StaggerContainer> // Container for staggered children
<StaggerItem>   // Child with staggered animation
```

#### Loading States
```tsx
<PulseLoader>   // Gentle pulsing dots
<SpinLoader>    // Smooth spinning loader
<WaveformLoader> // Audio-style waveform bars
```

### Animation Variants
```tsx
const motionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  // ... more variants
}
```

## 🔧 System Interfaces for Future Development

### Database Persistence Layer

#### Current State
- **Storage**: In-memory (StorageService)
- **Data**: User profiles, story banks, practice sessions
- **Persistence**: File-based caching (.cache/profile.json)

#### Future Interfaces
```typescript
interface DatabaseAdapter {
  saveUserProfile(profile: UserProfile): Promise<void>
  getUserProfile(userId: string): Promise<UserProfile | null>
  savePracticeSession(session: PracticeSession): Promise<void>
  getPracticeSessions(userId: string): Promise<PracticeSession[]>
  // ... more methods
}
```

#### Migration Path
1. **Phase 1**: Supabase integration
2. **Phase 2**: PostgreSQL with full queries
3. **Phase 3**: Redis caching layer

### Caching Strategy

#### Cache Types
```typescript
interface CacheAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}
```

#### Cache Layers
- **Demo Answers**: 24-hour cache by question hash
- **Story Generation**: Per-user until profile changes
- **Personalization**: Session-duration cache
- **API Responses**: 1-hour success response cache

### Model Selection System

#### Current Config
```python
# In config.py
DEMO_ANSWER_MODEL = "gemini"
PERSONALITY_EMBED_MODEL = "gemini"
STORY_BRAIN_MODEL = "gemini"
PERSONALIZED_ANSWER_MODEL = "gemini"
```

#### Future Interface
```typescript
interface ModelSelector {
  selectModelForTask(task: keyof TaskModelMapping): AIModel
  getModelConfig(model: AIModel): ModelConfig
  updateTaskModel(task: keyof TaskModelMapping, model: AIModel): void
}
```

#### Model Strategy
- **Demo Answers**: Fast model (Claude Haiku)
- **Complex Analysis**: Advanced model (Claude Sonnet)
- **Audio Transcription**: Whisper API
- **Embeddings**: Optimized semantic models

### Dev Optimization Tools

#### DevConfig Interface
```typescript
interface DevConfig {
  enableCaching: boolean
  enableFixtures: boolean
  mockAIResponses: boolean
  skipOnboarding: boolean
  useLocalStorage: boolean
  enableDebugLogging: boolean
  mockAudioRecording: boolean
  fastMode: boolean
}
```

#### DevTools Interface
```typescript
interface DevTools {
  loadFixtures(): Promise<void>
  resetAllData(): Promise<void>
  enableFastMode(): void
  mockAPIResponse(endpoint: string, response: any): void
  exportUserData(userId: string): Promise<string>
}
```

## 📱 Mobile Responsiveness

### Responsive Design
- **Container Queries**: Adaptive layouts
- **Touch Targets**: Minimum 44px touch targets
- **Typography Scaling**: Fluid typography
- **Spacing**: Consistent spacing scale

### Breakpoints
```css
.sm: 640px   /* Mobile */
.md: 768px   /* Tablet */
.lg: 1024px  /* Desktop */
.xl: 1280px  /* Large desktop */
```

## 🚀 Performance Optimizations

### Animation Performance
- **GPU Acceleration**: Transform and opacity properties
- **Reduced Motion**: Respects user preferences
- **Staggered Loading**: Prevents animation overload

### Bundle Optimization
- **Framer Motion**: Tree-shaking enabled
- **Lazy Loading**: Component-based code splitting
- **Asset Optimization**: WebP images, font subsetting

## 🎯 Implementation Notes

### Copy & CTA Refinement
- **Conversational Tone**: "Let's build your behavioral interview cognition engine"
- **Benefit-Focused**: Emphasize personalization and AI power
- **Trust Signals**: "No account required", "Data processed locally"

### Future Development Hooks
- **Interface-First**: All system components defined via interfaces
- **Backward Compatibility**: Existing functionality preserved
- **Migration Path**: Clear upgrade path for each component

## 🔄 Phase 6 Benefits

1. **Enhanced UX**: Smooth, calming interactions
2. **Scalable Architecture**: Interfaces for future DB/caching
3. **Performance**: Optimized animations and loading
4. **Maintainability**: Well-defined design system
5. **Developer Experience**: Comprehensive dev tools

The "Cluely Energy" design system creates a polished, professional experience while establishing the foundation for scalable, high-performance development.

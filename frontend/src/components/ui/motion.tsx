import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion'
import { motionVariants } from '@/lib/design-system'
import { forwardRef } from 'react'

// Base motion components with default animations
export const FadeIn = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'>
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={motionVariants.fadeIn}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3, ease: 'easeOut' }}
    {...props}
  >
    {children}
  </motion.div>
))

export const SlideUp = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'>
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={motionVariants.slideUp}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.4, ease: 'easeOut' }}
    {...props}
  >
    {children}
  </motion.div>
))

export const SlideIn = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'>
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={motionVariants.slideIn}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3, ease: 'easeOut' }}
    {...props}
  >
    {children}
  </motion.div>
))

export const ScaleIn = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'>
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={motionVariants.scaleIn}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3, ease: 'easeOut' }}
    {...props}
  >
    {children}
  </motion.div>
))

// Container for staggered animations
export const StaggerContainer = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'>
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={motionVariants.staggerContainer}
    initial="initial"
    animate="animate"
    {...props}
  >
    {children}
  </motion.div>
))

export const StaggerItem = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'>
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={motionVariants.staggerItem}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    {...props}
  >
    {children}
  </motion.div>
))

// Loading animations
export const PulseLoader = ({ size = 8, className = '' }: { size?: number; className?: string }) => (
  <div className={`flex space-x-1 ${className}`}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="bg-current rounded-full"
        style={{ width: size, height: size }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.2,
        }}
      />
    ))}
  </div>
)

export const SpinLoader = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <motion.div
    className={`border-2 border-current border-t-transparent rounded-full ${className}`}
    style={{ width: size, height: size }}
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    }}
  />
)

export const WaveformLoader = ({ bars = 5, className = '' }: { bars?: number; className?: string }) => (
  <div className={`flex items-end justify-center space-x-1 ${className}`}>
    {Array.from({ length: bars }, (_, i) => (
      <motion.div
        key={i}
        className="bg-current rounded-sm"
        style={{ width: 3, height: 20 }}
        animate={{
          height: [8, 32, 8],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.1,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
)

// Page transition wrapper
export const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
)

// Card hover animations
export const HoverCard = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'>
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    whileHover={{
      y: -4,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    {...props}
  >
    {children}
  </motion.div>
))

// Button hover animations
export const HoverButton = forwardRef<
  HTMLButtonElement,
  HTMLMotionProps<'button'>
>(({ children, ...props }, ref) => (
  <motion.button
    ref={ref}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.1, ease: 'easeOut' }}
    {...props}
  >
    {children}
  </motion.button>
))

// Form input animations
export const AnimatedInput = forwardRef<
  HTMLInputElement,
  HTMLMotionProps<'input'>
>(({ ...props }, ref) => (
  <motion.input
    ref={ref}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.1 }}
    whileFocus={{
      scale: 1.01,
      boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
    }}
    {...props}
  />
))

export const AnimatedTextarea = forwardRef<
  HTMLTextAreaElement,
  HTMLMotionProps<'textarea'>
>(({ ...props }, ref) => (
  <motion.textarea
    ref={ref}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.1 }}
    whileFocus={{
      scale: 1.01,
      boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
    }}
    {...props}
  />
))

// Re-export AnimatePresence for convenience
export { AnimatePresence }

// Set display names for better debugging
FadeIn.displayName = 'FadeIn'
SlideUp.displayName = 'SlideUp'
SlideIn.displayName = 'SlideIn'
ScaleIn.displayName = 'ScaleIn'
StaggerContainer.displayName = 'StaggerContainer'
StaggerItem.displayName = 'StaggerItem'
HoverCard.displayName = 'HoverCard'
HoverButton.displayName = 'HoverButton'
AnimatedInput.displayName = 'AnimatedInput'
AnimatedTextarea.displayName = 'AnimatedTextarea'

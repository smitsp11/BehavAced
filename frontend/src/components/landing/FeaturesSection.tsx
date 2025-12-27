import { Mic, BookOpen, Target } from 'lucide-react'

export function FeaturesSection() {
  return (
    <div className="w-full py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6">
            Your Interview Prep, Reimagined.
          </h2>
          <p className="font-sans text-lg text-stone-500 leading-relaxed">
            Stop memorizing generic scripts. Build a dynamic story engine that adapts to any question.
          </p>
        </div>

        {/* The "Sticky Narrative" Layout - Split Screen */}
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          
          {/* Left Side - Sticky Headline */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24 h-fit">
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl text-stone-900 leading-tight">
              The Methodology
            </h2>
            <p className="font-sans text-lg text-stone-500 leading-relaxed mt-6">
              Three core principles that transform how you prepare for behavioral interviews.
            </p>
          </div>

          {/* Right Side - Scrolling Features */}
          <div className="w-full lg:w-2/3 space-y-32">
            
            {/* Feature 01 - Voice Calibration */}
            <div className="flex flex-col group">
              <div className="mb-6 p-4 rounded-full bg-stone-100 group-hover:bg-emerald-50 transition-colors w-fit">
                <Mic className="w-8 h-8 text-stone-900 group-hover:text-emerald-700 transition-colors" strokeWidth={1.5} />
              </div>
              <span className="font-serif text-6xl text-stone-200 mb-4 select-none">01</span>
              <h3 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4">Voice Calibration</h3>
              <p className="font-sans text-lg text-stone-500 leading-relaxed max-w-2xl">
                We analyze your natural speaking patterns to ensure every AI-generated answer sounds exactly like <em>you</em>, not a robot.
              </p>
            </div>

            {/* Feature 02 - The Story Bank */}
            <div className="flex flex-col group">
              <div className="mb-6 p-4 rounded-full bg-stone-100 group-hover:bg-emerald-50 transition-colors w-fit">
                <BookOpen className="w-8 h-8 text-stone-900 group-hover:text-emerald-700 transition-colors" strokeWidth={1.5} />
              </div>
              <span className="font-serif text-6xl text-stone-200 mb-4 select-none">02</span>
              <h3 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4">The Story Bank</h3>
              <p className="font-sans text-lg text-stone-500 leading-relaxed max-w-2xl">
                Forget scattered notes. We extract your best professional moments and organize them into a searchable, taggable database.
              </p>
            </div>

            {/* Feature 03 - Precision Routing */}
            <div className="flex flex-col group">
              <div className="mb-6 p-4 rounded-full bg-stone-100 group-hover:bg-emerald-50 transition-colors w-fit">
                <Target className="w-8 h-8 text-stone-900 group-hover:text-emerald-700 transition-colors" strokeWidth={1.5} />
              </div>
              <span className="font-serif text-6xl text-stone-200 mb-4 select-none">03</span>
              <h3 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4">Precision Routing</h3>
              <p className="font-sans text-lg text-stone-500 leading-relaxed max-w-2xl">
                Our engine instantly matches the interviewer's hidden intent to your strongest story, re-framing it in real-time.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}


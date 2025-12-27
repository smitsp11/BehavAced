import { Mic, BookOpen, Target } from 'lucide-react'

export function FeaturesSection() {
  return (
    <section className="w-full py-24 bg-stone-50 border-t border-stone-200">
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

        {/* The "Editorial Grid" Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-200 border-t border-b border-stone-200">
          
          {/* Feature 01 */}
          <div className="py-12 md:px-8 lg:px-12 flex flex-col items-center text-center group">
            <div className="mb-6 p-4 rounded-full bg-stone-100 group-hover:bg-emerald-50 transition-colors">
              <Mic className="w-8 h-8 text-stone-900 group-hover:text-emerald-700 transition-colors" strokeWidth={1.5} />
            </div>
            <span className="font-serif text-6xl text-stone-200 mb-4 select-none">01</span>
            <h3 className="font-serif text-2xl text-stone-900 mb-3">Voice Calibration</h3>
            <p className="font-sans text-stone-500 leading-relaxed">
              We analyze your natural speaking patterns to ensure every AI-generated answer sounds exactly like <em>you</em>, not a robot.
            </p>
          </div>

          {/* Feature 02 */}
          <div className="py-12 md:px-8 lg:px-12 flex flex-col items-center text-center group">
            <div className="mb-6 p-4 rounded-full bg-stone-100 group-hover:bg-emerald-50 transition-colors">
              <BookOpen className="w-8 h-8 text-stone-900 group-hover:text-emerald-700 transition-colors" strokeWidth={1.5} />
            </div>
            <span className="font-serif text-6xl text-stone-200 mb-4 select-none">02</span>
            <h3 className="font-serif text-2xl text-stone-900 mb-3">The Story Bank</h3>
            <p className="font-sans text-stone-500 leading-relaxed">
              Forget scattered notes. We extract your best professional moments and organize them into a searchable, taggable database.
            </p>
          </div>

          {/* Feature 03 */}
          <div className="py-12 md:px-8 lg:px-12 flex flex-col items-center text-center group">
            <div className="mb-6 p-4 rounded-full bg-stone-100 group-hover:bg-emerald-50 transition-colors">
              <Target className="w-8 h-8 text-stone-900 group-hover:text-emerald-700 transition-colors" strokeWidth={1.5} />
            </div>
            <span className="font-serif text-6xl text-stone-200 mb-4 select-none">03</span>
            <h3 className="font-serif text-2xl text-stone-900 mb-3">Precision Routing</h3>
            <p className="font-sans text-stone-500 leading-relaxed">
              Our engine instantly matches the interviewer's hidden intent to your strongest story, re-framing it in real-time.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}


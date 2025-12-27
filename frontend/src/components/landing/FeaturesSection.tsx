import { Mic, BrainCircuit, Sparkles } from 'lucide-react'

export function FeaturesSection() {
  return (
    <div className="w-full py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row gap-20">
        
        {/* LEFT COLUMN: Sticky Header */}
        <div className="md:w-1/3">
          <div className="sticky top-32">
            <h2 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 leading-tight">
              The <br/>
              Methodology
            </h2>
            <p className="font-sans text-lg text-stone-600 max-w-sm">
              We don't just generate answers. We build a cognitive model of your professional history.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: The Steps (No Numbers) */}
        <div className="md:w-2/3 space-y-40 pb-20">
          
          {/* Feature 1 */}
          <div className="group">
            <div className="mb-6 inline-flex p-4 rounded-full border border-stone-300 bg-white/50 group-hover:border-emerald-300 group-hover:bg-emerald-50/80 transition-all duration-300">
              <Mic className="w-8 h-8 text-stone-600 group-hover:text-emerald-700 transition-colors duration-300" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-4xl text-stone-900 mb-4 group-hover:text-emerald-900 transition-colors duration-300">
              Deep Mirroring
            </h3>
            <p className="font-sans text-xl text-stone-700 leading-relaxed max-w-lg">
              The AI analyzes your writing and speech patterns to build a "Voice Fingerprint." It learns your vocabulary, tone, and pacing so every answer sounds authentically like <em className="text-stone-900">you</em>.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group">
            <div className="mb-6 inline-flex p-4 rounded-full border border-stone-300 bg-white/50 group-hover:border-emerald-300 group-hover:bg-emerald-50/80 transition-all duration-300">
              <BrainCircuit className="w-8 h-8 text-stone-600 group-hover:text-emerald-700 transition-colors duration-300" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-4xl text-stone-900 mb-4 group-hover:text-emerald-900 transition-colors duration-300">
              Memory Retrieval
            </h3>
            <p className="font-sans text-xl text-stone-700 leading-relaxed max-w-lg">
              We extract buried wins from your resume and structure them into "Modular Stories." You'll never freeze up trying to remember a project again.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group">
            <div className="mb-6 inline-flex p-4 rounded-full border border-stone-300 bg-white/50 group-hover:border-emerald-300 group-hover:bg-emerald-50/80 transition-all duration-300">
              <Sparkles className="w-8 h-8 text-stone-600 group-hover:text-emerald-700 transition-colors duration-300" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-4xl text-stone-900 mb-4 group-hover:text-emerald-900 transition-colors duration-300">
              Context Adaptation
            </h3>
            <p className="font-sans text-xl text-stone-700 leading-relaxed max-w-lg">
              The engine takes your modular stories and instantly reshapes them to fit the <em className="text-stone-900">hidden intent</em> of the question—whether it asks for leadership, conflict, or technical depth.
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}


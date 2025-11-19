'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Sparkles, Copy, CheckCircle2 } from 'lucide-react'
import { generateAnswer } from '@/lib/api'

interface QuestionAskerProps {
  userId: string
}

export default function QuestionAsker({ userId }: QuestionAskerProps) {
  const [question, setQuestion] = useState('')
  const [companyContext, setCompanyContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerateAnswer = async () => {
    if (!question.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await generateAnswer(userId, question, {
        company: companyContext || undefined
      })

      if (response.success) {
        setResult(response)
      }
    } catch (error: any) {
      alert(error.message || 'Failed to generate answer')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (result?.answer?.answer_text) {
      navigator.clipboard.writeText(result.answer.answer_text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const sampleQuestions = [
    "Tell me about a time you led a team",
    "Describe a situation where you faced a significant challenge",
    "Tell me about a time you made a mistake",
    "Describe a time you had to work with a difficult team member",
    "Tell me about your biggest professional achievement"
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Question Input */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ask Any Behavioral Question</CardTitle>
            <CardDescription>
              We'll find your best story and generate a perfect answer in your voice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Behavioral Interview Question
              </label>
              <Textarea
                placeholder="e.g., Tell me about a time you led a team through a difficult project..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Company Context (Optional)
              </label>
              <Input
                placeholder="e.g., Google, startup, consulting firm..."
                value={companyContext}
                onChange={(e) => setCompanyContext(e.target.value)}
              />
            </div>

            <Button
              onClick={handleGenerateAnswer}
              disabled={!question.trim() || loading}
              className="w-full gap-2"
              size="lg"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Generating Answer...' : 'Generate Answer'}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Answer */}
        {result && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Your Personalized Answer</CardTitle>
                  <CardDescription className="mt-2">
                    <span className="font-medium">Category: </span>
                    {result.routing?.detected_category}
                    <span className="ml-4 font-medium">Match Confidence: </span>
                    {Math.round((result.routing?.match_confidence || 0) * 100)}%
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {result.answer?.answer_text}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Structure: </span>
                  {result.answer?.structure}
                </div>
                <div>
                  <span className="font-medium">Speaking Time: </span>
                  {result.answer?.estimated_time_seconds}s
                </div>
              </div>

              {result.answer?.key_points && result.answer.key_points.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Key Points:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {result.answer.key_points.map((point: string, idx: number) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.routing?.reasoning && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Why This Story?</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.routing.reasoning}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sample Questions Sidebar */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sample Questions</CardTitle>
            <CardDescription>Try these common interview questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setQuestion(q)}
                className="w-full text-left p-3 rounded-lg border hover:bg-accent hover:border-primary transition-colors text-sm"
              >
                {q}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


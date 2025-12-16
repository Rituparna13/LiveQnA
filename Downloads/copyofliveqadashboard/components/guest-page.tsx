"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Send, MessageCircle, ArrowLeft, Sparkles } from "lucide-react"

interface Reply {
  author: string
  content: string
  timestamp: Date
}

interface Question {
  id: string
  name: string
  question: string
  status: "pending" | "resolved" | "escalated"
  timestamp: Date
  replies?: Reply[]
}

export default function GuestPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [question, setQuestion] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({})
  const [replyingTo, setReplyingTo] = useState<{ [key: string]: boolean }>({})

  // Load questions from localStorage
  useEffect(() => {
    const loadQuestions = () => {
      const stored = localStorage.getItem("qna_questions")
      if (stored) {
        const parsed = JSON.parse(stored)
        setQuestions(
          parsed.map((q: any) => ({
            ...q,
            timestamp: new Date(q.timestamp),
            replies: q.replies?.map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) })) || [],
          })),
        )
      }
    }

    loadQuestions()
    const interval = setInterval(loadQuestions, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsSubmitting(true)

    const newQuestion: Question = {
      id: Date.now().toString(),
      name: name.trim() || `GUEST_${Date.now().toString().slice(-3)}`,
      question: question.trim(),
      status: "pending",
      timestamp: new Date(),
      replies: [],
    }

    const stored = localStorage.getItem("qna_questions")
    const existing = stored ? JSON.parse(stored) : []
    const updated = [...existing, newQuestion]
    localStorage.setItem("qna_questions", JSON.stringify(updated))

    setQuestions(
      updated.map((q: any) => ({
        ...q,
        timestamp: new Date(q.timestamp),
        replies: q.replies || [],
      })),
    )
    setName("")
    setQuestion("")
    setIsSubmitting(false)
  }

  const handleReply = async (questionId: string) => {
    const replyText = replyTexts[questionId]?.trim()
    if (!replyText) return

    setReplyingTo((prev) => ({ ...prev, [questionId]: true }))

    const newReply: Reply = {
      author: "GUEST USER",
      content: replyText,
      timestamp: new Date(),
    }

    const stored = localStorage.getItem("qna_questions")
    const existing = stored ? JSON.parse(stored) : []
    const updated = existing.map((q: any) =>
      q.id === questionId ? { ...q, replies: [...(q.replies || []), newReply] } : q,
    )

    localStorage.setItem("qna_questions", JSON.stringify(updated))
    setQuestions(
      updated.map((q: any) => ({
        ...q,
        timestamp: new Date(q.timestamp),
        replies: q.replies?.map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) })) || [],
      })),
    )

    setReplyTexts((prev) => ({ ...prev, [questionId]: "" }))
    setReplyingTo((prev) => ({ ...prev, [questionId]: false }))
  }

  const handleAIReply = async (questionId: string) => {
    const questionObj = questions.find((q) => q.id === questionId)
    if (!questionObj) return

    setReplyingTo((prev) => ({ ...prev, [questionId]: true }))

    try {
      const response = await fetch("/api/generate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionObj.question }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        const errorReply: Reply = {
          author: "SYSTEM",
          content: errorData.error || "AI service is temporarily unavailable. Please try again later.",
          timestamp: new Date(),
        }

        const stored = localStorage.getItem("qna_questions")
        const existing = stored ? JSON.parse(stored) : []
        const updated = existing.map((q: any) =>
          q.id === questionId ? { ...q, replies: [...(q.replies || []), errorReply] } : q,
        )

        localStorage.setItem("qna_questions", JSON.stringify(updated))
        setQuestions(
          updated.map((q: any) => ({
            ...q,
            timestamp: new Date(q.timestamp),
            replies: q.replies?.map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) })) || [],
          })),
        )

        setReplyingTo((prev) => ({ ...prev, [questionId]: false }))
        return
      }

      const data = await response.json()

      const newReply: Reply = {
        author: "AI ASSISTANT",
        content: data.answer,
        timestamp: new Date(),
      }

      const stored = localStorage.getItem("qna_questions")
      const existing = stored ? JSON.parse(stored) : []
      const updated = existing.map((q: any) =>
        q.id === questionId ? { ...q, replies: [...(q.replies || []), newReply] } : q,
      )

      localStorage.setItem("qna_questions", JSON.stringify(updated))
      setQuestions(
        updated.map((q: any) => ({
          ...q,
          timestamp: new Date(q.timestamp),
          replies: q.replies?.map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) })) || [],
        })),
      )
    } catch (error) {
      console.error("AI Reply error:", error)

      const errorReply: Reply = {
        author: "SYSTEM",
        content: "Network error. Please check your connection and try again.",
        timestamp: new Date(),
      }

      const stored = localStorage.getItem("qna_questions")
      const existing = stored ? JSON.parse(stored) : []
      const updated = existing.map((q: any) =>
        q.id === questionId ? { ...q, replies: [...(q.replies || []), errorReply] } : q,
      )

      localStorage.setItem("qna_questions", JSON.stringify(updated))
      setQuestions(
        updated.map((q: any) => ({
          ...q,
          timestamp: new Date(q.timestamp),
          replies: q.replies?.map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) })) || [],
        })),
      )
    }

    setReplyingTo((prev) => ({ ...prev, [questionId]: false }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "escalated":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return "✓"
      case "escalated":
        return "↗"
      default:
        return "○"
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900/70 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <MessageCircle className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Q&A{" "}
                <span className="bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
                  Master
                </span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
              <span className="text-sm text-slate-300 font-semibold uppercase tracking-wide">Guest Access</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Submit Form */}
        <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border border-purple-500/30 rounded-3xl p-8 mb-8 shadow-lg shadow-purple-500/10">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-amber-400">⚡</span>
            Submit a Query
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-purple-300 font-semibold mb-2 text-sm uppercase tracking-wide">
                Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name (e.g. Alex)"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-amber-400 font-semibold mb-2 text-sm uppercase tracking-wide">
                Question
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What is on your mind?"
                  className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/25"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Live Feed */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">
              Live Feed <span className="text-slate-500 text-xl">({questions.length})</span>
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-semibold uppercase tracking-wide">Socket Active</span>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>No questions yet. Be the first to ask!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions
                .slice()
                .reverse()
                .map((q) => (
                  <div
                    key={q.id}
                    className="bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-lg"
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <span className="text-purple-400 font-bold text-lg uppercase">{q.name}</span>
                        <span className="text-slate-500 text-sm ml-3">
                          {q.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <span
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold border uppercase ${getStatusColor(q.status)}`}
                      >
                        {getStatusIcon(q.status)} {q.status}
                      </span>
                    </div>

                    {/* Question Text */}
                    <p className="text-slate-100 text-xl mb-6">{q.question}</p>

                    {/* Replies Section */}
                    {q.replies && q.replies.length > 0 && (
                      <div className="space-y-3 mb-6">
                        {q.replies.map((reply, idx) => (
                          <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs">👑</span>
                              </div>
                              <span className="text-amber-400 font-semibold uppercase text-sm">{reply.author}</span>
                              <span className="text-slate-500 text-xs">
                                {new Date(reply.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-slate-200">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Interface */}
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={replyTexts[q.id] || ""}
                        onChange={(e) => setReplyTexts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleReply(q.id)
                          }
                        }}
                        placeholder="Contribute your knowledge..."
                        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        disabled={replyingTo[q.id]}
                      />
                      <button
                        onClick={() => handleReply(q.id)}
                        disabled={!replyTexts[q.id]?.trim() || replyingTo[q.id]}
                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all"
                      >
                        <Send size={20} />
                      </button>
                      <button
                        onClick={() => handleAIReply(q.id)}
                        disabled={replyingTo[q.id]}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                      >
                        <Sparkles size={18} />
                        AI Auto-Reply
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

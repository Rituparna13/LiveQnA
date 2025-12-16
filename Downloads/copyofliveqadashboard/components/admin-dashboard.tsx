"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Send, Crown, Sparkles, TrendingUp, LogOut } from "lucide-react"

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

export default function AdminDashboard() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({})
  const [isGenerating, setIsGenerating] = useState<{ [key: string]: boolean }>({})
  const [hoveredQuestion, setHoveredQuestion] = useState<string | null>(null)

  // Check authentication
  useEffect(() => {
    const userRole = sessionStorage.getItem("userRole")
    if (userRole !== "admin") {
      router.push("/")
    }
  }, [router])

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

  const handleStatusChange = (questionId: string, newStatus: "resolved" | "escalated") => {
    const updated = questions.map((q) => (q.id === questionId ? { ...q, status: newStatus } : q))
    setQuestions(updated)
    localStorage.setItem("qna_questions", JSON.stringify(updated))
  }

  const handleSendReply = (questionId: string) => {
    const reply = replyText[questionId]
    if (!reply?.trim()) return

    const updated = questions.map((q) => {
      if (q.id === questionId) {
        const newReply: Reply = {
          author: "ADMIN USER",
          content: reply.trim(),
          timestamp: new Date(),
        }
        return {
          ...q,
          replies: [...(q.replies || []), newReply],
          status: "resolved" as const,
        }
      }
      return q
    })

    setQuestions(updated)
    localStorage.setItem("qna_questions", JSON.stringify(updated))
    setReplyText({ ...replyText, [questionId]: "" })
  }

  const handleAiAutoReply = async (questionId: string, questionText: string) => {
    setIsGenerating({ ...isGenerating, [questionId]: true })
    try {
      const response = await fetch("/api/generate-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: questionText }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate AI response")
      }

      const data = await response.json()
      setReplyText({ ...replyText, [questionId]: data.answer })
    } catch (error) {
      console.error("Error generating AI response:", error)
      setReplyText({ ...replyText, [questionId]: "Error generating AI response. Please try again." })
    } finally {
      setIsGenerating({ ...isGenerating, [questionId]: false })
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("userRole")
    router.push("/")
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Crown className="text-white" size={24} />
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
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full">
              <Crown size={16} className="text-amber-400" />
              <span className="text-amber-400 font-semibold text-sm uppercase tracking-wide">Admin</span>
              <span className="text-slate-300 text-sm">Admin User</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} className="text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
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
              <Crown size={48} className="mx-auto mb-4 opacity-50" />
              <p>No questions yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions
                .slice()
                .reverse()
                .map((q) => (
                  <div
                    key={q.id}
                    onMouseEnter={() => setHoveredQuestion(q.id)}
                    onMouseLeave={() => setHoveredQuestion(null)}
                    className="bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-lg relative"
                  >
                    {hoveredQuestion === q.id && (
                      <button
                        onClick={() => handleStatusChange(q.id, "escalated")}
                        className="absolute top-6 right-6 p-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg transition-all"
                        title="Escalate"
                      >
                        <TrendingUp size={20} className="text-amber-400" />
                      </button>
                    )}

                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <span className="text-purple-400 font-bold text-lg uppercase">{q.name}</span>
                        <span className="text-slate-500 text-sm ml-3">
                          {q.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span
                          className={`ml-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold border uppercase ${getStatusColor(q.status)}`}
                        >
                          {getStatusIcon(q.status)} {q.status}
                        </span>
                      </div>
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
                            <p className="text-slate-200 text-sm">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText[q.id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [q.id]: e.target.value })}
                        placeholder="Contribute your knowledge..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSendReply(q.id)
                          }
                        }}
                        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={() => handleSendReply(q.id)}
                        disabled={!replyText[q.id]?.trim()}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-semibold transition-all"
                      >
                        <Send size={18} />
                      </button>
                      <button
                        onClick={() => handleAiAutoReply(q.id, q.question)}
                        disabled={isGenerating[q.id]}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold flex items-center gap-2 transition-all"
                      >
                        {isGenerating[q.id] ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            AI Auto-Reply
                          </>
                        )}
                      </button>
                    </div>

                    {hoveredQuestion === q.id && q.status !== "resolved" && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleStatusChange(q.id, "resolved")}
                          className="flex-1 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 rounded-xl font-semibold text-sm transition-all"
                        >
                          Mark as Resolved
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

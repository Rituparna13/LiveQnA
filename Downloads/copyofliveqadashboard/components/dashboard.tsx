"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Send, Trash2, Sparkles, Clock, TrendingUp, Users, Zap } from "lucide-react"

interface Message {
  id: string
  text: string
  timestamp: Date
  upvotes: number
  downvotes: number
  priority: number
  status: "pending" | "answered" | "ignored"
  category?: string
  sentiment?: "positive" | "neutral" | "negative"
  aiSuggestion?: string
  name?: string
}

interface AIInsights {
  trendingTopics: string[]
  audienceSentiment: {
    positive: number
    neutral: number
    negative: number
  }
  suggestedResponses: string[]
  engagementScore: number
}

const mockBackend = {
  async getAIInsights(messages: Message[]): Promise<AIInsights> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const topics = ["Product Features", "Pricing", "Use Cases", "Technical Details"]
    const responses = [
      "Consider addressing pricing concerns early",
      "Highlight the unique value proposition",
      "Share customer success stories",
    ]

    const positive = messages.filter((m) => m.sentiment === "positive").length
    const negative = messages.filter((m) => m.sentiment === "negative").length
    const neutral = messages.length - positive - negative

    return {
      trendingTopics: topics.slice(0, 3),
      audienceSentiment: { positive, neutral, negative },
      suggestedResponses: responses,
      engagementScore: Math.min(100, messages.length * 5 + Math.random() * 20),
    }
  },

  async analyzeMessage(text: string): Promise<Partial<Message>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const sentiments: Array<"positive" | "neutral" | "negative"> = ["positive", "neutral", "negative"]
    const categories = ["General", "Technical", "Business", "Feature Request"]
    const suggestions = [
      "This is a great question about our core features",
      "Consider expanding on the technical implementation",
      "This touches on an important business use case",
    ]

    return {
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      aiSuggestion: suggestions[Math.floor(Math.random() * suggestions.length)],
      priority: Math.floor(Math.random() * 10) + 1,
    }
  },
}

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [userName, setUserName] = useState("")
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length > 0) {
      loadInsights()
    }
  }, [messages])

  const loadInsights = async () => {
    setIsAnalyzing(true)
    try {
      const data = await mockBackend.getAIInsights(messages)
      setInsights(data)
    } catch (error) {
      console.error("Failed to load insights:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim() || !newMessage.trim()) return

    const analysis = await mockBackend.analyzeMessage(newMessage)

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date(),
      upvotes: 0,
      downvotes: 0,
      priority: analysis.priority || 5,
      status: "pending",
      category: analysis.category,
      sentiment: analysis.sentiment,
      aiSuggestion: analysis.aiSuggestion,
      name: userName,
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
    setUserName("")
  }

  const handleVote = (id: string, type: "up" | "down") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id
          ? {
              ...msg,
              upvotes: type === "up" ? msg.upvotes + 1 : msg.upvotes,
              downvotes: type === "down" ? msg.downvotes + 1 : msg.downvotes,
              priority: type === "up" ? msg.priority + 1 : Math.max(1, msg.priority - 0.5),
            }
          : msg,
      ),
    )
  }

  const handleStatusChange = (id: string, status: Message["status"]) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, status } : msg)))
  }

  const handleDelete = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id))
  }

  const sortedMessages = [...messages].sort((a, b) => b.priority - a.priority)

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400"
      case "negative":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusBadge = (status: Message["status"]) => {
    const styles = {
      pending: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      answered: "bg-green-500/20 text-green-300 border-green-500/30",
      ignored: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    }
    return styles[status]
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-yellow-200 via-amber-400 to-orange-600 bg-clip-text text-transparent animate-pulse">
            Live Q&A Dashboard
          </h1>
          <p className="text-slate-400 text-lg">AI-Powered Real-Time Audience Engagement</p>
        </header>

        {/* Stats Bar */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Users className="text-purple-400" size={24} />
                <div>
                  <p className="text-slate-400 text-sm">Total Questions</p>
                  <p className="text-2xl font-bold text-white">{messages.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-amber-400" size={24} />
                <div>
                  <p className="text-slate-400 text-sm">Engagement</p>
                  <p className="text-2xl font-bold text-white">{Math.round(insights.engagementScore)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Sparkles className="text-green-400" size={24} />
                <div>
                  <p className="text-slate-400 text-sm">Positive</p>
                  <p className="text-2xl font-bold text-white">{insights.audienceSentiment.positive}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Zap className="text-orange-400" size={24} />
                <div>
                  <p className="text-slate-400 text-sm">High Priority</p>
                  <p className="text-2xl font-bold text-white">{messages.filter((m) => m.priority >= 7).length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Questions Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submit Form */}
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask your question here..."
                    className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/25"
                  >
                    <Send size={18} />
                    Submit
                  </button>
                </div>
              </form>
            </div>

            {/* Messages List */}
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-lg max-h-[600px] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
                Questions Queue
              </h2>

              {sortedMessages.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No questions yet. Be the first to ask!</p>
              ) : (
                <div className="space-y-4">
                  {sortedMessages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-purple-500/50 transition-all animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(msg.status)}`}
                            >
                              {msg.status}
                            </span>
                            {msg.category && (
                              <span className="px-2 py-1 rounded-lg text-xs bg-slate-700/50 text-slate-300 border border-slate-600">
                                {msg.category}
                              </span>
                            )}
                            <span className={`text-xs ${getSentimentColor(msg.sentiment)}`}>{msg.sentiment}</span>
                          </div>

                          <p className="text-slate-100 mb-2">
                            {msg.name && <strong>{msg.name}: </strong>}
                            {msg.text}
                          </p>

                          {msg.aiSuggestion && (
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 mb-2">
                              <p className="text-xs text-purple-300 flex items-center gap-1">
                                <Sparkles size={12} />
                                AI: {msg.aiSuggestion}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {msg.timestamp.toLocaleTimeString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp size={12} />
                              Priority: {msg.priority.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleVote(msg.id, "up")}
                              className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-semibold transition-colors"
                            >
                              ▲ {msg.upvotes}
                            </button>
                            <button
                              onClick={() => handleVote(msg.id, "down")}
                              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-semibold transition-colors"
                            >
                              ▼ {msg.downvotes}
                            </button>
                          </div>

                          <select
                            value={msg.status}
                            onChange={(e) => handleStatusChange(msg.id, e.target.value as Message["status"])}
                            className="bg-slate-700 text-slate-100 rounded-lg px-2 py-1 text-xs border border-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="answered">Answered</option>
                            <option value="ignored">Ignored</option>
                          </select>

                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
                <Sparkles className="text-amber-400" />
                AI Insights
              </h2>

              {isAnalyzing && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                  <p className="text-slate-400 mt-2 text-sm">Analyzing...</p>
                </div>
              )}

              {insights && !isAnalyzing && (
                <div className="space-y-4">
                  {/* Trending Topics */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">Trending Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {insights.trendingTopics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-xs font-semibold"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sentiment Breakdown */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">Audience Sentiment</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-400">Positive</span>
                        <span className="text-white font-semibold">{insights.audienceSentiment.positive}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Neutral</span>
                        <span className="text-white font-semibold">{insights.audienceSentiment.neutral}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-red-400">Negative</span>
                        <span className="text-white font-semibold">{insights.audienceSentiment.negative}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Suggestions */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">Suggested Responses</h3>
                    <div className="space-y-2">
                      {insights.suggestedResponses.map((suggestion, i) => (
                        <div
                          key={i}
                          className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 text-xs text-purple-200"
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

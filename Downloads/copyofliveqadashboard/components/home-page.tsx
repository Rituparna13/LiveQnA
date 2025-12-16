"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Crown, ArrowRight } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Check admin credentials
    if (email === "admin@qna.com" && password === "admin123") {
      // Store admin session
      sessionStorage.setItem("userRole", "admin")
      router.push("/admin")
    } else {
      setError("Invalid credentials. Please check the admin credentials below.")
    }
  }

  const handleGuestAccess = () => {
    sessionStorage.setItem("userRole", "guest")
    router.push("/guest")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl mb-4 shadow-lg shadow-amber-500/25">
            <Crown className="text-white" size={40} />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Admin{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
                Portal
              </span>
            </h1>
            <p className="text-slate-400">Authenticate to moderate the stream.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-amber-400 font-semibold mb-2 text-sm uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@qna.com"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-amber-400 font-semibold mb-2 text-sm uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
            >
              Access Dashboard
            </button>
          </form>

          {/* Admin Credentials */}
          <div className="mt-8 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
            <p className="text-slate-400 text-sm font-semibold mb-2 text-center uppercase tracking-wide">
              Admin Credentials
            </p>
            <div className="flex items-center justify-center gap-3 text-center">
              <code className="text-amber-400 font-mono text-sm">admin@qna.com</code>
              <span className="text-slate-600">|</span>
              <code className="text-amber-400 font-mono text-sm">admin123</code>
            </div>
          </div>

          {/* Guest Access */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <button
              onClick={handleGuestAccess}
              className="w-full text-purple-400 hover:text-purple-300 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              Enter as Guest
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

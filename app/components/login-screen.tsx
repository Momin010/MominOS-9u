"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wifi, Battery, Volume2, Lock, Eye, EyeOff, Power } from "lucide-react"

interface LoginScreenProps {
  onLogin: (user: any) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [time, setTime] = useState(new Date())
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

  const users = [
    {
      id: "1",
      name: "Administrator",
      username: "admin",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "2",
      name: "Guest User",
      username: "guest",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (users.length > 0) {
      setSelectedUser(users[0])
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedUser && password) {
      onLogin(selectedUser)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(147,51,234,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(147,51,234,0.1),transparent_50%)]" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* System Info Corners */}
      <div className="absolute top-4 left-4 text-gray-400 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>MominOS v2.1.0</span>
        </div>
        <div>Build 20240130</div>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-4 text-gray-400 text-sm">
        <div className="flex items-center gap-1">
          <Wifi className="w-4 h-4" />
          <span>Connected</span>
        </div>
        <div className="flex items-center gap-1">
          <Battery className="w-4 h-4" />
          <span>87%</span>
        </div>
        <div className="flex items-center gap-1">
          <Volume2 className="w-4 h-4" />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-gray-400 text-sm">
        <div>
          {time.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-gray-400 text-sm">
        <div>
          {time.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      </div>

      {/* Main Login Interface */}
      <div className="flex items-center justify-center h-full">
        <Card className="w-96 bg-gray-900/80 backdrop-blur-xl border-gray-800 shadow-2xl">
          <div className="p-8">
            {/* Welcome Message */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-green-400 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome to MominOS</h1>
              <p className="text-gray-400">Select a user and enter password</p>
            </div>

            {/* User Selection */}
            <div className="flex justify-center gap-4 mb-6">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                    selectedUser?.id === user.id
                      ? "bg-purple-600/20 border-2 border-purple-500"
                      : "border-2 border-transparent hover:bg-gray-800"
                  }`}
                >
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-purple-500/20 text-purple-300">
                      <Lock className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm font-medium">{user.name}</span>
                </button>
              ))}
            </div>

            {/* Login Form */}
            {selectedUser && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 pr-10"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-medium py-2.5"
                  disabled={!password}
                >
                  Sign In
                </Button>
              </form>
            )}

            {/* Additional Options */}
            <div className="flex items-center justify-between mt-6 text-sm">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Forgot Password?
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Lock className="w-4 h-4 mr-1" />
                Switch User
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Power Options */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Power className="w-4 h-4 mr-2" />
          Power Options
        </Button>
      </div>
    </div>
  )
}

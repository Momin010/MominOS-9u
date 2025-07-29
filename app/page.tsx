"use client"

import { useState, useEffect } from "react"
import LoginScreen from "./components/login-screen"
import Desktop from "./components/desktop"
import { UserIcon } from "lucide-react"

interface User {
  id: string
  name: string
  username: string
  avatar?: string
}

export default function MominOS() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isBooting, setIsBooting] = useState(true)

  // Simulate boot sequence
  useEffect(() => {
    const bootTimer = setTimeout(() => {
      setIsBooting(false)
    }, 2000)

    return () => clearTimeout(bootTimer)
  }, [])

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
  }

  if (isBooting) {
    return <BootScreen />
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return <Desktop user={currentUser} onLogout={handleLogout} />
}

function BootScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 40)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-green-400 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
          <UserIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent mb-4">
          MominOS
        </h1>
        <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-green-400 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-gray-400 text-sm mt-4">Starting up...</p>
      </div>
    </div>
  )
}

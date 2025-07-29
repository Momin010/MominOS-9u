"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Terminal,
  MessageSquare,
  Cpu,
  HardDrive,
  Wifi,
  Battery,
  Clock,
  ChevronDown,
  Send,
  Sparkles,
  Command,
} from "lucide-react"

export default function AIShellInterface() {
  const [input, setInput] = useState("")
  const [chatOpen, setChatOpen] = useState(false)
  const [outputVisible, setOutputVisible] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const commonCommands = [
    "ls -la",
    "cd ~",
    "ps aux",
    "top",
    "df -h",
    "free -m",
    "uname -a",
    "systemctl status",
    "journalctl -f",
    "netstat -tulpn",
  ]

  const aiSuggestions = [
    "Show me system performance",
    "Find large files",
    "Update all packages",
    "Analyze network traffic",
    "Clean temporary files",
    "Check disk health",
  ]

  useEffect(() => {
    if (input.length > 0) {
      const filtered = [...commonCommands, ...aiSuggestions].filter((cmd) =>
        cmd.toLowerCase().includes(input.toLowerCase()),
      )
      setSuggestions(filtered.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      setOutputVisible(true)
      setInput("")
      setSuggestions([])
    }
  }

  return (
    <div className="h-screen bg-gray-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950/10 to-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_50%)]" />
      </div>

      {/* System Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between px-4 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Terminal className="w-3 h-3" />
            <span>MominOS Shell</span>
          </div>
          <div className="flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            <span>CPU: 23%</span>
          </div>
          <div className="flex items-center gap-1">
            <HardDrive className="w-3 h-3" />
            <span>RAM: 4.2/16GB</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            <span>Connected</span>
          </div>
          <div className="flex items-center gap-1">
            <Battery className="w-3 h-3" />
            <span>87%</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>14:32:45</span>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="absolute top-8 right-0 w-80 h-[calc(100vh-8rem)] bg-gray-900/95 backdrop-blur-sm border-l border-gray-800 p-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">AI Assistant</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setChatOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </Button>
          </div>

          <div className="flex-1 space-y-3 mb-4">
            <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/30">
              <p className="text-sm text-purple-200">
                Hello! I'm your AI assistant. I can help you with system commands, troubleshooting, and automation
                tasks.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-gray-300">What would you like me to help you with today?</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything..."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Output Window */}
      {outputVisible && (
        <div className="absolute top-16 left-4 right-4 max-h-64 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-800">
            <span className="text-sm text-gray-400">Output</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOutputVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-4 font-mono text-sm text-green-400 max-h-48 overflow-y-auto">
            <div>$ {input}</div>
            <div className="mt-2 text-gray-300">
              Command executed successfully.
              <br />
              System status: All services running normally.
              <br />
              Memory usage: 4.2GB / 16GB
              <br />
              Disk usage: 45% of 1TB SSD
            </div>
          </div>
        </div>
      )}

      {/* Main Command Interface */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <Card className="mb-4 bg-gray-900/95 backdrop-blur-sm border-gray-800">
            <div className="p-3">
              <div className="text-xs text-gray-400 mb-2">Suggestions</div>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Command Input */}
        <Card className="bg-gray-900/95 backdrop-blur-sm border-gray-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                <span className="text-green-400 font-mono text-sm">user@momin-os:~$</span>
              </div>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter command or ask AI assistant..."
                className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 font-mono"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setChatOpen(!chatOpen)}
                  className="text-purple-400 hover:text-purple-300"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Quick Actions */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer">
            <Command className="w-3 h-3 mr-1" />
            Ctrl+K
          </Badge>
          <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer">
            Esc to clear
          </Badge>
          <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer">
            Alt+Tab tasks
          </Badge>
        </div>
      </div>
    </div>
  )
}

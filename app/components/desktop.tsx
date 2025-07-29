"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Grid3X3,
  Terminal,
  FolderOpen,
  Settings,
  Chrome,
  Code,
  Music,
  ImageIcon,
  Calculator,
  Calendar,
  Mail,
  Minimize2,
  Maximize2,
  X,
  Wifi,
  Battery,
  Volume2,
  Bell,
  LogOut,
  Power,
  Monitor,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Square,
} from "lucide-react"

interface User {
  id: string
  name: string
  username: string
  avatar?: string
}

interface DesktopProps {
  user: User | null
  onLogout: () => void
}

interface App {
  id: string
  name: string
  icon: any
  color: string
  component?: any
}

interface Window {
  id: string
  title: string
  icon: any
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  component: any
  snapped?: "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | null
  isResizing?: boolean
}

type DockPosition = "bottom" | "top" | "left" | "right" | "bottom-left" | "bottom-right" | "top-left" | "top-right"
type SnapZone = "left-half" | "right-half" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "maximize"

// Spring configurations
const springConfig = {
  type: "spring",
  stiffness: 400,
  damping: 30,
}

const gentleSpring = {
  type: "spring",
  stiffness: 300,
  damping: 25,
}

const bouncySpring = {
  type: "spring",
  stiffness: 500,
  damping: 20,
}

export default function Desktop({ user, onLogout }: DesktopProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [windows, setWindows] = useState<Window[]>([])
  const [activeWindow, setActiveWindow] = useState<string | null>(null)
  const [currentDesktop, setCurrentDesktop] = useState(1)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [time, setTime] = useState(new Date())
  const [hoveredDockItem, setHoveredDockItem] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [dockPosition, setDockPosition] = useState<DockPosition>("bottom")
  const [isDraggingDock, setIsDraggingDock] = useState(false)
  const [showSnapZones, setShowSnapZones] = useState(false)
  const [draggingWindow, setDraggingWindow] = useState<string | null>(null)
  const [backgroundBrightness, setBackgroundBrightness] = useState<"dark" | "light">("dark")
  const [resizingWindow, setResizingWindow] = useState<{
    windowId: string
    handle: string
    startX: number
    startY: number
    startWidth: number
    startHeight: number
    startWindowX: number
    startWindowY: number
  } | null>(null)

  const dragRef = useRef<{ windowId: string; startX: number; startY: number } | null>(null)
  const dockRef = useRef<HTMLDivElement>(null)

  // Detect background brightness
  useEffect(() => {
    setBackgroundBrightness("dark")
  }, [])

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })

      // Handle window resizing
      if (resizingWindow) {
        handleWindowResize(e)
      }
    }

    const handleMouseUp = () => {
      setResizingWindow(null)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [resizingWindow])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const desktopApps: App[] = [
    { id: "terminal", name: "Terminal", icon: Terminal, color: "from-green-500 to-green-600", component: TerminalApp },
    { id: "files", name: "Files", icon: FolderOpen, color: "from-blue-500 to-blue-600", component: FilesApp },
    { id: "settings", name: "Settings", icon: Settings, color: "from-gray-500 to-gray-600", component: SettingsApp },
    { id: "browser", name: "Browser", icon: Chrome, color: "from-orange-500 to-orange-600", component: BrowserApp },
    { id: "code", name: "Code", icon: Code, color: "from-purple-500 to-purple-600", component: CodeApp },
    { id: "music", name: "Music", icon: Music, color: "from-pink-500 to-pink-600", component: MusicApp },
    { id: "photos", name: "Photos", icon: ImageIcon, color: "from-yellow-500 to-yellow-600", component: PhotosApp },
    {
      id: "calculator",
      name: "Calculator",
      icon: Calculator,
      color: "from-indigo-500 to-indigo-600",
      component: CalculatorApp,
    },
    { id: "calendar", name: "Calendar", icon: Calendar, color: "from-red-500 to-red-600", component: CalendarApp },
    { id: "mail", name: "Mail", icon: Mail, color: "from-teal-500 to-teal-600", component: MailApp },
  ]

  const dockApps = desktopApps.slice(0, 6)

  // Get adaptive glow/shadow styles
  const getAdaptiveGlow = (intensity: "low" | "medium" | "high" = "medium") => {
    const intensityMap = {
      low: backgroundBrightness === "dark" ? "0 0 10px rgba(255, 255, 255, 0.1)" : "0 2px 8px rgba(0, 0, 0, 0.1)",
      medium: backgroundBrightness === "dark" ? "0 0 20px rgba(255, 255, 255, 0.15)" : "0 4px 16px rgba(0, 0, 0, 0.15)",
      high: backgroundBrightness === "dark" ? "0 0 30px rgba(255, 255, 255, 0.2)" : "0 8px 32px rgba(0, 0, 0, 0.2)",
    }
    return intensityMap[intensity]
  }

  // Get dock position styles
  const getDockPositionStyles = () => {
    const baseStyles = "absolute flex items-center gap-2"

    switch (dockPosition) {
      case "bottom":
        return {
          className: `${baseStyles} bottom-4 left-1/2 transform -translate-x-1/2 flex-row`,
          style: {},
        }
      case "top":
        return {
          className: `${baseStyles} top-16 left-1/2 transform -translate-x-1/2 flex-row`,
          style: {},
        }
      case "left":
        return {
          className: `${baseStyles} left-4 top-1/2 transform -translate-y-1/2 flex-col`,
          style: {},
        }
      case "right":
        return {
          className: `${baseStyles} right-4 top-1/2 transform -translate-y-1/2 flex-col`,
          style: {},
        }
      case "bottom-left":
        return {
          className: `${baseStyles} bottom-4 left-4 flex-row`,
          style: {},
        }
      case "bottom-right":
        return {
          className: `${baseStyles} bottom-4 right-4 flex-row`,
          style: {},
        }
      case "top-left":
        return {
          className: `${baseStyles} top-16 left-4 flex-row`,
          style: {},
        }
      case "top-right":
        return {
          className: `${baseStyles} top-16 right-4 flex-row`,
          style: {},
        }
      default:
        return {
          className: `${baseStyles} bottom-4 left-1/2 transform -translate-x-1/2 flex-row`,
          style: {},
        }
    }
  }

  // Handle dock drag
  const handleDockDrag = useCallback((event: any, info: PanInfo) => {
    const { x, y } = info.point
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    let newPosition: DockPosition = "bottom"

    const margin = 100
    const isNearLeft = x < margin
    const isNearRight = x > windowWidth - margin
    const isNearTop = y < margin + 64
    const isNearBottom = y > windowHeight - margin

    if (isNearLeft && isNearTop) newPosition = "top-left"
    else if (isNearRight && isNearTop) newPosition = "top-right"
    else if (isNearLeft && isNearBottom) newPosition = "bottom-left"
    else if (isNearRight && isNearBottom) newPosition = "bottom-right"
    else if (isNearLeft) newPosition = "left"
    else if (isNearRight) newPosition = "right"
    else if (isNearTop) newPosition = "top"
    else newPosition = "bottom"

    setDockPosition(newPosition)
  }, [])

  // Handle window resizing
  const handleWindowResize = (e: MouseEvent) => {
    if (!resizingWindow) return

    const { windowId, handle, startX, startY, startWidth, startHeight, startWindowX, startWindowY } = resizingWindow
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY

    setWindows(
      windows.map((w) => {
        if (w.id !== windowId) return w

        let newX = w.x
        let newY = w.y
        let newWidth = w.width
        let newHeight = w.height

        // Handle different resize handles
        switch (handle) {
          case "right":
            newWidth = Math.max(300, startWidth + deltaX)
            break
          case "left":
            newWidth = Math.max(300, startWidth - deltaX)
            newX = startWindowX + deltaX
            if (newWidth === 300) newX = startWindowX + startWidth - 300
            break
          case "bottom":
            newHeight = Math.max(200, startHeight + deltaY)
            break
          case "top":
            newHeight = Math.max(200, startHeight - deltaY)
            newY = startWindowY + deltaY
            if (newHeight === 200) newY = startWindowY + startHeight - 200
            break
          case "bottom-right":
            newWidth = Math.max(300, startWidth + deltaX)
            newHeight = Math.max(200, startHeight + deltaY)
            break
          case "bottom-left":
            newWidth = Math.max(300, startWidth - deltaX)
            newHeight = Math.max(200, startHeight + deltaY)
            newX = startWindowX + deltaX
            if (newWidth === 300) newX = startWindowX + startWidth - 300
            break
          case "top-right":
            newWidth = Math.max(300, startWidth + deltaX)
            newHeight = Math.max(200, startHeight - deltaY)
            newY = startWindowY + deltaY
            if (newHeight === 200) newY = startWindowY + startHeight - 200
            break
          case "top-left":
            newWidth = Math.max(300, startWidth - deltaX)
            newHeight = Math.max(200, startHeight - deltaY)
            newX = startWindowX + deltaX
            newY = startWindowY + deltaY
            if (newWidth === 300) newX = startWindowX + startWidth - 300
            if (newHeight === 200) newY = startWindowY + startHeight - 200
            break
        }

        // Ensure window stays within screen bounds
        newX = Math.max(0, Math.min(newX, window.innerWidth - newWidth))
        newY = Math.max(40, Math.min(newY, window.innerHeight - newHeight))

        return {
          ...w,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          isResizing: true,
        }
      }),
    )
  }

  // Start window resize
  const startWindowResize = (e: React.MouseEvent, windowId: string, handle: string) => {
    e.preventDefault()
    e.stopPropagation()

    const window = windows.find((w) => w.id === windowId)
    if (!window) return

    setResizingWindow({
      windowId,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: window.width,
      startHeight: window.height,
      startWindowX: window.x,
      startWindowY: window.y,
    })

    setActiveWindow(windowId)
  }

  const openApp = (app: App) => {
    const existingWindow = windows.find((w) => w.title === app.name)
    if (existingWindow) {
      if (existingWindow.minimized) {
        setWindows(windows.map((w) => (w.id === existingWindow.id ? { ...w, minimized: false } : w)))
      }
      setActiveWindow(existingWindow.id)
      return
    }

    const newWindow: Window = {
      id: `window-${Date.now()}`,
      title: app.name,
      icon: app.icon,
      x: Math.random() * 200 + 100,
      y: Math.random() * 200 + 100,
      width: 900,
      height: 700,
      minimized: false,
      maximized: false,
      component: app.component,
      snapped: null,
      isResizing: false,
    }
    setWindows([...windows, newWindow])
    setActiveWindow(newWindow.id)
    setSearchOpen(false)
  }

  const closeWindow = (windowId: string) => {
    setWindows(windows.filter((w) => w.id !== windowId))
    if (activeWindow === windowId) {
      setActiveWindow(null)
    }
  }

  const minimizeWindow = (windowId: string) => {
    setWindows(windows.map((w) => (w.id === windowId ? { ...w, minimized: true } : w)))
  }

  const maximizeWindow = (windowId: string) => {
    setWindows(
      windows.map((w) =>
        w.id === windowId
          ? {
              ...w,
              maximized: !w.maximized,
              x: w.maximized ? w.x : 0,
              y: w.maximized ? w.y : 40,
              width: w.maximized ? w.width : window.innerWidth,
              height: w.maximized ? w.height : window.innerHeight - 40,
              snapped: null,
            }
          : w,
      ),
    )
  }

  // Enhanced snap window function with multiple layouts
  const snapWindow = (windowId: string, zone: SnapZone) => {
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight - 40 // Account for top bar

    let newX = 0,
      newY = 40,
      newWidth = 0,
      newHeight = 0,
      snapType = null

    switch (zone) {
      case "left-half":
        newX = 0
        newY = 40
        newWidth = screenWidth / 2
        newHeight = screenHeight
        snapType = "left"
        break
      case "right-half":
        newX = screenWidth / 2
        newY = 40
        newWidth = screenWidth / 2
        newHeight = screenHeight
        snapType = "right"
        break
      case "top-left":
        newX = 0
        newY = 40
        newWidth = screenWidth / 2
        newHeight = screenHeight / 2
        snapType = "top-left"
        break
      case "top-right":
        newX = screenWidth / 2
        newY = 40
        newWidth = screenWidth / 2
        newHeight = screenHeight / 2
        snapType = "top-right"
        break
      case "bottom-left":
        newX = 0
        newY = 40 + screenHeight / 2
        newWidth = screenWidth / 2
        newHeight = screenHeight / 2
        snapType = "bottom-left"
        break
      case "bottom-right":
        newX = screenWidth / 2
        newY = 40 + screenHeight / 2
        newWidth = screenWidth / 2
        newHeight = screenHeight / 2
        snapType = "bottom-right"
        break
      case "maximize":
        newX = 0
        newY = 40
        newWidth = screenWidth
        newHeight = screenHeight
        snapType = null
        break
    }

    setWindows(
      windows.map((w) =>
        w.id === windowId
          ? {
              ...w,
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight,
              maximized: zone === "maximize",
              snapped: snapType as any,
            }
          : w,
      ),
    )
    setShowSnapZones(false)
    setDraggingWindow(null)
  }

  const handleWindowMouseDown = (e: React.MouseEvent, windowId: string) => {
    if ((e.target as HTMLElement).closest(".window-controls")) return
    if ((e.target as HTMLElement).closest(".resize-handle")) return

    dragRef.current = {
      windowId,
      startX: e.clientX,
      startY: e.clientY,
    }
    setActiveWindow(windowId)
    setDraggingWindow(windowId)
  }

  const handleWindowMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return

    const deltaX = e.clientX - dragRef.current.startX
    const deltaY = e.clientY - dragRef.current.startY

    // Show snap zones when dragging near edges
    const margin = 50
    const showZones =
      e.clientY < margin || // Top
      e.clientX < margin || // Left
      e.clientX > window.innerWidth - margin || // Right
      e.clientY > window.innerHeight - margin // Bottom

    setShowSnapZones(showZones)

    setWindows(
      windows.map((w) =>
        w.id === dragRef.current!.windowId && !w.maximized
          ? {
              ...w,
              x: Math.max(0, w.x + deltaX),
              y: Math.max(40, w.y + deltaY),
              snapped: null,
            }
          : w,
      ),
    )

    dragRef.current.startX = e.clientX
    dragRef.current.startY = e.clientY
  }

  const handleWindowMouseUp = (e: React.MouseEvent) => {
    if (dragRef.current && showSnapZones) {
      const windowId = dragRef.current.windowId
      const { clientX: x, clientY: y } = e
      const margin = 50

      // Determine snap zone based on mouse position
      if (y < margin) {
        if (x < window.innerWidth / 2) {
          snapWindow(windowId, "top-left")
        } else {
          snapWindow(windowId, "top-right")
        }
      } else if (y > window.innerHeight - margin) {
        if (x < window.innerWidth / 2) {
          snapWindow(windowId, "bottom-left")
        } else {
          snapWindow(windowId, "bottom-right")
        }
      } else if (x < margin) {
        snapWindow(windowId, "left-half")
      } else if (x > window.innerWidth - margin) {
        snapWindow(windowId, "right-half")
      }
    }

    dragRef.current = null
    setShowSnapZones(false)
    setDraggingWindow(null)

    // Clear resize state
    setWindows(windows.map((w) => ({ ...w, isResizing: false })))
  }

  // Parallax values for subtle background movement
  const parallaxX = useTransform(useMotionValue(mousePosition.x), [0, window.innerWidth || 1920], [-10, 10])
  const parallaxY = useTransform(useMotionValue(mousePosition.y), [0, window.innerHeight || 1080], [-5, 5])

  const dockStyles = getDockPositionStyles()

  return (
    <motion.div
      className="h-screen relative overflow-hidden"
      onMouseMove={handleWindowMouseMove}
      onMouseUp={handleWindowMouseUp}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Background with subtle parallax */}
      <motion.div
        className="absolute inset-0 bg-gray-900"
        style={{
          backgroundImage: "url('/wallpaper.jpg')",
          backgroundSize: "110%",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          x: parallaxX,
          y: parallaxY,
        }}
      />

      {/* Animated overlay */}
      <motion.div
        className="absolute inset-0 bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      />

      {/* Enhanced Snap Zones for Multi-tasking */}
      <AnimatePresence>
        {showSnapZones && (
          <>
            {/* Left Half */}
            <motion.div
              className="absolute top-10 left-0 w-1/2 h-[calc(100%-2.5rem)] bg-blue-500/20 border-2 border-blue-500/50 rounded-r-lg backdrop-blur-sm z-40"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={springConfig}
              onClick={() => draggingWindow && snapWindow(draggingWindow, "left-half")}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <ArrowLeft className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-lg font-semibold">Left Half</p>
                  <p className="text-sm opacity-75">50% width</p>
                </div>
              </div>
            </motion.div>

            {/* Right Half */}
            <motion.div
              className="absolute top-10 right-0 w-1/2 h-[calc(100%-2.5rem)] bg-blue-500/20 border-2 border-blue-500/50 rounded-l-lg backdrop-blur-sm z-40"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={springConfig}
              onClick={() => draggingWindow && snapWindow(draggingWindow, "right-half")}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <ArrowRight className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-lg font-semibold">Right Half</p>
                  <p className="text-sm opacity-75">50% width</p>
                </div>
              </div>
            </motion.div>

            {/* Top Left Quarter */}
            <motion.div
              className="absolute top-10 left-0 w-1/2 h-[calc(50%-1.25rem)] bg-green-500/20 border-2 border-green-500/50 rounded-br-lg backdrop-blur-sm z-40"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={springConfig}
              onClick={() => draggingWindow && snapWindow(draggingWindow, "top-left")}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <Square className="w-8 h-8 mx-auto mb-1" />
                  <p className="text-sm font-semibold">Top Left</p>
                  <p className="text-xs opacity-75">25%</p>
                </div>
              </div>
            </motion.div>

            {/* Top Right Quarter */}
            <motion.div
              className="absolute top-10 right-0 w-1/2 h-[calc(50%-1.25rem)] bg-green-500/20 border-2 border-green-500/50 rounded-bl-lg backdrop-blur-sm z-40"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={springConfig}
              onClick={() => draggingWindow && snapWindow(draggingWindow, "top-right")}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <Square className="w-8 h-8 mx-auto mb-1" />
                  <p className="text-sm font-semibold">Top Right</p>
                  <p className="text-xs opacity-75">25%</p>
                </div>
              </div>
            </motion.div>

            {/* Bottom Left Quarter */}
            <motion.div
              className="absolute bottom-10 left-0 w-1/2 h-[calc(50%-1.25rem)] bg-green-500/20 border-2 border-green-500/50 rounded-tr-lg backdrop-blur-sm z-40"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={springConfig}
              onClick={() => draggingWindow && snapWindow(draggingWindow, "bottom-left")}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <Square className="w-8 h-8 mx-auto mb-1" />
                  <p className="text-sm font-semibold">Bottom Left</p>
                  <p className="text-xs opacity-75">25%</p>
                </div>
              </div>
            </motion.div>

            {/* Bottom Right Quarter */}
            <motion.div
              className="absolute bottom-10 right-0 w-1/2 h-[calc(50%-1.25rem)] bg-green-500/20 border-2 border-green-500/50 rounded-tl-lg backdrop-blur-sm z-40"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={springConfig}
              onClick={() => draggingWindow && snapWindow(draggingWindow, "bottom-right")}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <Square className="w-8 h-8 mx-auto mb-1" />
                  <p className="text-sm font-semibold">Bottom Right</p>
                  <p className="text-xs opacity-75">25%</p>
                </div>
              </div>
            </motion.div>

            {/* Maximize Zone (Top Center) */}
            <motion.div
              className="absolute top-10 left-1/4 w-1/2 h-16 bg-purple-500/20 border-2 border-purple-500/50 rounded-lg backdrop-blur-sm z-40"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={springConfig}
              onClick={() => draggingWindow && snapWindow(draggingWindow, "maximize")}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center flex items-center gap-2">
                  <Maximize2 className="w-6 h-6" />
                  <span className="font-semibold">Maximize</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Top Bar with adaptive glow */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-10 bg-black/30 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 z-50"
        style={{ boxShadow: getAdaptiveGlow("low") }}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={springConfig}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-2 group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={bouncySpring}
          >
            <motion.div
              className="w-6 h-6 bg-gradient-to-br from-purple-500 to-green-400 rounded-md flex items-center justify-center"
              whileHover={{
                scale: 1.1,
                rotate: 5,
                boxShadow: getAdaptiveGlow("high"),
              }}
              transition={springConfig}
            >
              <Terminal className="w-3 h-3 text-white" />
            </motion.div>
            <motion.span
              className="text-white font-medium text-sm"
              whileHover={{ color: "#c084fc" }}
              transition={{ duration: 0.2 }}
            >
              MominOS
            </motion.span>
          </motion.div>

          {/* Virtual Desktop Switcher */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((desktop, index) => (
              <motion.div
                key={desktop}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springConfig, delay: index * 0.1 }}
              >
                <motion.button
                  className={`w-8 h-6 text-xs rounded-md ${
                    currentDesktop === desktop
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                  style={{
                    boxShadow: currentDesktop === desktop ? getAdaptiveGlow("medium") : "none",
                  }}
                  onClick={() => setCurrentDesktop(desktop)}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  transition={bouncySpring}
                >
                  {desktop}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="flex items-center gap-4 text-gray-300 text-sm"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...springConfig, delay: 0.3 }}
        >
          <motion.button
            className="p-1 rounded-md hover:bg-white/10"
            whileHover={{ scale: 1.1, rotate: 5, boxShadow: getAdaptiveGlow("low") }}
            whileTap={{ scale: 0.9 }}
            transition={springConfig}
          >
            <Bell className="w-4 h-4" />
          </motion.button>

          <motion.div
            className="flex items-center gap-1 cursor-pointer"
            whileHover={{ scale: 1.05, color: "#ffffff" }}
            transition={{ duration: 0.2 }}
          >
            <Wifi className="w-4 h-4" />
          </motion.div>

          <motion.div
            className="flex items-center gap-1 cursor-pointer"
            whileHover={{ scale: 1.05, color: "#ffffff" }}
            transition={{ duration: 0.2 }}
          >
            <Volume2 className="w-4 h-4" />
          </motion.div>

          <motion.div
            className="flex items-center gap-1 cursor-pointer"
            whileHover={{ scale: 1.05, color: "#ffffff" }}
            transition={{ duration: 0.2 }}
          >
            <Battery className="w-4 h-4" />
            <span>87%</span>
          </motion.div>

          <motion.div
            className="text-white font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {time.toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            })}
          </motion.div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              whileHover={{ scale: 1.1, boxShadow: getAdaptiveGlow("medium") }}
              whileTap={{ scale: 0.9 }}
              transition={springConfig}
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-purple-500/20 text-purple-300 text-xs">
                  <LogOut className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  className="absolute top-8 right-0 w-48 bg-black/80 backdrop-blur-xl border-white/10 p-2 z-50 rounded-xl"
                  style={{ boxShadow: getAdaptiveGlow("high") }}
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={springConfig}
                >
                  <motion.div
                    className="p-2 border-b border-white/10 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="text-white font-medium">{user?.name}</div>
                    <div className="text-gray-400 text-sm">@{user?.username}</div>
                  </motion.div>
                  <div className="space-y-1">
                    {[
                      { icon: Settings, label: "System Preferences" },
                      { icon: Monitor, label: "Display Settings" },
                      { icon: LogOut, label: "Sign Out", action: onLogout },
                      { icon: Power, label: "Shut Down" },
                    ].map((item, index) => (
                      <motion.button
                        key={item.label}
                        className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-gray-300 hover:text-white hover:bg-white/10"
                        onClick={item.action}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...springConfig, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 2, boxShadow: getAdaptiveGlow("low") }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Desktop Icons */}
      <motion.div
        className="absolute top-16 left-4 space-y-4"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...springConfig, delay: 0.4 }}
      >
        <DesktopIcon
          icon={FolderOpen}
          label="Home"
          onClick={() => openApp(desktopApps.find((app) => app.id === "files")!)}
          adaptiveGlow={getAdaptiveGlow("low")}
        />
        <DesktopIcon icon={Trash2} label="Trash" onClick={() => {}} adaptiveGlow={getAdaptiveGlow("low")} />
      </motion.div>

      {/* App Launcher */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-xl z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-full max-w-4xl mx-4 bg-black/80 backdrop-blur-xl border-white/10 rounded-2xl"
              style={{ boxShadow: getAdaptiveGlow("high") }}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={springConfig}
            >
              <div className="p-6">
                <motion.div
                  className="relative mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springConfig, delay: 0.1 }}
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search applications, files, and more..."
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400 text-lg py-3 focus:border-purple-500/50 rounded-xl"
                    style={{ boxShadow: getAdaptiveGlow("low") }}
                    autoFocus
                  />
                </motion.div>

                <div className="grid grid-cols-5 gap-4">
                  {desktopApps
                    .filter((app) => app.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((app, index) => {
                      const Icon = app.icon
                      return (
                        <motion.button
                          key={app.id}
                          onClick={() => openApp(app)}
                          className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-white/10"
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ ...springConfig, delay: index * 0.05 }}
                          whileHover={{
                            scale: 1.05,
                            y: -5,
                            transition: { ...bouncySpring, duration: 0.2 },
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.div
                            className={`w-16 h-16 bg-gradient-to-br ${app.color} rounded-xl flex items-center justify-center shadow-lg`}
                            whileHover={{
                              scale: 1.1,
                              rotate: 2,
                              boxShadow: getAdaptiveGlow("high"),
                            }}
                            transition={springConfig}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </motion.div>
                          <motion.span
                            className="text-white text-sm font-medium"
                            whileHover={{ color: "#c084fc" }}
                            transition={{ duration: 0.2 }}
                          >
                            {app.name}
                          </motion.span>
                        </motion.button>
                      )
                    })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Windows with resize handles */}
      <AnimatePresence>
        {windows
          .filter((w) => !w.minimized)
          .map((window) => {
            const Icon = window.icon
            const WindowComponent = window.component
            const isFullscreen = window.maximized || window.snapped

            return (
              <motion.div
                key={window.id}
                className={`absolute bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl ${
                  activeWindow === window.id ? "z-30 border-purple-500/30" : "z-20"
                } ${window.isResizing ? "select-none" : ""}`}
                style={{
                  left: window.x,
                  top: window.y,
                  width: window.width,
                  height: window.height,
                  boxShadow: isFullscreen ? "none" : getAdaptiveGlow("high"),
                  cursor: window.isResizing ? "nw-resize" : "default",
                }}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={springConfig}
                onMouseDown={(e) => handleWindowMouseDown(e, window.id)}
                whileHover={!isFullscreen ? { boxShadow: getAdaptiveGlow("high") } : {}}
              >
                {/* Resize Handles */}
                {!isFullscreen && (
                  <>
                    {/* Corner handles */}
                    <div
                      className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "top-left")}
                    />
                    <div
                      className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "top-right")}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "bottom-left")}
                    />
                    <div
                      className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "bottom-right")}
                    />

                    {/* Edge handles */}
                    <div
                      className="absolute top-0 left-3 right-3 h-1 cursor-n-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "top")}
                    />
                    <div
                      className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "bottom")}
                    />
                    <div
                      className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "left")}
                    />
                    <div
                      className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize resize-handle"
                      onMouseDown={(e) => startWindowResize(e, window.id, "right")}
                    />
                  </>
                )}

                {/* Window Title Bar */}
                <motion.div
                  className="flex items-center justify-between p-3 border-b border-white/10 cursor-move bg-gradient-to-r from-transparent to-white/5 rounded-t-xl"
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={springConfig}>
                      <Icon className="w-4 h-4 text-purple-400" />
                    </motion.div>
                    <span className="text-white text-sm font-medium">{window.title}</span>
                    {window.snapped && (
                      <motion.div
                        className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={springConfig}
                      >
                        {window.snapped.replace("-", " ")}
                      </motion.div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 window-controls">
                    <motion.button
                      onClick={() => minimizeWindow(window.id)}
                      className="w-6 h-6 rounded-full bg-yellow-500/20 hover:bg-yellow-500/40 flex items-center justify-center"
                      whileHover={{ scale: 1.2, boxShadow: getAdaptiveGlow("medium") }}
                      whileTap={{ scale: 0.9 }}
                      transition={springConfig}
                    >
                      <Minimize2 className="w-3 h-3 text-yellow-400" />
                    </motion.button>
                    <motion.button
                      onClick={() => maximizeWindow(window.id)}
                      className="w-6 h-6 rounded-full bg-green-500/20 hover:bg-green-500/40 flex items-center justify-center"
                      whileHover={{ scale: 1.2, boxShadow: getAdaptiveGlow("medium") }}
                      whileTap={{ scale: 0.9 }}
                      transition={springConfig}
                    >
                      <Maximize2 className="w-3 h-3 text-green-400" />
                    </motion.button>
                    <motion.button
                      onClick={() => closeWindow(window.id)}
                      className="w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center"
                      whileHover={{ scale: 1.2, boxShadow: getAdaptiveGlow("medium") }}
                      whileTap={{ scale: 0.9 }}
                      transition={springConfig}
                    >
                      <X className="w-3 h-3 text-red-400" />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Window Content */}
                <div className="h-[calc(100%-49px)] overflow-hidden">
                  {WindowComponent ? (
                    <WindowComponent />
                  ) : (
                    <motion.div
                      className="p-4 h-full flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="text-gray-400 text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ ...bouncySpring, delay: 0.3 }}
                        >
                          <Icon className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                        </motion.div>
                        <p>{window.title} application would load here</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
      </AnimatePresence>

      {/* Draggable Dock with adaptive glow */}
      <motion.div
        ref={dockRef}
        className={dockStyles.className}
        style={dockStyles.style}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...springConfig, delay: 0.6 }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDraggingDock(true)}
        onDragEnd={handleDockDrag}
        whileDrag={{ scale: 1.05, rotate: isDraggingDock ? 2 : 0 }}
      >
        <motion.div
          className="bg-black/40 backdrop-blur-xl border-white/10 p-3 rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing"
          style={{ boxShadow: getAdaptiveGlow("high") }}
          whileHover={{ scale: 1.02, y: -2, boxShadow: getAdaptiveGlow("high") }}
          transition={gentleSpring}
        >
          <div
            className={`flex items-center gap-2 ${dockPosition.includes("left") || dockPosition.includes("right") ? "flex-col" : "flex-row"}`}
          >
            {/* App Launcher */}
            <DockItem
              isLauncher
              onClick={() => setSearchOpen(true)}
              isHovered={hoveredDockItem === "launcher"}
              onHover={() => setHoveredDockItem("launcher")}
              onLeave={() => setHoveredDockItem(null)}
              adaptiveGlow={getAdaptiveGlow("medium")}
            >
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-purple-600 to-green-600 rounded-xl flex items-center justify-center"
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                  boxShadow: getAdaptiveGlow("high"),
                }}
                whileTap={{ scale: 0.9, rotate: -5 }}
                transition={bouncySpring}
              >
                <Grid3X3 className="w-6 h-6 text-white" />
              </motion.div>
            </DockItem>

            {/* Dock Apps */}
            {dockApps.map((app, index) => {
              const Icon = app.icon
              const isRunning = windows.some((w) => w.title === app.name)
              const isHovered = hoveredDockItem === app.id

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springConfig, delay: 0.7 + index * 0.05 }}
                >
                  <DockItem
                    onClick={() => openApp(app)}
                    isHovered={isHovered}
                    onHover={() => setHoveredDockItem(app.id)}
                    onLeave={() => setHoveredDockItem(null)}
                    isRunning={isRunning}
                    adaptiveGlow={getAdaptiveGlow("medium")}
                  >
                    <motion.div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isRunning ? "bg-white/20 text-purple-300" : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                      whileHover={{
                        scale: 1.2,
                        y: dockPosition.includes("left") || dockPosition.includes("right") ? 0 : -8,
                        x: dockPosition.includes("left") ? -8 : dockPosition.includes("right") ? 8 : 0,
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        boxShadow: getAdaptiveGlow("high"),
                      }}
                      whileTap={{ scale: 0.9 }}
                      transition={bouncySpring}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.div>
                  </DockItem>
                </motion.div>
              )
            })}

            {/* Running Apps not in dock */}
            <AnimatePresence>
              {windows
                .filter((w) => !dockApps.some((app) => app.name === w.title))
                .map((window) => {
                  const Icon = window.icon
                  const isHovered = hoveredDockItem === window.id

                  return (
                    <motion.div
                      key={window.id}
                      initial={{ opacity: 0, scale: 0, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0, x: -20 }}
                      transition={bouncySpring}
                    >
                      <DockItem
                        onClick={() => {
                          if (window.minimized) {
                            setWindows(windows.map((w) => (w.id === window.id ? { ...w, minimized: false } : w)))
                          }
                          setActiveWindow(window.id)
                        }}
                        isHovered={isHovered}
                        onHover={() => setHoveredDockItem(window.id)}
                        onLeave={() => setHoveredDockItem(null)}
                        isRunning={true}
                        adaptiveGlow={getAdaptiveGlow("medium")}
                      >
                        <motion.div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            activeWindow === window.id ? "bg-purple-600 text-white" : "bg-white/20 text-purple-300"
                          }`}
                          whileHover={{
                            scale: 1.2,
                            y: dockPosition.includes("left") || dockPosition.includes("right") ? 0 : -8,
                            x: dockPosition.includes("left") ? -8 : dockPosition.includes("right") ? 8 : 0,
                            boxShadow: getAdaptiveGlow("high"),
                          }}
                          whileTap={{ scale: 0.9 }}
                          transition={bouncySpring}
                        >
                          <Icon className="w-6 h-6" />
                        </motion.div>
                      </DockItem>
                    </motion.div>
                  )
                })}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Click outside handlers */}
      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-30"
            onClick={() => setSearchOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function DockItem({
  children,
  onClick,
  isHovered,
  onHover,
  onLeave,
  isRunning = false,
  isLauncher = false,
  adaptiveGlow,
}: {
  children: React.ReactNode
  onClick: () => void
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  isRunning?: boolean
  isLauncher?: boolean
  adaptiveGlow: string
}) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute -top-12 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md whitespace-nowrap"
            style={{ boxShadow: adaptiveGlow }}
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
            transition={springConfig}
          >
            App Name
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={onClick}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        className="relative"
        whileTap={{ scale: 0.9 }}
        transition={bouncySpring}
      >
        {children}
      </motion.button>

      {/* Running indicator */}
      <AnimatePresence>
        {isRunning && !isLauncher && (
          <motion.div
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={springConfig}
          >
            <motion.div
              className="w-full h-full bg-white rounded-full"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DesktopIcon({
  icon: Icon,
  label,
  onClick,
  adaptiveGlow,
}: {
  icon: any
  label: string
  onClick: () => void
  adaptiveGlow: string
}) {
  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 group"
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={springConfig}
    >
      <motion.div
        className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-black/40"
        whileHover={{
          scale: 1.1,
          boxShadow: adaptiveGlow,
        }}
        transition={springConfig}
      >
        <Icon className="w-6 h-6 text-white/80 group-hover:text-white" />
      </motion.div>
      <motion.span
        className="text-white text-xs font-medium drop-shadow-lg group-hover:text-purple-200"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.span>
    </motion.button>
  )
}

// Enhanced app components remain the same...
function TerminalApp() {
  return (
    <motion.div
      className="h-full bg-black/90 p-4 font-mono text-green-400"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="mb-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        MominOS Terminal v2.1.0
      </motion.div>
      <motion.div
        className="mb-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        Type 'help' for available commands
      </motion.div>
      <motion.div
        className="flex items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-purple-400">user@momin-os:~$</span>
        <motion.span
          className="ml-2"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
        >
          _
        </motion.span>
      </motion.div>
    </motion.div>
  )
}

function FilesApp() {
  return (
    <motion.div
      className="h-full bg-black/90 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-white text-center mt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...bouncySpring, delay: 0.3 }}
        >
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          File Explorer
        </motion.p>
        <motion.p
          className="text-gray-400 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Browse your files and folders
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

function SettingsApp() {
  return (
    <motion.div
      className="h-full bg-black/90 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-white text-center mt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...bouncySpring, delay: 0.3 }}
        >
          <Settings className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          System Settings
        </motion.p>
        <motion.p
          className="text-gray-400 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Configure your system preferences
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

function BrowserApp() {
  return (
    <motion.div
      className="h-full bg-black/90 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-white text-center mt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...bouncySpring, delay: 0.3 }}>
          <Chrome className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          Web Browser
        </motion.p>
        <motion.p
          className="text-gray-400 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Browse the internet
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

function CodeApp() {
  return (
    <motion.div
      className="h-full bg-black/90 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-white text-center mt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...bouncySpring, delay: 0.3 }}
        >
          <Code className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          Code Editor
        </motion.p>
        <motion.p
          className="text-gray-400 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Write and edit code
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

function MusicApp() {
  return (
    <motion.div
      className="h-full bg-black/90 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-white text-center mt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...bouncySpring, delay: 0.3 }}>
          <Music className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          Music Player
        </motion.p>
        <motion.p
          className="text-gray-400 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Play your favorite music
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

function PhotosApp() {
  return (
    <motion.div
      className="h-full bg-black/90 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-white text-center mt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...bouncySpring, delay: 0.3 }}
        >
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          Photos
        </motion.p>
        <motion.p
          className="text-gray-400 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          View and organize your photos
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

function CalculatorApp() {
  return (
    <motion.div
      className="h-full bg-black/90 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-white text-center mt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...bouncySpring, delay: 0.3 }}>
          <Calculator className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          Calculator
        </motion.p>
        <motion.p
          className="text-gray-400 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Perform calculations
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

function CalendarApp() {
  return (
    <motion.div
      className="h-full bg-black/90 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-white text-center mt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          initial={{ scale: 0, rotateY: 180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ ...bouncySpring, delay: 0.3 }}
        >
          <Calendar className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          Calendar
        </motion.p>
        <motion.p
          className="text-gray-400 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Manage your schedule
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

function MailApp() {
  return (
    <motion.div
      className="h-full bg-black/90 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-white text-center mt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...bouncySpring, delay: 0.3 }}
        >
          <Mail className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          Mail
        </motion.p>
        <motion.p
          className="text-gray-400 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Send and receive emails
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

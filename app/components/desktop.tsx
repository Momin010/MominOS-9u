"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
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
  Volume2,
  Bell,
  LogOut,
  Power,
  Monitor,
  Trash2,
  ArrowLeft,
  ArrowRight,
  WifiOff,
  VolumeX,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Check,
  Lock,
  Minus,
  Plus,
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
  snapped?: "left" | "right" | null
  isResizing?: boolean
}

type DockPosition = "bottom" | "top" | "left" | "right" | "bottom-left" | "bottom-right" | "top-left" | "top-right"
type SnapZone = "left-half" | "right-half" | "maximize"

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

// Mock data
const mockNotifications = [
  { id: 1, title: "System Update", message: "MominOS update available", time: "10:30 AM", read: false },
  { id: 2, title: "Calendar", message: "Meeting in 15 minutes", time: "11:45 AM", read: false },
  { id: 3, title: "Mail", message: "New message from Alex", time: "Yesterday", read: true },
  { id: 4, title: "Settings", message: "Backup completed successfully", time: "Yesterday", read: true },
]

const mockNetworks = [
  { name: "MominOS-WiFi", strength: 4, secured: false, connected: true },
  { name: "Home-Network", strength: 3, secured: true, connected: false },
  { name: "Office-5G", strength: 2, secured: true, connected: false },
  { name: "Guest-Network", strength: 1, secured: false, connected: false },
]

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

  const [showWindowPreview, setShowWindowPreview] = useState<string | null>(null)
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 })

  // System state
  const [wifiEnabled, setWifiEnabled] = useState(true)
  const [volumeLevel, setVolumeLevel] = useState(75)
  const [volumeEnabled, setVolumeEnabled] = useState(true)
  const [batteryLevel, setBatteryLevel] = useState(87)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showWifiMenu, setShowWifiMenu] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [showBatteryMenu, setShowBatteryMenu] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const [unreadNotifications, setUnreadNotifications] = useState(mockNotifications.filter((n) => !n.read).length)

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

  // Simulate battery drain
  useEffect(() => {
    const batteryTimer = setInterval(() => {
      setBatteryLevel((prev) => {
        if (prev <= 1) return 100
        return prev - 1
      })
    }, 60000) // Every minute
    return () => clearInterval(batteryTimer)
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
  // const handleDockDrag = useCallback((event: any, info: PanInfo) => {
  //   const { x, y } = info.point
  //   const windowWidth = window.innerWidth
  //   const windowHeight = window.innerHeight

  //   let newPosition: DockPosition = "bottom"

  //   const margin = 100
  //   const isNearLeft = x < margin
  //   const isNearRight = x > windowWidth - margin
  //   const isNearTop = y < margin + 64
  //   const isNearBottom = y > windowHeight - margin

  //   if (isNearLeft && isNearTop) newPosition = "top-left"
  //   else if (isNearRight && isNearTop) newPosition = "top-right"
  //   else if (isNearLeft && isNearBottom) newPosition = "bottom-left"
  //   else if (isNearRight && isNearBottom) newPosition = "bottom-right"
  //   else if (isNearLeft) newPosition = "left"
  //   else if (isNearRight) newPosition = "right"
  //   else if (isNearTop) newPosition = "top"
  //   else newPosition = "bottom"

  //   setDockPosition(newPosition)
  // }, [])

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

  // Simplified snap window function - only 50/50 splits
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

    // Show snap zones when dragging near edges - larger margins for easier snapping
    const margin = 100 // Increased margin for easier snapping
    const showZones =
      e.clientY < margin || // Top
      e.clientX < margin || // Left
      e.clientX > window.innerWidth - margin // Right

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
      const margin = 100
      const windowWidth = window.innerWidth

      // Simplified snapping - only left/right halves and maximize
      if (x < margin) {
        snapWindow(windowId, "left-half")
      } else if (x > windowWidth - margin) {
        snapWindow(windowId, "right-half")
      } else if (y < margin) {
        snapWindow(windowId, "maximize")
      }
    }

    dragRef.current = null
    setShowSnapZones(false)
    setDraggingWindow(null)

    // Clear resize state
    setWindows(windows.map((w) => ({ ...w, isResizing: false })))
  }

  // System control functions
  const toggleWifi = () => {
    setWifiEnabled(!wifiEnabled)
    setShowWifiMenu(false)
  }

  const connectToNetwork = (networkName: string) => {
    // Mock network connection
    console.log(`Connecting to ${networkName}...`)
    setShowWifiMenu(false)
  }

  const toggleVolume = () => {
    setVolumeEnabled(!volumeEnabled)
    if (!volumeEnabled) {
      setVolumeLevel(75)
    } else {
      setVolumeLevel(0)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolumeLevel(newVolume)
    setVolumeEnabled(newVolume > 0)
  }

  const toggleNotifications = () => {
    if (!showNotifications) {
      // Mark all as read when opening
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
      setUnreadNotifications(0)
    }
    setShowNotifications(!showNotifications)
  }

  const clearNotifications = () => {
    setNotifications([])
    setUnreadNotifications(0)
  }

  const emptyTrash = () => {
    // Show a mock animation
    const trashIcon = document.querySelector(".trash-icon")
    if (trashIcon) {
      trashIcon.classList.add("animate-bounce")
      setTimeout(() => {
        trashIcon.classList.remove("animate-bounce")
      }, 1000)
    }
  }

  // Generate window preview
  const generateWindowPreview = (windowId: string) => {
    const window = windows.find((w) => w.id === windowId)
    if (!window) return null

    return {
      id: windowId,
      title: window.title,
      icon: window.icon,
      isMinimized: window.minimized,
      isActive: activeWindow === windowId,
      preview: `Window content preview for ${window.title}`, // In real implementation, this would be a screenshot
    }
  }

  // Get battery icon based on level
  const getBatteryIcon = () => {
    if (batteryLevel > 70) return <BatteryFull className="w-4 h-4" />
    if (batteryLevel > 30) return <BatteryMedium className="w-4 h-4" />
    return <BatteryLow className="w-4 h-4 text-red-400" />
  }

  // Get signal strength bars
  const getSignalBars = (strength: number) => {
    return Array.from({ length: 4 }, (_, i) => (
      <div
        key={i}
        className={`w-1 bg-white rounded-full ${
          i < strength ? "opacity-100" : "opacity-30"
        } ${i === 0 ? "h-1" : i === 1 ? "h-2" : i === 2 ? "h-3" : "h-4"}`}
      />
    ))
  }

  // Filter apps based on search query
  const filteredApps = desktopApps.filter((app) => app.name.toLowerCase().includes(searchQuery.toLowerCase()))

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

      {/* Simplified Snap Zones - Only 50/50 splits and maximize */}
      <AnimatePresence>
        {showSnapZones && (
          <>
            {/* Left Half - Large and prominent */}
            <motion.div
              className="absolute top-10 left-0 w-1/2 h-[calc(100%-2.5rem)] bg-blue-500/25 border-2 border-blue-500/60 rounded-r-2xl backdrop-blur-sm z-40"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={springConfig}
              onClick={() => draggingWindow && snapWindow(draggingWindow, "left-half")}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <ArrowLeft className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-3xl font-bold mb-2">Left Half</p>
                  <p className="text-xl opacity-80">50% width</p>
                </div>
              </div>
            </motion.div>

            {/* Right Half - Large and prominent */}
            <motion.div
              className="absolute top-10 right-0 w-1/2 h-[calc(100%-2.5rem)] bg-blue-500/25 border-2 border-blue-500/60 rounded-l-2xl backdrop-blur-sm z-40"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={springConfig}
              onClick={() => draggingWindow && snapWindow(draggingWindow, "right-half")}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <ArrowRight className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-3xl font-bold mb-2">Right Half</p>
                  <p className="text-xl opacity-80">50% width</p>
                </div>
              </div>
            </motion.div>

            {/* Maximize Zone (Top Center) - Larger for easier access */}
            <motion.div
              className="absolute top-10 left-1/4 w-1/2 h-32 bg-purple-500/25 border-2 border-purple-500/60 rounded-2xl backdrop-blur-sm z-40"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={springConfig}
              onClick={() => draggingWindow && snapWindow(draggingWindow, "maximize")}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center flex items-center gap-4">
                  <Maximize2 className="w-12 h-12" />
                  <span className="text-3xl font-bold">Maximize</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Top Bar with functional system controls */}
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
            onClick={() => setSearchOpen(true)}
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
          {/* Notifications */}
          <div className="relative">
            <motion.button
              className="p-1 rounded-md hover:bg-white/10 relative"
              whileHover={{ scale: 1.1, rotate: 5, boxShadow: getAdaptiveGlow("low") }}
              whileTap={{ scale: 0.9 }}
              transition={springConfig}
              onClick={toggleNotifications}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={bouncySpring}
                >
                  <span className="text-xs text-white font-bold">{unreadNotifications}</span>
                </motion.div>
              )}
            </motion.button>

            {/* Notifications Panel */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  className="absolute top-8 right-0 w-80 bg-black/90 backdrop-blur-xl border border-white/10 p-3 z-50 rounded-xl"
                  style={{ boxShadow: getAdaptiveGlow("high") }}
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={springConfig}
                >
                  <div className="flex justify-between items-center p-2 border-b border-white/10 mb-2">
                    <h3 className="text-white font-medium">Notifications</h3>
                    <motion.button
                      className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/10"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearNotifications}
                    >
                      Clear All
                    </motion.button>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          className={`p-3 mb-2 rounded-lg ${
                            notification.read ? "bg-white/5" : "bg-white/10"
                          } hover:bg-white/15 cursor-pointer`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ ...springConfig, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-white">{notification.title}</span>
                            <span className="text-xs text-gray-400">{notification.time}</span>
                          </div>
                          <p className="text-xs text-gray-300 mt-1">{notification.message}</p>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        className="p-6 text-center text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* WiFi */}
          <div className="relative">
            <motion.div
              className="flex items-center gap-1 cursor-pointer p-1 rounded-md hover:bg-white/10"
              whileHover={{ scale: 1.05, color: "#ffffff" }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowWifiMenu(!showWifiMenu)}
            >
              {wifiEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4 text-gray-500" />}
            </motion.div>

            {/* WiFi Menu */}
            <AnimatePresence>
              {showWifiMenu && (
                <motion.div
                  className="absolute top-8 right-0 w-64 bg-black/90 backdrop-blur-xl border border-white/10 p-3 z-50 rounded-xl"
                  style={{ boxShadow: getAdaptiveGlow("high") }}
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={springConfig}
                >
                  <div className="flex justify-between items-center p-2 border-b border-white/10 mb-2">
                    <h3 className="text-white font-medium">Wi-Fi</h3>
                    <motion.button
                      className={`text-xs px-2 py-1 rounded-md ${
                        wifiEnabled ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleWifi}
                    >
                      {wifiEnabled ? "ON" : "OFF"}
                    </motion.button>
                  </div>

                  {wifiEnabled && (
                    <div className="space-y-1">
                      {mockNetworks.map((network, index) => (
                        <motion.div
                          key={network.name}
                          className={`p-2 rounded-lg cursor-pointer ${
                            network.connected ? "bg-blue-600/30" : "hover:bg-white/10"
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ ...springConfig, delay: index * 0.05 }}
                          onClick={() => connectToNetwork(network.name)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">{getSignalBars(network.strength)}</div>
                              <span className="text-white text-sm">{network.name}</span>
                              {network.secured && <Lock className="w-3 h-3 text-gray-400" />}
                            </div>
                            {network.connected && <Check className="w-4 h-4 text-green-400" />}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Volume */}
          <div className="relative">
            <motion.div
              className="flex items-center gap-1 cursor-pointer p-1 rounded-md hover:bg-white/10"
              whileHover={{ scale: 1.05, color: "#ffffff" }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            >
              {volumeEnabled && volumeLevel > 0 ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-500" />
              )}
            </motion.div>

            {/* Volume Slider */}
            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  className="absolute top-8 right-0 w-48 bg-black/90 backdrop-blur-xl border border-white/10 p-4 z-50 rounded-xl"
                  style={{ boxShadow: getAdaptiveGlow("high") }}
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={springConfig}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white font-medium">Volume</h3>
                    <span className="text-gray-400 text-sm">{volumeLevel}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      className="p-1 rounded-md hover:bg-white/10"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleVolumeChange(Math.max(0, volumeLevel - 10))}
                    >
                      <Minus className="w-3 h-3 text-white" />
                    </motion.button>

                    <div className="flex-1 relative">
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-white rounded-full"
                          style={{ width: `${volumeLevel}%` }}
                          transition={gentleSpring}
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volumeLevel}
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>

                    <motion.button
                      className="p-1 rounded-md hover:bg-white/10"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleVolumeChange(Math.min(100, volumeLevel + 10))}
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </motion.button>
                  </div>

                  <motion.button
                    className="w-full mt-3 p-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleVolume}
                  >
                    {volumeEnabled ? "Mute" : "Unmute"}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Battery */}
          <div className="relative">
            <motion.div
              className="flex items-center gap-1 cursor-pointer p-1 rounded-md hover:bg-white/10"
              whileHover={{ scale: 1.05, color: "#ffffff" }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowBatteryMenu(!showBatteryMenu)}
            >
              {getBatteryIcon()}
              <span>{batteryLevel}%</span>
            </motion.div>

            {/* Battery Menu */}
            <AnimatePresence>
              {showBatteryMenu && (
                <motion.div
                  className="absolute top-8 right-0 w-56 bg-black/90 backdrop-blur-xl border border-white/10 p-4 z-50 rounded-xl"
                  style={{ boxShadow: getAdaptiveGlow("high") }}
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={springConfig}
                >
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-white mb-1">{batteryLevel}%</div>
                    <div className="text-gray-400 text-sm">{batteryLevel > 20 ? "Battery Normal" : "Low Battery"}</div>
                  </div>

                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-4">
                    <motion.div
                      className={`h-full rounded-full ${batteryLevel > 20 ? "bg-green-500" : "bg-red-500"}`}
                      style={{ width: `${batteryLevel}%` }}
                      transition={gentleSpring}
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Time remaining:</span>
                      <span>{Math.floor(batteryLevel / 10)} hours</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Power source:</span>
                      <span>Battery</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Condition:</span>
                      <span>Normal</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Time */}
          <motion.div
            className="text-white font-mono cursor-pointer p-1 rounded-md hover:bg-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
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
                  className="absolute top-8 right-0 w-48 bg-black/90 backdrop-blur-xl border border-white/10 p-2 z-50 rounded-xl"
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
                    <div className="text-white font-medium">{user?.name || "User"}</div>
                    <div className="text-gray-400 text-sm">@{user?.username || "user"}</div>
                  </motion.div>
                  <div className="space-y-1">
                    {[
                      {
                        icon: Settings,
                        label: "System Preferences",
                        action: () => {
                          openApp(desktopApps.find((app) => app.id === "settings")!)
                          setShowUserMenu(false)
                        },
                      },
                      {
                        icon: Monitor,
                        label: "Display Settings",
                        action: () => {
                          openApp(desktopApps.find((app) => app.id === "settings")!)
                          setShowUserMenu(false)
                        },
                      },
                      { icon: LogOut, label: "Sign Out", action: onLogout },
                      {
                        icon: Power,
                        label: "Shut Down",
                        action: () => {
                          // Simulate shutdown animation
                          document.body.style.transition = "opacity 1s ease-out"
                          document.body.style.opacity = "0"
                          setTimeout(() => {
                            document.body.style.opacity = "1"
                            document.body.style.transition = ""
                            onLogout()
                          }, 1000)
                        },
                      },
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
        <DesktopIcon
          icon={Trash2}
          label="Trash"
          onClick={emptyTrash}
          adaptiveGlow={getAdaptiveGlow("low")}
          className="trash-icon"
        />
      </motion.div>

      {/* Enhanced App Launcher with working search */}
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
                  {filteredApps.length > 0 ? (
                    filteredApps.map((app, index) => {
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
                    })
                  ) : (
                    <motion.div
                      className="col-span-5 text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Search className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
                      <p className="text-gray-400">No applications found for "{searchQuery}"</p>
                    </motion.div>
                  )}
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
                        {window.snapped === "left" ? "Left Half" : "Right Half"}
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

      {/* Draggable Dock with proper tooltips */}
      <motion.div
        ref={dockRef}
        className={dockStyles.className}
        style={dockStyles.style}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...springConfig, delay: 0.6 }}
        drag
        dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
        dragElastic={0.3}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
        onDragStart={() => setIsDraggingDock(true)}
        onDrag={(event, info) => {
          // Real-time position updates during drag
          const { x, y } = info.point
          const windowWidth = window.innerWidth
          const windowHeight = window.innerHeight

          let newPosition: DockPosition = "bottom"

          const margin = 150 // Larger detection area
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

          // Update position in real-time during drag
          if (newPosition !== dockPosition) {
            setDockPosition(newPosition)
          }
        }}
        onDragEnd={(event, info) => {
          setIsDraggingDock(false)
          // Final position is already set by onDrag
        }}
        whileDrag={{
          scale: 1.1,
          rotate: 0,
          boxShadow: getAdaptiveGlow("high"),
          zIndex: 100,
        }}
      >
        <motion.div
          className="bg-black/50 backdrop-blur-xl border-white/20 p-3 rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing"
          style={{ boxShadow: getAdaptiveGlow("high") }}
          whileHover={{
            scale: 1.02,
            y: dockPosition.includes("bottom") ? -4 : 0,
            x: dockPosition.includes("left") ? -4 : dockPosition.includes("right") ? 4 : 0,
            boxShadow: getAdaptiveGlow("high"),
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
              name="App Launcher"
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
              const runningWindow = windows.find((w) => w.title === app.name)
              const isRunning = !!runningWindow
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
                    onHover={() => {
                      setHoveredDockItem(app.id)
                      // Show preview for running apps after a short delay
                      if (runningWindow) {
                        setTimeout(() => {
                          if (hoveredDockItem === app.id) {
                            setShowWindowPreview(runningWindow.id)
                          }
                        }, 500)
                      }
                    }}
                    onLeave={() => {
                      setHoveredDockItem(null)
                      setShowWindowPreview(null)
                    }}
                    isRunning={isRunning}
                    adaptiveGlow={getAdaptiveGlow("medium")}
                    name={app.name}
                    windowId={runningWindow?.id}
                    showPreview={runningWindow && showWindowPreview === runningWindow.id}
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
                        onHover={() => {
                          setHoveredDockItem(window.id)
                          // Show preview after a short delay
                          setTimeout(() => {
                            if (hoveredDockItem === window.id) {
                              setShowWindowPreview(window.id)
                            }
                          }, 500)
                        }}
                        onLeave={() => {
                          setHoveredDockItem(null)
                          setShowWindowPreview(null)
                        }}
                        isRunning={true}
                        adaptiveGlow={getAdaptiveGlow("medium")}
                        name={window.title}
                        windowId={window.id}
                        showPreview={showWindowPreview === window.id}
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

      {/* Window Preview */}
      <AnimatePresence>
        {showWindowPreview && (
          <motion.div
            className="fixed z-50 pointer-events-none"
            style={{
              left: dockPosition.includes("left") ? "120px" : dockPosition.includes("right") ? "auto" : "50%",
              right: dockPosition.includes("right") ? "120px" : "auto",
              bottom: dockPosition.includes("bottom") ? "120px" : "auto",
              top: dockPosition.includes("top") ? "120px" : "auto",
              transform:
                !dockPosition.includes("left") && !dockPosition.includes("right") ? "translateX(-50%)" : "none",
            }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={springConfig}
          >
            <WindowPreview
              windowId={showWindowPreview}
              windows={windows}
              getAdaptiveGlow={getAdaptiveGlow}
              activeWindow={activeWindow}
            />
          </motion.div>
        )}
      </AnimatePresence>

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

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            className="fixed inset-0 z-40"
            onClick={() => setShowNotifications(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWifiMenu && (
          <motion.div
            className="fixed inset-0 z-40"
            onClick={() => setShowWifiMenu(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVolumeSlider && (
          <motion.div
            className="fixed inset-0 z-40"
            onClick={() => setShowVolumeSlider(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBatteryMenu && (
          <motion.div
            className="fixed inset-0 z-40"
            onClick={() => setShowBatteryMenu(false)}
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
  name,
  windowId,
  showPreview = false,
}: {
  children: React.ReactNode
  onClick: () => void
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  isRunning?: boolean
  isLauncher?: boolean
  adaptiveGlow: string
  name: string
  windowId?: string
  showPreview?: boolean
}) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Tooltip with proper app name */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute -top-12 bg-black/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap border border-white/10"
            style={{ boxShadow: adaptiveGlow }}
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
            transition={springConfig}
          >
            {name}
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

function WindowPreview({
  windowId,
  windows,
  getAdaptiveGlow,
  activeWindow,
}: {
  windowId: string
  windows: Window[]
  getAdaptiveGlow: (intensity: "low" | "medium" | "high") => string
  activeWindow: string | null
}) {
  const window = windows.find((w) => w.id === windowId)
  if (!window) return null

  const Icon = window.icon
  const WindowComponent = window.component

  return (
    <motion.div
      className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden"
      style={{
        width: "300px",
        height: "200px",
        boxShadow: getAdaptiveGlow("high"),
      }}
      whileHover={{ scale: 1.02 }}
      transition={gentleSpring}
    >
      {/* Preview Header */}
      <div className="flex items-center gap-2 p-2 border-b border-white/10 bg-gradient-to-r from-transparent to-white/5">
        <Icon className="w-3 h-3 text-purple-400" />
        <span className="text-white text-xs font-medium truncate">{window.title}</span>
        <div className="ml-auto flex gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
        </div>
      </div>

      {/* Preview Content */}
      <div className="h-[calc(100%-32px)] relative overflow-hidden">
        {window.minimized ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icon className="w-8 h-8 mx-auto mb-2 text-purple-400 opacity-50" />
              <p className="text-gray-400 text-xs">Window is minimized</p>
            </div>
          </div>
        ) : (
          <div className="relative h-full">
            {/* Simulated window content */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
              {WindowComponent ? (
                <div className="transform scale-75 origin-top-left w-[133%] h-[133%] pointer-events-none">
                  <WindowComponent />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Icon className="w-12 h-12 mx-auto mb-2 text-purple-400" />
                    <p className="text-white text-sm">{window.title}</p>
                    <p className="text-gray-400 text-xs">Live Preview</p>
                  </div>
                </div>
              )}
            </div>

            {/* Active window indicator */}
            {activeWindow === windowId && (
              <motion.div
                className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            )}

            {/* Snap indicator */}
            {window.snapped && (
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-purple-500/80 rounded text-xs text-white">
                {window.snapped === "left" ? "Left" : "Right"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview footer with window info */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-1 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-xs text-gray-300">
          {window.maximized
            ? "Maximized"
            : window.minimized
              ? "Minimized"
              : window.snapped
                ? `Snapped ${window.snapped}`
                : `${window.width}×${window.height}`}
        </p>
      </motion.div>
    </motion.div>
  )
}

function DesktopIcon({
  icon: Icon,
  label,
  onClick,
  adaptiveGlow,
  className = "",
}: {
  icon: any
  label: string
  onClick: () => void
  adaptiveGlow: string
  className?: string
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 group ${className}`}
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

// Placeholder app components (keeping them simple for now)
function TerminalApp() {
  return (
    <div className="h-full bg-black/90 p-4 font-mono text-green-400">
      <div className="mb-2">MominOS Terminal v2.1.0</div>
      <div className="mb-2">Type 'help' for available commands</div>
      <div className="flex items-center">
        <span className="text-purple-400">user@momin-os:~$</span>
        <span className="ml-2 animate-pulse">_</span>
      </div>
    </div>
  )
}

function FilesApp() {
  return (
    <div className="h-full bg-black/90 p-4">
      <div className="text-white text-center mt-20">
        <FolderOpen className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <p>File Explorer</p>
        <p className="text-gray-400 text-sm mt-2">Browse your files and folders</p>
      </div>
    </div>
  )
}

function SettingsApp() {
  return (
    <div className="h-full bg-black/90 p-4">
      <div className="text-white text-center mt-20">
        <Settings className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <p>System Settings</p>
        <p className="text-gray-400 text-sm mt-2">Configure your system preferences</p>
      </div>
    </div>
  )
}

function BrowserApp() {
  return (
    <div className="h-full bg-black/90 p-4">
      <div className="text-white text-center mt-20">
        <Chrome className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <p>Web Browser</p>
        <p className="text-gray-400 text-sm mt-2">Browse the internet</p>
      </div>
    </div>
  )
}

function CodeApp() {
  return (
    <div className="h-full bg-black/90 p-4">
      <div className="text-white text-center mt-20">
        <Code className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <p>Code Editor</p>
        <p className="text-gray-400 text-sm mt-2">Write and edit code</p>
      </div>
    </div>
  )
}

function MusicApp() {
  return (
    <div className="h-full bg-black/90 p-4">
      <div className="text-white text-center mt-20">
        <Music className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <p>Music Player</p>
        <p className="text-gray-400 text-sm mt-2">Play your favorite music</p>
      </div>
    </div>
  )
}

function PhotosApp() {
  return (
    <div className="h-full bg-black/90 p-4">
      <div className="text-white text-center mt-20">
        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <p>Photos</p>
        <p className="text-gray-400 text-sm mt-2">View and organize your photos</p>
      </div>
    </div>
  )
}

function CalculatorApp() {
  return (
    <div className="h-full bg-black/90 p-4">
      <div className="text-white text-center mt-20">
        <Calculator className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <p>Calculator</p>
        <p className="text-gray-400 text-sm mt-2">Perform calculations</p>
      </div>
    </div>
  )
}

function CalendarApp() {
  return (
    <div className="h-full bg-black/90 p-4">
      <div className="text-white text-center mt-20">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <p>Calendar</p>
        <p className="text-gray-400 text-sm mt-2">Manage your schedule</p>
      </div>
    </div>
  )
}

function MailApp() {
  return (
    <div className="h-full bg-black/90 p-4">
      <div className="text-white text-center mt-20">
        <Mail className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <p>Mail</p>
        <p className="text-gray-400 text-sm mt-2">Send and receive emails</p>
      </div>
    </div>
  )
}

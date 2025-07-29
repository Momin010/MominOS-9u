"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Store,
  Search,
  Star,
  Download,
  Trash2,
  Grid3X3,
  List,
  Filter,
  TrendingUp,
  Clock,
  Code,
  ImageIcon,
  Music,
  Video,
  Terminal,
  Chrome,
  Gamepad2,
  CheckCircle,
} from "lucide-react"

interface App {
  id: string
  name: string
  developer: string
  description: string
  icon: any
  rating: number
  downloads: string
  size: string
  price: number
  category: string
  screenshots: string[]
  installed: boolean
  installing: boolean
  installProgress: number
}

export default function AppStore() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedApp, setSelectedApp] = useState<App | null>(null)
  const [apps, setApps] = useState<App[]>([
    {
      id: "1",
      name: "Code Editor Pro",
      developer: "DevTools Inc.",
      description: "Professional code editor with AI assistance and advanced features for developers.",
      icon: Code,
      rating: 4.8,
      downloads: "2.1M",
      size: "156 MB",
      price: 0,
      category: "Development",
      screenshots: [],
      installed: false,
      installing: false,
      installProgress: 0,
    },
    {
      id: "2",
      name: "Photo Studio",
      developer: "Creative Labs",
      description: "Advanced photo editing and manipulation software with AI-powered tools.",
      icon: ImageIcon,
      rating: 4.6,
      downloads: "1.8M",
      size: "234 MB",
      price: 29.99,
      category: "Graphics",
      screenshots: [],
      installed: true,
      installing: false,
      installProgress: 0,
    },
    {
      id: "3",
      name: "Music Player",
      developer: "Audio Systems",
      description: "High-quality music player with equalizer and streaming support.",
      icon: Music,
      rating: 4.5,
      downloads: "3.2M",
      size: "89 MB",
      price: 0,
      category: "Media",
      screenshots: [],
      installed: false,
      installing: false,
      installProgress: 0,
    },
    {
      id: "4",
      name: "Video Editor",
      developer: "Media Pro",
      description: "Professional video editing suite with 4K support and effects library.",
      icon: Video,
      rating: 4.7,
      downloads: "956K",
      size: "512 MB",
      price: 49.99,
      category: "Media",
      screenshots: [],
      installed: false,
      installing: false,
      installProgress: 0,
    },
    {
      id: "5",
      name: "Terminal Plus",
      developer: "System Tools",
      description: "Enhanced terminal emulator with tabs, themes, and productivity features.",
      icon: Terminal,
      rating: 4.9,
      downloads: "1.2M",
      size: "45 MB",
      price: 0,
      category: "Utilities",
      screenshots: [],
      installed: false,
      installing: false,
      installProgress: 0,
    },
    {
      id: "6",
      name: "Web Browser",
      developer: "Browse Corp",
      description: "Fast and secure web browser with privacy features and ad blocking.",
      icon: Chrome,
      rating: 4.4,
      downloads: "5.1M",
      size: "178 MB",
      price: 0,
      category: "Internet",
      screenshots: [],
      installed: false,
      installing: false,
      installProgress: 0,
    },
  ])

  const categories = [
    { id: "all", name: "All Categories", icon: Grid3X3 },
    { id: "Development", name: "Development", icon: Code },
    { id: "Graphics", name: "Graphics", icon: ImageIcon },
    { id: "Media", name: "Media", icon: Music },
    { id: "Utilities", name: "Utilities", icon: Terminal },
    { id: "Internet", name: "Internet", icon: Chrome },
    { id: "Games", name: "Games", icon: Gamepad2 },
  ]

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.developer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || app.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const installApp = (appId: string) => {
    setApps(apps.map((app) => (app.id === appId ? { ...app, installing: true, installProgress: 0 } : app)))

    // Simulate installation progress
    const interval = setInterval(() => {
      setApps((prevApps) =>
        prevApps.map((app) => {
          if (app.id === appId && app.installing) {
            const newProgress = app.installProgress + 10
            if (newProgress >= 100) {
              clearInterval(interval)
              return { ...app, installing: false, installed: true, installProgress: 100 }
            }
            return { ...app, installProgress: newProgress }
          }
          return app
        }),
      )
    }, 200)
  }

  const uninstallApp = (appId: string) => {
    setApps(apps.map((app) => (app.id === appId ? { ...app, installed: false, installProgress: 0 } : app)))
  }

  if (selectedApp) {
    return (
      <AppDetailView
        app={selectedApp}
        onBack={() => setSelectedApp(null)}
        onInstall={installApp}
        onUninstall={uninstallApp}
      />
    )
  }

  return (
    <div className="h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">App Store</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Categories */}
          <div className="space-y-1">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = selectedCategory === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              )
            })}
          </div>

          {/* Quick Links */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Quick Links</div>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <TrendingUp className="w-4 h-4" />
                <span>Popular</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
                <span>Recent</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <Download className="w-4 h-4" />
                <span>Installed</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search apps..."
                className="pl-9 w-80 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-700 rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-purple-600" : "text-gray-400 hover:text-white"}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-purple-600" : "text-gray-400 hover:text-white"}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* App Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredApps.map((app) => {
                const Icon = app.icon
                return (
                  <Card
                    key={app.id}
                    className="bg-gray-900 border-gray-800 p-6 cursor-pointer hover:bg-gray-800 transition-all"
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-green-400/20 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{app.name}</h3>
                        <p className="text-gray-400 text-sm">{app.developer}</p>
                      </div>
                      {app.installed && <Badge className="bg-green-600 text-white text-xs">Installed</Badge>}
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{app.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white text-sm">{app.rating}</span>
                        <span className="text-gray-400 text-sm">({app.downloads})</span>
                      </div>
                      <div className="text-gray-400 text-sm">{app.size}</div>
                    </div>

                    {app.installing ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Installing...</span>
                          <span className="text-white">{app.installProgress}%</span>
                        </div>
                        <Progress value={app.installProgress} className="h-2" />
                      </div>
                    ) : (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          app.installed ? uninstallApp(app.id) : installApp(app.id)
                        }}
                        className={`w-full ${
                          app.installed
                            ? "bg-red-600 hover:bg-red-700"
                            : app.price > 0
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-purple-600 hover:bg-purple-700"
                        }`}
                      >
                        {app.installed ? (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Uninstall
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            {app.price > 0 ? `$${app.price}` : "Install"}
                          </>
                        )}
                      </Button>
                    )}
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApps.map((app) => {
                const Icon = app.icon
                return (
                  <Card
                    key={app.id}
                    className="bg-gray-900 border-gray-800 p-4 cursor-pointer hover:bg-gray-800 transition-all"
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-green-400/20 rounded-xl flex items-center justify-center">
                        <Icon className="w-8 h-8 text-purple-400" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{app.name}</h3>
                          {app.installed && <Badge className="bg-green-600 text-white text-xs">Installed</Badge>}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{app.developer}</p>
                        <p className="text-gray-400 text-sm">{app.description}</p>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white text-sm">{app.rating}</span>
                        </div>
                        <div className="text-gray-400 text-sm mb-2">{app.downloads}</div>
                        <div className="text-gray-400 text-sm">{app.size}</div>
                      </div>

                      <div className="w-32">
                        {app.installing ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Installing...</span>
                              <span className="text-white">{app.installProgress}%</span>
                            </div>
                            <Progress value={app.installProgress} className="h-2" />
                          </div>
                        ) : (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              app.installed ? uninstallApp(app.id) : installApp(app.id)
                            }}
                            className={`w-full ${
                              app.installed
                                ? "bg-red-600 hover:bg-red-700"
                                : app.price > 0
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "bg-purple-600 hover:bg-purple-700"
                            }`}
                          >
                            {app.installed ? (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Uninstall
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                {app.price > 0 ? `$${app.price}` : "Install"}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AppDetailView({
  app,
  onBack,
  onInstall,
  onUninstall,
}: {
  app: App
  onBack: () => void
  onInstall: (id: string) => void
  onUninstall: (id: string) => void
}) {
  const Icon = app.icon

  return (
    <div className="h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-6">
        <Button variant="ghost" onClick={onBack} className="text-gray-400 hover:text-white mr-4">
          ← Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-green-400/20 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-white font-semibold">{app.name}</h1>
            <p className="text-gray-400 text-sm">{app.developer}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Screenshots */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Screenshots</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-video bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-lg border border-gray-700"
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">About</h2>
                <p className="text-gray-300 leading-relaxed mb-4">{app.description}</p>
                <p className="text-gray-300 leading-relaxed">
                  This application provides advanced features and functionality designed to enhance your productivity
                  and workflow. With regular updates and excellent support, it's trusted by millions of users worldwide.
                </p>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
                <ul className="space-y-2 text-gray-300">
                  <li>• Advanced functionality with intuitive interface</li>
                  <li>• Regular updates and new features</li>
                  <li>• Cross-platform compatibility</li>
                  <li>• Professional support and documentation</li>
                  <li>• Customizable settings and preferences</li>
                </ul>
              </div>

              {/* Reviews */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Reviews</h2>
                <div className="space-y-4">
                  {[
                    { user: "Alex Johnson", rating: 5, comment: "Excellent app! Very intuitive and powerful." },
                    { user: "Sarah Chen", rating: 4, comment: "Great features, would recommend to others." },
                    { user: "Mike Wilson", rating: 5, comment: "Best app in its category. Love the interface!" },
                  ].map((review, index) => (
                    <Card key={index} className="bg-gray-900 border-gray-800 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-medium">{review.user}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? "text-yellow-400 fill-current" : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{review.comment}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <Card className="bg-gray-900 border-gray-800 p-6 sticky top-0">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-green-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-1">{app.name}</h3>
                  <p className="text-gray-400">{app.developer}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white">{app.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Downloads</span>
                    <span className="text-white">{app.downloads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Size</span>
                    <span className="text-white">{app.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category</span>
                    <span className="text-white">{app.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price</span>
                    <span className="text-white">{app.price > 0 ? `$${app.price}` : "Free"}</span>
                  </div>
                </div>

                {app.installing ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Installing...</span>
                      <span className="text-white">{app.installProgress}%</span>
                    </div>
                    <Progress value={app.installProgress} className="h-2" />
                  </div>
                ) : (
                  <Button
                    onClick={() => (app.installed ? onUninstall(app.id) : onInstall(app.id))}
                    className={`w-full ${
                      app.installed
                        ? "bg-red-600 hover:bg-red-700"
                        : app.price > 0
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    {app.installed ? (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Uninstall
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        {app.price > 0 ? `Buy for $${app.price}` : "Install"}
                      </>
                    )}
                  </Button>
                )}

                {app.installed && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Installed</span>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

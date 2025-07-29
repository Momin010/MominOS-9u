"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FolderOpen,
  Home,
  Download,
  ImageIcon,
  Music,
  Video,
  FileText,
  Archive,
  HardDrive,
  Wifi,
  Trash2,
  Search,
  Grid3X3,
  List,
  ArrowUp,
  Plus,
  Upload,
  SortAsc,
  MoreHorizontal,
  ChevronRight,
  Star,
  Clock,
} from "lucide-react"

interface FileItem {
  name: string
  type: "folder" | "file"
  size?: string
  modified: string
  icon: any
}

export default function FileExplorer() {
  const [currentPath, setCurrentPath] = useState(["Home"])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const sidebarItems = [
    { name: "Home", icon: Home, path: ["Home"] },
    { name: "Documents", icon: FileText, path: ["Home", "Documents"] },
    { name: "Downloads", icon: Download, path: ["Home", "Downloads"] },
    { name: "Pictures", icon: ImageIcon, path: ["Home", "Pictures"] },
    { name: "Music", icon: Music, path: ["Home", "Music"] },
    { name: "Videos", icon: Video, path: ["Home", "Videos"] },
    { name: "Trash", icon: Trash2, path: ["Trash"] },
  ]

  const devices = [
    { name: "System Drive", icon: HardDrive, usage: "45%" },
    { name: "External Drive", icon: HardDrive, usage: "12%" },
    { name: "Network", icon: Wifi, usage: null },
  ]

  const files: FileItem[] = [
    { name: "Projects", type: "folder", modified: "2 hours ago", icon: FolderOpen },
    { name: "Screenshots", type: "folder", modified: "1 day ago", icon: FolderOpen },
    { name: "Documents", type: "folder", modified: "3 days ago", icon: FolderOpen },
    { name: "presentation.pdf", type: "file", size: "2.4 MB", modified: "1 hour ago", icon: FileText },
    { name: "wallpaper.jpg", type: "file", size: "4.1 MB", modified: "2 hours ago", icon: ImageIcon },
    { name: "music-collection.zip", type: "file", size: "156 MB", modified: "1 day ago", icon: Archive },
    { name: "video-call.mp4", type: "file", size: "89 MB", modified: "2 days ago", icon: Video },
    { name: "notes.txt", type: "file", size: "1.2 KB", modified: "3 hours ago", icon: FileText },
  ]

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const navigateToPath = (path: string[]) => {
    setCurrentPath(path)
  }

  const goUp = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1))
    }
  }

  const toggleSelection = (fileName: string) => {
    setSelectedItems((prev) =>
      prev.includes(fileName) ? prev.filter((item) => item !== fileName) : [...prev, fileName],
    )
  }

  return (
    <div className="h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">File Explorer</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Quick Access */}
          <div className="p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Quick Access</div>
            <div className="space-y-1">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon
                const isActive = JSON.stringify(currentPath) === JSON.stringify(item.path)
                return (
                  <button
                    key={index}
                    onClick={() => navigateToPath(item.path)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Devices */}
          <div className="p-3 border-t border-gray-800">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Devices</div>
            <div className="space-y-1">
              {devices.map((device, index) => {
                const Icon = device.icon
                return (
                  <button
                    key={index}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{device.name}</span>
                    {device.usage && (
                      <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-400">
                        {device.usage}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Recent */}
          <div className="p-3 border-t border-gray-800">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Recent</div>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <Star className="w-4 h-4" />
                <span>Starred</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
                <span>Recent Files</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goUp}
              disabled={currentPath.length <= 1}
              className="text-gray-400 hover:text-white disabled:opacity-50"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-sm">
              {currentPath.map((segment, index) => (
                <div key={index} className="flex items-center gap-1">
                  <button
                    onClick={() => navigateToPath(currentPath.slice(0, index + 1))}
                    className="text-gray-300 hover:text-white px-2 py-1 rounded transition-colors"
                  >
                    {segment}
                  </button>
                  {index < currentPath.length - 1 && <ChevronRight className="w-3 h-3 text-gray-500" />}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="pl-9 w-64 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            {/* View Toggle */}
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

        {/* Toolbar */}
        <div className="h-12 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Plus className="w-4 h-4 mr-1" />
              New Folder
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <SortAsc className="w-4 h-4 mr-1" />
              Sort
            </Button>
          </div>

          <div className="text-sm text-gray-400">
            {filteredFiles.length} items
            {selectedItems.length > 0 && ` • ${selectedItems.length} selected`}
          </div>
        </div>

        {/* File Grid/List */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-6 gap-4">
              {filteredFiles.map((file, index) => {
                const Icon = file.icon
                const isSelected = selectedItems.includes(file.name)
                return (
                  <Card
                    key={index}
                    className={`p-4 cursor-pointer transition-all hover:bg-gray-800 ${
                      isSelected ? "bg-purple-600/20 border-purple-500" : "bg-gray-900 border-gray-800"
                    }`}
                    onClick={() => toggleSelection(file.name)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          file.type === "folder" ? "bg-blue-500/20 text-blue-400" : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-white font-medium truncate w-full">{file.name}</div>
                        <div className="text-xs text-gray-400">{file.size || file.modified}</div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFiles.map((file, index) => {
                const Icon = file.icon
                const isSelected = selectedItems.includes(file.name)
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-800 ${
                      isSelected ? "bg-purple-600/20 border border-purple-500" : "border border-transparent"
                    }`}
                    onClick={() => toggleSelection(file.name)}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        file.type === "folder" ? "bg-blue-500/20 text-blue-400" : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{file.name}</div>
                    </div>
                    <div className="text-sm text-gray-400 w-20">{file.size}</div>
                    <div className="text-sm text-gray-400 w-32">{file.modified}</div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

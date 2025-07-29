"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Settings,
  Monitor,
  Wifi,
  Shield,
  Users,
  Download,
  Info,
  Search,
  Palette,
  Volume2,
  Bell,
  Bluetooth,
  Eye,
} from "lucide-react"

interface SettingCategory {
  id: string
  name: string
  icon: any
  description: string
}

export default function SettingsApp() {
  const [activeCategory, setActiveCategory] = useState("system")
  const [searchQuery, setSearchQuery] = useState("")

  const categories: SettingCategory[] = [
    { id: "system", name: "System", icon: Monitor, description: "Display, sound, notifications" },
    { id: "personalization", name: "Personalization", icon: Palette, description: "Themes, wallpapers, colors" },
    { id: "network", name: "Network", icon: Wifi, description: "Wi-Fi, Ethernet, VPN" },
    { id: "privacy", name: "Privacy", icon: Shield, description: "Security, permissions, data" },
    { id: "users", name: "Users", icon: Users, description: "Accounts, login, profiles" },
    { id: "updates", name: "Updates", icon: Download, description: "System updates, maintenance" },
    { id: "about", name: "About", icon: Info, description: "System information, version" },
  ]

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case "system":
        return <SystemSettings />
      case "personalization":
        return <PersonalizationSettings />
      case "network":
        return <NetworkSettings />
      case "privacy":
        return <PrivacySettings />
      case "users":
        return <UserSettings />
      case "updates":
        return <UpdateSettings />
      case "about":
        return <AboutSettings />
      default:
        return <SystemSettings />
    }
  }

  return (
    <div className="h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Settings</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="pl-9 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredCategories.map((category) => {
              const Icon = category.icon
              const isActive = activeCategory === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                    isActive ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className={`text-sm ${isActive ? "text-purple-100" : "text-gray-400"}`}>
                      {category.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">{renderCategoryContent()}</div>
    </div>
  )
}

function SystemSettings() {
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [volume, setVolume] = useState([75])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">System</h1>
        <p className="text-gray-400">Configure display, sound, and system behavior</p>
      </div>

      <div className="space-y-6">
        {/* Display */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Monitor className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Display</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Dark Mode</div>
                <div className="text-sm text-gray-400">Use dark theme across the system</div>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Resolution</div>
                <div className="text-sm text-gray-400">1920 × 1080 (Recommended)</div>
              </div>
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                Change
              </Button>
            </div>
          </div>
        </Card>

        {/* Sound */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Sound</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-medium">Master Volume</div>
                <div className="text-sm text-gray-400">{volume[0]}%</div>
              </div>
              <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-full" />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Show Notifications</div>
                <div className="text-sm text-gray-400">Allow apps to show notifications</div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function PersonalizationSettings() {
  const [accentColor, setAccentColor] = useState("purple")

  const colors = [
    { name: "Purple", value: "purple", class: "bg-purple-500" },
    { name: "Green", value: "green", class: "bg-green-500" },
    { name: "Blue", value: "blue", class: "bg-blue-500" },
    { name: "Red", value: "red", class: "bg-red-500" },
    { name: "Orange", value: "orange", class: "bg-orange-500" },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Personalization</h1>
        <p className="text-gray-400">Customize the look and feel of your system</p>
      </div>

      <div className="space-y-6">
        {/* Theme */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Theme</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-white font-medium mb-3">Accent Color</div>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setAccentColor(color.value)}
                    className={`w-12 h-12 rounded-lg ${color.class} ${
                      accentColor === color.value ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Wallpaper */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Wallpaper</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-video bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-lg border border-gray-700 cursor-pointer hover:border-purple-500 transition-colors"
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function NetworkSettings() {
  const [wifiEnabled, setWifiEnabled] = useState(true)
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Network</h1>
        <p className="text-gray-400">Manage network connections and settings</p>
      </div>

      <div className="space-y-6">
        {/* Wi-Fi */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Wifi className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Wi-Fi</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Wi-Fi</div>
                <div className="text-sm text-gray-400">Connected to "Home Network"</div>
              </div>
              <Switch checked={wifiEnabled} onCheckedChange={setWifiEnabled} />
            </div>
          </div>
        </Card>

        {/* Bluetooth */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bluetooth className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Bluetooth</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Bluetooth</div>
                <div className="text-sm text-gray-400">Discoverable as "MominOS Device"</div>
              </div>
              <Switch checked={bluetoothEnabled} onCheckedChange={setBluetoothEnabled} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function PrivacySettings() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Privacy & Security</h1>
        <p className="text-gray-400">Control your privacy and security settings</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Screen Lock</div>
                <div className="text-sm text-gray-400">Require password after sleep</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Firewall</div>
                <div className="text-sm text-gray-400">Block unauthorized connections</div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function UserSettings() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Users & Accounts</h1>
        <p className="text-gray-400">Manage user accounts and login settings</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Current User</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <div className="text-white font-medium">Administrator</div>
              <div className="text-sm text-gray-400">admin@momin-os.local</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function UpdateSettings() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Updates & Maintenance</h1>
        <p className="text-gray-400">Keep your system up to date</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">System Updates</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Your system is up to date</div>
                <div className="text-sm text-gray-400">Last checked: Today at 2:30 PM</div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">Check for Updates</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function AboutSettings() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">About MominOS</h1>
        <p className="text-gray-400">System information and specifications</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">System Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">OS Version</span>
              <span className="text-white">MominOS 2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Build</span>
              <span className="text-white">20240130</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Kernel</span>
              <span className="text-white">Linux 6.5.0-momin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">CPU</span>
              <span className="text-white">Intel Core i7-12700K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Memory</span>
              <span className="text-white">16 GB DDR4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Storage</span>
              <span className="text-white">1 TB NVMe SSD</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

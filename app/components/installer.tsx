"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ChevronRight,
  ChevronLeft,
  Check,
  HardDrive,
  User,
  Globe,
  Shield,
  Download,
  Terminal,
  Wifi,
  CheckCircle,
} from "lucide-react"

interface InstallStep {
  id: string
  title: string
  description: string
  icon: any
}

export default function InstallerInterface() {
  const [currentStep, setCurrentStep] = useState(0)
  const [installProgress, setInstallProgress] = useState(0)
  const [isInstalling, setIsInstalling] = useState(false)
  const [installComplete, setInstallComplete] = useState(false)

  const steps: InstallStep[] = [
    { id: "welcome", title: "Welcome", description: "Welcome to MominOS", icon: Terminal },
    { id: "language", title: "Language", description: "Choose your language", icon: Globe },
    { id: "disk", title: "Disk Setup", description: "Configure storage", icon: HardDrive },
    { id: "user", title: "User Account", description: "Create your account", icon: User },
    { id: "summary", title: "Summary", description: "Review installation", icon: Check },
    { id: "install", title: "Installing", description: "Installing MominOS", icon: Download },
    { id: "complete", title: "Complete", description: "Installation finished", icon: CheckCircle },
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const startInstallation = () => {
    setIsInstalling(true)
    setCurrentStep(5) // Install step

    // Simulate installation progress
    const interval = setInterval(() => {
      setInstallProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsInstalling(false)
          setInstallComplete(true)
          setCurrentStep(6) // Complete step
          return 100
        }
        return prev + 2
      })
    }, 100)
  }

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "welcome":
        return <WelcomeStep />
      case "language":
        return <LanguageStep />
      case "disk":
        return <DiskStep />
      case "user":
        return <UserStep />
      case "summary":
        return <SummaryStep onInstall={startInstallation} />
      case "install":
        return <InstallStep progress={installProgress} />
      case "complete":
        return <CompleteStep />
      default:
        return <WelcomeStep />
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-900/80 backdrop-blur-sm border-r border-gray-800 p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-green-400 rounded-xl flex items-center justify-center">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">MominOS</h1>
              <p className="text-sm text-gray-400">Installation Wizard</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep || installComplete

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : isCompleted
                      ? "bg-green-600/20 text-green-400"
                      : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? "bg-white/20" : isCompleted ? "bg-green-600/30" : "bg-gray-800"
                  }`}
                >
                  {isCompleted && !isActive ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-medium">{step.title}</div>
                  <div
                    className={`text-xs ${
                      isActive ? "text-purple-100" : isCompleted ? "text-green-300" : "text-gray-500"
                    }`}
                  >
                    {step.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="w-full max-w-2xl">{renderStepContent()}</div>
        </div>

        {/* Navigation */}
        {!isInstalling && !installComplete && (
          <div className="p-6 border-t border-gray-800 flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={currentStep === 4 ? startInstallation : nextStep}
              disabled={currentStep === steps.length - 1}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {currentStep === 4 ? "Install Now" : "Next"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function WelcomeStep() {
  return (
    <Card className="bg-gray-900/50 border-gray-800 p-8 text-center">
      <div className="mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Terminal className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Welcome to MominOS</h2>
        <p className="text-gray-400 text-lg">
          The future of operating systems is here. Let's get you set up with a lightning-fast, AI-powered computing
          experience.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-white font-medium">Secure</div>
          <div className="text-gray-400">Built-in security</div>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Terminal className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-white font-medium">Fast</div>
          <div className="text-gray-400">Optimized performance</div>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Wifi className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-white font-medium">Connected</div>
          <div className="text-gray-400">Always online</div>
        </div>
      </div>
    </Card>
  )
}

function LanguageStep() {
  const [selectedLanguage, setSelectedLanguage] = useState("en-US")

  const languages = [
    { code: "en-US", name: "English (United States)", flag: "🇺🇸" },
    { code: "en-GB", name: "English (United Kingdom)", flag: "🇬🇧" },
    { code: "es-ES", name: "Español (España)", flag: "🇪🇸" },
    { code: "fr-FR", name: "Français (France)", flag: "🇫🇷" },
    { code: "de-DE", name: "Deutsch (Deutschland)", flag: "🇩🇪" },
    { code: "ja-JP", name: "日本語 (日本)", flag: "🇯🇵" },
  ]

  return (
    <Card className="bg-gray-900/50 border-gray-800 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Language</h2>
        <p className="text-gray-400">Select your preferred language for the system interface.</p>
      </div>

      <div className="space-y-2">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => setSelectedLanguage(language.code)}
            className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all ${
              selectedLanguage === language.code
                ? "bg-purple-600/20 border-purple-500 text-white"
                : "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800"
            }`}
          >
            <span className="text-2xl">{language.flag}</span>
            <span className="font-medium">{language.name}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}

function DiskStep() {
  const [selectedDisk, setSelectedDisk] = useState("disk1")

  const disks = [
    { id: "disk1", name: "NVMe SSD", size: "1 TB", free: "1 TB", type: "SSD" },
    { id: "disk2", name: "External Drive", size: "500 GB", free: "200 GB", type: "HDD" },
  ]

  return (
    <Card className="bg-gray-900/50 border-gray-800 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Disk Setup</h2>
        <p className="text-gray-400">Choose where to install MominOS. The selected disk will be formatted.</p>
      </div>

      <div className="space-y-3">
        {disks.map((disk) => (
          <button
            key={disk.id}
            onClick={() => setSelectedDisk(disk.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
              selectedDisk === disk.id
                ? "bg-purple-600/20 border-purple-500 text-white"
                : "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800"
            }`}
          >
            <HardDrive className="w-8 h-8" />
            <div className="flex-1 text-left">
              <div className="font-medium">{disk.name}</div>
              <div className="text-sm text-gray-400">
                {disk.size} total • {disk.free} available • {disk.type}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-400 mb-2">
          <Shield className="w-4 h-4" />
          <span className="font-medium">Warning</span>
        </div>
        <p className="text-sm text-yellow-300">
          All data on the selected disk will be erased. Make sure you have backed up any important files.
        </p>
      </div>
    </Card>
  )
}

function UserStep() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
  })

  return (
    <Card className="bg-gray-900/50 border-gray-800 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Create User Account</h2>
        <p className="text-gray-400">Set up your administrator account for MominOS.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
          <Input
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Enter your full name"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
          <Input
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Choose a username"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Create a strong password"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
          <Input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Confirm your password"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>
    </Card>
  )
}

function SummaryStep({ onInstall }: { onInstall: () => void }) {
  return (
    <Card className="bg-gray-900/50 border-gray-800 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Installation Summary</h2>
        <p className="text-gray-400">Review your settings before installation begins.</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between py-3 border-b border-gray-800">
          <span className="text-gray-400">Language</span>
          <span className="text-white">English (United States)</span>
        </div>
        <div className="flex justify-between py-3 border-b border-gray-800">
          <span className="text-gray-400">Installation Disk</span>
          <span className="text-white">NVMe SSD (1 TB)</span>
        </div>
        <div className="flex justify-between py-3 border-b border-gray-800">
          <span className="text-gray-400">Username</span>
          <span className="text-white">administrator</span>
        </div>
        <div className="flex justify-between py-3">
          <span className="text-gray-400">Installation Size</span>
          <span className="text-white">~8 GB</span>
        </div>
      </div>

      <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <div className="flex items-center gap-2 text-purple-400 mb-2">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">Ready to Install</span>
        </div>
        <p className="text-sm text-purple-300">
          MominOS will be installed with the settings above. This process will take approximately 10-15 minutes.
        </p>
      </div>
    </Card>
  )
}

function InstallStep({ progress }: { progress: number }) {
  const installSteps = [
    "Preparing installation...",
    "Formatting disk...",
    "Copying system files...",
    "Installing bootloader...",
    "Configuring system...",
    "Finalizing installation...",
  ]

  const currentStepIndex = Math.floor((progress / 100) * installSteps.length)
  const currentStepText = installSteps[Math.min(currentStepIndex, installSteps.length - 1)]

  return (
    <Card className="bg-gray-900/50 border-gray-800 p-8 text-center">
      <div className="mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Download className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Installing MominOS</h2>
        <p className="text-gray-400">Please wait while we set up your new operating system.</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">{currentStepText}</span>
          <span className="text-white">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <p className="text-sm text-gray-400">Do not turn off your computer during installation.</p>
    </Card>
  )
}

function CompleteStep() {
  return (
    <Card className="bg-gray-900/50 border-gray-800 p-8 text-center">
      <div className="mb-8">
        <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Installation Complete!</h2>
        <p className="text-gray-400 text-lg">MominOS has been successfully installed on your system.</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="text-left">
          <h3 className="text-white font-medium mb-2">What's Next?</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Your system will restart automatically</li>
            <li>• Sign in with your administrator account</li>
            <li>• Explore the AI-powered shell interface</li>
            <li>• Install your favorite applications</li>
          </ul>
        </div>
      </div>

      <Button className="bg-green-600 hover:bg-green-700 text-white px-8">Restart Now</Button>
    </Card>
  )
}

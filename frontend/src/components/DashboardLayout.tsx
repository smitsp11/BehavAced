'use client'

import { useState } from 'react'
import { 
  BookOpen, 
  Mic, 
  Trophy, 
  History,
  Settings,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'

export type ViewType = 'dashboard' | 'stories' | 'practice' | 'plan' | 'history' | 'settings'

interface DashboardLayoutProps {
  children: React.ReactNode
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  profileData: { name?: string } | null
  storiesCount?: number
}

export default function DashboardLayout({ 
  children, 
  activeView, 
  onViewChange,
  profileData,
  storiesCount = 0
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  
  // Background processing state
  const { 
    isBackgroundProcessingComplete, 
    getBackgroundProcessingProgress,
    backgroundTasks 
  } = useOnboardingStore()

  const processingComplete = isBackgroundProcessingComplete()
  const processingProgress = getBackgroundProcessingProgress()
  const profileStrength = 85 // Mock value - would come from API

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/3 rounded-full blur-[150px]" />
      </div>

      {/* Fixed Left Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-screen z-50
          bg-[#0d0d14]/95 backdrop-blur-xl border-r border-white/5 
          flex flex-col transition-all duration-300
          ${collapsed ? 'w-[80px]' : 'w-[280px]'}
        `}
      >
        {/* Logo / Brand */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <span className="text-lg font-bold">B</span>
              </div>
              <div>
                <h1 className="font-bold text-white">BehavAced</h1>
                <p className="text-xs text-gray-500">Cognition Center</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* User Profile */}
        <div className={`p-4 border-b border-white/5 ${collapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center ${collapsed ? '' : 'gap-4'}`}>
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-sm font-bold">
                {profileData?.name?.charAt(0) || 'S'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0d0d14]" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate text-sm">{profileData?.name || 'User'}</h3>
                <p className="text-xs text-gray-500">Interview Ready</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            active={activeView === 'dashboard'}
            onClick={() => onViewChange('dashboard')}
            collapsed={collapsed}
          />
          <NavItem 
            icon={<BookOpen className="w-5 h-5" />} 
            label="Story Bank" 
            active={activeView === 'stories'}
            onClick={() => onViewChange('stories')}
            badge={storiesCount}
            collapsed={collapsed}
          />
          <NavItem 
            icon={<Mic className="w-5 h-5" />} 
            label="Practice Mode" 
            active={activeView === 'practice'}
            onClick={() => onViewChange('practice')}
            collapsed={collapsed}
          />
          <NavItem 
            icon={<Trophy className="w-5 h-5" />} 
            label="Practice Plan" 
            active={activeView === 'plan'}
            onClick={() => onViewChange('plan')}
            collapsed={collapsed}
          />
          <NavItem 
            icon={<History className="w-5 h-5" />} 
            label="History" 
            active={activeView === 'history'}
            onClick={() => onViewChange('history')}
            collapsed={collapsed}
          />
          
          <div className="pt-3 mt-3 border-t border-white/5">
            <NavItem 
              icon={<Settings className="w-5 h-5" />} 
              label="Settings" 
              active={activeView === 'settings'}
              onClick={() => onViewChange('settings')}
              collapsed={collapsed}
            />
          </div>
        </nav>

        {/* Profile Strength Widget */}
        {!collapsed && (
          <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">Profile Strength</span>
              <span className="text-sm font-bold text-cyan-400">{profileStrength}%</span>
            </div>
            <div className="h-1.5 bg-[#0a0a0f] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${profileStrength}%` }}
              />
            </div>
            
            {/* Processing Status */}
            {!processingComplete && backgroundTasks.overall.status === 'processing' && (
              <div className="mt-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-amber-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Processing... {processingProgress.percentage}%</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Collapsed Profile Strength */}
        {collapsed && (
          <div className="p-3 flex justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 flex items-center justify-center">
              <span className="text-xs font-bold text-cyan-400">{profileStrength}</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area - with left margin for fixed sidebar */}
      <main 
        className={`
          flex-1 min-h-screen transition-all duration-300
          ${collapsed ? 'ml-[80px]' : 'ml-[280px]'}
        `}
      >
        {children}
      </main>
    </div>
  )
}

// Navigation Item Component
function NavItem({ 
  icon, 
  label, 
  active, 
  onClick, 
  badge,
  collapsed
}: { 
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  badge?: number
  collapsed?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
        ${collapsed ? 'justify-center' : ''}
        ${active 
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white border border-cyan-500/30' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <span className={active ? 'text-cyan-400' : ''}>{icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 text-left font-medium text-sm">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-400">
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  )
}


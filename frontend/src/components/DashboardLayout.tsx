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
  Loader2,
  Sparkles
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
  const profileStrength = 85

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Fixed Left Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-screen z-50
          bg-white/80 backdrop-blur-xl border-r border-stone-200
          flex flex-col transition-all duration-300
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        `}
      >
        {/* Logo / Brand */}
        <div className="px-6 py-6 border-b border-stone-100 flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-bold text-stone-900">BehavAced</h1>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200 mx-auto">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 mx-auto mt-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* User Profile */}
        <div className={`p-4 border-b border-stone-100 ${collapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-sm font-bold text-amber-800 shadow-md">
                {profileData?.name?.charAt(0) || 'S'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-900 truncate text-sm">{profileData?.name || 'User'}</h3>
                <p className="text-xs text-stone-500">Interview Ready</p>
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
          
          <div className="pt-3 mt-3 border-t border-stone-100">
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
          <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-500">Profile Strength</span>
              <span className="text-sm font-bold text-emerald-600">{profileStrength}%</span>
            </div>
            <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000"
                style={{ width: `${profileStrength}%` }}
              />
            </div>
            
            {/* Processing Status */}
            {!processingComplete && backgroundTasks.overall.status === 'processing' && (
              <div className="mt-2 pt-2 border-t border-stone-200">
                <div className="flex items-center gap-2 text-xs text-amber-600">
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
            <div className="w-10 h-10 rounded-full border-2 border-emerald-200 bg-emerald-50 flex items-center justify-center">
              <span className="text-xs font-bold text-emerald-600">{profileStrength}</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main 
        className={`
          min-h-screen transition-all duration-300
          ${collapsed ? 'ml-[72px]' : 'ml-[260px]'}
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
          ? 'bg-stone-900 text-white shadow-md' 
          : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
        }
      `}
    >
      <span>{icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 text-left font-medium text-sm">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              active ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  )
}

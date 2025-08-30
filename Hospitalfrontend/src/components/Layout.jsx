import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  Users, 
  Plus, 
  BarChart3, 
  LogOut, 
  User,
  Menu,
  X,
  Building,
  UserCheck
} from 'lucide-react'
import { useState } from 'react'
import { useEffect } from 'react'

const Layout = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Check if user is accessing management routes
  const isManagementRoute = location.pathname.startsWith('/management')
  
  // Different navigation based on route type
  const doctorNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Add Patient', href: '/patients/add', icon: Plus },
  ]

  const managementNavigation = [
    { name: 'Management Dashboard', href: '/management/dashboard', icon: Building },
    { name: 'Analytics', href: '/management/analytics', icon: BarChart3 },
    { name: 'Doctors', href: '/management/doctors', icon: UserCheck },
  ]

  const navigation = isManagementRoute ? managementNavigation : doctorNavigation

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (href) => location.pathname === href

  // Track recent navigation history in sessionStorage for dashboard Recent Activity
  useEffect(() => {
    try {
      const key = 'navHistory'
      const raw = sessionStorage.getItem(key)
      const arr = raw ? JSON.parse(raw) : []
      const last = arr.length > 0 ? arr[arr.length - 1] : null
      if (last !== location.pathname) {
        const next = [...arr, location.pathname].slice(-10)
        sessionStorage.setItem(key, JSON.stringify(next))
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [location.pathname])

  const getUserRole = () => {
    if (isManagementRoute) {
      return 'Management'
    }
    return 'Doctor'
  }

  const getUserDisplayName = () => {
    return user?.user_metadata?.name || user?.email || 'User'
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-secondary-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold text-primary-600">
              {isManagementRoute ? 'Hospital Management' : 'Hospital Tracker'}
            </h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-secondary-700 hover:bg-secondary-100'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-secondary-200">
          <div className="flex items-center h-16 px-6 border-b border-secondary-200">
            <h1 className="text-xl font-bold text-primary-600">
              {isManagementRoute ? 'Hospital Management' : 'Hospital Tracker'}
            </h1>
          </div>
          <nav className="flex-1 p-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-secondary-700 hover:bg-secondary-100'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 bg-white border-b border-secondary-200 lg:px-6">
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-secondary-900">{getUserDisplayName()}</p>
                <p className="text-xs text-secondary-500">{getUserRole()}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
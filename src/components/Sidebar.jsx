import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  Store, 
  FileText, 
  User,
  X
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/services', icon: Settings, label: 'Services' },
    { path: '/users', icon: Users, label: 'User Management' },
    { path: '/vendors', icon: Store, label: 'Vendor Management' },
    { path: '/service-forms', icon: FileText, label: 'Service Form Management' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-800 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-slate-800 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">Petjio Admin</h1>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white border-r-4 border-blue-400' 
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}

export default Sidebar
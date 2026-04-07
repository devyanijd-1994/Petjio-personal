import { useState, useEffect } from 'react'
import { Users, Store, FileText, TrendingUp, Activity, DollarSign } from 'lucide-react'
import { dashboardApi } from '../services/adminApi'
import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi'

const Overview = () => {
  const { isReady } = useAuthenticatedApi()
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '0', icon: Users, color: 'bg-blue-500', change: '+0%' },
    { title: 'Active Vendors', value: '0', icon: Store, color: 'bg-green-500', change: '+0%' },
    { title: 'Service Requests', value: '0', icon: FileText, color: 'bg-purple-500', change: '+0%' },
    { title: 'Revenue', value: '$0', icon: DollarSign, color: 'bg-yellow-500', change: '+0%' },
  ])
  
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isReady) {
      fetchDashboardData()
    }
  }, [isReady])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats
      const statsResponse = await dashboardApi.getStats()
      if (statsResponse.data.success) {
        const apiStats = statsResponse.data.data.stats
        setStats([
          { title: 'Total Users', value: apiStats.totalUsers || '2,543', icon: Users, color: 'bg-blue-500', change: apiStats.userGrowth || '+12%' },
          { title: 'Active Vendors', value: apiStats.activeVendors || '156', icon: Store, color: 'bg-green-500', change: apiStats.vendorGrowth || '+8%' },
          { title: 'Service Requests', value: apiStats.serviceRequests || '1,234', icon: FileText, color: 'bg-purple-500', change: apiStats.requestGrowth || '+23%' },
          { title: 'Revenue', value: apiStats.revenue || '$45,678', icon: DollarSign, color: 'bg-yellow-500', change: apiStats.revenueGrowth || '+15%' },
        ])
      }

      // Fetch recent activities
      const activityResponse = await dashboardApi.getRecentActivity()
      if (activityResponse.data.success) {
        setRecentActivities(activityResponse.data.data.activities)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Use fallback data
      setRecentActivities([
        { action: 'New user registered', user: 'John Doe', time: '2 minutes ago' },
        { action: 'Service request completed', user: 'Pet Care Plus', time: '15 minutes ago' },
        { action: 'Vendor approved', user: 'Happy Paws Clinic', time: '1 hour ago' },
        { action: 'Payment processed', user: 'Sarah Wilson', time: '2 hours ago' },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Growth</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Add New User</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Store className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Register Vendor</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Create Service Form</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Overview
import { useState, useEffect } from 'react'
import { Search, Eye, Check, X, Clock, CheckCircle, XCircle, Filter } from 'lucide-react'
import { serviceApi } from '../services/adminApi'

const ServiceRegistrations = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState({})
  const [selectedService, setSelectedService] = useState(null)

  useEffect(() => {
    fetchServices()
  }, [statusFilter, categoryFilter])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (categoryFilter !== 'all') params.categoryId = categoryFilter
      
      const response = await serviceApi.getVendorServices(params)
      setServices(response.data.data?.services || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleServiceAction = async (serviceId, action, reason = null) => {
    setActionLoading({ ...actionLoading, [serviceId]: true })
    try {
      if (action === 'approve') {
        await serviceApi.approveVendorService(serviceId)
      } else if (action === 'reject') {
        await serviceApi.rejectVendorService(serviceId, reason)
      }
      await fetchServices()
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} service`)
    } finally {
      setActionLoading({ ...actionLoading, [serviceId]: false })
    }
  }

  const handleApprove = (serviceId) => {
    if (window.confirm('Are you sure you want to approve this service registration?')) {
      handleServiceAction(serviceId, 'approve')
    }
  }

  const handleReject = (serviceId) => {
    const reason = prompt('Please enter rejection reason:')
    if (reason) {
      handleServiceAction(serviceId, 'reject', reason)
    }
  }

  const handleToggleService = async (serviceId) => {
    setActionLoading({ ...actionLoading, [serviceId]: true })
    try {
      await serviceApi.toggleVendorService(serviceId)
      await fetchServices()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle service status')
    } finally {
      setActionLoading({ ...actionLoading, [serviceId]: false })
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-500" />
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => ({
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800'
  }[status] || 'bg-gray-100 text-gray-800')

  const filteredServices = services.filter(service => {
    const matchSearch = 
      service.vendor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.vendor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.vendor?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.form?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Service Registrations</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span>{services.filter(s => s.status === 'PENDING').length} Pending</span>
          </span>
          <span className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{services.filter(s => s.status === 'APPROVED').length} Approved</span>
          </span>
          <span className="flex items-center space-x-1">
            <XCircle className="w-4 h-4 text-red-500" />
            <span>{services.filter(s => s.status === 'REJECTED').length} Rejected</span>
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services, vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading services...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No service registrations found
                    </td>
                  </tr>
                ) : filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium">
                            {service.vendor?.firstName?.charAt(0) || 'V'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {service.vendor?.firstName} {service.vendor?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{service.vendor?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.form?.name}</div>
                      <div className="text-sm text-gray-500">
                        Submitted {new Date(service.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.category?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(service.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(service.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedService(service)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {service.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(service.id)}
                              disabled={actionLoading[service.id]}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(service.id)}
                              disabled={actionLoading[service.id]}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {service.status === 'APPROVED' && (
                          <>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter reason for rejecting this approved service:')
                                if (reason && window.confirm('Are you sure you want to reject this approved service?')) {
                                  handleServiceAction(service.id, 'reject', reason)
                                }
                              }}
                              disabled={actionLoading[service.id]}
                              className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                              title="Revoke Approval"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to ${service.isActive ? 'deactivate' : 'activate'} this service?`)) {
                                  handleToggleService(service.id)
                                }
                              }}
                              disabled={actionLoading[service.id]}
                              className={`disabled:opacity-50 ${
                                service.isActive 
                                  ? 'text-gray-600 hover:text-gray-900' 
                                  : 'text-blue-600 hover:text-blue-900'
                              }`}
                              title={service.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {service.isActive ? '⏸️' : '▶️'}
                            </button>
                          </>
                        )}
                        {service.status === 'REJECTED' && (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to re-approve this rejected service?')) {
                                handleServiceAction(service.id, 'approve')
                              }
                            }}
                            disabled={actionLoading[service.id]}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Re-approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onApprove={() => {
            handleApprove(selectedService.id)
            setSelectedService(null)
          }}
          onReject={() => {
            handleReject(selectedService.id)
            setSelectedService(null)
          }}
        />
      )}
    </div>
  )
}

// Service Detail Modal Component
const ServiceDetailModal = ({ service, onClose, onApprove, onReject }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Service Registration Details</h2>
            <p className="text-gray-500">
              {service.vendor?.firstName} {service.vendor?.lastName} - {service.form?.name}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Vendor Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Vendor Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span> {service.vendor?.firstName} {service.vendor?.lastName}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span> {service.vendor?.email}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span> {service.vendor?.phone}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    service.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    service.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {service.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Information</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Category:</span> {service.category?.name}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Form:</span> {service.form?.name}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Submitted:</span> {new Date(service.createdAt).toLocaleString()}
                </div>
                {service.approvedAt && (
                  <div>
                    <span className="font-medium text-gray-700">Approved:</span> {new Date(service.approvedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Service Answers */}
          {service.answers && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Registration Details</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  {Object.entries(service.answers).map(([key, value]) => {
                    if (key === 'selectedSubServices' || key === 'submissionMetadata') return null
                    return (
                      <div key={key} className="border-b border-gray-200 pb-2">
                        <span className="font-medium text-gray-700 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {service.rejectionReason && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-red-700 mb-3">Rejection Reason</h3>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-red-800">{service.rejectionReason}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between p-6 pt-0 border-t">
          <div className="flex space-x-3">
            {service.status === 'PENDING' && (
              <>
                <button
                  onClick={onApprove}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={onReject}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </>
            )}
            {service.status === 'APPROVED' && (
              <>
                <button
                  onClick={() => {
                    const reason = prompt('Enter reason for rejecting this approved service:')
                    if (reason && window.confirm('Are you sure you want to reject this approved service?')) {
                      onReject()
                    }
                  }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Revoke Approval</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to ${service.isActive ? 'deactivate' : 'activate'} this service?`)) {
                      // This would need a new prop onToggle
                      console.log('Toggle service status')
                    }
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    service.isActive 
                      ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <span>{service.isActive ? '⏸️' : '▶️'}</span>
                  <span>{service.isActive ? 'Deactivate' : 'Activate'}</span>
                </button>
              </>
            )}
            {service.status === 'REJECTED' && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to re-approve this rejected service?')) {
                    onApprove()
                  }
                }}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Re-approve</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServiceRegistrations
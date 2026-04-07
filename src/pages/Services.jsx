import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, X, Settings, Users, CheckCircle, XCircle } from 'lucide-react'
import { serviceApi } from '../services/adminApi'
import { showSuccess, showError } from '../utils/notifications'

const INITIAL_FORM = { name: '', description: '', order: 0, isActive: true }

const ViewServiceModal = ({ service, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform animate-slideUp">
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Service Details</h2>
            <p className="text-sm text-gray-500">View service information</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg p-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{service.vendors}</div>
            <div className="text-sm text-blue-800">Active Vendors</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">#{service.order}</div>
            <div className="text-sm text-green-800">Display Order</div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            ['Service Name', service.name, 'font-semibold text-gray-900'],
            ['Description', service.description || 'No description provided', 'text-gray-600'],
            ['Status', service.status, service.status === 'Active' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'],
          ].map(([label, value, className]) => (
            <div key={label} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-sm font-medium text-gray-500 min-w-0 flex-shrink-0">{label}:</span>
              <span className={`text-sm ml-4 text-right ${className || 'text-gray-900'}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end p-6 border-t bg-gray-50 rounded-b-xl">
        <button 
          onClick={onClose} 
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)

const ServiceModal = ({ service, onClose, onSave }) => {
  const [form, setForm] = useState(service || INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (service) {
      setForm({
        name: service.name || '',
        description: service.description || '',
        order: service.order || 0,
        isActive: service.isActive !== undefined ? service.isActive : true
      })
    } else {
      setForm(INITIAL_FORM)
    }
  }, [service])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Service name is required')
    
    setSaving(true)
    setError('')
    try {
      await onSave(form)
      showSuccess(`Service "${form.name}" ${service ? 'updated' : 'created'} successfully`)
      onClose()
    } catch (err) {
      console.error('Service save error:', err)
      const errorMsg = err.response?.data?.message || `Failed to ${service ? 'update' : 'create'} service`
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform animate-slideUp">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {service ? <Edit className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{service ? 'Edit Service' : 'Add New Service'}</h2>
              <p className="text-sm text-gray-500">{service ? 'Update service information' : 'Create a new service category'}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="e.g. Pet Grooming, Veterinary Care"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              placeholder="Brief description of the service category..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first in the list</p>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <span>Active Service</span>
              {form.isActive ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </label>
          </div>
        </form>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={saving || !form.name.trim()} 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>{service ? 'Update Service' : 'Create Service'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

const Services = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [viewingService, setViewingService] = useState(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await serviceApi.getServices()
      if (response.data.success) {
        const data = response.data.data ?? response.data
        const list = Array.isArray(data) ? data : (data.categories ?? [])
        setServices(list.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description,
          order: c.order,
          isActive: c.isActive,
          status: c.isActive ? 'Active' : 'Inactive',
          vendors: c._count?.vendorServices ?? 0,
        })))
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (form) => {
    try {
      console.log('Saving service:', form) // Debug log
      
      // Backend uses multipart/form-data due to optional icon upload
      const fd = new FormData()
      fd.append('name', form.name)
      if (form.description) fd.append('description', form.description)
      fd.append('order', form.order ?? 0)
      fd.append('isActive', form.isActive ? 'true' : 'false')

      if (editingService) {
        console.log('Updating service:', editingService.id) // Debug log
        await serviceApi.updateService(editingService.id, fd)
      } else {
        console.log('Creating new service') // Debug log
        await serviceApi.createService(fd)
      }
      
      await fetchServices()
      setModalOpen(false)
      setEditingService(null)
    } catch (error) {
      console.error('Service save error:', error)
      throw error // Re-throw to let modal handle it
    }
  }

  const handleEdit = (service) => {
    console.log('Editing service:', service) // Debug log
    setEditingService(service)
    setModalOpen(true)
  }

  const handleAdd = () => {
    console.log('Adding new service') // Debug log
    setEditingService(null)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) return
    try {
      await serviceApi.deleteService(id)
      showSuccess('Service deleted successfully')
      fetchServices()
    } catch (error) {
      console.error('Delete error:', error)
      const errorMsg = error.response?.data?.message || 'Failed to delete service'
      showError(errorMsg)
    }
  }

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
          <p className="text-gray-600 mt-1">Manage service categories and their settings</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Service</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Services</p>
              <p className="text-2xl font-bold text-green-600">{services.filter(s => s.status === 'Active').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Services</p>
              <p className="text-2xl font-bold text-red-600">{services.filter(s => s.status === 'Inactive').length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vendors</p>
              <p className="text-2xl font-bold text-purple-600">{services.reduce((sum, s) => sum + s.vendors, 0)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-colors"
            />
          </div>
          <div className="text-sm text-gray-500">
            Showing {filtered.length} of {services.length} services
          </div>
        </div>
      </div>

      {/* Services Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-500">Loading services...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: 'name', label: 'Service Name' },
                    { key: 'description', label: 'Description' },
                    { key: 'order', label: 'Order' },
                    { key: 'status', label: 'Status' },
                    { key: 'vendors', label: 'Vendors' },
                    { key: 'actions', label: 'Actions' }
                  ].map(({ key, label }) => (
                    <th key={key} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Settings className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first service'}
                        </p>
                        {!searchTerm && (
                          <button
                            onClick={handleAdd}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Service</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Settings className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{service.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {service.description ? (
                          <span className="line-clamp-2">{service.description}</span>
                        ) : (
                          <span className="text-gray-400 italic">No description</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        #{service.order}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        service.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.status === 'Active' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {service.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{service.vendors}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setViewingService(service)} 
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(service)} 
                          className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Service"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(service.id)} 
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {viewingService && (
        <ViewServiceModal service={viewingService} onClose={() => setViewingService(null)} />
      )}

      {modalOpen && (
        <ServiceModal
          service={editingService}
          onClose={() => {
            setModalOpen(false)
            setEditingService(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

export default Services

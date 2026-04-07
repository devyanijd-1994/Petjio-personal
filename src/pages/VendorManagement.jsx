import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, MapPin, Star, Check, X } from 'lucide-react'
import { vendorApi } from '../services/adminApi'
import api from '../services/api'

// ─── View Modal ───────────────────────────────────────────────────────────────
const ViewModal = ({ vendor, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">Vendor Details</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-6 space-y-3 text-sm">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {vendor.name.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{vendor.name}</p>
            <p className="text-gray-500">{vendor.email}</p>
          </div>
        </div>
        {[
          ['Phone', vendor.phone],
          ['Business Type', vendor.businessType || '—'],
          ['Location', vendor.location],
          ['Status', vendor.status],
          ['Services', vendor.services],
          ['Joined', vendor.joinDate],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between border-b pb-2">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-900">{value ?? '—'}</span>
          </div>
        ))}
        {vendor.rejectionReason && (
          <div className="bg-red-50 rounded p-3 mt-2">
            <p className="text-red-700 text-xs font-medium mb-1">Rejection Reason</p>
            <p className="text-red-600 text-sm">{vendor.rejectionReason}</p>
          </div>
        )}
      </div>
      <div className="flex justify-end p-6 pt-0">
        <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Close</button>
      </div>
    </div>
  </div>
)

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal = ({ vendor, onClose, onSave }) => {
  const [form, setForm] = useState({
    firstName: vendor.firstName || '',
    lastName: vendor.lastName || '',
    businessName: vendor.businessName || '',
    businessType: vendor.businessType || '',
    city: vendor.city || '',
    state: vendor.state || '',
    isActive: vendor.isActive ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave(vendor.id, form)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update vendor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Edit Vendor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            {[['firstName','First Name'],['lastName','Last Name'],['businessName','Business Name'],['businessType','Business Type'],['city','City'],['state','State']].map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="vendorActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
            <label htmlFor="vendorActive" className="text-sm font-medium text-gray-700">Active</label>
          </div>
          <div className="flex justify-end space-x-3 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Add Vendor Modal ─────────────────────────────────────────────────────────
const AddVendorModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', businessName: '', businessType: '',
    city: '', state: '', pincode: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password)
      return setError('First name, last name, email, phone and password are required')
    setSaving(true)
    setError('')
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vendor')
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    ['firstName','First Name',true], ['lastName','Last Name',true],
    ['email','Email *',true,'email'], ['phone','Phone *',true,'tel'],
    ['password','Password *',true,'password'], ['businessName','Business Name',false],
    ['businessType','Business Type',false], ['city','City',false],
    ['state','State',false], ['pincode','Pincode',false],
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Add Vendor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            {fields.map(([key, label, , type]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type || 'text'}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-3 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50">
              {saving ? 'Adding...' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const VendorManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [modal, setModal] = useState(null) // { type: 'view'|'edit'|'add', vendor? }

  useEffect(() => {
    const timer = setTimeout(() => { fetchVendors() }, 200)
    return () => clearTimeout(timer)
  }, [])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const response = await vendorApi.getVendors()
      if (response.data.success) {
        const data = response.data.data ?? response.data
        const list = data.vendors ?? (Array.isArray(data) ? data : [])
        setVendors(list.map(v => ({
          id: v.id,
          name: v.businessName || `${v.firstName} ${v.lastName}`,
          firstName: v.firstName,
          lastName: v.lastName,
          businessName: v.businessName,
          businessType: v.businessType,
          email: v.email,
          phone: v.phone,
          location: [v.city, v.state].filter(Boolean).join(', ') || 'Not specified',
          city: v.city,
          state: v.state,
          rating: 4.5,
          services: v._count?.vendorServices || 0,
          isActive: v.isActive,
          rejectionReason: v.rejectionReason,
          status: v.status === 'APPROVED' ? (v.isActive ? 'Active' : 'Inactive') : v.status === 'REJECTED' ? 'Rejected' : 'Pending',
          joinDate: new Date(v.createdAt).toISOString().split('T')[0],
        })))
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVendor = async (form) => {
    await api.post('/auth/vendor/register', form)
    await fetchVendors()
  }

  const handleEditSave = async (id, data) => {
    await vendorApi.updateVendor(id, data)
    await fetchVendors()
  }

  const handleApprove = async (vendorId) => {
    try {
      await vendorApi.approveVendor(vendorId)
      fetchVendors()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve vendor')
    }
  }

  const handleReject = async (vendorId) => {
    const reason = prompt('Please enter rejection reason:')
    if (!reason) return
    try {
      await vendorApi.rejectVendor(vendorId, reason)
      fetchVendors()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject vendor')
    }
  }

  const handleToggleStatus = async (vendorId) => {
    try {
      await vendorApi.toggleVendorStatus(vendorId)
      fetchVendors()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update vendor status')
    }
  }

  const handleDelete = async (vendorId) => {
    if (!window.confirm('Are you sure you want to deactivate this vendor?')) return
    try {
      await vendorApi.deleteVendor(vendorId)
      fetchVendors()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete vendor')
    }
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'all' || vendor.status === statusFilter
    return matchSearch && matchStatus
  })

  const statusColor = (s) => ({
    Active: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Inactive: 'bg-gray-100 text-gray-800',
    Rejected: 'bg-red-100 text-red-800',
  }[s] || 'bg-gray-100 text-gray-800')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
        <button
          onClick={() => setModal({ type: 'add' })}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Vendor</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vendors..."
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
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading vendors...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendors.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No vendors found</td></tr>
                ) : filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium">{vendor.name.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                          <div className="text-sm text-gray-500">{vendor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />{vendor.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{vendor.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendor.services}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor(vendor.status)}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendor.joinDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {vendor.status === 'Pending' && (
                          <>
                            <button onClick={() => handleApprove(vendor.id)} className="text-green-600 hover:text-green-900" title="Approve"><Check className="w-4 h-4" /></button>
                            <button onClick={() => handleReject(vendor.id)} className="text-red-600 hover:text-red-900" title="Reject"><X className="w-4 h-4" /></button>
                          </>
                        )}
                        <button onClick={() => setModal({ type: 'view', vendor })} className="text-blue-600 hover:text-blue-900" title="View"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => setModal({ type: 'edit', vendor })} className="text-indigo-600 hover:text-indigo-900" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(vendor.id)} className="text-red-600 hover:text-red-900" title="Deactivate"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal?.type === 'view' && <ViewModal vendor={modal.vendor} onClose={() => setModal(null)} />}
      {modal?.type === 'edit' && <EditModal vendor={modal.vendor} onClose={() => setModal(null)} onSave={handleEditSave} />}
      {modal?.type === 'add' && <AddVendorModal onClose={() => setModal(null)} onSave={handleAddVendor} />}
    </div>
  )
}

export default VendorManagement

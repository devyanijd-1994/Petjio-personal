import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, FileText, Calendar, X, Move, Copy, Settings } from 'lucide-react'
import { serviceFormApi, serviceApi } from '../services/adminApi'
import { showSuccess, showError } from '../utils/notifications'

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input', description: 'Single line text' },
  { value: 'textarea', label: 'Text Area', description: 'Multi-line text' },
  { value: 'number', label: 'Number', description: 'Numeric input' },
  { value: 'dropdown', label: 'Dropdown', description: 'Select one option' },
  { value: 'multi_select', label: 'Multi Select', description: 'Select multiple options' },
  { value: 'file', label: 'File Upload', description: 'Upload files' },
  { value: 'date', label: 'Date Picker', description: 'Select date' },
  { value: 'toggle', label: 'Toggle/Checkbox', description: 'Yes/No option' },
  { value: 'time_range', label: 'Time Range', description: 'Start and end time' },
  { value: 'days_select', label: 'Days Selection', description: 'Select days of week' }
]

const renderFieldPreview = (field) => {
  const baseClasses = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"

  switch (field.type) {
    case 'text':
      return <input type="text" placeholder={field.placeholder || 'Enter text...'} className={baseClasses} disabled />
    case 'textarea':
      return <textarea placeholder={field.placeholder || 'Enter description...'} rows={3} className={baseClasses} disabled />
    case 'number':
      return <input type="number" placeholder={field.placeholder || 'Enter number...'} className={baseClasses} disabled />
    case 'dropdown':
      return (
        <select className={baseClasses} disabled>
          <option>{field.placeholder || 'Select option...'}</option>
          {field.options?.map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))}
        </select>
      )
    case 'multi_select':
      return (
        <select multiple className={`${baseClasses} h-20`} disabled>
          <option disabled>{field.placeholder || 'Select multiple options...'}</option>
          {field.options?.map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))}
        </select>
      )
    case 'file':
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <div className="text-gray-500 text-sm">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            Click to upload or drag and drop
          </div>
        </div>
      )
    case 'date':
      return <input type="date" className={baseClasses} disabled />
    case 'toggle':
      return (
        <div className="flex items-center space-x-3">
          <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" disabled />
          <span className="text-sm text-gray-700">{field.placeholder || field.label}</span>
        </div>
      )
    case 'time_range':
      return (
        <div className="flex items-center space-x-3">
          <input type="time" className={`${baseClasses} flex-1`} disabled />
          <span className="text-gray-500 font-medium">to</span>
          <input type="time" className={`${baseClasses} flex-1`} disabled />
        </div>
      )
    case 'days_select':
      return (
        <div className="grid grid-cols-7 gap-2">
          {(field.options && field.options.length > 0
            ? field.options
            : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          ).map(day => (
            <label key={day} className="flex flex-col items-center space-y-1 text-xs cursor-pointer">
              <input type="checkbox" className="rounded" disabled />
              <span className="text-gray-600">{day}</span>
            </label>
          ))}
        </div>
      )
    default:
      return <input type="text" placeholder={field.placeholder || 'Enter value...'} className={baseClasses} disabled />
  }
}

const ViewFormModal = ({ form, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform animate-slideUp">
      <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{form.title}</h2>
            <p className="text-sm text-gray-500">{form.category} • {form.fieldList?.length || 0} fields</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Form Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{form.fieldList?.length || 0}</div>
            <div className="text-sm text-gray-500">Fields</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${form.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
              {form.status}
            </div>
            <div className="text-sm text-gray-500">Status</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500">Submissions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{form.created}</div>
            <div className="text-sm text-gray-500">Created</div>
          </div>
        </div>

        {form.description && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Description</h3>
            <p className="text-sm text-blue-800">{form.description}</p>
          </div>
        )}

        {/* Fields List */}
        {form.fieldList?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Form Fields</h3>
            <div className="space-y-3 mb-6">
              {form.fieldList
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((field, index) => (
                <div key={field.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900">{field.label}</h4>
                        <p className="text-sm text-gray-500">Key: {field.fieldKey}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        {FIELD_TYPES.find(t => t.value === field.type)?.label || field.type}
                      </span>
                      {field.isRequired && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">Required</span>
                      )}
                    </div>
                  </div>

                  {field.placeholder && (
                    <p className="text-sm text-gray-600 mb-2">Placeholder: "{field.placeholder}"</p>
                  )}

                  {field.helpText && (
                    <p className="text-xs text-gray-500 mb-2">
                      {field.helpText}
                    </p>
                  )}

                  {field.options?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600 mb-1">Options:</p>
                      <div className="flex flex-wrap gap-1">
                        {field.options.map((option, i) => (
                          <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Form Preview */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Preview</h3>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-semibold text-gray-900">{form.title}</h4>
                {form.description && <p className="text-gray-600 mt-1">{form.description}</p>}
              </div>

              {form.fieldList
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((field, index) => (
                <div key={field.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.placeholder && field.type !== 'toggle' && (
                    <p className="text-xs text-gray-500">{field.placeholder}</p>
                  )}
                  {field.helpText && (
                    <p className="text-xs text-gray-500">{field.helpText}</p>
                  )}
                  {renderFieldPreview(field)}
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium" disabled>
                  Submit Form
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)

const EditFormModal = ({ form, categories, onClose, onSave }) => {
  const [name, setName] = useState(form.title)
  const [categoryId, setCategoryId] = useState(form.categoryId)
  const [description, setDescription] = useState(form.description || '')
  const [isActive, setIsActive] = useState(form.status === 'Active')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('Form name is required')
    setSaving(true)
    setError('')
    try {
      await onSave(form.id, { name, description, isActive })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update form')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Edit Form</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Form Name *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="editActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded" />
            <label htmlFor="editActive" className="text-sm font-medium text-gray-700">Active</label>
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

const CreateFormModal = ({ categories, forms, onClose, onSave }) => {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [fields, setFields] = useState([])
  const [newField, setNewField] = useState({ label: '', fieldKey: '', type: 'text', isRequired: false, placeholder: '', helpText: '', order: '', options: [] })
  const [newOption, setNewOption] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const autoKey = (label) => label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')

  const validateCategory = (selectedCategoryId) => {
    if (!selectedCategoryId) {
      setCategoryError('')
      return true
    }
    
    // Check if a form already exists for this category
    const existingForm = forms.find(form => form.categoryId === selectedCategoryId)
    if (existingForm) {
      const categoryName = categories.find(c => c.id === selectedCategoryId)?.name || 'this category'
      setCategoryError(`Form already exists for ${categoryName}.`)
      return false
    }
    
    setCategoryError('')
    return true
  }

  const handleCategoryChange = (selectedCategoryId) => {
    setCategoryId(selectedCategoryId)
    validateCategory(selectedCategoryId)
  }

  const addField = () => {
    if (!newField.label.trim() || !newField.fieldKey.trim()) return
    if (fields.some(f => f.fieldKey === newField.fieldKey)) {
      setError('Field key must be unique')
      return
    }
    
    // Use manual order if provided, otherwise use automatic order
    const fieldOrder = newField.order !== '' ? newField.order : fields.length + 1
    
    setFields([...fields, { ...newField, order: fieldOrder, id: `new_${Date.now()}` }])
    setNewField({ label: '', fieldKey: '', type: 'text', isRequired: false, placeholder: '', helpText: '', order: '', options: [] })
    setNewOption('')
  }

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const addOption = () => {
    if (!newOption.trim()) return
    setNewField({ ...newField, options: [...newField.options, newOption.trim()] })
    setNewOption('')
  }

  const removeOption = (index) => {
    setNewField({ ...newField, options: newField.options.filter((_, i) => i !== index) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('Form name is required')
    if (!categoryId) return setError('Category is required')
    if (categoryError) return setError('Please select a different category')
    setSaving(true)
    setError('')
    setCategoryError('')
    try {
      await onSave({ 
        name, 
        categoryId, 
        description, 
        isActive, 
        fields: fields
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((f, i) => ({ ...f, order: f.order || i + 1 }))
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create form')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Create Service Form</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Grooming Registration"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={categoryId} onChange={e => handleCategoryChange(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${categoryError ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {categoryError && (
                <p className="text-red-600 text-sm mt-1">{categoryError}</p>
              )}
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded" />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                placeholder="Optional description..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          {/* Add Fields */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Form Fields ({fields.length})</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-3">
              <div className="grid grid-cols-3 gap-2">
                <input value={newField.label}
                  onChange={e => setNewField({ ...newField, label: e.target.value, fieldKey: autoKey(e.target.value) })}
                  placeholder="Label *"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                <input value={newField.fieldKey}
                  onChange={e => setNewField({ ...newField, fieldKey: e.target.value })}
                  placeholder="Field key *"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                <input 
                  type="number"
                  value={newField.order}
                  onChange={e => setNewField({ ...newField, order: parseInt(e.target.value) || '' })}
                  placeholder="Order (e.g. 1)"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value, options: e.target.value === 'dropdown' || e.target.value === 'multi_select' ? newField.options : [] })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <input value={newField.placeholder} onChange={e => setNewField({ ...newField, placeholder: e.target.value })}
                  placeholder="Placeholder (optional)"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <input
                  value={newField.helpText}
                  onChange={e => setNewField({ ...newField, helpText: e.target.value })}
                  placeholder="Help text (optional)"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {(newField.type === 'dropdown' || newField.type === 'multi_select') && (
                <div className="border-t pt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="flex space-x-2 mb-2">
                    <input value={newOption} onChange={e => setNewOption(e.target.value)}
                      placeholder="Add option"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                    <button type="button" onClick={addOption}
                      disabled={!newOption.trim()}
                      className="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white px-3 py-2 rounded-lg text-sm">
                      Add
                    </button>
                  </div>
                  {newField.options.length > 0 && (
                    <div className="space-y-1">
                      {newField.options.map((option, i) => (
                        <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded px-2 py-1 text-sm">
                          <span>{option}</span>
                          <button type="button" onClick={() => removeOption(i)} className="text-red-400 hover:text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm text-gray-700">
                  <input type="checkbox" checked={newField.isRequired} onChange={e => setNewField({ ...newField, isRequired: e.target.checked })} className="rounded" />
                  <span>Required field</span>
                </label>
                <button type="button" onClick={addField}
                  disabled={!newField.label.trim() || !newField.fieldKey.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg text-sm flex items-center space-x-1">
                  <Plus className="w-3 h-3" /><span>Add Field</span>
                </button>
              </div>
            </div>

            {fields.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {fields
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((f, i) => (
                  <div key={f.id} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">
                          #{f.order || i + 1}
                        </span>
                        <span className="text-gray-800">{f.label}</span>
                        <span className="text-gray-500 text-xs">({f.fieldKey})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{f.type}</span>
                        {f.isRequired && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">Required</span>}
                        <button type="button" onClick={() => removeField(i)} className="text-red-400 hover:text-red-600 ml-1"><X className="w-3 h-3" /></button>
                      </div>
                    </div>
                    {f.options?.length > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        Options: {f.options.join(', ')}
                      </div>
                    )}
                    {f.helpText && (
                      <div className="text-xs text-gray-500 mt-1 italic">
                        Help: {f.helpText}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Preview */}
          {fields.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Form Preview</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                      {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderFieldPreview(field)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving || categoryError} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ServiceFormManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [forms, setForms] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewForm, setViewForm] = useState(null)
  const [editForm, setEditForm] = useState(null)

  useEffect(() => {
    fetchCategories()
    fetchForms()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await serviceApi.getServices()
      if (res.data.success) {
        const data = res.data.data ?? res.data
        setCategories(Array.isArray(data) ? data : (data.categories ?? []))
      }
    } catch (e) { console.error(e) }
  }

  const fetchForms = async () => {
    try {
      setLoading(true)
      const response = await serviceFormApi.getForms()
      if (response.data.success) {
        const list = response.data.data ?? response.data.forms ?? []
        setForms(list.map(f => ({
          id: f.id,
          title: f.name,
          category: f.category?.name || '—',
          categoryId: f.categoryId,
          fields: f.fields?.length || 0,
          submissions: 0,
          status: f.isActive ? 'Active' : 'Inactive',
          created: new Date(f.createdAt).toISOString().split('T')[0]
        })))
      }
    } catch (error) {
      console.error('Error fetching forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateForm = async (data) => {
    try {
      console.log("Sending payload:", data)
      await serviceFormApi.createForm(data)
      await fetchForms()
      showSuccess(`Form "${data.name}" created successfully`)
    } catch (error) {
      console.error('Form creation error:', error)
      const errorMsg = error.response?.data?.message || 'Failed to create form'
      showError(errorMsg)
      throw error // Re-throw to let modal handle it
    }
  }

  const handleViewForm = async (form) => {
    try {
      const res = await serviceFormApi.getFormById(form.id)
      if (res.data.success) {
        const f = res.data.data ?? res.data
        setViewForm({ ...form, fieldList: f.fields || [], description: f.description })
      }
    } catch { setViewForm(form) }
  }

  const handleEditOpen = async (form) => {
    try {
      const res = await serviceFormApi.getFormById(form.id)
      if (res.data.success) {
        const f = res.data.data ?? res.data
        setEditForm({ ...form, description: f.description })
      }
    } catch { setEditForm(form) }
  }

  const handleEditSave = async (id, data) => {
    await serviceFormApi.updateForm(id, data)
    await fetchForms()
  }

  const handleDeleteForm = async (formId) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await serviceFormApi.deleteForm(formId)
        fetchForms()
      } catch (error) {
        console.error('Error deleting form:', error)
        alert('Failed to delete form')
      }
    }
  }

  const filteredForms = forms.filter(form => {
    const matchSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCat = categoryFilter === 'all' || form.category === categoryFilter
    const matchStatus = statusFilter === 'all' || form.status === statusFilter
    return matchSearch && matchCat && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Service Form Management</h1>
        <button onClick={() => setShowCreateModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Create Form</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading forms...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <div key={form.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${form.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>{form.status}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{form.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{form.category}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fields:</span>
                    <span className="font-medium">{form.fields}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Submissions:</span>
                    <span className="font-medium">{form.submissions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />{form.created}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewForm(form)}
                    className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />View
                  </button>
                  <button
                    onClick={() => handleEditOpen(form)}
                    className="flex-1 bg-gray-50 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />Edit
                  </button>
                  <button
                    onClick={() => handleDeleteForm(form.id)}
                    className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateFormModal
          categories={categories}
          forms={forms}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateForm}
        />
      )}

      {viewForm && <ViewFormModal form={viewForm} onClose={() => setViewForm(null)} />}

      {editForm && (
        <EditFormModal
          form={editForm}
          categories={categories}
          onClose={() => setEditForm(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}

export default ServiceFormManagement

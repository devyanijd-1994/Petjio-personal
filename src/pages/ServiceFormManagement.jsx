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
            <p className="text-sm text-gray-500">
              {form.category} • {form.fieldList?.length || 0} fields
              {form.metadata?.sections?.length > 0 && ` • ${form.metadata.sections.length} sections`}
            </p>
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
            <div className="text-2xl font-bold text-green-600">{form.metadata?.sections?.length || 0}</div>
            <div className="text-sm text-gray-500">Sections</div>
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
        </div>

        {form.description && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Description</h3>
            <p className="text-sm text-blue-800">{form.description}</p>
          </div>
        )}

        {/* Show sub-services if they exist */}
        {form.metadata?.hasSubServices && form.metadata?.subServices && form.metadata.subServices.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-700 mb-3">Sub-Services ({form.metadata.subServices.length})</h4>
            <div className="space-y-2 mb-4">
              {form.metadata.subServices.map((subService, index) => (
                <div key={subService.id} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <h5 className="font-medium text-purple-900">{subService.name}</h5>
                        {subService.description && (
                          <p className="text-sm text-purple-700">{subService.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Structure Overview */}
        {(form.fieldList?.length > 0 || form.metadata?.sections?.length > 0) && (
          <div>
            {/* <h3 className="text-lg font-semibold text-gray-800 mb-4">Form Structure</h3> */}
            
            {/* Show sections if they exist */}
            {form.metadata?.sections && form.metadata.sections.length > 0 && (
              <div className="mb-6">
                {/* <h4 className="text-md font-semibold text-gray-700 mb-3">Sections ({form.metadata.sections.length})</h4> */}
                {/* <div className="space-y-2 mb-4">
                  {form.metadata.sections
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((section, index) => {
                      const sectionFieldCount = form.fieldList?.filter(f => f.sectionId === section.id).length || 0
                      return (
                        <div key={section.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <div>
                                <h5 className="font-medium text-green-900">{section.title}</h5>
                                {section.description && (
                                  <p className="text-sm text-green-700">{section.description}</p>
                                )}
                              </div>
                            </div>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                              {sectionFieldCount} fields
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div> */}
              </div>
            )}

            {/* <h4 className="text-md font-semibold text-gray-700 mb-3">
              {form.metadata?.hasSubServices ? 'Common Fields' : 'Fields'} ({form.fieldList?.length || 0})
            </h4> */}
            {/* <div className="space-y-3 mb-6">
              {form.fieldList
                ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                ?.map((field, index) => {
                  const fieldSection = form.metadata?.sections?.find(s => s.id === field.sectionId)
                  return (
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
                      {fieldSection && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          {fieldSection.title}
                        </span>
                      )}
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
              )})}
            </div> */}

            {/* Form Preview */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Preview</h3>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-semibold text-gray-900">{form.title}</h4>
                {form.description && <p className="text-gray-600 mt-1">{form.description}</p>}
              </div>

              {/* Sub-services preview */}
              {form.metadata?.hasSubServices && form.metadata?.subServices && form.metadata.subServices.length > 0 ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-blue-900 mb-2">Step 1: Service Selection</h4>
                    <p className="text-sm text-blue-700 mb-3">Users will first select their service type:</p>
                    <div className="space-y-2">
                      {form.metadata.subServices.map(subService => (
                        <div key={subService.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                          <input type="radio" name="subService" className="text-blue-600" disabled />
                          <div className="flex items-center space-x-2">
                            <div>
                              <span className="font-medium text-gray-900">{subService.name}</span>
                              {subService.description && (
                                <p className="text-sm text-gray-600">{subService.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular form preview */
                <>
                  {/* Check if form has sections in metadata */}
                  {form.metadata?.sections && form.metadata.sections.length > 0 ? (
                    // Render by sections
                    form.metadata.sections
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map(section => {
                        const sectionFields = form.fieldList
                          ?.filter(f => f.sectionId === section.id)
                          ?.sort((a, b) => (a.order || 0) - (b.order || 0)) || []
                        
                        if (sectionFields.length === 0) return null
                        
                        return (
                          <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="border-b border-gray-200 pb-3 mb-4">
                              <h5 className="text-lg font-semibold text-gray-900">{section.title}</h5>
                              {section.description && (
                                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                              )}
                            </div>
                            <div className="space-y-4">
                              {sectionFields.map((field) => (
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
                            </div>
                          </div>
                        )
                      })
                  ) : (
                    // Render fields without sections (legacy)
                    form.fieldList
                      ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                      ?.map((field) => (
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
                    ))
                  )}

                  {/* Fields not assigned to any section */}
                  {form.metadata?.sections && form.metadata.sections.length > 0 && 
                   form.fieldList?.filter(f => !f.sectionId).length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="border-b border-gray-200 pb-3 mb-4">
                        <h5 className="text-lg font-semibold text-gray-900">Other Fields</h5>
                        <p className="text-sm text-gray-600 mt-1">Fields not assigned to any section</p>
                      </div>
                      <div className="space-y-4">
                        {form.fieldList
                          ?.filter(f => !f.sectionId)
                          ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                          ?.map((field) => (
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
                      </div>
                    </div>
                  )}
                </>
              )}

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
  // Enhanced state for comprehensive form editing
  const [name, setName] = useState(form.title)
  const [categoryId, setCategoryId] = useState(form.categoryId)
  const [description, setDescription] = useState(form.description || '')
  const [isActive, setIsActive] = useState(form.status === 'Active')
  const [sections, setSections] = useState(form.metadata?.sections || [])
  const [fields, setFields] = useState(form.fieldList || [])
  const [subServices, setSubServices] = useState(form.metadata?.subServices || [])
  const [hasSubServices, setHasSubServices] = useState(form.metadata?.hasSubServices || false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  
  // Sub-service specific states
  const [selectedSubService, setSelectedSubService] = useState(null)
  const [subServiceForms, setSubServiceForms] = useState(() => {
    // Initialize sub-service forms from metadata or create empty structure
    const initialForms = form.metadata?.subServiceForms || {}
    
    // If we have sub-services but no forms data, initialize empty structures
    if (form.metadata?.hasSubServices && form.metadata?.subServices) {
      form.metadata.subServices.forEach(subService => {
        if (!initialForms[subService.id]) {
          initialForms[subService.id] = {
            sections: [],
            fields: []
          }
        }
      })
    }
    
    return initialForms
  })
  
  // Field editing states
  const [newField, setNewField] = useState({ label: '', fieldKey: '', type: 'text', isRequired: false, placeholder: '', helpText: '', order: '', options: [], sectionId: '', subServiceId: '' })
  const [newOption, setNewOption] = useState('')
  const [newSection, setNewSection] = useState({ title: '', description: '', order: '', subServiceId: '' })
  const [newSubService, setNewSubService] = useState({ name: '', description: '' })
  const [editingField, setEditingField] = useState(null)
  const [editingSection, setEditingSection] = useState(null)

  // Initialize sub-service forms when form data changes
  useEffect(() => {
    if (hasSubServices && subServices.length > 0) {
      const updatedForms = { ...subServiceForms }
      
      subServices.forEach(subService => {
        if (!updatedForms[subService.id]) {
          updatedForms[subService.id] = {
            sections: [],
            fields: []
          }
        }
      })
      
      setSubServiceForms(updatedForms)
      
      // Auto-select first sub-service if none selected
      if (!selectedSubService && subServices.length > 0) {
        setSelectedSubService(subServices[0])
      }
    } else {
      // Clear selection if sub-services are disabled
      setSelectedSubService(null)
    }
  }, [hasSubServices, subServices.length])

  const autoKey = (label) => label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')

  // Section management
  const addSection = () => {
    if (!newSection.title.trim()) return
    const sectionId = `section_${Date.now()}`
    const currentSections = getCurrentSections()
    const sectionOrder = newSection.order !== '' ? newSection.order : currentSections.length + 1
    
    const newSectionObj = { 
      id: sectionId, 
      title: newSection.title, 
      description: newSection.description,
      order: sectionOrder,
      subServiceId: selectedSubService?.id || null
    }
    
    updateCurrentSections([...currentSections, newSectionObj])
    setNewSection({ title: '', description: '', order: '', subServiceId: '' })
  }

  const removeSection = (sectionId) => {
    const currentSections = getCurrentSections()
    const currentFields = getCurrentFields()
    
    updateCurrentSections(currentSections.filter(s => s.id !== sectionId))
    updateCurrentFields(currentFields.filter(f => f.sectionId !== sectionId))
  }

  const updateSection = (sectionId, updates) => {
    const currentSections = getCurrentSections()
    updateCurrentSections(currentSections.map(s => s.id === sectionId ? { ...s, ...updates } : s))
    setEditingSection(null)
  }

  // Field management
  const addField = () => {
    if (!newField.label.trim() || !newField.fieldKey.trim()) return
    const currentFields = getCurrentFields()
    
    if (currentFields.some(f => f.fieldKey === newField.fieldKey)) {
      setError('Field key must be unique within this context')
      return
    }
    
    const fieldOrder = newField.order !== '' ? newField.order : currentFields.length + 1
    const newFieldObj = { 
      ...newField, 
      order: fieldOrder, 
      id: `new_${Date.now()}`,
      subServiceId: selectedSubService?.id || null
    }
    
    updateCurrentFields([...currentFields, newFieldObj])
    setNewField({ label: '', fieldKey: '', type: 'text', isRequired: false, placeholder: '', helpText: '', order: '', options: [], sectionId: '', subServiceId: '' })
    setNewOption('')
  }

  const removeField = (fieldId) => {
    const currentFields = getCurrentFields()
    updateCurrentFields(currentFields.filter(f => f.id !== fieldId))
  }

  const updateField = (fieldId, updates) => {
    const currentFields = getCurrentFields()
    updateCurrentFields(currentFields.map(f => f.id === fieldId ? { ...f, ...updates } : f))
    setEditingField(null)
  }

  // Reordering functions
  const moveSection = (sectionId, direction) => {
    const currentSections = getCurrentSections()
    const sectionIndex = currentSections.findIndex(s => s.id === sectionId)
    if (sectionIndex === -1) return
    
    const newSections = [...currentSections]
    const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1
    
    if (targetIndex >= 0 && targetIndex < newSections.length) {
      [newSections[sectionIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[sectionIndex]]
      // Update order numbers
      newSections.forEach((section, index) => {
        section.order = index + 1
      })
      updateCurrentSections(newSections)
    }
  }

  const moveField = (fieldId, direction) => {
    const currentFields = getCurrentFields()
    const fieldIndex = currentFields.findIndex(f => f.id === fieldId)
    if (fieldIndex === -1) return
    
    const newFields = [...currentFields]
    const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1
    
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[fieldIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[fieldIndex]]
      // Update order numbers
      newFields.forEach((field, index) => {
        field.order = index + 1
      })
      updateCurrentFields(newFields)
    }
  }

  const addOption = () => {
    if (!newOption.trim()) return
    setNewField({ ...newField, options: [...newField.options, newOption.trim()] })
    setNewOption('')
  }

  const removeOption = (index) => {
    setNewField({ ...newField, options: newField.options.filter((_, i) => i !== index) })
  }

  // Sub-service management with individual forms
  const addSubService = () => {
    if (!newSubService.name.trim()) return
    const subServiceId = `sub_service_${Date.now()}`
    
    const newSubServiceObj = { 
      id: subServiceId, 
      name: newSubService.name, 
      description: newSubService.description
    }
    
    setSubServices([...subServices, newSubServiceObj])
    
    // Initialize empty form structure for this sub-service
    setSubServiceForms(prevForms => ({
      ...prevForms,
      [subServiceId]: {
        sections: [],
        fields: []
      }
    }))
    
    // Auto-select the new sub-service
    setSelectedSubService(newSubServiceObj)
    
    setNewSubService({ name: '', description: '' })
  }

  const removeSubService = (subServiceId) => {
    setSubServices(subServices.filter(s => s.id !== subServiceId))
    
    // Remove the form data for this sub-service
    const updatedForms = { ...subServiceForms }
    delete updatedForms[subServiceId]
    setSubServiceForms(updatedForms)
    
    // Clear selection if this was the selected sub-service
    if (selectedSubService?.id === subServiceId) {
      setSelectedSubService(null)
    }
  }

  // Get current sections and fields based on selected sub-service
  const getCurrentSections = () => {
    if (hasSubServices && selectedSubService) {
      const subServiceData = subServiceForms[selectedSubService.id]
      console.log('getCurrentSections - selectedSubService:', selectedSubService.name, 'data:', subServiceData)
      return subServiceData?.sections || []
    }
    return sections
  }

  const getCurrentFields = () => {
    if (hasSubServices && selectedSubService) {
      const subServiceData = subServiceForms[selectedSubService.id]
      console.log('getCurrentFields - selectedSubService:', selectedSubService.name, 'data:', subServiceData)
      return subServiceData?.fields || []
    }
    return fields
  }

  // Update sections and fields for current context
  const updateCurrentSections = (newSections) => {
    if (hasSubServices && selectedSubService) {
      setSubServiceForms(prevForms => ({
        ...prevForms,
        [selectedSubService.id]: {
          sections: newSections,
          fields: prevForms[selectedSubService.id]?.fields || []
        }
      }))
    } else {
      setSections(newSections)
    }
  }

  const updateCurrentFields = (newFields) => {
    if (hasSubServices && selectedSubService) {
      setSubServiceForms(prevForms => ({
        ...prevForms,
        [selectedSubService.id]: {
          sections: prevForms[selectedSubService.id]?.sections || [],
          fields: newFields
        }
      }))
    } else {
      setFields(newFields)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('Form name is required')
    setSaving(true)
    setError('')
    try {
      const formData = { 
        name, 
        description, 
        isActive,
        hasSubServices,
        subServices: hasSubServices ? subServices : [],
        subServiceForms: hasSubServices ? subServiceForms : {},
        sections: !hasSubServices && sections.length > 0 ? sections : undefined,
        fields: !hasSubServices && fields.length > 0 ? fields : undefined
      }
      await onSave(form.id, formData)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update form')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Edit Form: {form.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b bg-gray-50">
          <nav className="flex space-x-8 px-6">
            {['basic', 'sections', 'fields', 'subservices', 'preview'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'subservices' ? 'Sub-Services' : tab}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded" />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={hasSubServices} onChange={e => setHasSubServices(e.target.checked)} className="rounded" />
                  <span className="text-sm font-medium text-gray-700">Enable Sub-Services</span>
                </label>
              </div>
            </div>
          )}

          {/* Sub-Services Tab */}
          {activeTab === 'subservices' && (
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Sub-Services ({subServices.length})</h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <input 
                    value={newSubService.name}
                    onChange={e => setNewSubService({ ...newSubService, name: e.target.value })}
                    placeholder="Sub-service name *"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                  />
                  <input 
                    value={newSubService.description}
                    onChange={e => setNewSubService({ ...newSubService, description: e.target.value })}
                    placeholder="Description (optional)"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <button 
                  type="button" 
                  onClick={addSubService}
                  disabled={!newSubService.name.trim()}
                  className="bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" /><span>Add Sub-Service</span>
                </button>
              </div>

              {subServices.length > 0 && (
                <div className="space-y-2">
                  {subServices.map((subService, i) => (
                    <div key={subService.id} className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedSubService?.id === subService.id 
                        ? 'bg-purple-100 border-purple-300' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center space-x-2 flex-1"
                          onClick={() => setSelectedSubService(subService)}
                        >
                          <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs font-mono">#{i + 1}</span>
                          <span className="text-gray-800 font-medium">{subService.name}</span>
                          {subService.description && <span className="text-gray-500 text-sm">- {subService.description}</span>}
                          {selectedSubService?.id === subService.id && (
                            <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">Selected</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {subServiceForms[subService.id]?.sections?.length || 0} sections, {subServiceForms[subService.id]?.fields?.length || 0} fields
                          </span>
                          <button type="button" onClick={() => removeSubService(subService.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hasSubServices && subServices.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Instructions</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Click on a sub-service above to select it, then use the "Sections" and "Fields" tabs to configure its specific form structure.
                    Each sub-service will have its own independent form with its own sections and fields.
                  </p>
                  
                  {/* Debug information */}
                  <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
                    <strong>Debug Info:</strong><br/>
                    Selected: {selectedSubService?.name || 'None'}<br/>
                    Sub-service forms data: {JSON.stringify(Object.keys(subServiceForms))}<br/>
                    <button 
                      type="button"
                      onClick={() => {
                        if (selectedSubService) {
                          const testSection = {
                            id: `test_section_${Date.now()}`,
                            title: 'Test Section',
                            description: 'Test description',
                            order: 1
                          }
                          const testField = {
                            id: `test_field_${Date.now()}`,
                            label: 'Test Field',
                            fieldKey: 'test_field',
                            type: 'text',
                            isRequired: true,
                            order: 1,
                            sectionId: testSection.id
                          }
                          
                          setSubServiceForms({
                            ...subServiceForms,
                            [selectedSubService.id]: {
                              sections: [testSection],
                              fields: [testField]
                            }
                          })
                        }
                      }}
                      className="mt-1 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    >
                      Add Test Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div className="space-y-4">
              {hasSubServices && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    {selectedSubService 
                      ? `Editing sections for: ${selectedSubService.name}` 
                      : 'Select a sub-service from the Sub-Services tab to edit its sections'
                    }
                  </p>
                  {selectedSubService && (
                    <div className="mt-2 text-xs text-yellow-700">
                      Debug: Current sections for {selectedSubService.name}: {getCurrentSections().length}
                    </div>
                  )}
                </div>
              )}
              
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Form Sections ({getCurrentSections().length})
                  {hasSubServices && selectedSubService && (
                    <span className="text-purple-600 ml-2">for {selectedSubService.name}</span>
                  )}
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <input 
                    value={newSection.title}
                    onChange={e => setNewSection({ ...newSection, title: e.target.value })}
                    placeholder="Section title *"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                    disabled={hasSubServices && !selectedSubService}
                  />
                  <input 
                    value={newSection.description}
                    onChange={e => setNewSection({ ...newSection, description: e.target.value })}
                    placeholder="Description (optional)"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                    disabled={hasSubServices && !selectedSubService}
                  />
                  <input 
                    type="number"
                    value={newSection.order}
                    onChange={e => setNewSection({ ...newSection, order: parseInt(e.target.value) || '' })}
                    placeholder="Order (e.g. 1)"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                    disabled={hasSubServices && !selectedSubService}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={addSection}
                  disabled={!newSection.title.trim() || (hasSubServices && !selectedSubService)}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" /><span>Add Section</span>
                </button>
              </div>

              {getCurrentSections().length > 0 && (
                <div className="space-y-2">
                  {getCurrentSections().sort((a, b) => (a.order || 0) - (b.order || 0)).map((section, i) => (
                    <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-mono">#{section.order || i + 1}</span>
                          <span className="text-gray-800 font-medium">{section.title}</span>
                          {section.description && <span className="text-gray-500 text-sm">- {section.description}</span>}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button type="button" onClick={() => moveSection(section.id, 'up')} disabled={i === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                            <Move className="w-4 h-4 transform rotate-180" />
                          </button>
                          <button type="button" onClick={() => moveSection(section.id, 'down')} disabled={i === getCurrentSections().length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                            <Move className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => setEditingSection(section)} className="text-blue-400 hover:text-blue-600">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => removeSection(section.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fields Tab */}
          {activeTab === 'fields' && (
            <div className="space-y-4">
              {hasSubServices && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    {selectedSubService 
                      ? `Editing fields for: ${selectedSubService.name}` 
                      : 'Select a sub-service from the Sub-Services tab to edit its fields'
                    }
                  </p>
                  {selectedSubService && (
                    <div className="mt-2 text-xs text-yellow-700">
                      Debug: Current fields for {selectedSubService.name}: {getCurrentFields().length}
                    </div>
                  )}
                </div>
              )}
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Form Fields ({getCurrentFields().length})
                  {hasSubServices && selectedSubService && (
                    <span className="text-purple-600 ml-2">for {selectedSubService.name}</span>
                  )}
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <input value={newField.label}
                    onChange={e => setNewField({ ...newField, label: e.target.value, fieldKey: autoKey(e.target.value) })}
                    placeholder="Label *"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                    disabled={hasSubServices && !selectedSubService} />
                  <input value={newField.fieldKey}
                    onChange={e => setNewField({ ...newField, fieldKey: e.target.value })}
                    placeholder="Field key *"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                    disabled={hasSubServices && !selectedSubService} />
                  <select value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value, options: e.target.value === 'dropdown' || e.target.value === 'multi_select' ? newField.options : [] })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    disabled={hasSubServices && !selectedSubService}>
                    {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <select value={newField.sectionId} onChange={e => setNewField({ ...newField, sectionId: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    disabled={hasSubServices && !selectedSubService}>
                    <option value="">No Section</option>
                    {getCurrentSections().sort((a, b) => (a.order || 0) - (b.order || 0)).map(section => (
                      <option key={section.id} value={section.id}>{section.title}</option>
                    ))}
                  </select>
                  <input value={newField.placeholder} onChange={e => setNewField({ ...newField, placeholder: e.target.value })}
                    placeholder="Placeholder (optional)"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                    disabled={hasSubServices && !selectedSubService} />
                  <input type="number" value={newField.order} onChange={e => setNewField({ ...newField, order: parseInt(e.target.value) || '' })}
                    placeholder="Order (e.g. 1)"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                    disabled={hasSubServices && !selectedSubService} />
                </div>

                {(newField.type === 'dropdown' || newField.type === 'multi_select') && (
                  <div className="border-t pt-3 mb-3">
                    <div className="flex space-x-2 mb-2">
                      <input value={newOption} onChange={e => setNewOption(e.target.value)}
                        placeholder="Add option"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                        disabled={hasSubServices && !selectedSubService} />
                      <button type="button" onClick={addOption} disabled={!newOption.trim() || (hasSubServices && !selectedSubService)}
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
                    <input type="checkbox" checked={newField.isRequired} onChange={e => setNewField({ ...newField, isRequired: e.target.checked })} className="rounded" disabled={hasSubServices && !selectedSubService} />
                    <span>Required field</span>
                  </label>
                  <button type="button" onClick={addField}
                    disabled={!newField.label.trim() || !newField.fieldKey.trim() || (hasSubServices && !selectedSubService)}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1">
                    <Plus className="w-4 h-4" /><span>Add Field</span>
                  </button>
                </div>
              </div>

              {getCurrentFields().length > 0 && (
                <div className="space-y-2">
                  {getCurrentFields().sort((a, b) => (a.order || 0) - (b.order || 0)).map((field) => (
                    <div key={field.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">#{field.order || 0}</span>
                          <span className="text-gray-800 font-medium">{field.label}</span>
                          <span className="text-gray-500 text-xs">({field.fieldKey})</span>
                          {field.sectionId && (
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                              {getCurrentSections().find(s => s.id === field.sectionId)?.title || 'Unknown Section'}
                            </span>
                          )}
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{field.type}</span>
                          {field.isRequired && <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Required</span>}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button type="button" onClick={() => moveField(field.id, 'up')} disabled={getCurrentFields().findIndex(f => f.id === field.id) === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                            <Move className="w-4 h-4 transform rotate-180" />
                          </button>
                          <button type="button" onClick={() => moveField(field.id, 'down')} disabled={getCurrentFields().findIndex(f => f.id === field.id) === getCurrentFields().length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                            <Move className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => setEditingField(field)} className="text-blue-400 hover:text-blue-600">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => removeField(field.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {field.options?.length > 0 && (
                        <div className="text-xs text-gray-600 mt-1">Options: {field.options.join(', ')}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Inline Edit Modals */}
          {editingSection && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Edit Section</h3>
                <div className="space-y-3">
                  <input
                    value={editingSection.title}
                    onChange={e => setEditingSection({ ...editingSection, title: e.target.value })}
                    placeholder="Section title"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    value={editingSection.description || ''}
                    onChange={e => setEditingSection({ ...editingSection, description: e.target.value })}
                    placeholder="Description (optional)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={editingSection.order || ''}
                    onChange={e => setEditingSection({ ...editingSection, order: parseInt(e.target.value) || '' })}
                    placeholder="Order"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={() => updateSection(editingSection.id, editingSection)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">Save</button>
                </div>
              </div>
            </div>
          )}

          {editingField && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-lg font-semibold mb-4">Edit Field</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={editingField.label}
                      onChange={e => setEditingField({ ...editingField, label: e.target.value })}
                      placeholder="Field label"
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      value={editingField.fieldKey}
                      onChange={e => setEditingField({ ...editingField, fieldKey: e.target.value })}
                      placeholder="Field key"
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={editingField.type}
                      onChange={e => setEditingField({ ...editingField, type: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <select
                      value={editingField.sectionId || ''}
                      onChange={e => setEditingField({ ...editingField, sectionId: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Section</option>
                      {getCurrentSections().map(section => (
                        <option key={section.id} value={section.id}>{section.title}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    value={editingField.placeholder || ''}
                    onChange={e => setEditingField({ ...editingField, placeholder: e.target.value })}
                    placeholder="Placeholder text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    value={editingField.helpText || ''}
                    onChange={e => setEditingField({ ...editingField, helpText: e.target.value })}
                    placeholder="Help text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={editingField.order || ''}
                      onChange={e => setEditingField({ ...editingField, order: parseInt(e.target.value) || '' })}
                      placeholder="Order"
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingField.isRequired || false}
                        onChange={e => setEditingField({ ...editingField, isRequired: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Required</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button type="button" onClick={() => setEditingField(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={() => updateField(editingField.id, editingField)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">Save</button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Form Preview</h3>
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{name}</h4>
                    {description && <p className="text-gray-600 mt-1">{description}</p>}
                  </div>

                  {/* Sub-services preview */}
                  {hasSubServices && subServices.length > 0 ? (
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-md font-semibold text-blue-900 mb-2">Step 1: Service Selection</h4>
                        <p className="text-sm text-blue-700 mb-3">Users will first select their service type:</p>
                        <div className="space-y-2">
                          {subServices.map(subService => (
                            <div key={subService.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                              <input type="radio" name="subService" className="text-blue-600" disabled />
                              <div className="flex items-center space-x-2">
                                <div>
                                  <span className="font-medium text-gray-900">{subService.name}</span>
                                  {subService.description && (
                                    <p className="text-sm text-gray-600">{subService.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Show preview for selected sub-service */}
                      {selectedSubService && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-md font-semibold text-green-900">
                              Step 2: Form for "{selectedSubService.name}"
                            </h4>
                            <select 
                              value={selectedSubService.id} 
                              onChange={e => {
                                const selected = subServices.find(s => s.id === e.target.value)
                                setSelectedSubService(selected)
                              }}
                              className="text-sm border border-green-300 rounded px-2 py-1 bg-white"
                            >
                              {subServices.map(subService => (
                                <option key={subService.id} value={subService.id}>
                                  {subService.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Debug info */}
                          <div className="text-xs text-green-700 mb-2">
                            Debug: {getCurrentSections().length} sections, {getCurrentFields().length} fields for {selectedSubService.name}
                          </div>
                          
                          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                            {getCurrentSections().length > 0 ? (
                              // Render by sections
                              getCurrentSections()
                                .sort((a, b) => (a.order || 0) - (b.order || 0))
                                .map(section => {
                                  const sectionFields = getCurrentFields()
                                    ?.filter(f => f.sectionId === section.id)
                                    ?.sort((a, b) => (a.order || 0) - (b.order || 0)) || []
                                  
                                  return (
                                    <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                                      <div className="border-b border-gray-200 pb-3 mb-4">
                                        <h5 className="text-lg font-semibold text-gray-900">{section.title}</h5>
                                        {section.description && (
                                          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                                        )}
                                      </div>
                                      <div className="space-y-4">
                                        {sectionFields.map((field) => (
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
                                      </div>
                                    </div>
                                  )
                                })
                            ) : getCurrentFields().length > 0 ? (
                              // Render fields without sections
                              getCurrentFields()
                                ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                                ?.map((field) => (
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
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <p>No sections or fields configured for this sub-service yet.</p>
                                <p className="text-sm mt-1">Go to the Sections and Fields tabs to add content.</p>
                              </div>
                            )}

                            {/* Fields not assigned to any section */}
                            {getCurrentSections().length > 0 && 
                             getCurrentFields()?.filter(f => !f.sectionId).length > 0 && (
                              <div className="border border-gray-200 rounded-lg p-4">
                                <div className="border-b border-gray-200 pb-3 mb-4">
                                  <h5 className="text-lg font-semibold text-gray-900">Other Fields</h5>
                                  <p className="text-sm text-gray-600 mt-1">Fields not assigned to any section</p>
                                </div>
                                <div className="space-y-4">
                                  {getCurrentFields()
                                    ?.filter(f => !f.sectionId)
                                    ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                                    ?.map((field) => (
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
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {!selectedSubService && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-yellow-800 mb-2">
                            Select a sub-service from the Sub-Services tab to preview its specific form structure.
                          </p>
                          <div className="text-xs text-yellow-700">
                            Available sub-services: {subServices.map(s => s.name).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Regular form preview */
                    <>
                      {/* Check if form has sections */}
                      {sections && sections.length > 0 ? (
                        // Render by sections
                        sections
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map(section => {
                            const sectionFields = fields
                              ?.filter(f => f.sectionId === section.id)
                              ?.sort((a, b) => (a.order || 0) - (b.order || 0)) || []
                            
                            if (sectionFields.length === 0) return null
                            
                            return (
                              <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="border-b border-gray-200 pb-3 mb-4">
                                  <h5 className="text-lg font-semibold text-gray-900">{section.title}</h5>
                                  {section.description && (
                                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                                  )}
                                </div>
                                <div className="space-y-4">
                                  {sectionFields.map((field) => (
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
                                </div>
                              </div>
                            )
                          })
                      ) : (
                        // Render fields without sections (legacy)
                        fields
                          ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                          ?.map((field) => (
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
                        ))
                      )}

                      {/* Fields not assigned to any section */}
                      {sections && sections.length > 0 && 
                       fields?.filter(f => !f.sectionId).length > 0 && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="border-b border-gray-200 pb-3 mb-4">
                            <h5 className="text-lg font-semibold text-gray-900">Other Fields</h5>
                            <p className="text-sm text-gray-600 mt-1">Fields not assigned to any section</p>
                          </div>
                          <div className="space-y-4">
                            {fields
                              ?.filter(f => !f.sectionId)
                              ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                              ?.map((field) => (
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
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium" disabled>
                      Submit Form
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50">
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
  const [hasSubServices, setHasSubServices] = useState(false)
  const [subServices, setSubServices] = useState([])
  const [subServiceForms, setSubServiceForms] = useState({})
  const [sections, setSections] = useState([])
  const [fields, setFields] = useState([])
  const [newField, setNewField] = useState({ label: '', fieldKey: '', type: 'text', isRequired: false, placeholder: '', helpText: '', order: '', options: [], sectionId: '' })
  const [newOption, setNewOption] = useState('')
  const [newSection, setNewSection] = useState({ title: '', description: '', order: '' })
  const [newSubService, setNewSubService] = useState({ name: '', description: '' })
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

  // Sub-services management
  const addSubService = () => {
    if (!newSubService.name.trim()) return
    const subServiceId = `sub_service_${Date.now()}`
    
    const newSubServiceObj = { 
      id: subServiceId, 
      name: newSubService.name, 
      description: newSubService.description
    }
    
    setSubServices([...subServices, newSubServiceObj])
    
    // Initialize empty form structure for this sub-service
    setSubServiceForms({
      ...subServiceForms,
      [subServiceId]: {
        sections: [],
        fields: []
      }
    })
    
    setNewSubService({ name: '', description: '' })
  }

  const removeSubService = (subServiceId) => {
    setSubServices(subServices.filter(s => s.id !== subServiceId))
    
    // Remove the form data for this sub-service
    const updatedForms = { ...subServiceForms }
    delete updatedForms[subServiceId]
    setSubServiceForms(updatedForms)
  }

  // Sections management
  const addSection = () => {
    if (!newSection.title.trim()) return
    const sectionId = `section_${Date.now()}`
    const sectionOrder = newSection.order !== '' ? newSection.order : sections.length + 1
    
    setSections([...sections, { 
      id: sectionId, 
      title: newSection.title, 
      description: newSection.description,
      order: sectionOrder 
    }])
    setNewSection({ title: '', description: '', order: '' })
  }

  const removeSection = (sectionId) => {
    setSections(sections.filter(s => s.id !== sectionId))
    // Remove fields that belong to this section
    setFields(fields.filter(f => f.sectionId !== sectionId))
  }

  // Fields management
  const addField = () => {
    if (!newField.label.trim() || !newField.fieldKey.trim()) return
    if (fields.some(f => f.fieldKey === newField.fieldKey)) {
      setError('Field key must be unique')
      return
    }
    
    // Use manual order if provided, otherwise use automatic order
    const fieldOrder = newField.order !== '' ? newField.order : fields.length + 1
    
    setFields([...fields, { ...newField, order: fieldOrder, id: `new_${Date.now()}` }])
    setNewField({ label: '', fieldKey: '', type: 'text', isRequired: false, placeholder: '', helpText: '', order: '', options: [], sectionId: '' })
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
      // Prepare data in the format expected by backend
      const formData = { 
        name, 
        categoryId, 
        description, 
        isActive,
        hasSubServices,
        subServices: hasSubServices ? subServices : [],
        subServiceForms: hasSubServices ? subServiceForms : {},
        formSections: (!hasSubServices && sections.length > 0) ? sections.map(section => ({
          sectionTitle: section.title,
          sectionDescription: section.description,
          sectionOrder: section.order,
          sectionFields: fields
            .filter(f => f.sectionId === section.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((f, i) => ({ ...f, fieldOrder: f.order || i + 1 }))
        })) : undefined,
        // Fallback to legacy format if no sections and no sub-services
        fields: (!hasSubServices && sections.length === 0) ? fields
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((f, i) => ({ ...f, order: f.order || i + 1 })) : undefined
      }
      
      await onSave(formData)
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

          {/* Sub-Services Toggle */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <input 
                type="checkbox" 
                id="hasSubServices" 
                checked={hasSubServices} 
                onChange={e => setHasSubServices(e.target.checked)} 
                className="rounded" 
              />
              <label htmlFor="hasSubServices" className="text-sm font-medium text-gray-700">
                Enable Sub-Services (Multiple service types under this category)
              </label>
            </div>

            {hasSubServices && (
              <div className="bg-purple-50 rounded-lg p-4 space-y-3 mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Sub-Services ({subServices.length})</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    value={newSubService.name}
                    onChange={e => setNewSubService({ ...newSubService, name: e.target.value })}
                    placeholder="Sub-service name *"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                  />
                  <input 
                    value={newSubService.description}
                    onChange={e => setNewSubService({ ...newSubService, description: e.target.value })}
                    placeholder="Description (optional)"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={addSubService}
                    disabled={!newSubService.name.trim()}
                    className="bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg text-sm flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" /><span>Add Sub-Service</span>
                  </button>
                </div>

                {subServices.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {subServices.map((subService, i) => (
                      <div key={subService.id} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded text-xs font-mono">
                              #{i + 1}
                            </span>
                            <span className="text-gray-800 font-medium">{subService.name}</span>
                            {subService.description && (
                              <span className="text-gray-500 text-xs">- {subService.description}</span>
                            )}
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeSubService(subService.id)} 
                            className="text-red-400 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add Sections */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Form Sections ({sections.length})</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-3">
              <div className="grid grid-cols-3 gap-2">
                <input 
                  value={newSection.title}
                  onChange={e => setNewSection({ ...newSection, title: e.target.value })}
                  placeholder="Section title *"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                />
                <input 
                  value={newSection.description}
                  onChange={e => setNewSection({ ...newSection, description: e.target.value })}
                  placeholder="Description (optional)"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                />
                <input 
                  type="number"
                  value={newSection.order}
                  onChange={e => setNewSection({ ...newSection, order: parseInt(e.target.value) || '' })}
                  placeholder="Order (e.g. 1)"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={addSection}
                  disabled={!newSection.title.trim()}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg text-sm flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" /><span>Add Section</span>
                </button>
              </div>
            </div>

            {sections.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto mb-4">
                {sections
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((section, i) => (
                  <div key={section.id} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-mono">
                          #{section.order || i + 1}
                        </span>
                        <span className="text-gray-800 font-medium">{section.title}</span>
                        {section.description && (
                          <span className="text-gray-500 text-xs">- {section.description}</span>
                        )}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeSection(section.id)} 
                        className="text-red-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              <div className="grid grid-cols-3 gap-2">
                <select value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value, options: e.target.value === 'dropdown' || e.target.value === 'multi_select' ? newField.options : [] })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <select 
                  value={newField.sectionId} 
                  onChange={e => setNewField({ ...newField, sectionId: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Section</option>
                  {sections
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map(section => (
                    <option key={section.id} value={section.id}>{section.title}</option>
                  ))}
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
                        {f.sectionId && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                            {sections.find(s => s.id === f.sectionId)?.title || 'Unknown Section'}
                          </span>
                        )}
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
          {(fields.length > 0 || sections.length > 0 || subServices.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Form Preview</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-6 max-h-96 overflow-y-auto">
                {/* Sub-services preview */}
                {hasSubServices && subServices.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="text-md font-semibold text-blue-900 mb-2">Step 1: Service Selection</h4>
                    <p className="text-sm text-blue-700 mb-3">Users will first select their service type:</p>
                    <div className="space-y-2">
                      {subServices.map(subService => (
                        <div key={subService.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                          <input type="radio" name="subService" className="text-blue-600" disabled />
                          <div>
                            <span className="font-medium text-gray-900">{subService.name}</span>
                            {subService.description && (
                              <p className="text-sm text-gray-600">{subService.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular form preview */}
                {sections.length > 0 ? (
                  // Render by sections
                  sections
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map(section => {
                      const sectionFields = fields
                        .filter(f => f.sectionId === section.id)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                      
                      if (sectionFields.length === 0) return null
                      
                      return (
                        <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="border-b border-gray-200 pb-3 mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">{section.title}</h4>
                            {section.description && (
                              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                            )}
                          </div>
                          <div className="space-y-4">
                            {sectionFields.map((field) => (
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
                      )
                    })
                ) : (
                  // Render fields without sections (legacy)
                  fields.map((field, index) => (
                    <div key={field.id} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderFieldPreview(field)}
                    </div>
                  ))
                )}
                
                {/* Fields not assigned to any section */}
                {sections.length > 0 && fields.filter(f => !f.sectionId).length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="border-b border-gray-200 pb-3 mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Other Fields</h4>
                      <p className="text-sm text-gray-600 mt-1">Fields not assigned to any section</p>
                    </div>
                    <div className="space-y-4">
                      {fields
                        .filter(f => !f.sectionId)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((field) => (
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
          sections: f.metadata?.sections?.length || 0,
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
        setViewForm({ 
          ...form, 
          fieldList: f.fields || [], 
          description: f.description,
          metadata: f.metadata || null
        })
      }
    } catch { 
      setViewForm(form) 
    }
  }

  const handleEditOpen = async (form) => {
    try {
      const res = await serviceFormApi.getFormById(form.id)
      if (res.data.success) {
        const f = res.data.data ?? res.data
        setEditForm({ 
          ...form, 
          description: f.description,
          fieldList: f.fields || [], 
          metadata: {
            ...f.metadata,
            subServiceForms: f.metadata?.subServiceForms || {}
          }
        })
      }
    } catch { 
      setEditForm({ 
        ...form, 
        fieldList: [], 
        metadata: {
          subServiceForms: {}
        }
      }) 
    }
  }

  const handleEditSave = async (id, data) => {
    try {
      // Prepare comprehensive form data for update
      const updateData = {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        hasSubServices: data.hasSubServices,
        subServices: data.subServices || [],
        subServiceForms: data.subServiceForms || {},
        formSections: (!data.hasSubServices && data.sections && data.sections.length > 0) ? data.sections.map(section => ({
          sectionTitle: section.title,
          sectionDescription: section.description,
          sectionOrder: section.order,
          sectionFields: data.fields
            ?.filter(f => f.sectionId === section.id)
            ?.sort((a, b) => (a.order || 0) - (b.order || 0))
            ?.map((f, i) => ({ ...f, fieldOrder: f.order || i + 1 })) || []
        })) : undefined,
        // Fallback to legacy format if no sections and no sub-services
        fields: (!data.hasSubServices && (!data.sections || data.sections.length === 0) && data.fields) ? data.fields
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((f, i) => ({ ...f, order: f.order || i + 1 })) : undefined
      }
      
      await serviceFormApi.updateForm(id, updateData)
      await fetchForms()
      showSuccess('Form updated successfully')
    } catch (error) {
      console.error('Error updating form:', error)
      showError(error.response?.data?.message || 'Failed to update form')
      throw error // Re-throw to let modal handle it
    }
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
                    <span className="text-gray-500">Sections:</span>
                    <span className="font-medium">{form.sections || 0}</span>
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
                    title="Edit form structure, fields, and sections"
                  >
                    <Settings className="w-4 h-4 mr-1" />Edit
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
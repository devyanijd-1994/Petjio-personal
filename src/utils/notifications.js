// Simple notification utility
export const showNotification = (message, type = 'info') => {
  // For now, use browser alert
  // In production, you'd want to use a proper toast library
  if (type === 'error') {
    alert(`Error: ${message}`)
  } else if (type === 'success') {
    alert(`Success: ${message}`)
  } else {
    alert(message)
  }
}

export const showSuccess = (message) => showNotification(message, 'success')
export const showError = (message) => showNotification(message, 'error')
export const showInfo = (message) => showNotification(message, 'info')

import toast from 'react-hot-toast'

const DEFAULT_DURATION = 3000

export const notify = {
  success(message = 'Operation completed successfully') {
    return toast.success(message, {
      duration: DEFAULT_DURATION,
    })
  },

  error(message = 'Something went wrong') {
    return toast.error(message, {
      duration: 4500,
    })
  },

  loading(message = 'Please wait...') {
    return toast.loading(message)
  },

  info(message = '') {
    return toast(message, {
      duration: DEFAULT_DURATION,
      icon: 'ℹ️',
    })
  },

  warning(message = '') {
    return toast(message, {
      duration: 4000,
      icon: '⚠️',
    })
  },

  dismiss(toastId) {
    toast.dismiss(toastId)
  },

  dismissAll() {
    toast.dismiss()
  },

  promise(promise, messages) {
    return toast.promise(promise, {
      loading: messages.loading || 'Processing...',
      success: messages.success || 'Completed successfully!',
      error: messages.error || 'Operation failed.',
    })
  },
}

export default notify

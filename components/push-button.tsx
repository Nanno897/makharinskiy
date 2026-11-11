'use client'

import { useState } from 'react'

export function PushButton() {
  const [status, setStatus] = useState<string>('')

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Notifications are not supported on this device/browser.')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setStatus('Notifications Enabled!')
        alert('Notifications enabled successfully!')
      } else {
        setStatus('Permission Denied')
        alert('Permission was denied for notifications.')
      }
    } catch (error) {
      console.error(error)
      alert('Error enabling notifications.')
    }
  }

  return (
    <div className="p-4 text-center">
      <button
        onClick={requestPermission}
        className="w-full max-w-xs px-4 py-3 bg-red-700 text-amber-400 font-semibold rounded-xl shadow-md active:scale-95 transition-all"
      >
        {status || 'Enable Push Notifications'}
      </button>
    </div>
  )
}

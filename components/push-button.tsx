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
        setStatus('enabled')
        alert('Notifications enabled successfully!')
      } else {
        setStatus('denied')
        alert('Permission was denied for notifications.')
      }
    } catch (error) {
      console.error(error)
      alert('Error enabling notifications.')
    }
  }

  return (
    <div className="flex justify-end p-3">
      <button
        onClick={requestPermission}
        title="Enable Push Notifications"
        className="p-2 bg-neutral-900 border border-neutral-800 text-amber-400 rounded-full shadow-md active:scale-95 transition-all flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill={status === 'enabled' ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </button>
    </div>
  )
}

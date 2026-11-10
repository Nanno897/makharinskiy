import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MAKHARINSKIY',
    short_name: 'MAKHARINSKIY',
    description: 'Shopping, schedule, tasks and chat for the Makharinskiy family.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      { src: '/logo.jpg', sizes: '512x512', type: 'image/jpeg', purpose: 'any' },
      { src: '/logo.jpg', sizes: '512x512', type: 'image/jpeg', purpose: 'maskable' },
    ],
  }
}

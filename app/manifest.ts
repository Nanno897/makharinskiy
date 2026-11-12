import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MAKHARINSKIY',
    short_name: 'MAKHARINSKIY',
    description: 'Shopping, schedule, tasks and chat for the Makharinskiy family.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/app-icon-final.png', // Update filename
        sizes: '1024x1024',
        type: 'image/png', // Must be PNG
        purpose: 'maskable',
      },
    ],
  }
}

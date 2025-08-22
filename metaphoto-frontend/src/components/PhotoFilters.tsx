'use client'

import { PhotoFiltersModel } from '@/types'

interface PhotoFiltersProps {
  filters: PhotoFiltersModel
  onFiltersChange: (filters: PhotoFiltersModel) => void
}

export default function PhotoFilters({ filters, onFiltersChange }: PhotoFiltersProps) {
  const handleInputChange = (key: keyof PhotoFiltersModel, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    })
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border dark:border-gray-700 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Photo Title</label>
          <input
            type="text"
            value={filters.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Search in photo titles..."
            className="w-full px-3 py-2 border dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Album Title</label>
          <input
            type="text"
            value={filters['album.title'] || ''}
            onChange={(e) => handleInputChange('album.title', e.target.value)}
            placeholder="Search in album titles..."
            className="w-full px-3 py-2 border dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">User Email</label>
          <input
            type="email"
            value={filters['album.user.email'] || ''}
            onChange={(e) => handleInputChange('album.user.email', e.target.value)}
            placeholder="user@example.com"
            className="w-full px-3 py-2 border dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>
    </div>
  )
}
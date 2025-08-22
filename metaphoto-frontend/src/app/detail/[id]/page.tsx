'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import {PhotoModel} from "@/types";

export default function PhotoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const photoId = parseInt(params.id as string)

  const [photo, setPhoto] = useState<PhotoModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const queryString = searchParams.toString()
  const backUrl = queryString ? `/?${queryString}` : '/'

  useEffect(() => {
    const loadPhoto = async () => {
      try {
        setLoading(true)
        const data = await api.getPhoto(photoId)
        setPhoto(data)
      } catch (error: any) {
        setError('Photo not found')
      } finally {
        setLoading(false)
      }
    }

    if (photoId) {
      loadPhoto()
    }
  }, [photoId])

  if (loading) return <div className="p-8">Loading photo...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!photo) return <div className="p-8">Photo not found</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with back button */}
      <div className="mb-6">
        <Link
          href={backUrl}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 inline-block"
        >
          ← Back to search
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Photo Detail</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <img
            src={photo.url}
            alt={photo.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Photo</h2>
            <p className="text-gray-600 dark:text-gray-300">{photo.title}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Album</h2>
            <p className="text-gray-600 dark:text-gray-300">{photo.album.title}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">User</h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-2">
              <p><strong>Name:</strong> {photo.album.user.name}</p>
              <p><strong>Email:</strong> {photo.album.user.email}</p>
              <p><strong>Phone:</strong> {photo.album.user.phone}</p>
              <p><strong>Website:</strong> {photo.album.user.website}</p>
              <p><strong>Company:</strong> {photo.album.user.company.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import {useEffect, useRef, useState} from 'react'
import { api } from '@/lib/api'
import PhotoFilters from '@/components/PhotoFilters'
import {PhotoModel, PhotoFiltersModel} from "@/types";
import PhotoPagination from "@/components/PhotoPagination";
import {useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";

export default function Home() {
  const [photos, setPhotos] = useState<PhotoModel[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<PhotoFiltersModel>({ limit: 25, offset: 0 })
  const [hasNextPage, setHasNextPage] = useState(true)
  const [debouncedFilters, setDebouncedFilters] = useState<PhotoFiltersModel>(filters)
  const abortControllerRef = useRef<AbortController | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [reachedEnd, setReachedEnd] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  const loadPhotos = async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      setLoading(true)
      const data = await api.getPhotos(debouncedFilters, abortControllerRef.current.signal)

      if (data.length === 0 && debouncedFilters.offset! > 0) {
        const currentPage = Math.floor(debouncedFilters.offset! / debouncedFilters.limit!) + 1
        const previousPage = currentPage - 1
        setReachedEnd(true)
        setFilters({
          ...debouncedFilters,
          offset: (previousPage - 1) * debouncedFilters.limit!
        })
        return
      }

      setPhotos(data)

      setHasNextPage(!reachedEnd && data.length === debouncedFilters.limit)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Failed to load photos:', error)
        setPhotos([])
        setHasNextPage(false)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPhotos()
  }, [debouncedFilters])

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 500)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [filters])

  useEffect(() => {
    const urlFilters: PhotoFiltersModel = {
      title: searchParams.get('title') || undefined,
      'album.title': searchParams.get('album.title') || undefined,
      'album.user.email': searchParams.get('album.user.email') || undefined,
      limit: parseInt(searchParams.get('limit') || '25'),
      offset: parseInt(searchParams.get('offset') || '0')
    }
    setFilters(urlFilters)
  }, [])

  const handleFiltersChange = (newFilters: PhotoFiltersModel) => {
    setReachedEnd(false)
    const filtersWithReset = { ...newFilters, offset: 0 }
    setFilters(filtersWithReset)
    updateUrl(filtersWithReset)
  }

  const updateUrl = (newFilters: PhotoFiltersModel) => {
    const params = new URLSearchParams()

    if (newFilters.title) params.set('title', newFilters.title)
    if (newFilters['album.title']) params.set('album.title', newFilters['album.title'])
    if (newFilters['album.user.email']) params.set('album.user.email', newFilters['album.user.email'])
    if (newFilters.limit && newFilters.limit !== 25) params.set('limit', newFilters.limit.toString())
    if (newFilters.offset && newFilters.offset > 0) params.set('offset', newFilters.offset.toString())

    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : '/')
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">MetaPhoto</h1>

      <PhotoFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {loading && <div className="text-center py-8">Loading...</div>}

      <PhotoPagination
        currentPage={Math.floor(filters.offset! / filters.limit!) + 1}
        itemsPerPage={filters.limit!}
        hasNextPage={hasNextPage}
        onPageChange={(page) => {
          const newFilters = { ...filters, offset: (page - 1) * filters.limit! }
          setFilters(newFilters)
          updateUrl(newFilters)
        }}
        onLimitChange={(limit) => {
          const newFilters = { ...filters, limit, offset: 0 }
          setFilters(newFilters)
          updateUrl(newFilters)
        }}
      />

      <div className="text-sm text-gray-600 mb-4">
        Found {photos.length} photos
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map(photo => (
          <Link
            key={photo.id}
            href={`/detail/${photo.id}?${searchParams.toString()}`}
            className="border rounded p-4 hover:bg-gray-50 dark:hover:bg-gray-800 block"
          >
            <img
              src={photo.thumbnailUrl}
              alt={photo.title}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <h3 className="font-medium text-sm mb-1 line-clamp-2">{photo.title}</h3>
            <p className="text-xs text-gray-600">Album: {photo.album.title}</p>
            <p className="text-xs text-gray-600">By: {photo.album.user.name}</p>
          </Link>
        ))}
      </div>

      <PhotoPagination
        currentPage={Math.floor(filters.offset! / filters.limit!) + 1}
        itemsPerPage={filters.limit!}
        hasNextPage={hasNextPage}
        onPageChange={(page) => {
          const newFilters = { ...filters, offset: (page - 1) * filters.limit! }
          setFilters(newFilters)
          updateUrl(newFilters)
        }}
        onLimitChange={(limit) => {
          const newFilters = { ...filters, limit, offset: 0 }
          setFilters(newFilters)
          updateUrl(newFilters)
        }}
      />
    </div>
  )
}
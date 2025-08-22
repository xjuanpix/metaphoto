'use client'

interface PhotoPaginationProps {
  currentPage: number
  itemsPerPage: number
  hasNextPage: boolean
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export default function PhotoPagination({
                                          currentPage,
                                          itemsPerPage,
                                          hasNextPage,
                                          onPageChange,
                                          onLimitChange
                                        }: PhotoPaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Items per page selector */}
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-700 dark:text-gray-300">Show:</label>
        <select
          value={itemsPerPage}
          onChange={(e) => onLimitChange(parseInt(e.target.value))}
          className="px-2 py-1 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>

      {/* Page info and controls */}
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage}
        </span>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            ‹ Previous
          </button>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className="px-3 py-1 border dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  )
}
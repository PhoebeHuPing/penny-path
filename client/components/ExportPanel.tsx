import { useState } from 'react'
import api from '../api'

const ExportPanel: React.FC = () => {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState<'csv' | 'pdf' | null>(null)
  const [error, setError] = useState('')

  const handleExport = async (format: 'csv' | 'pdf') => {
    setLoading(format)
    setError('')

    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)

      const queryString = params.toString()
      const url = `/api/export/${format}${queryString ? `?${queryString}` : ''}`

      const response = await api.get(url, { responseType: 'blob' })

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition']
      let filename = `pennypath_export.${format}`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/)
        if (match) filename = match[1]
      }

      // Trigger file download
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf',
      })
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      setError('Export failed. Please try again.')
      console.error('Export error:', err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="expense-card" aria-labelledby="export-heading">
      <h2 id="export-heading" className="text-lg font-bold text-slate-800 mb-4">
        Export Data
      </h2>

      <p className="text-sm text-slate-500 mb-4">
        Download your financial records as CSV or PDF for tax filing or personal archives.
      </p>

      {/* Date range filter */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label htmlFor="export-date-from" className="block text-xs font-medium text-slate-600 mb-1">
            From
          </label>
          <input
            id="export-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="export-date-to" className="block text-xs font-medium text-slate-600 mb-1">
            To
          </label>
          <input
            id="export-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-3" role="alert">
          {error}
        </p>
      )}

      {/* Export buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => handleExport('csv')}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Export as CSV"
        >
          {loading === 'csv' ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          )}
          CSV
        </button>
        <button
          onClick={() => handleExport('pdf')}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Export as PDF"
        >
          {loading === 'pdf' ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          )}
          PDF
        </button>
      </div>
    </section>
  )
}

export default ExportPanel

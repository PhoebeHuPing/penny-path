import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import {
  fetchExpenses,
  setFilters,
  clearFilters,
  type ExpenseFilters,
} from '../modules/expenseSlice'

const SearchFilter: React.FC = () => {
  const dispatch = useAppDispatch()
  const { filters } = useAppSelector((state) => state.expenses)
  const { categoryList } = useAppSelector((state) => state.category)

  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<ExpenseFilters>({
    keyword: filters.keyword || '',
    category_id: filters.category_id || null,
    date_from: filters.date_from || '',
    date_to: filters.date_to || '',
    amount_min: filters.amount_min || null,
    amount_max: filters.amount_max || null,
  })

  const hasActiveFilters =
    filters.keyword ||
    filters.category_id != null ||
    filters.date_from ||
    filters.date_to ||
    filters.amount_min != null ||
    filters.amount_max != null

  const handleSearch = () => {
    // Clean up empty values
    const cleanFilters: ExpenseFilters = {}
    if (localFilters.keyword?.trim()) cleanFilters.keyword = localFilters.keyword.trim()
    if (localFilters.category_id != null) cleanFilters.category_id = localFilters.category_id
    if (localFilters.date_from) cleanFilters.date_from = localFilters.date_from
    if (localFilters.date_to) cleanFilters.date_to = localFilters.date_to
    if (localFilters.amount_min != null) cleanFilters.amount_min = localFilters.amount_min
    if (localFilters.amount_max != null) cleanFilters.amount_max = localFilters.amount_max

    dispatch(setFilters(cleanFilters))
    dispatch(fetchExpenses(1, cleanFilters))
  }

  const handleClear = () => {
    setLocalFilters({
      keyword: '',
      category_id: null,
      date_from: '',
      date_to: '',
      amount_min: null,
      amount_max: null,
    })
    dispatch(clearFilters())
    dispatch(fetchExpenses(1, {}))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="expense-card mb-4">
      {/* Search bar - always visible */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by location..."
            value={localFilters.keyword || ''}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, keyword: e.target.value })
            }
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all text-sm"
            aria-label="Search transactions by location"
          />
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            isExpanded || hasActiveFilters
              ? 'border-brand text-brand bg-brand/5'
              : 'border-slate-200 text-slate-500 hover:border-brand hover:text-brand'
          }`}
          aria-label="Toggle advanced filters"
          aria-expanded={isExpanded}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-brand text-white font-semibold rounded-xl hover:bg-brand/90 transition-all cursor-pointer text-sm"
          aria-label="Apply search filters"
        >
          Search
        </button>
      </div>

      {/* Advanced filters - collapsible */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Category filter */}
            <div>
              <label
                htmlFor="filter-category"
                className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
              >
                Category
              </label>
              <select
                id="filter-category"
                value={localFilters.category_id ?? ''}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    category_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all text-sm"
              >
                <option value="">All Categories</option>
                {categoryList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date from */}
            <div>
              <label
                htmlFor="filter-date-from"
                className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
              >
                From Date
              </label>
              <input
                id="filter-date-from"
                type="date"
                value={localFilters.date_from || ''}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, date_from: e.target.value || null })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all text-sm"
              />
            </div>

            {/* Date to */}
            <div>
              <label
                htmlFor="filter-date-to"
                className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
              >
                To Date
              </label>
              <input
                id="filter-date-to"
                type="date"
                value={localFilters.date_to || ''}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, date_to: e.target.value || null })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all text-sm"
              />
            </div>

            {/* Amount range */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Amount Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localFilters.amount_min ?? ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      amount_min: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  onKeyDown={handleKeyDown}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all text-sm"
                  aria-label="Minimum amount"
                />
                <span className="text-slate-400 font-bold">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localFilters.amount_max ?? ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      amount_max: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  onKeyDown={handleKeyDown}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all text-sm"
                  aria-label="Maximum amount"
                />
              </div>
            </div>
          </div>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleClear}
                className="text-sm text-slate-500 hover:text-red-500 font-medium transition-colors cursor-pointer"
                aria-label="Clear all filters"
              >
                ✕ Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchFilter

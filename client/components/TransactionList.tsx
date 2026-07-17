import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchExpenses, removeExpense, PAGE_SIZE } from '../modules/expenseSlice'

const TransactionList: React.FC = () => {
  const { expenses, loading, page, totalCount } = useAppSelector(
    (state) => state.expenses,
  )
  const { categoryList } = useAppSelector((state) => state.category)
  const dispatch = useAppDispatch()

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const getCategoryName = (id: number) =>
    categoryList.find((c) => c.id === id)?.name || 'Unknown'

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    dispatch(fetchExpenses(newPage))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="expense-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          Recent Transactions
        </h2>
        <span className="text-sm font-semibold text-brand bg-brand/10 px-3 py-1 rounded-full">
          {totalCount} Records
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-12">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-medium">Syncing data...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">💸</div>
          <p className="text-slate-400 font-medium">
            No records yet. Start tracking!
          </p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {expenses.map((exp) => (
              <li
                key={exp.id}
                className="group flex items-center justify-between py-4 transition-all hover:px-2 hover:bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg group-hover:bg-white transition-colors">
                    {getCategoryName(exp.category_id).charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {exp.location}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {exp.date}
                      </span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-xs font-bold text-brand uppercase tracking-wider">
                        {getCategoryName(exp.category_id)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-black text-slate-800">
                    $
                    {exp.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <button
                    onClick={() => dispatch(removeExpense(exp.id))}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all cursor-pointer"
                    title="Delete transaction"
                    aria-label={`Delete transaction at ${exp.location} for $${exp.amount.toFixed(2)}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="flex items-center justify-between pt-6 border-t border-slate-100 mt-4"
            >
              <p className="text-xs font-semibold text-slate-400">
                Page {page} of {totalPages} · {totalCount} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  aria-label="Go to previous page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {Array.from(
                  { length: Math.min(5, totalPages) },
                  (_, i) => {
                    let startPage = Math.max(1, page - 2)
                    const endPage = Math.min(totalPages, startPage + 4)
                    startPage = Math.max(1, endPage - 4)
                    return startPage + i
                  },
                )
                  .filter((p) => p >= 1 && p <= totalPages)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      aria-label={`Go to page ${p}`}
                      aria-current={p === page ? 'page' : undefined}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                        p === page
                          ? 'bg-brand text-white shadow-sm shadow-brand/30'
                          : 'border border-slate-200 text-slate-500 hover:border-brand hover:text-brand'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  aria-label="Go to next page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </nav>
          )}
        </div>
      )}
    </section>
  )
}

export default TransactionList

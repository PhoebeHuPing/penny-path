import { useMemo } from 'react'
import { useAppSelector } from '../hooks'

const StatsPanel: React.FC = () => {
  const { allExpenses } = useAppSelector((state) => state.expenses)
  const { categoryList } = useAppSelector((state) => state.category)

  const { totalSpent, averageSpend, topCategoryName } = useMemo(() => {
    const total = allExpenses.reduce((acc, curr) => acc + curr.amount, 0)
    const average = allExpenses.length > 0 ? total / allExpenses.length : 0

    const categorySpending = allExpenses.reduce(
      (acc: Record<number, number>, curr) => {
        acc[curr.category_id] = (acc[curr.category_id] || 0) + curr.amount
        return acc
      },
      {},
    )

    let topCatId = -1
    let maxSpend = 0
    Object.entries(categorySpending).forEach(([catIdStr, spend]) => {
      if (spend > maxSpend) {
        maxSpend = spend
        topCatId = parseInt(catIdStr)
      }
    })

    const topName =
      topCatId !== -1
        ? categoryList.find((c) => c.id === topCatId)?.name || 'Unknown'
        : 'None'

    return { totalSpent: total, averageSpend: average, topCategoryName: topName }
  }, [allExpenses, categoryList])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gradient-to-br from-brand/5 to-brand/10 p-6 rounded-2xl border border-brand/10">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
          Total Spent
        </p>
        <p className="text-3xl font-black text-slate-800">
          ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
          Average / Transaction
        </p>
        <p className="text-3xl font-black text-slate-800">
          $
          {averageSpend.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
          Top Category
        </p>
        <p className="text-3xl font-black text-brand">{topCategoryName}</p>
      </div>
    </div>
  )
}

export default StatsPanel

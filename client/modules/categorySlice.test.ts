import { describe, it, expect } from 'vitest'
import reducer from './categorySlice'
import type { CategoryItem } from './categorySlice'

const initialState = {
  categoryList: [],
}

describe('categorySlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setCategoryList', () => {
    const categories: CategoryItem[] = [
      { id: 1, name: 'Food' },
      { id: 2, name: 'Transport' },
      { id: 3, name: 'Shopping' },
    ]
    const state = reducer(
      initialState,
      { type: 'categoryList/setCategoryList', payload: categories },
    )
    expect(state.categoryList).toEqual(categories)
  })

  it('should handle appendCategory', () => {
    const stateWithCategories = {
      categoryList: [
        { id: 1, name: 'Food' },
        { id: 2, name: 'Transport' },
      ],
    }
    const newCategory: CategoryItem = { id: 3, name: 'Entertainment' }
    const state = reducer(
      stateWithCategories,
      { type: 'categoryList/appendCategory', payload: newCategory },
    )
    expect(state.categoryList).toHaveLength(3)
    expect(state.categoryList[2]).toEqual(newCategory)
  })

  it('should replace entire category list when setCategoryList is called', () => {
    const stateWithCategories = {
      categoryList: [
        { id: 1, name: 'Food' },
        { id: 2, name: 'Transport' },
      ],
    }
    const newCategories: CategoryItem[] = [{ id: 5, name: 'Medical' }]
    const state = reducer(
      stateWithCategories,
      { type: 'categoryList/setCategoryList', payload: newCategories },
    )
    expect(state.categoryList).toEqual(newCategories)
    expect(state.categoryList).toHaveLength(1)
  })
})

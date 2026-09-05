import {LexoRank} from 'lexorank'
import {at, defineMigration, patch, set, unset} from 'sanity/migrate'

const projectTypes = ['designProject', 'photographyProject'] as const

const legacyOrder = (document: {_createdAt?: string; order?: unknown; year?: unknown}) => {
  const order = Number(document.order)
  return Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER
}

const rankForIndex = (index: number) => {
  let rank = LexoRank.min()

  for (let step = 0; step <= index; step += 1) {
    rank = rank.genNext().genNext()
  }

  return rank.toString()
}

export default defineMigration({
  title: 'Seed drag-and-drop order for portfolio projects',
  documentTypes: [...projectTypes],
  async *migrate(documents) {
    const grouped = new Map<
      string,
      Array<{_createdAt?: string; _id: string; order?: unknown; orderRank?: unknown; year?: unknown}>
    >()

    for (const type of projectTypes) grouped.set(type, [])

    for await (const document of documents()) {
      const collection = grouped.get(document._type)
      if (collection) collection.push(document)
    }

    for (const type of projectTypes) {
      const collection = grouped.get(type) ?? []

      // Do not overwrite a list that has already started using drag ordering.
      // In that case the editor can use the Studio's “Reset Order” action.
      if (!collection.length || collection.some((document) => document.orderRank)) continue

      collection.sort((a, b) => {
      const orderDifference = legacyOrder(a) - legacyOrder(b)
      if (orderDifference !== 0) return orderDifference
        const yearDifference = String(b.year ?? '').localeCompare(String(a.year ?? ''))
        if (yearDifference !== 0) return yearDifference
        return (a._createdAt ?? '').localeCompare(b._createdAt ?? '')
      })

      for (const [index, document] of collection.entries()) {
        yield patch(document._id, [
          at('orderRank', set(rankForIndex(index))),
          at('order', unset()),
        ])
      }
    }
  },
})

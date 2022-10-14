import equal from 'deep-eql'

function createDefaultFilter () {
  return {
    bbox: null,
    datetime: [],
    filters: []
  }
}

export default class SearchFilter {
  constructor () {
    this.standardFilter = createDefaultFilter()
  }

  get anyFilterPropertiesSet () {
    return !equal(this.standardFilter, createDefaultFilter()) 
  }

  get numberFilterPropertiesSet () {
    const defaultFilter = createDefaultFilter()
    let count = 0
    for (const [key, value] of Object.entries(this.standardFilter)) {
      if (!equal(value, defaultFilter[key])) count++
    }
    return count
  }

  clearFilters () {
    this.standardFilter = createDefaultFilter()
  }

  populateStacApiHelperSearchClass (searchClass, pageSize) {
    searchClass.setPageSizeLimit(pageSize)

    if (this.standardFilter.bbox !== null) searchClass.bbox(this.standardFilter.bbox)

    if (this.standardFilter.datetime.length > 0) {
      searchClass.between(this.standardFilter.datetime[0].toISOString(), this.standardFilter.datetime[1].toISOString())
    }

    if (this.standardFilter.filters.length > 0) {
      const composedFilter = {
        "filter-lang": "cql2-json",
        "filter": {
          "op": 'and',
          "args": this.standardFilter.filters.map(q => {
            return {
              op: q.operator,
              args: [{"property": q.queryable.id }, q.value ]
            }
          })
        }
      }
      searchClass.filter(composedFilter)
    }

  }

}

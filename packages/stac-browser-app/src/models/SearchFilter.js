import equal from 'deep-eql'
import dayjs from 'dayjs'

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

  get asSerialisableJson () {
    const out = {}
    if (this.standardFilter.bbox !== null) out.bbox = this.standardFilter.bbox
    if (this.standardFilter.datetime.length > 0) out.datetime = [this.standardFilter.datetime[0].toISOString(), this.standardFilter.datetime[1].toISOString()]
    if (this.standardFilter.filters.length > 0) {
      out.filters = this.standardFilter.filters.map((f) => {
        return {
          value: f.value,
          operator: f.operator,
          queryableId: f.queryable.id
        }
      })
    }

    return out
  }

  populateFromSerialisedJson (serialisedJson, collection) {
    if (serialisedJson.bbox) this.standardFilter.bbox = serialisedJson.bbox
    if (serialisedJson.datetime) this.standardFilter.datetime = [dayjs(serialisedJson.datetime[0]), dayjs(serialisedJson.datetime[1])]
    if (serialisedJson.filters) {
      serialisedJson.filters.forEach((f) => {
        this.standardFilter.filters.push({
          value: f.value,
          operator: f.operator,
          queryable: collection.getQueryableById(f.queryableId)
        })
      })
      
    }
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
    searchClass.limit(pageSize)

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

import equal from 'deep-eql'

function createDefaultFilter () {
  return {
    bbox: null,
    datetime: []
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



}

import { createStore } from 'vuex'

export default createStore({
  state () {
    return {
      allExternalCatalogs: [],
      stacItems: [],
      selectedStacId: null,
      pageResultsIndex: 1,
      searchCollection: null
    }
  },
  mutations: {
    addToAllExternalCatalogs (state, catalog) {
      state.allExternalCatalogs.push(catalog)
    },
    setPageResultsIndex (state, num) {
      state.pageResultsIndex = num
    },
    addStacThing (state, payload) {
      state.stacItems.push({
        id: payload.id,
        stacObj: payload.stacThing
      })
      // state.stacItems[payload.id] = payload.stacThing
    },
    setSelectedStacId (state, id) {
      state.selectedStacId = id
    },
    setSearchCollection (state, searchCollection) {
      state.searchCollection = searchCollection
    }
  },
  actions: {
    async addThingToStore ({ commit }, stacThing) {
      const stacUrl = stacThing.linkToSelf
      commit('addStacThing', {
        id: stacUrl,
        stacThing
      })
      if (stacThing.stacType === 'Collection') await stacThing.checkTotalNumberOfItems()
      
      // Ideally this would be in here but 
      // the Vue reactivity system doesn't seem to handle it nicely :(
      // Instead it's in the /pages/Stac.vue
      // if (stacThing.stacType !== 'Item' && !stacThing.childrenLoaded) stacThing.loadChildren()
    },
    async addOrSelectStacReferenceInStore ({ commit, dispatch, getters }, stacThing) {

      if (!getters.stacReferenceIsInStore(stacThing.linkToSelf)) {
        await dispatch('addThingToStore', stacThing)
      }

      if (stacThing.hasParent && !getters.stacReferenceIsInStore(stacThing.linkToParent)) {
        const parent = await stacThing.loadParent()
        dispatch('addThingToStore', parent)

      } else if (stacThing.hasRoot && !stacThing.isRoot && !getters.stacReferenceIsInStore(stacThing.linkToRoot)) {
        stacThing.loadRoot()
        .then(root => {
          dispatch('addThingToStore', root)
        })
      }

      commit('setSelectedStacId', stacThing.linkToSelf)
    }
  },
  getters: {
    stacReferenceIsInStore: (state) => (url) => {
      let selected = findWithOrWithoutTrailingSlash(url, state.stacItems) 
      return selected !== undefined
    },
    selectedStacType (state, getters) {
      if (getters.selectedStac === null || getters.selectedStac === undefined) return null
      return getters.selectedStac.stacType
    },
    selectedStac (state) {
      if (state.selectedStacId === null) return null
      let selected = findWithOrWithoutTrailingSlash(state.selectedStacId, state.stacItems)
      if (selected !== undefined) return selected.stacObj
      return null
    }
  }
})

function findWithOrWithoutTrailingSlash (url, items) {
  let selected = items.find(thing => thing.id === url)
  if (selected === undefined) {
    selected = items.find(thing => thing.id === url + '/')
    if (selected === undefined) {
      selected = items.find(thing => thing.id + '/' === url)
    }
  }
  return selected
}
import { createStore } from 'vuex'

export default createStore({
  state () {
    return {
      allExternalCatalogs: [],
      stacItems: {},
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
      state.stacItems[payload.id] = payload.stacThing
    },
    setSelectedStacId (state, id) {
      state.selectedStacId = id
    },
    setSearchCollection (state, searchCollection) {
      state.searchCollection = searchCollection
    }
  },
  actions: {
    async addThingToStoreAndSetAsSelected ({ commit }, stacThing) {
      const stacUrl = stacThing.linkToSelf
      commit('addStacThing', {
        id: stacUrl,
        stacThing
      })
      if (stacThing.stacType !== 'Item') await stacThing.loadChildren()
      commit('setSelectedStacId', stacUrl)
    }
  },
  getters: {
    selectedStacType (state, getters) {
      if (getters.selectedStac === null || getters.selectedStac === undefined) return null
      return getters.selectedStac.stacType
    },
    selectedStac (state) {
      if (state.selectedStacId === null) return null
      return state.stacItems[state.selectedStacId]
    },
  }
})
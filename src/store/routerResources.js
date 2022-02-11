
const routerResources = {
  namespaced: true,

  state: {
    gblResourceBtnVisible: true,
    gblRouterResources: []
  },

  mutations: {
    setGblRouterResources (state, gblRouterResources) {
      state.gblRouterResources = gblRouterResources
    }
  }
}

export default routerResources

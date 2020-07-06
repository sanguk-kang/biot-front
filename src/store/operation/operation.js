// import axios from 'axios'
const initialState = () => ({
  viewType: 0,
})
const operation = {
  namespaced: true,
  state: initialState,
  getters: {
    viewType: state => {
      return state.viewType
    },
  },
  mutations: {
    setViewType: (state, data) => {
      state.viewType = data
    },
    resetState (state) {
      const initial = initialState()
      Object.keys(initial).forEach(key => {
        state[key] = initial[key]
      })
    },
  },
  actions: {
  }
}
export default operation

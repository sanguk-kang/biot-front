import axios from "@/api/axios.js";

const app = {
  namespaced: true,
  state: {
    // 공통코드   
    codeData: null,
    initLoding: false
  },
  getters: {
    getCodeIdList(state, payLoad) {
      console.log('getCodeIdList', state, payLoad);
      return null;
    },
    getInitLoding: (state) => state.initLoding,
  },
  mutations: {
    // 코드 적용
    setCommonCode(state, payload) {
      state.codeData = payload;
      state.initLoding = true;
    },
    getGroupCodeList(state, id) {
      console.log('getGroupCodeList', state, id);
    }
  },
  actions: {
    getCommonCode ({ commit }) {
      // 공통 코드조회
      axios.getApi.getApiData('/sms/common/codeGroup', '').then(response => {
        console.log('setCommonCode', response.data)
        commit('setCommonCode', response.data);
      }).catch(function (error) {
          console.log(error.response.status)
      });
    }
  }
}
export default app

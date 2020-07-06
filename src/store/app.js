import axios from "@/api/axios.js";

const app = {
  namespaced: true,
  state: {
    // 공통코드   
    codeData: null,
  },
  getters: {
    getCodeIdList(state, payLoad) {
      console.log('getCodeIdList', state, payLoad);
      return null;
    }
  },
  mutations: {
    // 코드 적용
    setCommonCode(state, payload) {
      state.codeData = payload;
    },
    getGroupCodeList(state, id) {
      console.log('getGroupCodeList', state, id);
    }
  },
  actions: {
    getCommonCode ({ commit }) {
      // 공통 코드조회
      axios.getApi('/sms/common/codeGroup', '').then(response => {
        console.log('setCommonCode', response.data)
        commit('setCommonCode', response.data);
      }).catch(function (error) {
          console.log(error.response.status)
      });
    }
  }
}
export default app

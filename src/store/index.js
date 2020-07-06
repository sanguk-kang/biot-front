import Vue from 'vue'
import Vuex from 'vuex'
import app from './app';
import operation from './operation/operation';
import deviceGroupList from './device/deviceGroupList';
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    deviceGroupList,
    operation,
  }
})

// store 파일 저장시 바로 반영되도록 설정
if (module.hot) {
  module.hot.accept(['./app', './operation/operation', './device/deviceGroupList'
  ], () => {
    const app = require('./app').default
    const operation = require('./operation/operation').default
    const deviceGroupList = require('./device/deviceGroupList').default

    store.hotUpdate({
      modules: {
        app,
        operation,
        deviceGroupList,
      }
    })
  })
}

export default store
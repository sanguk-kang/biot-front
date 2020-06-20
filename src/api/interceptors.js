import axios from 'axios';
import router from "@/router/index.js"

axios.defaults.baseURL = process.env.VUE_APP_API;
axios.defaults.headers.common = { "X-Requested-With": "XMLHttpRequest" };
axios.defaults.headers.post["Content-Type"] = "application/json; charset=utf-8";

/**
 * axios request
 */
axios.interceptors.request.use(async function (config) {
    return config;
  }, function (error) {
    // Do something with request error
    console.log('interceptors request error', error.config);
    return Promise.reject(error);
  });

/**
 * axios response
 * code 200 ~ 정상
 * code 400 에러 화면 처리
 * code 그 외 에러
 */
axios.interceptors.response.use(function (response) {
    return response;
  }, async function (error) {
    // 에러 코드
    var errorCode = error.response.status;
    // 200, 400 제외
    if (errorCode < 200 || errorCode > 300) {
      if (errorCode != 400) {
        if (errorCode == 403) {
          console.log('[Axios Error] Response 403 Forbidden');
          router.push({name: 'ErrorPage', params: { code: 403 } });
        } else if (errorCode == 404) {
          console.log('[Axios Error] Response 404 Not Found');
          router.push({name: 'ErrorPage', params: { code: 404 } });
        } else if (errorCode == 500) { // 기타에러와 merge?
          console.log('[Axios Error] Response 500 Internal Server Error');
          router.push({name: 'ErrorPage', params: { code: 500 }});
        } else { // 기타 에러
          console.log('[Axios Error] Response System error');
          router.push({name: 'ErrorPage', params: { code: 999 } });
        }
      }
    }
    
    return Promise.reject(error);
  });

export default axios;
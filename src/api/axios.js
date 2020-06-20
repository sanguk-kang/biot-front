import axios from "./interceptors";


const getApi = (url, params) => {
  var axiosUrl = "";
  if (params != null && params != undefined && params != '') {
    var axiosParam = Object.entries(params).map(e => e.join('=')).join('&');
    axiosUrl = url + "?" + axiosParam;
  } else {
    axiosUrl = url;
  }
  return axios.get(axiosUrl).then(response => {
    console.log('[Axios] getApi success');
    return response;
  }).catch(error => {
    throw error;
  })
}

const postApi = (url, params) => {
  return axios.post(url, params).then(response => {
      console.log('[Axios] postApi success');
      return response;
  }).catch(error => {
      throw error;
  })
}

  
export default {
  getApi,
  postApi
};
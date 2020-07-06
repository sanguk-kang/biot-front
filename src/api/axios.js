import axios from "./interceptors";
import stringUtils from "@/utils/stringUtils.js";

// default
const varAceept = "application/vnd.samsung.biot.v1+json;charset=UTF-8";
const apiHeader = {
  headers: {
      'Accept': '',
      'Authorization': ''
  }
};

const getApi = {
  async getApiData(url, params, setHeader) {
     console.log('aaaaaaaaaa')
  // headers default 체크
    if (stringUtils.isEmpty(setHeader)) {
        if(stringUtils.isEmpty(sessionStorage.getItem("tokenInfo"))) {
            console.log(">>>> getApi token error");
        } else {
            var tokenInfo = JSON.parse(sessionStorage.getItem("tokenInfo"));
            var sessionToken = tokenInfo.token;
            var sessionTokenType = tokenInfo.tokenType;

            if (!stringUtils.isEmpty(sessionToken) && !stringUtils.isEmpty(sessionTokenType)) {
                    apiHeader.headers = {
                    'Accept': varAceept,
                    'Authorization': sessionTokenType + " " + sessionToken
                    };
                }
        }
    } else {
        apiHeader.headers = setHeader.headers;
    }

    // url setting
    var axiosUrl = "";
    if (params != null && params != undefined && params != '') {
      var axiosParam = Object.entries(params).map(e => e.join('=')).join('&');
      axiosUrl = url + "?" + axiosParam;
    } else {
      axiosUrl = url;
    }

    const response = await axios.get(axiosUrl, apiHeader);
    return response;
  }
}

const postApi = (url, params, setHeader) => {
  // headers default 체크
  if (stringUtils.isEmpty(setHeader)) {
    if(stringUtils.isEmpty(sessionStorage.getItem("tokenInfo"))) {
      console.log(">>>> getApi token error");
    } else {
      var tokenInfo = JSON.parse(sessionStorage.getItem("tokenInfo"));
      var sessionToken = tokenInfo.token;
      var sessionTokenType = tokenInfo.tokenType;

      if (!stringUtils.isEmpty(sessionToken) && !stringUtils.isEmpty(sessionTokenType)) {
        apiHeader.headers = {
          'Accept': varAceept,
          'Authorization': sessionTokenType + " " + sessionToken
        };
      } else {
        console.log(">>>> token error");
      }
    }
  } else {
    apiHeader.headers = setHeader.headers;
  }

  return axios.post(url, params, apiHeader).then(response => {
      console.log('[Axios] postApi success');
      return response;
  }).catch(error => {
      throw error;
  })
}

const fileUploadApi = (url,fileType,fileData) => {
  const fileBlob = new Blob([fileData], {
    type: fileType /* 'application/json' */
  });
  const fileFormData = new FormData();
  fileFormData.append("document", fileBlob);

  axios({
    method: 'post',
    url: 'http://192.168.1.69:8080/api/files', /* URL 수정 필요 */
    data: fileFormData,
    header: {
              'Accept': fileType,  /* 'application/json' */
              'Content-Type': 'multipart/form-data',
            },
  }).then(response =>
  {
    console.log(response);
    return response;
  }).catch(error =>
  {
    throw error;
  });

  return false;
}

export default {
  getApi,
  postApi,
  fileUploadApi,
};
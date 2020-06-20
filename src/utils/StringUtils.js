/**
 * 
 * @param {*} str 
 */
function isEmpty(str) {
    if (str == null || str == "" || str == undefined) {
        return true;
    }
    return false;
}

/**
 * 
 * @param {*} obj 
 */
function deepObjectCopy(obj)
{
    return JSON.parse(JSON.stringify(obj));
}

/**
 * 
 * @param {*} number 
 */
function numberToDateChange(number) {
    var returnStr = "";
    returnStr = number.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3')
    return returnStr;
}

export default {
    isEmpty,
    deepObjectCopy,
    numberToDateChange
  };
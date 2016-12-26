'use strict';

function getUrlParameters(parameter, staticURL='', decode=true){
  /*
  Function: getUrlParameters
  Description: Get the value of URL parameters either from
               current URL or static URL
  Author: Tirumal
  URL: www.code-tricks.com
  */
  var currLocation = (staticURL.length)? staticURL : window.location.hash;
  if (!currLocation) return false ;
  var parArr = currLocation.split("#!/")[1].split("&");
  var returnBool = true;

  for(var i = 0; i < parArr.length; i++){
    var parr = parArr[i].split("=");
    if(parr[0] == parameter){
      return (decode) ? decodeURIComponent(parr[1]) : parr[1];
      returnBool = true;
    }else{
      returnBool = false;
    }
  }

  if(!returnBool) return false;
}

function setUrlParameters(parameter, value, staticURL='', encode=true){
  /*
  Function: setUrlParameters
  Description: Set the value of URL parameters either from
               current URL or static URL
  Author: David Lemayian
  URL: https://twitter.com/DavidLemayian
  */
  var currLocation = (staticURL.length)? staticURL : window.location.hash;
  if (!currLocation){
    var parArr = [];
  } else {
    var parArr = currLocation.split("#!/")[1].split("&");
  }
  var parArrNew = [];
  var returnUrl = '';

  value = (encode) ? encodeURIComponent(value) : value;

  if (getUrlParameters(parameter, staticURL, encode) != false) {
    // Parameters existing in URL
    for(var i = 0; i < parArr.length; i++){
      var parr = parArr[i].split("=");
      if(parr[0] == parameter){
        parArrNew[i] = parr[0] + '=' + value;
      }else{
        parArrNew[i] = parr[0] + '=' + parr[1];
      }
    }
  } else {
    parArrNew = parArr;
    parArrNew.push(parameter + '=' + value);
  }

  return '!/' + parArrNew.join('&');

}

function removeUrlParameters (parameter, staticURL='') {
  /*
  Function: removeUrlParameters
  Description: Remove a set URL parameter either from
               current URL or static URL
  Author: David Lemayian
  URL: https://twitter.com/DavidLemayian
  */
  var currLocation = (staticURL.length)? staticURL : window.location.hash;
  if (!currLocation){
    var parArr = [];
  } else {
    var parArr = currLocation.split("#!/")[1].split("&");
  }
  var parArrNew = [];
  var returnUrl = '';

  if (getUrlParameters(parameter, staticURL, true) != false) {
    // Parameteres existing in URL
    parArrNew_index = 0;
    for(var i = 0; i < parArr.length; i++){
      parr = parArr[i].split("=");
      if(parr[0] == parameter){
        // Skip parameter
      }else{
        parArrNew[parArrNew_index] = parr[0] + '=' + parr[1];
        parArrNew_index =  parArrNew_index + 1;
      }
    }
  } else {
    parArrNew = parArr;
  }

  return '!/' + parArrNew.join('&');
}

function isEmail(email){
  return /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test( email );
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

import {Alert} from 'react-native';
import ServiceCall from '../EndPoints';
import DeviceInfo from 'react-native-device-info';

function validateEmail(username) {
  const re = /^[a-z0-9]+$/i;
  // const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(username).toLowerCase());
}

const validateFields = (username, password, companyId) => {
  if (username === '' || !validateEmail(username)) {
    Alert.alert('Please enter valid username!');
    return false;
  }
  if (password === '') {
    Alert.alert('Please enter password!');
    return false;
  }
  if (companyId === '') {
    Alert.alert('Please select company!');
    return false;
  }
  return true;
};

export const login = (username, password, companyId, langId, nav) => {
  if (validateFields(username, password, companyId)) {
    const request = {request: {
      password: password,
      username: username,
      company_id: companyId,
      user_type: "mobileuser",
      device_id: DeviceInfo.getUniqueId(),
    }
    };
    const utf8 = require('utf8');
    const base64 = require('base-64');
    const bytes = utf8.encode(username+":"+password);
    const encodedStr = "Basic "+ base64.encode(bytes)
    return fetch(
      `${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.SALESLOGIN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": encodedStr,
          'user_type': 'mobileuser',
          'device_id': DeviceInfo.getUniqueId(),
          'lang_id': langId,
        },
        body: JSON.stringify(request),
      },
    )
      .then((response) => response.json())
      .then((json) => {
        console.log('request', JSON.stringify(request));
        console.log('login json: ', JSON.stringify(json));
        if (json.response.status_code === 200 && json.response.error_message === "") {
          return json;
        } else if(json.response.error_message !== "") {
          Alert.alert(json.response.error_message);
          return null;
        } else {
          Alert.alert('Server Error! Please try again later');
          return null;
        }
      })
      .catch((error) => {
        console.log('error: ', error);
        Alert.alert('Server Error! Please try again later');
        return null;
      });
  }
};

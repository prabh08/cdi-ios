import ServiceCall from '../EndPoints';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAllCustomers = () => {
  console.log(
    'URL',
    `${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.SETUP}`,
  );
  return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.SETUP}`)
    .then((response) => response.json())
    .then((json) => {
      console.log('json: ', JSON.stringify(json));
      const {response} = json;
      if (response.status_code === 200) {
        return response;
      } else {
        Alert.alert('Spmething went wrong!');
        console.log(json);
        return null;
      }
    })
    .catch((error) => {
      console.log('error: ', error);
      return null;
    });
};

export const getBasicHeader = async () => {
  const user = await AsyncStorage.getItem('USER');
  console.log('user: ', user);
  if (user !== null && user !== undefined) {
    const userInfo = JSON.parse(user);
    console.log('userInfo: ', userInfo);
    const utf8 = require('utf8');
    const base64 = require('base-64');
    const bytes = utf8.encode(userInfo.userName + ':' + userInfo.password);
    const encodedStr = 'Basic ' + base64.encode(bytes);
    return {
      encodedStr: encodedStr,
      langId: userInfo.langId,
      userName: userInfo.userName,
    };
  }
  return {encodedStr: '', langId: 0, userName: ''};
};


export const getToken = async () => {
  const appData = await AsyncStorage.getItem('APP_DATA');
  if (appData !== null && appData !== undefined) {
    const appInfo = JSON.parse(appData);
    return appInfo.token;
  }
  return '';
};

export const onLogOut = async () => {
  const basicHeaders = await getBasicHeader();
  console.log('basicHeaders: ', basicHeaders);
  const token = await getToken();
  console.log('token: ', token);
  const request = {
    request: {
      token: token,
    },
  };
  return fetch(
    `${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.LOGOUT}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: basicHeaders.encodedStr,
        lang_id: basicHeaders.langId,
      },
      body: JSON.stringify(request),
    },
  )
    .then((response) => response.json())
    .then((json) => {
      const {response} = json;
      if (response.status_code === 200) {
        return response;
      } else {
        Alert.alert('Something went wrong!');
        console.log('result ', json);
        return null;
      }
    })
    .catch((error) => {
      console.log('error: ', error);
      return null;
    });
};


export const getUserData = async() => {
	const loggedInUserData = await AsyncStorage.getItem('USER');
	return JSON.parse(loggedInUserData);
}
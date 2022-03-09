import {Alert} from 'react-native';
import ServiceCall from './EndPoints';

function isUrlValid(userInput) {
  var res = userInput.match(/(http(s)?:\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}/g);
  if (res == null) return false;
  else return true;
}

const validateFields = (url, port) => {
  if (url === '' || !isUrlValid(url)) {
    Alert.alert('Please enter valid host url!');
    return false;
  }
  if (port === '') {
    Alert.alert('Please enter valid port!');
    return false;
  }
  return true;
};

export const domainTestUrl = (url, port, nav) => {
  if (validateFields(url, port, nav)) {
    console.log('url', `${url}:${port}${ServiceCall.PATH}${ServiceCall.SETUP}`);
    return fetch(`${url}:${port}${ServiceCall.PATH}${ServiceCall.SETUP}`)
      .then((response) => response.json())
      .then((json) => {
        console.log('json: ', json);
        if (json.response.status_code === 200) {
          Alert.alert('It is valid host and url ');
          return json;
        } else {
          Alert.alert('Please Enter valid Host Url and Port');
          return null;
        }
      })
      .catch((error) => {
        console.log('error: ', error);
        Alert.alert('Please Enter valid Host Url and Port');
        return null;
      });
  }
};

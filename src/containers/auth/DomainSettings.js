/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {View, TextInput, StyleSheet, Text, Alert} from 'react-native';
import Button from '../../components/Button';
import Header from '../../components/Header';
import {domainTestUrl} from '../../services/domainSettings';
import {vh, vw} from '../../utilities/Dimensions';
import {openDatabase} from 'react-native-sqlite-storage';
import ServiceCall from '../../services/EndPoints';
import Loader from '../../components/Loader';

const DomainSettings = ({navigation}) => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [isSave, enableSave] = useState(false);
  const [loader, setLoader] = useState(false);
  const db = openDatabase({name: 'rpmData.db'});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line no-shadow
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveDB = React.useCallback((host, port) => {
    navigation.push('Login');
    db.transaction(function (txn) {
      txn.executeSql(
        'INSERT INTO settings (meta_key, meta_value) VALUES (?,?), (?,?), (?,?)',
        ['app_url', host, 'domain_port', port, 'lang_id', '0'],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            navigation.navigate('HomeScreen');
            // Alert.alert(
            //   'Success',
            //   'You are Registered Successfully',
            //   [
            //     {
            //       text: 'Ok',
            //       onPress: () => navigation.navigate('HomeScreen'),
            //     },
            //   ],
            //   {cancelable: false},
            // );
          } else {
            // eslint-disable-next-line no-alert
            alert('Registration Failed');
          }
        },
      );
    });
  });

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      {/* <Header title={'Domain Setting'} isBack /> */}
      <View
        style={{
          width: vw(80),
          backgroundColor: 'rgb(237,240,243)',
          height: vh(37),
          alignSelf: 'center',
          marginTop: vh(35),
        }}>
        <View style={styles.container}>
          {/* <Text style={styles.label}>Host Url :</Text> */}
          <TextInput
            value={host}
            onChangeText={(text) => setHost(text)}
            style={styles.hostInput}
            autoCapitalize={'none'}
            placeholder={'Domain'}
          />
        </View>
        <View style={[styles.container, {marginTop: 60}]}>
          {/* <Text style={styles.label}>Port :</Text> */}
          <TextInput
            value={port}
            onChangeText={(text) => setPort(text)}
            style={styles.hostInput}
            keyboardType="number-pad"
            maxLength={4}
            placeholder={'Port Number'}
          />
        </View>
        <View style={styles.buttonRow}>
          <Button
            label={'Test Url'}
            onClick={async () => {
              setLoader(true);
              const response = await domainTestUrl(host, port, navigation);
              if (response !== null) {
                ServiceCall.BASE_URL = `${host}:${port}`;
                //   navigation.push('Login');
                enableSave(true);
              }
              setLoader(false);
            }}
            width={vw(25)}
          />
          <Button
            label={'Save'}
            disable={!isSave}
            onClick={() => saveDB(host, port)}
            width={vw(25)}
          />
        </View>
      </View>
      <Text
        style={{
          color: '#489CD6',
          position: 'absolute',
          bottom: 0,
          marginBottom: vh(5),
          textAlign: 'center',
          alignSelf: 'center',
          fontSize: 18,
        }}>
        For server details, please contact CDI admin
      </Text>
      {loader && <Loader />}
    </View>
  );
};

const styles = StyleSheet.create({
  hostInput: {
    width: vw(70),
    borderBottomWidth: 1,
    borderColor: '#489CD6',
    height: vh(5),
    borderRadius: 5,
    marginLeft: 10,
    color: '#489CD6',
    backgroundColor: 'white',
    paddingLeft :10
  },
  container: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
    marginLeft: 10,
  },
  label: {
    color: '#489CD6',
    fontSize: 17,
    fontWeight: '700',
    width: vw(20),
  },
  buttonRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    backgroundColor: 'white',
    alignSelf: 'center',
    height: vh(5),
    alignItems: 'center',
    borderRadius: 5,
  },
});

export default DomainSettings;

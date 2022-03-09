/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  DeviceEventEmitter,
  Text,
  Platform,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Button from '../../components/Button';
import {vh, vw} from '../../utilities/Dimensions';
import DropDownPicker from 'react-native-dropdown-picker';
import {login} from '../../services/auth/login';
import appLogo from '../../assets/logo.png';
import langIcon from '../../assets/login_language.png';
import {getAllCustomers} from '../../services/common/common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader';
import Database from '../../utilities/database/database';
import {
  generateWholeInsertQueryForDashboardData,
  fetchAppDataFromTable
} from '../../utilities/database/database-queries';


const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [companies, setCompanies] = useState([]);
  const [password, setPassword] = useState('');
  const [isButtonDisabe, disableButton] = useState(false);
  const [companyId, setId] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [lang, selectLang] = useState(null);
  const [loader, setLoader] = useState(false);
  const [totalLanguages, setTotalLanguages] = useState([]);
  const [languageLiterals, setLanguageLiterals] = React.useState();

  React.useEffect(() => {
      (async function () {
        return NetInfo.fetch().then(async (state) => {
        const asyncStorageKeys = await AsyncStorage.getAllKeys();
        if (asyncStorageKeys.length > 0) {
          if (Platform.OS === 'android') {
            await AsyncStorage.clear();
          }
          if (!asyncStorageKeys.includes("AllCUSTOMER") && Platform.OS === 'ios') {
            await AsyncStorage.multiRemove(asyncStorageKeys);
          }
        }

        setLoader(true);
        
        if(state.isConnected) {
        // if(false) {
          var response = await getAllCustomers();
          await AsyncStorage.setItem('AllCUSTOMER', JSON.stringify(response));
        } else {
          let data = await AsyncStorage.getItem('AllCUSTOMER');
          var response = JSON.parse(data);
        }
        
        setLoader(false);

        if (response) {
          const list = response.companies.company.map((item) => ({
            label: item.companyName,
            value: item.companyCode,
          }));
          const LangList = response.data.setup_info.map((item) => ({
            label: item.languageName,
            value: item.languageId,
          }));
          const selectedLang = LangList.filter(
            (item) => item.label === 'English',
          );
          setCompanies(list);
          setLanguages(LangList);
          selectLang(selectedLang[0].value);
          setId(list[0].value);
          setTotalLanguages(response.data.setup_info);
          setupLanguage('0', response.data.setup_info);
        }
      })
    })();;
  }, []);

  const onClearValues = async () => {
    setEmail('');
    setPassword('');
  };

  React.useEffect(() => {
    (async function () {
      DeviceEventEmitter.addListener('ClearLoginValues', async () => {
        await onClearValues();
      });
    })();
  }, []);

  const setupLanguage = async (langSelectedId, totalLanguagesData) => {
    const langData = totalLanguagesData.filter(
      (elm) => elm.languageId === langSelectedId,
    );
    await AsyncStorage.setItem(
      'LITERALS',
      JSON.stringify(langData[0].literals),
    );
    const language = await AsyncStorage.getItem('LITERALS');
    setLanguageLiterals(JSON.parse(language));
  };

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <View
        style={
          Platform.OS === 'android'
            ? styles.mainContainerAndroid
            : styles.mainContaineriOS
        }>
        <Image
          source={langIcon}
          resizeMode="contain"
          style={{height: 20, width: 20}}
        />
        <View
          style={
            Platform.OS === 'android' ? styles.dropdownContainerAndroid : {}
          }>
          <DropDownPicker
            items={languages}
            style={{borderWidth: 0}}
            containerStyle={{
              height: vh(5),
              width: vw(24),
              borderWidth: 0,
              marginTop: -10,
            }}
            dropDownStyle={{maxHeight: vh(6)}}
            onChangeItem={(item) => {
              selectLang(item.value);
              setupLanguage(item.value, totalLanguages);
            }}
            labelStyle={{color: '#489CD6', fontSize: 13}}
            defaultValue={lang}
          />
        </View>
      </View>
      <View
        style={{
          backgroundColor: 'rgb(237,240,243)',
          height: vh(50),
          width: vw(90),
          marginTop: vh(10),
          alignSelf: 'center',
        }}>
        <Image
          source={appLogo}
          resizeMode="contain"
          style={{width: 100, height: 100, alignSelf: 'center', marginTop: 10}}
        />
        <View style={styles.container}>
          <TextInput
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.hostInput}
            placeholder={languageLiterals && languageLiterals.LblUsername}
            placeholderTextColor={'#489CD6'}
            autoCapitalize={'none'}
          />
        </View>
        <View style={[styles.container, {marginTop: 30}]}>
          <TextInput
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.hostInput}
            secureTextEntry
            placeholder={languageLiterals && languageLiterals.LblPassword}
            placeholderTextColor={'#489CD6'}
          />
        </View>
        <View style={[styles.container, {marginTop: 30}]}>
          <DropDownPicker
            items={companies}
            containerStyle={{height: vh(5), width: vw(80)}}
            style={{backgroundColor: 'white'}}
            itemStyle={{
              justifyContent: 'flex-start',
            }}
            dropDownStyle={{maxHeight: vh(6)}}
            onChangeItem={(item) => setId(item.value)}
            placeholder={'Select Company'}
            labelStyle={{color: '#489CD6'}}
            onOpen={() => {
              disableButton(true);
            }}
            onClose={() => {
              disableButton(false);
            }}
            defaultValue={companyId}
          />
        </View>
        {!isButtonDisabe && (
          <View
            style={{
              alignSelf: 'center',
              marginTop: 30,
              zIndex: 1,
              elevation: 2,
            }}>
            <Button
              label={languageLiterals && languageLiterals.LblLogIn}
              onClick={async () => {
                return NetInfo.fetch().then(async (state) => {
                  setLoader(true);
                  let userName = email;
                  var appData = await Database.executeQuery(fetchAppDataFromTable('app_data', companyId, userName));
                  var appDataLength = appData.rows.length;
                  
                  // if (false) {
                  if (state.isConnected) {
                    const loginRes = await login(
                      email,
                      password,
                      companyId,
                      lang,
                      navigation,
                    );
                    setLoader(false);
                    if (loginRes && loginRes.response) {
                      try {
                        const user = {
                          userName: email,
                          password: password,
                          langId: lang,
                          companyId: companyId,
                        };
                        let response = {
                          "salesPersonName": "Maria Marcial",
                          "salesRepId": "31",
                          "number_of_days": 180,
                          "salesman_picture": "",
                          "token": "olpaidqzhbdcdjba",
                          "total_sales_amount": 0,
                          "regular_salesman": true,
                          "salesPersonAddress": [
                            
                          ],
                          "customersOverdue": {
                            "no_overdue_customers": 8,
                            "total_overdue_amount": 8063.86,
                            "overdue_customers": [
                              {
                                "customerNumber": "S001067",
                                "customerName": "Smart Dollar (Central)",
                                "orderNumber": "S03973",
                                "description1": "S05357",
                                "orderDate": "2021-03-11",
                                "custInvoiceAmt": 131.95,
                                "collected": 0,
                                "due_on": "2021-04-10",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 131.95
                              },
                              {
                                "customerNumber": "S001067",
                                "customerName": "Smart Dollar (Central)",
                                "orderNumber": "S03783",
                                "description1": "S05157",
                                "orderDate": "2021-03-08",
                                "custInvoiceAmt": 158.34,
                                "collected": 0,
                                "due_on": "2021-04-07",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 158.34
                              },
                              {
                                "customerNumber": "S001067",
                                "customerName": "Smart Dollar (Central)",
                                "orderNumber": "S02277",
                                "description1": "S03524",
                                "orderDate": "2021-01-27",
                                "custInvoiceAmt": 237.48,
                                "collected": 0,
                                "due_on": "2021-02-26",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 237.48
                              },
                              {
                                "customerNumber": "S81789",
                                "customerName": "J.F.MONTALVO C&C",
                                "orderNumber": "S01035",
                                "description1": "S02121",
                                "orderDate": "2020-12-21",
                                "custInvoiceAmt": 752.74,
                                "collected": 752.73,
                                "due_on": "2021-01-20",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 0.01
                              },
                              {
                                "customerNumber": "S81789",
                                "customerName": "J.F.MONTALVO C&C",
                                "orderNumber": "S03541",
                                "description1": "S04883",
                                "orderDate": "2021-03-01",
                                "custInvoiceAmt": 1436.5,
                                "collected": 1436.48,
                                "due_on": "2021-03-31",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 0.02
                              },
                              {
                                "customerNumber": "S81789",
                                "customerName": "J.F.MONTALVO C&C",
                                "orderNumber": "S02154",
                                "description1": "S03381",
                                "orderDate": "2021-01-25",
                                "custInvoiceAmt": 716.04,
                                "collected": 716.02,
                                "due_on": "2021-02-24",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 0.02
                              },
                              {
                                "customerNumber": "S81789",
                                "customerName": "J.F.MONTALVO C&C",
                                "orderNumber": "S01806",
                                "description1": "S03015",
                                "orderDate": "2021-01-15",
                                "custInvoiceAmt": 1010.43,
                                "collected": 1010.41,
                                "due_on": "2021-02-14",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 0.02
                              },
                              {
                                "customerNumber": "S86995",
                                "customerName": "SuperMax - Cidra",
                                "orderNumber": "S03962",
                                "description1": "S05356",
                                "orderDate": "2021-03-11",
                                "custInvoiceAmt": 158.32,
                                "collected": 0,
                                "due_on": "2021-05-10",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 158.32
                              },
                              {
                                "customerNumber": "S86995",
                                "customerName": "SuperMax - Cidra",
                                "orderNumber": "S05212",
                                "description1": "S06667",
                                "orderDate": "2021-04-14",
                                "custInvoiceAmt": 237.48,
                                "collected": 0,
                                "due_on": "2021-06-13",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 237.48
                              },
                              {
                                "customerNumber": "S86995",
                                "customerName": "SuperMax - Cidra",
                                "orderNumber": "S05187",
                                "description1": "S06653",
                                "orderDate": "2021-04-13",
                                "custInvoiceAmt": 237.47,
                                "collected": 0,
                                "due_on": "2021-06-12",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 237.47
                              },
                              {
                                "customerNumber": "S87500",
                                "customerName": "SuperMax - Cidra",
                                "orderNumber": "S05208",
                                "description1": "S06668",
                                "orderDate": "2021-04-14",
                                "custInvoiceAmt": 211.57,
                                "collected": 0,
                                "due_on": "2021-05-14",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 211.57
                              },
                              {
                                "customerNumber": "S87600",
                                "customerName": "Ralphs Food Warehouse #1 Las Piedras",
                                "orderNumber": "S05209",
                                "description1": "S06690",
                                "orderDate": "2021-04-14",
                                "custInvoiceAmt": 366.9,
                                "collected": 0,
                                "due_on": "2021-05-14",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 366.9
                              },
                              {
                                "customerNumber": "S87600",
                                "customerName": "Ralphs Food Warehouse #1 Las Piedras",
                                "orderNumber": "S05183",
                                "description1": "S06655",
                                "orderDate": "2021-04-13",
                                "custInvoiceAmt": 768.21,
                                "collected": 0,
                                "due_on": "2021-05-13",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 768.21
                              },
                              {
                                "customerNumber": "S87601",
                                "customerName": "Tiendas Capri HQ",
                                "orderNumber": "S05206",
                                "description1": "S06670",
                                "orderDate": "2021-04-14",
                                "custInvoiceAmt": 441.54,
                                "collected": 0,
                                "due_on": "2021-06-13",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 441.54
                              },
                              {
                                "customerNumber": "S87601",
                                "customerName": "Tiendas Capri HQ",
                                "orderNumber": "S04053",
                                "description1": "S05462",
                                "orderDate": "2021-03-12",
                                "custInvoiceAmt": 343.42,
                                "collected": 0,
                                "due_on": "2021-05-11",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 343.42
                              },
                              {
                                "customerNumber": "S87601",
                                "customerName": "Tiendas Capri HQ",
                                "orderNumber": "S03865",
                                "description1": "S05247",
                                "orderDate": "2021-03-09",
                                "custInvoiceAmt": 539.66,
                                "collected": 0,
                                "due_on": "2021-05-08",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 539.66
                              },
                              {
                                "customerNumber": "S87601",
                                "customerName": "Tiendas Capri HQ",
                                "orderNumber": "768484-01",
                                "description1": "S00976",
                                "orderDate": "2020-09-17",
                                "custInvoiceAmt": 245.31,
                                "collected": 220.77,
                                "due_on": "2020-10-17",
                                "item_fr_invoice_nt_foundmsg": true,
                                "overdueAmount": 0.01
                              },
                              {
                                "customerNumber": "S87601",
                                "customerName": "Tiendas Capri HQ",
                                "orderNumber": "S03151",
                                "description1": "S04467",
                                "orderDate": "2021-02-18",
                                "custInvoiceAmt": 294.36,
                                "collected": 0,
                                "due_on": "2021-04-19",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 294.36
                              },
                              {
                                "customerNumber": "S87601",
                                "customerName": "Tiendas Capri HQ",
                                "orderNumber": "",
                                "description1": "S04557",
                                "orderDate": "2021-02-19",
                                "custInvoiceAmt": 196.24,
                                "collected": 0,
                                "due_on": "2021-04-20",
                                "item_fr_invoice_nt_foundmsg": true,
                                "overdueAmount": 196.24
                              },
                              {
                                "customerNumber": "S87601",
                                "customerName": "Tiendas Capri HQ",
                                "orderNumber": "S03511",
                                "description1": "S04869",
                                "orderDate": "2021-03-01",
                                "custInvoiceAmt": 147.18,
                                "collected": 0,
                                "due_on": "2021-04-30",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 147.18
                              },
                              {
                                "customerNumber": "S87601",
                                "customerName": "Tiendas Capri HQ",
                                "orderNumber": "S03689",
                                "description1": "S05036",
                                "orderDate": "2021-03-03",
                                "custInvoiceAmt": 417.01,
                                "collected": 0,
                                "due_on": "2021-05-02",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 417.01
                              },
                              {
                                "customerNumber": "S87601",
                                "customerName": "Tiendas Capri HQ",
                                "orderNumber": "S00577",
                                "description1": "S01604",
                                "orderDate": "2020-12-09",
                                "custInvoiceAmt": 1633.67,
                                "collected": 1619.04,
                                "due_on": "2021-02-07",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 14.63
                              },
                              {
                                "customerNumber": "S87622",
                                "customerName": "China Town & More #1 Arecibo",
                                "orderNumber": "S03139",
                                "description1": "S04436",
                                "orderDate": "2021-02-17",
                                "custInvoiceAmt": 449.45,
                                "collected": 0,
                                "due_on": "2021-03-19",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 449.45
                              },
                              {
                                "customerNumber": "S87622",
                                "customerName": "China Town & More #1 Arecibo",
                                "orderNumber": "S00210",
                                "description1": "S01205",
                                "orderDate": "2020-12-01",
                                "custInvoiceAmt": 735.09,
                                "collected": 728.47,
                                "due_on": "2021-01-30",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 6.62
                              },
                              {
                                "customerNumber": "S87622",
                                "customerName": "China Town & More #1 Arecibo",
                                "orderNumber": "S03789",
                                "description1": "S05159",
                                "orderDate": "2021-03-08",
                                "custInvoiceAmt": 526.35,
                                "collected": 0,
                                "due_on": "2021-04-07",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 526.35
                              },
                              {
                                "customerNumber": "S87622",
                                "customerName": "China Town & More #1 Arecibo",
                                "orderNumber": "S03877",
                                "description1": "S05257",
                                "orderDate": "2021-03-09",
                                "custInvoiceAmt": 873.96,
                                "collected": 0,
                                "due_on": "2021-04-08",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 873.96
                              },
                              {
                                "customerNumber": "S87720",
                                "customerName": "Mr Special Balboa #1",
                                "orderNumber": "757007-01",
                                "description1": "S01006",
                                "orderDate": "2020-01-03",
                                "custInvoiceAmt": 191.04,
                                "collected": 0,
                                "due_on": "2020-02-02",
                                "item_fr_invoice_nt_foundmsg": true,
                                "overdueAmount": 191.04
                              },
                              {
                                "customerNumber": "S87720",
                                "customerName": "Mr Special Balboa #1",
                                "orderNumber": "757423-01",
                                "description1": "S01012",
                                "orderDate": "2020-01-15",
                                "custInvoiceAmt": 40.32,
                                "collected": 0,
                                "due_on": "2020-02-14",
                                "item_fr_invoice_nt_foundmsg": true,
                                "overdueAmount": 40.32
                              },
                              {
                                "customerNumber": "S87720",
                                "customerName": "Mr Special Balboa #1",
                                "orderNumber": "769454-01",
                                "description1": "S01013",
                                "orderDate": "2020-10-09",
                                "custInvoiceAmt": 5.25,
                                "collected": 0,
                                "due_on": "2020-11-08",
                                "item_fr_invoice_nt_foundmsg": true,
                                "overdueAmount": 5.25
                              },
                              {
                                "customerNumber": "S87720",
                                "customerName": "Mr Special Balboa #1",
                                "orderNumber": "S00328",
                                "description1": "S01341",
                                "orderDate": "2020-12-03",
                                "custInvoiceAmt": 95.52,
                                "collected": 0,
                                "due_on": "2021-02-01",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 95.52
                              },
                              {
                                "customerNumber": "S87720",
                                "customerName": "Mr Special Balboa #1",
                                "orderNumber": "",
                                "description1": "S01330",
                                "orderDate": "2020-12-03",
                                "custInvoiceAmt": 382.08,
                                "collected": 379.44,
                                "due_on": "2021-02-01",
                                "item_fr_invoice_nt_foundmsg": true,
                                "overdueAmount": 2.63
                              },
                              {
                                "customerNumber": "S87720",
                                "customerName": "Mr Special Balboa #1",
                                "orderNumber": "S03755",
                                "description1": "S05131",
                                "orderDate": "2021-03-05",
                                "custInvoiceAmt": 191.04,
                                "collected": 0,
                                "due_on": "2021-05-04",
                                "item_fr_invoice_nt_foundmsg": false,
                                "overdueAmount": 191.04
                              },
                              {
                                "customerNumber": "S87774",
                                "customerName": "Global Management Serv- Texaco JD              ",
                                "orderNumber": "764860-01",
                                "description1": "S01023",
                                "orderDate": "2020-01-13",
                                "custInvoiceAmt": 531.69,
                                "collected": 0,
                                "due_on": "2020-02-12",
                                "item_fr_invoice_nt_foundmsg": true,
                                "overdueAmount": 531.69
                              },
                              {
                                "customerNumber": "S87774",
                                "customerName": "Global Management Serv- Texaco JD              ",
                                "orderNumber": "766273-01",
                                "description1": "S01024",
                                "orderDate": "2020-08-03",
                                "custInvoiceAmt": 248.15,
                                "collected": 0,
                                "due_on": "2020-09-02",
                                "item_fr_invoice_nt_foundmsg": true,
                                "overdueAmount": 248.15
                              }
                            ]
                          },
                          "openOrdersInfo": {
                            "no_open_orders": 0,
                            "total_open_orders_amount": 0,
                            "open_orders": [
                              
                            ]
                          },
                          "can_modify_price": "yes",
                          "can_give_discount": "no",
                          "do_not_allow_negative_inv_order": "no"
                        }
                        const data = JSON.stringify(loginRes.response.data);
                        console.log('login data1 ', data)
                        
                        await Database.executeInsertQuery(await generateWholeInsertQueryForDashboardData('app_data',
                           JSON.stringify(data), companyId, email, appDataLength));

                        
                        await AsyncStorage.setItem('APP_DATA', data);
                        await AsyncStorage.setItem('USER', JSON.stringify(user));
                      } catch (e) {
                        console.log('error', e);
                      }
                      navigation.push('SalesHome');
                    }
                  } else {
                    const user = {
                      userName: email,
                      password: password,
                      langId: lang,
                      companyId: companyId,
                    };
                    setLoader(false);
                    if(appDataLength > 0) {
                      let res = appData.rows.item(0);
                      appResData =  JSON.parse(res.data);
                      console.log('appResData', appResData)
                      await AsyncStorage.setItem('APP_DATA', appResData);
                      await AsyncStorage.setItem('USER', JSON.stringify(user));
                      navigation.push('SalesHome');
                    } else {
                      alert('You have to login first time with internet to access the offline mode!');
                    }
                  }
                });
              }}
              width={vw(78)}
            />
          </View>
        )}
      </View>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          marginBottom: vh(5),
          justifyContent: 'center',
          alignItems: 'flex-end',
          flex: 1,
        }}>
        <Text style={{textAlign: 'center', color: '#489CD6', fontSize: 18}}>
          Version 1.2.0
        </Text>
      </View>
      {loader && <Loader />}
    </View>
  );
};

const styles = StyleSheet.create({
  hostInput: {
    width: vw(80),
    borderBottomWidth: 1,
    borderColor: '#489CD6',
    height: vh(5),
    borderRadius: 5,
    color: '#489CD6',
    backgroundColor: 'white',
    paddingLeft: 15,
  },
  container: {
    flexDirection: 'row',
    marginTop: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#489CD6',
    fontSize: 17,
    fontWeight: '700',
    width: vw(22),
  },
  labelLang: {
    color: '#489CD6',
  },
  mainContaineriOS: {
    marginTop: vh(7),
    alignSelf: 'flex-end',
    marginRight: 10,
    borderBottomWidth: 1,
    borderColor: '#489CD6',
    flexDirection: 'row',
  },
  mainContainerAndroid: {
    marginTop: vh(7),
    alignSelf: 'flex-end',
    marginRight: 10,
    flexDirection: 'row',
  },
  dropdownContainerAndroid: {
    height: 100,
    borderTopWidth: 1,
    borderColor: '#489CD6',
  },
});

export default LoginScreen;

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, StyleSheet, Image, FlatList, Platform, Alert} from 'react-native';
import {vh, vw, statusBarHeight} from '../../utilities/Dimensions';
import locImg from '../../assets/customer/ic_location.png';
import phoneImg from '../../assets/customer/ic_call.png';
import mailImg from '../../assets/customer/ic_mail.png';
import {getAllCustomers, sort, checkInCustomer} from '../../services/customer/customer';
import {TextInput, TouchableOpacity} from 'react-native-gesture-handler';
import Header from '../../components/Header';
import Geolocation from '@react-native-community/geolocation';
import {getDistance} from 'geolib';
import {getCurrentDateInString} from '../../utilities/utils';
import {Picker} from '@react-native-picker/picker';
import Loader from '../../components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';

const customerTypes = [
  {label: 'None', value: 'None'},
  {label: 'CB', value: 'CB'},
  {label: 'RD', value: 'RD'},
  {label: 'WH', value: 'WH'},
];

export const CustomerContext = React.createContext();

const Customer = ({navigation}) => {
  const [customers, setCustomers] = React.useState([]);
  const [sortSelected, selectSort] = React.useState(0);
  const [position, setPosition] = React.useState({latitude: 0, longitude: 0});
  const [searchText, setText] = React.useState('');
  const [customerType, setCustomerType] = React.useState('None');
  const [isCType, setCType] = React.useState(false);
  const globalList = React.useRef([]);
  const customList = React.useRef([]);
  const [loader, setLoader] = React.useState(false);
  const [languageLiterals, setLanguageLiterals] = React.useState(null);

  const filterList = [
    {id: 1, label: languageLiterals ? languageLiterals.LblA_Z : 'A-Z'},
    {id: 2, label: languageLiterals ? languageLiterals.LblNearMe : 'NEAR ME'},
    // {
    //   id: 3,
    //   label: languageLiterals
    //     ? languageLiterals.LblRecentVisit
    //     : 'RECENT VISIT',
    // }
    // ,
    // {
    //   id: 4,
    //   label: languageLiterals ? languageLiterals.LblNotSynced : 'NOT SYNCED',
    // },
  ];

  const getCustomers = React.useCallback(async (position) => {
    const resp = await getAllCustomers(filterList[sortSelected].label);
    // console.log('respResult: ', JSON.stringify(resp));
    if(resp === undefined) {
      Alert.alert(
        `Data is not synced!`,
        '',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
        {cancelable: false},
      );
    } 
    if (resp !== null && resp !== undefined && resp.data.customers.length > 0) {
      const list = resp.data.customers.map((customer) => {
        const custPos = {
          latitude:
            customer.customer_shipping_addresses.length > 0 &&
            customer.customer_shipping_addresses[0].latitude !== null
              ? customer.customer_shipping_addresses[0].latitude
              : 0,
          longitude:
            customer.customer_shipping_addresses.length > 0 &&
            customer.customer_shipping_addresses[0].longitude !== null
              ? customer.customer_shipping_addresses[0].longitude
              : 0,
        };
        const distnce = getDistance(position, custPos, 1);
        const milesDis = (distnce * 0.00062).toFixed(2);

        return {...customer, distance: milesDis};
      });
      setLoader(false);
      setCustomers(list);
      globalList.current = [...list];
    }
    setLoader(false);
  }, [position]);

  React.useEffect(() => {
    (async function () {
      setLoader(true);
      const language = await AsyncStorage.getItem('LITERALS');
      setLanguageLiterals(JSON.parse(language));
      
      Geolocation.getCurrentPosition(async (info) => {
        setPosition({
          latitude: info.coords.latitude,
          longitude: info.coords.longitude,
        });
        let setPostion = {
          latitude: info.coords.latitude,
          longitude: info.coords.longitude,
        };
        getCustomers(setPostion);
      });
    })();
  }, []);

  const renderItem = React.useCallback((item) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={async () => {
          await AsyncStorage.setItem('CUSTOMER', JSON.stringify(item));
          let customerData = item;
          let logUserData = await AsyncStorage.getItem('USER');
          let user = JSON.parse(logUserData);
          Geolocation.getCurrentPosition(async (info) => {
            let request = {
              user_id: user.userName,
              cust_number: customerData.customerNumber,
              ship_number: customerData.customer_shipping_addresses[0].ship_number,
              latitude: info.coords.latitude,
              longitude: info.coords.longitude,
              check_in_time:  Date.now(),
              check_out_time: Date.now(),
              operation_mode: 0,
            };
            await checkInCustomer(request);
          });
          
          navigation.navigate('CustomerDashboard', {
            params: {customer: item},
            screen: 'CustomerAccount',
          });
        }}>
        <View style={styles.locationView}>
          <Image source={locImg} style={{height: vh(5), width: vh(5)}} />
          <Text>{`${item.distance} mi`}</Text>
        </View>
        <View
          style={{
            height: '100%',
            width: '70%',
            marginLeft: 10,
            justifyContent: 'center',
          }}>
          <Text style={styles.title}>{item.customerName}</Text>
          <Text style={styles.serial}>{item.customerNumber}</Text>
          <Text
            style={{
              marginTop: 3,
              width: '80%',
            }}>
            {item.customer_billing_address.length > 0
              ? `${item.customer_billing_address[0].billingAdd1} ${item.customer_billing_address[0].billingAdd2} ${item.customer_billing_address[0].billingAdd3} ${item.customer_billing_address[0].billingCity} ${item.customer_billing_address[0].billingState}  ${item.customer_billing_address[0].billingZip}`
              : ''}
          </Text>
          <Text style={styles.serial}>
            {`${item.number_of_days} days since last visit`}
            {/* {languageLiterals &&
              `${item.number_of_days} ${languageLiterals.LblXDaysSinceLastVisit}`} */}
          </Text>
          {item.phoneNumber !== '' && (
            <View style={{flexDirection: 'row', marginTop: 3}}>
              <Image source={phoneImg} style={styles.phoneImg} />
              <Text>{item.phoneNumber}</Text>
            </View>
          )}
          {item.emailId !== '' && (
            <View style={{flexDirection: 'row', marginTop: 3}}>
              <Image source={mailImg} style={styles.phoneImg} />
              <Text>{item.emailId}</Text>
            </View>
          )}
          <View style={styles.tag}>
            <Text style={{color: 'white'}}>{item.customerType}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <Header
        title={languageLiterals && languageLiterals.LblCustomers}
        isBack
        onBackPress={() => navigation.goBack()}
        isLogOut
        navigation={navigation}
        customers
      />
      <View style={styles.searcBarView}>
        <TextInput
          value={searchText}
          placeholder={languageLiterals && languageLiterals.lblSearchNameAdd}
          placeholderTextColor="#333"
          style={styles.searchText}
          onChangeText={(text) => {
            console.log('text==', text);
            setText(text);
            if (text === '') {
              if (customList.current.length > 0) {
                setCustomers(customList.current);
              } else {
                setCustomers(globalList.current);
              }
            } else {
              const list = customers.filter((cust) =>
                cust.customerName.toLowerCase().includes(text.toLowerCase()),
              );
              console.log('list: ', list);
              setCustomers(list);
            }
          }}
        />
      </View>
      {Platform.OS === 'android' && (
        <View
          style={{
            justifyContent: 'center',
            marginVertical: 10,
            margin: vw(5),
            width: '90%',
          }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 20,
              fontWeight: '400',
              textAlign: 'center',
            }}>
            {languageLiterals && languageLiterals.LblCustomerType}
          </Text>
        </View>
      )}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginVertical: 10,
          margin: vw(5),
        }}>
        {Platform.OS === 'android' ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Picker
              mode="dialog"
              selectedValue={customerType}
              style={{width: '100%', zIndex: 2}}
              onValueChange={(itemValue, itemIndex) => {
                setCustomerType(itemValue);
                if (itemValue !== 'None') {
                  const list = globalList.current.filter(
                    (cust) => cust.customerType === itemValue,
                  );
                  setCustomers(list);
                  customList.current = [...list];
                } else {
                  setCustomers(globalList.current);
                }
              }}>
              {customerTypes.map((cusType, index) => (
                <Picker.Item
                  key={index}
                  label={cusType.label}
                  value={cusType.value}
                />
              ))}
            </Picker>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setCType(true)}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 20,
                fontWeight: '400',
                right:110
              }}>
              {customerType !== 'None'
                ? customerType
                : languageLiterals && languageLiterals.LblCustomerType}
            </Text>
          </TouchableOpacity>
        )}
        {/* <Text style={{fontSize: 20, fontWeight: '400'}}>
          {languageLiterals && languageLiterals.LblRoute}
        </Text> */}
      </View>
      <FlatList
        data={customers}
        style={{marginTop: 10, zIndex: 0, marginBottom: vh(10)}}
        contentContainerStyle={{marginBottom: 20}}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => renderItem(item)}
      />
      <View style={styles.filterView}>
        {filterList.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor:
                sortSelected === index ? 'rgb(87,179,248)' : 'transparent',
              borderRadius: 5,
            }}
            onPress={() => {
              selectSort(index);
              sort(index, customers);
            }}>
            <Text style={{color: '#489CD6'}}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {isCType && Platform.OS === 'ios' && (
        <Picker
          // mode="dropdown"
          selectedValue={customerType}
          style={{width: '100%', zIndex: 2}}
          onValueChange={(itemValue, itemIndex) => {
            setCustomerType(itemValue);
            if (itemValue !== 'None') {
              const list = globalList.current.filter(
                (cust) => cust.customerType === itemValue,
              );
              setCustomers(list);
              customList.current = [...list];
              setCType(false);
            } else {
              setCustomers(globalList.current);
              setCType(false);
            }
          }}>
          {customerTypes.map((cusType, index) => (
            <Picker.Item
              key={index}
              label={cusType.label}
              value={cusType.value}
            />
          ))}
        </Picker>
      )}
      {loader && <Loader />}
    </View>
  );
};

export default Customer;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#489CD6',
    height: vh(10),
  },
  headerView: {
    marginTop: statusBarHeight,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 22,
  },
  itemContainer: {
    width: vw(90),
    margin: 2,
    height: vh(22),
    alignSelf: 'center',
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowColor: '#000',
    elevation: 3,
    backgroundColor: 'white',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationView: {
    width: '30%',
    justifyContent: 'center',
    height: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    color: '#489CD6',
  },
  serial: {
    color: '#c2c2c2',
    marginTop: 3,
    fontWeight: '700',
  },
  phoneImg: {
    width: 15,
    height: 15,
  },
  tag: {
    width: vw(7),
    height: vw(7),
    backgroundColor: 'rgb(33,73,118)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    marginTop: 3,
  },
  filterView: {
    height: vh(10),
    backgroundColor: 'rgb(243,250,253)',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  searcBarView: {
    marginTop: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  searchText: {
    height: vh(5),
    backgroundColor: '#f4f4f6',
    width: vw(92),
    marginLeft: 10,
    borderRadius: 10,
    paddingLeft: 10,
    borderWidth: 2,
    borderColor: '#c2c2c2',
    color: '#000',
  },
});

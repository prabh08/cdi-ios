/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  DeviceEventEmitter,
  Platform,
  Alert
} from 'react-native';
import Header from '../../components/Header';
import {getOrderHistory, performOfflineOrdersToServer} from '../../services/customer/customer';

import {vh, vw} from '../../utilities/Dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import Loader from '../../components/Loader';
import {formatNumber} from '../../utilities/utils';
import Database from '../../utilities/database/database';
import NetInfo from '@react-native-community/netinfo';
import {
	fetchSalesRepDataFromTable,
	deleteCartFromTable,
} from '../../utilities/database/database-queries';
import Tables from '../../services/Tables';
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dropdownContainer: {
    display: 'flex',
    backgroundColor: '#8AC7DB',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  itemContainer: {
    width: vw(100),
    margin: 2,
    height: vh(10),
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    paddingRight: 20,
  },
  searcBarView: {
    marginTop: 10,
    flexDirection: 'row',
    alignSelf: 'center',
    color: '#000',
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
  orderNumber: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
    marginVertical: 5,
  },
  orderDate: {
    color: '#c2c2c2',
    fontWeight: '600',
    marginVertical: 5,
  },
  orderSubTotal: {
    color: '#c2c2c2',
    fontWeight: '600',
    marginVertical: 5,
    textAlign: 'right',
  },
  noValuesFound: {
    width: vw(100),
    margin: 2,
    height: vh(10),
    alignSelf: 'center',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  noValueText: {
    fontSize: 20,
  },
});

const CustomerOrders = ({navigation, openOrders = false}) => {
  const [orderHistory, setOrderHistory] = React.useState([]);
  const [customOrderHistory, setCustomOrderHistory] = React.useState([]);
  const [statusType, setStatusType] = React.useState('All Status');
  const [durationType, setDurationType] = React.useState('3 Months');
  const [itemsInCart, setItemsInCart] = React.useState(0);
  const [counter, updateCounter] = React.useState(0);
  const [languageLiterals, setLanguageLiterals] = React.useState(null);
  const [customer, setCustomer] = React.useState({
    customerName: '',
    distance: '',
    customerNumber: '',
    customer_billing_address: [],
    number_of_days: '',
    totalOverdues: '',
    totalInvoices: '',
    custAmtInvoiced: '',
    creditLimit: '',
    phoneNumber: '',
    customerType: '',
  });
  const [dropDownSelected, setDropDownSelected] = React.useState({
    status: false,
    duration: false,
  });
  const [searchText, setText] = React.useState('');
  const [loader, setLoader] = React.useState(false);

  const fetchOrderHistory = React.useCallback(
    async (customerNumber, noOfMonths = 6) => {
      return NetInfo.fetch().then(async (state) => {
        setLoader(true);
        const loggedInUserData = await AsyncStorage.getItem('USER');
        const userData = JSON.parse(loggedInUserData);
        let offlineOrders = await Database.executeQuery(fetchSalesRepDataFromTable(Tables.ORDERS, userData.companyId, userData.userName));
        let resp = [];
        ////// for orders
        offlineOrdersCount = offlineOrders.rows.length;
        if (offlineOrdersCount > 0 && state.isConnected) { 
          for (let i = 0; i < offlineOrdersCount; i++) {

            let resOnlineAfterOrder = await performOfflineOrdersToServer(offlineOrders.rows.item(i).data);
            if (resOnlineAfterOrder !== null && resOnlineAfterOrder.status_code === 200 && (i + 1) == (offlineOrdersCount)) { 
              await Database.executeQuery(deleteCartFromTable(Tables.ORDERS, userData.companyId, userData.userName, customerNumber));
              console.log('Success Orders ', resOnlineAfterOrder);
              resp = await getOrderHistory(customerNumber, noOfMonths);
            }
          }
        } else {
          resp = await getOrderHistory(customerNumber, noOfMonths);
        }
      /**************************************************************** */
        
        console.log(resp, ' respopopp');
        // if(resp === undefined) {
        //   Alert.alert(
        //     `Data is not synced!`,
        //     '',
        //     [
        //       {
        //         text: 'OK',
        //         onPress: () => {
        //           navigation.goBack();
        //         },
        //       },
        //     ],
        //     {cancelable: false},
        //   );
        // } 

        if (resp !== null && resp !== undefined && resp.orders_history.length > 0) {
          setOrderHistory(resp.orders_history);
          setCustomOrderHistory(resp.orders_history);
          setLoader(false);
        }
        setLoader(false);
      }); 
    },
    [],
  );

  const onDurationClick = (noOfMonths) => {
    const toReplace = noOfMonths.includes(1) ? ' Month' : ' Months';
    const duration = noOfMonths.replace(toReplace, '');
    updateCounter(counter + 1);
    fetchOrderHistory(customer.customerNumber, duration);
  };

  React.useEffect(() => {
    (async function () {
      DeviceEventEmitter.addListener('RefreshOrders', async () => {
        const customerInfo = await AsyncStorage.getItem('CUSTOMER');
        setCustomer(JSON.parse(customerInfo));
        await AsyncStorage.setItem(
          'CUSTOMER_NUMBER',
          JSON.parse(customerInfo).customerNumber,
        );
        await fetchOrderHistory(JSON.parse(customerInfo).customerNumber);
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    (async function () {
      const customerInfo = await AsyncStorage.getItem('CUSTOMER');
      const cartItems = await AsyncStorage.getItem('IN_CART_PRODUCTS_LENGTH');
      const language = await AsyncStorage.getItem('LITERALS');
      setLanguageLiterals(JSON.parse(language));
      setItemsInCart(parseInt(cartItems, 10));
      setCustomer(JSON.parse(customerInfo));
      await AsyncStorage.setItem(
        'CUSTOMER_NUMBER',
        JSON.parse(customerInfo).customerNumber,
      );
      await fetchOrderHistory(JSON.parse(customerInfo).customerNumber);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectDropdown = (key, value) => {
    const otherKey = key === 'status' ? 'duration' : 'status';
    setDropDownSelected({
      ...dropDownSelected,
      [key]: value,
      [otherKey]: false,
    });
  };

  const renderItem = (item) => {
    let status = mapping[
      item.order_status[0].toUpperCase() + item.order_status.slice(1)
    ];

    if(status !== undefined) {
      status = status;
    } else if(item.order_status === 'Offline') {
      status = 'Offline Order';
    } else {
      status = 'Open';
    }

    const details = {
      orderNumber: item.order_number || 0,
      orderDate: `${languageLiterals && languageLiterals.LblPlacedOn} ${
        item.order_date || null
      }`,
      orderStatus:  status,
      subTotal: `$ ${item.order_summary?.order_total || 0}`,
    };
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={async () => {
          await AsyncStorage.setItem('HIDE_REPEAT_ORDER', 'false');
          await AsyncStorage.setItem(
            'CURRENT_ORDER_DETAILS',
            JSON.stringify(item),
          );
          if(details.orderStatus === 'Offline Order') {
            alert('Order is not synced!');
          } else {
            navigation.navigate('OrderDetails', {
              params: {customer: item, orderNumber: details.orderNumber},
              screen: 'OrderDetails',
            });
          }
          
        }}>
        <View style={styles.itemContainer}>
          <View
            style={{
              height: '100%',
              justifyContent: 'center',
            }}>
            <Text style={styles.orderNumber}>{details.orderNumber}</Text>
            <Text style={styles.orderDate}>{details.orderDate}</Text>
          </View>
          <View
            style={{
              height: '100%',
              justifyContent: 'center',
            }}>
            <Text style={styles.orderNumber}>
              ${formatNumber(details.subTotal)}
            </Text>
            <Text style={styles.orderSubTotal}>{details.orderStatus}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const statusTypes = [
    {
      label: languageLiterals ? languageLiterals.LblAllStatus : 'All Statuses',
      value: 'All Status',
    },
    {
      label: languageLiterals ? languageLiterals.LblOpen : 'Open',
      value: 'Open',
    },
    {
      label: languageLiterals ? languageLiterals.LblClosedOrder : 'Closed',
      value: 'Closed',
    },
  ];

  const durationTypes = [
    {
      value: '1 Month',
      label: languageLiterals ? `1 ${languageLiterals.LblMonth}` : '1 Month',
    },
    {
      value: '3 Months',
      label: languageLiterals ? `3 ${languageLiterals.LblMonth}` : '3 Months',
    },
    {
      value: '6 Months',
      label: languageLiterals ? `6 ${languageLiterals.LblMonth}` : '6 Months',
    },
  ];

  const mapping = {
    Open: languageLiterals ? languageLiterals.LblOpen : 'Open',
    Closed: languageLiterals ? languageLiterals.LblClosedOrder : 'Closed',
  };

  if (loader) {
    return (
      <View style={styles.container}>
        <Header
          title={customer.customerName}
          isLogOut
          navigation={navigation}
          isBack
          onBackPress={() => navigation.goBack()}
          showCart
          itemsInCart={itemsInCart}
        />
        <Loader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={customer.customerName}
        isLogOut
        navigation={navigation}
        isBack
        onBackPress={() => navigation.goBack()}
        showCart
        itemsInCart={itemsInCart}
      />
      <View>
        {Platform.OS === 'android' ? (
          <View style={styles.dropdownContainer}>
            <View
              style={{
                width: '50%',
                justifyContent: 'center',
                flexDirection: 'row',
              }}>
              <Text numberOfLines={1} style={{fontSize: 15, fontWeight: '400'}}>
                {languageLiterals && languageLiterals.LblAllStatus}
              </Text>
            </View>
            <View
              style={{
                width: '50%',
                justifyContent: 'center',
                flexDirection: 'column',
              }}>
              <Text
                style={{fontSize: 15, fontWeight: '400', textAlign: 'center'}}>
                {languageLiterals && languageLiterals.LblMonth}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.dropdownContainer}>
            <View>
              <TouchableOpacity onPress={() => selectDropdown('status', true)}>
                <Text style={{fontSize: 15, fontWeight: '400'}}>
                  {statusType !== 'All' ? statusType : 'All Status'}
                </Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity
                onPress={() => selectDropdown('duration', true)}>
                <Text style={{fontSize: 15, fontWeight: '400'}}>
                  {durationType !== 'Last 3 Months'
                    ? durationType
                    : 'Customer Type'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {Platform.OS === 'android' ? (
          <View
            style={{
              flexDirection: 'row',
              width: vw(100),
              justifyContent: 'space-around',
              backgroundColor: 'white',
            }}>
            <View
              style={{
                width: '50%',
                justifyContent: 'center',
                flexDirection: 'row',
              }}>
              <Picker
                selectedValue={statusType}
                style={{width: '100%', zIndex: 2}}
                onValueChange={(itemValue) => {
                  setStatusType(itemValue);
                  if (itemValue !== 'All Status') {
                    const list = orderHistory.filter(
                      (element) =>
                        element.order_status === itemValue.toLowerCase(),
                    );
                    setCustomOrderHistory(list);
                  } else {
                    setCustomOrderHistory(orderHistory);
                  }
                }}>
                {statusTypes.map((status, index) => (
                  <Picker.Item
                    key={index}
                    label={status.label}
                    value={status.value}
                  />
                ))}
              </Picker>
            </View>
            <View
              style={{
                width: '50%',
                justifyContent: 'center',
                flexDirection: 'column',
              }}>
              <Picker
                selectedValue={durationType}
                style={{width: '100%', zIndex: 2}}
                onValueChange={(itemValue) => {
                  if (itemValue !== durationType) {
                    setDurationType(itemValue);
                    onDurationClick(itemValue);
                  }
                }}>
                {durationTypes.map((duration, index) => (
                  <Picker.Item
                    key={index}
                    label={duration.label}
                    value={duration.value}
                  />
                ))}
              </Picker>
            </View>
          </View>
        ) : null}
      </View>
      <View style={styles.searcBarView}>
        <TextInput
          value={searchText}
          placeholder="Order Number and Price"
          placeholderTextColor="#333"
          style={styles.searchText}
          onChangeText={(text) => {
            console.log('text==', text);
            setText(text);
            if (text === '') {
              if (orderHistory.length > 0) {
                setCustomOrderHistory(orderHistory);
              } else {
                setCustomOrderHistory([]);
              }
            } else {
              const list = orderHistory.filter(
                (element) =>
                  element.order_number
                    .toLowerCase()
                    .includes(text.toLowerCase()) ||
                  element.order_summary.sub_total
                    .toString()
                    .toLowerCase()
                    .includes(text.toLowerCase()),
              );
              setCustomOrderHistory(list);
            }
          }}
        />
      </View>
      <FlatList
        data={customOrderHistory}
        style={{marginTop: 10, zIndex: 0, marginBottom: 2}}
        contentContainerStyle={{marginBottom: 20}}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => renderItem(item)}
        ListEmptyComponent={
          <View style={styles.noValuesFound}>
            <Text style={styles.noValueText}>No orders found.</Text>
          </View>
        }
      />
      {dropDownSelected.status && Platform.OS === 'ios' && (
        <Picker
          selectedValue={statusType}
          style={{width: '100%', zIndex: 2}}
          onValueChange={(itemValue) => {
            setStatusType(itemValue);
            selectDropdown('status', false);
            if (itemValue !== 'All Status') {
              const list = orderHistory.filter(
                (element) => element.order_status === itemValue.toLowerCase(),
              );
              setCustomOrderHistory(list);
            } else {
              setCustomOrderHistory(orderHistory);
            }
          }}>
          {statusTypes.map((status, index) => (
            <Picker.Item
              key={index}
              label={status.label}
              value={status.value}
            />
          ))}
        </Picker>
      )}
      {dropDownSelected.duration && Platform.OS === 'ios' && (
        <Picker
          selectedValue={durationType}
          style={{width: '100%', zIndex: 2}}
          onValueChange={(itemValue) => {
            setDurationType(itemValue);
            selectDropdown('duration', false);
            onDurationClick(itemValue);
          }}>
          {durationTypes.map((duration, index) => (
            <Picker.Item
              key={index}
              label={duration.label}
              value={duration.value}
            />
          ))}
        </Picker>
      )}
    </View>
  );
};

export default CustomerOrders;

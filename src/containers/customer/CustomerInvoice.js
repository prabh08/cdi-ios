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
  //   Image,
  Alert
} from 'react-native';
import Button from '../../components/Button';
import Header from '../../components/Header';
import {getInvoiceHistory, offlineInvoicesToServer} from '../../services/customer/customer';

import {vh, vw} from '../../utilities/Dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import Loader from '../../components/Loader';
import CheckBox from '@react-native-community/checkbox';
import {formatNumber} from '../../utilities/utils';
import Tables from '../../services/Tables';
import Database from '../../utilities/database/database';
import {
  fetchCompanyDataFromTable,
  fetchSalesRepDataFromTable,
  deleteCartFromTable
} from '../../utilities/database/database-queries';
import NetInfo from '@react-native-community/netinfo';

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
  searchTextStyle: {
    margin: 30,
    backgroundColor: 'white',
    height: 40,
    width: vw(95),
    borderColor: 'gray',
    shadowColor: 'gray',
    shadowOffset: {width: 0, height: 1},
    padding: 10,
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
    marginTop: 0,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  searchText: {
    height: vh(5),
    backgroundColor: 'rgb(244,244,246)',
    width: vw(92),
    marginLeft: 10,
    borderRadius: 10,
    paddingLeft: 10,
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
  invoiceDate: {
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
  collectPaymentButton: {
    marginTop: 0,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#489CD6',
    color: '#489CD6',
    width: vw(50),
    borderRadius: 5,
    height: vh(5),
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 15,
  },
  totalPanelInvoiceContainer: {
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: vh(7),
    alignItems: 'center',
  },
  totalPanelInvoiceText: {
    fontSize: 20,
  },
});

const CustomInvoice = ({navigation, route}) => {
  const [orderHistory, setOrderHistory] = React.useState([]);
  const [customOrderHistory, setCustomOrderHistory] = React.useState([]);
  const [statusType, setStatusType] = React.useState('All Status');
  const [selectAllCheckbox, setSelectAllCheckbox] = React.useState(false);
  const [selectedInvoices, setSelectedInvoices] = React.useState([]);
  const [totalOutstanding, setTotalOutstanding] = React.useState(0);
  const [itemsInCart, setItemsInCart] = React.useState(0);
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
  const [languageLiterals, setLanguageLiterals] = React.useState(null);

  const fetchOrderHistory = React.useCallback(async (customerNumber) => {
    return NetInfo.fetch().then(async (state) => {
      // *****************************syncing invoices**********************************
      const loggedInUserData = await AsyncStorage.getItem('USER');
      const userData = JSON.parse(loggedInUserData);
      let resp = [];
      ////// for invoies 
      let offlineInvoices = await Database.executeQuery(fetchSalesRepDataFromTable(Tables.INVOICES, userData.companyId, userData.userName));
      offlineInvoicesCount = offlineInvoices.rows.length;
      if (offlineInvoicesCount > 0 && state.isConnected) { 
        for (let i = 0; i < offlineInvoicesCount; i++) {
          let res = await offlineInvoicesToServer(offlineInvoices.rows.item(i).data);
          if (res !== null && res.status_code === 200 && (i + 1) == (offlineInvoicesCount)) { 
            console.log('Success Invoices');
            await Database.executeQuery(deleteCartFromTable(Tables.INVOICES, userData.companyId, userData.userName));
            resp = await getInvoiceHistory(customerNumber);
          }
        }
      } else {
        resp = await getInvoiceHistory(customerNumber);
        console.log(resp)
      }
      // **************************************************************************

      let customersInvoice = await Database.executeQuery(fetchCompanyDataFromTable(Tables.INVOICES, userData.companyId, userData.userName, customerNumber));
      let customerDataLength = customersInvoice.rows.length;
      var customersInvoiceArray = [];
      if (customerDataLength > 0) { 
        for (let i = 0; i < customersInvoice.rows.length; i++) {
          let invoiceNumber = JSON.parse(customersInvoice.rows.item(i).data).request.payment_data[0].invoice_num;
          customersInvoiceArray.push(invoiceNumber);
        } 
      }

      if(resp !== null && resp !== undefined && resp.invoices && resp.invoices.length > 0) {
        resp.invoices.filter(el => {
          return !customersInvoiceArray.find(element => {
              if(element) {
                if(element === el.invoice_number) {
                  el.offline_order = 1;
                }
              }
          });
        });
      }

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
      
      if (resp !== null && resp !== undefined && resp.invoices.length > 0) {
        if (
          resp.invoices.length === 1 &&
          typeof resp.invoices[0] === 'string' &&
          resp.invoices[0].trim() === ''
        ) {
          setOrderHistory([]);
          setCustomOrderHistory([]);
        } else {
          setOrderHistory(resp.invoices);
          setCustomOrderHistory(resp.invoices);
        }
        setLoader(false);
      }
      setLoader(false);
    }); 
  }, []);

  const onLoad = async () => {
    setLoader(true);
    const language = await AsyncStorage.getItem('LITERALS');
    setLanguageLiterals(JSON.parse(language));
    const customerInfo = await AsyncStorage.getItem('CUSTOMER');
    const cartItems = await AsyncStorage.getItem('IN_CART_PRODUCTS_LENGTH');
    setItemsInCart(parseInt(cartItems, 10));
    setCustomer(JSON.parse(customerInfo));
    await AsyncStorage.setItem(
      'CUSTOMER_NUMBER',
      JSON.parse(customerInfo).customerNumber,
    );
    await fetchOrderHistory(JSON.parse(customerInfo).customerNumber);
  };

  React.useEffect(() => {
    const mount = async () => {
      DeviceEventEmitter.addListener('RefreshInvoices', async () => {
        onLoad();
      });
      onLoad();
    };
    mount();
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

  const addInvoices = (invoiceNumber, value, outstandingValue) => {
    let areAllCheckboxesChecked = false;
    if (value) {
      setSelectedInvoices(() => [...selectedInvoices, invoiceNumber]);
      setTotalOutstanding(() => totalOutstanding + outstandingValue);
      areAllCheckboxesChecked =
        orderHistory.filter((elm) => elm.status === 2).length ===
        [...selectedInvoices, invoiceNumber].length;
    } else {
      setSelectedInvoices(() => [
        ...selectedInvoices.filter((elm) => elm !== invoiceNumber),
      ]);
      setTotalOutstanding(() => totalOutstanding - outstandingValue);
      areAllCheckboxesChecked =
        orderHistory.filter((elm) => elm.status === 2).length ===
        [...selectedInvoices.filter((elm) => elm !== invoiceNumber)].length;
    }
    setSelectAllCheckbox(areAllCheckboxesChecked);
  };

  const selectAllCheckboxes = (newValue) => {
    if (newValue) {
      let arr = orderHistory.filter((elm) => [2, 3].includes(elm.status));
      let outstanding = 0;
      arr.forEach((elm) => {
        outstanding = outstanding + elm.outstanding;
      });
      arr = arr.map((elm) => elm.invoice_number);
      setSelectedInvoices(arr);
      setTotalOutstanding(outstanding);
    } else {
      setSelectedInvoices([]);
      setTotalOutstanding(0);
    }
    setSelectAllCheckbox(newValue);
  };

  const onCollectPayment = async () => {
    const requestBody = orderHistory.filter((elm) =>
      selectedInvoices.includes(elm.invoice_number),
    );
    await AsyncStorage.setItem(
      'CURRENT_INVOICE_DETAILS',
      JSON.stringify(requestBody),
    );
    navigation.navigate('CollectPayment', {
      screen: 'CollectPayment',
    });
  };

  const statusArray = [
    'All Status',
    'Paid',
    'Overdue',
    'Pending Payment',
    'Partial',
  ];

  const statusTypes = [
    {
      label: languageLiterals ? languageLiterals.LblAllStatus : 'All Status',
      value: 'All Status',
    },
    {
      label: languageLiterals ? languageLiterals.LblPaid : 'Paid',
      value: 'Paid',
    },
    {
      label: languageLiterals ? languageLiterals.LblOverdue : 'Overdue',
      value: 'Overdue',
    },
    {
      label: languageLiterals
        ? languageLiterals.LblPendingPayment
        : 'Pending Payment',
      value: 'Pending Payment',
    },
    {
      label: languageLiterals ? languageLiterals.LblPartial : 'Partial',
      value: 'Partial',
    },
  ];

  const statusCodes = [
    {
      label: languageLiterals ? languageLiterals.LblAllStatus : 'All Status',
      color: 'orange',
    },
    {
      label: languageLiterals ? languageLiterals.LblPaid : 'Paid',
      color: 'green',
    },
    {
      label: languageLiterals ? languageLiterals.LblOverdue : 'Overdue',
      color: 'red',
    },
    {
      label: languageLiterals
        ? languageLiterals.LblPendingPayment
        : 'Pending Payment',
      color: 'gray',
    },
    {
      label: languageLiterals ? languageLiterals.LblPartial : 'Partial',
      color: 'yellow',
    },
  ];

  const renderItem = (item) => {
    const details = {
      orderNumber: item?.order_number || 0,
      status: item?.status || 0,
      dueOn: item?.due_on || new Date().toLocaleDateString(),
      collected: item?.collected || 0,
      invoiceNumber: item?.invoice_number || 0,
      total: item?.total || 0,
      outstandingAmount: item?.outstanding || 0,
    };
    return (
      <TouchableOpacity
        style={{width: '100%'}}
        onPress={async () => {
          await AsyncStorage.setItem(
            'CURRENT_INVOICE_DETAILS',
            JSON.stringify(item),
          );
          navigation.navigate('InvoiceDetails', {
            params: {invoice: item, orderNumber: details.invoiceNumber},
            screen: 'InvoiceDetails',
          });
        }}>
        <View
          style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'row',
            margin: 10,
            borderBottomColor: '#c2c2c2',
            paddingBottom: 10,
            borderBottomWidth: 1,
          }}>
          {/* <View style={{ display: "flex", flexDirection: "row", width: "20%" }}>
                        <Image
                            source={overdueImage}
                            style={{
                                width: '80%',
                                height: '50%',
                                marginTop: 20,
                                alignSelf: 'center',
                            }}
                        />
                    </View> */}
          <View style={{width: '100%'}}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
              }}>
              <View style={{width: '32%'}}>
                <Text style={styles.orderNumber}>
                  Order {details?.orderNumber || 'Order'}
                </Text>
              </View>
              <View
                style={{
                  width: '68%',
                  flexDirection: 'row',
                  justifyContent:
                    details.status === 2 ? 'space-around' : 'flex-start',
                  alignItems: 'center',
                }}>
                {details.status !== 0  && !item.offline_order && (
                  <View
                    style={{
                      backgroundColor: statusCodes[details.status].color,
                      marginLeft: 10,
                      display: 'flex',
                      alignItems: 'center',
                      width: details.status === 3 ? 110 : 80,
                      height: 25,
                      justifyContent: 'center',
                      borderRadius: 5,
                      padding: 0,
                    }}>
                    <Text style={{color: '#fff', fontSize: 12}}>
                      {statusCodes[details.status].label}
                    </Text>
                  </View>
                )}
                {((details.status === 2 || details.status === 3) && item.offline_order === 1) && (
                  <TouchableOpacity
                    onPress={async () => {
                      const requestBody = orderHistory.filter(
                        (elm) => elm.invoice_number === details.invoiceNumber,
                      );
                      await AsyncStorage.setItem(
                        'CURRENT_INVOICE_DETAILS',
                        JSON.stringify(requestBody),
                      );
                      navigation.navigate('CollectPayment', {
                        params: {
                          invoice: item,
                          orderNumber: item.invoiceNumber,
                        },
                        screen: 'CollectPayment',
                      });
                    }}>
                    <View
                      style={{
                        backgroundColor: '#489CD6',
                        marginLeft: 10,
                        display: 'flex',
                        alignItems: 'center',
                        width: 100,
                        height: 25,
                        justifyContent: 'center',
                        borderRadius: 5,
                      }}>
                      <Text style={{color: '#fff', fontSize: 12}}>
                        Offline Order
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                {((details.status === 2 || details.status === 3) && !item.offline_order) && (
                  <TouchableOpacity
                    onPress={async () => {
                      const requestBody = orderHistory.filter(
                        (elm) => elm.invoice_number === details.invoiceNumber,
                      );
                      await AsyncStorage.setItem(
                        'CURRENT_INVOICE_DETAILS',
                        JSON.stringify(requestBody),
                      );
                      navigation.navigate('CollectPayment', {
                        params: {
                          invoice: item,
                          orderNumber: item.invoiceNumber,
                        },
                        screen: 'CollectPayment',
                      });
                    }}>
                    <View
                      style={{
                        backgroundColor: '#489CD6',
                        marginLeft: 10,
                        display: 'flex',
                        alignItems: 'center',
                        width: 100,
                        height: 25,
                        justifyContent: 'center',
                        borderRadius: 5,
                      }}>
                      <Text style={{color: '#fff', fontSize: 12}}>
                        Collect Payment
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                {((details.status === 2 || details.status === 3) && !item.offline_order) && (
                  <TouchableOpacity
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginLeft: 20,
                    }}>
                    <View
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: 20,
                      }}>
                      <CheckBox
                        boxType="square"
                        value={selectedInvoices.includes(details.invoiceNumber)}
                        onValueChange={(newValue) =>
                          addInvoices(
                            details.invoiceNumber,
                            newValue,
                            details.outstandingAmount,
                          )
                        }
                        tintColors={{true: '#F15927', false: 'black'}}
                        style={{
                          height: 20,
                          width: 20,
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              {!item.offline_order && (
                <View
                  style={{
                    width: '50%',
                    justifyContent: 'flex-start',
                  }}>
                  <Text numberOfLines={1} style={styles.invoiceDate}>
                    {languageLiterals && languageLiterals.LblDueOn}{' '}
                    {details.dueOn}
                  </Text>
                </View>
              )}
               {!item.offline_order && (
                <View
                  style={{
                    width: '50%',
                    justifyContent: 'flex-end',
                  }}>
                  <Text style={[styles.invoiceDate, {textAlign: 'right'}]}>
                    {languageLiterals && languageLiterals.LblCollected}{': $'}
                    {details.collected}
                  </Text>
                </View>
              )}
            </View>
            <View
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  width: '50%',
                  justifyContent: 'flex-start',
                }}>
                <Text numberOfLines={1} style={styles.invoiceDate}>
                  {languageLiterals && languageLiterals.LblInvoice}{' '}
                  {details.invoiceNumber}
                </Text>
              </View>
              <View
                style={{
                  width: '50%',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                }}>
                <Text numberOfLines={1} style={styles.invoiceDate}>
                  {languageLiterals && languageLiterals.LblTotal}: $
                  {formatNumber(details.total)}
                </Text>
              </View>
            </View>
            <Text style={{fontSize: 16}}>
              {languageLiterals && languageLiterals.LblOutstanding}: $
              {formatNumber(details.outstandingAmount)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loader) {
    return (
      <View style={styles.container}>
        <Header
          title={customer.customerName}
          isLogOut
          navigation={navigation}
          isBack
          showCart
          onBackPress={() => navigation.goBack()}
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
        showCart
        onBackPress={() => navigation.goBack()}
        itemsInCart={itemsInCart}
      />
      <View style={styles.dropdownContainer}>
        <View
          style={
            Platform.OS === 'android'
              ? {
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40%',
                }
              : {}
          }>
          {Platform.OS === 'android' ? (
            <Picker
              mode="dropdown"
              selectedValue={statusType}
              style={{width: vw(40), zIndex: 2}}
              onValueChange={(itemValue) => {
                setStatusType(itemValue);
                if (statusArray.indexOf(itemValue)) {
                  const list = orderHistory.filter(
                    (element) =>
                      element.status === statusArray.indexOf(itemValue),
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
          ) : (
            <TouchableOpacity onPress={() => selectDropdown('status', true)}>
              <Text style={{fontSize: 15, fontWeight: '400'}}>
                {statusType !== 'Order' ? statusType : 'All Status'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View
          style={
            Platform.OS === 'android'
              ? {
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '60%',
                }
              : {
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }
          }>
          <CheckBox
            boxType="square"
            disabled={false}
            value={selectAllCheckbox}
            onValueChange={(newValue) => selectAllCheckboxes(newValue)}
            tintColors={{true: '#F15927', false: 'black'}}
            style={{
              height: 20,
              width: 20,
            }}
          />
          <Text style={{marginLeft: 10}}>
            {languageLiterals && languageLiterals.LblSelectAll}
          </Text>
        </View>
      </View>
      <View style={styles.searcBarView}>
        <TextInput
          value={searchText}
          placeholder={
            languageLiterals && languageLiterals.LblInvoiceOrOrderNumberSearch
          }
          placeholderTextColor="#333"
          style={styles.searchTextStyle}
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
                  element.invoice_number
                    .toLowerCase()
                    .includes(text.toLowerCase()),
              );
              setCustomOrderHistory(list);
            }
          }}
        />
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.collectPaymentButton}>
          <Button
            disabled={selectedInvoices.length === 0}
            onClick={onCollectPayment}
            color="white"
            label={languageLiterals && languageLiterals.LblCollectPayment}
          />
        </View>
      </View>
      <View style={styles.totalPanelInvoiceContainer}>
        <View
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text style={styles.totalPanelInvoiceText}>
            {languageLiterals && languageLiterals.LblSelectedInvoice}{' '}
            {orderHistory.invoice_number}
          </Text>
          <Text style={styles.totalPanelInvoiceText}>
            {languageLiterals && languageLiterals.LblTotalOutstanding}
          </Text>
        </View>
        <View
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text style={styles.totalPanelInvoiceText}>
            {selectedInvoices.length}
          </Text>
          <Text style={styles.totalPanelInvoiceText}>
            ${formatNumber(totalOutstanding)}
          </Text>
        </View>
      </View>
      <FlatList
        data={customOrderHistory}
        style={{marginTop: 10, zIndex: 0, marginBottom: 20}}
        contentContainerStyle={{marginBottom: 20}}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => renderItem(item)}
        ListEmptyComponent={
          <View style={styles.noValuesFound}>
            <Text style={styles.noValueText}>
              {languageLiterals && languageLiterals['200_no_invoices']}
            </Text>
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
            if (statusArray.indexOf(itemValue)) {
              const list = orderHistory.filter(
                (element) => element.status === statusArray.indexOf(itemValue),
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
    </View>
  );
};

export default CustomInvoice;

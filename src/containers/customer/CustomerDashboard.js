/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  DeviceEventEmitter,
  Platform,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Header from '../../components/Header';
import userImg from '../../assets/icons/user-profile.jpg';
import locImg from '../../assets/customer/ic_location.png';
import phoneImg from '../../assets/customer/ic_call.png';
import mailImg from '../../assets/customer/ic_mail.png';
import {statusBarHeight, vh, vw} from '../../utilities/Dimensions';
import {formatNumber} from '../../utilities/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import {
  getFormattedAddress,
  getInCartProducts,
} from '../../services/customer/customer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    width: vw(100),
    margin: 2,
    height: vh(18),
    alignSelf: 'center',
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
    fontSize: 18,
    color: '#489CD6',
  },
  serial: {
    marginTop: 3,
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
  snapShotView: {
    marginTop: 5,
    backgroundColor: 'white',
    height: 'auto',
    paddingTop: 10,
    paddingBottom: 15,
  },
  snapShotTitle: {
    color: 'black',
    marginTop: 10,
    marginLeft: 10,
    fontSize: 16,
  },
  subHeading: {
    fontSize: 16,
  },
  salesValue: {
    color: 'green',
    marginTop: 2,
    fontSize: 20,
  },
  otherValues: {
    color: 'black',
    marginTop: 4,
    fontSize: 20,
  },
  paymentInformationView: {
    marginTop: 5,
    backgroundColor: 'white',
    height: vh(10),
    paddingTop: 10,
  },
  addressView: {
    marginTop: 5,
    backgroundColor: 'white',
    height: 'auto',
    paddingBottom: 15,
    paddingTop: 10,
  },
  dashboard_container: {
    height: 'auto',
  },
  shippingAddressContainer: {
    padding: 10,
    backgroundColor: '#eee',
    marginVertical: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c2c2c2',
    marginHorizontal: 10,
    paddingBottom: 20,
  },
});

const CustomerDashboard = ({navigation, route}) => {
  const [offline, setOffline] = React.useState(false);
  const [shippingAddress, setShippingAddress] = React.useState('');
  const [billingAdddress, setBillingAddress] = React.useState('');
  const [allShippingAddresses, setAllShippingAddresses] = React.useState([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = React.useState(
    null,
  );
  const [itemsInCart, setItemsInCart] = React.useState(0);
  const [dropDownSelected, setDropDownSelected] = React.useState({
    billingAddress: false,
    shippingAddress: false,
  });
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
    customer_picture: '',
  });

  React.useEffect(() => {
    (async function () {
      return NetInfo.fetch().then(async (state) => {
        if(!state.isConnected) {
          setOffline(true);
        } else {
          setOffline(false);
        }
        const storedCustomer = await AsyncStorage.getItem('CUSTOMER');
        setCustomer(JSON.parse(storedCustomer));
        const cus = JSON.parse(storedCustomer);
        const billingAdd =
          cus.customer_billing_address.length > 0
            ? getFormattedAddress(cus.customer_billing_address[0])
            : '';
        const allShippingAdd = cus.customer_shipping_addresses.map(
          (elm, index) => ({
            value: index,
            label: getFormattedAddress(elm, false),
          }),
        );
        const shippingAdd = cus.customer_shipping_addresses.filter(
          (elm) => elm.primaryAddress,
        );
        setAllShippingAddresses(allShippingAdd);
        setSelectedShippingAddress(allShippingAdd[0]);
        setShippingAddress(getFormattedAddress(shippingAdd[0], false));
        setBillingAddress(billingAdd);
        if(state.isConnected) {
          const resp = await getInCartProducts(cus.customerNumber, false);
          DeviceEventEmitter.emit('RefreshPage', {});
          let total = 0;
          if (resp === null || resp === undefined) {
            await AsyncStorage.setItem('IN_CART_PRODUCTS_LENGTH', '0');
          } else if (resp !== null && resp.in_cart_products.length > 0) {
            resp.in_cart_products.forEach((elm) => {
              total = total + elm.quantity;
            });
            await AsyncStorage.setItem('IN_CART_PRODUCTS_LENGTH', total.toString());
          } else if (resp.error_message !== '') {
            await AsyncStorage.setItem('IN_CART_PRODUCTS_LENGTH', '0');
          } else {
            await AsyncStorage.setItem('IN_CART_PRODUCTS_LENGTH', '0');
          }
          setItemsInCart(total.toString());
        }
        const language = await AsyncStorage.getItem('LITERALS');
        setLanguageLiterals(JSON.parse(language));
      });
    })();
  }, []);

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
      <ScrollView style={styles.dashboard_container}>
        <View style={styles.itemContainer}>
          {!offline && (
            <View style={styles.locationView}>
              {/* <Image source={locImg} style={{height: vh(5), width: vh(5)}} /> */}
              <Image
                source={{uri: customer.customer_picture}}
                style={{height: vh(15), width: vw(25)}}
              />
              {/* <Text>{`${customer.distance} mi`}</Text> */}
            </View>
          )}
          {offline && (
            <View style={styles.locationView}>
              {/* <Image source={locImg} style={{height: vh(5), width: vh(5)}} /> */}
              <Image
                source={userImg}
                style={{height: vh(15), width: vw(25)}}
              />
            </View>
          )}
          <View
            style={{
              height: '100%',
              width: '70%',
              marginLeft: 10,
              justifyContent: 'center',
            }}>
            <Text style={styles.title}>{customer.customerName}</Text>
            <Text style={styles.serial}>{customer.customerNumber}</Text>
            {/* <Text
            style={{
              marginTop: 3,
              width: '80%',
            }}>
            {customer.customer_billing_address.length > 0
              ? `${customer.customer_billing_address[0].billingAdd1} ${customer.customer_billing_address[0].billingAdd2} ${customer.customer_billing_address[0].billingAdd3} ${customer.customer_billing_address[0].billingCity} ${customer.customer_billing_address[0].billingState}  ${customer.customer_billing_address[0].billingZip}`
              : ''}
          </Text> */}
            <Text style={styles.serial}>{`${customer.number_of_days} ${
              languageLiterals && languageLiterals?.LblXDaysSinceLastVisit
            }`}</Text>
            {customer.phoneNumber !== '' && (
              <View style={{flexDirection: 'row', marginTop: 3}}>
                <Image source={phoneImg} style={styles.phoneImg} />
                <Text>{customer.phoneNumber}</Text>
              </View>
            )}
            {customer.emailId !== '' && (
              <View style={{flexDirection: 'row', marginTop: 3}}>
                <Image source={mailImg} style={styles.phoneImg} />
                <Text>{customer.emailId}</Text>
              </View>
            )}
            <View style={styles.tag}>
              <Text style={{color: 'white'}}>{customer.customerType}</Text>
            </View>
          </View>
        </View>
        <View style={styles.snapShotView}>
          <Text style={styles.snapShotTitle}>Overall Snapshot</Text>
          <View
            style={{
              flexDirection: 'row',
              marginLeft: 10,
              marginTop: 10,
            }}>
            <View style={{alignItems: 'flex-start', width: vw(50)}}>
              <Text style={styles.subHeading}>
                {languageLiterals && languageLiterals.LblTotalSales}
              </Text>
              <Text style={styles.salesValue}>{`$ ${formatNumber(
                customer.totalSales,
              )}`}</Text>
            </View>
            <View style={{alignItems: 'flex-start', width: vw(50)}}>
              <Text style={styles.subHeading}>
                {languageLiterals && languageLiterals.LblSalesInLast} 90{' '}
                {languageLiterals && languageLiterals.LblDays}
              </Text>
              <Text style={styles.salesValue}>{`$ ${formatNumber(
                customer.totalSales,
              )}`}</Text>
            </View>
          </View>
        </View>
        <View
          style={{
            marginTop: 5,
            backgroundColor: 'white',
            height: statusBarHeight > 23 ? vh(26) : vh(23),
            paddingTop: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 10,
              marginLeft: 10,
            }}>
            <View style={{alignItems: 'flex-start', width: vw(50)}}>
              <Text style={styles.subHeading}>
                {languageLiterals && languageLiterals.LblAvailableCredit}
              </Text>
              <Text style={styles.otherValues}>{`$ ${formatNumber(
                customer.availCredit,
              )}`}</Text>
              <Text
                style={{
                  marginTop: 3,
                  fontSize: 16,
                }}>{`Credit Limit: $ ${formatNumber(
                customer.creditLimit,
              )}`}</Text>
            </View>
            <View style={{alignItems: 'flex-start', width: vw(50)}}>
              <Text style={styles.subHeading}>
                {languageLiterals && languageLiterals.LblOpenOrder}
              </Text>
              <Text style={styles.otherValues}>{`$ ${formatNumber(
                customer.totalOpenOrderAmt,
              )}`}</Text>
              <TouchableOpacity
                onPress={async () => {
                  navigation.navigate('Orders');
                }}>
                <Text
                  style={{
                    color: '#489CD6',
                    marginTop: 3,
                  }}>{`${languageLiterals && languageLiterals.LblViewOrder}(${
                  customer.totalOpenOrder
                })`}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 25,
              marginLeft: 10,
            }}>
            <View style={{alignItems: 'flex-start', width: vw(50)}}>
              <Text style={styles.subHeading}>
                {languageLiterals && languageLiterals.LblAmountInvoiced}
              </Text>
              <Text style={styles.otherValues}>{`$ ${formatNumber(
                customer.custAmtInvoiced,
              )}`}</Text>
              <TouchableOpacity
                onPress={async () => {
                  navigation.navigate('CustomerInvoice');
                }}>
                <Text
                  style={{
                    color: '#489CD6',
                    marginTop: 10,
                  }}>{`${languageLiterals && languageLiterals.LblViewInvoice}(${
                  customer.totalInvoices
                })`}</Text>
              </TouchableOpacity>
            </View>
            <View style={{alignItems: 'flex-start', width: vw(50)}}>
              <Text style={styles.subHeading}>
                {languageLiterals && languageLiterals.LblAmountOverdue}
              </Text>
              <Text
                style={[styles.otherValues, {color: 'red'}]}>{`$ ${formatNumber(
                customer.amtOverdue,
              )}`}</Text>
            </View>
          </View>
        </View>
        <View style={styles.paymentInformationView}>
          <Text style={styles.snapShotTitle}>
            {languageLiterals && languageLiterals.LblPaymentInformation}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              marginLeft: 10,
              marginTop: 10,
            }}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <View style={{alignItems: 'flex-start', width: vw(40)}}>
                <Text style={styles.subHeading}>
                  {languageLiterals && languageLiterals.LblPaymentTerm}
                </Text>
              </View>
              <View style={{alignItems: 'flex-start', width: vw(60)}}>
                <Text style={styles.subHeading}>{customer.paymentTerm}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.paymentInformationView}>
          <Text style={styles.snapShotTitle}>
            {languageLiterals && languageLiterals.LblPriceBook}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              marginLeft: 10,
              marginTop: 10,
            }}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <View style={{alignItems: 'flex-start', width: vw(40)}}>
                <Text style={styles.subHeading}>
                  {languageLiterals && languageLiterals.LblPriceList}
                </Text>
              </View>
              <View style={{alignItems: 'flex-start', width: vw(60)}}>
                <Text style={styles.subHeading}>
                  {customer.priceList || 'NONE'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.addressView}>
          {selectedShippingAddress?.label && (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setDropDownSelected({
                    ...dropDownSelected,
                    shippingAddress: true,
                  });
                }
              }}>
              <Text style={styles.snapShotTitle}>
                {languageLiterals && languageLiterals.LblShippingInformation}
              </Text>
              <Text style={styles.snapShotTitle}>{customer.customerName}</Text>
              <View style={styles.shippingAddressContainer}>
                {Platform.OS === 'android' ? (
                  <Picker
                    mode="dialog"
                    selectedValue={selectedShippingAddress.label}
                    style={[{width: '100%', zIndex: 2}]}
                    onValueChange={(itemValue) => {
                      setSelectedShippingAddress(
                        allShippingAddresses[itemValue],
                      );
                      setDropDownSelected({
                        ...dropDownSelected,
                        shippingAddress: false,
                      });
                    }}>
                    {allShippingAddresses.map((address, index) => (
                      <Picker.Item
                        key={index}
                        label={address.label}
                        value={address.value}
                      />
                    ))}
                  </Picker>
                ) : (
                  <Text style={styles.snapShotTitle}>
                    {selectedShippingAddress?.label || ''}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.addressView}>
          <Text style={styles.snapShotTitle}>
            {languageLiterals && languageLiterals.LblBillingInformation}
          </Text>
          <Text style={styles.snapShotTitle}>{customer.customerName}</Text>
          <Text style={styles.snapShotTitle}>{billingAdddress}</Text>
        </View>
      </ScrollView>
      {dropDownSelected.shippingAddress && Platform.OS === 'ios' && (
        <Picker
          selectedValue={selectedShippingAddress.label}
          style={{width: '100%', zIndex: 2}}
          onValueChange={(itemValue) => {
            setSelectedShippingAddress(allShippingAddresses[itemValue]);
            setDropDownSelected({
              ...dropDownSelected,
              shippingAddress: false,
            });
          }}>
          {allShippingAddresses.map((address, index) => (
            <Picker.Item
              key={index}
              label={address.label}
              value={address.value}
            />
          ))}
        </Picker>
      )}
    </View>
  );
};

export default CustomerDashboard;

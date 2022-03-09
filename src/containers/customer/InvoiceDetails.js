/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, StyleSheet, FlatList, Image, Platform} from 'react-native';
import Header from '../../components/Header';

import {vh, vw} from '../../utilities/Dimensions';
import defaultImage from '../../assets/icons/ic_product_default.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader';
import stylesAndroid from '../styles/InvoiceDetails/AndroidStyles';

const stylesiOS = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  repeatOrderBtn: {
    marginTop: 10,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#489CD6',
    color: '#489CD6',
    width: vw(80),
    borderRadius: 5,
  },
  itemContainer: {
    width: vw(100),
    marginBottom: 5,
    height: vh(10),
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  orderStatusContainer: {
    width: vw(100),
    marginBottom: 5,
    height: vh(27),
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
  },
  orderedItemsContainer: {
    width: vw(100),
    flexGrow: 1,
    marginBottom: 0,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
    marginVertical: 5,
    flexWrap: 'wrap',
  },
  orderDate: {
    // color: '#c2c2c2',
    fontWeight: '600',
    paddingVertical: 8,
  },
  orderSubTotal: {
    color: '#c2c2c2',
    fontWeight: '600',
    marginVertical: 5,
    textAlign: 'right',
  },
  orderEntryLeft: {
    color: '#c2c2c2',
    fontWeight: '600',
    paddingVertical: 5,
    width: '45%',
  },
  orderEntryRight: {
    color: '#c2c2c2',
    fontWeight: '600',
    paddingVertical: 5,
    width: '55%',
  },
  orderEntryLeftBlack: {
    color: 'black',
    fontWeight: '600',
    paddingVertical: 5,
    width: '45%',
  },
  orderEntryRightBlack: {
    color: 'black',
    fontWeight: '600',
    paddingVertical: 5,
    width: '55%',
  },
  entryName: {
    fontSize: 18,
    color: '#489CD6',
    fontWeight: '500',
    marginVertical: 5,
    flexWrap: 'wrap',
  },
  entryContainer: {
    width: vw(100),
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 10,
  },
});

const InvoiceDetails = ({navigation, route}) => {
  const styles = Platform.OS === 'android' ? stylesAndroid : stylesiOS;
  const [orderHistory, setOrderHistory] = React.useState([]);
  const [orderedItems, setOrderedItems] = React.useState([]);
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
  const [loader, setLoader] = React.useState(true);

  React.useEffect(() => {
    (async function () {
      const language = await AsyncStorage.getItem('LITERALS');
      setLanguageLiterals(JSON.parse(language));
      setLoader(true);
      const customerInfo = await AsyncStorage.getItem('CUSTOMER');
      setCustomer(JSON.parse(customerInfo));
      const orderDetails = await AsyncStorage.getItem(
        'CURRENT_INVOICE_DETAILS',
      );
      setOrderHistory(JSON.parse(orderDetails));
      console.log(orderDetails);
      setOrderedItems(JSON.parse(orderDetails).invoice_items);
      setLoader(false);
    })();
  }, []);

  if (loader) {
    return <Loader />;
  }

  const renderItem = (item) => {
    const details = {
      image:
        item.product_info.pictures.length > 0
          ? item.product_info.pictures[0]
          : '',
    };
    return (
      <View style={styles.entryContainer}>
        <View style={{display: 'flex', flexDirection: 'row', width: '30%'}}>
          {details.image !== '' ? (
            <Image
              source={{uri: details.image}}
              resizeMode="contain"
              style={{
                width: '80%',
                height: '50%',
                marginTop: 20,
                alignSelf: 'center',
                backgroundColor: 'white',
              }}
            />
          ) : (
            <Image
              source={defaultImage}
              style={{
                width: '80%',
                height: '50%',
                marginTop: 20,
                alignSelf: 'center',
              }}
            />
          )}
        </View>
        <View style={{width: '65%'}}>
          <Text numberOfLines={1} style={styles.entryName}>
            {item?.description || 'Description'}
          </Text>
          <View
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              flexDirection: 'row',
            }}>
            <Text style={styles.orderEntryLeft}>
              {languageLiterals && languageLiterals.LblItem}
            </Text>
            <Text
              style={
                (styles.orderEntryRight, {width: '60%', color: '#c2c2c2'})
              }>
              {item?.item_number || ''}
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              flexDirection: 'row',
            }}>
            <Text style={styles.orderEntryLeft}>
              {languageLiterals && languageLiterals.LblUnitPrice}
            </Text>
            <Text style={styles.orderEntryRight}>
              ${item?.product_info?.more_product_data[0]?.unit_price || 0}
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              flexDirection: 'row',
            }}>
            <Text style={styles.orderEntryLeft}>
              {languageLiterals && languageLiterals.LblSize}
            </Text>
            <Text style={styles.orderEntryRight}>{item?.item_size || ''}</Text>
          </View>
          <View
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              flexDirection: 'row',
            }}>
            <Text style={styles.orderEntryLeft}>
              {languageLiterals && languageLiterals.LblInStock}
            </Text>
            <Text style={styles.orderEntryRight}>
              {item?.product_info?.more_product_data[0]?.in_stock ||
                'Not Applicable'}
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              flexDirection: 'row',
            }}>
            <Text style={styles.orderEntryLeft}>
              {languageLiterals && languageLiterals.LblQuantityInCart}
            </Text>
            <Text style={styles.orderEntryRight}>
              {item?.quantity || 'Not Applicable'}
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              flexDirection: 'row',
            }}>
            <Text style={styles.orderEntryLeftBlack}>
              {languageLiterals && languageLiterals.LblTotal}
            </Text>
            <Text style={styles.orderEntryRightBlack}>
              $
              {parseFloat(
                parseInt(item?.quantity, 10) *
                  parseFloat(
                    item?.product_info?.more_product_data[0]?.unit_price,
                  ),
              ).toFixed(2) || '0'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={customer.customerName}
        isLogOut
        navigation={navigation}
        isBack
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.itemContainer}>
        <View
          style={{
            height: '100%',
            justifyContent: 'center',
            width: '50%',
          }}>
          <Text numberOfLines={1} style={styles.orderNumber}>
            {languageLiterals && languageLiterals.LblInvoice}{' '}
            {orderHistory.invoice_number}
          </Text>
          <Text style={styles.orderDate}>{orderHistory.invoice_date}</Text>
        </View>
        <View
          style={{
            height: '100%',
            justifyContent: 'flex-end',
            width: '50%',
            alignContent: 'flex-end',
          }}>
          <Text style={[styles.orderNumber, {textAlign: 'right'}]}>
            {languageLiterals && languageLiterals.LblInvoiced}
          </Text>
          <Text style={[styles.orderDate, {textAlign: 'right'}]}>
            Due on: {orderHistory.due_on}
          </Text>
        </View>
      </View>
      <View style={styles.orderStatusContainer}>
        <View
          style={{
            justifyContent: 'center',
          }}>
          <Text style={styles.orderNumber}>
            {languageLiterals && languageLiterals.LblOrderSummary}
          </Text>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              justifyContent: 'center',
            }}>
            <Text style={styles.orderDate}>
              {languageLiterals && languageLiterals.LblShipping_Handling}
            </Text>
            <Text style={styles.orderDate}>
              {languageLiterals && languageLiterals.LblCityTax}
            </Text>
            <Text style={styles.orderDate}>
              {languageLiterals && languageLiterals.LblStateTax}
            </Text>
            <Text style={styles.orderDate}>
              {languageLiterals && languageLiterals.LblTotal}
            </Text>
            <Text style={styles.orderDate}>
              {languageLiterals && languageLiterals.LblCollected}
            </Text>
            <Text style={(styles.orderDate, {color: 'black'})}>
              {languageLiterals && languageLiterals.LblTotalOutstanding}
            </Text>
          </View>
          <View
            style={{
              justifyContent: 'center',
            }}>
            <Text style={styles.orderDate}>
              ${orderHistory?.shipping_tax || 0}
            </Text>
            <Text style={styles.orderDate}>${orderHistory?.city_tax || 0}</Text>
            <Text style={styles.orderDate}>
              ${orderHistory?.state_tax || 0}
            </Text>
            <Text style={styles.orderDate}>${orderHistory?.total || 0}</Text>
            <Text style={styles.orderDate}>
              ${orderHistory?.collected || 0}
            </Text>
            <Text style={(styles.orderDate, {color: 'black'})}>
              ${orderHistory.outstanding || 0}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.orderedItemsContainer}>
        <View>
          <FlatList
            data={orderedItems}
            style={{marginTop: 10, zIndex: 0, marginBottom: 20}}
            contentContainerStyle={{marginBottom: 20}}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => renderItem(item)}
            ListEmptyComponent={
              <View style={styles.noValuesFound}>
                <Text style={styles.noValueText}>
                  {languageLiterals && languageLiterals.LblNoInvoices}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </View>
  );
};

export default InvoiceDetails;

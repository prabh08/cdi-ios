/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, StyleSheet, FlatList, Image} from 'react-native';
import Button from '../../components/Button';
import Header from '../../components/Header';
import {
  getOrderDetails,
  // performCartActions,
  // getInCartProducts,
} from '../../services/customer/customer';
// import ServiceCall from '../../services/EndPoints';

import {vh, vw} from '../../utilities/Dimensions';
import defaultImage from '../../assets/icons/ic_product_default.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader';
import {formatNumber} from '../../utilities/utils';

const styles = StyleSheet.create({
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
    width: vw(85),
    margin: 20,
    height: vh(10),
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  orderStatusContainer: {
    width: vw(85),
    margin: 20,
    height: vh(25),
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
  },
  orderedItemsContainer: {
    width: vw(85),
    margin: 20,
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
    color: 'black',
    fontWeight: '600',
    paddingVertical: 8,
  },
  orderTotal: {
    color: 'black',
    fontWeight: '900',
    paddingVertical: 8,
  },
  orderSubTotal: {
    color: 'black',
    fontWeight: '600',
    marginVertical: 5,
    textAlign: 'right',
  },
});

const OrderDetails = ({navigation, route}) => {
  const [orderHistory, setOrderHistory] = React.useState([]);
  const [orderedItems, setOrderedItems] = React.useState([]);
  const [hideRepeatOrder, setHideRepeatOrder] = React.useState(false);
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
  const [loader, setLoader] = React.useState(false);

  const fetchOrderDetails = React.useCallback(
    async (customerNumber, orderNumber) => {
      const resp = await getOrderDetails(customerNumber, orderNumber);
      if (resp !== null && resp.ordered_items.length > 0) {
        resp.ordered_items.forEach((elm) => {
          if (orderHistory.order_summary) {
            elm.unit_price = parseFloat(
              orderHistory.order_summary.sub_total,
            ).toFixed(2);
          }
        });
        setOrderedItems(resp.ordered_items);
        console.log('orderItems ', JSON.stringify(resp.ordered_items));
        setLoader(false);
      }
      setLoader(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onRepeatOrder = async () => {
    setLoader(true);
    await AsyncStorage.setItem(
      'CURRENT_CHECKOUT_ITEMS',
      JSON.stringify(orderHistory.items_ordered),
    );
    await AsyncStorage.setItem(
      'ORDER_SUMMARY',
      JSON.stringify(orderHistory.order_summary),
    );
    await AsyncStorage.setItem('IS_ORDER_SUMMARY_PRESENT', 'true');
    console.log(JSON.stringify(orderHistory));
    navigation.navigate('Checkout', {
      screen: 'Checkout',
    });
    setLoader(false);
  };

  React.useEffect(() => {
    (async function () {
      setLoader(true);
      const language = await AsyncStorage.getItem('LITERALS');
      setLanguageLiterals(JSON.parse(language));
      const customerInfo = await AsyncStorage.getItem('CUSTOMER_NUMBER');
      const orderDetails = await AsyncStorage.getItem('CURRENT_ORDER_DETAILS');
      const hideRepeat = await AsyncStorage.getItem('HIDE_REPEAT_ORDER');
      setHideRepeatOrder(hideRepeat === 'true');
      setOrderHistory(JSON.parse(orderDetails));
      setCustomer(customerInfo);
      await fetchOrderDetails(
        customerInfo,
        JSON.parse(orderDetails).order_number,
      );
      setLoader(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loader) {
    return (
      <View style={styles.container}>
        <Header
          title={languageLiterals && languageLiterals.LblOrder}
          isLogOut
          navigation={navigation}
          isBack
          onBackPress={() => navigation.goBack()}
        />
        <Loader />
      </View>
    );
  }

  const renderItem = (item) => {
    const details = {
      image:
        item.product_info.pictures.length > 0
          ? item.product_info.pictures[0]
          : '',
    };
    return (
      <View
        style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'row',
          marginVertical: 10,
        }}>
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
        <View style={{width: '70%'}}>
          <Text style={styles.orderNumber}>
            {item?.description || 'Description'}
          </Text>
          <Text style={styles.orderDate}>
            {item?.product_info?.more_product_data[0]?.color ||
              'Not Applicable'}
          </Text>
          <Text style={styles.orderDate}>
            {languageLiterals && languageLiterals.LblItem} #:{' '}
            {item?.item_number || 0}
          </Text>
          <Text style={(styles.orderDate, {color: 'black'})}>
            {/* ${item?.sell_price}/UOM */}
            {`$${formatNumber(item?.sell_price)}`}/UOM
          </Text>
          <Text style={styles.orderDate}>
            {languageLiterals && languageLiterals.LblQuantity}: {item.quantity}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={languageLiterals && languageLiterals.LblOrder}
        isLogOut
        navigation={navigation}
        isBack
        onBackPress={() => navigation.goBack()}
      />
      {!hideRepeatOrder && (
        <View>
          <View style={styles.buttonContainer}>
            <View style={styles.repeatOrderBtn}>
              <Button
                onClick={async () => onRepeatOrder()}
                color="white"
                label={languageLiterals && languageLiterals.LblRepeatThisOrder}
              />
            </View>
          </View>
        </View>
      )}
      <View style={styles.itemContainer}>
        <View
          style={{
            height: '100%',
            justifyContent: 'center',
          }}>
          <Text style={styles.orderNumber}>
            {languageLiterals && languageLiterals.LblOrderNumber}{' '}
            {orderHistory?.order_number}
          </Text>
          <Text style={styles.orderDate}>
            {languageLiterals && languageLiterals.LblPlacedOn}{' '}
            {orderHistory?.order_date}
          </Text>
        </View>
        <View
          style={{
            height: '100%',
            justifyContent: 'center',
          }}>
          <Text style={styles.orderSubTotal}>
            {(orderHistory?.order_status &&
              orderHistory.order_status.toString()[0].toUpperCase() +
                orderHistory.order_status.toString().slice(1)) ||
              'Open'}
          </Text>
          <Text style={styles.orderNumber} />
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
              {languageLiterals && languageLiterals.LblSubTotal}
            </Text>
            <Text style={styles.orderDate}>
              {languageLiterals && languageLiterals.LblShipping_Handling}
            </Text>
            <Text style={styles.orderDate}>
              {languageLiterals && languageLiterals.LblStateTax}
            </Text>
            <Text style={styles.orderDate}>
              {languageLiterals && languageLiterals.LblCityTax}
            </Text>
            <Text style={styles.orderTotal}>
              {languageLiterals && languageLiterals.LblOrderTotal}
            </Text>
          </View>
          <View
            style={{
              justifyContent: 'center',
            }}>
            <Text style={styles.orderDate}>
              {`$${formatNumber(orderHistory?.order_summary?.sub_total || 0)} `}
            </Text>
            <Text style={styles.orderDate}>
              {`$${formatNumber(
                orderHistory?.order_summary?.shipping_tax || 0,
              )} `}
            </Text>
            <Text style={styles.orderDate}>
              {`$${formatNumber(orderHistory?.order_summary?.state_tax || 0)} `}
            </Text>
            <Text style={styles.orderDate}>
              {`$${formatNumber(orderHistory?.order_summary?.city_tax || 0)} `}
            </Text>
            <Text style={styles.orderTotal}>
              {`$${formatNumber(
                orderHistory?.order_summary?.order_total || 0,
              )} `}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.orderedItemsContainer}>
        <View
          style={{
            justifyContent: 'center',
          }}>
          <Text style={(styles.orderNumber, {fontSize: 14})}>
            {languageLiterals && languageLiterals.LblShippedOn} {':   '}
            <Text style={{fontWeight: '400', color: 'black'}}>
              {orderHistory?.order_date || new Date().toISOString()}
            </Text>
          </Text>
        </View>
        <View>
          <FlatList
            data={orderedItems}
            style={{marginTop: 10, zIndex: 0, marginBottom: 20}}
            contentContainerStyle={{marginBottom: 20}}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => renderItem(item)}
            ListEmptyComponent={
              <View style={styles.noValuesFound}>
                <Text style={styles.noValueText}>No orders found.</Text>
              </View>
            }
          />
        </View>
      </View>
    </View>
  );
};

export default OrderDetails;

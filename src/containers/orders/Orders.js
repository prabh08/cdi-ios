/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import Header from '../../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader';
import {getOrderHistory} from '../../services/customer/customer';
import {formatNumber} from '../../utilities/utils';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
  },
});

const Orders = ({navigation}) => {
  const [ordersList, setOrdersList] = React.useState([]);
  const [loader, setLoader] = React.useState(false);
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

  const fetchOrderHistory = React.useCallback(
    async (customerNumber, noOfMonths = 12) => {
      setLoader(true);
      const language = await AsyncStorage.getItem('LITERALS');
      setLanguageLiterals(JSON.parse(language));
      const resp = await getOrderHistory(customerNumber, noOfMonths);
      if (resp !== null && resp !== undefined && resp.orders_history.length > 0) {
        const list = resp.orders_history.filter(
          (element) => element.order_status === 'open' || element.order_status === 'partially shipped',
        );
        setOrdersList(list);
        setLoader(false);
      }
      setLoader(false);
    },
    [],
  );

  React.useEffect(() => {
    (async function () {
      // const customerInfo = await AsyncStorage.getItem('CUSTOMER');
      const customerInfo = await AsyncStorage.getItem('CUSTOMERNUMBER');
      setCustomer(customerInfo);
      await AsyncStorage.setItem(
        'CUSTOMER_NUMBER',
        // JSON.parse(customerInfo).customerNumber,
        customerInfo
      );
      // await fetchOrderHistory(JSON.parse(customerInfo).customerNumber);
      await fetchOrderHistory(customerInfo);

    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderRow = (item) => {
    const details = {
      orderNumber: item.order_number || 0,
      orderDate: `${languageLiterals.LblPlacedOn} ${item.order_date || null}`,
      orderStatus: item.order_status[0].toUpperCase() + item.order_status.slice(1) || 'Open',
      pending_amount: `$ ${item.order_summary?.pending_amount || 0}`,
    };
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={async () => {
          await AsyncStorage.setItem(
            'CURRENT_ORDER_DETAILS',
            JSON.stringify(item),
          );
          await AsyncStorage.setItem('HIDE_REPEAT_ORDER', 'true');
          navigation.navigate('OrderDetails', {
            params: {customer: item, orderNumber: item.orderNumber},
            screen: 'OrderDetails',
          });
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottomColor: '#d2d2d2',
            borderBottomWidth: 1,
          }}>
          <View style={{marginBottom: 10, marginTop: 10}}>
            <Text style={styles.title}>
              {languageLiterals.LblOrder} {details.orderNumber}
            </Text>
            <Text style={{marginTop: 10}}>{`${details.orderDate}`}</Text>
          </View>
          <View style={{marginBottom: 10, marginTop: 10}}>
            <Text>{`$ ${formatNumber(details.pending_amount)} `}1</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return languageLiterals ? (
    <View style={styles.container}>
      <Header
        title={
          `${languageLiterals.LblOpen} ${languageLiterals.LblOrders}` ||
          'Open Orders'
        }
        isLogOut
        navigation={navigation}
        isBack
        onBackPress={() => navigation.goBack()}
      />
      {loader ? (
        <Loader />
      ) : (
        <FlatList
          data={ordersList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => renderRow(item)}
          style={{width: '94%', alignSelf: 'center'}}
        />
      )}
    </View>
  ) : null;
};

export default Orders;

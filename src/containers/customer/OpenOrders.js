/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import Header from '../../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {formatNumber} from '../../utilities/utils';
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    marginTop: 5,
  },
  customerNumber: {
    fontSize: 18,
    color: '#489CD6',
  },
  openOdrer: {
    color: '#489CD6',
    marginTop: 10,
  },
  rightTitle: {
    fontSize: 18,
    marginTop: 5,
    textAlign: 'right',
  },
});

const OpenOrders = ({navigation}) => {
  const [totalOrdersList, setTotalOrdersList] = React.useState([]);
  const [listToShow, setListToShow] = React.useState([]);
  const [languageLiterals, setLanguageLiterals] = React.useState(null);
  // const [customers, setCustomers] = React.useState([]);
  // const [customerOrders, setCustomerOrders] = React.useState([]);
  React.useEffect(() => {
    (async function () {
      const language = await AsyncStorage.getItem('LITERALS');
      setLanguageLiterals(JSON.parse(language));
      const openOrders = await AsyncStorage.getItem('OPEN_ORDERS');
      setTotalOrdersList(JSON.parse(openOrders));
      const orders = JSON.parse(openOrders);
      const uniqueCustomers = [];
      orders.forEach((elm) => {
        if (!uniqueCustomers.includes(elm.customerNumber)) {
          uniqueCustomers.push(elm.customerNumber);
          uniqueCustomers.push({
            customerName: elm.customerName,
            customerNumber: elm.customerNumber,
          });
        }
      });
      const finalJSON = [];

      uniqueCustomers.forEach((customerData, index) => {
        if (customerData.customerNumber && customerData.customerName) {
          const ordersList = orders.filter(
            (elm) => elm.customerNumber === customerData.customerNumber,
          );
          let total = 0;
          let date = '';
          ordersList.forEach((order) => {
            total = total + order.openAmt;
            if (date === '' || date < order.orderDate) {
              date = order.orderDate;
            }
          });
          finalJSON.push({
            orderAmt: total,
            customerNumber: customerData.customerNumber,
            customerName: customerData.customerName,
            orderDate: date || 'Null',
          });
        }
      });
      setListToShow([...finalJSON]);
    })();
  }, []);

  const renderRow = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={async () => {
          await AsyncStorage.setItem('CUSTOMERNUMBER', item.customerNumber);
          const totalOrders = totalOrdersList.filter(
            (elm) => elm.customerNumber === item.customerNumber,
          );
          await AsyncStorage.setItem(
            'ORDERS_TO_DISPLAY',
            JSON.stringify(totalOrders),
          );
          navigation.navigate('Orders', {
            params: {customer: item, orderNumber: item.orderNumber},
            screen: 'Orders',
          });
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottomColor: '#d2d2d2',
            borderBottomWidth: 1,
          }}>
          <View style={{width: '50%'}}>
            <View style={{marginBottom: 10, marginTop: 10, maxHeight: 45}} >
              <Text style={styles.customerNumber}>
                {languageLiterals.LblCustomerNumber || 'Customer Number'}
              </Text>
              <Text style={styles.title}>{item.customerNumber}</Text>
            </View>
            <View style={{marginBottom: 10, marginTop: 10}}>
              <Text numberOfLines={1}>
                {languageLiterals.LblName || 'Name'}: {item.customerName}
              </Text>
            </View>
          </View>
          <View style={{width: '50%'}}>
            <View style={{marginBottom: 10, marginTop: 10, maxHeight: 45}}>
              <Text style={styles.rightTitle}>
                {languageLiterals.LblOrderTotal || 'Order Total'}
              </Text>
              <Text style={styles.rightTitle}>{`$ ${formatNumber(
                parseFloat(item.orderAmt)
                  .toFixed(2)
                  .toString()
                  .toLocaleString(),
              )}`}</Text>
            </View>
            <View style={{marginBottom: 10, marginTop: 10}}>
              <Text style={{textAlign: 'right'}}>
                {languageLiterals.LblOrderedOn || 'Ordered On'}:{' '}
                {item.orderDate}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return languageLiterals ? (
    <View style={styles.container}>
      <Header
        title={
          `${languageLiterals.LblCustomers} ${languageLiterals.LblOpen} ${languageLiterals.LblOrders}` ||
          'Customer Open Orders'
        }
        isLogOut
        navigation={navigation}
        isBack
        onBackPress={() => navigation.goBack()}
      />
      <FlatList
        data={listToShow}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderRow}
        style={{width: '94%', alignSelf: 'center'}}
      />
    </View>
  ) : null;
};

export default OpenOrders;

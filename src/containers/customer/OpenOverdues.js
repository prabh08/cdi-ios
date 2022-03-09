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
  titleOrderNumber: {
    fontSize: 18,
    color: '#000000',
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

const OpenOverdues = ({navigation}) => {
  const [totalOrdersList, setTotalOrdersList] = React.useState([]);
  const [listToShow, setListToShow] = React.useState([]);
  const [languageLiterals, setLanguageLiterals] = React.useState(null);
  // const [customers, setCustomers] = React.useState([]);
  // const [customerOrders, setCustomerOrders] = React.useState([]);
  React.useEffect(() => {
    (async function () {
      const language = await AsyncStorage.getItem('LITERALS');
      setLanguageLiterals(JSON.parse(language));
      const OpenOverdues = await AsyncStorage.getItem('OPEN_OVERDUE');
      console.log('OpenOverdues', OpenOverdues)
      // const OpenOverdues = await AsyncStorage.getItem('OPEN_ORDERS');
      setTotalOrdersList(JSON.parse(OpenOverdues));
      const orders = JSON.parse(OpenOverdues);
      const uniqueCustomers = [];
      const finalJSON = [];

      orders.forEach((customerData, index) => {
        if (customerData.customerNumber && customerData.customerName) {
          finalJSON.push({
            orderAmt: customerData.overdueAmount,
            customerNumber: customerData.customerNumber,
            customerName: customerData.customerName,
            orderDate: customerData.due_on || 'Null',
            description: customerData.description1,
            orderNumber: customerData.orderNumber,
          });
        }
      });
      setListToShow([...finalJSON]);
    })();
  }, []);

  const renderRow = ({item}) => {
    return (
      
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
             <View style={{marginBottom: 10, marginTop: 10, maxHeight: 45}} >
              <Text style={styles.titleOrderNumber}>
                {languageLiterals.OrderNumber || 'Order Number'}
              </Text>
              <Text style={styles.title}>{item.orderNumber}</Text>
            </View>
          </View>
          <View style={{width: '50%'}}>
            <View style={{marginBottom: 10, marginTop: 10, maxHeight: 45}}>
              <Text style={styles.rightTitle}>
                {languageLiterals.LblOverdue || 'Order Total'}
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
                {languageLiterals.LblDueOn || 'Due On'}:{' '}
                {item.orderDate}
              </Text>
            </View>
            <View style={{marginBottom: 10, marginTop: 10}}>
              <Text style={{textAlign: 'right'}}>
                {languageLiterals.LblInvoice || 'Invoice'}#:{' '}
                {item.description}
              </Text>
            </View>
          </View>
        </View>
    );
  };

  return languageLiterals ? (
    <View style={styles.container}>
      <Header
        title={
          `${languageLiterals.LblCustOverdue}` ||
          'Customer Overdue'
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

export default OpenOverdues;

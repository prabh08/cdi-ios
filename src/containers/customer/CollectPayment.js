/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import Header from '../../components/Header';
import Button from '../../components/Button';
import {collectPayment} from '../../services/customer/customer';

import {vh, vw} from '../../utilities/Dimensions';
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
  collectPaymentButton: {
    marginTop: 10,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#489CD6',
    color: '#489CD6',
    width: vw(50),
    borderRadius: 5,
    height: vh(5),
  },
  itemContainer: {
    width: vw(100),
    marginBottom: 5,
    height: vh(13),
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  textInput: {
    height: vh(5),
    marginLeft: 10,
    borderRadius: 10,
    paddingLeft: 10,
    borderBottomColor: '#489CD6',
    borderBottomWidth: 2,
    color: '#489CD6',
    fontSize: 18,
  },
  totalPanelContainer: {
    backgroundColor: '#E0FFFF',
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: vh(7),
    alignItems: 'center',
  },
  totalPanelText: {
    fontWeight: '600',
    fontSize: 20,
  },
  totalPanelInvoiceContainer: {
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: vh(7),
    alignItems: 'center',
  },
  totalPanelInvoiceText: {
    fontSize: 20,
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
  orderStatusChequeContainer: {
    width: vw(100),
    marginBottom: 5,
    height: vh(33),
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
  },
  orderedItemsContainer: {
    width: vw(100),
    flexGrow: 1,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 10,
    flex: 1,
  },
  invoiceMainHeading: {
    fontSize: 20,
    color: '#000',
    fontWeight: '600',
    marginVertical: 3,
    flexWrap: 'wrap',
  },
  invoiceInfoHeading: {
    fontSize: 20,
    color: '#c2c2c2',
    fontWeight: '600',
    marginVertical: 3,
    flexWrap: 'wrap',
  },
  orderNumber: {
    fontSize: 20,
    color: '#000',
    fontWeight: '600',
    marginVertical: 5,
    flexWrap: 'wrap',
  },
  orderDate: {
    color: '#c2c2c2',
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
  },
  paymentModeContainer: {
    width: '30%',
    height: 60,
    borderColor: '#c2c2c2',
    borderWidth: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 10,
  },
  paymentModeContainerSelected: {
    width: '30%',
    height: 60,
    borderColor: '#c2c2c2',
    borderWidth: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 10,
    backgroundColor: '#F5F5F5',
  },
});

const CollectPayment = ({navigation}) => {
  const [orderHistory, setOrderHistory] = React.useState([]);
  const [paymentType, setPaymentType] = React.useState('Cash');
  const [chequeNumber, setChequeNumber] = React.useState('');
  const [amount, setAmount] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const [totalAmountOfInvoices, setTotalAmountOfInvoices] = React.useState(0);
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

  React.useEffect(() => {
    (async function () {
      setLoader(true);
      const customerInfo = await AsyncStorage.getItem('CUSTOMER');
      const language = await AsyncStorage.getItem('LITERALS');
      setLanguageLiterals(JSON.parse(language));
      setCustomer(JSON.parse(customerInfo));
      const orderDetails = await AsyncStorage.getItem(
        'CURRENT_INVOICE_DETAILS',
      );
      setOrderHistory(JSON.parse(orderDetails));
      let outstanding = 0;
      JSON.parse(orderDetails).forEach((elm) => {
        outstanding = outstanding + elm.outstanding;
      });
      setTotal(formatNumber(outstanding));
      setTotalAmountOfInvoices(outstanding);
      setLoader(false);
    })();
  }, []);

  const paymentModes = [
    {
      value: 'Cash',
      label: languageLiterals ? languageLiterals.LblCash : 'Cash',
    },
    {
      value: 'Cheque',
      label: languageLiterals ? languageLiterals.LblCheck : 'Cheque',
    },
  ];

  const collectPaymentAPI = async (paymentData) => {
    setLoader(true);
    const resp = await collectPayment(customer.customerNumber, paymentData);
    console.log(resp, ' invoiceResponse');
    if (resp !== null) {
      Alert.alert(
        'Payment Saved Successfully.',
        '',
        [
          {
            text: 'OK',
            onPress: () => {
              DeviceEventEmitter.emit('RefreshInvoices', {});
              navigation.navigate('CustomerInvoice', {
                screen: 'CustomerInvoice',
              });
            },
          },
        ],
        {cancelable: false},
      );
      setLoader(false);
    }
    setLoader(false);
  };

  const onCollectPayment = async () => {
    const request = orderHistory.map((elm) => ({
      invoice_num: elm.invoice_number,
      order_number: elm.order_number,
      payment_type: paymentType.toLowerCase(),
      payment_amt: total,
      cheque_num: paymentType.toLowerCase() === 'cheque' ? chequeNumber : '',
    }));
    await collectPaymentAPI(request);
  };

  if (loader) {
    return <Loader />;
  }

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
            justifyContent: 'flex-start',
            marginTop: 10,
          }}>
          <Text style={styles.invoiceMainHeading}>
            {languageLiterals && languageLiterals.LblAvailableCredit}
          </Text>
          <Text style={styles.invoiceMainHeading}>
            ${formatNumber(customer?.availCredit)}
          </Text>
          <Text style={styles.orderDate}>
            {languageLiterals && languageLiterals.LblCreditLimit}: $
            {formatNumber(customer.creditLimit)}
          </Text>
        </View>
        <View
          style={{
            height: '100%',
            justifyContent: 'flex-start',
            marginTop: 10,
          }}>
          <Text style={styles.invoiceInfoHeading}>
            {languageLiterals && languageLiterals.LblPaymentDate}
          </Text>
          <Text style={styles.invoiceInfoHeading}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View
        style={
          paymentType === 'Cheque'
            ? styles.orderStatusChequeContainer
            : styles.orderStatusContainer
        }>
        <View
          style={{
            justifyContent: 'center',
          }}>
          <Text style={styles.orderNumber}>
            {languageLiterals && languageLiterals.LblPaymentMethod}
          </Text>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
          }}>
          {paymentModes.map((elm, index) => (
            <TouchableOpacity
              style={
                elm.value.toString() === paymentType.toString()
                  ? styles.paymentModeContainerSelected
                  : styles.paymentModeContainer
              }
              onPress={() => setPaymentType(elm.value)}
              key={index}>
              <View>
                <Text
                  style={{
                    color:
                      elm.value.toString() === paymentType.toString()
                        ? '#489CD6'
                        : '#c2c2c2',
                    fontSize: 20,
                  }}>
                  {elm.label.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {paymentType === 'Cheque' && (
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              margin: 10,
            }}>
            <View
              style={{width: '25%', display: 'flex', justifyContent: 'center'}}>
              <Text style={{fontSize: 18, color: '#c2c2c2', fontWeight: '600'}}>
                {languageLiterals && languageLiterals.LblChequeNumber}
              </Text>
            </View>
            <View
              style={{width: '75%', display: 'flex', justifyContent: 'center'}}>
              <TextInput
                value={chequeNumber}
                placeholder={
                  languageLiterals && languageLiterals.LblChequeNumber
                }
                placeholderTextColor="#333"
                keyboardType="default"
                maxLength={10}
                onChangeText={(text) => setChequeNumber(text)}
                style={styles.textInput}
              />
            </View>
          </View>
        )}
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            margin: 10,
          }}>
          <View
            style={{width: '20%', display: 'flex', justifyContent: 'center'}}>
            <Text style={{fontSize: 18, color: '#c2c2c2', fontWeight: '600'}}>
              {languageLiterals && languageLiterals.LblAmount}
            </Text>
          </View>
          <View
            style={{width: '5%', display: 'flex', justifyContent: 'center'}}>
            <Text style={{fontSize: 18, fontWeight: '600'}}>$</Text>
          </View>
          <View
            style={{width: '75%', display: 'flex', justifyContent: 'center'}}>
            <TextInput
              value={total}
              placeholder="Enter Amount"
              placeholderTextColor="#333"
              keyboardType="default"
              maxLength={10}
              onChangeText={(text) => {
                setTotal(text.replace(/[^0-9.]/g, ''));
              }}
              style={styles.textInput}
              editable={true}
            />
          </View>
        </View>
      </View>
      <View style={styles.orderedItemsContainer}>
        <View style={styles.totalPanelContainer}>
          <Text style={styles.totalPanelText}>
            {languageLiterals && languageLiterals.LblTotalInv}
          </Text>
          <Text style={styles.totalPanelText}>${formatNumber(total)}</Text>
        </View>
        <View style={styles.totalPanelInvoiceContainer}>
          <Text style={styles.totalPanelInvoiceText}>
            {languageLiterals && languageLiterals.LblTotalInvoice}&nbsp;
            {orderHistory.length > 1
              ? `(${orderHistory.length})`
              : orderHistory[0]?.invoice_number}
          </Text>
          <Text style={styles.totalPanelInvoiceText}>
            ${formatNumber(totalAmountOfInvoices)}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <View style={styles.collectPaymentButton}>
            <Button
              onClick={onCollectPayment}
              color="white"
              label={languageLiterals && languageLiterals.LblCollectPayment}
              disabled={paymentType === 'Cheque' && !chequeNumber}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default CollectPayment;

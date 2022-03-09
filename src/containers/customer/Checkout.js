/* eslint-disable react-native/no-inline-styles */
import React, {createRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  DeviceEventEmitter,
  Platform,
} from 'react-native';
import SignatureCapture from 'react-native-signature-capture';
import Header from '../../components/Header';
import Button from '../../components/Button';
import {
  performCheckout,
  paymentAPI,
  getFormattedAddress,
  getTermsAndConditionsPDF,
  getPaymentApiData
} from '../../services/customer/customer';
import {NetworkInfo} from 'react-native-network-info';
import {formatNumber} from '../../utilities/utils';
import {statusBarHeight, vh, vw} from '../../utilities/Dimensions';
import defaultImage from '../../assets/icons/ic_product_default.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader';
import CheckBox from '@react-native-community/checkbox';
import Geolocation from '@react-native-community/geolocation';
import {Picker} from '@react-native-picker/picker';
import {getBasicHeader} from '../../services/common/common';
import Pdf from 'react-native-pdf';
import PDFIcon from '../../assets/icons/ic_pdf.png';
import {getCurrentDateInString} from '../../utilities/utils';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    borderTopColor: '#eee',
    borderTopWidth: 5,
    marginTop: 5,
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
  addressContainer: {
    width: vw(100),
    height: statusBarHeight > 23 ? vh(22) : vh(18),
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
  },
  orderedItemsContainer: {
    width: vw(100),
    flexGrow: 1,
    marginBottom: 0,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    height: 'auto',
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
  orderStatusContainer: {
    width: vw(100),
    marginBottom: 5,
    height: vh(27),
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
  },
  orderStatusProductContainer: {
    width: vw(100),
    marginBottom: 5,
    height: 'auto',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    borderTopColor: '#eee',
    borderTopWidth: 5,
  },
  orderStatusChequeContainer: {
    width: vw(100),
    marginBottom: 5,
    height: 'auto',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    borderTopColor: '#eee',
    borderTopWidth: 5,
  },
  orderStatusOnlineContainer: {
    width: vw(100),
    marginBottom: 5,
    height: 'auto',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    borderTopColor: '#eee',
    borderTopWidth: 5,
  },
  cardDetailsText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentModeContainer: {
    height: 50,
    borderColor: '#c2c2c2',
    borderWidth: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 2,
    margin: 10,
    width: '20%',
  },
  paymentModeContainerSelected: {
    height: 50,
    borderColor: '#c2c2c2',
    borderWidth: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 10,
    paddingHorizontal: 2,
    backgroundColor: '#F5F5F5',
    width: '20%',
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
  textInputExpiry: {
    height: vh(5),
    marginLeft: 10,
    borderRadius: 10,
    paddingLeft: 10,
    borderBottomColor: '#489CD6',
    borderBottomWidth: 2,
    color: '#489CD6',
    fontSize: 18,
    width: vw(10),
  },
  addToCartButton: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#489CD6',
    color: '#489CD6',
    width: vw(40),
    borderRadius: 5,
    height: vh(5),
  },
  signature: {
    flex: 1,
    borderColor: '#000033',
    borderWidth: 1,
  },
  tabDetailsText: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: vw(90),
    paddingVertical: 15,
    alignContent: 'center',
  },
  tabDetailsTextRight: {
    fontSize: 18,
    width: vw(30),
    alignSelf: 'center',
  },
  tabDetailsTextLeft: {
    fontSize: 18,
    width: vw(60),
    marginHorizontal: 10,
    alignSelf: 'center',
  },
  textDiscInput: {
    height: 'auto',
    borderBottomColor: '#489CD6',
    borderBottomWidth: 2,
    fontSize: 18,
    width: vw(60),
  },
  pdf: {
    flex: 1,
    width: vw(100),
  },
  pdfIcon: {
    width: 25,
    height: 25,
    marginLeft: 10,
  },
});

const Checkout = ({navigation, route}) => {
  const [loggedInUser, setLoggedInUser] = React.useState([]);
  const [languageLiterals, setLanguageLiterals] = React.useState(null);
  const [orderedItems, setOrderedItems] = React.useState([]);
  const [paymentType, setPaymentType] = React.useState('Invoice');
  const [chequeNumber, setChequeNumber] = React.useState('');
  const [discountPerc, setDiscountPerc] = React.useState(0);
  const [discountAmt, setDiscountAmt] = React.useState(0);
  const [totalPrice, setTotalPrice] = React.useState(0);
  const [name, setName] = React.useState('');
  const [poNumber, setPONumber] = React.useState('');
  const [comment, setComment] = React.useState('');
  const sign = createRef();
  const [termsAndConditions, setTermsAndConditions] = React.useState(false);
  const [sendByEmail, setSendByEmail] = React.useState(false);
  const [isSignatureOpen, setIsSignatureOpen] = React.useState(false);
  const [termsAndConditionsClick, setTermsAndConditionsClick] = React.useState(
    false,
  );
  const [signature, setSignature] = React.useState('');
  const [billingAdddress, setBillingAddress] = React.useState('');
  const [allShippingAddresses, setAllShippingAddresses] = React.useState([]);
  const [shippingIndex, setShippingIndex] = React.useState(0);
  const [selectedShippingAddress, setSelectedShippingAddress] = React.useState(
    null,
  );
  const [dropDownSelected, setDropDownSelected] = React.useState({
    billingAddress: false,
    shippingAddress: false,
  });
  const [itemsInCart, setItemsInCart] = React.useState(0);

  const [cardDetails, setCardDetails] = React.useState({
    card: '',
    expiryMonth: '',
    expiryYear: '',
    securityCode: '',
  });
  const [cartDetails, setCartDetails] = React.useState({
    subTotal: 0,
    shippingTax: 0,
    cityTax: 0,
    stateTax: 0,
    total: 0,
    totalQty: 0,
    totalProducts: 0,
  });
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
  const [authorisationProviderAccount, setAuthorisationProviderAccount] = React.useState('');
  const [authorisationProviderAuthKey, setAuthorisationProviderAuthKey] = React.useState('');
  const [paymentMethodSetup, setPaymentMethodSetup] = React.useState(false);
  const paymentModes = [
    {
      label: languageLiterals ? languageLiterals.LblCash : 'Cash',
      value: 'Cash',
    },
    {
      label: languageLiterals ? languageLiterals.LblCheck : 'Cheque',
      value: 'Cheque',
    },
    {
      label: languageLiterals ? languageLiterals.LblAccount : 'Account',
      value: 'Invoice',
    },
    {
      label: languageLiterals ? languageLiterals.LblOnline : 'Online',
      value: 'Online',
    },
  ];

  React.useEffect(() => {
    (async function () {
      setLoader(true);
      const loggedInUserData = await AsyncStorage.getItem('APP_DATA');
      setLoggedInUser(JSON.parse(loggedInUserData));
      const customerInfo = await AsyncStorage.getItem('CUSTOMER');
      setCustomer(JSON.parse(customerInfo));
      const cus = JSON.parse(customerInfo);
      
      let respPaymentApiData = await getPaymentApiData(cus.customerNumber);
      
      if (respPaymentApiData) {
        let accountIfo = respPaymentApiData.onlineaccountinfo.online_account_info;
        await accountIfo.forEach(function (value, key) {
          if(value.provider_id == "1") {
            setPaymentMethodSetup(true);
          }
        });
      }

      const billingAdd =
        cus.customer_billing_address.length > 0
          ? getFormattedAddress(cus.customer_billing_address[0])
          : '';
      const allShippingAdd = cus.customer_shipping_addresses.map(
        (elm, index) => ({
          value: index,
          ship_number: elm.ship_number,
          label: getFormattedAddress(elm, false),
        }),
      );
      setBillingAddress(billingAdd);
      setAllShippingAddresses(allShippingAdd);
      setSelectedShippingAddress(allShippingAdd[0]);
      const orderDetails = await AsyncStorage.getItem('CURRENT_CHECKOUT_ITEMS');
      const parsed = JSON.parse(orderDetails);
      console.log('orderparsedDetail ', JSON.stringify(parsed));
      let subTotal = 0;
      let shippingTax = 0;
      let cityTax = 0;
      let stateTax = 0;
      let totalQty = 0;
      let totalProducts = 0;
      const isOrderSummaryPresent = await AsyncStorage.getItem(
        'IS_ORDER_SUMMARY_PRESENT',
      );
      
      if (isOrderSummaryPresent === 'true') {
        await AsyncStorage.removeItem('IS_ORDER_SUMMARY_PRESENT');
        const orderSummary = await AsyncStorage.getItem('ORDER_SUMMARY');
        // console.log('orderSummary', orderSummary);
        const parsedOrderSummary = JSON.parse(orderSummary);
        parsed.forEach((elm) => {
          totalProducts = totalProducts + 1;
          totalQty = totalQty + elm.quantity;
        });
        subTotal = parsedOrderSummary.sub_total;
        cityTax = parsedOrderSummary.city_tax;
        stateTax = parsedOrderSummary.state_tax;
        shippingTax = parsedOrderSummary.shipping_tax;
      } else {
        
        parsed.forEach((elm) => {
          console.log("parsed1121" , JSON.stringify(elm))
          totalProducts = totalProducts + 1;
          totalQty = totalQty + elm.quantity;
          subTotal = subTotal + elm.unit_price * elm.quantity;
          if(elm.show_button === "YES") {
            let cityTaxCal = parseFloat(
              (elm.unit_price * elm.product_info.item_tax_unit[0].city_tax_unit) /
                100,
            );
            cityTax += +parseFloat(cityTaxCal * elm.quantity);
  
            // Shipping and handeling tax
            // let shippingTaxCal = parseFloat(
            //   (elm.unit_price * elm.product_info.item_tax_unit[0].freight_unit) /
            //     100,
            // ).toFixed(2);
            shippingTax += +parseFloat(
              elm.product_info.item_tax_unit[0].freight_unit * elm.quantity,
            ).toFixed(2);
            
            // state tax

            // stateTax += +parseFloat(
            //   elm.product_info.item_tax_unit[0].state_tax_unit * elm.quantity,
            // ).toFixed(2);
            console.log(elm.product_info.item_tax_unit[0].state_tax_unit, ' state_tax_unit_12121');
            console.log(elm.unit_price, ' unit_price_sssds');
            let stateTaxCal = parseFloat(
              (elm.unit_price * elm.product_info.item_tax_unit[0].state_tax_unit) /
                100,
            );
            stateTax += +parseFloat(stateTaxCal * elm.quantity);

          }
          
        });
        
      }
      // alert(stateTax);
      setCartDetails({
        subTotal,
        shippingTax,
        cityTax,
        stateTax,
        total: parseFloat(subTotal + shippingTax + cityTax + stateTax).toFixed(
          2,
        ),
        totalQty,
        totalProducts,
      });
      setTotalPrice(
        parseFloat(subTotal + shippingTax + cityTax + stateTax).toFixed(2),
      );
      setOrderedItems(JSON.parse(orderDetails));
      setLoader(false);
      const language = await AsyncStorage.getItem('LITERALS');
      setLanguageLiterals(JSON.parse(language));
    })();
  }, []);

  const updateCard = (key, value) => {
    let valueToUpdate =
      key === 'card'
        ? value
            .replace(/\s?/g, '')
            .replace(/(\d{4})/g, '$1 ')
            .trim()
        : parseInt(value.replace(/\s?/g, ''), 10);
    setCardDetails({
      ...cardDetails,
      [key]: valueToUpdate,
    });
  };

  const setDiscount = (value, isPerc) => {
    const num = value.replace(/[^0-9.]/g, '');
    if (num === '' || num === 0) {
      setDiscountPerc(0);
      setTotalPrice(cartDetails.total);
      setDiscountAmt(0);
    }
    if (isPerc) {
      if (parseFloat(num, 10)) {
        const price = parseFloat(
          cartDetails.total * (parseFloat(num) / 100),
          10,
        ).toFixed(2);
        setDiscountAmt(price);
        const discountedPrice = parseFloat(cartDetails.total - price).toFixed(
          2,
        );
        setTotalPrice(discountedPrice);
      }
      setDiscountPerc(num);
    } else {
      if (parseFloat(num, 10)) {
        const discountedPrice = parseFloat(
          cartDetails.total - parseFloat(num),
        ).toFixed(2);
        const perc = parseFloat(
          100 -
            parseFloat(
              (parseFloat(discountedPrice) * 100) /
                parseFloat(cartDetails.total),
              10,
            ),
        ).toFixed(2);
        setDiscountPerc(perc);
        setTotalPrice(discountedPrice);
      }
      setDiscountAmt(num);
    }
  };

  const onClearAll = () => {
    setCardDetails({
      card: '',
      expiryMonth: '',
      expiryYear: '',
      securityCode: '',
    });
    setName('');
    setChequeNumber('');
    setPONumber('');
    setComment('');
    setTermsAndConditions(false);
    setSignature('');
  };

  const placeOrder = async (refId = '', transId = '') => {
    const ttCheckoutProducts = orderedItems.map((elm, index) => ({
      item_number: elm.item_number,
      quantity: elm.quantity,
      unit_price: elm.unit_price,
      item_color: elm.item_color,
      item_size: elm.item_size,
      item_description: elm.description,
      item_total_price: parseFloat(elm.quantity * elm.unit_price).toFixed(2),
      temp_number: 'TMP-NUMBER',
      item_sequence: index,
    }));
    let po_number_data = '';
    let sendByEmailVal = 'no';

    if(sendByEmail) {
      sendByEmailVal = 'yes';
    }

    let poNumberVal =  poNumber ? poNumber : 0;

    // if (comment && comment !== '' || sendByEmail) {
    //   po_number_data = poNumberVal + '|' + comment+ '|' + sendByEmailVal;
    // } else {
    //   po_number_data =  poNumberVal;
    // }

    po_number_data = poNumberVal + '|' + comment+ '|' + sendByEmailVal;
  
    const checkoutData = {
      ttPayment: [
        {
          payment_type:
            paymentType === 'Account' ? 'invoice' : paymentType.toLowerCase(),
          payment_amt: totalPrice,
          cheque_num:
            paymentType.toLowerCase() === 'cheque' ? chequeNumber : '',
          discount_amt: discountAmt,
          transId: transId,
          refId: refId,
        },
      ],
      ttCheckoutCustomer: [
        {
          temp_number: 'TMP-NUMBER',
          shippingAdL1: customer.customer_shipping_addresses[0].billingAdd1,
          shippingAdL2: customer.customer_shipping_addresses[0].billingAdd2,
          shippingAdL3: customer.customer_shipping_addresses[0].billingAdd3,
          order_on_hold: '',
          po_number: po_number_data,
          ship_to_no: selectedShippingAddress.ship_number,
          cust_number: customer.customerNumber,
          cust_name: customer.customerName,
          payment_term: 'NET45DAYS',
          regular_salesman: true,
          ttCheckoutProducts: [...ttCheckoutProducts],
        },
      ],
    };
    Geolocation.getCurrentPosition(async (info) => {
      const cartData = {
        digital_sign: signature,
        name: name,
        date_time: getCurrentDateInString(),
        latitude: info.coords.latitude,
        longitude: info.coords.longitude,
        available_credit: customer.availCredit,
        net_payment_amount: totalPrice,
      };
      const res = await performCheckout(checkoutData, cartData);
      console.log(res, 'resAfterOrder111');
      // return false;
      if (res !== null && res.checkout_data && res.status_code === 200) {
        setLoader(false);
        await AsyncStorage.setItem('IN_CART_PRODUCTS_LENGTH', '0');
        setItemsInCart(0);
        let msg = `Order placed successfully and your order number is ${res.checkout_data.order_number}`;
        if(res.checkout_data.order_number === "") {
          msg = `Order placed successfully in offline mode!`;
        }
        Alert.alert(
          msg,
          '',
          [
            {
              text: 'OK',
              onPress: () => {
                DeviceEventEmitter.emit('RefreshOrders', {});
                navigation.navigate('CustomerOrders', {
                  screen: 'CustomerOrders',
                });
              },
            },
          ],
          {cancelable: false},
        );
      } else {
        setLoader(false);
      }
    });
  };

  const onSubmit = async () => {
    if (
      name.toString().trim() === '' ||
      signature.toString().trim() === '' ||
      !termsAndConditions ||
      (paymentType === 'Cheque' && chequeNumber.toString().trim() === '') ||
      (paymentType === 'Online' &&
        (cardDetails.card.toString().length !== 19 ||
          cardDetails.expiryMonth.toString().trim() === '' ||
          cardDetails.expiryYear.toString().trim() === '' ||
          cardDetails.securityCode.toString().trim().length !== 3))
      // parseFloat(totalPrice) < parseFloat(cartDetails.total)
    ) {
      if (name.toString().trim() === '') {
        Alert.alert(
          'Please enter the name.',
          '',
          [
            {
              text: 'OK',
            },
          ],
          {cancelable: true},
        );
      } else if (signature.toString().trim() === '') {
        Alert.alert(
          'Please provide the signature.',
          '',
          [
            {
              text: 'OK',
            },
          ],
          {cancelable: true},
        );
      } else if (!termsAndConditions) {
        Alert.alert(
          'Please agree to the terms and conditions.',
          '',
          [
            {
              text: 'OK',
            },
          ],
          {cancelable: true},
        );
      } else if (
        paymentType === 'Cheque' &&
        chequeNumber.toString().trim() === ''
      ) {
        Alert.alert(
          'Please provide the check number.',
          '',
          [
            {
              text: 'OK',
            },
          ],
          {cancelable: true},
        );
      } else if (
        paymentType === 'Online' &&
        (cardDetails.card.toString().length !== 19 ||
          cardDetails.expiryMonth.toString().trim() === '' ||
          cardDetails.expiryYear.toString().trim() === '' ||
          cardDetails.securityCode.toString().trim().length !== 3)
      ) {
        Alert.alert(
          'Please enter the required card details.',
          '',
          [
            {
              text: 'OK',
            },
          ],
          {cancelable: true},
        );
      }
      // else if (parseFloat(totalPrice) < parseFloat(cartDetails.total)) {
      //   Alert.alert(
      //     'Please enter an amount more than or equal to the total.',
      //     '',
      //     [
      //       {
      //         text: 'OK',
      //       },
      //     ],
      //     {cancelable: true},
      //   );
      // }
      else {
        Alert.alert(
          'Please enter all the required fields.',
          '',
          [
            {
              text: 'OK',
            },
          ],
          {cancelable: true},
        );
      }
    } else {
      setLoader(true);
      if (paymentType === 'Online') {
        setLoader(true);
        const basicHeaders = await getBasicHeader();
        var creditCardNumberWihtoutSpaces = cardDetails.card.replace(/\s/g, '');
        var vcreditCardNumberWihtoutSpaces = creditCardNumberWihtoutSpaces.replace(
          /_/g,
          '',
        );
        const ip = NetworkInfo.getIPV4Address().then(
          (ipv4Address) => ipv4Address,
        );

        const respPaymentApiData = await getPaymentApiData(customer.customerNumber);
        if (respPaymentApiData) {
          let accountIfo = respPaymentApiData.onlineaccountinfo.online_account_info;
          await accountIfo.forEach(function (value, key) {
            if(value.provider_id == "1") {
              setAuthorisationProviderAccount(value.provider_account)
              setAuthorisationProviderAuthKey(value.provider_auth_key)
            }
          });
        }
        let requestPayment = {
          createTransactionRequest: {
            merchantAuthentication: {
              "name": authorisationProviderAccount,
              "transactionKey": authorisationProviderAuthKey
            },
            refId: customer.customerNumber + '-' + new Date().getTime(),
            transactionRequest: {
              transactionType: 'authCaptureTransaction',
              amount: totalPrice,
              payment: {
                creditCard: {
                  cardNumber: vcreditCardNumberWihtoutSpaces.toString(),
                  expirationDate:
                    cardDetails.expiryMonth + '-' + cardDetails.expiryYear,
                  cardCode: cardDetails.securityCode,
                },
              },
              lineItems: {},
              tax: {
                amount: '0.00',
                name: 'level2 tax name',
                description: 'level2 tax',
              },
              duty: {
                amount: '0.00',
                name: 'duty name',
                description: 'duty description',
              },
              shipping: {
                amount: '0.00',
                name: 'level2 tax name',
                description: 'level2 tax',
              },
              poNumber: poNumber || '999',
              customer: {
                id: basicHeaders.userName,
              },
              billTo: {
                address: billingAdddress,
                city: customer.customer_billing_address[0].billingCity,
                state: customer.customer_billing_address[0].billingState,
                zip: customer.customer_billing_address[0].billingZip,
              },
              shipTo: {
                address: selectedShippingAddress.label,
                city:
                  customer.customer_shipping_addresses[shippingIndex]
                    .shippingCity,
                state:
                  customer.customer_shipping_addresses[shippingIndex]
                    .shippingState,
                zip:
                  customer.customer_shipping_addresses[shippingIndex]
                    .shippingZip,
              },
              customerIP: (await ip).toString(),
              transactionSettings: {
                setting: {
                  settingName: 'testRequest',
                  settingValue: 'false',
                },
              },
              userFields: {
                userField: [
                  {
                    name: 'MerchantDefinedFieldName1',
                    value: 'MerchantDefinedFieldValue1',
                  },
                  {
                    name: 'favorite_color',
                    value: 'blue',
                  },
                ],
              },
            },
          },
        };
        const resp = await paymentAPI(requestPayment);
        if (resp !== null) {
          await placeOrder(resp.refId, resp.transactionResponse.transId);
        } else if (resp === null) {
          setLoader(false);
        }
      } else {
        await placeOrder();
      }
    }
  };

  const saveSign = () => {
    sign.current.saveImage();
  };

  const resetSign = () => {
    sign.current.resetImage();
    setSignature('');
  };

  const _onSaveEvent = (result) => {
    setSignature(result.encoded);
    setIsSignatureOpen(false);
  };

  if (termsAndConditionsClick) {
    const source = {
      uri: getTermsAndConditionsPDF.toString(),
      cache: true,
    };
    return (
      <View style={styles.container}>
        <Header
          title="Terms and Conditions"
          isLogOut
          navigation={navigation}
          isBack
          onBackPress={() => setTermsAndConditionsClick(false)}
          itemsInCart={itemsInCart}
        />
        <Pdf
          source={source}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`current page: ${page}`);
          }}
          onError={(error) => {
            console.log(error);
          }}
          onPressLink={(uri) => {
            console.log(`Link presse: ${uri}`);
          }}
          style={styles.pdf}
        />
      </View>
    );
  }

  const renderItem = (item, index) => {
    const itemDetailsToShow = {
      description: item?.description ? item.description.toUpperCase() : '',
      image:item.product_info.pictures && item.product_info.pictures.length > 0
          ? `${item.product_info.pictures[0]}`
          : '',
      itemNumber: item.item_number || '',
      itemUOM: item.product_info.item_uom || '',
      UOMQuantity: item.product_info.uom_qty || 0,
      pricePerUOM: item.unit_price || 0,
      commitQuantity: item.product_info.commit_qty || 0,
      onOrder: item.product_info.on_order || 0,
      itemsInStock: item.qty_on_hand || '',
      unitPrice:
        formatNumber(item.order_old_price) ||
        formatNumber(item.unit_price) ||
        0,
      minPrice: item.min_price || 0,
      qty: item.quantity || 0,
      size: item.item_size || 'Not Applicable',
      color: item.item_color || 'Not Applicable',
      uniqueId: item.unique_id || 0,
      qtyInCart:
        item.product_info.more_product_data &&
        item.product_info.more_product_data.length === 1
          ? item.product_info.more_product_data[0].in_stock
          : 0,
    };
    return (
      <View
        style={{
          display: 'flex',
          height: vh(25),
          marginVertical: 10,
          borderBottomColor: '#ddd',
          borderBottomWidth: index + 1 === orderedItems.length ? 0 : 1,
        }}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: vw(35),
            height: '100%',
          }}>
          {itemDetailsToShow.image !== '' ? (
            <Image
              source={{uri: itemDetailsToShow.image}}
              resizeMode="contain"
              style={{
                width: '100%',
                height: '50%',
                alignSelf: 'center',
                backgroundColor: 'white',
              }}
            />
          ) : (
            <Image
              source={defaultImage}
              style={{
                width: '100%',
                height: '50%',
                alignSelf: 'center',
              }}
            />
          )}
          <View style={{width: vw(60), paddingLeft: 10}}>
            <Text
              numberOfLines={1}
              style={{
                color: '#489CD6',
                fontSize: 15,
                fontWeight: '500',
              }}>
              {itemDetailsToShow.description}
            </Text>
            <Text style={styles.cardDetailsText}>{item.color}</Text>
            <View style={styles.cardDetailsText}>
              <Text>Item</Text>
              <Text>{itemDetailsToShow.itemNumber}</Text>
            </View>
            <View style={styles.cardDetailsText}>
              <Text>{languageLiterals && languageLiterals.LblItemUOM}</Text>
              <Text>{itemDetailsToShow.itemUOM}</Text>
            </View>
            <View style={styles.cardDetailsText}>
              <Text>{languageLiterals && languageLiterals.LblUOMQty}</Text>
              <Text>{itemDetailsToShow.UOMQuantity}</Text>
            </View>
            <View style={styles.cardDetailsText}>
              <Text>{languageLiterals && languageLiterals.LblUnitPrice}</Text>
              <Text>${itemDetailsToShow.unitPrice}</Text>
            </View>
            <View style={styles.cardDetailsText}>
              <Text>{languageLiterals && languageLiterals.LblSize}</Text>
              <Text>{itemDetailsToShow.size}</Text>
            </View>
            {/* <View style={styles.cardDetailsText}>
              <Text>{languageLiterals && languageLiterals.LblInStock}</Text>
              <Text>{itemDetailsToShow.qtyInCart}</Text>
            </View> */}
            <View style={styles.cardDetailsText}>
              <Text>
                {languageLiterals && languageLiterals.LblQuantityInCart}
              </Text>
              <Text>{itemDetailsToShow.qty}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                marginTop: 20,
              }}>
              <Text style={{fontSize: 20, width: '25%'}}>
                {languageLiterals && languageLiterals.LblTotal}
              </Text>
              <Text style={{fontSize: 20, width: '35%'}}>
                {`$${formatNumber(
                  parseFloat(
                    itemDetailsToShow.qty * itemDetailsToShow.unitPrice,
                  ).toFixed(2),
                )} `}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loader) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <Header
        title={languageLiterals && languageLiterals.LblCheckout}
        isLogOut
        navigation={navigation}
        isBack
        onBackPress={() => {
          if (isSignatureOpen) {
            setIsSignatureOpen(false);
          } else {
            navigation.goBack();
          }
        }}
        itemsInCart={itemsInCart}
      />
      {isSignatureOpen ? (
        <View style={styles.container}>
          <SignatureCapture
            style={styles.signature}
            ref={sign}
            onSaveEvent={_onSaveEvent}
            showNativeButtons={false}
            showTitleLabel={false}
            viewMode={'portrait'}
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              paddingVertical: 0,
              width: vw(100),
              padding: 10,
              marginVertical: 20,
            }}>
            <View style={styles.addToCartButton}>
              <Button onClick={saveSign} color="white" label="Save" />
            </View>
            <View style={styles.addToCartButton}>
              <Button onClick={resetSign} color="white" label="Reset" />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
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
                  {languageLiterals && languageLiterals.LblCityTax}
                </Text>
                <Text style={styles.orderDate}>
                  {languageLiterals && languageLiterals.LblStateTax}
                </Text>
                <Text style={styles.orderDate}>
                  {languageLiterals && languageLiterals.LblOrderTotal}
                </Text>
              </View>
              <View
                style={{
                  justifyContent: 'center',
                }}>
                <Text style={styles.orderDate}>
                  {`$${formatNumber(
                    parseFloat(cartDetails.subTotal).toFixed(2) || 0,
                  )} `}
                </Text>
                <Text style={styles.orderDate}>
                  {`$${formatNumber(
                    parseFloat(cartDetails.shippingTax).toFixed(2) || 0,
                  )} `}
                </Text>
                <Text style={styles.orderDate}>
                  {`$${formatNumber(
                    parseFloat(cartDetails.cityTax).toFixed(2) || 0,
                  )} `}
                </Text>
                <Text style={styles.orderDate}>
                  {`$${formatNumber(
                    parseFloat(cartDetails.stateTax).toFixed(2) || 0,
                  )} `}
                </Text>
                <Text style={styles.orderDate}>
                  ${formatNumber(parseFloat(totalPrice || 0))}
                </Text>
              </View>
            </View>
          </View>
          {loggedInUser.can_give_discount === 'yes' && 
            <View
            style={{backgroundColor: 'white', marginBottom: 5, padding: 10}}>
            <View style={styles.tabDetailsText}>
              <Text style={styles.tabDetailsTextRight}>Discount %</Text>
              <TextInput
                value={discountPerc}
                placeholder="Percentage"
                keyboardType="decimal-pad"
                placeholderTextColor="#333"
                maxLength={10}
                onChangeText={(text) => setDiscount(text, true)}
                style={styles.textDiscInput}
              />
            </View>
            <View style={styles.tabDetailsText}>
              <Text style={styles.tabDetailsTextRight}>Discount $</Text>
              <TextInput
                value={discountAmt}
                placeholder="Amount"
                keyboardType="decimal-pad"
                placeholderTextColor="#333"
                maxLength={10}
                onChangeText={(text) => setDiscount(text, false)}
                style={styles.textDiscInput}
              />
            </View>
          </View>
          }
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.addressContainer}>
              <View>
                <Text style={styles.orderNumber}>
                  {languageLiterals && languageLiterals.LblShippingInformation}
                </Text>
              </View>
              <View
                style={{
                  padding: 20,
                  backgroundColor: '#eee',
                  marginVertical: 10,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS === 'ios') {
                      setDropDownSelected({
                        ...dropDownSelected,
                        shippingAddress: true,
                      });
                    }
                  }}>
                  <Text style={styles.entryName}>{customer.customerName}</Text>
                  {Platform.OS === 'android' ? (
                    <Picker
                      mode="dialog"
                      selectedValue={selectedShippingAddress?.label || ''}
                      style={{width: '100%', zIndex: 2}}
                      onValueChange={(itemValue) => {
                        setSelectedShippingAddress(
                          allShippingAddresses[itemValue],
                        );
                        setShippingIndex(itemValue);
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
                </TouchableOpacity>
                {/* {customer.customer_billing_address.map((elm, index) => (
                  <Text key={index}>
                    {`${elm.billingAdd1}, ${elm.billingAdd2}, ${elm.billingAdd3}, ${elm.billingState}, ${elm.billingZip}`}
                  </Text>
                ))} */}
              </View>
            </View>
            <View style={styles.orderedItemsContainer}>
              <View>
                <Text style={styles.orderNumber}>
                  {languageLiterals && languageLiterals.LblProductInformation}
                </Text>
              </View>
              <View
                style={{
                  height: vh(5),
                  padding: 10,
                  backgroundColor: '#8AC7DB',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  alignContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 18,
                  }}>
                  {`Total Products: ${cartDetails.totalProducts || 0}`}
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                  }}>
                  {`Quantity in Cart: ${cartDetails.totalQty || 0}`}
                </Text>
              </View>
              <FlatList
                data={orderedItems}
                style={{marginTop: 10, zIndex: 0, marginBottom: 10}}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => renderItem(item, index)}
                ListEmptyComponent={
                  <View style={styles.noValuesFound}>
                    <Text style={styles.noValueText}>No orders found.</Text>
                  </View>
                }
              />
              <View
                style={
                  paymentType === 'Cheque'
                    ? styles.orderStatusChequeContainer
                    : paymentType === 'Online'
                    ? styles.orderStatusOnlineContainer
                    : styles.orderStatusProductContainer
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
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                  }}>
                  <View style={{width: '45%'}}>
                    <Text style={[styles.orderNumber, {textAlign: 'left'}]}>
                      {languageLiterals && languageLiterals.LblAvailableCredit}
                    </Text>
                  </View>
                  <View style={{width: '45%'}}>
                    <Text style={[styles.orderNumber, {textAlign: 'right'}]}>
                      {languageLiterals && languageLiterals.LblCreditLimit}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                  }}>
                  <Text style={styles.orderNumber}>
                    {`$${formatNumber(customer?.availCredit)} `}
                  </Text>
                  <Text style={styles.orderNumber}>
                    {`$${formatNumber(customer?.creditLimit)} `}
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
                      onPress={() => {
                        setPaymentType(elm.value);
                        if(paymentMethodSetup == false && elm.value == 'Online') {
                          alert("This feature is not avaialble yet!");
                          setPaymentType('Cash');
                        }
                       }} 
                      key={index}>
                      <View>
                        <Text
                          style={{
                            color:
                              elm.value.toString() === paymentType.toString()
                                ? '#489CD6'
                                : '#c2c2c2',
                            fontSize: 14,
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
                      style={{
                        width: '25%',
                        display: 'flex',
                        justifyContent: 'center',
                      }}>
                      <Text style={{fontSize: 18, fontWeight: '600'}}>
                        {languageLiterals && languageLiterals.LblChequeNumber}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: '75%',
                        display: 'flex',
                        justifyContent: 'center',
                      }}>
                      <TextInput
                        value={chequeNumber}
                        placeholder={
                          languageLiterals && languageLiterals.LblChequeNumber
                        }
                        keyboardType="default"
                        placeholderTextColor="#333"
                        maxLength={10}
                        onChangeText={(text) => setChequeNumber(text)}
                        style={styles.textInput}
                      />
                    </View>
                  </View>
                )}
                {paymentType === 'Online' && (
                  <View>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        margin: 10,
                      }}>
                      <View
                        style={{
                          width: '25%',
                          display: 'flex',
                          justifyContent: 'center',
                        }}>
                        <Text style={{fontSize: 18, fontWeight: '600'}}>
                          {languageLiterals && languageLiterals.LblCardNumber}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: '75%',
                          display: 'flex',
                          justifyContent: 'center',
                        }}>
                        <TextInput
                          value={cardDetails.card}
                          placeholder="0000 0000 0000 0000"
                          keyboardType="default"
                          placeholderTextColor="#333"
                          maxLength={19}
                          onChangeText={(text) => updateCard('card', text)}
                          style={styles.textInput}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        margin: 10,
                      }}>
                      <View
                        style={{
                          width: '25%',
                          display: 'flex',
                          justifyContent: 'center',
                        }}>
                        <Text style={{fontSize: 18, fontWeight: '600'}}>
                          {languageLiterals && languageLiterals.LblExpirydate}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: '75%',
                          display: 'flex',
                          justifyContent: 'flex-start',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <TextInput
                          value={cardDetails.expiryMonth}
                          placeholder=""
                          keyboardType="default"
                          placeholderTextColor="#333"
                          maxLength={2}
                          onChangeText={(text) =>
                            updateCard('expiryMonth', text)
                          }
                          style={styles.textInputExpiry}
                        />
                        <Text>{'  '}/</Text>
                        <TextInput
                          value={cardDetails.expiryYear}
                          placeholder=""
                          keyboardType="default"
                          placeholderTextColor="#333"
                          maxLength={2}
                          onChangeText={(text) =>
                            updateCard('expiryYear', text)
                          }
                          style={styles.textInputExpiry}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        margin: 10,
                      }}>
                      <View
                        style={{
                          width: '25%',
                          display: 'flex',
                          justifyContent: 'center',
                        }}>
                        <Text style={{fontSize: 18, fontWeight: '600'}}>
                          {languageLiterals && languageLiterals.LblCardcode}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: '75%',
                          display: 'flex',
                          justifyContent: 'center',
                        }}>
                        <TextInput
                          value={cardDetails.securityCode}
                          placeholder=""
                          keyboardType="default"
                          placeholderTextColor="#333"
                          maxLength={3}
                          onChangeText={(text) =>
                            updateCard('securityCode', text)
                          }
                          style={{
                            height: vh(5),
                            marginLeft: 10,
                            borderRadius: 10,
                            paddingLeft: 10,
                            borderBottomColor: '#489CD6',
                            borderBottomWidth: 2,
                            color: '#489CD6',
                            fontSize: 18,
                            width: 80,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                )}
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    margin: 10,
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      width: '20%',
                      display: 'flex',
                      justifyContent: 'center',
                    }}>
                    <Text style={{fontSize: 18, fontWeight: '600'}}>
                      {languageLiterals && languageLiterals.LblAmount}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: '5%',
                      display: 'flex',
                      justifyContent: 'center',
                    }}>
                    <Text style={{fontSize: 18, fontWeight: '600'}}>$</Text>
                  </View>
                  <View
                    style={{
                      width: '75%',
                      display: 'flex',
                      justifyContent: 'center',
                    }}>
                    <TextInput
                      value={formatNumber(totalPrice.toString())}
                      placeholder="Enter Amount"
                      keyboardType="default"
                      placeholderTextColor="#333"
                      maxLength={10}
                      style={styles.textInput}
                      editable={false}
                    />
                  </View>
                </View>
                <View style={styles.buttonContainer}>
                  <View style={styles.collectPaymentButton}>
                    <Button
                      onClick={() => setIsSignatureOpen(true)}
                      color="white"
                      label={
                        signature
                          ? languageLiterals &&
                            languageLiterals.LblChangeSignature
                          : (languageLiterals &&
                              languageLiterals.LblAddYourSignature) ||
                            'Add you signature'
                      }
                    />
                  </View>
                </View>
                {signature !== '' && (
                  <Image
                    source={{uri: `data:image/png;base64,${signature}`}}
                    style={{
                      width: vw(80),
                      height: 200,
                      resizeMode: 'contain',
                    }}
                  />
                )}
                <View>
                  <View
                    style={{
                      justifyContent: 'flex-start',
                      marginVertical: 10,
                      borderTopColor: '#eee',
                      borderTopWidth: 5,
                    }}>
                    <View
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                      }}>
                      <TextInput
                        value={name}
                        placeholder={
                          languageLiterals && languageLiterals.LblEnterNameHere
                        }
                        placeholderTextColor="#333"
                        keyboardType="default"
                        maxLength={19}
                        onChangeText={(text) => setName(text)}
                        style={{
                          height: vh(5),
                          marginTop: 10,
                          paddingHorizontal: 10,
                          borderColor: '#eee',
                          borderWidth: 3,
                          color: '#489CD6',
                          fontSize: 18,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        marginVertical: 10,
                      }}>
                      <TextInput
                        value={poNumber}
                        placeholder={
                          languageLiterals && languageLiterals.LblPONumber
                        }
                        placeholderTextColor="#333"
                        keyboardType="default"
                        maxLength={19}
                        onChangeText={(text) => setPONumber(text)}
                        style={{
                          height: vh(5),
                          borderRadius: 10,
                          paddingVertical: 10,
                          borderBottomColor: '#489CD6',
                          borderBottomWidth: 2,
                          color: '#489CD6',
                          fontSize: 18,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        marginVertical: 10,
                      }}>
                      <TextInput
                        value={comment}
                        placeholder="Comment"
                        placeholderTextColor="#333"
                        keyboardType="default"
                        onChangeText={(text) => setComment(text)}
                        style={{
                          height: vh(5),
                          borderRadius: 10,
                          paddingVertical: 10,
                          borderBottomColor: '#489CD6',
                          borderBottomWidth: 2,
                          color: '#489CD6',
                          fontSize: 18,
                        }}
                      />
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <CheckBox
                    boxType="square"
                    disabled={false}
                    value={termsAndConditions}
                    onValueChange={(newValue) =>
                      setTermsAndConditions(newValue)
                    }
                    tintColors={{true: '#F15927', false: 'black'}}
                    style={{
                      height: 20,
                      width: 20,
                    }}
                  />
                  <Text style={{marginLeft: 10}}>
                    {languageLiterals && languageLiterals.LblTermsAndCondition}
                  </Text>
                  <TouchableOpacity
                    onPress={async () => setTermsAndConditionsClick(true)}>
                    <Image source={PDFIcon} style={styles.pdfIcon} />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 10
                  }}>
                  <CheckBox
                    boxType="square"
                    disabled={false}
                    value={sendByEmail}
                    onValueChange={(newValue) =>
                      setSendByEmail(newValue)
                    }
                    tintColors={{true: '#F15927', false: 'black'}}
                    style={{
                      height: 20,
                      width: 20,
                    }}
                  />
                  <Text style={{marginLeft: 10}}>
                  {languageLiterals && languageLiterals.LblSendOrderEmail}
                  </Text>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    paddingVertical: 0,
                    width: vw(100),
                    padding: 10,
                    marginVertical: 20,
                  }}>
                  <View style={styles.addToCartButton}>
                    <Button
                      onClick={onClearAll}
                      color="white"
                      label={
                        (languageLiterals && languageLiterals.LblClearAll) ||
                        'Clear All'
                      }
                    />
                  </View>
                  <View style={styles.addToCartButton}>
                    <Button
                      onClick={async () => onSubmit()}
                      color="white"
                      label={
                        (languageLiterals && languageLiterals.LblSubmitOrder) ||
                        'Submit Order'
                      }
                      disabled={loader}
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
      {dropDownSelected.shippingAddress && Platform.OS === 'ios' && (
        <Picker
          selectedValue={selectedShippingAddress.label}
          style={{width: '100%', zIndex: 2}}
          onValueChange={(itemValue) => {
            setSelectedShippingAddress(allShippingAddresses[itemValue]);
            setShippingIndex(itemValue);
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

export default Checkout;

/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Header from '../../components/Header';
import Button from '../../components/Button';
import {
  performCartActions,
  getInCartProducts,
} from '../../services/customer/customer';
import {formatNumber} from '../../utilities/utils';
import {vh, vw} from '../../utilities/Dimensions';
import defaultImage from '../../assets/icons/ic_product_default.png';
import editIcon from '../../assets/icons/ic_edit.png';
import deleteIcon from '../../assets/icons/ic_delete.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader';
// import ServiceCall from '../../services/EndPoints';
// import { fetchCartDataFromLocal } from '../../providers/network.provider';
import Tables from '../../services/Tables';
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 0,
    width: vw(100),
    padding: 10,
  },
  itemContainer: {
    width: vw(100),
    marginBottom: 5,
    height: vh(72),
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
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
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 10,
  },
  cardDetailsText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabDetailsText: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: vw(90),
    paddingVertical: 20,
  },
  tabDetailsTextRight: {
    fontSize: 18,
    width: vw(30),
  },
  tabDetailsTextLeft: {
    fontSize: 18,
    width: vw(60),
    marginHorizontal: 10,
  },
  cardDetailsBigText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 22,
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
  textInput: {
    height: vh(5),
    borderBottomColor: '#489CD6',
    borderBottomWidth: 2,
    color: '#489CD6',
    fontSize: 18,
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
  editIcon: {
    width: 18,
    height: 18,
  },
});

const Cart = ({navigation, route}) => {
  const [items, setItems] = React.useState([]);
  const [totalQuantity, setTotalQuantity] = React.useState(0);
  const [amount, setAmount] = React.useState(0);
  const [onEdit, setOnEdit] = React.useState('');
  const [editValue, setEditValue] = React.useState(0);
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
  const [languageLiterals, setLanguageLiterals] = React.useState(null);

  const fetchInCartProducts = async (customerNumber) => {
    setLoader(true);
    const cusNum = customerNumber || customer.customerNumber;
    

    NetInfo.fetch().then(async (state) => { 
      let resp = [];
      resp = await getInCartProducts(cusNum);
      console.log("cartData ", JSON.stringify(resp));

      // console.log('cartResp', JSON.stringify(resp));
      if (resp !== null && resp.in_cart_products.length > 0) {
        setItems(resp.in_cart_products);
        let total = 0;
        let amt = 0;
        resp.in_cart_products.forEach((elm) => {
          total = total + elm.quantity;
          amt = amt + elm.unit_price * elm.quantity;
        });
        await AsyncStorage.setItem('IN_CART_PRODUCTS_LENGTH', total.toString());
        setAmount(amt);
        setTotalQuantity(total);
        setLoader(false);
      } else {
        setItems([]);
        setAmount(0);
        setTotalQuantity(0);
        setLoader(false);
      }
      setLoader(false);
    });
  };

  const onEmptyCart = async () => {
    Alert.alert(
      'Are you sure you want to delete all items in cart?',
      '',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            setLoader(true);
            const res = await performCartActions(customer.customerNumber, 'e');
            console.log(res, ' resAfterempty')
            if ((res !== null && res.status_code === 200) || res) {
              await AsyncStorage.setItem('IN_CART_PRODUCTS_LENGTH', '0');
              DeviceEventEmitter.emit('RefreshPage', {});
              navigation.navigate('CustomerShop', {
                screen: 'CustomerShop',
              });
              setLoader(false);
            }
            setLoader(false);
          },
        },
      ],
      {cancelable: false},
    );
  };

  const onDeleteItems = async (uniqueId) => {
    setLoader(true);
    const res = await performCartActions(customer.customerNumber, 'r', {
      uniqueId,
    });
    if (res !== null && res.status_code === 200) {
      await fetchInCartProducts(customer.customerNumber);
      setLoader(false);
    }
  };

  const onModifyQuantity = async (uniqueId) => {
    setLoader(true);
    const res = await performCartActions(customer.customerNumber, 'm', {
      uniqueId,
      quantity: parseInt(editValue, 10),
    });
    console.log(res, ' resonModifyQuantity');
    if (res !== null && res.status_code === 200) {
      await fetchInCartProducts(customer.customerNumber);
      setOnEdit('');
      setEditValue('');
      setLoader(false);
    }
  };

  React.useEffect(() => {
    (async function () {
      setLoader(true);
      const customerInfo = await AsyncStorage.getItem('CUSTOMER');
      setCustomer(JSON.parse(customerInfo));
      await fetchInCartProducts(JSON.parse(customerInfo).customerNumber);
      setLoader(false);
      const language = await AsyncStorage.getItem('LITERALS');
      setLanguageLiterals(JSON.parse(language));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCheckoutClicked = async () => {
    await AsyncStorage.setItem('CURRENT_CHECKOUT_ITEMS', JSON.stringify(items));
    navigation.navigate('Checkout', {
      screen: 'Checkout',
    });
  };

  const renderItems = (item, index) => {
    const itemDetailsToShow = {
      description: item?.description ? item.description.toUpperCase() : '',
      image: item.product_info && item.product_info.pictures && item.product_info.pictures.length > 0
          ? `${item.product_info.pictures[0]}`
          : '',
      itemNumber: item.item_number || '',
      itemUOM: item.product_info && item.product_info.item_uom || '',
      UOMQuantity: item.product_info && item.product_info.uom_qty || 0,
      pricePerUOM: item.unit_price || 0,
      commitQuantity: item.product_info && item.product_info.commit_qty || 0,
      onOrder: item.product_info && item.product_info.on_order || 0,
      itemsInStock: item.qty_on_hand || '',
      unitPrice: formatNumber(item.unit_price) || 0,
      minPrice: item.min_price || 0,
      qty: item.quantity || 0,
      size: item.item_size || 'Not Applicable',
      color: item.item_color || 'Not Applicable',
      uniqueId: item.unique_id || 0,
      show_button: item.show_button,
    };
    return (
      <View
        style={{
          display: 'flex',
          height: vh(25),
          marginVertical: 10,
          borderBottomColor: '#ddd',
          borderBottomWidth: index + 1 === items.length ? 0 : 1,
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
                height: '100%',
                alignSelf: 'center',
                backgroundColor: 'white',
              }}
            />
          ) : (
            <Image
              source={defaultImage}
              style={{
                width: '100%',
                height: '100%',
                alignSelf: 'center',
              }}
            />
          )}
          <View style={{width: vw(60), paddingLeft: 10}}>
            <Text
              numberOfLines={2}
              style={{
                color: '#489CD6',
                fontSize: 15,
                fontWeight: '500',
              }}>
              {itemDetailsToShow.description}
            </Text>
            <Text style={styles.cardDetailsText}>{item.color}</Text>
            <View style={styles.cardDetailsText}>
              <Text>{languageLiterals && languageLiterals.LblItem}</Text>
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
            <View style={styles.cardDetailsText}>
              <Text>
                {languageLiterals && languageLiterals.LblQuantityInCart}
              </Text>
              <Text>{itemDetailsToShow.qty}</Text>
            </View>
            {onEdit === itemDetailsToShow.uniqueId && (
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    width: '75%',
                  }}>
                  <TextInput
                    value={editValue.toString()}
                    placeholder="Enter Amount"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#333"
                    maxLength={10}
                    onChangeText={(text) =>
                      setEditValue(text.replace(/[^0-9.]/g, ''))
                    }
                    style={styles.textInput}
                  />
                </View>
                <View style={{width: '25%'}}>
                  <Button
                    onClick={() => onModifyQuantity(itemDetailsToShow.uniqueId)}
                    label="Save"
                  />
                </View>
              </View>
            )}
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
                  itemDetailsToShow.qty * itemDetailsToShow.unitPrice,
                )} `}
              </Text>
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  flexDirection: 'row',
                  width: '40%',
                  alignItems: 'center',
                }}>
                

            {itemDetailsToShow.show_button == 'YES' && (
              <TouchableOpacity
              onPress={async () => {
                if (onEdit === itemDetailsToShow.uniqueId) {
                  setEditValue('');
                  setOnEdit('');
                } else {
                  setEditValue(itemDetailsToShow.qty);
                  setOnEdit(itemDetailsToShow.uniqueId);
                }
              }}>
              <Image
                source={
                  editIcon
                  // onEdit === itemDetailsToShow.uniqueId
                  //   ? deleteIcon
                  //   : editIcon
                }
                style={styles.editIcon}
              />
              {/* <Text>
                {onEdit === itemDetailsToShow.uniqueId ? 'Cancel' : 'Edit'}
              </Text> */}
            </TouchableOpacity>
            )}  
                {itemDetailsToShow.show_button == 'YES' && (
                <TouchableOpacity
                  onPress={async () => {
                    Alert.alert(
                      'Are you sure you want to delete this item from the cart?',
                      '',
                      [
                        {
                          text: 'Cancel',
                        },
                        {
                          text: 'OK',
                          onPress: () => {
                            onDeleteItems(itemDetailsToShow.uniqueId);
                          },
                        },
                      ],
                      {cancelable: false},
                    );
                  }}>
                  <Image
                    source={
                      deleteIcon
                      // onEdit === itemDetailsToShow.uniqueId
                      //   ? deleteIcon
                      //   : editIcon
                    }
                    style={styles.editIcon}
                  />
                </TouchableOpacity>
                )}
              </View>
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
        title={languageLiterals && languageLiterals.LblShoppingCart}
        isLogOut
        navigation={navigation}
        isBack
        onBackPress={() => {
          DeviceEventEmitter.emit('RefreshPage', {});
          navigation.goBack();
        }}
      />
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
          {languageLiterals && languageLiterals.LblShoppingCart}:{' '}
          {totalQuantity}
        </Text>
        <Text
          style={{
            fontSize: 18,
          }}>
          {languageLiterals && languageLiterals.LblAmount}:{' '}
          {`$${formatNumber(amount.toFixed(2))} `}
        </Text>
      </View>
      <View style={styles.itemContainer}>
        <FlatList
          data={items || []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => renderItems(item, index)}
          contentContainerStyle={{
            justifyContent: 'space-between',
            display: 'flex',
            height: 'auto',
          }}
          ListEmptyComponent={
            <View style={styles.noValuesFound}>
              <Text style={styles.noValueText}>
                No items in the cart found.
              </Text>
            </View>
          }
        />
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.addToCartButton}>
          <Button
            onClick={onEmptyCart}
            color="white"
            label={
              (languageLiterals && languageLiterals.LblEmptyCart) ||
              'Empty Cart'
            }
            disabled={items.length === 0}
          />
        </View>
        <View style={styles.addToCartButton}>
          <Button
            onClick={onCheckoutClicked}
            color="white"
            label={
              (languageLiterals && languageLiterals.LblCheckout) || 'Checkout'
            }
            disabled={items.length === 0}
          />
        </View>
      </View>
    </View>
  );
};

export default Cart;

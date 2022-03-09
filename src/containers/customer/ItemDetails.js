/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { SliderBox } from "react-native-image-slider-box";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  DeviceEventEmitter,
  Platform,
  ScrollView,
} from 'react-native';
import Header from '../../components/Header';
import Button from '../../components/Button';
import {
  performCartActions,
  getInCartProducts,
} from '../../services/customer/customer';
import DropDownPicker from 'react-native-dropdown-picker';
import {vh, vw} from '../../utilities/Dimensions';
import defaultImage from '../../assets/icons/ic_product_default.png';
import editIcon from '../../assets/icons/ic_edit.png';
import deleteIcon from '../../assets/icons/ic_delete.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader';
import Pdf from 'react-native-pdf';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 0,
  },
  itemContainer: {
    width: vw(100),
    marginBottom: 5,
    height: vh(31),
    alignSelf: 'center',
    backgroundColor: 'white',
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
    width: vw(90),
    borderRadius: 5,
    height: vh(5),
  },
  textInput: {
    height: vh(5),
    borderBottomColor: '#489CD6',
    borderBottomWidth: 2,
    fontSize: 18,
  },
  textDiscInput: {
    height: 'auto',
    borderBottomColor: '#489CD6',
    borderBottomWidth: 2,
    fontSize: 18,
    width: vw(60),
  },
  editIcon: {
    width: 18,
    height: 18,
  },
  pdf: {
    flex: 1,
    width: vw(100),
  },
});

const tabs = ['Quantity', 'Product Information'];

const ItemDetails = ({navigation, route}) => {
  const [itemDetails, setItemDetails] = React.useState([]);
  const [images, setImages] = React.useState([defaultImage]);
  const [loggedInUser, setLoggedInUser] = React.useState([]);
  const [itemDetailsToShow, setItemDetailsToShow] = React.useState({});
  const [unitPrice, setUnitPrice] = React.useState(0);
  const [unitActualPrice, setActualUnitPrice] = React.useState(0);
  const [defaultPrice, setDefaultPrice] = React.useState(0);
  const [selectedTab, setSelectedTab] = React.useState('Quantity');
  const [qty, setQty] = React.useState(0);
  const [discountPerc, setDiscountPerc] = React.useState(0);
  const [discountAmt, setDiscountAmt] = React.useState(0);
  const [editStatus, setEditStatus] = React.useState(false);
  const [itemsInCart, setItemsInCart] = React.useState(0);
  const [pdfLink, setPDFLink] = React.useState('');
  const [viewProductPDF, setviewProductPDF] = React.useState(false);
  const [unitPriceSelectorStatus, setUnitPriceSelectorStatus] = React.useState(
    false,
  );
  const [languageLiterals, setLanguageLiterals] = React.useState(null);
  const source = {
    uri: pdfLink,
    cache: true,
  };
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
  const mapping = {
    Quantity: 'LblQuantity',
    'Product Information': 'LblProductInformation',
  };

  React.useEffect(() => {
    (async function () {
      setLoader(true);
      const customerInfo = await AsyncStorage.getItem('CUSTOMER');
      setCustomer(JSON.parse(customerInfo));

      const loggedInUserData = await AsyncStorage.getItem('APP_DATA');
      setLoggedInUser(JSON.parse(loggedInUserData));

      const item = await AsyncStorage.getItem('CURRENT_ITEM_DETAILS');
      setItemDetails(JSON.parse(item));
      const cartItems = await AsyncStorage.getItem('IN_CART_PRODUCTS_LENGTH');
      setItemsInCart(parseInt(cartItems, 10));
      console.log('productDetails', item);

      const parsedData = JSON.parse(item);
      console.log('parsedData ', JSON.stringify(parsedData))
      let multiplePriceOption = parsedData.item.item_all_price;
      console.log('multiplePriceOption', multiplePriceOption);
      let multiplePriceOptionArrayData =
        multiplePriceOption !== '' ? multiplePriceOption.split('|') : [];

      let multipleArrayOptions = multiplePriceOptionArrayData.map((elm) => ({
        label: `$ ${parseFloat(elm).toFixed(2)}`,
        value: elm,
      }));
      setPDFLink(parsedData.item.pdf_link || '');
      setItemDetailsToShow({
        description: parsedData.item?.description
          ? parsedData.item.description.toUpperCase()
          : '',
        image:
          parsedData.item.pictures && parsedData.item.pictures.length > 0
            ? `${parsedData.item.pictures[0]}`
            : '',
        images:
            parsedData.item.pictures && parsedData.item.pictures.length > 0
              ? `${parsedData.item.pictures}`
              : '',    
        itemNumber: parsedData.item.item_number || '',
        category_id: parsedData.item.category_id || '',
        itemUOM: parsedData.item.item_uom || '',
        UOMQuantity: parsedData.item.uom_ty || 0,
        pricePerUOM: parseFloat(parsedData.item.price).toFixed(2) || 0,
        commitQuantity: parsedData.item.commit_qty || 0,
        pack_size: parsedData.item.pack_size || '',
        onOrder: parsedData.item.on_order || 0,
        itemsInStock:
          parsedData.item.qty_on_hand - parsedData.item.commit_qty || 0,
        unitPrice:
          parseFloat(parsedData.item.more_product_data[0].unit_price).toFixed(
            2,
          ) || 0,
        minPrice: parseFloat(parsedData.item.min_price).toFixed(2) || 0,
        multiplePriceOptionArray: multiplePriceOptionArrayData || '',
        multiplePriceJSON: multipleArrayOptions,
        up_to_qty1: parsedData.item.up_to_qty1,
        up_to_price1: parseFloat(parsedData.item.up_to_price1).toFixed(2),
        up_to_qty2: parsedData.item.up_to_qty2,
        up_to_price2: parseFloat(parsedData.item.up_to_price2).toFixed(2),
        up_to_qty3: parsedData.item.up_to_qty3,
        up_to_price3: parseFloat(parsedData.item.up_to_price3).toFixed(2),
        up_to_qty4: parsedData.item.up_to_qty4,
        up_to_price4: parseFloat(parsedData.item.up_to_price4).toFixed(2),
        up_to_qty5: parsedData.item.up_to_qty5,
        up_to_price5: parseFloat(parsedData.item.up_to_price5).toFixed(2),
        item_percent_for_disc: parsedData.item.item_percent_for_disc,
        buy_qty_to_get_free: parsedData.item.buy_qty_to_get_free,
        get_free_item: parsedData.item.get_free_item,
      });
      if(parsedData.item.pictures.length > 0) {
        setImages(parsedData.item.pictures)
      }
      // setDefaultPrice(multipleArrayOptions[0].unit_price);
      setUnitPrice(
        multipleArrayOptions[0] ||
          parsedData.item.more_product_data[0].unit_price,
      );
      setActualUnitPrice(parsedData.item.more_product_data[0].unit_price || 0);
      setLoader(false);
      const language = await AsyncStorage.getItem('LITERALS');
      setLanguageLiterals(JSON.parse(language));
    })();
  }, []);

  const setDiscount = (value, isPerc) => {
    const num = value.replace(/[^0-9.]/g, '');
    if (num === '' || num === 0) {
      setDiscountPerc(0);
      setUnitPrice(itemDetailsToShow.unitPrice);
      setDiscountAmt(0);
    }
    if (isPerc) {
      if (parseFloat(num, 10)) {
        const price = parseFloat(
          itemDetailsToShow.unitPrice * (parseFloat(num) / 100),
          10,
        ).toFixed(2);
        setDiscountAmt(price);
        const discountedPrice = parseFloat(
          itemDetailsToShow.unitPrice - price,
        ).toFixed(2);
        setUnitPrice(discountedPrice);
      }
      setDiscountPerc(num);
    } else {
      if (parseFloat(num, 10)) {
        const discountedPrice = parseFloat(
          itemDetailsToShow.unitPrice - parseFloat(num),
        ).toFixed(2);
        const perc = parseFloat(
          100 -
            parseFloat(
              (parseFloat(discountedPrice) * 100) /
                parseFloat(itemDetailsToShow.unitPrice),
              10,
            ),
        ).toFixed(2);
        setDiscountPerc(perc);
        setUnitPrice(discountedPrice);
      }
      setDiscountAmt(num);
    }
  };

  const onAddToCart = async () => {
    if (
      parseFloat(unitPrice) <= parseFloat(itemDetailsToShow.minPrice) &&
      editStatus
    ) {
      Alert.alert(
        'Alert',
        `Minimum unit price of this item is ${itemDetailsToShow.minPrice}. Please enter any amount above it`,
        [
          {
            text: 'OK',
          },
        ],
        {cancelable: false},
      );
    } else {
      if(qty < 1 || qty === '') {
        Alert.alert(
          'Alert',
          `Quantity should be at least 1`,
          [
            {
              text: 'OK',
            },
          ],
          {cancelable: false},
        );
      } else {
        setLoader(true);
        var unique_cart_id = new Date().getTime();
        const request = {
          ttCartProducts: [
            {
              item_number: itemDetailsToShow.itemNumber,
              category_id: itemDetailsToShow.category_id,
              description: itemDetailsToShow.description,
              quantity: qty,
              unit_price:
                loggedInUser.can_modify_price === 'yes' &&
                itemDetailsToShow.multiplePriceOptionArray.length > 0
                  ? unitPrice.value
                  : unitPrice,
              item_color: '',
              item_size: '',
              unique_id: unique_cart_id,
              // unique_cart_id: unique_cart_id,
            },
          ],
        };
        console.log('requestCart1', request);
        // return false;
        const resp = await performCartActions(
          customer.customerNumber,
          'a',
          request,
          unique_cart_id,
          itemDetailsToShow.itemNumber
        );
        console.log('resultData ', resp);

        if (resp !== null && resp.status_code === 200) {
          const response = await getInCartProducts(customer.customerNumber);
          if (response !== null && response.in_cart_products.length > 0) {
            let total = 0;
            response.in_cart_products.forEach((elm) => {
              total = total + elm.quantity;
            });
            await AsyncStorage.setItem(
              'IN_CART_PRODUCTS_LENGTH',
              total.toString(),
            );
            setItemsInCart(total.toString());
          }
          Alert.alert(
            'Added to the cart.',
            '',
            [
              {
                text: 'OK',
                onPress: () => {
                  AsyncStorage.setItem('ITEMS_IN_CART', JSON.stringify(request));
                  setLoader(false);
                  // navigation.navigate('Cart', {
                  //   screen: 'Cart',
                  // });
                },
              },
            ],
            {cancelable: false},
          );
        }
      } 
    }
  };

  if (viewProductPDF) {
    return (
      <View style={styles.container}>
        <Header
          title={itemDetailsToShow.description || ''}
          isLogOut
          navigation={navigation}
          isBack
          onBackPress={() => {
            setSelectedTab('Quantity');
            setviewProductPDF(false);
          }}
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

  if (loader) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <Header
        title={languageLiterals && languageLiterals.LblProductDetails}
        isLogOut
        navigation={navigation}
        isBack
        onBackPress={async () => {
          await AsyncStorage.setItem(
            'IN_CART_PRODUCTS_LENGTH',
            itemsInCart.toString(),
          );
          DeviceEventEmitter.emit('RefreshPage', {});
          navigation.goBack();
        }}
        showCart
        itemsInCart={itemsInCart}
      />
      <View style={styles.itemContainer}>
        <View
          style={{
            display: 'flex',
            height: '100%',
          }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              height: '100%',
              justifyContent: 'space-between',
              width: vw(55),
            }}>
            {itemDetailsToShow.image !== '' ? (
              <SliderBox
              inactiveDotColor='black'
              images={images}
              parentWidth={vw(55)}
              resizeMode={'contain'}
              
            />
            ) : (
              <Image
                source={defaultImage}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            )}
            <View style={{width: vw(40), paddingLeft: 5}}>
              <Text
                numberOfLines={2}
                style={{
                  color: '#489CD6',
                  fontSize: 15,
                  fontWeight: '500',
                }}>
                {itemDetailsToShow.description}
              </Text>
              <View style={styles.cardDetailsBigText}>
                <Text style={{fontSize: 20}}>{languageLiterals && languageLiterals.LblItem}#</Text>
                <Text style={{fontSize: 20}}>
                  {itemDetailsToShow.itemNumber}
                </Text>
              </View>
              <View style={styles.cardDetailsText}>
                <Text>{languageLiterals && languageLiterals.LblItemUOM}</Text>
                <Text>{itemDetailsToShow.itemUOM}</Text>
              </View>
              <View style={styles.cardDetailsText}>
                <Text>{languageLiterals && languageLiterals.LblUOMQty}#</Text>
                <Text>{itemDetailsToShow.UOMQuantity}</Text>
              </View>
              <View style={styles.cardDetailsText}>
                <Text>{languageLiterals && languageLiterals.LblCommitQty}#</Text>
                <Text>{itemDetailsToShow.commitQuantity}</Text>
              </View>
              <View style={styles.cardDetailsText}>
                <Text>{languageLiterals && languageLiterals.LblOnOrder}#</Text>
                <Text>{itemDetailsToShow.onOrder}</Text>
              </View>

              {itemDetailsToShow.pack_size && itemDetailsToShow.pack_size !== '' ? (
                <View style={styles.cardDetailsText}>
                  <Text>{languageLiterals && languageLiterals.LblPackSize}</Text>
                  <Text>{itemDetailsToShow.pack_size}</Text>
                </View>
              ) : (
                <></>
              )}

              <Text style={styles.cardDetailsText}>
                {`${itemDetailsToShow.itemsInStock} ${
                  languageLiterals && languageLiterals.LblInStock
                }`}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.orderedItemsContainer}>
        <View
          style={{
            width: '100%',
            justifyContent: 'space-between',
            flexDirection: 'row',
            height: 35,
            backgroundColor: '#ddd',
            borderRadius: 10,
          }}>
          {tabs.map((elm, index) => (
            <TouchableOpacity
              key={index}
              style={{
                width: '50%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: selectedTab === elm ? '#489CD6' : '#ddd',
                borderRadius: 10,
              }}
              onPress={() => {
                if (elm === 'Product Information' && pdfLink.trim() !== '') {
                  setviewProductPDF(true);
                }
                setSelectedTab(elm);
              }}>
              <View>
                <Text>
                  {languageLiterals && languageLiterals[mapping[elm]]}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* itemDetails.item.item_all_price */}
        <View style={{padding: 10, width: vw(95), height: vh(40)}}>
          {selectedTab === 'Quantity' ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {loggedInUser.can_modify_price === 'yes' &&
                itemDetailsToShow.multiplePriceOptionArray.length === 0 && (
                  <>
                    <View style={styles.tabDetailsText}>
                      <Text style={styles.tabDetailsTextRight}>
                        {languageLiterals && languageLiterals.LblUnitPrice}
                      </Text>
                      <Text style={styles.tabDetailsTextLeft}>
                        ${unitPrice}
                        <TouchableOpacity
                          style={{paddingLeft: 10}}
                          onPress={() => {
                            if (editStatus) {
                              setUnitPrice(itemDetailsToShow.unitPrice);
                              setDiscountAmt(0);
                              setDiscountPerc(0);
                            }
                            setEditStatus(!editStatus);
                          }}>
                          <Image
                            source={editStatus ? deleteIcon : editIcon}
                            style={styles.editIcon}
                          />
                        </TouchableOpacity>
                      </Text>
                    </View>
                  </>
                )}
              {loggedInUser.can_modify_price === 'no' &&
                itemDetailsToShow.multiplePriceOptionArray.length === 0 && (
                  <>
                    <View style={styles.tabDetailsText}>
                      <Text style={styles.tabDetailsTextRight}>
                        {languageLiterals && languageLiterals.LblUnitPrice}
                      </Text>
                      <Text style={styles.tabDetailsTextLeft}>
                        ${unitPrice}
                      </Text>
                    </View>
                  </>
                )}

              {loggedInUser.can_modify_price === 'yes' &&
                itemDetailsToShow.multiplePriceOptionArray.length > 0 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      width: vw(90),
                      paddingVertical: 15,
                      zIndex: 100,
                      alignItems: 'center',
                      minHeight: Platform.OS === 'android' ? 170 : 'auto',
                    }}>
                    <Text style={styles.tabDetailsTextRight}>
                      {languageLiterals && languageLiterals.LblUnitPrice}
                    </Text>
                    <DropDownPicker
                      items={itemDetailsToShow.multiplePriceJSON}
                      containerStyle={{height: vh(5), width: vw(60)}}
                      style={{zIndex: 100}}
                      itemStyle={{
                        justifyContent: 'flex-start',
                      }}
                      dropDownStyle={{maxHeight: vh(6)}}
                      onChangeItem={(item) => setUnitPrice(item)}
                      labelStyle={{color: '#489CD6'}}
                      onOpen={() => {
                        setUnitPriceSelectorStatus(true);
                      }}
                      onClose={() => {
                        setUnitPriceSelectorStatus(false);
                      }}
                      defaultValue={unitPrice.value}
                    />
                  </View>
                )}

              {loggedInUser.can_modify_price === 'yes' &&
                itemDetailsToShow.multiplePriceOptionArray.length === 0 && (
                  <View style={styles.tabDetailsText}>
                    <Text style={styles.tabDetailsTextRight}>
                      Minimum Price
                    </Text>
                    <Text style={styles.tabDetailsTextLeft}>
                      ${itemDetailsToShow.minPrice}
                    </Text>
                  </View>
                )}
              {editStatus && (
                <View>
                  <View style={styles.tabDetailsText}>
                    <Text style={styles.tabDetailsTextRight}>Discount %</Text>
                    <TextInput
                      value={discountPerc}
                      placeholder="Percentage"
                      placeholderTextColor="#333"
                      keyboardType="decimal-pad"
                      maxLength={10}
                      onChangeText={(text) => setDiscount(text, true)}
                      style={styles.textDiscInput}
                    />
                  </View>
                  <View style={styles.tabDetailsText}>
                    <Text style={styles.tabDetailsTextRight}>Discount $</Text>
                    <TextInput
                      value={discountAmt}
                      placeholder={
                        languageLiterals && languageLiterals.LblAmount
                      }
                      placeholderTextColor="#333"
                      keyboardType="decimal-pad"
                      maxLength={10}
                      onChangeText={(text) => setDiscount(text, false)}
                      style={styles.textDiscInput}
                    />
                  </View>
                </View>
              )}
              {!unitPriceSelectorStatus && (
                <View style={styles.tabDetailsText}>
                  <Text style={styles.tabDetailsTextRight}>
                    {languageLiterals && languageLiterals.LblInStock}
                  </Text>
                  <Text style={styles.tabDetailsTextLeft}>
                    {itemDetailsToShow.itemsInStock}
                  </Text>
                </View>
              )}
              <View
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: 30,
                }}>
                <TextInput
                  value={qty}
                  placeholder={
                    languageLiterals && languageLiterals.LblenterQuantityHere
                  }
                  placeholderTextColor="#333"
                  keyboardType="decimal-pad"
                  maxLength={10}
                  onChangeText={(text) => setQty(text.replace(/[^0-9.]/g, ''))}
                  style={styles.textInput}
                />
              </View>
            </ScrollView>
          ) : (
            <View
              style={{
                padding: 10,
                width: vw(95),
                height: vh(20),
                marginTop: vh(10),
              }}>
              <Text
                style={{
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontSize: 20,
                }}>
                No product information available.
              </Text>
            </View>
          )}
        </View>
        {selectedTab === 'Quantity' && (
          <View style={styles.buttonContainer}>
            <View style={styles.addToCartButton}>
              <Button
                onClick={() => onAddToCart()}
                color="white"
                label={languageLiterals && languageLiterals.LblAddToCart}
                disabled={qty === 0 || qty === ''}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default ItemDetails;

/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  FlatList,
  Image,
  TouchableOpacity,
  DeviceEventEmitter,
  Alert
} from 'react-native';
import Header from '../../components/Header';
import {
  getCategoriesAndFilters,
  getItems,
  getRecommendedProducts,
  productSearch,
} from '../../services/customer/customer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {vh, vw} from '../../utilities/Dimensions';
import Loader from '../../components/Loader';
import {formatNumber} from '../../utilities/utils';

import defaultImage from '../../assets/icons/ic_product_default.png';
// import ServiceCall from '../../services/EndPoints';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    color: '#000',
    marginVertical: 5,
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
  lineStyle: {
    marginTop: 5,
    borderWidth: 0.5,
    borderColor: '#c2c2c2',
    marginBottom: 10,
  },
  cardDetailsText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 6,
  },
  cardDetailsBigText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 6,
    fontSize: 17,
  },
});

const CustomerShop = ({navigation, route}) => {
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
  const [custNum, setCustNum] = React.useState('');
  const [searchText, setSearchText] = React.useState('');
  const [isEnabled, setEnable] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [topSellerItems, setTopSellerItems] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [loader, setLoader] = React.useState(false);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = React.useState(false);
  const [itemsInCart, setItemsInCart] = React.useState(0);
  const [languageLiterals, setLanguageLiterals] = React.useState(null);
  const [selectedCategory, setSelectedCategory] = React.useState({
    description: languageLiterals
      ? languageLiterals.LblAllDepartments
      : 'All Departments',
    classCode: '',
  });

  const fetchSearchedProducts = async () => {
    setLoader(true);
    if (searchText === '') {
      if (
        selectedCategory.description ===
        (languageLiterals.LblAllDepartments || 'All Departments')
      ) {
        fetchRecommendedProducts(custNum);
      } else {
        fetchItems(custNum, selectedCategory.classCode);
      }
    } else {
      setItems([]);
      const resp = await productSearch(custNum, searchText);
      if (resp !== null && resp.search_result.length > 0) {
        setItems(resp.search_result);
        setLoader(false);
      }
    }
    setLoader(false);
  };

  const fetchCategories = React.useCallback(async () => {
    setLoader(true);
    const resp = await getCategoriesAndFilters();
    if (resp !== null && resp !== undefined && resp.data && resp.data.categories.length > 0) {
      setCategories(resp.data.categories);
    }
  }, []);

  const fetchRecommendedProducts = React.useCallback(async (customerNumber) => {
    setLoader(true);
    const resp = await getRecommendedProducts(customerNumber);
    console.log('respShopProducts', JSON.stringify(resp));

    if(resp === undefined) {
      Alert.alert(
        `Data is not synced!`,
        '',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
        {cancelable: false},
      );
    } 
    if (resp !== null && resp !== undefined && resp.inspiredby_purchasing_history.length > 0) {
      setItems(resp.inspiredby_purchasing_history);
      setLoader(false);
    }
    if (resp !== null && resp !== undefined && resp.top_selling_items.length > 0) {
      setTopSellerItems(resp.top_selling_items);
      setLoader(false);
    }
    setLoader(false);
  }, []);

  const fetchItems = React.useCallback(async (customerNumber, categoryId) => {
    setLoader(true);
    setItems([]);
    if (categoryId === '') {
      await fetchRecommendedProducts(customer.customerNumber);
    } else {
      const resp = await getItems(customerNumber, categoryId.toString());
      console.log('respShopProducts ', JSON.stringify(resp));
      if (resp !== null && resp !== undefined && resp.items.length > 0) {
        setItems(resp.items);
        setSearchText('');
        setLoader(false);
      }
      setLoader(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const onRender = async () => {
  //   const cartItems = await AsyncStorage.getItem('IN_CART_PRODUCTS_LENGTH');
  //   setItemsInCart(parseInt(cartItems, 10));
  // };

  React.useEffect(() => {
    (async function () {
      setLoader(true);
      const customerFromStorage = await AsyncStorage.getItem('CUSTOMER');
      setCustomer(JSON.parse(customerFromStorage));
      setCustNum(JSON.parse(customerFromStorage).customerNumber);
      await fetchCategories();
      if (JSON.parse(customerFromStorage).customerNumber) {
        const res = await fetchRecommendedProducts(
          JSON.parse(customerFromStorage).customerNumber,
        );
        console.log('res: ', res);
      }
      DeviceEventEmitter.emit('RefreshPage', {});
      const language = await AsyncStorage.getItem('LITERALS');
      setLanguageLiterals(JSON.parse(language));
      const literals = JSON.parse(language);
      setSelectedCategory({
        description: literals ? literals.LblAllDepartments : 'All Departments',
        classCode: '',
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderCategories = (item) => {
    const details = {
      description: item.description || 'Demo',
      classCode: item.class_code || '',
    };
    return (
      <TouchableOpacity
        style={{width: '100%'}}
        onPress={async () => {
          setSelectedCategory(details);
          setIsCategoryPickerOpen(false);
          setSearchText('');
          await fetchItems(customer.customerNumber, details.classCode);
        }}>
        <View
          style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'row',
            borderBottomColor: '#c2c2c2',
            paddingVertical: 8,
            marginHorizontal: 10,
            borderBottomWidth: 1,
          }}>
          <View style={{width: '100%'}}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '100%'}}>
                <Text style={styles.categoryName}>{details.description}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = (item) => {
    const details = {
      description: item.item?.description
        ? item.item.description.toUpperCase()
        : '',
      image:
        item.item.pictures && item.item.pictures.length > 0
          ? `${item.item.pictures[0]}`
          : '',
      images:
          item.item.pictures && item.item.pictures.length > 0
            ? `${item.item.pictures}`
            : '',    
      itemNumber: item.item.item_number || '',
      itemUOM: item.item.item_uom || '',
      pack_size: item.item.pack_size || '',
      UOMQuantity: item.item.uom_qty || 0,
      pricePerUOM: item.item.price || 0,
      itemsInStock: item.item.qty_on_hand - item.item.commit_qty || 0,
    };
    return (
      <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.setItem(
            'CURRENT_ITEM_DETAILS',
            JSON.stringify(item),
          );
          navigation.navigate('ItemDetails', {
            params: {customer: item, orderNumber: details.orderNumber},
            screen: 'ItemDetails',
          });
        }}>
        <View
          style={{
            height: vh(37),
            width: vw(45),
            borderRightWidth: 1,
            borderBottomWidth: 2,
            borderLeftWidth: 0.5,
            borderTopWidth: 0.5,
            borderColor: '#c2c2c2',
            margin: 10,
            padding: 5,
          }}>
          {details.image !== '' ? (
            <Image
              source={{uri: details.image}}
              resizeMode="contain"
              style={{
                width: '95%',
                height: vh(17),
                marginTop: 5,
                alignSelf: 'center',
                backgroundColor: 'white',
              }}
            />
          ) : (
            <Image
              source={defaultImage}
              resizeMode="cover"
              style={{
                width: '95%',
                height: vh(17),
                marginTop: 5,
                alignSelf: 'center',
              }}
            />
          )}

          <View style={styles.lineStyle} />
          <Text
            numberOfLines={1}
            style={{
              marginHorizontal: 6,
              color: '#489CD6',
              fontSize: 15,
              fontWeight: '500',
            }}>
            {details?.description}
          </Text>
          <View style={styles.cardDetailsText}>
            <Text>{languageLiterals && languageLiterals.Lblitems}</Text>
            <Text>{details.itemNumber}</Text>
          </View>
          <View style={styles.cardDetailsText}>
            <Text>{languageLiterals && languageLiterals.LblItemUOM}</Text>
            <Text>{details.itemUOM}</Text>
          </View>
          {details.pack_size && details.pack_size !== '' ? (
            <View style={styles.cardDetailsText}>
            <Text>{languageLiterals && languageLiterals.LblPackSize}</Text>
            <Text>{details.pack_size}</Text>
          </View>
          ) : (
            <></>
          )}
          <View style={styles.cardDetailsText}>
            <Text>{languageLiterals && languageLiterals.LblUOMQty}</Text>
            <Text>{details.UOMQuantity}</Text>
          </View>

          <View style={styles.cardDetailsText}>
            <Text>{languageLiterals && languageLiterals.LblUOMQty}</Text>
            <Text>{details.UOMQuantity}</Text>
          </View>
          
          <Text style={styles.cardDetailsBigText}>
            {/* {`$${details.pricePerUOM}/UOM`} */}
            {`$${formatNumber(details.pricePerUOM.toFixed(2))}/UOM `}
          </Text>
          <Text style={styles.cardDetailsText}>
            {`${details.itemsInStock} ${
              languageLiterals && languageLiterals.LblInStock
            }`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={customer.customerName}
        isLogOut
        navigation={navigation}
        isBack
        showCart
        onBackPress={() => {
          if (isCategoryPickerOpen) {
            setIsCategoryPickerOpen(false);
          } else {
            DeviceEventEmitter.emit('RefreshPage', {});
            navigation.goBack();
          }
        }}
        itemsInCart={itemsInCart}
      />
      {isCategoryPickerOpen ? (
        <FlatList
          data={[
            {
              description: languageLiterals
                ? languageLiterals.LblAllDepartments
                : 'All Departments',
              classCode: '',
            },
            ...categories.sort((a, b) => {
              if (a.description < b.description) {
                return -1;
              }
              if (a.description > b.description) {
                return 1;
              }
              return 0;
            }),
          ]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => renderCategories(item)}
          ListEmptyComponent={
            <View style={styles.noValuesFound}>
              <Text style={styles.noValueText}>No categories found.</Text>
            </View>
          }
        />
      ) : (
        <>
          <TouchableOpacity
            style={{width: '100%'}}
            onPress={() => setIsCategoryPickerOpen(true)}>
            <View
              style={{
                height: vh(7),
                padding: 10,
                backgroundColor: '#8AC7DB',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: 18,
                }}>{`${selectedCategory.description} ${
                loader
                  ? ''
                  : `(${isEnabled ? topSellerItems.length : items.length})`
              }`}</Text>
            </View>
          </TouchableOpacity>
          <View
            style={{
              height: vh(7),
              backgroundColor: '#eee',
              justifyContent: 'center',
              padding: 15,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: '#cecece',
            }}>
            <TextInput
              style={{
                backgroundColor: '#ddd',
                height: vh(4),
                padding: 10,
                borderRadius: 10,
              }}
              onSubmitEditing={fetchSearchedProducts}
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
              placeholder={
                languageLiterals && languageLiterals.LblProductSearch
              }
              placeholderTextColor="#333"
              blurOnSubmit={true}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: vh(5),
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                width: '70%',
              }}>
              <Text style={{fontSize: 18, fontWeight: '400'}}>
                {languageLiterals && languageLiterals.LblThisWeeksTopSeller}
              </Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                width: '30%',
                paddingHorizontal: 15,
              }}>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setEnable}
                value={isEnabled}
                style={{marginLeft: 10}}
              />
            </View>
          </View>
          {loader ? (
            <View style={{height: 'auto', display: 'flex', flexGrow: 1}}>
              <Loader />
            </View>
          ) : (
            <FlatList
              data={isEnabled ? topSellerItems : items}
              numColumns={2}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{
                justifyContent: 'space-between',
                display: 'flex',
                height: 'auto',
              }}
              ListEmptyComponent={
                <View style={styles.noValuesFound}>
                  <Text style={styles.noValueText}>No items found.</Text>
                </View>
              }
              renderItem={(item) => renderItem(item)}
            />
          )}
        </>
      )}
    </View>
  );
};

export default CustomerShop;

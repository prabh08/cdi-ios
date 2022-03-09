/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  DeviceEventEmitter,
  Alert
} from 'react-native';
import Button from '../../components/Button';
import Header from '../../components/Header';
import {
  getAllCustomers,
  getCategoriesAndFilters,
  getItems,
  getRecommendedProducts,
  getOrderHistory,
  getInvoiceHistory
} from '../../services/customer/customer';

import {vh, vw, statusBarHeight} from '../../utilities/Dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader';
import CheckBox from '@react-native-community/checkbox';
const syncSelectTypes = [
  {label: 'Orders', value: 'orders'},
  {label: 'Items', value: 'items'},
  {label: 'Invoices', value: 'invoices'},
];
const styles = StyleSheet.create({
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 15,
  },
  collectPaymentButton: {
    marginTop: 0,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#489CD6',
    color: '#489CD6',
    width: vw(50),
    borderRadius: 5,
    height: vh(5),
  },
  headerContainer: {
    backgroundColor: '#489CD6',
    height: vh(10),
  },
  categoryName: {
    fontSize: 18,
    color: '#000',
    marginVertical: 5,
  },
  headerView: {
    marginTop: statusBarHeight,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 22,
  },
  itemContainer: {
    width: vw(90),
    margin: 2,
    height: vh(22),
    alignSelf: 'center',
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowColor: '#000',
    elevation: 3,
    backgroundColor: 'white',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationView: {
    width: '30%',
    justifyContent: 'center',
    height: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    color: '#489CD6',
  },
  serial: {
    color: '#c2c2c2',
    marginTop: 3,
    fontWeight: '700',
  },
  phoneImg: {
    width: 15,
    height: 15,
  },
  tag: {
    width: vw(7),
    height: vw(7),
    backgroundColor: 'rgb(33,73,118)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    marginTop: 3,
  },
  filterView: {
    height: vh(10),
    backgroundColor: 'rgb(243,250,253)',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  searcBarView: {
    marginTop: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  searchText: {
    height: vh(5),
    backgroundColor: '#f4f4f6',
    width: vw(92),
    marginLeft: 10,
    borderRadius: 10,
    paddingLeft: 10,
    borderWidth: 2,
    borderColor: '#c2c2c2',
    color: '#000',
  },
  container: {
    flex: 1,
  },
  dropdownContainer: {
    display: 'flex',
    backgroundColor: '#8AC7DB',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  searchTextStyle: {
    margin: 30,
    backgroundColor: 'white',
    height: 40,
    width: vw(95),
    borderColor: 'gray',
    shadowColor: 'gray',
    shadowOffset: {width: 0, height: 1},
    padding: 10,
  },
  itemContainer: {
    width: vw(100),
    margin: 2,
    height: vh(10),
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    paddingRight: 20,
  },
  searcBarView: {
    marginTop: 0,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  searchText: {
    height: vh(5),
    backgroundColor: 'rgb(244,244,246)',
    width: vw(92),
    marginLeft: 10,
    borderRadius: 10,
    paddingLeft: 10,
  },
  orderNumber: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
    marginVertical: 5,
  },
  orderDate: {
    color: '#c2c2c2',
    fontWeight: '600',
    marginVertical: 5,
  },
  invoiceDate: {
    color: '#c2c2c2',
    fontWeight: '600',
    marginVertical: 5,
  },
  orderSubTotal: {
    color: '#c2c2c2',
    fontWeight: '600',
    marginVertical: 5,
    textAlign: 'right',
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
  collectPaymentButton: {
    marginTop: 0,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#489CD6',
    color: '#489CD6',
    width: vw(50),
    borderRadius: 5,
    height: vh(5),
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 15,
  },
  totalPanelInvoiceContainer: {
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: vh(7),
    alignItems: 'center',
  },
  totalPanelInvoiceText: {
    fontSize: 20,
  },
});

const SyncSelectionScreen = ({route, navigation}) => {
  const { customers } = route.params;
  const [selectedTypeOfSync, setselectedTypeOfSync] = React.useState([]);
  
  const [loader, setLoader] = React.useState(false);
  const [languageLiterals, setLanguageLiterals] = React.useState(null);
  const [items, setItems] = React.useState([]);

  const onLoad = async () => {
    const language = await AsyncStorage.getItem('LITERALS');
    setLanguageLiterals(JSON.parse(language));
    // await fetchOrderHistory();
  };

  React.useEffect(() => {
    const mount = async () => {
      DeviceEventEmitter.addListener('RefreshInvoices', async () => {
        onLoad();
      });
      onLoad();
    };
    mount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitClick = async () => {
    let customerCount =  selectedTypeOfSync.length;
    if(customerCount === 0) {
      alert("Please select at least one type!")
    } else {
      setLoader(true);
      var syncDone = 0;
      if(selectedTypeOfSync.includes('items')) {
        await syncItems();
      }

      if(selectedTypeOfSync.includes('orders')) {
        await syncOrders();
      }

      if(selectedTypeOfSync.includes('invoices')) {
        await syncInvoices();
      }
      setTimeout(() => {
        setLoader(false);
        Alert.alert(
          'Data has been synced!',
          '',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.push('SalesHome');
              },
            },
          ],
          {cancelable: false},
        );
      }, 10000);
    }
  };

  const fetchItems = React.useCallback(async (customerNumber, categoryId) => {
    if (categoryId === '') {
      await fetchRecommendedProducts(customerNumber);
    } else {
      const resp = await getItems(customerNumber, categoryId.toString());
      // console.log('respShopProducts ', JSON.stringify(resp));
      if (resp !== null && resp.items.length > 0) {
        // console.log(JSON.stringify(resp.items), ' respItems');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const fetchCategories = React.useCallback(async () => {
    const resp = await getCategoriesAndFilters();
    if (resp !== null && resp.data && resp.data.categories.length > 0) {
      let categories = resp.data.categories;
      for (let i = 0; i < categories.length; i++) { 
        if (customers.length > 0) {
          for (let j = 0; j < customers.length; j++) {
            await fetchItems(customers[j], categories[i].class_code);
          }
        }
      }
    }
  }, []);

  const fetchRecommendedProducts = React.useCallback(async (customerNumber) => {
    // setLoader(true);
    const resp = await getRecommendedProducts(customerNumber);
  }, []);

  const syncItems = async () => { 
    if(customers.length > 0) {
      await fetchCategories();
      for (let i = 0; i < customers.length; i++) { 
        await fetchItems(customers[i], '');
      }
    }
  }

  const syncOrders = async () => { 
    if(customers.length > 0) {
      for (let i = 0; i < customers.length; i++) { 
        await getOrderHistory(customers[i], 6);
      }
    }
  }

  const syncInvoices = async () => { 
    // ***************
    if(customers.length > 0) {
      for (let i = 0; i < customers.length; i++) { 
       await getInvoiceHistory(customers[i]);
      }
    }
  }

  
  const addTypeOfSync = (typeOfSelection, value) => {
    if (value) {
      setselectedTypeOfSync(() => [...selectedTypeOfSync, typeOfSelection]);
    } else {
      setselectedTypeOfSync(() => [
        ...selectedTypeOfSync.filter((elm) => elm !== typeOfSelection),
      ]);
    }
  };

  const renderItem = (item) => {
    const details = {
      label: item?.label || 0,
      value: item?.value || 0,
    };
    return (
      <TouchableOpacity>
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
                <Text style={styles.categoryName}>{item.label}</Text>
              </View>
              
              <View style={{flexDirection: 'row'}}>
                  <Text style={{marginLeft: 'auto', right: 20}}>
                    <CheckBox
                    boxType="square"
                    value={selectedTypeOfSync.includes(details.value)}
                    onValueChange={(newValue) =>
                      addTypeOfSync(
                        details.value,
                        newValue,
                      )
                    }
                    tintColors={{true: '#F15927', false: 'black'}}
                    style={{
                      height: 20,
                      width: 20,
                    }}
                  />
                  </Text>
                </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loader) {
    return (
      <View style={styles.container}>
        <Header
          title='Customers'
          isLogOut
          navigation={navigation}
          isBack
          onBackPress={() => navigation.goBack()}
        />
        <Loader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title='Customers'
        isLogOut
        navigation={navigation}
        isBack
        onBackPress={() => navigation.goBack()}
      />
      <FlatList
        data={syncSelectTypes}
        style={{marginTop: 10, zIndex: 0, marginBottom: 20}}
        contentContainerStyle={{marginBottom: 20}}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => renderItem(item)}
        ListEmptyComponent={
          <View style={styles.noValuesFound}>
            <Text style={styles.noValueText}>
              {languageLiterals && languageLiterals['200_no_invoices']}
            </Text>
          </View>
        }
      />
      <View style={styles.buttonContainer}>
        <View style={styles.collectPaymentButton}>
          <Button
            onClick={onSubmitClick}
            color="white"
            // label={languageLiterals && languageLiterals.LblCollectPayment}
            label="Submit"
          />
        </View>
      </View>
    </View>
  );
};

export default SyncSelectionScreen;

/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, Image, StyleSheet, Alert, Platform, ScrollView} from 'react-native';
import {vh, vw, statusBarHeight} from '../../utilities/Dimensions';
import NetInfo from '@react-native-community/netinfo';
import salesImg from '../../assets/dashboard/ic_sales.png';
import cartImg from '../../assets/dashboard/ic_opencart.png';
import customerImg from '../../assets/dashboard/ic_dashboard_customers.png';
import phoneImg from '../../assets/dashboard/ic_call.png';
import mailImg from '../../assets/dashboard/ic_mail.png';
import addressImg from '../../assets/dashboard/ic_address.png';
import userImg from '../../assets/icons/user-profile.jpg';
import nextImg from '../../assets/dashboard/ic_next_black.png';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Header from '../../components/Header';
import {PERMISSIONS, check, request, RESULTS} from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../../components/Loader';
import {formatNumber} from '../../utilities/utils';
// import { is } from '@babel/types';
// import {DEFAULT_INSERT_QUERIES, DEFAULT_SELECT_QUERIES, generateValues} from '../../localdatabase/queries';

const SalesDashboard = ({navigation}) => {
  
    const [user, setUser] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const [languageLiterals, setLanguageLiterals] = React.useState();
    const [offline, setOffline] = React.useState(false);

    React.useEffect(() => {
      (async function () {
        return NetInfo.fetch().then(async (state) => {
          if(!state.isConnected) {
            setOffline(true);
          } else {
            setOffline(false);
          }
          setLoading(true);
          // generateValues();
          const loggedInUser = await AsyncStorage.getItem('APP_DATA');
          console.log('userdata2 ', loggedInUser);
          const language = await AsyncStorage.getItem('LITERALS');
          setLanguageLiterals(JSON.parse(language));
          setUser(JSON.parse(loggedInUser));
          
          setLoading(false);
        })
      })();
    }, []);

    if (loading) {
      return <Loading />;
    }

    return languageLiterals ? (
      <View style={{flex: 1}}>
        <Header
          title={user.salesPersonName || 'Name'}
          isLogOut
          navigation={navigation}
        />
        <View
          style={{
            backgroundColor: 'white',
            height: vh(22),
            flexDirection: 'row',
          }}>
          <View style={{marginTop: 20, marginLeft: 20, justifyContent: 'center'}}>
            <Text style={{color: '#489CD6', fontWeight: '500', fontSize: 20}}>
              #{user.salesRepId || 0}
            </Text>
            <View
              style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
              <Image source={phoneImg} style={{width: 20, height: 20}} />
              <Text style={{marginLeft: 5}}>NA</Text>
            </View>
            <View
              style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
              <Image source={mailImg} style={{width: 20, height: 20}} />
              <Text style={{marginLeft: 5}}>NA</Text>
            </View>
            <View
              style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
              <Image source={addressImg} style={{width: 20, height: 20}} />
              <Text style={{marginLeft: 5, width: vw(50)}} numberOfLines={3}>
                {user.salesPersonAddress && user.salesPersonAddress.length > 0
                  ? 'Address'
                  : 'NA'}
              </Text>
            </View>
          </View>
          {!offline && (
            <View
              style={{
                marginTop: 20,
                marginBottom: 20,
                height: vh(18),
                width: vw(25),
                marginLeft: 20,
                justifyContent: 'center',
              }}>
              {user.salesman_picture && user.salesman_picture !== '' ? (
                <Image
                  source={{uri: user.salesman_picture}}
                  style={{height: vh(15), width: vw(25)}}
                />
              ) : (
                <Image source={userImg} style={{height: vh(15), width: vw(25)}} />
              )}
            </View>
          )}

          {offline && (
            <View
              style={{
                marginTop: 20,
                marginBottom: 20,
                height: vh(18),
                width: vw(25),
                marginLeft: 20,
                justifyContent: 'center',
              }}>
              <Image source={userImg} style={{height: vh(15), width: vw(25)}} />
            </View>
          )} 
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={[styles.tempContainer, {backgroundColor: 'rgb(145,195,116)'}]}>
          <Image source={salesImg} style={styles.containerAlign} />
          <View>
            <Text style={styles.title}>
              {languageLiterals.LblSalesInLast || 'Sales in last'} {user.number_of_days}{' '}
              {languageLiterals.LblDays || 'days'}
            </Text>
            <Text style={styles.value}>
              ${formatNumber(user.total_sales_amount || 0)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.tempContainer,
            {backgroundColor: 'rgb(78,146,144)', justifyContent: 'space-between'},
          ]}>
          <TouchableOpacity
            style={styles.arrowContainer}
            onPress={async () => {
              const data = JSON.stringify(user.openOrdersInfo.open_orders);
              await AsyncStorage.setItem('OPEN_ORDERS', data);
              navigation.push('OpenOrders');
            }}>
            <Image source={cartImg} style={styles.containerAlign} />
            <View>
              <Text style={styles.title}>
                {user.openOrdersInfo?.no_open_orders || 0}{' '}
                {`${languageLiterals.LblOpen} ${languageLiterals.LblOrders}` ||
                  'Open Orders'}
              </Text>
              <Text style={styles.value}>
                $
                {formatNumber(user.openOrdersInfo?.total_open_orders_amount || 0)}
              </Text>
            </View>
          </TouchableOpacity>
          <Image source={nextImg} style={styles.nextArrow} />
        </View>
        <View
          style={[
            styles.tempContainer,
            {backgroundColor: 'rgb(78,146,144)', justifyContent: 'space-between'},
          ]}>
          <TouchableOpacity
            style={styles.arrowContainer}
            onPress={async () => {
              const data = JSON.stringify(user.customersOverdue.overdue_customers);
              await AsyncStorage.setItem('OPEN_OVERDUE', data);
              navigation.push('OpenOverdues');
            }}>
            <Image source={cartImg} style={styles.containerAlign} />
            <View>
              <Text style={styles.title}>
                {user?.customersOverdue?.no_overdue_customers || 0}{' '}
                {languageLiterals.LblCustOverdue || 'Customers Overdue'}
              </Text>
              <Text style={styles.value}>
                $
                {formatNumber(user.customersOverdue?.total_overdue_amount || 0)}
              </Text>
            </View>
          </TouchableOpacity>
          <Image source={nextImg} style={styles.nextArrow} />
        </View>
        <TouchableOpacity
          style={[
            styles.tempContainer,
            {backgroundColor: 'rgb(50,72,85)', justifyContent: 'space-between'},
          ]}
          onPress={async () => {
            await AsyncStorage.setItem('IN_CART_PRODUCTS_LENGTH', '0');
            if (Platform.OS === 'ios') {
              check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
                .then(async (res) => {
                  if (res === RESULTS.DENIED || res === RESULTS.BLOCKED) {
                    request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then((res) => {
                      console.log('res', res);
                      if (res === RESULTS.GRANTED) {
                        navigation.navigate('Customers');
                      }
                    });
                  } else if (res === RESULTS.GRANTED) {
                    navigation.navigate('Customers');
                  } else {
                    Alert.alert(
                      'Please make sure Location permission is enabled. You can enable Location permission from Settings',
                    );
                  }
                  console.log('res: ', res);
                })
                .catch((err) => {
                  console.log('err', err);
                });
            } else if (Platform.OS === 'android') {
              check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
                .then(async (res) => {
                  if (res === RESULTS.DENIED || res === RESULTS.BLOCKED) {
                    request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(
                      (resp) => {
                        console.log('resp', resp);
                        if (res === RESULTS.GRANTED) {
                          navigation.navigate('Customers');
                        }
                      },
                    );
                  } else if (res === RESULTS.GRANTED) {
                    navigation.navigate('Customers');
                  } else {
                    Alert.alert(
                      'Please make sure Location permission is enabled. You can enable Location permission from Settings',
                    );
                  }
                  console.log('res: ', res);
                })
                .catch((err) => {
                  console.log('err', err);
                });
            }
            //  checkLocationAccuracy().then(res => {
            //    console.log('res: ', res);

            //  }).catch(err => {
            //    Alert.alert(err)
            //  })
            // navigation.navigate('Customers')
          }}>
          <View style={styles.arrowContainer}>
            <Image source={customerImg} style={styles.containerAlign} />
            <View>
              <Text style={styles.title}>
                {languageLiterals.LblViewAllCustomers || 'View all Customers'}
              </Text>
              <Text style={styles.value}>
                {languageLiterals.LblCustomers || 'Customers'}
              </Text>
            </View>
          </View>
          <Image source={nextImg} style={styles.nextArrow} />
        </TouchableOpacity>
        <View
          style={[
            styles.tempContainer,
            {backgroundColor: 'rgb(78,146,144)', justifyContent: 'space-between'},
          ]}>
          <TouchableOpacity
            style={styles.arrowContainer}
            onPress={async () => {
              return NetInfo.fetch().then(async (state) => {
              if(state.isConnected) {
              // if(false) {
                  const data = JSON.stringify(user.openOrdersInfo.open_orders);
                  await AsyncStorage.setItem('OPEN_ORDERS', data);
                  navigation.push('CustomerListing');
                } else {
                  alert('This feature is available in online mode!');
                }
              });
            }}>
            <Image source={customerImg} style={styles.containerAlign} />
            <View>
            <Text style={styles.title}>Cutomer's Data</Text>
                {/* <Text style={styles.value}>Sync</Text> */}
              <Text style={styles.value}>
                {languageLiterals.LblSync || 'Sync'}
              </Text>
            </View>
          </TouchableOpacity>
          <Image source={nextImg} style={styles.nextArrow} />
        </View>
          </ScrollView>
      </View>
    ) : null;
};

const styles = StyleSheet.create({
  // container: {
  //   height: vh(13),
  //   marginTop: 2,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  // },
  // Remove this and use the above container when integrating Sync.
  tempContainer: {
    height: statusBarHeight > 23 ? vh(17) : vh(16.45),
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: 'white',
  },
  value: {
    color: 'white',
    fontSize: 25,
  },
  headerContainer: {
    backgroundColor: '#489CD6',
    height: vh(10),
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
  containerAlign: {
    marginLeft: 10,
  },
  nextArrow: {
    tintColor: 'white',
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SalesDashboard;

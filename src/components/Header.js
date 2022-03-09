import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  DeviceEventEmitter,
  Platform,
} from 'react-native';
import {vh, statusBarHeight, vw} from '../utilities/Dimensions';
import backIcon from '../assets/common/ic_prev.png';
import cartIcon from '../assets/dashboard/ic_opencart.png';
import logOutIcn from '../assets/common/logout.png';
import {onLogOut} from '../services/common/common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AndroidStyles from './styles/Header/AndroidStyles';
import NetInfo from '@react-native-community/netinfo';

const Header = ({
  title,
  isBack,
  onBackPress,
  isLogOut,
  navigation,
  login,
  customers,
  showCart,
  itemsInCart,
}) => {
  const [totalItemsInCart, setTotalItemsInCart] = React.useState(itemsInCart);
  const styles = Platform.OS === 'android' ? AndroidStyles : stylesiOS;

  const onLogoutClick = async (callAPI = true) => {
    if (callAPI) {
      const resp = await onLogOut();
      //
      await AsyncStorage.removeItem('USER');
      await AsyncStorage.removeItem('APP_DATA');
      if (resp !== null) {
        // await AsyncStorage.removeItem('USER');
        // await AsyncStorage.removeItem('APP_DATA');
        DeviceEventEmitter.emit('ClearLoginValues', {});
      }
      navigation.navigate('Login');
      console.log('resp: ', resp);
    } else {
      await AsyncStorage.removeItem('USER');
      await AsyncStorage.removeItem('APP_DATA');
    }
  };

  const onRender = async () => {
    const cartItems = await AsyncStorage.getItem('IN_CART_PRODUCTS_LENGTH');
    let total = 0;
    try {
      total = parseInt(cartItems, 10);
    } catch {
      setTotalItemsInCart(0);
    }
    if (total > 10) {
      setTotalItemsInCart(11);
    }
  };

  React.useEffect(() => {

    (async function () {
      DeviceEventEmitter.addListener('RefreshPage', async () => {
        await onRender();
      });
    })();

    (async function () {
      DeviceEventEmitter.addListener('RedirectToLogin', async () => {
        await onLogoutClick(false);
        navigation.navigate('Login');
      });
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const returnBackIcon = () => {
    if (Platform.OS === 'ios') {
      return (
        <TouchableOpacity style={styles.back} onPress={onBackPress}>
          <Image source={backIcon} style={styles.back} />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity style={styles.backContainer} onPress={onBackPress}>
        <Image source={backIcon} style={styles.back} />
      </TouchableOpacity>
    );
  };

  const returnCartIcon = () => {
    if (Platform.OS === 'ios') {
      return (
        <TouchableOpacity
          style={styles.logOut}
          onPress={async () => {
            navigation.navigate('Cart', {
              screen: 'Cart',
            });
          }}>
          <Image source={cartIcon} style={styles.cart} />
          <View
            style={
              totalItemsInCart > 10
                ? styles.normalNotificationContainer
                : styles.notificationContainer
            }>
            <Text style={styles.notification}>
              {totalItemsInCart > 10 ? '10+' : totalItemsInCart}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={styles.cartContainer}
        onPress={async () => {
          navigation.navigate('Cart', {
            screen: 'Cart',
          });
        }}>
        <Image source={cartIcon} style={styles.cart} />
        <View
          style={
            totalItemsInCart > 10
              ? styles.normalNotificationContainer
              : styles.notificationContainer
          }>
          <Text style={styles.notification}>
            {totalItemsInCart > 10 ? '10+' : totalItemsInCart}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {isBack && returnBackIcon()}
        <Text
          style={
            login
              ? styles.titleLogin
              : customers
              ? styles.titleCustomer
              : styles.title
          }
          numberOfLines={1}>
          {title}
        </Text>
        {showCart && returnCartIcon()}
        {isLogOut && (
          <TouchableOpacity
            style={styles.logOut}
            onPress={async () => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  {
                    text: 'Cancel',
                  },
                  {
                    text: 'OK',
                    onPress: async () => {
                      onLogoutClick();
                    },
                  },
                ],
                {cancelable: false},
              );
            }}>
            <Image source={logOutIcn} style={styles.logOut} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const stylesiOS = StyleSheet.create({
  container: {
    backgroundColor: '#489CD6',
  },
  innerContainer: {
    marginTop: statusBarHeight,
    justifyContent: 'center',
    alignItems: 'center',
    height: vh(7),
    flexDirection: 'row',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 0.6,
    marginTop: 3,
    marginRight: 25,
  },
  titleLogin: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    alignItems: 'center',
    marginTop: 3,
    justifyContent: 'center',
  },
  titleCustomer: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    position: 'absolute',
    left: 0,
    width: 20,
    height: 20,
    marginLeft: 10,
    flex: 0.3,
    marginTop: 3,
  },
  cart: {
    position: 'absolute',
    right: 55,
    width: 30,
    height: 30,
    marginLeft: 10,
    flex: 0.3,
    top: -2,
  },
  logOut: {
    position: 'absolute',
    right: 0,
    width: 25,
    height: 25,
    marginRight: 10,
    tintColor: 'white',
    flex: 0.3,
  },
  notification: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  notificationContainer: {
    position: 'relative',
    right: 40,
    zIndex: 10,
    height: 18,
    minWidth: 15,
    width: 'auto',
    maxWidth: vw(5),
    borderRadius: 10,
    backgroundColor: 'red',
    color: 'white',
    borderWidth: 1,
    borderColor: 'red',
    fontWeight: 'bold',
    marginTop: -3,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
  normalNotificationContainer: {
    position: 'relative',
    right: 40,
    zIndex: 10,
    height: 20,
    minWidth: 25,
    width: 'auto',
    maxWidth: vw(5),
    borderRadius: 10,
    backgroundColor: 'red',
    color: 'white',
    borderWidth: 1,
    borderColor: 'red',
    fontWeight: 'bold',
    marginTop: -3,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
});

export default Header;

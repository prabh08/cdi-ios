import {StyleSheet} from 'react-native';
import {vh, statusBarHeight, vw} from '../../../utilities/Dimensions';

const height = statusBarHeight > 23 ? 23 : statusBarHeight;

const AndroidStyles = StyleSheet.create({
  container: {
    backgroundColor: '#489CD6',
  },
  innerContainer: {
    alignItems: 'center',
    height: height,
    margin: height,
    flexDirection: 'row',
    paddingVertical: height / 2,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    width: vw(53),
    marginTop: 3,
    marginRight: 25,
    maxWidth: 300,
  },
  titleCustomer: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    width: vw(53),
    marginTop: 3,
    marginRight: 25,
    maxWidth: 300,
  },
  titleLogin: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
  },
  backContainer: {
    width: vw(10),
    maxWidth: 40,
    height: 20,
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  back: {
    position: 'absolute',
    left: 0,
    width: 20,
    height: 20,
    marginTop: 3,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  cartContainer: {
    width: vw(14),
    maxWidth: 60,
    height: 25,
    tintColor: 'white',
    alignContent: 'center',
    display: 'flex',
    paddingHorizontal: 5,
  },
  cart: {
    position: 'absolute',
    right: 20,
    width: 30,
    height: 30,
    marginLeft: 10,
    top: -2,
  },
  logOut: {
    position: 'absolute',
    right: 0,
    width: 25,
    height: 25,
    marginRight: 0,
    tintColor: 'white',
    flex: 0.1,
  },
  notification: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  notificationContainer: {
    position: 'relative',
    right: -20,
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
    right: 3,
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

export default AndroidStyles;

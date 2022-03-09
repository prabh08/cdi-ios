/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import 'react-native-gesture-handler';
import * as React from 'react';
import {Image} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Feather from "react-native-vector-icons/Feather";
Feather.loadFont();
import LoginScreen from './src/containers/auth/LoginScreen';
import DomainScreen from './src/containers/auth/DomainSettings';
import SalesHome from './src/containers/dashboard/salesDashboard';
import SpalshScreen from './src/containers/splash/Splash';
import CustomerScreen from './src/containers/customer/Customer';
import OpenOdersScreen from './src/containers/orders/Orders';
import CustomerAccount from './src/containers/customer/CustomerDashboard';
import CustomerShopScreen from './src/containers/customer/CustomerShop';
import CustomerInvoiceScreen from './src/containers/customer/CustomerInvoice';
import CustomerOrdersScreen from './src/containers/customer/CustomerOrders';
import OrderDetails from './src/containers/customer/OrderDetails';
import InvoiceDetails from './src/containers/customer/InvoiceDetails';
import CollectPayment from './src/containers/customer/CollectPayment';
import ItemDetails from './src/containers/customer/ItemDetails';
import Cart from './src/containers/customer/Cart';
import Checkout from './src/containers/customer/Checkout';
import OpenOrders from './src/containers/customer/OpenOrders';
import OpenOverdues from './src/containers/customer/OpenOverdues';
import CustomerListingForSync from './src/containers/syncCustomers/CustomerListingForSync';
import SyncSelectionScreen from './src/containers/syncCustomers/SyncSelectionScreen';

import AccountIcn from './src/assets/customer/icnavaccount.png';
import SaleIcn from './src/assets/customer/icnavshop.png';
import InvoiceIcn from './src/assets/customer/icnavinvoice.png';
import OrderIcn from './src/assets/customer/icnavorder.png';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function CustomerDashboard() {
  return (
    <Tab.Navigator initialRouteName="CustomerAccount">
      <Tab.Screen
        name="CustomerAccount"
        component={CustomerAccount}
        options={{
          unmountOnBlur: true,
          tabBarLabel: 'Account',
          tabBarIcon: ({color, size}) => (
            <Image source={AccountIcn} style={{tintColor: color}} />
          ),
        }}
      />
      <Tab.Screen
        name="CustomerShop"
        component={CustomerShopScreen}
        options={{
          unmountOnBlur: true,
          tabBarLabel: 'Shop',
          tabBarIcon: ({color, size}) => (
            <Image source={SaleIcn} style={{tintColor: color}} />
          ),
        }}
      />
      <Tab.Screen
        name="CustomerOrders"
        component={CustomerOrdersScreen}
        options={{
          unmountOnBlur: true,
          tabBarLabel: 'Orders',
          tabBarIcon: ({color, size}) => (
            <Image source={OrderIcn} style={{tintColor: color}} />
          ),
        }}
      />
      <Tab.Screen
        name="CustomerInvoice"
        component={CustomerInvoiceScreen}
        options={{
          unmountOnBlur: true,
          tabBarLabel: 'Invoice',
          tabBarIcon: ({color, size}) => (
            <Image source={InvoiceIcn} style={{tintColor: color}} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="none">
        <Stack.Screen name="SpalshScreen" component={SpalshScreen} />
        <Stack.Screen name="DomainSettings" component={DomainScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SalesHome" component={SalesHome} />
        <Stack.Screen name="Customers" component={CustomerScreen} />
        <Stack.Screen name="Orders" component={OpenOdersScreen} />
        <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
        <Stack.Screen name="OrderDetails" component={OrderDetails} />
        <Stack.Screen name="InvoiceDetails" component={InvoiceDetails} />
        <Stack.Screen name="CollectPayment" component={CollectPayment} />
        <Stack.Screen name="ItemDetails" component={ItemDetails} />
        <Stack.Screen name="Cart" component={Cart} />
        <Stack.Screen name="Checkout" component={Checkout} />
        <Stack.Screen name="OpenOrders" component={OpenOrders} />
        <Stack.Screen name="OpenOverdues" component={OpenOverdues} />
        <Stack.Screen name="CustomerListing" component={CustomerListingForSync} />
        <Stack.Screen name="SyncSelectionScreen" component={SyncSelectionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React from 'react';
import {View, Image, StyleSheet, Platform} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import logo from '../../assets/logo.png';
import {vh} from '../../utilities/Dimensions';
import ServiceCall from '../../services/EndPoints';
import Loader from '../../components/Loader';

const db = openDatabase({name: 'rpmData.db'});

const Spalsh = ({navigation}) => {
  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS app_data(id INTEGER PRIMARY KEY AUTOINCREMENT, company_id VARCHAR(20), username VARCHAR(20), data JSON)',
        [],
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY AUTOINCREMENT, meta_key VARCHAR(20), meta_value VARCHAR(20))',
        [],
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS customers(id INTEGER PRIMARY KEY AUTOINCREMENT, company_id VARCHAR(20), username VARCHAR(20), data JSON)',
        [],
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS customer_products(id INTEGER PRIMARY KEY AUTOINCREMENT, company_id VARCHAR(20), customer_number VARCHAR(20), username VARCHAR(20), data JSON)',
        [],
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS customer_products_by_categories(id INTEGER PRIMARY KEY AUTOINCREMENT, company_id VARCHAR(20), customer_number VARCHAR(20), category_id VARCHAR(20), username VARCHAR(20), data JSON)',
        [],
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS customer_products_categories(id INTEGER PRIMARY KEY AUTOINCREMENT, company_id VARCHAR(20), username VARCHAR(20), data JSON)',
        [],
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS customer_products_details(id INTEGER PRIMARY KEY AUTOINCREMENT, company_id VARCHAR(20), username VARCHAR(20), customer_number VARCHAR(20), item_number VARCHAR(20), data JSON)',
        [],
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS customer_cart(id INTEGER PRIMARY KEY AUTOINCREMENT, company_id VARCHAR(20), username VARCHAR(20), customer_number VARCHAR(20), item_number VARCHAR(20), unique_cart_id VARCHAR(20), data JSON)',
        [],
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY AUTOINCREMENT, company_id VARCHAR(20), order_date VARCHAR(20), username VARCHAR(20), customer_number VARCHAR(20), data JSON)',
        [],
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS dashboard_data(id INTEGER PRIMARY KEY AUTOINCREMENT, company_id VARCHAR(20), username VARCHAR(20), customer_number VARCHAR(20), data JSON)',
        [],
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS order_history(id INTEGER PRIMARY KEY AUTOINCREMENT, company_id VARCHAR(20), username VARCHAR(20), customer_number VARCHAR(20), data JSON)',
        [],
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS invoice_history(id INTEGER PRIMARY KEY AUTOINCREMENT, company_id VARCHAR(20), username VARCHAR(20), customer_number VARCHAR(20), data JSON)',
        [],
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS invoices(id INTEGER PRIMARY KEY AUTOINCREMENT, company_id VARCHAR(20), username VARCHAR(20), customer_number VARCHAR(20), data JSON)',
        [],
      );
      tx.executeSql(
        'SELECT * FROM settings',
        [],
        (tx, results) => {
          const len = results.rows.length;
          if (len > 0) {
            // eslint-disable-next-line no-unused-vars
            let host, port;
            const baseUrl = `${results.rows.item(0).meta_value}:${
              results.rows.item(1).meta_value
            }`;
            ServiceCall.BASE_URL = baseUrl;
            navigation.navigate('Login');
          } else {
            navigation.navigate('DomainSettings');
          }
        },
        () => {
          navigation.navigate('Login');
        },
      );
    });
  });
  if (Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        <Image source={logo} resizeMode="contain" style={styles.logo} />
      </View>
    );
  } else {
    return <Loader />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: vh(15),
    width: vh(15),
  },
});

export default Spalsh;

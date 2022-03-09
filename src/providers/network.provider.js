import React, {useState, createContext, useContext, useEffect, createRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {Text, View, StyleSheet} from 'react-native';
import Database from '../utilities/database/database';


import {
	generateValues,
	generateWholeInsertQuery,
	fetchSalesRepDataFromTable,
	fetchCompanyDataFromTable,
	generateWholeInsertQueryForCustomer,
	fetchProductsByCatFromTable,
	generateWholeInsertQueryForProductsByCat,
	generateWholeInsertQueryForProductsDetail,
	generateWholeInsertQueryForCart,
	fetchProductsDetail,
	fetchCartDetail,
	generateWholeInsertQueryForOrder,
	deleteCartFromTable,
	generateWholeInsertQueryForInvoice
} from '../utilities/database/database-queries';
import Tables from '../services/Tables';
export const navigationRef = createRef();

export const checkAndProcessWithNetworkConn = async (
	// navigation,
	success, 
	queryFor, 
	companyOrCustomer,
	customerNumber = '0',
 	category_id = '0',
	item_number = '0',
	unique_cart_id,
	cartData,
	action = '') => {
	return NetInfo.fetch().then(async (state) => {
		const loggedInUserData = await AsyncStorage.getItem('USER');
		const userData = JSON.parse(loggedInUserData);
		let customerData = [];
		// let productsData = [];
		let customerProductsData = [];
		// let productsDataLength = [];
		let orderData = [];
		let invoiceData = [];
		if(companyOrCustomer === 'company') {
			/****************fetch salesRepData *********************/
			// console.log("companyOrCustomer: ", fetchSalesRepDataFromTable(queryFor, userData.companyId, userData.userName))
			var results = await Database.executeQuery(fetchSalesRepDataFromTable(queryFor, userData.companyId, userData.userName));
			const rows = results.rows;
			var len = rows.length;
			/****************End fetch salesRepData *********************/
		} else if(companyOrCustomer === 'customer') {
			/****************fetch customers data *********************/
			var customersData = await Database.executeQuery(fetchCompanyDataFromTable(queryFor, userData.companyId, userData.userName, customerNumber));
			var customerDataLength = customersData.rows.length;
			/****************fetch customers data *********************/
		}
		else if(companyOrCustomer === 'products_by_cat') {
			
			/****************fetch products by cat *********************/
			var prductsByCatData = await Database.executeQuery(fetchProductsByCatFromTable(queryFor, userData.companyId, userData.userName, customerNumber, category_id));
			var prductsByCatDataLength = prductsByCatData.rows.length;
			/****************fetch products by cat *********************/
		}
		else if(companyOrCustomer === 'products_detail') {
			/****************fetch products by cat *********************/
			var prductsDetail = await Database.executeQuery(fetchProductsDetail(queryFor, userData.companyId, userData.userName, customerNumber, item_number));
			var prductsDetailLength = prductsDetail.rows.length;
			/****************fetch products by cat *********************/
		}
		else if(companyOrCustomer === 'add_to_cart') {
			/****************fetch products by cat *********************/
			var cartDetail = await Database.executeQuery(fetchCartDetail(queryFor, userData.companyId, userData.userName, customerNumber, unique_cart_id, item_number));
			var cartDetailLength = cartDetail.rows.length;
			/****************fetch products by cat *********************/
			// insert query to add data in cart
			Database.executeInsertQuery(await generateWholeInsertQueryForCart(queryFor, JSON.stringify(cartData), userData.companyId, userData.userName, cartDetailLength, customerNumber, unique_cart_id, item_number), cartData, queryFor);
			
		}
		
		else if(companyOrCustomer === 'orders') {
			orderData = category_id;
		}
		else if(companyOrCustomer === 'invoices') {
			invoiceData = category_id;
		}
		// if (state.isConnected) {
		if (false) {
			let response = await success();
			console.log('CustomerDetildskjk ', JSON.stringify(response));
			// const customers = response.data;
			const dataToStore = generateValues(response);
			// const dataToStore = response;
			if (companyOrCustomer === 'company') {
				await Database.executeInsertQuery(await generateWholeInsertQuery(queryFor, JSON.stringify(dataToStore), userData.companyId, userData.userName, len), dataToStore, queryFor);
			} 
			else if(companyOrCustomer === 'customer') {
				await Database.executeInsertQuery(await generateWholeInsertQueryForCustomer(queryFor, JSON.stringify(dataToStore), userData.companyId, userData.userName, customerDataLength, customerNumber), dataToStore, queryFor);
			}
			else if(companyOrCustomer === 'products_by_cat') {
				await Database.executeInsertQuery(await generateWholeInsertQueryForProductsByCat(queryFor, JSON.stringify(dataToStore), userData.companyId, userData.userName, prductsByCatDataLength, customerNumber, category_id), dataToStore, queryFor);
			}
			else if(companyOrCustomer === 'products_detail') {
				await Database.executeInsertQuery(await generateWholeInsertQueryForProductsDetail(queryFor, JSON.stringify(dataToStore), userData.companyId, userData.userName, prductsDetailLength, customerNumber, category_id), dataToStore, queryFor);
			}
			else if(companyOrCustomer === 'products_detail') {
				await Database.executeInsertQuery(await generateWholeInsertQueryForProductsDetail(queryFor, JSON.stringify(dataToStore), userData.companyId, userData.userName, prductsDetailLength, customerNumber, category_id), dataToStore, queryFor);
			}
			return response;
		} else {
			if (companyOrCustomer === 'company') {
				if (len > 0) {
					let res = results.rows.item(0);
					customerData =  JSON.parse(res.data);
					// console.log('cstomer1121 ',  JSON.parse(customerData))
					return JSON.parse(customerData);
				} 
			} else if(companyOrCustomer === 'customer') {
				let customerProductsData = [];
				if (customerDataLength > 0) {
					let res = customersData.rows.item(0);
					customerProductsData =  JSON.parse(res.data);
					if(queryFor === 'order_history') {
						let ordersList = await manageAndFetchOrderHistory(customerProductsData, userData, customerNumber);
						let response =  {
							orders_history : ordersList, 
							error_message: "",
							status_code: 200,
							token: "AOlcUcUbdynJDlcV"
						};
						return response;
					} else {
						
						return JSON.parse(customerProductsData);
					}
				} else {
					if(queryFor === 'order_history') {
						let ordersList = await manageAndFetchOrderHistory(customerProductsData, userData, customerNumber);
						let response =  {
							orders_history : ordersList, 
							error_message: "",
							status_code: 200,
							token: "AOlcUcUbdynJDlcV"
						};
						return response;
					} 
				}
			}
			else if(companyOrCustomer === 'products_by_cat') {
				if (prductsByCatDataLength > 0) {
					let res = prductsByCatData.rows.item(0);
					console.log('data121 ', res)
					customerProductsData =  JSON.parse(res.data);
					
					return JSON.parse(customerProductsData);
				}
			}
			else if(companyOrCustomer === 'products_detail') {
				if (prductsDetailLength > 0) {
					let res = prductsDetail.rows.item(0);
					customerProductsData =  JSON.parse(res.data);
					return JSON.parse(customerProductsData);
				}
				
			}
			else if(companyOrCustomer === 'add_to_cart' || companyOrCustomer === 'search_from_cart') {
				 return fetchCartDataFromLocal(queryFor, customerNumber, companyOrCustomer, category_id);
			}
			else if(companyOrCustomer === 'orders') {
				// insert query to add data in orders table
				let currentDate = new Date().toISOString().slice(0, 10);
				Database.executeInsertQuery(await generateWholeInsertQueryForOrder(queryFor, JSON.stringify(orderData), userData.companyId, userData.userName, customerNumber, currentDate), cartData, queryFor);
				let response =  {
					checkout_data : {
						order_date : currentDate,
						order_number : "",
					}, 
					error_message: "",
					status_code: 200,
					token: "AOlcUcUbdynJDlcV"
				};
				// empty cart after order placed
				await Database.executeQuery(deleteCartFromTable(Tables.CUSTOMER_CART, userData.companyId, userData.userName, customerNumber));
				return response;
			 }
			 else if(companyOrCustomer === 'invoices') {
				// insert query to add data in invoice table
				let currentDate = new Date().toISOString().slice(0, 10);
				await Database.executeInsertQuery(await generateWholeInsertQueryForInvoice(queryFor, JSON.stringify(invoiceData), userData.companyId, userData.userName, customerNumber, currentDate), cartData, queryFor);
				let response =  {
					error_message: "",
					status_code: 200,
					token: "AOlcUcUbdynJDlcV"
				};
				return response;
		 	}
		}
	});
};

export const manageAndFetchOrderHistory = async(order_history, userData, customerNumber) => {
	let currentDate = new Date().toISOString().slice(0, 10);
	let onlineOrderHistory = [];
	if(order_history.length > 0) {
		let order_history_parse = JSON.parse(order_history);
		onlineOrderHistory = order_history_parse.orders_history;
	}

	let offlineOrders = await Database.executeQuery(fetchCompanyDataFromTable(Tables.ORDERS, userData.companyId, userData.userName, customerNumber));
	offlineOrdersCount = offlineOrders.rows.length;
	var ordersArray = [];

	if (offlineOrdersCount > 0) { 
		for (let i = 0; i < offlineOrdersCount; i++) {
			let response =  { 
				order_summary : {
					order_total : JSON.parse(offlineOrders.rows.item(i).data).request.checkout_data.ttPayment[0].payment_amt
				}, 
				order_number: "",
				order_date: currentDate,
				order_status: "Offline"
			};
			onlineOrderHistory.push(response);
		}
	}
	let reult = [...ordersArray, ...onlineOrderHistory];
	return reult;
}

export const fetchCartDataFromLocal = async (queryFor, customerNumber, searchOrCart, searchItemNumber) => {
	
	const loggedInUserData = await AsyncStorage.getItem('USER');
	const userData = JSON.parse(loggedInUserData);
	/****************fetch customers data *********************/
	productsCartData = await Database.executeQuery(fetchCompanyDataFromTable(queryFor, userData.companyId, userData.userName, customerNumber));
	productsDataLength = productsCartData.rows.length;
	var productCartArray = [];
	
	if (productsDataLength > 0) {
		for (let i = 0; i < productsCartData.rows.length; i++) {
			productCartArray.push(JSON.parse(productsCartData.rows.item(i).data));
		}
	}
	/************************************************************************************* */
	// fecthing all products from customer_products table
	let productsList = await Database.executeQuery(fetchCompanyDataFromTable(Tables.CUSTOMER_PRODUCTS, userData.companyId, userData.userName, customerNumber));
	productsListLength = productsList.rows.length;
	var productListArray = [];
	if (productsListLength > 0) { 
		for (let i = 0; i < productsList.rows.length; i++) {
			// console.log(JSON.stringify(productsList.rows.item(i).data), ' prabh7881');
			productListArray.push(JSON.parse(productsList.rows.item(i).data));
		}
	}
	
	
	
	var filteredItemDetail = (lastArrayOfProductsItem, itemNumber) => {
		const item = lastArrayOfProductsItem.filter(i => i.item_number === itemNumber);
		if(searchOrCart === 'search_from_cart') {
			return item;
		} else {
			return item[0];
		}
	}
	
	// fecthing all products from customer_products table
	var lastArrayOfProductsItem = [];
	if(productCartArray.length > 0) {
		for (let j = 0; j < productCartArray.length; j++) {
			let productsListFromCat = await Database.executeQuery(fetchCompanyDataFromTable(Tables.CUSTOMER_PRODUCTS_BY_CATEGORIES, userData.companyId, userData.userName, customerNumber));
			productsListCatLength = productsListFromCat.rows.length;
			var productCatListArray = [];
			if (productsListCatLength > 0) { 
				for (let i = 0; i < productsListFromCat.rows.length; i++) {
					var itemsData = JSON.parse(JSON.parse(productsListFromCat.rows.item(i).data)).items;
					// var flatten = [].concat(...itemsData);
					productCatListArray.push(itemsData);
					
				}
			}
		}
		var itemsArray = [].concat.apply([], productCatListArray);
		let productCatListArrayItem = itemsArray;
		let productListArrayList = JSON.parse(productListArray).inspiredby_purchasing_history;
		lastArrayOfProductsItem = [...productCatListArrayItem, ...productListArrayList];
		
	}

	if(searchOrCart === 'search_from_cart') {	
		let searched_products = {error_message: "", status_code: 200, token: "AOlcUcUbdynJDlcV", 'search_result': [], total_results_found: 1};
		let filteredItem = filteredItemDetail(lastArrayOfProductsItem, searchItemNumber);
		searched_products['search_result'] = filteredItem;
		return searched_products;
	} else {
		let in_cart_products = {error_message: "", status_code: 200, token: "AOlcUcUbdynJDlcV", 'in_cart_products': []};
		if(productCartArray.length > 0) {
			for (let i = 0; i < productCartArray.length; i++) {
				productCartArray[i].ttCartProducts[0].discounted_meta_key = '';
				productCartArray[i].ttCartProducts[0].show_button = 'YES';
				productCartArray[i].ttCartProducts[0].discounted_meta_value = '';
				/**************** */
				let itemNumber = productCartArray[i].ttCartProducts[0].item_number;
				let filteredItem = filteredItemDetail(lastArrayOfProductsItem, itemNumber);
				productCartArray[i].ttCartProducts[0].product_info = filteredItem;

				in_cart_products['in_cart_products'].push(productCartArray[i].ttCartProducts[0]);
			}
		}	
		console.log('in_cart_products4 ', JSON.stringify(in_cart_products));
		return in_cart_products;
	}
	/************************************************************************************* */
}

export const NetworkProvider = ({children}) => {
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
	}, []);

	const userContext = {
		isConnected,
	};

	return (
		<NetworkContext.Provider value={{...userContext}}>
			{!isConnected && (
				<View style={styles.noInternetConnectionView}>
					<Text style={styles.noInternetConnectionText}>Internet Disconnected</Text>
				</View>
			)}
			{children}
		</NetworkContext.Provider>
	);
};

export const NetworkContext = createContext({});

export const useNetworkStatus = () => useContext(NetworkContext);

const styles = StyleSheet.create({
	noInternetConnectionView: {
		paddingVertical: 5,
		backgroundColor: '#cc0000',
		justifyContent: 'center',
		alignItems: 'center',
		display: 'flex',
		position: 'relative',
	},
	noInternetConnectionText: {
		color: 'white',
	},
});

import ServiceCall from '../EndPoints';
import Tables from '../Tables';
import {Alert} from 'react-native';
import {getBasicHeader, getToken, getUserData} from '../common/common';
import {DeviceEventEmitter} from 'react-native';
import {getCurrentDateInString} from '../../utilities/utils';
import NetInfo from '@react-native-community/netinfo';
import {checkAndProcessWithNetworkConn, fetchCartDataFromLocal} from '../../providers/network.provider';
import {
	deleteCartFromTable
	
} from '../../utilities/database/database-queries';
import Database from '../../utilities/database/database';
// import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// export const getItemDetail = async (sortBy) => {
// 	const getItemDetailFromStorage = async () => {
// 		return await AsyncStorage.getItem('CURRENT_ITEM_DETAILS');
// 	};
// 	return checkAndProcessWithNetworkConn(getItemDetailFromStorage, Tables.CUSTOMER_PRODUCT_DETAIL, 'company');
// };
// const route = useRoute();
export const getAllCustomers = async (sortBy) => {
	const getAllCustomersSuccess = async () => {
		const basicHeaders = await getBasicHeader();
		const token = await getToken();
		const request = {
			request: {
				username: basicHeaders.userName,
				sort_by: sortBy,
			},
		};
		return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.CUSTOMERS}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: basicHeaders.encodedString,
				token: token,
				lang_id: basicHeaders.langId,
			},
			body: JSON.stringify(request),
		})
			.then((response) => response.json())
			.then((json) => {
				console.log('customer json: ', json);
				const {response} = json;
				if (response.status_code === 200 && json.response.error_message === '') {
					console.log(response.data, 'RESP');
					return response;
				} else if (json.response.error_message !== '') {
					Alert.alert(json.response.error_message);
					if (response.status_code === 403) {
						//onLogOut();
						DeviceEventEmitter.emit('RedirectToLogin', {});
					}
				} else {
					Alert.alert('Something went wrong!');
					console.log(json);
				}
			})
			.catch((error) => {
				console.log('error: ', error);
			});
	};
	return checkAndProcessWithNetworkConn(getAllCustomersSuccess, Tables.CUSTOMERS, 'company');
};

export const getCategoriesAndFilters = async () => {
	const getCategoriesAndFiltersOfCustomer = async () => { 
	const basicHeaders = await getBasicHeader();
	const token = await getToken();
	const request = {
		request: {
			username: basicHeaders.userName,
			category_id: '*',
		},
	};
	return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.CATEGORIES_AND_FILTERS}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			token: token,
			lang_id: basicHeaders.langId,
		},
		body: JSON.stringify(request),
	})
		.then((response) => response.json())
		.then((json) => {
			console.log('categories and filters json: ', json);
			const {response} = json;
			if (response.status_code === 200 && json.response.error_message === '') {
				return response;
			} else if (json.response.error_message !== '') {
				Alert.alert(json.response.error_message);
				if (response.status_code === 403) {
					//onLogOut();
					DeviceEventEmitter.emit('RedirectToLogin', {});
				}
				return null;
			} else {
				Alert.alert('Something went wrong!');
				console.log(json);
				return null;
			}
		})
		.catch((error) => {
			console.log('error: ', error);
			return null;
		});
	};
	return checkAndProcessWithNetworkConn(getCategoriesAndFiltersOfCustomer, Tables.CUSTOMER_PRODUCTS_CATEGORIES, 'company');
};

export const getRecommendedProducts = async (customerNumber) => {
	const getProducts = async () => { 
		const basicHeaders = await getBasicHeader();
		const token = await getToken();
		const request = {
			request: {
				username: basicHeaders.userName,
				cust_number: customerNumber,
			},
		};
		return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.RECOMMENDED_PRODUCTS}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				token: token,
				lang_id: basicHeaders.langId,
			},
			body: JSON.stringify(request),
		})
			.then((response) => response.json())
			.then((json) => {
				// console.log('recommended products json: ', json);
				const {response} = json;
				if (response.status_code === 200 && json.response.error_message === '') {
					return response;
				} else if (json.response.error_message !== '') {
					Alert.alert(json.response.error_message);
					if (response.status_code === 403) {
						//onLogOut();
						DeviceEventEmitter.emit('RedirectToLogin', {});
					}
					return null;
				} else {
					Alert.alert('Something went wrong!');
					console.log(json);
					return null;
				}
			})
			.catch((error) => {
				console.log('error: ', error);
				return null;
			});
	};
	return checkAndProcessWithNetworkConn(getProducts, Tables.CUSTOMER_PRODUCTS, 'customer', customerNumber);
};

export const getItems = async (customerNumber, categoryId = '18') => {
	const getSearchProducts = async () => { 
		console.log('Started', new Date());
		const basicHeaders = await getBasicHeader();
		const token = await getToken();
		const request = {
			request: {
				username: basicHeaders.userName,
				last_sync_timestamp: '',
				customer_number: customerNumber,
				category_id: categoryId,
				unique_id: '0x0000000000bdf70e',
			},
		};
		return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.ITEMS}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				token: token,
				lang_id: basicHeaders.langId,
			},
			body: JSON.stringify(request),
		})
			.then((response) => response.json())
			.then((json) => {
				console.log('items json: ', json);
				const {response} = json;
				if (response.status_code === 200 && json.response.error_message === '') {
					return response;
				} else if (json.response.error_message !== '') {
					Alert.alert(json.response.error_message);
					if (response.status_code === 403) {
						//onLogOut();
						DeviceEventEmitter.emit('RedirectToLogin', {});
					}
					return null;
				} else {
					Alert.alert('Something went wrong!');
					console.log(json);
					return null;
				}
			})
			.catch((error) => {
				console.log('error: ', error);
				return null;
			});
		};	
		return checkAndProcessWithNetworkConn(getSearchProducts, Tables.CUSTOMER_PRODUCTS_BY_CATEGORIES, 'products_by_cat', customerNumber, categoryId);
};

export const productSearch = async (customerNumber, searchKeyword) => {
	const getFindProducts = async () => { 
	const basicHeaders = await getBasicHeader();
	const token = await getToken();
	const request = {
		request: {
			username: basicHeaders.userName,
			cust_number: customerNumber,
			search_keyword: searchKeyword,
		},
	};
	return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.PRODUCT_SEARCH}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			token: token,
			lang_id: basicHeaders.langId,
		},
		body: JSON.stringify(request),
	})
		.then((response) => response.json())
		.then((json) => {
			console.log('product search json: ', JSON.stringify(json));
			const {response} = json;
			if (response.status_code === 200 && json.response.error_message === '') {
				return response;
			} else if (json.response.error_message !== '') {
				Alert.alert(json.response.error_message);
				if (response.status_code === 403) {
					//onLogOut();
					DeviceEventEmitter.emit('RedirectToLogin', {});
				}
				return null;
			} else {
				Alert.alert('Something went wrong!');
				console.log(json);
				return null;
			}
		})
		.catch((error) => {
			console.log('error: ', error);
			return null;
		});
	}
	return checkAndProcessWithNetworkConn(getFindProducts, Tables.CUSTOMER_PRODUCTS_BY_CATEGORIES, 'search_from_cart', customerNumber, searchKeyword);
};

const getRequestData = (deleteType, unique_id, quantity) => {
	let productJSONArray;
	if (deleteType === 'r') {
		let uniqueData = {
			unique_id,
		};
		productJSONArray = {
			ttCartProducts: uniqueData,
		};
	} else if (deleteType === 'm') {
		let uniqueData = {
			unique_id,
			quantity,
		};
		productJSONArray = {
			ttCartProducts: uniqueData,
		};
	} else {
		productJSONArray = {
			ttCartProducts: [],
		};
	}
	return productJSONArray;
};

export const performCartActions = async (customerNumber, action, cartData = {}, unique_cart_id, item_number) => {
	const addItemToCart = async () => {
		const basicHeaders = await getBasicHeader();
		const token = await getToken();
		const request = {
			request: {
				username: basicHeaders.userName,
				cust_number: customerNumber,
				cart_data:
					action === 'a' ? cartData : getRequestData(action, cartData.uniqueId, cartData.quantity),
				action,
			},
		};
		console.log(JSON.stringify(request), '=====>');
		return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.CART}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				token: token,
				lang_id: basicHeaders.langId,
			},
			body: JSON.stringify(request),
		})
			.then((response) => response.json())
			.then((json) => {
				console.log('perform cart operations json: ', json);
				const {response} = json;
				if (response.status_code === 200 && json.response.error_message === '') {
					return response;
				} else if (json.response.error_message !== '') {
					Alert.alert(json.response.error_message);
					if (response.status_code === 403) {
						//onLogOut();
						DeviceEventEmitter.emit('RedirectToLogin', {});
					}
					return null;
				} else {
					Alert.alert('Something went wrong!');
					console.log(json);
					return null;
				}
			})
			.catch((error) => {
				console.log('error: ', error);
				return null;
			});
		};
		if(action === 'e') {
			return NetInfo.fetch().then(async (state) => {
				// if (state.isConnected) { 
				if (false) { 
					return addItemToCart();
				} else {
					let userData = await getUserData();
					var deleteCart = await Database.executeQuery(deleteCartFromTable(Tables.CUSTOMER_CART, userData.companyId, userData.userName, customerNumber));
					return true;
				}
			});
		} 
		else  if (action === 'a' || action === 'm') {
			return checkAndProcessWithNetworkConn(addItemToCart, Tables.CUSTOMER_CART, 'add_to_cart', customerNumber,'', item_number, unique_cart_id, cartData, action);
		}
		
};

// export const performCartActions = async (
//   customerNumber,
//   action,
//   cartData = {},
// ) => {
//   const basicHeaders = await getBasicHeader();
//   const token = await getToken();
//   const request = {
//     request: {
//       username: basicHeaders.userName,
//       cust_number: customerNumber,
//       cart_data:
//         action === 'a'
//           ? cartData
//           : getRequestData(action, cartData.uniqueId, cartData.quantity),
//       action,
//     },
//   };
//   console.log(JSON.stringify(request), '=====>');
//   return fetch(
//     `${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.CART}`,
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         token: token,
//         lang_id: basicHeaders.langId,
//       },
//       body: JSON.stringify(request),
//     },
//   )
//     .then((response) => response.json())
//     .then((json) => {
//       console.log('perform cart operations json: ', json);
//       const {response} = json;
//       if (response.status_code === 200 && json.response.error_message === '') {
//         return response;
//       } else if (json.response.error_message !== '') {
//         Alert.alert(json.response.error_message);
//         if (response.status_code === 403) {
//           //onLogOut();
//           DeviceEventEmitter.emit('RedirectToLogin', {});
//         }
//         return null;
//       } else {
//         Alert.alert('Something went wrong!');
//         console.log(json);
//         return null;
//       }
//     })
//     .catch((error) => {
//       console.log('error: ', error);
//       return null;
//     });
// };

export const getInCartProducts = async (customerNumber, showAlert = true) => {
	return NetInfo.fetch().then(async (state) => {
		if (false) { 
		// if (state.isConnected) { 
			const basicHeaders = await getBasicHeader();
			const token = await getToken();
			const request = {
				request: {
					username: basicHeaders.userName,
					cust_number: customerNumber,
					last_sync_timestamp: 0,
				},
			};
			return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.IN_CART_PRODUCTS}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					token: token,
					lang_id: basicHeaders.langId,
				},
				body: JSON.stringify(request),
			})
				.then((response) => response.json())
				.then((json) => {
					// console.log('in cart json: ', json);
					const {response} = json;
					if (response.status_code === 200 && json.response.error_message === '') {
						return response;
					} else if (json.response.error_message !== '' && showAlert) {
						Alert.alert('Cart is empty');
						if (response.status_code === 403) {
							//onLogOut();
							DeviceEventEmitter.emit('RedirectToLogin', {});
						}
						return null;
					} else if (showAlert) {
						Alert.alert('Something went wrong!');
						console.log(json);
						return null;
					}
				})
				.catch((error) => {
					console.log('error: ', error);
					return null;
				});
		} else {
			resp = await fetchCartDataFromLocal(Tables.CUSTOMER_CART, customerNumber);
      return resp;
		}
	});
};

export const paymentAPI = async (requestBody) => {
	const basicHeaders = await getBasicHeader();
	const token = await getToken();
	return fetch('https://apitest.authorize.net/xml/v1/request.api', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			token: token,
			lang_id: basicHeaders.langId,
		},
		body: JSON.stringify(requestBody),
	})
		.then((response) => response.json())
		.then((json) => {
			console.log('payment API operations json: ', json);
			console.log(json, '=====>');
			if (
				json.transactionResponse &&
				json.transactionResponse.errors &&
				json.transactionResponse.errors.length > 0
			) {
				let errorMessage = json.transactionResponse.errors[0].errorText;
				Alert.alert(errorMessage);
				return null;
			} else {
				return json;
			}
		})
		.catch((error) => {
			console.log('error: ', error);
			return null;
		});
};

export const performCheckout = async (checkoutData, cartData) => {
	const basicHeaders = await getBasicHeader();
	const token = await getToken();
	const request = {
		request: {
			username: basicHeaders.userName,
			checkout_data: checkoutData,
			digital_sign: cartData.digital_sign,
			name: cartData.name,
			date_time: getCurrentDateInString(),
			latitude: cartData.lat || 51.50998,
			longitude: cartData.long || -0.1337,
			available_credit: cartData.availCredit,
			net_payment_amount: cartData.subTotal,
		},
	};
	const processOrder = async () => {
		
		return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.CHECKOUT}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				token: token,
				lang_id: basicHeaders.langId,
			},
			body: JSON.stringify(request),
		})
			.then((response) => response.json())
			.then((json) => {
				console.log('perform cart operations json: ', json);
				const {response} = json;
				if (response.status_code === 200 && json.response.error_message === '') {
					return response;
				} else if (json.response.error_message !== '') {
					Alert.alert(json.response.error_message);
					if (response.status_code === 403) {
						//onLogOut();
						DeviceEventEmitter.emit('RedirectToLogin', {});
					}
					return null;
				} else {
					Alert.alert('Something went wrong!');
					console.log(json);
					return null;
				}
			})
			.catch((error) => {
				console.log('error: ', error);
				return null;
			});
	}	
	let customerNumber = checkoutData.ttCheckoutCustomer[0].cust_number;
	return checkAndProcessWithNetworkConn(processOrder, Tables.ORDERS, 'orders', customerNumber, request);
};

export const performOfflineOrdersToServer = async (request) => {
	const basicHeaders = await getBasicHeader();
	const token = await getToken();
	return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.CHECKOUT}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			token: token,
			lang_id: basicHeaders.langId,
		},
		body: request,
	})
	.then((response) => response.json())
	.then((json) => {
		console.log('perform cart operations json: ', json);
		const {response} = json;
		if (response.status_code === 200 && json.response.error_message === '') {
			return response;
		} else if (json.response.error_message !== '') {
			Alert.alert(json.response.error_message);
			if (response.status_code === 403) {
				//onLogOut();
				DeviceEventEmitter.emit('RedirectToLogin', {});
			}
			return null;
		} else {
			Alert.alert('Something went wrong!');
			console.log(json);
			return null;
		}
	})
	.catch((error) => {
		console.log('error: ', error);
		return null;
	});
}

export const getOrderHistory = async (customerNumber, numberOfMonths = 6) => {
	const orderHistory = async () => {
		const basicHeaders = await getBasicHeader();
		const token = await getToken();
		const request = {
			request: {
				token,
				lang_id: basicHeaders.langId,
				username: basicHeaders.userName,
				cust_number: customerNumber,
				no_of_months: numberOfMonths,
				last_sync_timestamp: 0,
			},
		};
		return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.ORDER_HISTORY}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: basicHeaders.encodedString,
				token: token,
				lang_id: basicHeaders.langId,
			},
			body: JSON.stringify(request),
		})
			.then((response) => response.json())
			.then((json) => {
				console.log('order history json: ', JSON.stringify(json));
				const {response} = json;
				if (response.status_code === 200 && json.response.error_message === '') {
					return response;
				} else if (json.response.error_message !== '') {
					Alert.alert(json.response.error_message);
					if (response.status_code === 403) {
						//onLogOut();
						DeviceEventEmitter.emit('RedirectToLogin', {});
					}
					return null;
				} else {
					Alert.alert('Something went wrong!');
					console.log(json);
					return null;
				}
			})
			.catch((error) => {
				console.log('error: ', error);
				return null;
			});
		};
		return checkAndProcessWithNetworkConn(orderHistory, Tables.ORDER_HISTORY, 'customer', customerNumber);
};

export const getOrderDetails = async (customerNumber, orderNumber) => {
	const basicHeaders = await getBasicHeader();
	const token = await getToken();
	const request = {
		request: {
			token,
			lang_id: basicHeaders.langId,
			username: basicHeaders.userName,
			cust_number: customerNumber,
			order_number: orderNumber,
		},
	};
	return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.ORDER_DETAILS}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: basicHeaders.encodedString,
			token: token,
			lang_id: basicHeaders.langId,
		},
		body: JSON.stringify(request),
	})
		.then((response) => response.json())
		.then((json) => {
			console.log('order details json: ', json);
			const {response} = json;
			if (response.status_code === 200 && json.response.error_message === '') {
				return response;
			} else if (json.response.error_message !== '') {
				Alert.alert(json.response.error_message);
				if (response.status_code === 403) {
					//onLogOut();
					DeviceEventEmitter.emit('RedirectToLogin', {});
				}
				return null;
			} else {
				Alert.alert('Something went wrong!');
				console.log(json);
				return null;
			}
		})
		.catch((error) => {
			console.log('error: ', error);
			return null;
		});
};

export const getInvoiceHistory = async (customerNumber, orderNumber) => {
	const invoiceHistory = async () => {
		const basicHeaders = await getBasicHeader();
		const token = await getToken();
		const request = {
			request: {
				token,
				lang_id: basicHeaders.langId,
				username: basicHeaders.userName,
				cust_number: customerNumber,
				order_number: orderNumber,
				last_sync_timestamp: 0,
			},
		};
		return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.INVOICE_HISTORY}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: basicHeaders.encodedString,
				token: token,
				lang_id: basicHeaders.langId,
			},
			body: JSON.stringify(request),
		})
		.then((response) => response.json())
		.then((json) => {
			console.log('invoice history json: ', JSON.stringify(json));
			const {response} = json;
			if (response.status_code === 200 && json.response.error_message === '') {
				return response;
			} else if (json.response.error_message !== '') {
				Alert.alert(json.response.error_message);
				if (response.status_code === 403) {
					//onLogOut();
					DeviceEventEmitter.emit('RedirectToLogin', {});
				}
				return null;
			} else {
				Alert.alert('Something went wrong!');
				console.log(json);
				return null;
			}
		})
		.catch((error) => {
			console.log('error: ', error);
			return null;
		});
	}	
	return checkAndProcessWithNetworkConn(invoiceHistory, Tables.INVOICE_HISTORY, 'customer', customerNumber);
};

export const collectPayment = async (customerNumber, paymentData) => {
	const basicHeaders = await getBasicHeader();
	const token = await getToken();
	const request = {
		request: {
			token,
			lang_id: basicHeaders.langId,
			username: basicHeaders.userName,
			cust_number: customerNumber,
			payment_data: paymentData,
		},
	};
	const proccessInvoices = async () => {
		return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.COLLECT_PAYMENT}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: basicHeaders.encodedString,
				token: token,
				lang_id: basicHeaders.langId,
			},
			body: JSON.stringify(request),
		})
		.then((response) => response.json())
		.then((json) => {
			console.log('collect payment json: ', json);
			const {response} = json;
			if (response.status_code === 200 && json.response.error_message === '') {
				return response;
			} else if (json.response.error_message !== '') {
				Alert.alert(json.response.error_message);
				if (response.status_code === 403) {
					//onLogOut();
					DeviceEventEmitter.emit('RedirectToLogin', {});
				}
				return null;
			} else {
				Alert.alert('Something went wrong!');
				console.log(json);
				return null;
			}
		})
		.catch((error) => {
			console.log('error: ', error);
			return null;
		});
	}
	return checkAndProcessWithNetworkConn(proccessInvoices, Tables.INVOICES, 'invoices', customerNumber, request);	
};

export const offlineInvoicesToServer = async (request) => {
	const basicHeaders = await getBasicHeader();
	const token = await getToken();
	return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.COLLECT_PAYMENT}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: basicHeaders.encodedString,
			token: token,
			lang_id: basicHeaders.langId,
		},
		body: request,
	})
	.then((response) => response.json())
	.then((json) => {
		console.log('collect payment json: ', json);
		const {response} = json;
		if (response.status_code === 200 && json.response.error_message === '') {
			return response;
		} else if (json.response.error_message !== '') {
			Alert.alert(json.response.error_message);
			if (response.status_code === 403) {
				//onLogOut();
				DeviceEventEmitter.emit('RedirectToLogin', {});
			}
			return null;
		} else {
			Alert.alert('Something went wrong!');
			console.log(json);
			return null;
		}
	})
	.catch((error) => {
		console.log('error: ', error);
		return null;
	});
};

export const getPaymentApiData = async (customerNumber) => {
	const basicHeaders = await getBasicHeader();
	const token = await getToken();

	const request = {
		request: {
			custnumber: customerNumber,
		},
	};
	return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.GETPAYMENTAPI_DATA}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: basicHeaders.encodedString,
			token: token,
			lang_id: basicHeaders.langId,
		},
		body: JSON.stringify(request),
	})
		.then((response) => response.json())
		.then((json) => {
			const {response} = json;
			if (response.status_code === 200 && json.response.error_id === '') {
				return response;
			} else if (json.response.error_message !== '') {
				// Alert.alert(json.response.error_message);
				if (response.status_code === 403) {
				}
				return null;
			} else {
				// Alert.alert('Something went wrong!');
				console.log(json);
				return null;
			}
		})
		.catch((error) => {
			console.log('error: ', error);
			return null;
		});
};

export const sort = (index, list) => {
	switch (index) {
		case 0:
			list.sort(function (x, y) {
				if (x.customerName < y.customerName) {
					return -1;
				}
				if (x.customerName > y.customerName) {
					return 1;
				}
				return 0;
			});
			break;
		case 1:
			list.sort(function (x, y) {
				if (x.distance < y.distance) {
					return -1;
				}
				if (x.distance > y.distance) {
					return 1;
				}
				return 0;
			});
			break;
		// case 2:
		//   list.sort(function (x, y) {
		//     if (x.number_of_days < y.number_of_days) {
		//       return -1;
		//     }
		//     if (x.number_of_days > y.number_of_days) {
		//       return 1;
		//     }
		//     return 0;
		//   });
		//   break;
	}
};

export const getFormattedAddress = (obj, forBilling = true) => {
	return forBilling
		? `${obj.billingAdd1}${obj.billingAdd2 !== '' ? `, ${obj.billingAdd2}` : ''}${
				obj.billingAdd3 !== '' ? `, ${obj.billingAdd3}` : ''
		  }${obj.billingCity !== '' ? `, ${obj.billingCity}` : ''}${
				obj.billingState !== '' ? `, ${obj.billingState}` : ''
		  }${obj.billingZip !== '' ? `, ${obj.billingZip}` : ''}`
		: `${obj.addressL1}${obj.addressL2 !== '' ? `, ${obj.addressL2}` : ''}${
				obj.addressL3 !== '' ? `, ${obj.addressL3}` : ''
		  }`;
};

export const checkInCustomer = async (checkInCustomerData) => {
	const basicHeaders = await getBasicHeader();
	const token = await getToken();

	const request = {
		request: checkInCustomerData,
	};
	console.log('requestdata1', request);
	return fetch(`${ServiceCall.BASE_URL}${ServiceCall.PATH}${ServiceCall.CHECKIN}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: basicHeaders.encodedString,
			token: token,
			lang_id: basicHeaders.langId,
		},
		body: JSON.stringify(request),
	})
		.then((response) => response.json())
		.then((json) => {
			const {response} = json;
			if (response.status_code === 200 && json.response.error_id === '') {
				return response;
			} else if (json.response.error_message !== '') {
				// Alert.alert(json.response.error_message);
				if (response.status_code === 403) {
				}
				return null;
			} else {
				// Alert.alert('Something went wrong!');
				console.log(json);
				return null;
			}
		})
		.catch((error) => {
			console.log('error: ', error);
			return null;
		});
};

export const getTermsAndConditionsPDF = 'http://samples.leanpub.com/thereactnativebook-sample.pdf';

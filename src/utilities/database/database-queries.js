import Tables from '../../services/Tables';
import Database from './database';
// all the companies
const fetchSalesRepDataFromTable = (tableName, companyId, userName) => `SELECT * FROM ${tableName} WHERE company_id = '${companyId}' AND username = '${userName}'`;
// fetch data on company level like products, orders_history, invoices, offline orders and all....
const fetchCompanyDataFromTable = (tableName, companyId, userName, customerNumber) => `SELECT * FROM ${tableName} WHERE company_id = '${companyId}' AND username = '${userName}' AND customer_number = '${customerNumber}'`;
const fetchProductsByCatFromTable = (tableName, companyId, userName, customerNumber, category_id) => `SELECT * FROM ${tableName} WHERE company_id = '${companyId}' AND username = '${userName}' AND customer_number = '${customerNumber}' AND category_id = '${category_id}'`;
const fetchProductsDetail = (tableName, companyId, userName, customerNumber, item_number) => `SELECT * FROM ${tableName} WHERE company_id = '${companyId}' AND username = '${userName}' AND customer_number = '${customerNumber}' AND item_number = '${item_number}'`;
const fetchCartDetail = (tableName, companyId, userName, customerNumber, unique_cart_id, item_number) => `SELECT * FROM ${tableName} WHERE company_id = '${companyId}' AND username = '${userName}' AND customer_number = '${customerNumber}' AND item_number = '${item_number}' `;
const fetchAppDataFromTable = (tableName, companyId, userName) => `SELECT * FROM ${tableName} WHERE company_id = '${companyId}' AND username = '${userName}'`;
const deleteCartFromTable = (tableName, companyId, userName, customerNumber) => `DELETE FROM ${tableName} WHERE company_id = '${companyId}' AND username = '${userName}' AND customer_number = '${customerNumber}'`;


const DEFAULT_SELECT_QUERIES = {

};

/**
 * This function is used to generate the field values of the insert query.
 */
const generateInsertQuery = (values) => {
	let newValues = {};
	if (values) {
		if (Array.isArray(values) && typeof values === 'object') {
			newValues = values[0];
		} else {
			newValues = values;
		}
	}
	return `${Object.keys(newValues).join(', ')}, timestamp`;
};

/**
 * This function is used to generate the question values in the proper format after the table structure is provided in the argument.
 */
// const generateQuestionValues = (values) => {
// 	let resultantString = '';
// 	let resultantArray = [];
// 	let newValues = [];
// 	if (!Array.isArray(values) && typeof values === 'object') {
// 		newValues.push(values);
// 	} else {
// 		newValues = values;
// 	}
// 	if (newValues && newValues.length && Array.isArray(newValues)) {
// 		resultantArray = newValues.map((value) => {
// 			const str = `?, ?, ${Array(Object.keys(value).length).join('?, ').trim()}`;
// 			return `(${str.toString().substring(0, str.length - 1)})`;
// 		});
// 		resultantString = resultantArray.join(' ');
// 		return resultantString;
// 	}
// 	return '(?)';
// };

/**
 * This function is used to generate the values in the proper format after the table structure is provided in the argument.
 */
// const generateValues = (values) => {
// 	let resultantArray = [];
// 	let newValues = [];
// 	if (!Array.isArray(values) && typeof values === 'object') {
// 		newValues.push(values);
// 	} else {
// 		newValues = values;
// 	}
// 	if (newValues && newValues.length) {
// 		newValues.forEach((value) => {
// 			Object.values(value).forEach((val, index) => {
// 				typeof val === 'object'
// 					? resultantArray.push(JSON.stringify(val))
// 					: resultantArray.push(val.toString());
// 				if (index === Object.values(value).length - 1) {
// 					resultantArray.push(Math.floor(Date.now() / 1000));
// 				}
// 			});
// 		});
// 		return resultantArray;
// 	}
// 	return resultantArray;
// };

const generateValues = (values) => {
	if (typeof values === 'object') {
		return JSON.stringify(values);
	}
	return values.toString();
};


const generateWholeInsertQuery = async (tableName, values, companyId, userName, recordCount) => {
	if (recordCount > 0) {
		return `UPDATE ${tableName} SET data='${values}' WHERE company_id = '${companyId}' AND username = '${userName}'`;
	}
	return `INSERT INTO ${tableName} (company_id, username, data) VALUES ('${companyId}', '${userName}' ,'${values}')`;
};

// insert query on custumer level - products, orders_histiry, etc.....
const generateWholeInsertQueryForCustomer = async (tableName, values, companyId, userName, recordCount, customerNumber) => {
	if (recordCount > 0) {
		return `UPDATE ${tableName} SET data='${values}' WHERE company_id = '${companyId}' AND username = '${userName}' AND customer_number = '${customerNumber}'`;
	}
	return `INSERT INTO ${tableName} (company_id, username, customer_number, data) VALUES ('${companyId}', '${userName}', '${customerNumber}' ,'${values}')`;
};

// insert/update products when click on category
const generateWholeInsertQueryForProductsByCat = async (tableName, values, companyId, userName, recordCount, customerNumber, category_id) => {
	if (recordCount > 0) {
		return `UPDATE ${tableName} SET data='${values}' WHERE company_id = '${companyId}' AND username = '${userName}' AND customer_number = '${customerNumber}' AND category_id = '${category_id}'`;
	}
	return `INSERT INTO ${tableName} (company_id, username, customer_number, category_id, data) VALUES ('${companyId}', '${userName}', '${customerNumber}', '${category_id}' ,'${values}')`;
};

const generateWholeInsertQueryForProductsDetail = async (tableName, values, companyId, userName, recordCount, customerNumber, category_id) => {
	if (recordCount > 0) {
		return `UPDATE ${tableName} SET data='${values}' WHERE company_id = '${companyId}' AND username = '${userName}' AND customer_number = '${customerNumber}' AND category_id = '${category_id}'`;
	}
	return `INSERT INTO ${tableName} (company_id, username, customer_number, category_id, data) VALUES ('${companyId}', '${userName}', '${customerNumber}', '${category_id}' ,'${values}')`;
};

// insert query for cart
const generateWholeInsertQueryForCart = async (tableName, values, companyId, userName, recordCount, customerNumber, unique_cart_id, item_number) => {
	if (recordCount > 0) {
		return `UPDATE ${tableName} SET data='${values}' WHERE company_id = '${companyId}' AND username = '${userName}' AND customer_number = '${customerNumber}' AND unique_cart_id = '${unique_cart_id}' AND item_number = '${item_number}'`;
	}
	return `INSERT INTO ${tableName} (company_id, username, customer_number, unique_cart_id, item_number, data) VALUES ('${companyId}', '${userName}', '${customerNumber}', '${unique_cart_id}' ,'${item_number}' ,'${values}')`;
};

// insert query for order
const generateWholeInsertQueryForOrder = async (tableName, values, companyId, userName, customerNumber, date) => {
	return `INSERT INTO ${tableName} (company_id, username, customer_number, order_date, data) VALUES ('${companyId}', '${userName}', '${customerNumber}', '${date}', '${values}')`;
};

// insert query for order
const generateWholeInsertQueryForInvoice = async (tableName, values, companyId, userName, customerNumber, date) => {
	return `INSERT INTO ${tableName} (company_id, username, customer_number, data) VALUES ('${companyId}', '${userName}', '${customerNumber}', '${values}')`;
};


// insert/update app/dasboard data after login
const generateWholeInsertQueryForDashboardData = async (tableName, values, companyId, userName, recordCount) => {
	if (recordCount > 0) {
		return `UPDATE ${tableName} SET data='${values}' WHERE company_id = '${companyId}' AND username = '${userName}'`;
	}
	return `INSERT INTO ${tableName} (company_id, username, data) VALUES ('${companyId}', '${userName}', '${values}')`;
};

/**
 * This function is used to generate the whole SQL query based on the tableName and the values that has to be inserted.
 */
// const generateWholeInsertQuery = (tableName, values, companyId, userName) => `INSERT INTO ${tableName} (company_id, username, data) VALUES ('${companyId}', '${userName}' ,'${values}')`;

// const generateWholeInsertQuery = (tableName) => `INSERT INTO customers (data) VALUES ('prabhopp')`;


const DEFAULT_INSERT_QUERIES = {
	// [Tables.CUSTOMERS]: generateWholeInsertQuery(Tables.CUSTOMERS),
	// [Tables.SYSTEMSETUP]: (values) => generateWholeInsertQuery(Tables.SYSTEMSETUP, values),
	// [Tables.LOGOUT]: (values) => generateWholeInsertQuery(Tables.LOGOUT, values),
	// [Tables.CATEGORIES_AND_FILTERS]: (values) =>
	// 	generateWholeInsertQuery(Tables.CATEGORIES_AND_FILTERS, values),
	// [Tables.ITEMS]: (values) => generateWholeInsertQuery(Tables.ITEMS, values),
	// [Tables.PRODUCT_SEARCH]: (values) =>
	// 	generateWholeInsertQuery(Tables.PRODUCT_SEARCH, values),
	// [Tables.CART]: (values) => generateWholeInsertQuery(Tables.CART, values),
	// [Tables.CHECKOUT]: (values) => generateWholeInsertQuery(Tables.CHECKOUT, values),
	// [Tables.IN_CART_PRODUCTS]: (values) =>
	// 	generateWholeInsertQuery(Tables.IN_CART_PRODUCTS, values),
	// [Tables.ORDER_HISTORY]: (values) =>
	// 	generateWholeInsertQuery(Tables.ORDER_HISTORY, values),
	// [Tables.ORDER_DETAILS]: (values) =>
	// 	generateWholeInsertQuery(Tables.ORDER_DETAILS, values),
	// [Tables.INVOICE_HISTORY]: (values) =>
	// 	generateWholeInsertQuery(Tables.INVOICE_HISTORY, values),
	// [Tables.COLLECT_PAYMENT]: (values) =>
	// 	generateWholeInsertQuery(Tables.COLLECT_PAYMENT, values),
	// [Tables.RECOMMENDED_PRODUCTS]: (values) =>
	// 	generateWholeInsertQuery(Tables.RECOMMENDED_PRODUCTS, values),
	// [Tables.GETPAYMENTAPI_DATA]: (values) =>
	// 	generateWholeInsertQuery(Tables.GETPAYMENTAPI_DATA, values),
	// [Tables.IMAGE_PATH]: (values) => generateWholeInsertQuery(Tables.IMAGE_PATH, values),
	// [Tables.SETCUSTLOCATION]: (values) =>
	// 	generateWholeInsertQuery(Tables.SETCUSTLOCATION, values),
	// [Tables.CHECKIN]: (values) => generateWholeInsertQuery(Tables.CHECKIN, values),
};

export {
	DEFAULT_INSERT_QUERIES, 
	DEFAULT_SELECT_QUERIES, 
	generateValues, 
	generateWholeInsertQuery, 
	fetchSalesRepDataFromTable, 
	fetchCompanyDataFromTable,
	generateWholeInsertQueryForCustomer,
	generateWholeInsertQueryForProductsByCat,
	fetchProductsByCatFromTable,
	generateWholeInsertQueryForProductsDetail,
	fetchProductsDetail,
	generateWholeInsertQueryForCart,
	fetchCartDetail,
	generateWholeInsertQueryForDashboardData,
	fetchAppDataFromTable,
	deleteCartFromTable,
	generateWholeInsertQueryForOrder,
	generateWholeInsertQueryForInvoice
};

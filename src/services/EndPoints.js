class ServiceCall {
  static BASE_URL = '';
  static TOKEN = '';
  static PATH = '/CDIServices/rest/orderprocessingservice/';
  static SETUP = 'systemsetup';
  static SALESLOGIN = 'salespersonlogin';
  static CUSTOMERS = 'getcustomers';
  static SYSTEMSETUP = 'systemsetup';
  static CUSTOMERS = 'getcustomers';
  static LOGOUT = 'logout';
  static CATEGORIES_AND_FILTERS = 'categories';
  static ITEMS = 'items';
  static PRODUCT_SEARCH = 'productsearch';
  static CART = 'cart';
  static CHECKOUT = 'checkout';
  static IN_CART_PRODUCTS = 'getcartproducts';
  static ORDER_HISTORY = 'orderhistory';
  static ORDER_DETAILS = 'ordereditems';
  static INVOICE_HISTORY = 'invoicehistory';
  static COLLECT_PAYMENT = 'collectpayment';
  static RECOMMENDED_PRODUCTS = 'recommendedproducts';
  static GETPAYMENTAPI_DATA = 'getonlinepaymentaccount';
  static IMAGE_PATH = '/CDIServices/';
  static SETCUSTLOCATION = 'setcustlocation';
  static CHECKIN = 'checkin';
}

export default ServiceCall;

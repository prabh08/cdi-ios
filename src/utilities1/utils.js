import accounting from './accounting';
const isDebuggingEnabled = __DEV__ && typeof atob !== 'undefined';
//import { AppEventsLogger } from "react-native-fbsdk";
const GOOGLE_API_KEY = 'AIzaSyCNWXriX844fqXmvOcDa_l5wHT4BiZiTtU';

const callStack = (func, stack = []) => {
  stack.push(func.name);
  return func.caller && stack.length < 5
    ? callStack(func.caller, stack)
    : stack.join();
};

export const Log = (...all) => {
  if (isDebuggingEnabled) {
    console.log(`::${callStack(Log)}::`, ...all);
  }
};

export function toCapitalCase(string) {
  return string
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function iphoneXSeries(height) {
  if (height >= 812) {
    return true;
  }
  return false;
}

export async function geocode(address) {
  fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_API_KEY}`,
  )
    .then((res) => res.json())
    .then((res) => {
      return res.json();
    });
}

export async function reverseGeoCode(lat, long) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${GOOGLE_API_KEY}`,
  );
  return res.json();
}

export const formatNumber = (number) => {
  if (number != null && number != '') {
    number = accounting.toFixed(number, 2);
    return accounting.formatMoney(number);
  } else {
    return 0;
  }
};

export const formatNumberOne = (number, key) => {
  if (number != null && number != '') {
    
    if(key !== 'Backspace') {
      console.log(number)
      number = accounting.toFixed(number, 2);
      return accounting.formatMoney(number);
    }
  } else {
    return 0;
  }
};

export const getCurrentDateInString = () => {
  var d = new Date();

  var month = (d.getMonth() + 1).toString();
  var day = (d.getDate()).toString();
  var year = (d.getFullYear()).toString();

  if (month.length < 2)
      month = '0' + month;
  if (day.length < 2)
      day = '0' + day;

  var finalDate = month + "/" + day + "/" + year.slice(-2);

  var time = d.toTimeString().split(" ")[0];

  return finalDate + " " + time;

};

export const applyDiscountOnItem = (discountType, bindingModel, selectedProducetData) => {
  console.log("bindingModel ", bindingModel)
  let up_to_qty1 = bindingModel.up_to_qty1;
  let up_to_qty2 = bindingModel.up_to_qty2;
  let up_to_qty3 = bindingModel.up_to_qty3;
  let up_to_qty4 = bindingModel.up_to_qty4;
  let up_to_qty5 = bindingModel.up_to_qty5;

  let up_to_price1 = bindingModel.up_to_price1;
  let up_to_price2 = bindingModel.up_to_price2;
  let up_to_price3 = bindingModel.up_to_price3;
  let up_to_price4 = bindingModel.up_to_price4;
  let up_to_price5 = bindingModel.up_to_price5;

  let buy_qty_to_get_free = bindingModel.buy_qty_to_get_free;
  let get_free_item = bindingModel.get_free_item;

  let item_percent_for_disc = bindingModel.item_percent_for_disc;
  // item_percent_for_disc = 50;
  var qty = selectedProducetData.qty;
  let price = 0;

  let entredQty = selectedProducetData.qty;
  var cartData = {};

  if (discountType === 1) {
    if (entredQty < up_to_qty1) {
      price = up_to_price1;
    }
    if (entredQty > up_to_qty1 && entredQty < up_to_qty2) {
      price = up_to_price2;

    }
    if (entredQty > up_to_qty2 && entredQty < up_to_qty3) {
      price = up_to_price3;

    }
    if (entredQty > up_to_qty3 && entredQty < up_to_qty4) {
      price = up_to_price4;

    }
    if (entredQty > up_to_qty4 && entredQty < up_to_qty5) {
      price = up_to_price5;

    }

    // bindingModel.set('unit_price', price.toFixed(2));

    cartData['discounted_meta_key'] = 'discountAtLowestPrice';
    cartData['discounted_meta_value'] = price;

  } else if (discountType === 2) {
    
    if (entredQty > 1) {
      
      var u_price = Number(selectedProducetData.unit_price);
      var t_price = 0;
      var real;
      var half;
      var discountedItems;
      
      if (entredQty % 2 == 0) {
        
        // calculate here buy one get n% discount on second
        discountedItems = (entredQty / 2);
        real = (entredQty / 2) * u_price;
        half = (entredQty / 2) * u_price * item_percent_for_disc / 100;
        t_price = Number(real*entredQty - half );

      } else {
        entredQty = entredQty - 1;
        discountedItems = (entredQty / 2);
        real = (entredQty / 2) * u_price;
        half = (entredQty / 2) * u_price * item_percent_for_disc / 100;

        t_price = Number(real*qty - half );

      }
       
      // price per item after discount
      var pricePerItem = Number(t_price / qty);
      // total amount after discount on all the items
      // bindingModel.set('unit_price', t_price.toFixed(2));
       
      var totalPrice = (100 * Number(selectedProducetData.unitActualPrice) - t_price) / Number(selectedProducetData.unitActualPrice);
      // total discount obtained from total purchase
      var discountObtained = totalPrice.toFixed(2);
      
      cartData['discounted_meta_key'] = 'discountedItems';
      cartData['discounted_meta_value'] = item_percent_for_disc + ' on ' + discountedItems;
      cartData['price'] = pricePerItem;
      // cartData['price'] = item_percent_for_disc+'on'+discountedItems;
    }
  }
  else if (discountType === 3) {
    if (entredQty >= buy_qty_to_get_free) {
      var freeItems = get_free_item * ~~(Number(entredQty) / buy_qty_to_get_free);
      var effectedPriceItems = entredQty - freeItems;
      var effectedPriceForEachItem = Number(selectedProducetData.unitActualPrice) * effectedPriceItems / Number(entredQty);
      // bindingModel.set('unit_price', effectedPriceForEachItem.toFixed(2));
      cartData['discounted_meta_key'] = 'buyItemGetItem';
      cartData['discounted_meta_value'] = freeItems + 'freeon' + buy_qty_to_get_free + 'get' + get_free_item;
      cartData['price'] = (selectedProducetData.unit_price * entredQty - freeItems * selectedProducetData.unit_price) / entredQty;
    }
  } else {
    cartData['discounted_meta_key'] = '';
    cartData['discounted_meta_value'] = '';
    cartData['price'] = '';
  }

  return cartData;
};

/**
 * Method use for send logs to the Facebook
 * @param {*} eventType Type of the Event
 * return null
 */
// export function FbEventLogger(eventType) {
//     AppEventsLogger.logEvent(eventType);
// }

import { Dimensions, Platform, StatusBar } from 'react-native';

export const { height, width } = Dimensions.get('window');

export const vh = (value) => {
    if (value > 100) return height;
    return (value * height) / 100;
};

export const vw = (value) => {
    if (value > 100) return width;
    return (value * width) / 100;
};

export const isiPhoneX = (Platform.OS === 'ios')
    && ((height === 812 && width === 375)
        || (height === 896 && width === 414));

export const statusBarHeight = (() => {
    if (Platform.OS === 'android') {
        return StatusBar.currentHeight || 20;
    }
    if (isiPhoneX) {
        return 40;
    }

    return 20;
})();

export const chinHeight = (() => (isiPhoneX ? 30 : 0))();
import { useNavigationContainerRef } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

export const navigationRef = useNavigationContainerRef()

export function navigate(name, params) {
  if (navigationRef.onReady()) {
    navigationRef.navigate(name, params);
  }
}
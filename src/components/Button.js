/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {TouchableOpacity, StyleSheet, Text} from 'react-native';
import {vh} from '../utilities/Dimensions';

const Button = ({label, onClick, width, height, disable}) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      disabled={disable}
      style={[
        {width: width},
        styles.container,
        {backgroundColor: disable ? '#ccc' : '#489CD6'},
      ]}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  label: {
    color: 'white',
  },
  container: {
    height: vh(4),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
});

export default Button;

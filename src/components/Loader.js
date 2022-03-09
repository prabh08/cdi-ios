import React from 'react'
import {View, StyleSheet, ActivityIndicator, Text} from 'react-native'



const Loader = () => {
    return (
        <View
        style={{
          flex: 1,
          ...StyleSheet.absoluteFillObject,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            height: 80,
            width: 100,
            backgroundColor: '#489CD6',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator color="white" size="large" />
          <Text style={{ color: 'white'}}>Please Wait</Text>
        </View>
      </View>
    )
}


export default Loader
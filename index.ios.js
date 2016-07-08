var Main = require('./app/components/main');

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  NavigatorIOS,
  Text,
  View
} from 'react-native';

var styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#111111'
  }
})

class Parking extends Component {
  render() {
    return (
      <NavigatorIOS
        barTintColor='#48d1cc'
        titleTextColor= 'white'
        style={styles.container}
        initialRoute = {{
          title: "parkit", 
          component: Main
        }} />
    );
  }
}


AppRegistry.registerComponent('parking', () => Parking);

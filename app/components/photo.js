import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View, 
  TouchableOpacity
} from 'react-native';

var Button = require('react-native-button');
import Camera from 'react-native-camera';
import Icon from 'react-native-vector-icons/FontAwesome';

class Photo extends Component {
  // Move camera button: 
  // https://github.com/lwansbrough/react-native-camera/blob/master/Example/Example.js
  // 
  render() {
    return (
      <View style={styles.container}>
        <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={styles.preview}
          aspect={Camera.constants.Aspect.fill}
          captureTarget={Camera.constants.CaptureTarget.disk}
          >
          
        </Camera>
        <View style={styles.captureContainer}>
          <TouchableOpacity>
            <Icon name='circle' size={80} color='#48d1cc' onPress={this.takePicture.bind(this)} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  takePicture() {
    this.camera.capture()
      .then((data) => {
        // send photo path back to the original screen with callback
        // http://stackoverflow.com/questions/29463592/react-native-pass-properties-on-navigator-pop
        // 
        this.props.callback(data.path);
        this.props.navigator.pop();
      })
      .catch(err => console.error(err));
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width, 
    backgroundColor: 'rgba(52,52,52,0)'
  },
  capture: {
    fontSize: 18, 
    color: 'white',
    marginTop: 10
  }, 
  captureContainer: {
    height: 60, 
    backgroundColor: 'rgba(52,52,52,0)',
    position: 'absolute', 
    bottom: 50, 
    left: 10, 
    right: 10,
    borderRadius: 10,
    alignItems: 'center'
  }, 
});

module.exports = Photo
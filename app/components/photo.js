import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native';

var Button = require('react-native-button');
import Camera from 'react-native-camera';

class Photo extends Component {
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
          <Button
            containerStyle={styles.captureContainer}
            style={styles.button}
            styleDisabled={{color: 'red'}}
            onPress={this.takePicture.bind(this)}
          >
            photo
          </Button>
        </Camera>
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
    width: Dimensions.get('window').width
  },
  capture: {
    fontSize: 18, 
    color: 'white',
    marginTop: 10
  }, 
  captureContainer: {
    height: 80, 
    backgroundColor: '#98fb98',
    position: 'absolute', 
    bottom: 10, 
    left: 10, 
    right: 10,
    borderRadius: 10
  }
});

module.exports = Photo
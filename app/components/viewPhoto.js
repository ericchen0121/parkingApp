import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View, 
  Image, 
  TouchableWithoutFeedback
} from 'react-native';

class ViewPhoto extends Component {
	_goBack() {
		console.log('go back')
		this.props.navigator.pop();
	}
	render(){
		return (
			<View style={styles.buttonPhotoTakenContainer}>
	      <TouchableWithoutFeedback onPress={this._goBack.bind(this)}>
	      	<Image
		        style={styles.photo}
		        source={{uri: this.props.photoPath }}
		      />
	      </TouchableWithoutFeedback>
	    </View>
    )
	}

}

var styles = StyleSheet.create({
	photo: {
		height: Dimensions.get('window').height,
		width: Dimensions.get('window').width
	}
});

module.exports = ViewPhoto
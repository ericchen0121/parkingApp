import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View, 
  Image, 
  TouchableWithoutFeedback
} from 'react-native';

// This ViewPhoto component renders a photo with the ability to click on 
// the photo to return to the previous screen
// 
class ViewPhoto extends Component {
	_goBack() {
		this.props.navigator.pop();
	}
	render(){
		return (
			<View style={styles.photoTakenContainer}>
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
	}, 
	photoTakenContainer: {
		marginTop: 60
	}
});

module.exports = ViewPhoto
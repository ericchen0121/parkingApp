'use strict';

import React, { Component } from 'react';
var Mapbox = require('react-native-mapbox-gl');
var mapRef = 'mapRef';
import {
  AppRegistry,
  StyleSheet,
  Text,
  StatusBar,
  View, 
  Image
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
var Button = require('react-native-button');
var Photo = require('./photo')

var Main = React.createClass({
  mixins: [Mapbox.Mixin],
  getInitialState() {
    return {
      center: {
        latitude: 0,
        longitude: 0
      },
      zoom: 16,
      annotations: [], 
      parked: false, 
      photoPath: undefined
    };
  },
  onRegionChange(location) {
    this.setState({ currentZoom: location.zoom });
  },
  onRegionWillChange(location) {
    console.log(location);
  },
  onUpdateUserLocation(location) {
    console.log(location);
  },
  onOpenAnnotation(annotation) {
    console.log(annotation);
  },
  onRightAnnotationTapped(e) {
    console.log(e);
  },
  onLongPress(location) {
    console.log('long pressed', location);
  },
  onTap(location) {
    console.log('tapped', location);
  },
  onOfflineProgressDidChange(progress) {
    console.log(progress);
  },
  onOfflineMaxAllowedMapboxTiles(hitLimit) {
    console.log(hitLimit);
  },
  _setPark(){
    this.setState({parked: true});
    this.setZoomLevelAnimated(mapRef, 17)
    // get coordinates and add a marker
    this.getCenterCoordinateZoomLevel(mapRef, (location) => {
      var time = new Date;
      this.addAnnotations(mapRef, [{
        coordinates: [location.latitude, location.longitude],
        type: 'point', 
        title: "parkd", 
        subtitle: "on " + time.toLocaleString(),
        id: 'parking1'
      }])
    })
  },
  _removePark(){
     //reset all markers
    this.removeAllAnnotations(mapRef);
    this.setState({parked: false, photoPath: undefined});
    this.setZoomLevelAnimated(mapRef, 16)
  },
  _renderParkButton(){
    if(this.state.parked) {
      return (
        <Button
          containerStyle={styles.buttonCancelPark}
          style={styles.button}
          styleDisabled={{color: 'red'}}
          onPress={this._removePark}
        >
          cancel park
        </Button>
      )
    } else {
      return (
        <Button
          containerStyle={styles.buttonToPark}
          style={styles.button}
          styleDisabled={{color: 'red'}}
          onPress={this._setPark}
        >
          park
        </Button>
      )
    }
  },
  _renderPhotoButton() {
    if(this.state.parked) {
      return (
        <View style={styles.cameraButton}>
          <Icon onPress={this._takePhoto} name="camera" size={40} color="#808080" />
        </View>
      )
    } else {
      return (
        <View></View>
      )
    }
  },
  _renderPhotoTaken() {
    if(this.state.photoPath) {
      return ( 
        <View style={styles.buttonPhotoTakenContainer}>
          <Image
            style={styles.photo}
            source={{uri: this.state.photoPath }}
          />
        </View>
      )
    } else {
      return (
        <View></View>
      )
    }
  },
  _takePhoto(){
    this.props.navigator.push({
      title: "Remember Parkd Spot", 
      component: Photo,
      passProps: {callback: this.callbackPhoto}
    });
  },
  callbackPhoto(path){
    this.setState({photoPath: path})
  },
  render() {
    StatusBar.setHidden(false);
    return (
      <View style={styles.container}>
        <Mapbox
          style={styles.container}
          direction={0}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
          showsUserLocation={true}
          ref={mapRef}
          logoIsHidden={true}
          accessToken={'pk.eyJ1IjoiZXJpY2NoZW4wMTIxIiwiYSI6ImNpbjR1ZTk5YjBjOHh1cmtrcjE1aHhpd20ifQ.Enx5PU9X5DZgFUs2vohngA'}
          styleURL={this.mapStyles.streets}
          userTrackingMode={this.userTrackingMode.follow}
          centerCoordinate={this.state.center}
          zoomLevel={this.state.zoom}
          onRegionChange={this.onRegionChange}
          onRegionWillChange={this.onRegionWillChange}
          annotations={this.state.annotations}
          onOpenAnnotation={this.onOpenAnnotation}
          onRightAnnotationTapped={this.onRightAnnotationTapped}
          onUpdateUserLocation={this.onUpdateUserLocation}
          onLongPress={this.onLongPress}
          onTap={this.onTap}
          onOfflineProgressDidChange={this.onOfflineProgressDidChange}
          onOfflineMaxAllowedMapboxTiles={this.onOfflineMaxAllowedMapboxTiles} />
        {this._renderParkButton()}
        {this._renderPhotoButton()}
        {this._renderPhotoTaken()}
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 12
  }, 
  button: {
    fontSize: 24, 
    color: 'white',
    marginTop: 22,    
  }, 
  buttonCancelPark: {
    height: 80, 
    backgroundColor: '#f08080',
    position: 'absolute', 
    bottom: 10, 
    left: 10, 
    right: 10, 
    borderRadius: 10
  }, 
  buttonToPark: {
    height: 80, 
    backgroundColor: '#48d1cc',
    position: 'absolute', 
    bottom: 10, 
    left: 10, 
    right: 10, 
    borderRadius: 10
  }, 
  cameraButton: {
    height: 50, 
    backgroundColor: 'rgba(52,52,52,0)',
    position: 'absolute', 
    top: 80, 
    left: 20, 
    borderRadius: 5
  }, 
  buttonPhotoTakenContainer: {
    height: 50, 
    width: 50,
    backgroundColor: 'rgba(52,52,52,0)',
    position: 'absolute', 
    top: 140, 
    left: 20, 
    borderRadius: 5
  },
  photo: {
    height: 50, 
    width: 50
  }
});

module.exports = Main;
'use strict';

import React, { Component } from 'react';
var Mapbox = require('react-native-mapbox-gl');
var mapRef = 'mapRef';
import {
  AppRegistry,
  StyleSheet,
  Text,
  StatusBar,
  View
} from 'react-native';

var Button = require('react-native-button');

var MapExample = React.createClass({
  mixins: [Mapbox.Mixin],
  getInitialState() {
    return {
      center: {
        latitude: 0,
        longitude: 0
      },
      zoom: 16,
      annotations: []
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
  _setMarkerPress(){
    //reset all markers
    this.removeAllAnnotations(mapRef);

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
  _setMarkerCallback(){

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
          styleURL="mapbox://styles/mapbox/satellite-v9"
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
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={{color: 'red'}}
          onPress={this._setMarkerPress}
        >
          park
        </Button>
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
    marginTop: 30,    
  }, 
  buttonContainer: {
    height: 100, 
    backgroundColor: '#48d1cc',
    position: 'absolute', 
    bottom: 10, 
    left: 10, 
    right: 10, 
    borderRadius: 10
  }
});

AppRegistry.registerComponent('parking', () => MapExample);
'use strict';

import React, { Component } from 'react';
var Mapbox = require('react-native-mapbox-gl');
var mapRef = 'mapRef';
var store = require('react-native-simple-store');

import {
  AppRegistry,
  StyleSheet,
  Text,
  StatusBar,
  View, 
  Image, 
  TextInput,
  TouchableWithoutFeedback
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
var Button = require('react-native-button');
var Photo = require('./photo');
var ViewPhoto = require('./viewPhoto.js');

var Main = React.createClass({
  mixins: [Mapbox.Mixin],

  componentDidMount() {
  },

  getInitialState() {
    return {
      center: {
        latitude: 0,
        longitude: 0
      },
      zoom: 16,
      annotations: [], 
      parked: false, 
      photoPath: undefined, 
      notes: '', 
      time: undefined
    };
  },

  _setPark(){
    
    this.setZoomLevelAnimated(mapRef, 17);
    // get location and add a marker to the map
    this.getCenterCoordinateZoomLevel(mapRef, (location) => {
      if(location) {
        this.setState({parked: true});
        this.setState({time: new Date});
        this.addAnnotations(mapRef, [{
          coordinates: [location.latitude, location.longitude],
          type: 'point', 
          title: "parkit", 
          subtitle: "on " + this.state.time.toLocaleString(),
          id: 'parking1'
        }])

        // persist location
       this._storeLocationDetails(location);

      } else {
        console.log('location not set') 
      }
    })
  },

  _cancelPark(){
     //reset all markers
    this.removeAllAnnotations(mapRef);
    this.setState({parked: false, photoPath: undefined, notes: ''});
    this.setZoomLevelAnimated(mapRef, 16);

    this._storeLocationPrevious();   
  },

  // persist location to storage
  _storeLocationPrevious() {
    store
      .get('current')
      .then(current => {store.save('previous', current) })
      .then(() => store.delete('current'))
      .then(() => store.get('previous'))  
      .then(previous => console.log(previous)) // debug
  },

  _storeLocationDetails(location) {
     store.save('current', { 
        time: this.state.time, 
        latitude: location.latitude,
        longitude: location.latitude
      })
  },

  _storeLocationPhoto(path) {
    store.update('current', {photoPath: path});
  },

  _storeLocationNotes(notes) {
    store.update('current', {notes: notes})
  },

  _renderParkButton(){
    if(this.state.parked) {
      return (
        <Button
          containerStyle={styles.buttonCancelPark}
          style={styles.button}
          onPress={this._cancelPark}
        >
          cancel
        </Button>
      )
    } else {
      return (
        <Button
          containerStyle={styles.buttonToPark}
          style={styles.button}
          onPress={this._setPark}
        >
          parkit
        </Button>
      )
    }
  },

  _renderPhotoButton() {
    if(!this.state.parked) return;
    return (
      <View style={styles.cameraButton}>
        <Icon onPress={this._takePhoto} name="camera" size={40} color="#48d1cc" />
      </View>
    )
  },
  _renderPhotoTaken() {
    if(!this.state.photoPath) return;
    return ( 
      <View style={styles.buttonPhotoTakenContainer}>
        <TouchableWithoutFeedback onPress={this._gotoViewPhoto}>
          <Image
            style={styles.photo}
            source={{uri: this.state.photoPath }}
          />
        </TouchableWithoutFeedback>
      </View>
    )
  },

  _gotoViewPhoto() {
    this.props.navigator.push({
      component: ViewPhoto,
      passProps: {photoPath: this.state.photoPath}
    });
  },

  _takePhoto(){
    this.props.navigator.push({ 
      component: Photo,
      passProps: {callback: this.callbackPhoto}
    });
  },

  callbackPhoto(path){
    this.setState({photoPath: path});
    this._storeLocationPhoto(path);
  },

  _renderCenterMapButton() {
    return (
      <View>
        <View style={styles.centerMapButtonStack}>
          <Icon name="circle" size={60} color="white" />
        </View>
        <View style={styles.centerMapButton}>
          <Icon onPress={this._centerMap} name="dot-circle-o" size={52} color="#48d1cc" />
        </View>
      </View>
    )
  },

  _centerMap() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setCenterCoordinateZoomLevelAnimated(mapRef, position.coords.latitude, position.coords.longitude, 16);
      })
  },

  _notes() {
    if(!this.state.parked) return;
    return (
      <View style={styles.notes} >
        <TextInput 
          style={{height: 40}}
          onChangeText= {(notes) => {
            this.setState({notes: notes});
            this._storeLocationNotes(notes);
          }}
          value={this.state.notes}
          placeholder='  parking meter, garage, street address'
        />
      </View>
    )
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
        {this._renderCenterMapButton()}
        {this._notes()}
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
    top: 30, 
    left: 20, 
    borderRadius: 5
  }, 
  buttonPhotoTakenContainer: {  
    position: 'absolute', 
    top: 80, 
    left: 20    
  },
  photo: {
    height: 46, 
    width: 46, 
    borderRadius: 5
  },
  centerMapButton: {
    backgroundColor: 'rgba(52,52,52,0)',
    position: 'absolute', 
    bottom: 150, 
    left: 20, 
  }, 
  centerMapButtonStack: {
    backgroundColor: 'rgba(52,52,52,0)',
    position: 'absolute', 
    bottom: 146, 
    left: 16.5,
  }, 
  notes: {
    position: 'absolute', 
    top: 30,
    left: 70,
    right: 10, 
    backgroundColor: 'white'
  }
});

module.exports = Main;
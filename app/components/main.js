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

//------------------
// LIFECYCLE
//------------------
  componentWillMount() {
    this._setStateCenterCoordinates()
  },
  componentDidMount() {
  },
  getInitialState() {
    return {
      // this.state.center should be overridden by this._setStateCenterCoordinates()
      center: {
        latitude: 0,
        longitude: 0
      },
      zoom: 15,
      annotations: [], 
      parked: false, 
      photoPath: undefined, 
      notes: '', 
      time: undefined, 
      mapStyle: this.mapStyles.streets
    };
  },
  
  _setCurrentPosition() {
    store
      .get('current')
      .then(current => {
        if(current) {
          console.log('CURRENT POSITION IS', current)
          this.setCenterCoordinateZoomLevelAnimated(mapRef, current.latitude, current.longitude, 17)
        } else{
          console.log('NOTHING, BABY')
        }
      })
  },

  

//------------------
// STORAGE
//------------------
  _storeLocationPrevious() {
    store
      .get('current')
      .then(current => {
        // checks to ensure previous is not overwritten
        if(current) {
          store.save('previous', current) 
        }
      })
      // .then(() => store.delete('current'))
      // Note: Debugging in console for seeing store
      // .then(() => store.get('previous'))  
      // .then(previous => console.log('DEBUG: ', previous))
  },
  // switches current to previous and vice versa so previous state is "correct"
  _storePreviousToCurrent() {
    var previousTemp = {};
    var currentTemp = {};
    store
      .get('previous')
      .then(previous => {previousTemp = previous})
      .then(() => store.get('current'))
      .then(current => {currentTemp = current})
      .then(() => store.delete('previous'))
      .then(() => store.delete('current'))
      .then(() => store.save('current', previousTemp))
      .then(() => store.save('previous', currentTemp))
      .catch(error => {
        console.error(error.message);
      })      
  },
  _storeLocationDetails(location) {
     store.save('current', { 
        time: this.state.time.toString(), 
        latitude: location.latitude,
        longitude: location.longitude
      })
  },

  _storeLocationPhoto(path) {
    store.update('current', {photoPath: path});
  },

  _storeLocationNotes(notes) {
    store.update('current', {notes: notes})
  },

//------------------
// PARKING
//------------------
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
  _setPark(){
    this.setZoomLevelAnimated(mapRef, 16);
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
    this.setState({
      parked: false, 
      viewHistoryParking: false,
      photoPath: undefined, 
      notes: ''
    });
    this.setZoomLevelAnimated(mapRef, 15);

    this._storeLocationPrevious();   
  },
//------------------
// PHOTO
//------------------
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

//------------------
// CENTERING 
//------------------
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
  _setStateCenterCoordinates() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          center: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
          }
        })
      }
    )
  },

//------------------
// NOTES
//------------------
  _notes() {
    if(!this.state.parked) return;
    return (
      <View style={styles.notes} >
        <TextInput 
          style={{height: 40, paddingLeft: 10}}
          onChangeText= {(notes) => {
            this.setState({notes: notes});
            this._storeLocationNotes(notes);
          }}
          value={this.state.notes}
          placeholder='parking meter, garage, street address'
        />
      </View>
    )
  },
//------------------
// HISTORY
//------------------
  _renderHistoryButton() {
    if(this.state.viewHistoryParking) return;
    return (
      <View>
        <View style={styles.historyButtonStack}>
          <Icon name="circle" size={60} color="white" />
        </View>
        <View style={styles.historyButton}>
          <Icon onPress={this._gotoHistoryLocation} name="history" size={44} color="#48d1cc" />
        </View>
      </View>
    );
  },
  _gotoHistoryLocation() {
    store
      .get('previous')
      .then(previous => {
        this.removeAllAnnotations(mapRef);
        this.setState({
          // viewHistoryParking: true,
          parked: true, 
          time: new Date(previous.time),
          photoPath: previous.photoPath,
          notes: previous.notes
        });
        this.setCenterCoordinateZoomLevelAnimated(mapRef, previous['latitude'], previous['longitude'], 16);  
        this.addAnnotations(mapRef, [{
          coordinates: [previous.latitude, previous.longitude],
          type: 'point', 
          title: "parkit", 
          subtitle: "on " + this.state.time.toLocaleString(),
          id: 'parking1'
        }])
      })
    this._storePreviousToCurrent();
  },

//------------------
// RENDER
//------------------
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
          styleURL={this.state.mapStyle}
          userTrackingMode={this.userTrackingMode.none}
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
        {this._renderHistoryButton()}
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
    left: 20, 
    height: 50, 
    width: 50,
    backgroundColor: '#48d1cc',
    borderRadius: 5, 
    padding: 2
  },
  photo: {
    height: 46, 
    width: 46, 
    borderRadius: 5
  },
  historyButton: {
    height: 50, 
    backgroundColor: 'rgba(52,52,52,0)',
    position: 'absolute', 
    bottom: 220, 
    left: 24, 
    borderRadius: 5
  }, 
  historyButtonStack: {
    backgroundColor: 'rgba(52,52,52,0)',
    position: 'absolute', 
    bottom: 218, 
    left: 16.5
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
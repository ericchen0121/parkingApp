'use strict';

import React, { Component } from 'react';
var Mapbox = require('react-native-mapbox-gl');
var mapRef = 'mapRef';
var store = require('react-native-simple-store');

import {
  Alert,
  AppRegistry,
  StyleSheet,
  Text,
  StatusBar,
  View, 
  Image, 
  TextInput,
  TouchableWithoutFeedback
} from 'react-native';

import Geocoder from 'react-native-geocoder';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Animatable from 'react-native-animatable';
var Button = require('react-native-button');
var Photo = require('./photo');
var ViewPhoto = require('./viewPhoto.js');
var alertMessage = 'Go to previously parked location?';

var Main = React.createClass({
  mixins: [Mapbox.Mixin],

//------------------
// LIFECYCLE
//------------------
  componentWillMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this._setStateInitialCenterCoordinates(position.coords.latitude, position.coords.longitude)
      }
    )
  },
  componentDidMount() {
    this._setParkedOnExitFlag();
  },
  getInitialState() {
    return {
      // this.state.initalCenter should be overridden by this._setStateCenterCoordinates()
      initialCenter: {
        latitude: 0,
        longitude: 0
      },
      marker: {
        latitude: 0, 
        longitude: 0
      },
      zoom: 15,
      annotations: [], 
      parked: false, 
      photoPath: undefined, 
      notes: '', 
      time: new Date, 
      mapStyle: this.mapStyles.streets // streets, dark, light, satellite, hybrid, emerald OR custom
    };
  },

//------------------
// GEOCODE
// https://github.com/devfd/react-native-geocoder
//------------------
  
  _geocodeLocationToAddress(lat, lng) {
    var position = {lat, lng}; 
    Geocoder
      .geocodePosition(position)
      .then(result => {
        if(result[0]) {
          var address = result[0].streetNumber + ' ' + result[0].streetName
          this.setState({'address': address })
          this._storeLocationAddress(address)
        } else { console.log('no geocode location')}
      })
      .catch(err => console.error(err))
  },
//------------------
// PARKED WHEN EXIT APP FLAG
//------------------

  _setParkedOnExitFlag() {
    store
      .get('parkedFlag') 
      .then(state => {
        if(state){
          this.setState({'parkedOnExit': true});
          this._alertParkedOnExit();
        } else {
          this.setState({'parkedOnExit': false});
        }
      })
      .catch(err => console.error(err))
  },

  _alertParkedOnExit() {
    // Alert.alert(
    //   'Previously parked!',
    //   alertMessage,
    //   [
    //     {text: 'Cancel', onPress: () => console.log('canceled')},
    //     {text: 'OK', onPress: () => {this._gotoLocation('current')} },
    //   ]
    // )
  },
  _storeParkedFlag(state) {
    store
      .delete('parkedFlag')
      .then(() => store.save('parkedFlag', state))
      .catch(err => console.err())
  },


//------------------
// STORAGE
//------------------
// TODO: Could factor out the 'previous' state since we're not really
// using it. To do this, don't use the _storePreviousToCurrent() function
// nor the _storeLocationPrevious(). Currently we are only using the one 'current'
// state location to go back to it when a) exiting the app when parked and b) 
// if the user accidentally presses the cancel button to go back to the 'current' 
// state. 
// 
// However, since the 'previous' state was written, I haven't yet factored the code 
// out in case you want to use it in the future (it allows you to retrieve potentially two
// states of parking when you are parked and toggle back and forth between them).
// 
  _storeLocationPrevious() {
    store
      .get('current')
      .then(current => {
        // checks to ensure previous is not overwritten
        if(current) {
          store.save('previous', current) 
        }
      })
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
        marker: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      })
  },

  _storeLocationPhoto(photoPath) {
    store.update('current', {photoPath});
  },

  _storeLocationNotes(notes) {
    store.update('current', {notes})
  },
  _storeLocationAddress(address) {
    store.update('current', {address})
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
          parq
        </Button>
      )
    }
  },

  // sets active parked location to center of the users location
  // stores location in k-v store for persisting location on app exit
  // 
  _setPark(){
    this.setZoomLevelAnimated(mapRef, 16);

    // get location from center of the map, and add a marker to the map
    this.getCenterCoordinateZoomLevel(mapRef, (location) => {
      if(location) {
        this._geocodeLocationToAddress(location.latitude, location.longitude);
        this.setState({
          parked: true,
          viewHistoryParking: false,
          time: new Date,
          marker: {
            latitude: location.latitude, 
            longitude: location.longitude
          }
        });
        this.addAnnotations(mapRef, [{
          coordinates: [location.latitude, location.longitude],
          type: 'point', 
          title: 'parqed', 
          subtitle: "on " + this.state.time.toLocaleString(),
          id: 'parking1'
        }])

        // persist location for when user exits app
       this._storeLocationDetails(location);
       this._storeParkedFlag(true);
      } 
    })
  },

  _cancelPark(){
     //reset all markers
    this.removeAllAnnotations(mapRef);
    this.setState({
      parked: false, 
      viewHistoryParking: true,
      photoPath: undefined, 
      notes: ''
    });
    this.setZoomLevelAnimated(mapRef, 15);

    this._storeLocationPrevious();   
    this._storeParkedFlag(false);
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
// CENTER MAP ON MARKER PARKED LOCATION
//------------------
  _renderCenterMarkerButton() {
    if(!this.state.parked) return;
    return (
      <View>
        <View style={styles.centerMarkerButtonStack}>
          <Icon name="circle" size={60} color="white" />
        </View>
        <View style={styles.centerMarkerButton}>
          <Icon onPress={this._centerMarker} name="map-marker" size={44} color="#48d1cc" />
        </View>
      </View>
    )
  },
  _centerMarker() {
    if(this.state.marker){
      this.setCenterCoordinateZoomLevelAnimated(mapRef, this.state.marker.latitude, this.state.marker.longitude, 16);  
    } 
  },
//------------------
// MAPBOX API
//------------------
  onUpdateUserLocation(location) {
    this._setStateCurrentCenterCoordinates(location.latitude, location.longitude)
  }, 
//------------------
// CENTER MAP ON CURRENT
//------------------
  _renderCenterMapButton() {
    return (
      <View>
        <View style={styles.centerMapButtonStack}>
          <Icon name="circle" size={60} color="white" />
        </View>
        <View style={styles.centerMapButton}>
          <Icon onPress={this._currentCenterMap} name="dot-circle-o" size={52} color="#48d1cc" />
        </View>
      </View>
    )
  },

  _currentCenterMap() {
    this.setCenterCoordinateAnimated(mapRef, this.state.currentCenter.latitude, this.state.currentCenter.longitude, 16);  
  },
//------------------
// SETTING STATE
//------------------
  _setStateInitialCenterCoordinates(lat, lng) {
    this.setState({
      initialCenter: {
        latitude: lat,
        longitude: lng
      }
    })
  },
  // NOTE: necessary to set a separate coordinate
  _setStateCurrentCenterCoordinates(lat, lng) {
    this.setState({
      currentCenter: {
        latitude: lat,
        longitude: lng
      }
    })
  },


//------------------
// NOTES
//------------------
  _renderNotes() {
    if(!this.state.parked) return;
    return (
      <View style={styles.notes} >
        <TextInput 
          style={styles.notesText}
          onChangeText= {(notes) => {
            this.setState({notes: notes});
            this._storeLocationNotes(notes);
          }}
          value={this.state.notes}
          placeholder='parqing notes'
        />
      </View>
    )
  },
//------------------
// PARKING STATUS
//------------------
  _renderParkingStatus() {
    if(!this.state.parked) return;
    return (
      <View style={styles.parkingStatus} >
        <Text style={styles.parkingStatusBigText}>{this.state.address}</Text>
        <Text style={styles.parkingStatusText}>at {this.state.time.toLocaleTimeString()}</Text>
      </View>
    )
  },

//------------------
// HISTORY
//------------------
  _renderHistoryButton() {
    if(!this.state.viewHistoryParking) return;
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
    this.setState({viewHistoryParking: false})
    this._gotoLocation('previous');
    this._storePreviousToCurrent();
  },

  // key is 'current' or 'previous'
  _gotoLocation(key) {
    store
      .get(key)
      .then(key => {
        this.removeAllAnnotations(mapRef);
        this.setState({
          parked: true, 
          time: new Date(key.time),
          photoPath: key.photoPath,
          notes: key.notes,
          address: key.address,
          marker: key.marker
        });
        this.setCenterCoordinateZoomLevelAnimated(mapRef, key.marker.latitude, key.marker.longitude, 16);  
        this.addAnnotations(mapRef, [{
          coordinates: [key.marker.latitude, key.marker.longitude],
          type: 'point', 
          title: 'parked', 
          subtitle: "on " + this.state.time.toLocaleString(),
          id: 'parking1'
        }])
      })
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
          centerCoordinate={this.state.initialCenter}
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
        {this._renderCenterMarkerButton()}
        {this._renderNotes()}
        {this._renderHistoryButton()}
        {this._renderParkingStatus()}
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
    left: 35, 
    right: 35, 
    borderRadius: 10
  }, 
  buttonToPark: {
    height: 80, 
    backgroundColor: '#48d1cc',
    position: 'absolute', 
    bottom: 10, 
    left: 35, 
    right: 35, 
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
    left: 80,
    right: 55, 
    backgroundColor: 'white'
  }, 
  notesText: {
    height: 40, 
    paddingLeft: 10, 
    paddingRight: 10
  },
  parkingStatus: {
    position: 'absolute', 
    top: 80,
    left: 80,
    right: 55, 
    backgroundColor: 'rgba(14,100,60,0.55)',
    borderRadius: 2, 
    paddingLeft: 10, 
    paddingTop: 3,
    paddingBottom: 3
  }, 
  parkingStatusText: {
    fontSize: 13,
    color: 'white', 
  }, 
  parkingStatusBigText: {
    fontSize: 17,
    color: 'white', 
  }, 
  centerMarkerButtonStack: {
    backgroundColor: 'rgba(52,52,52,0)',
    position: 'absolute', 
    bottom: 146, 
    left: 76.5,
  }, 
  centerMarkerButton: {
    backgroundColor: 'rgba(52,52,52,0)',
    position: 'absolute', 
    bottom: 155, 
    left: 90
  }
});

module.exports = Main;
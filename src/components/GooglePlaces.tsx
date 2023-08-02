import React, { Component } from 'react';
import { StyleSheet, Image } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default class GooglePlaces extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <GooglePlacesAutocomplete
        placeholder={this.props.placeholder}
        minLength={2} // minimum length of text to search
        nearbyPlacesAPI='GoogleReverseGeocoding'
        autoFocus={false}
        returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
        listViewDisplayed='false' // true/false/undefined
        fetchDetails={true}
        renderDescription={(row) => row.description} // custom description render
        onPress={(data, details) => {
          this.props.onPress(details); // Send details up to the parent of the component
        }}
        getDefaultValue={() => ''}
        query={{
          // available options: https://developers.google.com/places/web-service/autocomplete
          key: 'AIzaSyBGkr3O0CK_btKtBFNgkp27mWkD_FJKFXo',
          language: 'en', // language of the results
          // types: '(cities)' // default: 'geocode'
        }}
        styles={{
          textInput: {
            height: 36,
          },
          textInputContainer: {
            width: '100%',
            height: 51,
          },
          description: {
            fontWeight: 'bold',
          },
          predefinedPlacesDescription: {
            color: '#1faadb',
          },
        }}
        currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
        currentLocationLabel='Current location'
        nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
        GoogleReverseGeocodingQuery={
          {
            // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
          }
        }
        GooglePlacesSearchQuery={{
          // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
          rankby: 'distance',
        }}
        filterReverseGeocodingByTypes={[
          'locality',
          'administrative_area_level_3',
        ]} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
        debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
        renderLeftButton={() => (
          <Image
            source={require('@src/assets/images/map-pin.png')}
            style={{ width: 18, height: 26, marginTop: 12, marginLeft: 7 }}
          />
        )}
      />
    );
  }
}

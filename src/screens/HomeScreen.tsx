import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StyleSheet, View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppIntroSlider from 'react-native-app-intro-slider';
import colors from '@constants/Colors';

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  image: {
    width: 320,
    height: 320,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'transparent',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    color: 'white',
    backgroundColor: 'transparent',
    textAlign: 'center',
    marginBottom: 16,
  },
});

const slides = [
  {
    key: 'slide1',
    title: 'Anything delivered when you want it',
    text: 'You can ship anything from an envelope up to 3 pallets that are up to 3000 lbs.',
    icon: 'ios-cube',
    colors: [colors.secondary, colors.primary],
  },
  {
    key: 'slide2',
    title: 'On-demand',
    text: 'Access us anywhere, anytime from your smartphone or desktop with our on-demand delivery app.',
    icon: 'ios-options-outline',
    colors: [colors.secondary, colors.secondary],
  },
  {
    key: 'slide3',
    title: 'Professional drivers',
    text: 'Our Sprinter and Cargo Van drivers are the cream of the crop, and we have policies that go above and beyond industry minimums.',
    icon: 'ios-speedometer',
    colors: [colors.text, colors.text],
  },
];

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
    tabBarVisible: false,
  };

  _onDone = () => {
    // User finished the introduction. Show app.
    this.props.navigation.navigate('Ship');
  };

  _renderItem = (props) => (
    <LinearGradient
      style={[
        styles.mainContent,
        {
          paddingTop: props.topSpacer,
          paddingBottom: props.bottomSpacer,
          width: props.width,
          height: props.height,
        },
      ]}
      colors={props.colors}
      start={{ x: 0, y: 0.1 }}
      end={{ x: 0.1, y: 1 }}>
      <Ionicons
        style={{ backgroundColor: 'transparent' }}
        name={props.icon}
        size={200}
        color={colors.white}
      />
      <View>
        <Text style={styles.title}>{props.title}</Text>
        <Text style={styles.text}>{props.text}</Text>
      </View>
    </LinearGradient>
  );

  _renderDoneButton = () => {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.gray,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            color: colors.white,
            flex: 1,
            flexDirection: 'row',
            fontSize: 18,
            padding: 11,
          }}>
          Done
        </Text>
      </View>
    );
  };

  _renderNextButton = () => {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.gray,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            color: colors.white,
            flex: 1,
            flexDirection: 'row',
            fontSize: 18,
            padding: 11,
          }}>
          Next
        </Text>
      </View>
    );
  };

  render() {
    return (
      <AppIntroSlider
        slides={slides}
        renderItem={this._renderItem}
        bottomButton
        renderDoneButton={this._renderDoneButton}
        renderNextButton={this._renderNextButton}
        onDone={this._onDone}
      />
    );
  }
}

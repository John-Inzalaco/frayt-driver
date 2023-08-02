import React from 'react';
import { SafeAreaView } from 'react-navigation';
import { View } from 'native-base';
import { StyleSheet, Platform } from 'react-native';

export default function asScreenModal(Screen: any) {
  return (props: any) => (
    <SafeAreaView style={styles.safeView} forceInset={{ top: 'always' }}>
      <View style={styles.container}>
        <View style={styles.radius}>
          <Screen {...props} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  radius: {
    borderTopLeftRadius: Platform.OS === 'ios' ? 18 : 0,
    borderTopRightRadius: Platform.OS === 'ios' ? 18 : 0,
    overflow: 'hidden',
    flex: 1,
  },
  container: {
    marginTop: Platform.OS === 'ios' ? 25 : 0,
    shadowColor: 'black',
    shadowRadius: 6,
    shadowOpacity: 0.15,
    shadowOffset: {
      height: -6,
      width: 0,
    },
    flex: 1,
  },
  safeView: {
    flex: 1,
  },
  // header: {
  //     flex: 1,
  //     flexDirection: 'row',
  // }
});

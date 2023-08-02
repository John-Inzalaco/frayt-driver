import React from 'react';
import { CardField } from '@stripe/stripe-react-native';
import { View } from 'react-native';

export default function PaymentScreen() {
  return (
    <View>
      <CardField
        placeholder={{
          number: '4242 4242 4242 4242',
        }}
        cardStyle={{
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
        }}
        style={{
          width: '100%',
          height: 50,
          marginVertical: 10,
        }}
      />
    </View>
  );
}

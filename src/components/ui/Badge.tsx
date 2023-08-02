import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'native-base';

type Props = {
  selected: boolean;
  description: string;
  onPress: (option: number) => void;
};

export default class Badge extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  
  render() {
    const {selected, description, onPress} = this.props;

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(1)}>
        <View>
          <Text style={[styles.badge, selected && styles.selectedBadge]}> {description} </Text>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  selectedBadge: {
    fontWeight: "bold",
    color: "rgb(0, 117, 5)",
    borderColor: "rgb(162, 193, 163)",
    backgroundColor: "rgb(235, 248, 236)",
  },
  badge: {
    fontSize: 14,
    borderWidth: 2,
    marginRight: 5,
    marginBottom: 5,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontWeight: "bold",
    color: "rgb(88, 88, 88)",
    borderColor: "rgb(194, 194, 194)",
    backgroundColor: "rgb(245, 245, 245)",
  }
});
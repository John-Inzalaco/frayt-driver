import React from 'react';
import { uniqId } from '@lib/helpers';
import { InputAccessoryView, View, StyleSheet, Platform } from 'react-native';
import colors, { colorObjs } from '@constants/Colors';

type KeyboardAttachmentProps = {
  nativeID: string;
};

export default class KeyboardAttachment extends React.Component<KeyboardAttachmentProps> {
  static presets: Record<string, string> = {};

  render() {
    const { nativeID } = this.props;
    if (Platform.OS === 'ios') {
      return (
        <InputAccessoryView nativeID={nativeID}>
          <View style={styles.actionBar}>
            {/* <TouchableOpacity
                            onPress={this.clear.bind(this)}
                        >
                            <Text style={styles.inputAction}>Clear</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={this.blur.bind(this)}
                        >
                            <Text style={styles.inputAction}>Done</Text>
                        </TouchableOpacity> */}
          </View>
        </InputAccessoryView>
      );
    } else {
      return null;
    }
  }
}

const presets = {
  default: <KeyboardAttachment nativeID={uniqId()} />,
};

KeyboardAttachment.presets = {
  default: presets.default.props.nativeID,
};

const styles = StyleSheet.create({
  actionBar: {
    backgroundColor: colors.lightGray,
    borderTopWidth: 1,
    borderColor: colorObjs.lightGray.darken(0.05).toString(),
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

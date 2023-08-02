import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import colors from '@constants/Colors';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Intercom from 'react-native-intercom';

type Props = {
  navigation?: NavigationScreenProp<{}>;
};

type State = {
  unreadCount: number;
};

export default class ChatButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this._openChat = this._openChat.bind(this);

    this.state = {
      unreadCount: 0,
    };
  }

  componentDidMount() {
    Intercom.addEventListener(
      Intercom.Notifications.UNREAD_COUNT,
      this._onUnreadChange,
    );
  }

  componentWillUnmount() {
    Intercom.removeEventListener(
      Intercom.Notifications.UNREAD_COUNT,
      this._onUnreadChange,
    );
  }

  _openChat() {
    Intercom.displayMessenger();
  }

  _onUnreadChange = ({ count }: { count: number }) => {
    this.setState({ unreadCount: count });
  };

  renderCount() {
    const { unreadCount } = this.state;

    if (unreadCount) {
      return (
        <View style={styles.unread}>
          <Text style={styles.unreadText}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      );
    }
  }

  render() {
    return (
      <TouchableOpacity style={styles.button} onPress={this._openChat}>
        {this.renderCount()}
        <FontAwesome5
          name='question-circle'
          size={24}
          color={colors.white}
          style={styles.icon}
        />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: { marginRight: 12, flexDirection: 'row', paddingTop: 4, top: -2 },
  icon: {
    // transform: [{ rotateY: '180deg' }],
    zIndex: 1,
  },
  unread: {
    top: -4,
    right: '-40%',
    backgroundColor: 'red',
    paddingHorizontal: 5,
    height: 16,
    borderRadius: 8,
    display: 'flex',
    zIndex: 2,
  },
  unreadText: {
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
});

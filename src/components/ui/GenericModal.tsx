import React, { Component } from 'react';
import { Modal, Text, View, StyleSheet, Dimensions } from 'react-native';
import ActionButton from '@components/ui/ActionButton';
import colors from '@constants/Colors';

interface GenericModalProps {
  title: string;
  message?: string;
  actionText: string;
  actionCallback?: Function;
  cancelText?: string;
  cancelCallback?: Function;
  hideCancel: boolean;
  modalVisible: boolean;
}

interface GenericModalState {
  modalVisible: boolean;
}

export default class GenericModal extends Component<
  GenericModalProps,
  GenericModalState
> {
  static defaultProps = {
    cancelText: 'Cancel',
  };

  constructor(props: GenericModalProps) {
    super(props);
    this.state = {
      modalVisible: props.modalVisible,
    };
  }

  setModalVisible(visible: boolean) {
    this.setState({ modalVisible: visible });
  }

  _renderTitle() {
    const { title } = this.props;
    return (
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
    );
  }

  _renderMessage() {
    const { message } = this.props;
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.message}>{message}</Text>
      </View>
    );
  }

  _renderAction() {
    const { actionCallback, actionText } = this.props;
    return (
      actionText && (
        <ActionButton
          label={actionText}
          type='secondary'
          style={styles.button}
          onPress={() => {
            if (actionCallback != null) {
              actionCallback();
            }
            this.setModalVisible(false);
          }}
        />
      )
    );
  }

  _renderCancel() {
    const { cancelCallback, cancelText } = this.props;
    return (
      <ActionButton
        label={cancelText}
        type='default'
        style={styles.button}
        onPress={() => {
          if (cancelCallback != null) {
            cancelCallback();
          }
          this.setModalVisible(false);
        }}
      />
    );
  }

  render() {
    const { modalVisible } = this.state;
    const { title, hideCancel } = this.props;
    return (
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          this.setModalVisible(false);
        }}>
        <View style={styles.container}>
          <View style={styles.modal}>
            {title && this._renderTitle()}
            {this._renderMessage()}
            <View style={styles.buttonsContainer}>
              {this._renderAction()}
              {!hideCancel && this._renderCancel()}
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.2)',
    height: deviceHeight,
  },
  modal: {
    display: 'flex',
    backgroundColor: colors.offWhite,
    height: 200,
    width: 300,
    maxWidth: deviceWidth,
    justifyContent: 'space-between',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
  },
  button: {
    flex: 1,
    marginBottom: 0,
  },
  titleContainer: {
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  title: {
    alignSelf: 'center',
    color: colors.primaryText,
    fontSize: 17,
    marginBottom: 6,
    marginTop: 6,
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 10,
    alignItems: 'flex-start',
  },
  message: {
    fontSize: 14,
  },
});

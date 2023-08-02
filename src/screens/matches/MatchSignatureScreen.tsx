import React from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Text } from 'react-native';
import { Container, Input, Label, Form, Item } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import SignatureCapture, {
  SaveEventParams,
} from 'react-native-signature-capture';
import ActionButton from '@components/ui/ActionButton';
import colors from '@constants/Colors';
import { signMatch } from '@actions/matchAction';
import { matchActionTypes } from '@actions/types/matchTypes';
import Orientation from 'react-native-orientation';
import {
  withNavigationFocus,
  NavigationScreenProp,
  NavigationFocusInjectedProps,
} from 'react-navigation';
import { RootState } from '@src/reducers';
import Match from '@models/Match';
import MatchStop, { SignatureType } from '@models/MatchStop';
import MatchPhotoCropper from '@components/ui/MatchPhotoCropper';
import { Image } from 'react-native-image-crop-picker';

type NavigationParams = {
  id: string;
  stopId: string;
};

type NavigationState = {
  params: NavigationParams;
};

type Props = {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
} & ConnectedProps<typeof connector> &
  NavigationFocusInjectedProps;

type State = {
  matchId: string;
  stopId: string;
  properOrientation: boolean;
  receiverName: string;
  match: Nullable<Match>;
  stop: Nullable<MatchStop>;
  signaturePhoto: Nullable<Image>;
};

class MatchSignatureScreen extends React.Component<Props, State> {
  signatureRef: Nullable<SignatureCapture> = null;

  constructor(props: Props) {
    super(props);

    const { id: matchId, stopId } = this.props.navigation.state.params;
    const match = this.findMatch(matchId);
    const stop = match?.stops.find(({ id }) => id === stopId) || null;
    this.state = {
      matchId,
      stopId,
      properOrientation: false,
      receiverName: '',
      match,
      stop,
      signaturePhoto: null,
    };
  }

  async lockScreen(isFocused = this.props.isFocused) {
    if (isFocused) {
      await Orientation.unlockAllOrientations();
      await Orientation.lockToLandscape();
      setTimeout(() => {
        this.setState({ properOrientation: true });
      }, 200);
    } else {
      await Orientation.unlockAllOrientations();
      await Orientation.lockToPortrait();
    }
  }

  componentDidMount() {
    if (!this.isSignaturePhoto()) {
      this.lockScreen();
    }
  }

  componentWillUnmount() {
    this.lockScreen(false);
  }

  async componentDidUpdate(prevProps: Props) {
    const { matches, navigation } = this.props;
    const { stopId, matchId } = this.state;
    const { params } = navigation.state;
    let state: Partial<State> = {};

    if (params.stopId !== stopId) state.stopId = params.stopId;
    if (params.id !== matchId) state.matchId = params.id;

    if (prevProps.matches !== matches) {
      state.match = this.findMatch(params.matchId);
      state.stop = state.match?.stops.find(({ id }) => id === stopId) || null;
      await this.setState(state as State);
    }
  }

  async componentWillUpdate(nextProps: Props) {
    const { isFocused } = this.props;

    if (nextProps.isFocused !== isFocused) {
      this.lockScreen(nextProps.isFocused);
    }
  }

  private isSignaturePhoto(): boolean {
    return this.state.stop?.signature_type === SignatureType.Photo;
  }
  findMatch(matchId = this.state.matchId) {
    const { matches } = this.props;

    const match = matches.find(matchId);

    return match;
  }

  saveSign() {
    this.signatureRef?.saveImage();
  }

  resetSign() {
    this.signatureRef?.resetImage();
  }

  cancel() {
    const { navigation } = this.props;

    navigation.goBack();
  }

  async signMatch(result: SaveEventParams) {
    const { dispatch, navigation } = this.props;
    const { receiverName, matchId, stopId } = this.state;
    const isSaved = await dispatch<any>(
      signMatch(matchId, stopId, result, receiverName),
    );

    if (isSaved) {
      this.lockScreen(false);
      navigation.goBack();
    }
  }

  renderContent() {
    const {
      match,
      stop,
      matchId,
      properOrientation,
      receiverName,
      signaturePhoto,
    } = this.state;
    const {
      updatingMatchStatus: { [matchId]: updatingMatchStatus },
      updatingEnRouteMatch: { [matchId]: isUpdating },
      isFocused,
    } = this.props;
    const disabled = !!(updatingMatchStatus || isUpdating);
    const isSignaturePhoto = this.isSignaturePhoto();
    const receiverNamePh = isSignaturePhoto
      ? 'Enter Printed Name here'
      : 'Enter here';

    if (match && !match.isSigned()) {
      return [
        <KeyboardAvoidingView
          enabled
          behavior='position'
          style={styles.keyboardView}>
          <Form style={{...styles.fullWidth, paddingTop: 20}}>
            <Item inlineLabel style={styles.formGroup}>
              {!isSignaturePhoto && (
                <Label style={styles.label}>Printed Name</Label>
              )}
              <Input
                placeholder={receiverNamePh}
                placeholderTextColor={colors.gray}
                style={styles.input}
                returnKeyType='done'
                onChangeText={(receiverName) => this.setState({ receiverName })}
              />
            </Item>
          </Form>
          {stop?.signature_instructions && (
            <Text>{stop.signature_instructions}</Text>
          )}
        </KeyboardAvoidingView>,
        <View style={styles.signatureWrapper}>
          {!isSignaturePhoto && (
            <>
              <View style={styles.signatureWrapper}>
                {isFocused && properOrientation && (
                  <SignatureCapture
                    style={styles.signature}
                    ref={(signature) => (this.signatureRef = signature)}
                    onSaveEvent={(result) => {
                      this.signMatch(result);
                    }}
                    saveImageFileInExtStorage={false}
                    showNativeButtons={false}
                    showTitleLabel={false}
                    viewMode='portrait'
                  />
                )}
              </View>
              <View style={styles.actionWrapper}>
                <ActionButton
                    size='large'
                    hollow
                    hollowBackground={colors.white}
                    type='danger'
                    style={styles.actionButton}
                    label='Cancel'
                    onPress={this.cancel.bind(this)}
                />
                <ActionButton
                  size='large'
                  type='inverse'
                  hollow
                  hollowBackground={colors.white}
                  style={styles.actionButton}
                  disabled={disabled}
                  label='Clear'
                  onPress={this.resetSign.bind(this)}
                />
                <ActionButton
                    size='large'
                    type='secondary'
                    style={styles.actionButton}
                    loading={updatingMatchStatus === matchActionTypes.signed}
                    disabled={disabled || !receiverName}
                    label='Done'
                    onPress={this.saveSign.bind(this)}
                />
              </View>
            </>
          )}

          {isSignaturePhoto && (
            <>
              <View style={styles.signatureWrapper}>
                <MatchPhotoCropper
                  photo={this.state.signaturePhoto}
                  altIcon='box-open'
                  disabled={disabled}
                  onPhotoChange={(image: Image) => {
                    this.setState({ signaturePhoto: image });
                  }}
                />
              </View>
              <View style={styles.actionWrapper}>
                <ActionButton
                    size='large'
                    hollow
                    hollowBackground={colors.white}
                    type='danger'
                    style={styles.actionButton}
                    label='Cancel'
                    onPress={this.cancel.bind(this)}
                />
                <ActionButton
                  size='large'
                  type='secondary'
                  style={styles.actionButton}
                  loading={updatingMatchStatus === matchActionTypes.signed}
                  disabled={disabled || !receiverName || !signaturePhoto?.data}
                  label='Done'
                  onPress={() => {
                    if (signaturePhoto?.data) {
                      const { path, data } = signaturePhoto;
                      this.signMatch({ pathName: path, encoded: data });
                    }
                  }}
                />
              </View>
            </>
          )}
        </View>,
      ];
    } else {
      const { navigation } = this.props;

      return (
        <View>
          <ActionButton
            label='Go Back'
            type='secondary'
            size='large'
            block
            onPress={() => {
              navigation.goBack();
            }}
          />
        </View>
      );
    }
  }

  render() {
    return <Container style={styles.root}>{this.renderContent()}</Container>;
  }
}

const styles = StyleSheet.create({
  actionWrapper: {
    flexDirection: 'row',
    width: '100%',
    flexShrink: 0,
  },
  signature: {
    borderColor: colors.signature,
    borderWidth: 1,
    height: '100%',
    flex: 1,
    marginTop: 13,
    marginBottom: 15,
  },
  header: {
    flexShrink: 0,
  },
  root: {
    flex: 1,
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: colors.background,
    width: '100%',
  },
  keyboardView: {
    flexShrink: 0,
    alignItems: 'flex-start',
    width: '100%',
  },
  signatureWrapper: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
    flexDirection: 'row',
  },
  formGroup: {
    width: '100%',
    maxHeight: 40,
    marginBottom: 10,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  input: {
    width: '100%',
    fontSize: 22,
  },
  label: {
    color: colors.darkGray,
    fontWeight: 'bold',
    fontSize: 22,
  },
  actionButton: {
    marginBottom: 10,
    marginHorizontal: 10,
  },
  headerText: {
    textAlign: 'center',
    fontSize: 23,
    fontWeight: '700',
  },
  noticeText: {
    color: colors.gray,
    textAlign: 'center',
    width: '80%',
  },
});

const connector = connect(({ matchReducer }: RootState) => ({
  updatingEnRouteMatch: matchReducer.updatingEnRouteMatch,
  updatingMatchStatus: matchReducer.updatingMatchStatus,
  matches: matchReducer.matches,
}));

export default connector(withNavigationFocus(MatchSignatureScreen));

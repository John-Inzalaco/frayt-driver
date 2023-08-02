import React, { Component } from 'react';
import { StyleSheet, Image, ActivityIndicator } from 'react-native';
import { View } from 'native-base';
import ActionButton from '@components/ui/ActionButton';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import colors from '@constants/Colors';
import { connect } from 'react-redux';
import PhotoCropperHelper, { PhotoCropperProps } from '@lib/PhotoCropperHelper';

class MatchPhotoCropper extends Component<PhotoCropperProps> {
  constructor(props: PhotoCropperProps) {
    super(props);
    this.takePhoto = this.takePhoto.bind(this);
    this.selectPhoto = this.selectPhoto.bind(this);

    this.state = {
      loading: false,
    };
  }

  async takePhoto() {
    this.setState({ loading: true });
    await PhotoCropperHelper.takePhoto(this.props);
    this.setState({ loading: false });
  }

  async selectPhoto() {
    this.setState({ loading: true });
    await PhotoCropperHelper.selectPhoto(this.props);
    this.setState({ loading: false });
  }

  renderPhoto() {
    const { loading } = this.state;
    const { photo, photoStyle, activePhotoStyle, currentPhoto, altIcon } =
      this.props;
    const photoStyles = [
      styles.photo,
      photoStyle,
      !loading &&
        (photo || currentPhoto) && [styles.activePhoto, activePhotoStyle],
    ];

    let photoBlock = [];
    if (loading) {
      photoBlock.push(
        <View style={photoStyles}>
          <ActivityIndicator color={colors.gray} size='large' />
        </View>,
      );
    } else if (photo || currentPhoto) {
      const uri = PhotoCropperHelper.getUri(photo, currentPhoto);

      photoBlock.push(<Image source={{ uri }} style={photoStyles} />);
    } else {
      photoBlock.push(
        <View style={photoStyles}>
          <FontAwesome5 name={altIcon} solid style={styles.placeholderIcon} />
        </View>,
      );
    }

    return photoBlock;
  }

  render() {
    const { disabled } = this.props;
    return (
      <View style={styles.wrapper}>
        <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
          {this.renderPhoto()}
        </View>
        <View style={styles.actionWrapper}>
          <ActionButton
            label='Select From Library'
            type='inverse'
            hollow
            hollowBackground={colors.white}
            block
            shrink
            style={styles.largeButton}
            onPress={this.selectPhoto}
            disabled={disabled}
          />
          <ActionButton
            renderLabel={(style) => (
              <FontAwesome5 name='camera' style={style} />
            )}
            type='secondary'
            block
            shrink
            onPress={this.takePhoto}
            disabled={disabled}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  actionWrapper: {
    flexDirection: 'row',
    width: '80%',
    alignSelf: 'center',
  },
  largeButton: {
    flexGrow: 1,
    marginRight: 8,
  },
  photo: {
    width: '100%',
    height: 180,
    maxWidth: 300,
    marginBottom: 20,
    alignSelf: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: colors.lightGray,
  },
  activePhoto: {
    borderColor: colors.lightGray,
    alignSelf: 'auto',
    width: undefined,
    flex: 1,
  },
  placeholderIcon: {
    color: colors.gray,
    fontSize: 90,
  },
});

export default connect((state: any) => ({
  permissions: state.appReducer.permissions,
}))(MatchPhotoCropper);

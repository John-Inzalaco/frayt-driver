import React, { Component } from 'react';
import { StyleSheet, Image } from 'react-native';
import { View } from 'native-base';
import ActionButton from '@components/ui/ActionButton';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import colors from '@constants/Colors';
import { connect } from 'react-redux';
import PhotoCropperHelper, { PhotoCropperProps } from '@lib/PhotoCropperHelper';

class PhotoCropper extends Component<PhotoCropperProps> {
  constructor(props: PhotoCropperProps) {
    super(props);
    this.takePhoto = this.takePhoto.bind(this);
    this.selectPhoto = this.selectPhoto.bind(this);
  }

  takePhoto() {
    PhotoCropperHelper.takePhoto(this.props, {
      useFrontCamera: true,
      cropperCircleOverlay: true,
    });
  }

  selectPhoto() {
    PhotoCropperHelper.selectPhoto(this.props, {});
  }

  renderPhoto() {
    const { photo, photoStyle, activePhotoStyle, currentPhoto } = this.props;
    const photoStyles = [
      styles.photo,
      photoStyle,
      (photo || currentPhoto) && [styles.activePhoto, activePhotoStyle],
    ];

    let photoBlock = [];

    if (photo || currentPhoto) {
      const uri = PhotoCropperHelper.getUri(photo, currentPhoto);

      photoBlock.push(<Image source={{ uri }} style={photoStyles} />);
    } else {
      photoBlock.push(
        <View style={photoStyles}>
          <FontAwesome5 name='user' solid style={styles.placeholderIcon} />
        </View>,
      );
    }

    return photoBlock;
  }

  render() {
    return (
      <View style={styles.wrapper}>
        {this.renderPhoto()}
        <View style={styles.actionWrapper}>
          <ActionButton
            label='Select From Library'
            type='gray'
            size='large'
            block
            shrink
            style={styles.largeButton}
            onPress={this.selectPhoto}
          />
          <ActionButton
            renderLabel={(style) => (
              <FontAwesome5 name='camera' style={style} />
            )}
            type='secondary'
            size='large'
            block
            shrink
            onPress={this.takePhoto}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    // flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  actionWrapper: {
    flexDirection: 'row',
  },
  largeButton: {
    flexGrow: 1,
    marginRight: 8,
  },
  photo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    alignSelf: 'center',
    borderRadius: 75,
    borderWidth: 4,
    borderColor: colors.gray,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: colors.lightGray,
  },
  activePhoto: {
    borderColor: colors.secondary,
  },
  placeholderIcon: {
    color: colors.gray,
    fontSize: 110,
    marginBottom: -12,
  },
});

export default connect((state) => ({
  permissions: state.appReducer.permissions,
}))(PhotoCropper);

import React from 'react';
import PhotoCropperHelper from '@lib/PhotoCropperHelper';
import { Icon, Label, Text, View } from 'native-base';
import { StyleSheet, TextInput, Image } from 'react-native';
import * as CropPicker from 'react-native-image-crop-picker';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { AnyAction, Dispatch } from 'redux';
import { PermissionTypes } from '@reducers/appReducer';
import colors from '@constants/Colors';
import { Options as CameraOptions } from 'react-native-image-crop-picker';

type Props = {
  onChange: (data: string | null) => void;
  value: string | null;
  error?: null | string;
  label: string;
  dispatch?: Dispatch<AnyAction>;
  permissions?: PermissionTypes;
  cameraOptions?: Partial<CameraOptions>;
};

export function PhotoInput({
  onChange,
  value,
  error,
  label,
  dispatch,
  permissions,
  cameraOptions,
}: Props) {
  const { showActionSheetWithOptions } = useActionSheet();
  cameraOptions = cameraOptions || {};

  const selectPhoto = async () => {
    const options = ['Take photo', 'Select from Camera Roll', 'Cancel'];
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (selectedIndex: number | undefined) => {
        switch (selectedIndex) {
          case undefined:
            break;
          case 0:
            PhotoCropperHelper.takePhoto(props, cameraOptions);
            break;

          case 1:
            PhotoCropperHelper.selectPhoto(props, cameraOptions);
            break;

          case cancelButtonIndex:
          // Canceled
        }
      },
    );

    const props = {
      dispatch: dispatch,
      permissions: permissions,
      onPhotoChange: (photo: CropPicker.Image | CropPicker.Image[]) => {
        let data: string | null = null;
        if (Array.isArray(photo)) {
          data = photo[0]?.data || null;
        } else {
          data = photo.data;
        }

        onChange(data);
      },
    };
  };

  return (
    <View style={styles.inputImageContainer} onTouchEnd={selectPhoto}>
      <Label style={styles.inputLabel}>{label}</Label>
      {value ? (
        <View style={[styles.inputText, styles.inputImageWrapper]}>
          <Image
            style={styles.inputImage}
            source={{
              uri: `data:image/png;base64,${value}`,
            }}
          />
        </View>
      ) : (
        <TextInput style={styles.inputText} editable={false} />
      )}
      <Icon style={styles.icon} name='attach' />
      {error && <Text>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  inputImage: {
    height: '100%',
    width: 72,
  },
  inputImageWrapper: {
    padding: 0,
  },
  inputImageContainer: {
    justifyContent: 'center',
    top: 0,
    marginBottom: 15,
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: 27,
    color: '#8F9BB3',
  },
  inputText: {
    backgroundColor: '#C5CEE0',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 4,
    width: '100%',
    height: 40,
    alignSelf: 'stretch',
    flexGrow: 0,
    marginTop: 8,
    padding: 8,
  },
  inputLabel: {
    height: 16,
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    color: '#DDDDDD',
    alignSelf: 'stretch',
  },
});

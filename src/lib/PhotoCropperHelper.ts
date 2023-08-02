import {
  requestPermission,
  checkPermissions,
  PermissionType,
} from '@actions/appAction';
import ImagePicker, {
  Options as CameraOptions,
  Image,
} from 'react-native-image-crop-picker';
import { openSettings } from '@lib/settings';

const defaultSettings: Partial<CameraOptions> = {
  mediaType: 'photo',
  includeBase64: true,
  compressImageQuality: 0.7,
  width: 2560,
  height: 1440,
  cropping: true,
  forceJpg: true,
};

export default class PhotoCropperHelper {
  static async takePhoto(
    props: PhotoCropperProps,
    cameraSettings: Partial<CameraOptions> = {},
  ): Promise<void> {
    const settings: CameraOptions = {
      ...defaultSettings,
      ...cameraSettings,
    };
    const { onPhotoChange, permissions, dispatch } = props;
    try {
      if (!permissions || !dispatch) {
        throw new Error(
          'Must pass in permissions and dispatch to take a photo',
        );
      }
      await dispatch(checkPermissions());

      if (permissions.camera) {
        const photo = await ImagePicker.openCamera(settings);

        onPhotoChange && onPhotoChange(photo);
      } else if (permissions.hasAskedCamera) {
        openSettings(
          'To take a picture, Frayt needs camera permissions.  Enable permissions in the settings for this app.',
        );
      } else {
        await dispatch(
          requestPermission(
            PermissionType.camera,
            'To take a picture, Frayt needs camera permissions.',
          ),
        );
      }
    } catch (e) {
      console.warn(e);
    }
  }

  static async selectPhoto(
    props: Pick<PhotoCropperProps, 'onPhotoChange'>,
    imageSettings: Partial<CameraOptions> = {},
  ): Promise<void> {
    const settings: CameraOptions = {
      ...defaultSettings,
      ...imageSettings,
    };

    const { onPhotoChange } = props;

    try {
      const photo = await ImagePicker.openPicker(settings);

      onPhotoChange && onPhotoChange(photo);
    } catch (e) {
      console.warn(e);
    }
  }

  static getUri(photo: Nullable<Image>, photoUrl: Nullable<string>): string {
    return photo ? `data:${photo.mime};base64,${photo.data}` : photoUrl || '';
  }
}

export interface PhotoCropperProps {
  onPhotoChange?: Nullable<(photo: Image | Image[]) => void>;
  permissions?: {
    hasAskedCamera?: boolean;
    camera?: boolean;
  };
  dispatch?: Function;
  [x: string]: any;
}

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Image as Img,
  TouchableOpacity,
} from 'react-native';
import { Container, Text, Toast } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProp } from 'react-navigation';
import { RootState } from '@reducers/index';
import { updateRemoteComponent } from '@components/RemoteComponent';
import FormNavigation from '@components/ui/FormNavigation';
import PhotoCropperHelper, { PhotoCropperProps } from '@lib/PhotoCropperHelper';
import { Image } from 'react-native-image-crop-picker';
import { saveAccountUpdates } from '@actions/userAction';
import { humanReadableKey } from '@lib/error/FormikSubmissionErrors';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { ApplySteps } from '@src/navigation/ApplyNavigator';

type ImageType =
  | 'drivers_side'
  | 'passengers_side'
  | 'back'
  | 'front'
  | 'cargo_area';
type ImageTypeTuple = [ImageType, string];
type ScreenProps = {
  navigation: NavigationScreenProp<{}>;
} & ConnectedProps<typeof connector>;

const { width } = Dimensions.get('window');
const FrontImage = require('../../assets/images/vehicles/front.png');
const BackImage = require('../../assets/images/vehicles/back.png');
const DriversSideImage = require('../../assets/images/vehicles/driver-side.png');
const PassengersSideImage = require('../../assets/images/vehicles/passenger-side.png');
const CargoAreaImage = require('../../assets/images/vehicles/cargo-area.png');
const imageTypes: ImageTypeTuple[] = [
  ['back', 'Back (Exterior)'],
  ['front', 'Front (Exterior)'],
  ['drivers_side', 'Driver Side (Exterior)'],
  ['passengers_side', 'Passenger Side (Exterior)'],
  ['cargo_area', 'Cargo Area (Interior)'],
];

const imagePlaceholders = {
  drivers_side: DriversSideImage,
  passengers_side: PassengersSideImage,
  back: BackImage,
  front: FrontImage,
  cargo_area: CargoAreaImage,
};

function VehiclePhotosScreen(props: ScreenProps) {
  const {
    navigation,
    editingUserAccount,
    dispatch,
    current_user,
    permissions,
  } = props;
  const [images, setImage] = useState({
    drivers_side: null,
    back: null,
    passengers_side: null,
    front: null,
    cargo_area: null,
  });
  const { showActionSheetWithOptions } = useActionSheet();

  useEffect(() => updateFooter());

  const disableNext =
    !images.cargo_area ||
    !images.front ||
    !images.passengers_side ||
    !images.back ||
    !images.drivers_side ||
    editingUserAccount;

  const handleSubmit = async () => {
    const success = await dispatch<any>(
      saveAccountUpdates({ vehicle_photos: images }),
    );

    if (success) {
      const { vehicle } = current_user;
      if (vehicle?.vehicle_class == 4) {
        navigation.navigate('Dat');
      } else {
        navigation.navigate('BackgroundCheck');
      }
    }
  };

  const selectOrTakePhoto = async (
    params: PhotoCropperProps,
  ): Promise<void> => {
    const options = ['Take photo', 'Select from Camera Roll', 'Cancel'];
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (selectedIndex: number | undefined) => {
        switch (selectedIndex) {
          case undefined:
            break;
          case 0:
            await PhotoCropperHelper.takePhoto(params, { cropping: false });
            break;

          case 1:
            await PhotoCropperHelper.selectPhoto(params, { cropping: false });
            break;

          case cancelButtonIndex:
          // Canceled
        }
      },
    );
  };

  const selectPhoto = async (type: ImageType) => {
    const params = {
      onPhotoChange: (image: Image): void => {
        setImage({ ...images, [type]: image });
      },
      dispatch,
      permissions,
    } as PhotoCropperProps;

    await selectOrTakePhoto(params);
  };

  const renderImage = (type: ImageType): any => {
    const image = images[type];
    if (image) {
      const uri = PhotoCropperHelper.getUri(image, null);

      return <Img source={{ uri }} style={styles.photo} />;
    }

    return <Img source={imagePlaceholders[type]} style={styles.placeholder} />;
  };

  const renderPhotoBox = ([type, desc]: ImageTypeTuple) => {
    return (
      <View style={styles.photoBox} key={`vehicle-photo-${type}`}>
        <Text style={styles.photoHeader} key={`vehicle-photo-${type}-caption`}>
          {desc}
        </Text>
        <TouchableOpacity
          key={`vehicle-photo-${type}-content`}
          onPress={() => selectPhoto(type)}
          style={styles.photoWrapper}>
          {renderImage(type)}
        </TouchableOpacity>
      </View>
    );
  };

  const displayErrors = () => {
    if (!disableNext) return;

    let message = '';
    for (const [key, value] of Object.entries(images)) {
      if (!value) {
        message = `${humanReadableKey(key)} Photo is missing\n${message}`;
      }
    }

    Toast.show({ text: message, duration: 3000 });
  };

  const updateFooter = () => {
    updateRemoteComponent(
      'fixed-footer',
      <FormNavigation
        nextAction={handleSubmit}
        backAction={() => {
          navigation.navigate(ApplySteps[ApplySteps.VehiclePhotos - 1]);
        }}
        loading={editingUserAccount}
        disabled={disableNext}
        navigation={navigation}
        disabledAction={displayErrors}
      />,
      { navigation },
    );
  };

  return (
    <Container>
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.wrapper}>
        <View style={styles.center}>
          <Text style={styles.header}>Vehicle Photos</Text>
          <View style={styles.body}>
            <Text style={styles.disclaimerText}>
              Make sure that your license plate is clearly visible in the Back
              (Exterior) photo.
            </Text>
          </View>
          <View style={styles.photosContainer}>
            {imageTypes.map(renderPhotoBox)}
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.secondary,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: colors.secondary,
  },
  center: {
    width: width,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  body: {
    marginTop: 16,
    marginBottom: 15,
  },
  disclaimerText: {
    color: colors.white,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 20,
  },
  header: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 32,
    color: colors.secondaryText,
    marginBottom: 15,
  },
  photosContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  photoBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    height: 137,
    width: '48%',
    marginBottom: '4%',
  },
  photoWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    height: 113,
    width: '100%',
    justifyContent: 'center',
    padding: 0,
    borderColor: '#151A30',
    borderStyle: 'solid',
  },
  placeholder: {
    height: 113,
    width: 177,
  },
  photoHeader: {
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 16,
    textTransform: 'uppercase',
    color: colors.lightGray,
    height: 16,
    marginBottom: 8,
  },
  photo: {
    borderWidth: 0,
    borderRadius: 4,
    height: '100%',
    width: '100%',
    padding: 0,
  },
});

const connector = connect((state: RootState) => ({
  editingUserAccount: state.userReducer.editingUserAccount,
  current_user: state.userReducer.user,
  permissions: state.appReducer.permissions,
}));

export default connector(VehiclePhotosScreen);

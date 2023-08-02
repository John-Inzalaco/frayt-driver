import React from 'react';
import { Alert, StyleSheet, SafeAreaView } from 'react-native';
import {
  NavigationFocusInjectedProps,
  NavigationScreenProp,
} from 'react-navigation';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '@reducers/index';
import { Picker, Text, View, Item, Icon } from 'native-base';
import { CameraKitCameraScreen } from 'react-native-camera-kit';
import colors from '@constants/Colors';
import { sendBarcodes } from '@actions/matchAction';
import { TouchableOpacity } from 'react-native-gesture-handler';
import CaptureMissingBarcodes from '@components/CaptureMissingBarcodes';
import Match from '@models/Match';
import { NewBarcodeReading } from '@models/BarcodeReading';

type NavigationParams = {
  match: Match;
  stop_id: string;
  barcode_readings: NewBarcodeReading[];
};

type NavigationState = {
  params: NavigationParams;
};

type Props = {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
} & ConnectedProps<typeof connector> &
  NavigationFocusInjectedProps;

type State = {
  barcode_readings: NewBarcodeReading[];
  capture_mode: boolean;
  scanning: boolean;
  activeAlert: boolean;
  toScan: string;
};

type CameraButtonEvent = {
  type: string;
  captureImages: CaptureImage[];
};

type CaptureImage = {
  uri: string;
};

enum ScanEnum {
  QUICK,
  UNSPECIFIED,
}

class ScanBarcodesScreen extends React.Component<Props, State> {
  camera: any | undefined;

  constructor(props: Props) {
    super(props);

    const { barcode_readings } = this.props.navigation.state.params;

    this.camera = React.createRef();

    this.state = {
      activeAlert: false,
      scanning: true,
      capture_mode: false,
      barcode_readings: barcode_readings ? barcode_readings : [],
      toScan: this.toScanDefault(barcode_readings),
    };

    this._onDonePressed = this._onDonePressed.bind(this);
    this._cancel = this._cancel.bind(this);
    this._dismissBarcodeAlert = this._dismissBarcodeAlert.bind(this);
    this._completeScanning = this._completeScanning.bind(this);
  }

  toScanDefault(barcode_readings: NewBarcodeReading[]): string {
    return this._hasItemWIithBarcode(barcode_readings)
      ? 'Quick Scan'
      : barcode_readings[0].item.id;
  }

  _hasItemWIithBarcode(barcode_readings: NewBarcodeReading[]): boolean {
    return barcode_readings.some(
      (r) =>
        r.item.barcode !== null &&
        r.item.barcode !== undefined &&
        r.item.barcode !== '',
    );
  }

  _itemsWithBarcode(
    barcode_readings: NewBarcodeReading[],
  ): NewBarcodeReading[] {
    return barcode_readings.filter(
      (r) =>
        r.item.barcode !== null &&
        r.item.barcode !== undefined &&
        r.item.barcode !== '',
    );
  }

  onToScanChange(value: string) {
    this.setState({ toScan: value });
  }

  _onDonePressed() {
    const itemsRemaining = this._remainingItems(true);
    if (itemsRemaining.length <= 0) {
      // No barcodes missing
      this._completeScanning();
    } else if (itemsRemaining.length > 0) {
      Alert.alert(
        'Missing Barcodes',
        'Not all barcodes are scanned. Please take a photo of each item that could not be scanned, or continue scanning.',
        [
          {
            text: 'Continue Scanning',
          },
          {
            text: 'Missing Barcodes',
            onPress: () => {
              this.setState({ scanning: false, capture_mode: true });
            },
          },
        ],
      );
    }
  }

  async _completeScanning() {
    const { dispatch, navigation } = this.props;
    const { barcode_readings } = this.state;
    const { match, stop_id } = navigation.state.params;

    await dispatch<any>(sendBarcodes(match.id, barcode_readings));
    this.props.navigation.goBack();
  }

  onBottomButtonPressed(event: CameraButtonEvent) {
    switch (event.type?.toLowerCase()) {
      case 'left':
        this._onDonePressed();
        break;
      default:
        break;
    }
  }

  _dismissBarcodeAlert() {
    this.setState({ scanning: true, activeAlert: false });
  }

  async _successfulScan(
    reading_index: number,
    scanned: string,
    scan_mode: ScanEnum,
  ) {
    const { barcode_readings } = this.state;
    barcode_readings[reading_index].state = 'captured';
    barcode_readings[reading_index].barcode = scanned;

    await this.setState({
      barcode_readings,
    });

    const unspecified_items = this._remainingUnspecifiedBarcodeItems();
    let nextToScan =
      unspecified_items.length > 0
        ? unspecified_items[0].item.id
        : 'Quick Scan';

    switch (scan_mode) {
      case ScanEnum.QUICK:
        if (this._remainingQuickScanBarcodeItems().length <= 0)
          this.setState({ toScan: nextToScan });
        break;
      case ScanEnum.UNSPECIFIED:
        this.setState({ toScan: nextToScan });
        break;
    }

    Alert.alert(
      'Barcode Scanned',
      `${this._remainingItems(true).length} items left to scan.`,
      [
        {
          text: 'OK',
          onPress: this._dismissBarcodeAlert,
        },
      ],
    );
  }

  async _massScan(scanned: string) {
    const { barcode_readings } = this.state;
    // set to captured if barcodes match
    // else throw error alert

    const reading_index = barcode_readings.findIndex(
      (r) => r.item.barcode === scanned && r.state !== 'captured',
    );

    if (reading_index === -1) {
      Alert.alert(
        'Invalid Barcode',
        `Could not find an item with this barcode: ${scanned}`,
        [
          {
            text: 'OK',
            onPress: this._dismissBarcodeAlert,
          },
        ],
      );
      return;
    }

    await this._successfulScan(reading_index, scanned, ScanEnum.QUICK);
  }

  async _itemScan(scanned: string) {
    const { barcode_readings, toScan } = this.state;
    const reading_index = barcode_readings.findIndex(
      (r) => r.item.id === toScan,
    );

    if (reading_index === -1) return;

    if (barcode_readings[reading_index].item.barcode === scanned) {
      await this._successfulScan(reading_index, scanned, ScanEnum.UNSPECIFIED);
    } else if (
      !barcode_readings[reading_index].item.barcode ||
      barcode_readings[reading_index].item.barcode === ''
    ) {
      await this._successfulScan(reading_index, scanned, ScanEnum.UNSPECIFIED);
    } else {
      Alert.alert(
        'Invalid Barcode',
        `The scanned barcode does not match the barcode assigned to this item: ${scanned}`,
        [
          {
            text: 'OK',
            onPress: this._dismissBarcodeAlert,
          },
        ],
      );
    }
  }

  _onReadCode(event: any) {
    const { barcode_readings: readings, activeAlert, toScan } = this.state;

    if (activeAlert) return;

    const readBarcode = event.nativeEvent.codeStringValue;
    this.setState({ scanning: false, activeAlert: true });

    if (toScan === 'Quick Scan') {
      this._massScan(readBarcode);
    } else {
      this._itemScan(readBarcode);
    }
  }

  _barcodePickerChoices(barcode_readings: NewBarcodeReading[]): JSX.Element[] {
    const pickerChoices = [];
    if (this._hasItemWIithBarcode(barcode_readings)) {
      pickerChoices.push(<Picker.Item label='Quick Scan' value='Quick Scan' />);
    }

    barcode_readings.forEach((r, idx) =>
      pickerChoices.push(
        <Picker.Item
          label={r.item.description ? r.item.description : `Item #${idx + 1}`}
          value={r.item.id}
        />,
      ),
    );
    return pickerChoices;
  }

  _remainingItems(toCapture: boolean): NewBarcodeReading[] {
    const { barcode_readings } = this.state;
    return barcode_readings.filter((r) =>
      toCapture
        ? r.state !== 'captured' && !r.photo
        : r.state === 'captured' || r.photo,
    );
  }

  _remainingQuickScanBarcodeItems(): NewBarcodeReading[] {
    const { barcode_readings } = this.state;
    return barcode_readings.filter(
      (r) => r.item.barcode && r.state !== 'captured' && !r.photo,
    );
  }

  _remainingUnspecifiedBarcodeItems(): NewBarcodeReading[] {
    const { barcode_readings } = this.state;
    return barcode_readings.filter(
      (r) => !r.item.barcode && r.state !== 'captured' && !r.photo,
    );
  }

  _cancel() {
    this.props.navigation.goBack();
  }

  render() {
    const { scanning, barcode_readings, toScan, capture_mode } = this.state;

    return (
      <SafeAreaView style={styles.view}>
        <View style={styles.topControls}>
          <TouchableOpacity onPress={this._cancel} style={styles.backButton}>
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Item picker style={styles.pickerWrapper}>
            <Text style={{ color: colors.offWhite }}>Currently Scanning:</Text>
            <Picker
              mode='dropdown'
              iosIcon={<Icon name='chevron-down' style={styles.pickerIcon} />}
              style={styles.picker}
              textStyle={styles.pickerText}
              placeholderIconColor='#007aff'
              selectedValue={this.state.toScan}
              onValueChange={this.onToScanChange.bind(this)}>
              {this._barcodePickerChoices(barcode_readings)}
            </Picker>
          </Item>
        </View>
        {toScan === 'Quick Scan' ? (
          <Text style={styles.scanningDescription}>
            Scan {this._itemsWithBarcode(barcode_readings).length} of{' '}
            {barcode_readings.length} barcodes with Quick Scan.
          </Text>
        ) : undefined}
        <Text style={styles.scanningText}>
          Scanned {this._remainingItems(false).length} out of{' '}
          {barcode_readings.length} barcodes.
        </Text>
        {scanning && (
          <>
            <Text style={styles.scanningText}>
              Scanned {this._remainingItems(false).length} out of{' '}
              {barcode_readings.length} barcodes.
            </Text>
            <CameraKitCameraScreen
              ref={this.camera}
              style={styles.camera}
              allowCaptureRetake={false}
              actions={{ leftButtonText: 'Done' }}
              cameraOptions={{
                flashMode: 'auto',
                focusMode: 'on',
              }}
              onBottomButtonPressed={this.onBottomButtonPressed.bind(this)}
              scanBarcode={true}
              hideControls={false}
              onReadCode={this._onReadCode.bind(this)}
            />
          </>
        )}
        {capture_mode && (
          <CaptureMissingBarcodes
            onChange={(barcodeReadings) =>
              this.setState({ barcode_readings: barcodeReadings })
            }
            onFinish={this._onDonePressed}
            barcodeReadings={barcode_readings}
          />
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: colors.darkGray,
  },
  backButton: {},
  backButtonText: {
    color: colors.offWhite,
    fontSize: 18,
    fontWeight: '500',
  },
  topControls: {
    zIndex: 11,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  camera: {
    flex: 1,
    padding: 0,
    zIndex: 5,
  },
  scanningText: {
    position: 'absolute',
    bottom: 90,
    right: 10,
    zIndex: 10,
    color: colors.offWhite,
  },
  scanningDescription: {
    position: 'absolute',
    bottom: 110,
    right: 10,
    zIndex: 10,
    color: colors.offWhite,
  },
  debug: {
    backgroundColor: 'red',
  },
  pickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0,
  },
  pickerIcon: { color: colors.offWhite, lineHeight: 18 },
  pickerText: { color: colors.offWhite, lineHeight: 16 },
  picker: {
    paddingTop: 12,
    color: colors.offWhite,
    borderColor: colors.offWhite,
    borderWidth: 1,
    zIndex: 100,
  },
});

const connector = connect(({ userReducer }: RootState) => ({
  user: userReducer.user,
}));

export default connector(ScanBarcodesScreen);

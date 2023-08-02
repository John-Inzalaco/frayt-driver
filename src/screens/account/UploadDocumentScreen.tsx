import { RootState } from '@reducers/index';
import { CardItem, Text, View, Body, Item, Toast } from 'native-base';
import React from 'react';
import colors from '@constants/Colors';
import { NavigationScreenProp } from 'react-navigation';
import { connect, ConnectedProps } from 'react-redux';
import {
  Platform,
  StyleSheet,
  Image as Img,
  TouchableHighlight,
  TextInput,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ActionButton from '@components/ui/ActionButton';
import PhotoCropperHelper from '@lib/PhotoCropperHelper';
import { Image } from 'react-native-image-crop-picker';
import { updateUserDocument } from '@actions/userAction';
import { DocumentType } from '@models/User';
import DatePicker from 'react-native-date-picker';

type UploadDocumentsState = {
  documentPhoto: Nullable<Image>;
  expirationDate: Date | null;
  loading: boolean;
  calendarOpen: boolean;
};

interface NavigationProps {
  error?: string;
  title: string;
  type: DocumentType;
}

interface NavigationState {
  params: NavigationProps;
}

interface Props extends ConnectedProps<typeof connector> {
  navigation: NavigationScreenProp<NavigationState, NavigationProps>;
}

const connector = connect(({ userReducer }: RootState) => ({
  user: userReducer.user,
  updatingDocument: userReducer.updatingDocument,
}));

const expirations: DocumentType[] = [
  DocumentType.License,
  DocumentType.Insurance,
  DocumentType.Registration,
];

class UploadDocumentScreen extends React.Component<
  Props,
  UploadDocumentsState
> {
  pr: any;

  constructor(props: Props) {
    super(props);

    this.state = {
      expirationDate: null,
      documentPhoto: null,
      loading: false,
      calendarOpen: false,
    };

    this.pr = {
      onPhotoChange: (documentPhoto: Image): void => {
        this.setState({ documentPhoto });
      },
    };

    this.selectPhoto = this.selectPhoto.bind(this);
  }

  async saveDocument(
    documentPhoto: Image,
    expirationDate: Date | null,
    type: DocumentType,
  ) {
    const { dispatch, navigation } = this.props;
    const isSaved = await dispatch<any>(
      updateUserDocument(documentPhoto, expirationDate, type),
    );

    if (isSaved) {
      Toast.show({ text: 'Document uploaded successfully!' });

      navigation.goBack();
    }
  }

  async selectPhoto() {
    this.setState({ loading: true });
    await PhotoCropperHelper.selectPhoto(this.pr, { cropping: false });
    this.setState({ loading: false });
  }

  renderDocument() {
    const { documentPhoto } = this.state;
    if (documentPhoto) {
      const uri = PhotoCropperHelper.getUri(documentPhoto, null);

      return (
        <TouchableHighlight
          onPress={this.selectPhoto}
          style={{ width: '100%' }}>
          <Img source={{ uri }} style={styles.photo} />
        </TouchableHighlight>
      );
    } else {
      return (
        <View style={styles.photo}>
          <FontAwesome5
            name={'upload'}
            solid
            style={styles.placeholderIcon}
            onPress={this.selectPhoto}
          />
        </View>
      );
    }
  }

  isExpired(expDate: Date | null): boolean {
    if (!expDate) return false;
    const exp = expDate.setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);

    return exp < today;
  }

  render() {
    const { calendarOpen, expirationDate, documentPhoto } = this.state;
    const isExpired = this.isExpired(expirationDate);

    const {
      navigation: {
        state: {
          params: { title, type },
        },
      },
      updatingDocument,
    } = this.props;
    const hasExpiration = expirations.includes(type);

    return (
      <View style={styles.card}>
        <View style={styles.documentsContainer}>
          <CardItem style={styles.documentsHeader}>
            <Text style={styles.documentsHeaderText}>
              <FontAwesome5
                name='file'
                size={18}
                style={{ paddingBottom: 10 }}
              />
              &nbsp;Upload Replacement
            </Text>
          </CardItem>
          <View style={styles.documentsContent}>
            <CardItem header style={styles.cardItem}>
              <Body style={styles.itemBody}>
                <View style={styles.documentItemHeader}>
                  <Text style={styles.documentTypeText}>{title}</Text>
                </View>
                {this.renderDocument()}
                {hasExpiration && (
                  <>
                    <View style={{ marginBottom: 15 }}>
                      <Text style={styles.expirationLabel}>
                        Expiration Date
                      </Text>
                      <Item style={styles.expirationItem}>
                        <TextInput
                          style={styles.expirationDateInput}
                          onTouchEnd={() =>
                            this.setState({ calendarOpen: true })
                          }
                          value={expirationDate?.toLocaleDateString()}
                        />
                      </Item>
                      <DatePicker
                        modal
                        open={calendarOpen}
                        date={expirationDate ? expirationDate : new Date()}
                        minimumDate={new Date()}
                        mode={'date'}
                        onConfirm={(date) => {
                          this.setState({
                            calendarOpen: false,
                            expirationDate: date,
                          });
                        }}
                        onCancel={() => {
                          this.setState({ calendarOpen: false });
                        }}
                      />
                    </View>
                  </>
                )}
                <ActionButton
                  label='Upload Replacement'
                  type='secondary'
                  style={styles.largeButton}
                  block={true}
                  size='large'
                  disabled={!documentPhoto || updatingDocument || isExpired}
                  loading={updatingDocument}
                  onPress={() => {
                    if (documentPhoto && (expirationDate || !hasExpiration)) {
                      this.saveDocument(documentPhoto, expirationDate, type);
                    }
                  }}
                />
              </Body>
            </CardItem>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    padding: 10,
    backgroundColor: colors.white,
  },
  documentsContainer: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#afb1b6',
    flexGrow: 1,
  },
  documentsHeader: {
    borderBottomColor: '#2a64f6',
    borderBottomWidth: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '#eeeeee',
    paddingTop: 15,
    paddingBottom: 10,
  },
  cardItem: {
    backgroundColor: 'transparent',
  },
  documentsContent: {
    backgroundColor: '#F7F7F7',
  },
  documentsHeaderText: {
    color: '#2a64f6',
    fontWeight: '500',
    fontSize: 20,
    marginTop: Platform.OS === 'android' ? 10 : -10,
    paddingBottom: 10,
    paddingTop: 10,
  },
  photo: {
    height: 180,
    marginBottom: 20,
    alignSelf: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.gray,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  itemBody: {
    borderBottomColor: '#959595',
    paddingTop: 0,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
  },
  documentItemHeader: {
    paddingTop: 5,
    paddingBottom: 10,
    flexGrow: 1,
    width: '100%',
  },
  documentTypeText: {
    fontWeight: 'bold',
    color: '#1e1e1e',
    fontSize: 20,
  },
  expirationLabel: {
    color: '#a2a2a2',
    fontWeight: 'bold',
  },
  expirationItem: {
    width: '100%',
    paddingTop: 10,
  },
  placeholderIcon: {
    color: colors.gray,
    fontSize: 50,
  },
  largeButton: {
    borderRadius: 8,
    color: colors.white,
    flexGrow: 1,
    padding: 8,
  },
  expirationDateInput: {
    height: 50,
    borderStyle: 'solid',
    borderColor: '#CCC',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: '#FFF',
    borderWidth: 1,
    width: '100%',
    borderRadius: 8,
  },
});

export default connector(UploadDocumentScreen);

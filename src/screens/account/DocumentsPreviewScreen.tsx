import { RootState } from '@reducers/index';
import { CardItem, Text, View, Body } from 'native-base';
import React from 'react';
import colors from '@constants/Colors';
import { NavigationScreenProp } from 'react-navigation';
import { connect, ConnectedProps } from 'react-redux';
import {
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ActionButton from '@components/ui/ActionButton';
import { DocumentType, Document } from '@models/User';
import moment from 'moment';
import { dateIsExpired, titleCase } from '@lib/helpers';
import { getUser } from '@actions/userAction';

type UploadDocumentsState = {
  destinationPhoto: Nullable<Image>;
};

interface NavigationProps {
  error?: string;
}

interface NavigationState {
  params: NavigationProps;
}

interface Props extends ConnectedProps<typeof connector> {
  navigation: NavigationScreenProp<NavigationState, NavigationProps>;
}

type PreviewDocumentType = Exclude<
  DocumentType,
  'carrier_agreement' | 'vehicle_type'
>;

export const documentTypes: { [key in PreviewDocumentType]: string } = {
  [DocumentType.Profile]: "Driver's Profile",
  [DocumentType.License]: "Driver's License",
  [DocumentType.Registration]: 'Vehicle Registration',
  [DocumentType.Insurance]: 'Vehicle Insurance',
  [DocumentType.Front]: 'Vehicle Front',
  [DocumentType.DriverSide]: 'Vehicle Driver Side',
  [DocumentType.PassengersSide]: 'Vehicle Passenger Side',
  [DocumentType.Back]: 'Vehicle Back',
  [DocumentType.CargoArea]: 'Vehicle Cargo Area',
};

const connector = connect(({ userReducer }: RootState) => ({
  user: userReducer.user,
  fetchingUser: userReducer.fetchingUser,
}));

class DocumentsPreviewScreen extends React.Component<
  Props,
  UploadDocumentsState
> {
  willFocusSubscription: any;

  constructor(props: Props) {
    super(props);

    this.state = {
      destinationPhoto: null,
    };
  }

  componentDidMount() {
    if (!this.props.fetchingUser) {
      this.willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        () => this.getUser(),
      );
    }
  }

  componentWillUnmount() {
    if (this.willFocusSubscription) {
      this.willFocusSubscription.remove();
    }
  }

  buildItemHeader(doc: Document): any {
    let statusText = '',
      additionalText = '',
      expiredLabel = 'Expires',
      style: any = { fontSize: 12, fontWeight: '600' };

    const expiresAt = doc?.expires_at
      ? moment(doc.expires_at).startOf('day')
      : null;
    const isExpired = expiresAt && dateIsExpired(expiresAt);
    if (isExpired) {
      statusText = 'Awaiting';
      additionalText = 'replacement document';
      style = { ...style, ...styles.documentAwaitingText };
      expiredLabel = 'Expired';
    } else if (doc?.state === 'approved') {
      statusText = 'Approved';
      additionalText = 'and up-to-date';
      style = { ...style, ...styles.documentApprovedText };
    } else if (doc?.state === 'pending_approval') {
      statusText = '';
      additionalText = 'Replacement received; awaiting approval';
    } else if (doc?.state === 'rejected') {
      style = { ...style, color: colors.danger };
      statusText = 'Rejected';
    }

    const expirationStyles = isExpired
      ? styles.expiredText
      : styles.notExpiredText;

    return (
      <>
        <View style={styles.documentItemHeader}>
          <Text style={styles.documentTypeText}>
            {titleCase(documentTypes[doc.type])}
          </Text>
          <Text style={expirationStyles}>
            {expiredLabel}: {(expiresAt && expiresAt.format('M/D/YY')) || 'N/A'}
          </Text>
        </View>
        {!!doc.state && (
          <View style={styles.documentStatus}>
            <Text style={style}>{statusText}</Text>
            <Text style={styles.documentStatusText}>
              &nbsp;{additionalText}
            </Text>
          </View>
        )}

        {doc.state === 'rejected' && doc.notes && (
          <Text style={[styles.documentStatus, styles.documentStatusText]}>
            &nbsp;{doc.notes}
          </Text>
        )}
      </>
    );
  }

  mapDocument(doc: Document, isLast: boolean) {
    const style = isLast
      ? { ...styles.itemBody, borderBottomWidth: 0 }
      : styles.itemBody;

    return (
      <CardItem header style={styles.cardItem}>
        <Body style={style}>
          {this.buildItemHeader(doc)}
          <View>
            <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
              <View style={styles.photoContainer}>
                {!doc.document && (
                  <FontAwesome5
                    name={'file-alt'}
                    solid
                    style={styles.placeholderIcon}
                  />
                )}

                {!!doc.document && (
                  <Image
                    style={styles.photo}
                    source={{
                      uri: doc.document + `?${Date.now()}`,
                    }}
                  />
                )}
              </View>
            </View>
          </View>
          <View style={styles.actionWrapper}>
            <ActionButton
              label='Upload Replacement'
              type='secondary'
              style={styles.largeButton}
              onPress={() => {
                this.props.navigation.navigate('UploadDocument', {
                  type: doc.type,
                  title: titleCase(documentTypes[doc.type]),
                });
              }}
            />
          </View>
        </Body>
      </CardItem>
    );
  }

  mapDocuments(docs: Document[]): any {
    const types = Object.keys(documentTypes);
    const lastIndex = types.length - 1;

    return types.map((type, index) => {
      const defaultDoc = { type } as Document;
      const doc = docs.find((d) => d.type === type) || defaultDoc;

      return this.mapDocument(doc, index === lastIndex);
    });
  }

  async getUser() {
    const { dispatch } = this.props;

    dispatch<any>(getUser(false));
  }

  render() {
    const driverDocs = this.props.user?.images || [];
    const vehicleDocs = this.props.user?.vehicle?.images || [];
    const docs = [...driverDocs, ...vehicleDocs];

    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.props.fetchingUser}
            onRefresh={this.getUser.bind(this)}
          />
        }>
        <View style={styles.card}>
          <View style={styles.documentsContainer}>
            <CardItem style={styles.documentsHeader}>
              <Text style={styles.documentsHeaderText}>
                <FontAwesome5 solid name='file' size={16} color='#00F' />
                &nbsp;Documents
              </Text>
            </CardItem>
            <View style={styles.documentsContent}>
              {this.mapDocuments(docs)}
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  card: {
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
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: Platform.OS === 'android' ? 10 : -10,
    paddingBottom: 10,
    paddingTop: 10,
  },
  documentItemHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 10,
  },
  documentTypeText: {
    color: '#474747',
    fontWeight: '600',
  },
  expiredText: {
    color: '#ba1f1f',
    fontSize: 13,
  },
  notExpiredText: {
    color: '#a2a2a2',
    fontSize: 13,
  },
  documentStatus: {
    paddingTop: 0,
    paddingBottom: 10,
    display: 'flex',
    flexDirection: 'row',
  },
  documentStatusText: {
    color: '#c1c2c6',
    fontSize: 12,
  },
  documentApprovedText: {
    color: '#59a462',
  },
  documentAwaitingText: {
    color: '#ba1f1f',
  },
  photoContainer: {
    maxWidth: '100%',
    width: '100%',
    height: 200,
    marginBottom: 10,
    alignSelf: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: colors.lightGray,
  },
  photo: {
    height: '100%',
    width: '100%',
  },
  actionWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    padding: 0,
  },
  placeholderIcon: {
    color: colors.gray,
    fontSize: 90,
  },
  button: {
    backgroundColor: '#2a64f6',
  },
  itemHeaderText: {
    color: '#474747',
  },
  itemBody: {
    borderBottomColor: '#959595',
    borderBottomWidth: 0.3,
    paddingTop: 10,
    paddingBottom: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
  },
  uploadTitle: {
    color: colors.darkGray,
    fontWeight: '500',
    fontSize: 16,
  },
  largeButton: {
    flexGrow: 1,
    borderRadius: 5,
    backgroundColor: '#3b1ee5',
    color: colors.white,
  },
});

export default connector(DocumentsPreviewScreen);

import { getAppVersion } from '@lib/helpers';
import { Text } from 'native-base';
import React from 'react';

type State = {
  version: Nullable<string>;
};

export default class AppVersion extends React.Component<{}, State> {
  state = {
    version: null,
  };

  async componentDidMount() {
    const version = await getAppVersion();
    this.setState({ version });
  }

  render() {
    return <Text {...this.props}>{this.state.version}</Text>;
  }
}

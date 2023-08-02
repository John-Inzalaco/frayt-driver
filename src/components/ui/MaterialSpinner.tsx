import React from 'react';
import Spin from '@components/ui/Spin';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import colors from '@constants/Colors';

export default class MaterialSpinner extends React.Component {
  static defaultProps = {
    size: 18,
  };

  render() {
    const { size, ...props } = this.props;
    return (
      <Spin style={{ height: size }}>
        <MaterialIcons
          name='refresh'
          size={size}
          color={colors.white}
          style={{ height: size }}
          {...props}
        />
      </Spin>
    );
  }
}

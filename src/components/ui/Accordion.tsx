import { View } from 'native-base';
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

interface AccordionProps {
  item: any;
  expanded?: boolean;
  renderHeader?: (item: any, collapsed: boolean) => React.ReactElement<{}>;
  renderContent?: (item: any, collapsed: boolean) => React.ReactElement<{}>;
}

type AccordionState = {
  expanded: boolean;
};

export default class Accordion extends Component<
  AccordionProps,
  AccordionState
> {
  constructor(props: AccordionProps) {
    super(props);

    this.state = {
      expanded: !!this.props.expanded,
    };
  }

  render() {
    const { renderHeader, renderContent, item } = this.props;
    const { expanded } = this.state;
    const header = renderHeader ? renderHeader(item, expanded) : null;
    const content = renderContent ? renderContent(item, expanded) : null;
    return (
      <View style={styles.wrapper}>
        <TouchableWithoutFeedback
          onPress={() => {
            this.setState({ expanded: !expanded });
          }}>
          {header}
        </TouchableWithoutFeedback>
        {expanded ? content : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'stretch',
    textAlignVertical: 'center',
  },
});

import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';

export default class RemoteComponent extends Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    name: PropTypes.string.isRequired,
    resetOnNavigate: PropTypes.bool,
  };

  static defaultProps = {
    resetOnNavigate: true,
  };

  static components = {};

  state = {
    screen: null,
    content: null,
  };

  screenContent = {};

  async componentWillReceiveProps(nextProps) {
    const { currentScreen } = nextProps;
    const { screen } = this.state;

    if (screen !== currentScreen) {
      await this.setState({ screen: currentScreen });
      this.updateContent();
    }
  }

  updateContent() {
    const { screen } = this.state;
    const content = this.screenContent[screen];

    this.setState({ content });
  }

  componentDidMount() {
    this.register();
  }

  componentWillUnmount() {
    const { name } = this.props;

    delete RemoteComponent.components[name];
  }

  register(override = true) {
    const { name } = this.props;

    if (RemoteComponent.components[name]) {
      if (override) {
        RemoteComponent.components[name] = this;
        console.warn(
          `Remote component with name of "${name}" is already registered. Existing component will be overridden.`,
        );
      } else {
        throw new Error(
          `Remote component with name of "${name}" is already registered`,
        );
      }
    } else {
      RemoteComponent.components[name] = this;
    }
  }

  setContent(screenContent, screen = this.state.screen) {
    this.screenContent[screen] = screenContent;
    this.updateContent();
  }

  render() {
    const { name, screen, ...props } = this.props;
    const { content } = this.state;

    return <View {...props}>{content}</View>;
  }
}

export function updateRemoteComponent(compName, content, { navigation } = {}) {
  if (RemoteComponent.components[compName]) {
    const currentScreen = navigation ? navigation.state.routeName : undefined;

    RemoteComponent.components[compName].setContent(content, currentScreen);
    return true;
  } else {
    console.warn(`RemoteComponent with name of ${compName} does not exist.`);
    return false;
  }
}

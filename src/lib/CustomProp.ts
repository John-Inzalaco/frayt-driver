import PropTypes from 'prop-types';

const includePropSubTypes = (propType) => {
  propType.isRequired = (props, propName, componentName) => {
    return PropTypes.oneOfType([PropTypes.any.isRequired, propType])(
      props,
      propName,
      componentName,
    );
  };
};

const CustomProp = {
  inRangeOf: (min, max) => {
    const propType = (props, propName, componentName) => {
      const value = props[propName];
      if (value < min || value > max) {
        return new Error(
          `Prop ${propName} must be between ${min} and ${max} on ${componentName}`,
        );
      }
    };

    return includePropSubTypes(propType);
  },
};

export default CustomProp;

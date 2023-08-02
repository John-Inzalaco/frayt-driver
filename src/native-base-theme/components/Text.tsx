import variable from '../variables/platform';
import colors from '@constants/Colors';

export default (variables = variable) => {
  const textTheme = {
    'fontSize': variables.DefaultFontSize,
    'fontFamily': variables.fontFamily,
    'color': variables.textColor,
    '.note': {
      color: colors.gray,
      fontSize: variables.noteFontSize,
    },
  };

  return textTheme;
};

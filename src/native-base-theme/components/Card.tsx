import variable from './../variables/platform';

export default (variables = variable) => {
  const cardTheme = {
    '.transparent': {
      shadowColor: null,
      shadowOffset: null,
      shadowOpacity: null,
      shadowRadius: null,
      elevation: null,
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    '.noShadow': {
      shadowColor: null,
      shadowOffset: null,
      shadowOpacity: null,
      elevation: null,
    },
    'marginVertical': 5,
    'marginHorizontal': 2,
    'flex': 1,
    'borderWidth': variables.borderWidth,
    'borderRadius': variables.cardBorderRadius,
    'borderColor': variables.cardBorderColor,
    'flexWrap': 'nowrap',
    'backgroundColor': variables.cardDefaultBg,
    'shadowColor': null,
    'shadowOffset': null,
    'shadowOpacity': null,
    'shadowRadius': null,
    'elevation': null,
  };

  return cardTheme;
};

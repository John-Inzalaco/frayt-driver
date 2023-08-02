import Color from 'color';

type ColorType =
  | 'white'
  | 'offWhite'
  | 'lightGray'
  | 'gray'
  | 'darkGray'
  | 'primary'
  | 'secondary'
  | 'darkBlue'
  | 'success'
  | 'warning'
  | 'danger'
  | 'disabled'
  | 'background'
  | 'text'
  | 'inverseText'
  | 'primaryText'
  | 'secondaryText'
  | 'successText'
  | 'warningText'
  | 'dangerText'
  | 'disabledText'
  | 'dash'
  | 'route'
  | 'sameDay'
  | 'tabIconDefault'
  | 'tabIconSelected'
  | 'signature'
  | 'headerBackground';

// Theme neutral colors
const white = '#fff',
  offWhite = '#f7f7f7',
  lightGray = '#eee',
  gray = '#919191',
  darkGray = '#383838';

// Theme colors
const primary = '#ff9900',
  secondary = '#0066ff',
  darkBlue = '#3b1ee5',
  // success   = '#2ECC71'
  success = '#19CC19',
  warning = '#ff9900',
  danger = '#ff3939',
  disabled = lightGray,
  background = offWhite,
  signature = '#000033',
  headerBackground = Color(darkGray).darken(0.3).toString();

// Theme text colors
const text = darkGray,
  inverseText = white,
  primaryText = white,
  secondaryText = white,
  successText = white,
  warningText = darkGray,
  dangerText = white,
  disabledText = Color(disabled).darken(0.25).hex();

const colors: Record<ColorType, string> = {
  white,
  offWhite,
  lightGray,
  gray,
  darkGray,
  primary,
  secondary,
  darkBlue,
  success,
  warning,
  danger,
  disabled,
  background,
  text,
  inverseText,
  primaryText,
  secondaryText,
  successText,
  warningText,
  dangerText,
  disabledText,
  signature,
  dash: success,
  sameDay: warning,
  route: secondary,
  tabIconDefault: lightGray,
  tabIconSelected: secondary,
  headerBackground,
};

let oColors: Record<string, Color> = {};

for (const k in colors) {
  let name = k as ColorType;
  if (colors.hasOwnProperty(name)) {
    const color = colors[name];
    oColors[name] = Color(color);
  }
}

export default colors;
export const colorObjs: Record<ColorType, Color> = oColors;

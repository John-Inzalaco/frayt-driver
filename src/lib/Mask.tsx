import React from 'react';
import { TextInput } from 'react-native';
import moment, { Moment } from 'moment';

import { Input } from 'native-base';
type MaskPresets = {
  phone?: Mask<string>;
  ssn?: Mask<string>;
  bank_an?: Mask<string>;
  bank_rn?: Mask<string>;
  birth_date?: Mask<Nullable<Moment>>;
  expirationDate?: Mask<Nullable<Moment>>;
  [key: string]: Mask<any> | undefined;
};

type MaskTranslators = {
  [key: string]: MaskTranslator;
};

type MaskDictionaries = {
  [key: string]: MaskDictionary;
};

type MaskRegexers = {
  [key: string]: [RegExp, RegexReplacer];
};

type MaskAttrs<ReturnType> = {
  mask: string;
  validator?: MaskValidator<ReturnType>;
  sanitizer?: MaskSanitizer<ReturnType>;
};

type MaskValue<ReturnType> = {
  textValue: string;
  value: ReturnType;
};

type MaskDictionaryAttrs = {
  regex: string;
  optional?: boolean;
  isGroup?: boolean;
};

type MaskDictionary = {
  regex: string;
  optional: boolean;
  isGroup: boolean;
};

type SpecialCharacters = string[];

type RegexReplacer = (match: string) => string;
type MaskSanitizer<ReturnType> = (
  textValue: string,
  value: string,
) => MaskValue<ReturnType>;
type MaskValidator<ReturnType> = (
  value: string,
  mask: Mask<ReturnType>,
) => boolean;
type MaskTranslator = (value: string) => string;
type TextChangeHandler = (textValue: string, value: any) => void;
type ChangeHandler = (value: any) => void;

type MaskInputProps<ReturnType> = {
  // NativeBase Input Props
  label?: string;
  inlineLabel?: boolean;
  stackedLabel?: boolean;
  disabled?: boolean;
  getRef?: React.Ref<TextInput>;
  // Mask Input Props
  onChangeText: TextChangeHandler;
  isValid: () => boolean;
  mask: Mask<ReturnType>;
  value: any;
};

export class MaskInput<ReturnType> extends React.Component<
  MaskInputProps<ReturnType>,
  any
> {}
export default class Mask<ReturnType> {
  mask: string;
  validator: Nullable<MaskValidator<ReturnType>>;
  sanitizer: Nullable<MaskSanitizer<ReturnType>>;
  regex: string;

  constructor({ mask, validator, sanitizer }: MaskAttrs<ReturnType>) {
    this.mask = mask;
    this.validator = validator || null;
    this.sanitizer = sanitizer || null;
    this.regex = this.toRegex();
  }

  rawToMask(input: string): string {
    const mask = this.mask;
    let i = 0,
      mi = 0,
      output = '';

    while (i < input.length && mi < mask.length) {
      let maskChar = mask[mi],
        inputChar = input[i];

      if (inputChar === maskChar) {
        output += inputChar;
        mi++;
        i++;
      } else {
        const maskSet = mask.substring(mi, mi + 3);
        const maskSplCharMatch = maskSet.match(Mask.splCharsRegex);

        if (maskSplCharMatch) {
          mi += 3;
          const splChar = maskSplCharMatch[1];
          const translate = Mask.translators[splChar];
          let translation = null;
          while (!translation && i < input.length) {
            inputChar = input[i];
            translation = translate(inputChar);
            i++;
          }

          if (translation) {
            output += translation;
          }
        } else {
          output += maskChar;
          mi++;
        }
      }
    }
    // Continue until end of mask or input string is reached
    // while (i < input.length && mi < mask.length);

    return output;
  }

  maskToRaw(input = '') {
    const mask = this.mask;
    let i = 0,
      mi = 0,
      output = '';

    while (i < input?.length && mi < mask.length) {
      let inputChar = input[i];

      const maskSet = mask.substring(mi, mi + 3);
      const maskSplCharMatch = maskSet.match(Mask.splCharsRegex);

      if (maskSplCharMatch) {
        mi += 3;
        const splChar = maskSplCharMatch[1];
        const translate = Mask.translators[splChar];
        let translation = null;
        while (!translation && i < input.length) {
          inputChar = input[i];
          translation = translate(inputChar);
          i++;
        }

        if (translation) {
          output += translation;
        }
      } else {
        mi++;
      }
    }
    // Continue until end of mask or input string is reached
    // while (i < input.length && mi < mask.length);

    return output;
  }

  isValid(value: string = ''): boolean {
    const matchesMask = (value || '').match(this.regex);
    if (!matchesMask) return false;

    return this.validator ? this.validator(value, this) : true;
  }

  getMask(): string {
    return this.mask;
  }

  toRegex(): string {
    // Preserve would be RegExp special chars as strings
    let regex = this.mask.replace(/[$()*.?\^\[\]\\]/g, '\\$&');
    // Replace all mask chars from dictionary with regex
    Object.values(Mask.regexers).forEach((regexer) => {
      regex = regex.replace(...regexer);
    });

    return regex;
  }

  sanitize(textValue: string, value: string) {
    const { sanitizer } = this;
    if (sanitizer) {
      return sanitizer(textValue, value);
    } else {
      return { textValue, value };
    }
  }

  applyDirectlyToInput(
    I: typeof Input,
    {
      onChangeText,
      value,
      ...props
    }: { onChangeText: TextChangeHandler; value: any; [key: string]: any },
  ): MaskInput<ReturnType> {
    let input: Nullable<MaskInput<ReturnType>> = null;
    const mask = this;
    const changeTextHandler: Nullable<ChangeHandler> = onChangeText
      ? (val) => {
          const raw = mask.maskToRaw(val);
          const text = mask.rawToMask(raw);
          const { textValue, value } = mask.sanitize(text, raw);

          if (input && textValue !== input.props.value) {
            return onChangeText(textValue, value);
          }
        }
      : null;

    const isValid = () => {
      return mask.isValid(input?.props.value);
    };

    let MaskI = I as unknown as MaskInput<ReturnType>;

    input = (
      <MaskI
        mask={mask}
        onChangeText={changeTextHandler}
        isValid={isValid}
        value={value}
        {...props}
      />
    );

    if (changeTextHandler) changeTextHandler(value);

    return input as MaskInput<ReturnType>;
  }

  static dictionary: MaskDictionaries = {};
  static translators: MaskTranslators = {};
  static regexers: MaskRegexers = {};
  static presets: MaskPresets = {};
  static splChars: SpecialCharacters = [];
  static splCharsRegex: RegExp = /$.^/;

  static addPreset<ReturnType>(
    name: keyof MaskPresets,
    options: MaskAttrs<ReturnType>,
  ) {
    return (this.presets[name] = new Mask<ReturnType>(options));
  }

  static addToDictionary(
    char: string,
    { regex, optional = false, isGroup = false }: MaskDictionaryAttrs,
  ) {
    let tranlatorRegex = new RegExp(`[^${regex}]+`);
    this.dictionary[char] = { regex, optional, isGroup };
    this.translators[char] =
      regex === '.' ? (val) => val : (val) => val.replace(tranlatorRegex, '');

    this.createRegexer(char, regex, isGroup, optional);
    this.updateSplChars();
  }

  static createRegexer(
    char: string,
    regex: string,
    isGroup: boolean,
    optional: boolean,
  ) {
    const regSafeChar = char.replace(/[$()*.?{}\^\[\]\\]/g, '\\$&');
    const charRegex = new RegExp(`(\\{${regSafeChar}\\})+`, 'g');
    const replacement: RegexReplacer = (match) => {
      let r = regex;

      if (isGroup) r = `[${r}]`;
      // Assume all characters are in the following format "{*}"
      if (match.length > 3) r += `{${match.length / 3}}`;
      if (optional) r = `(${r})?`;
      return r;
    };

    this.regexers[char] = [charRegex, replacement];
  }

  static updateSplChars() {
    this.splChars = Object.keys(this.dictionary);

    const charSet = this.splChars.join('');

    this.splCharsRegex = new RegExp(`^\{([${charSet}])\}`);
  }
}

Mask.addToDictionary('9', { regex: '\\d' });
Mask.addToDictionary('0', { regex: '\\d', optional: true });
Mask.addToDictionary('A', { regex: 'a-zA-Z', isGroup: true });
Mask.addToDictionary('a', { regex: 'a-zA-Z', isGroup: true, optional: true });
Mask.addToDictionary('S', { regex: '0-9a-zA-Z', isGroup: true });
Mask.addToDictionary('s', {
  regex: '0-9a-zA-Z',
  isGroup: true,
  optional: true,
});
Mask.addToDictionary('+', { regex: '\\S' });
Mask.addToDictionary('*', { regex: '\\S', optional: true });

Mask.addPreset<string>('phone', {
  mask: '({9}{9}{9}) {9}{9}{9} - {9}{9}{9}{9}',
});
Mask.addPreset<string>('ssn', { mask: '{9}{9}{9}–{9}{9}–{9}{9}{9}{9}' });
Mask.addPreset<string>('bank_an', {
  mask: '{9}{9}{9}{9}{0}{0}{0}{0}{0}{0}{0}{0}{0}{0}{0}{0}{0}',
});
Mask.addPreset<string>('bank_rn', { mask: '{9}{9}{9}{9}{9}{9}{9}{9}{9}' });
Mask.addPreset<Nullable<Moment>>('birth_date', {
  mask: '{9}{9} / {9}{9} / {9}{9}{9}{9}',
  sanitizer: (textValue, value) => {
    const maxYear = moment().year(),
      maxMonth = 12,
      maxDay = 31;
    let [monthRaw, dayRaw, yearRaw] = textValue.split(' / '),
      month = parseInt(monthRaw),
      day = parseInt(dayRaw),
      year = parseInt(yearRaw),
      date = null,
      dateString = '';

    if (day > maxDay) day = maxDay;

    if (month > maxMonth) month = maxMonth;

    if (year > maxYear) year = maxYear;

    if (monthRaw && dayRaw && yearRaw && yearRaw.length === 4) {
      let daysInMonth = moment(`${yearRaw}-${monthRaw}`).daysInMonth();

      if (day > daysInMonth) day = daysInMonth;

      date = moment(new Date(year, month - 1, day));

      dateString = date.format('MM / DD / YYYY');
    } else {
      let i = -1;
      let dateArr = [monthRaw, dayRaw, yearRaw];
      dateString = textValue.replace(/\d+/g, (_m, _args) => {
        i++;
        return dateArr[i];
      });
    }

    return {
      textValue: dateString,
      value: date,
    };
  },
});

Mask.addPreset<Nullable<Moment>>('expirationDate', {
  mask: '{9}{9} / {9}{9} / {9}{9}{9}{9}',
  sanitizer: (textValue, value) => {
    const maxYear = moment().add(20, 'years').year(),
      maxMonth = 12,
      maxDay = 31;
    let [monthRaw, dayRaw, yearRaw] = textValue.split(' / '),
      month = parseInt(monthRaw),
      day = parseInt(dayRaw),
      year = parseInt(yearRaw),
      date = null,
      dateString = '';

    if (day > maxDay) day = maxDay;

    if (month > maxMonth) month = maxMonth;

    if (year > maxYear) year = maxYear;

    if (monthRaw && dayRaw && yearRaw && yearRaw.length === 4) {
      let daysInMonth = moment(`${yearRaw}-${monthRaw}`).daysInMonth();

      if (day > daysInMonth) day = daysInMonth;

      date = moment(new Date(year, month - 1, day));

      dateString = date.format('MM / DD / YYYY');
    } else {
      let i = -1;
      let dateArr = [monthRaw, dayRaw, yearRaw];
      dateString = textValue.replace(/\d+/g, (_m, _args) => {
        i++;
        return dateArr[i];
      });
    }

    return {
      textValue: dateString,
      value: date,
    };
  },
});

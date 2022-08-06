import NumberTMap from '../models/number-t-map';

export const DEFAULT_PRIZES: string[] = ['$ 5', '$ 10'];
export const OTHER_OPTION_LABEL: string = 'Other';
export const ROUND_NAME_MAPPER: NumberTMap<string> = {
  1: 'roundOnePrize',
  2: 'roundTwoPrize',
  3: 'roundThreePrize'
};

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Width percentage — safe to use at module load (no native extra deps). */
export function wp(percent: number): number {
  return (SCREEN_WIDTH * percent) / 100;
}

/** Height percentage */
export function hp(percent: number): number {
  return (SCREEN_HEIGHT * percent) / 100;
}

export const spacing = {
  xs: wp(1),
  sm: wp(2),
  md: wp(4),
  lg: wp(6),
  xl: wp(8),
};

export const fontSize = {
  sm: hp(1.6),
  md: hp(2),
  lg: hp(2.4),
  xl: hp(3),
  title: hp(3.5),
};

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';

type Props = {
  size?: number;
  color?: string;
};

// Stylized silhouette: a head drawn as an open question mark, resolving into
// a suit collar and lapels — the app's identity mark.
export function IdentityMark({ size = 64, color = colors.glowStrong }: Props) {
  return (
    <Svg width={size} height={size * 1.3} viewBox="0 0 100 130" fill="none">
      <Path
        d="M36 24 C36 10 64 10 64 24 C64 36 50 34 50 48"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={50} cy={60} r={3.5} fill={color} />
      <Path
        d="M18 82 L50 68 L82 82 L50 126 Z"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

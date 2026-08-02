import React from 'react';
import Svg, { Circle, Rect } from 'react-native-svg';
import { colors } from '../theme/colors';
import type { MuscleGroup } from '../types';

type Zone = {
  group: MuscleGroup;
  shape: 'rect' | 'circle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rx?: number;
  r?: number;
};

const FRONT_ZONES: Zone[] = [
  { group: 'shoulders', shape: 'circle', x: 48, y: 70, r: 14 },
  { group: 'shoulders', shape: 'circle', x: 152, y: 70, r: 14 },
  { group: 'chest', shape: 'rect', x: 62, y: 62, width: 76, height: 46, rx: 10 },
  { group: 'biceps', shape: 'rect', x: 28, y: 84, width: 20, height: 46, rx: 8 },
  { group: 'biceps', shape: 'rect', x: 152, y: 84, width: 20, height: 46, rx: 8 },
  { group: 'abs', shape: 'rect', x: 68, y: 112, width: 64, height: 52, rx: 8 },
  { group: 'forearms', shape: 'rect', x: 24, y: 132, width: 18, height: 46, rx: 8 },
  { group: 'forearms', shape: 'rect', x: 158, y: 132, width: 18, height: 46, rx: 8 },
  { group: 'quads', shape: 'rect', x: 66, y: 168, width: 30, height: 74, rx: 10 },
  { group: 'quads', shape: 'rect', x: 104, y: 168, width: 30, height: 74, rx: 10 },
  { group: 'calves', shape: 'rect', x: 68, y: 246, width: 24, height: 58, rx: 8 },
  { group: 'calves', shape: 'rect', x: 108, y: 246, width: 24, height: 58, rx: 8 },
];

const BACK_ZONES: Zone[] = [
  { group: 'shoulders', shape: 'circle', x: 48, y: 70, r: 14 },
  { group: 'shoulders', shape: 'circle', x: 152, y: 70, r: 14 },
  { group: 'back', shape: 'rect', x: 62, y: 62, width: 76, height: 60, rx: 10 },
  { group: 'triceps', shape: 'rect', x: 28, y: 84, width: 20, height: 46, rx: 8 },
  { group: 'triceps', shape: 'rect', x: 152, y: 84, width: 20, height: 46, rx: 8 },
  { group: 'forearms', shape: 'rect', x: 24, y: 132, width: 18, height: 46, rx: 8 },
  { group: 'forearms', shape: 'rect', x: 158, y: 132, width: 18, height: 46, rx: 8 },
  { group: 'glutes', shape: 'rect', x: 66, y: 124, width: 68, height: 34, rx: 10 },
  { group: 'hamstrings', shape: 'rect', x: 66, y: 160, width: 30, height: 78, rx: 10 },
  { group: 'hamstrings', shape: 'rect', x: 104, y: 160, width: 30, height: 78, rx: 10 },
  { group: 'calves', shape: 'rect', x: 68, y: 246, width: 24, height: 58, rx: 8 },
  { group: 'calves', shape: 'rect', x: 108, y: 246, width: 24, height: 58, rx: 8 },
];

type Props = {
  view: 'front' | 'back';
  selectedGroup?: MuscleGroup;
  onSelectGroup: (group: MuscleGroup) => void;
};

export function BodyDiagram({ view, selectedGroup, onSelectGroup }: Props) {
  const zones = view === 'front' ? FRONT_ZONES : BACK_ZONES;

  return (
    <Svg width="100%" height={320} viewBox="0 0 200 320">
      {/* head + neck + silhouette outline, non-interactive */}
      <Circle cx={100} cy={30} r={20} fill={colors.surfaceAlt} />
      <Rect x={90} y={46} width={20} height={16} rx={4} fill={colors.surfaceAlt} />

      {zones.map((zone, index) => {
        const isSelected = zone.group === selectedGroup;
        const fill = isSelected ? colors.accent : colors.surfaceAlt;
        const commonProps = {
          key: `${zone.group}-${index}`,
          fill,
          stroke: colors.border,
          strokeWidth: 1,
          onPress: () => onSelectGroup(zone.group),
        };

        if (zone.shape === 'circle') {
          return <Circle {...commonProps} cx={zone.x} cy={zone.y} r={zone.r} />;
        }
        return (
          <Rect
            {...commonProps}
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            rx={zone.rx}
          />
        );
      })}
    </Svg>
  );
}

import React, { useRef, useState } from 'react';
import { Animated, Image, PanResponder, StyleSheet, Text, View } from 'react-native';
import { useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

type Props = {
  beforeUrl: string;
  afterUrl: string;
  height?: number;
};

/** Drag the divider to reveal how much before/after to show. Defaults to a 50/50 split. */
export function BeforeAfterSlider({ beforeUrl, afterUrl, height = 260 }: Props) {
  const styles = useThemedStyles(makeStyles);
  const [width, setWidth] = useState(0);
  const position = useRef(new Animated.Value(0)).current;
  const widthRef = useRef(0);
  const startRef = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.stopAnimation((value) => {
          startRef.current = value;
        });
      },
      onPanResponderMove: (_evt, gesture) => {
        const next = Math.max(0, Math.min(widthRef.current, startRef.current + gesture.dx));
        position.setValue(next);
      },
    })
  ).current;

  return (
    <View
      style={[styles.container, { height }]}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        widthRef.current = w;
        setWidth(w);
        position.setValue(w / 2);
      }}
    >
      {width > 0 && (
        <>
          <Image source={{ uri: afterUrl }} style={[styles.image, { width, height }]} resizeMode="cover" />
          <View style={styles.afterLabel}>
            <Text style={styles.labelText}>AFTER</Text>
          </View>

          <Animated.View style={[styles.clip, { width: position, height }]}>
            <Image source={{ uri: beforeUrl }} style={[styles.image, { width, height }]} resizeMode="cover" />
            <View style={styles.beforeLabel}>
              <Text style={styles.labelText}>BEFORE</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.handle, { left: position, height }]} {...panResponder.panHandlers}>
            <View style={styles.handleLine} />
            <View style={styles.handleKnob}>
              <View style={styles.handleArrowLeft} />
              <View style={styles.handleArrowRight} />
            </View>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.borderDim,
    },
    image: { position: 'absolute', top: 0, left: 0 },
    clip: { position: 'absolute', top: 0, left: 0, overflow: 'hidden' },
    handle: { position: 'absolute', top: 0, alignItems: 'center', marginLeft: -14, width: 28 },
    handleLine: { position: 'absolute', top: 0, bottom: 0, left: 13.5, width: 2, backgroundColor: '#fff' },
    handleKnob: {
      marginTop: '45%',
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 3,
    },
    handleArrowLeft: {
      width: 0,
      height: 0,
      borderTopWidth: 4,
      borderBottomWidth: 4,
      borderRightWidth: 5,
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      borderRightColor: '#333',
    },
    handleArrowRight: {
      width: 0,
      height: 0,
      borderTopWidth: 4,
      borderBottomWidth: 4,
      borderLeftWidth: 5,
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      borderLeftColor: '#333',
    },
    beforeLabel: {
      position: 'absolute',
      left: 10,
      bottom: 10,
      backgroundColor: 'rgba(0,0,0,0.55)',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    afterLabel: {
      position: 'absolute',
      right: 10,
      bottom: 10,
      backgroundColor: 'rgba(0,0,0,0.55)',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    labelText: { color: '#fff', fontSize: 11, fontFamily: 'ChakraPetch-SemiBold', letterSpacing: 1 },
  });

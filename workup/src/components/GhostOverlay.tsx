import React from 'react';
import { Image, StyleSheet } from 'react-native';

type Props = {
  photoUri: string;
  opacity: number;
};

// Renders the last photo for this muscle group translucently over the live
// camera feed, so the user can line their body up against where it was last time.
export function GhostOverlay({ photoUri, opacity }: Props) {
  return (
    <Image
      source={{ uri: photoUri }}
      style={[StyleSheet.absoluteFill, { opacity }]}
      resizeMode="cover"
    />
  );
}

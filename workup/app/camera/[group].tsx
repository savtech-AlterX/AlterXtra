import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraFrameOverlay } from '../../src/components/CameraFrameOverlay';
import { MUSCLE_GROUP_LABELS, isMuscleGroup } from '../../src/constants/muscleGroups';
import { colors } from '../../src/theme/colors';

export default function CameraScreen() {
  const { group } = useLocalSearchParams<{ group: string }>();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);

  if (!group || !isMuscleGroup(group)) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Unknown muscle group</Text>
      </View>
    );
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: MUSCLE_GROUP_LABELS[group] }} />
        <Text style={styles.permissionText}>Workup needs camera access to take progress photos.</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </Pressable>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        router.replace(`/log/${group}?photoUri=${encodeURIComponent(photo.uri)}`);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: MUSCLE_GROUP_LABELS[group] }} />
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      <CameraFrameOverlay group={group} />
      <View style={styles.controls}>
        <Pressable style={styles.shutterButton} onPress={handleCapture} disabled={isCapturing}>
          <View style={styles.shutterInner} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionText: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: colors.background,
    fontWeight: '700',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shutterButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.text,
  },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function CameraFrame() {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={[styles.corner, styles.tl]} />
      <View style={[styles.corner, styles.tr]} />
      <View style={[styles.corner, styles.bl]} />
      <View style={[styles.corner, styles.br]} />
    </View>
  );
}

const size = 260;
const border = 4;

const styles = StyleSheet.create({
  container: {
    width: size,
    height: size,
    alignSelf: 'center',
    marginTop: 48
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: '#22c55e'
  },
  tl: { top: 0, left: 0, borderLeftWidth: border, borderTopWidth: border },
  tr: { top: 0, right: 0, borderRightWidth: border, borderTopWidth: border },
  bl: { bottom: 0, left: 0, borderLeftWidth: border, borderBottomWidth: border },
  br: { bottom: 0, right: 0, borderRightWidth: border, borderBottomWidth: border }
});



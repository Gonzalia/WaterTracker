import { useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  message: string;
  onClose: () => void;
}

export default function WaterRegisteredNotice({ message, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let disposed = false;
    let sequence: Animated.CompositeAnimation | undefined;
    const show = async () => {
      const reduced = await AccessibilityInfo.isReduceMotionEnabled().catch(
        () => false,
      );
      if (disposed) return;
      sequence = Animated.sequence([
        // Let the entry modal finish closing before the banner arrives.
        Animated.delay(350),
        Animated.timing(animation, {
          toValue: 1,
          duration: reduced ? 0 : 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(4000),
        Animated.timing(animation, {
          toValue: 0,
          duration: reduced ? 0 : 250,
          useNativeDriver: true,
        }),
      ]);
      sequence.start(({ finished }) => {
        if (finished && !disposed) onClose();
      });
      AccessibilityInfo.announceForAccessibility(`Agua registrada. ${message}`);
    };
    void show();
    return () => {
      disposed = true;
      sequence?.stop();
    };
  }, [animation, message, onClose]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          top: insets.top + 12,
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-220, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.icon}>
        <Text style={styles.check}>✓</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Agua registrada</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Cerrar confirmación"
        style={styles.close}
      >
        <Text style={styles.closeText}>×</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    left: 16,
    right: 16,
    maxWidth: 480,
    alignSelf: "center",
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#10364A",
    borderWidth: 1,
    borderColor: "#5DCDBE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#A2F0DC",
    alignItems: "center",
    justifyContent: "center",
  },
  check: { color: "#105044", fontSize: 25, fontWeight: "800" },
  content: { flex: 1, gap: 4 },
  title: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  message: { color: "#CBE9EF", fontSize: 13, lineHeight: 19 },
  close: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: "#CBE9EF", fontSize: 27 },
});

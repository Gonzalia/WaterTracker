import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface ProgressBarProps {
  progress: number;
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 450,
        useNativeDriver: false,
      }),

      Animated.sequence([
        Animated.timing(shake, {
          toValue: 3,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: -3,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 2,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [progress]);

  const width = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: shake }],
        },
      ]}
    >
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]} />
      </View>
    </Animated.View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  track: {
    width: "100%",
    height: 6,
    backgroundColor: "#183246",
    borderRadius: 999,
    overflow: "hidden",
  },

  fill: {
    height: "100%",
    backgroundColor: "#39BDF8",
    borderRadius: 999,
  },
});

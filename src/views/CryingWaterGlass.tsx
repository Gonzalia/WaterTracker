import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, StyleSheet, View } from "react-native";
import Svg, { Ellipse, Path, Circle } from "react-native-svg";

export default function CryingWaterGlass({ crying }: { crying: boolean }) {
  const tears = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) setReduceMotion(value);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    tears.setValue(0);
    if (!crying || reduceMotion) return;
    const animation = Animated.loop(
      Animated.timing(tears, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [crying, reduceMotion, tears]);
  return (
    <View
      style={styles.glass}
      accessible
      accessibilityLabel={
        crying ? "Un vaso de agua llorando" : "Un vaso de agua"
      }
    >
      <Svg width={220} height={260} viewBox="0 0 220 260">
        <Ellipse cx={110} cy={243} rx={69} ry={10} fill="#03111E" />
        <Path
          d="M 35 34 L 51 216 Q 54 238 110 238 Q 166 238 169 216 L 185 34 Z"
          fill="#173F56"
          stroke="#B7E9FF"
          strokeWidth={3}
        />
        <Path
          d="M 43 115 Q 78 102 110 115 Q 145 129 177 115 L 167 214 Q 165 235 110 235 Q 55 235 53 214 Z"
          fill="#39BDF8"
        />
        <Ellipse
          cx={110}
          cy={34}
          rx={75}
          ry={13}
          fill="#244E66"
          stroke="#D9F2FF"
          strokeWidth={3}
        />
        <Path
          d="M 48 57 L 60 192"
          stroke="white"
          strokeOpacity={0.55}
          strokeWidth={5}
          strokeLinecap="round"
        />
        <Circle cx={83} cy={151} r={6} fill="#071A2B" />
        <Circle cx={137} cy={151} r={6} fill="#071A2B" />
        <Path
          d={
            crying
              ? "M 94 187 Q 110 169 126 187 M 73 137 L 88 131 M 132 131 L 147 137"
              : "M 94 177 Q 110 187 126 177"
          }
          fill="none"
          stroke="#071A2B"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Ellipse cx={72} cy={169} rx={9} ry={5} fill="#98DEFF" />
        <Ellipse cx={148} cy={169} rx={9} ry={5} fill="#98DEFF" />
      </Svg>
      {crying && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.tears,
            {
              opacity: reduceMotion
                ? 1
                : tears.interpolate({
                    inputRange: [0, 0.15, 0.8, 1],
                    outputRange: [0, 1, 1, 0],
                  }),
              transform: [
                {
                  translateY: reduceMotion
                    ? 10
                    : tears.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 48],
                      }),
                },
              ],
            },
          ]}
        >
          <Svg width={220} height={40}>
            <Path
              d="M 80 0 Q 66 19 80 23 Q 94 19 80 0 M 140 0 Q 126 19 140 23 Q 154 19 140 0"
              fill="#B5EDFF"
            />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  glass: { width: 220, height: 260 },
  tears: { position: "absolute", top: 159, left: 0 },
});

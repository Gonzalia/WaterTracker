import { useEffect, useId, useRef, useState } from "react";
import {
  AccessibilityInfo,
  AppState,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

interface WaterGlassProps {
  current: number;
  goal: number;
}

const INNER =
  "M 47 38 Q 120 53 193 38 L 177 227 Q 175 247 120 247 Q 65 247 63 227 Z";
const OUTER = "M 39 35 L 56 230 Q 58 258 120 258 Q 182 258 184 230 L 201 35";
const BUBBLES = [
  { x: 83, offset: 0.12, radius: 3 },
  { x: 146, offset: 0.48, radius: 4 },
  { x: 108, offset: 0.78, radius: 2 },
  { x: 163, offset: 0.28, radius: 2.5 },
  { x: 94, offset: 0.64, radius: 1.5 },
];

function wavePath(level: number, phase: number, amplitude: number) {
  let path = "";
  for (let x = 35; x <= 205; x += 5) {
    const y = level + Math.sin((x / 170) * Math.PI * 2 + phase) * amplitude;
    path += `${x === 35 ? "M" : "L"} ${x} ${y} `;
  }
  return `${path}L 205 260 L 35 260 Z`;
}

const WaterGlass = ({ current, goal }: WaterGlassProps) => {
  const progress =
    Number.isFinite(current) && Number.isFinite(goal) && goal > 0
      ? Math.max(0, Math.min(current / goal, 1))
      : 0;
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const focused = useIsFocused();
  const [active, setActive] = useState(AppState.currentState === "active");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [frame, setFrame] = useState({ fill: progress, phase: 0, surge: 0 });
  const fill = useRef(progress);
  const phase = useRef(0);
  const previousAmount = useRef(current);

  useEffect(() => {
    let mounted = true;
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    const appSubscription = AppState.addEventListener("change", (state) =>
      setActive(state === "active"),
    );
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {});
    return () => {
      mounted = false;
      subscription.remove();
      appSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const added = current > previousAmount.current;
    previousAmount.current = current;
    if (reduceMotion || !focused || !active) {
      fill.current = progress;
      setFrame({ fill: progress, phase: phase.current, surge: 0 });
      return;
    }

    const startFill = fill.current;
    const startPhase = phase.current;
    let start: number | undefined;
    let lastFrame = -Infinity;
    let animation: number;
    const tick = (now: number) => {
      if (start === undefined) start = now;
      const elapsed = now - start;
      // Limit SVG redraws to 60 fps; interpolate from the visible level on rapid additions.
      if (now - lastFrame >= 1000 / 60) {
        const t = Math.min(elapsed / 1300, 1);
        fill.current =
          startFill + (progress - startFill) * (1 - Math.pow(1 - t, 3));
        phase.current = startPhase + elapsed / 900;
        setFrame({
          fill: fill.current,
          phase: phase.current,
          surge: added ? Math.sin(Math.PI * t) : 0,
        });
        lastFrame = now;
      }
      if (progress > 0 || elapsed < 1300)
        animation = requestAnimationFrame(tick);
    };
    animation = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animation);
  }, [progress, current, reduceMotion, focused, active]);

  const level = 249 - frame.fill * 194;
  const amplitude = Math.min(1, frame.fill * 12) * (3 + frame.surge * 7);
  const frontWave = wavePath(level, frame.phase, amplitude);
  const backWave = wavePath(level - 2, -frame.phase + 1.8, amplitude * 0.8);

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Agua consumida"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(progress * 100),
        text: `${current} de ${goal} mililitros`,
      }}
    >
      <Svg width={220} height={260} viewBox="0 0 240 284" accessible={false}>
        <Defs>
          <ClipPath id={`${id}glass`}>
            <Path d={INNER} />
          </ClipPath>
          <ClipPath id={`${id}water`}>
            <Path d={frontWave} />
          </ClipPath>
          <LinearGradient id={`${id}body`} x1="0%" y1="0%" x2="100%" y2="25%">
            <Stop offset="0" stopColor="#E4FAFF" stopOpacity={0.32} />
            <Stop offset="0.3" stopColor="#B8E9FF" stopOpacity={0.06} />
            <Stop offset="0.8" stopColor="#C7EFFF" stopOpacity={0.12} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.38} />
          </LinearGradient>
          <LinearGradient id={`${id}liquid`} x1="0%" y1="0%" x2="30%" y2="100%">
            <Stop offset="0" stopColor="#9AEEFF" />
            <Stop offset="0.35" stopColor="#35C9F4" stopOpacity={0.95} />
            <Stop offset="1" stopColor="#0878CF" stopOpacity={0.98} />
          </LinearGradient>
          <LinearGradient id={`${id}shine`} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.02} />
            <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.28} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Ellipse
          cx={120}
          cy={268}
          rx={67}
          ry={9}
          fill="#031B35"
          opacity={0.22}
        />
        <Path d={`${OUTER} Q 120 55 39 35 Z`} fill={`url(#${id}body)`} />
        <Ellipse
          cx={120}
          cy={35}
          rx={81}
          ry={15}
          fill="#DDF6FF"
          fillOpacity={0.08}
          stroke="#DDF6FF"
          strokeOpacity={0.5}
          strokeWidth={2}
        />
        <G clipPath={`url(#${id}glass)`}>
          {frame.fill > 0.001 && (
            <>
              <Path d={backWave} fill="#92EBFF" fillOpacity={0.55} />
              <Path
                d={frontWave}
                fill={`url(#${id}liquid)`}
                stroke="#B0F4FF"
                strokeWidth={1.4}
              />
              <G clipPath={`url(#${id}water)`}>
                <Path
                  d="M 44 98 Q 105 133 193 106 M 49 166 Q 121 139 191 172 M 61 214 Q 119 239 181 211"
                  fill="none"
                  stroke="#B7F3FF"
                  strokeWidth={9}
                  opacity={0.09}
                />
                <Path
                  d="M 73 45 Q 112 134 86 251 L 114 251 Q 142 130 91 45 Z"
                  fill={`url(#${id}shine)`}
                />
                {BUBBLES.map((bubble, index) => {
                  const travel = (frame.phase / 7 + bubble.offset) % 1;
                  return (
                    <Circle
                      key={index}
                      cx={bubble.x + Math.sin(frame.phase + index) * 3}
                      cy={246 - travel * (246 - level)}
                      r={bubble.radius}
                      fill="#D1F8FF"
                      fillOpacity={0.12}
                      stroke="#C7F7FF"
                      strokeOpacity={Math.sin(travel * Math.PI) * 0.5}
                      strokeWidth={1}
                    />
                  );
                })}
                <Rect
                  x={157}
                  y={42}
                  width={12}
                  height={208}
                  rx={6}
                  fill="#C1F5FF"
                  opacity={0.1}
                />
              </G>
            </>
          )}
        </G>
        <Path
          d={OUTER}
          fill="none"
          stroke="#E1F6FF"
          strokeOpacity={0.8}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Path
          d="M 51 57 L 65 216"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={0.6}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Path
          d="M 188 58 L 175 216"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={0.22}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M 70 239 Q 120 259 170 239"
          fill="none"
          stroke="#E4FAFF"
          strokeOpacity={0.6}
          strokeWidth={4}
          strokeLinecap="round"
        />
        {[85, 128, 171, 214].map((y) => (
          <Path
            key={y}
            d={`M 163 ${y} h 10`}
            stroke="#E5F8FF"
            strokeOpacity={0.45}
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
        <Path
          d="M 39 35 C 39 55 201 55 201 35"
          fill="none"
          stroke="#F0FCFF"
          strokeOpacity={0.9}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={styles.current}>{current} ml</Text>
      <Text style={styles.goal}>de {goal} ml</Text>
    </View>
  );
};

export default WaterGlass;

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  current: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
  goal: { color: "#C9E3F2", fontSize: 14, marginTop: 2 },
});

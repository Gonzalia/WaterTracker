import { useId, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { ProgressPoint } from "../../services/ProgressService";

interface Props {
  points: ProgressPoint[];
  goal: number;
}
export default function WaterProgressChart({ points, goal }: Props) {
  const [width, setWidth] = useState(300);
  const [selected, setSelected] = useState<number | null>(null);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const left = 38,
    right = width - 16,
    top = 22,
    bottom = 210;
  const max =
    Math.ceil(Math.max(goal, ...points.map((p) => p.amount), 1000) / 1000) *
    1000;
  const y = (amount: number) => bottom - (amount / max) * (bottom - top);
  const x = (index: number) =>
    points.length === 1
      ? (left + right) / 2
      : left + (index / (points.length - 1)) * (right - left);
  const line = points
    .map((p, i) => `${i ? "L" : "M"} ${x(i)} ${y(p.amount)}`)
    .join(" ");
  const area = points.length
    ? `${line} L ${x(points.length - 1)} ${bottom} L ${x(0)} ${bottom} Z`
    : "";
  const step = Math.max(1, Math.ceil(points.length / 6));
  const chosen = selected === null ? null : points[selected];
  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <Text style={styles.detail}>
        {chosen
          ? `${chosen.label}: ${Math.round(chosen.amount)} ml`
          : "Tocá un punto para ver el consumo"}
      </Text>
      <Svg width={width} height={248}>
        <Defs>
          <LinearGradient id={`${id}area`} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0" stopColor="#49C9FF" stopOpacity={0.4} />
            <Stop offset="1" stopColor="#49C9FF" stopOpacity={0.01} />
          </LinearGradient>
        </Defs>
        {[0, 1, 2, 3, 4].map((tick) => {
          const value = (max * tick) / 4;
          return (
            <G key={tick}>
              <Line
                x1={left}
                x2={right}
                y1={y(value)}
                y2={y(value)}
                stroke="#204258"
                strokeDasharray="3 5"
              />
              <SvgText
                x={left - 8}
                y={y(value) + 4}
                fill="#8FAEC4"
                fontSize={10}
                textAnchor="end"
              >
                {Number((value / 1000).toFixed(2))}
              </SvgText>
            </G>
          );
        })}
        <SvgText
          x={left - 8}
          y={10}
          fill="#8FAEC4"
          fontSize={10}
          textAnchor="end"
        >
          Litros
        </SvgText>
        <Path d={area} fill={`url(#${id}area)`} />
        <Line
          x1={left}
          x2={right}
          y1={y(goal)}
          y2={y(goal)}
          stroke="#8CB1C7"
          strokeDasharray="6 5"
          opacity={0.6}
        />
        <Path
          d={line}
          stroke="#69D5FF"
          strokeWidth={3}
          strokeLinejoin="round"
          fill="none"
        />
        {points.map((point, index) => (
          <G key={point.date}>
            <Circle
              cx={x(index)}
              cy={y(point.amount)}
              r={selected === index ? 6 : 4}
              fill="#9BE7FF"
              stroke="#123E59"
              strokeWidth={2}
            />
            <Circle
              cx={x(index)}
              cy={y(point.amount)}
              r={14}
              fill="transparent"
              onPress={() => setSelected(index)}
              accessibilityLabel={`${point.label}: ${Math.round(point.amount)} mililitros`}
            />
            {(index % step === 0 || index === points.length - 1) && (
              <SvgText
                x={x(index)}
                y={234}
                fill="#8FAEC4"
                fontSize={10}
                textAnchor="middle"
              >
                {point.label}
              </SvgText>
            )}
          </G>
        ))}
      </Svg>
      <Text style={styles.legend}>Objetivo diario: {goal / 1000} L</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  detail: { color: "#C6E8F7", fontSize: 12, marginBottom: 12 },
  legend: { color: "#8FAEC4", fontSize: 12, textAlign: "center" },
});

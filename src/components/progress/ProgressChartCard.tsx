import { StyleSheet, Text, View } from "react-native";
import WaterProgressChart from "../charts/WaterProgressChart";
import { ProgressPeriod, WaterProgress } from "../../services/ProgressService";

interface Props { period: ProgressPeriod; progress: WaterProgress }
export default function ProgressChartCard({ period, progress }: Props) {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.caption}>
        {period === "year"
          ? "Promedio diario por mes"
          : "Consumo diario"}
      </Text>
      <WaterProgressChart
        key={period}
        points={progress.points}
        goal={progress.goal}
      />
      {progress.periodTotal === 0 && (
        <Text style={styles.empty}>
          Todavía no hay agua registrada en este período. Cargá tu
          consumo desde Inicio.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    padding: 14,
    gap: 16,
    backgroundColor: "#0A2133",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#21475F",
  },
  caption: { color: "#8FAEC4", fontSize: 12, lineHeight: 18 },
  empty: {
    color: "#9BB9CD",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
});

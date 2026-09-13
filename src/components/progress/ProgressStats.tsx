import { StyleSheet, Text, View } from "react-native";
import InfoCard from "../cards/InfoCard";
import { WaterProgress } from "../../services/ProgressService";

const liters = (amount: number) =>
  `${(amount / 1000).toLocaleString("es-AR", { maximumFractionDigits: 2 })} L`;

export default function ProgressStats({ progress }: { progress: WaterProgress }) {
  return (
    <>
      <View style={styles.stats}>
        <InfoCard icon="water-outline" value={liters(progress.average)} title="Promedio diario" description="Del período" />
        <InfoCard icon="checkmark-circle-outline" value={`${progress.completedDays}/${progress.days}`} title="Días cumplidos" description={`Objetivo: ${liters(progress.goal)}`} />
      </View>
      <InfoCard horizontal icon="water" value={liters(progress.total)} title="Consumo total" description="Todas las fechas registradas" />
      <Text style={styles.footnote}>
        El promedio incluye los días sin carga. Los días cumplidos se calculan con tu objetivo actual.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: 12, marginTop: 8 },
  footnote: { color: "#7896AA", fontSize: 12, lineHeight: 18, marginTop: 4 },
});

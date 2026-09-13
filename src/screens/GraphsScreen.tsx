import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProgressToolbar from "../components/progress/ProgressToolbar";
import ProgressChartCard from "../components/progress/ProgressChartCard";
import ProgressStats from "../components/progress/ProgressStats";
import useWaterProgress from "../hooks/useWaterProgress";
import { ProgressPeriod } from "../services/ProgressService";

export default function GraphsScreen() {
  const [period, setPeriod] = useState<ProgressPeriod>("week");
  const { progress, loading, error, setLoading, retry } = useWaterProgress(period);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Tu progreso</Text>
        <Text style={styles.subtitle}>Mirá cómo venís con tu hidratación</Text>
        <ProgressToolbar
          period={period}
          progress={progress}
          loading={loading}
          error={error}
          onChange={value => { setLoading(true); setPeriod(value); }}
        />
        {loading ? (
          <ActivityIndicator style={styles.loading} color="#69D5FF" size="large" accessibilityLabel="Cargando progreso" />
        ) : error ? (
          <View style={styles.chartCard}>
            <Text style={styles.subtitle}>No se pudo leer tu historial.</Text>
            <Pressable accessibilityRole="button" style={styles.select} onPress={retry}>
              <Text style={styles.selectText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : progress && (
          <>
            <ProgressChartCard period={period} progress={progress} />
            <ProgressStats progress={progress} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#061725" },
  content: { padding: 22, paddingBottom: 32, gap: 12 },
  title: { color: "#FFFFFF", fontSize: 30, fontWeight: "800", marginTop: 8 },
  subtitle: { color: "#9BB9CD", fontSize: 15, lineHeight: 22 },
  loading: { paddingVertical: 100 },
  chartCard: {
    padding: 14,
    gap: 16,
    backgroundColor: "#0A2133",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#21475F",
  },
  select: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: "#0C293D",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2D6281",
  },
  selectText: { color: "#DDF4FF", fontSize: 14, fontWeight: "600" },
});

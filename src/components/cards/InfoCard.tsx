import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface InfoCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  title: string;
  description: string;
  horizontal?: boolean;
}

export default function InfoCard({ icon, value, title, description, horizontal = false }: InfoCardProps) {
  return (
    <View style={[styles.statCard, horizontal && styles.totalCard]}>
      <View style={horizontal ? styles.totalIcon : undefined}>
        <Ionicons name={icon} size={horizontal ? 29 : 23} color="#69CCFF" />
      </View>
      {horizontal ? (
        <>
          <View style={styles.description}>
            <Text style={styles.statLabel}>{title}</Text>
            <Text style={styles.caption}>{description}</Text>
          </View>
          <Text style={styles.statValue}>{value}</Text>
        </>
      ) : (
        <>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{title}</Text>
          <Text style={styles.caption}>{description}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  description: { flex: 1, gap: 4 },
  statCard: {
    flex: 1,
    backgroundColor: "#0A2133",
    borderWidth: 1,
    borderColor: "#2D729C",
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  statValue: {
    color: "#E3F6FF",
    fontSize: 25,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  statLabel: { color: "#C7E4F4", fontSize: 14, fontWeight: "600" },
  caption: { color: "#8FAEC4", fontSize: 12, lineHeight: 18 },
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  totalIcon: { padding: 10, backgroundColor: "#11354C", borderRadius: 15 },
});

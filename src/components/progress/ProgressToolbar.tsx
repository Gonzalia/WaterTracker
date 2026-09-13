import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProgressPeriod, WaterProgress } from "../../services/ProgressService";

const options: { value: ProgressPeriod; label: string }[] = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
];
const dateLabel = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
};

interface Props {
  period: ProgressPeriod;
  progress: WaterProgress | null;
  loading: boolean;
  error: boolean;
  onChange: (period: ProgressPeriod) => void;
}

export default function ProgressToolbar({ period, progress, loading, error, onChange }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.toolbar}>
      <View style={{ flex: 1 }}>
        <Text style={styles.heading}>Tu consumo de agua</Text>
        <Text style={styles.caption}>
          {progress && !loading && !error
            ? `${dateLabel(progress.start)} – ${dateLabel(progress.end)}`
            : "Cargando período…"}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Seleccionar período"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={styles.select}
      >
        <Text style={styles.selectText}>
          {options.find((option) => option.value === period)?.label}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          color="#79D5FF"
          size={16}
        />
      </Pressable>
      {open && (
        <View style={styles.options}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: period === option.value }}
              style={[
                styles.option,
                period === option.value && styles.selected,
              ]}
              onPress={() => {
                if (period !== option.value) {
                  onChange(option.value);
                }
                setOpen(false);
              }}
            >
              <Text style={styles.selectText}>{option.label}</Text>
              {period === option.value && (
                <Ionicons name="checkmark" size={18} color="#79D5FF" />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    position: "relative",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 22,
    marginBottom: 4,
  },
  heading: {
    color: "#EBF8FF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  caption: { color: "#8FAEC4", fontSize: 12, lineHeight: 18 },
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
  options: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 8,
    zIndex: 20,
    elevation: 8,
    width: 155,
    padding: 6,
    gap: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2D6281",
    backgroundColor: "#0C2437",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
  },
  selected: { backgroundColor: "#174563" },
});

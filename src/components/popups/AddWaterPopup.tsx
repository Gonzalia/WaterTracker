import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { addWater, getWaterDateKey } from "../../services/WaterService";
import styles from "./popupStyles";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: (total: number, date: Date) => void;
}
const amounts = Array.from({ length: 20 }, (_, i) => (i + 1) * 250);

export default function AddWaterPopup({ visible, onClose, onSaved }: Props) {
  const [amount, setAmount] = useState(250);
  const [date, setDate] = useState(new Date());
  const [month, setMonth] = useState(new Date());
  const [calendar, setCalendar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  useEffect(() => {
    if (visible) {
      const today = new Date();
      setAmount(250);
      setDate(today);
      setMonth(today);
      setCalendar(false);
      setError("");
    }
  }, [visible]);

  const today = new Date();
  const yesterday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 1,
    12,
  );
  const selectedKey = getWaterDateKey(date);
  const todayKey = getWaterDateKey(today);
  const firstWeekday =
    (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const canGoForward =
    month.getFullYear() < today.getFullYear() ||
    (month.getFullYear() === today.getFullYear() &&
      month.getMonth() < today.getMonth());
  const chooseDate = (value: Date) => {
    setDate(value);
    setMonth(value);
  };

  const save = async () => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      const total = await addWater(amount, date);
      onSaved(total, date);
      onClose();
    } catch {
      setError("No se pudo guardar el agua. Intentá de nuevo.");
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!busy.current) onClose();
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Cargar agua</Text>
            <Text style={styles.label}>Cantidad: {amount} ml</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              contentContainerStyle={styles.row}
            >
              {amounts.map((value) => (
                <Pressable
                  key={value}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityState={{ selected: value === amount }}
                  onPress={() => setAmount(value)}
                  style={[styles.option, value === amount && styles.selected]}
                >
                  <Text style={styles.text}>{value} ml</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.label}>¿Cuándo la tomaste?</Text>
            <View style={styles.wrap}>
              {[
                { label: "Hoy", value: today },
                { label: "Ayer", value: yesterday },
              ].map((option) => (
                <Pressable
                  key={option.label}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected:
                      !calendar &&
                      selectedKey === getWaterDateKey(option.value),
                  }}
                  style={[
                    styles.option,
                    !calendar &&
                      selectedKey === getWaterDateKey(option.value) &&
                      styles.selected,
                  ]}
                  onPress={() => {
                    chooseDate(option.value);
                    setCalendar(false);
                  }}
                >
                  <Text style={styles.text}>{option.label}</Text>
                </Pressable>
              ))}
              <Pressable
                disabled={saving}
                accessibilityRole="button"
                accessibilityState={{ expanded: calendar, selected: calendar }}
                style={[styles.option, calendar && styles.selected]}
                onPress={() => setCalendar(true)}
              >
                <Text style={styles.text}>Otra fecha</Text>
              </Pressable>
            </View>
            <Text style={styles.label}>
              {date.toLocaleDateString("es-AR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
            {calendar && (
              <View style={calendarStyles.container}>
                <View style={styles.row}>
                  <Pressable
                    disabled={saving}
                    accessibilityRole="button"
                    accessibilityLabel="Mes anterior"
                    style={styles.option}
                    onPress={() =>
                      setMonth(
                        new Date(month.getFullYear(), month.getMonth() - 1, 1),
                      )
                    }
                  >
                    <Text style={styles.text}>‹</Text>
                  </Pressable>
                  <Text style={[styles.text, { flex: 1 }]}>
                    {month.toLocaleDateString("es-AR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                  <Pressable
                    disabled={saving || !canGoForward}
                    accessibilityRole="button"
                    accessibilityLabel="Mes siguiente"
                    style={[styles.option, !canGoForward && styles.disabled]}
                    onPress={() =>
                      setMonth(
                        new Date(month.getFullYear(), month.getMonth() + 1, 1),
                      )
                    }
                  >
                    <Text style={styles.text}>›</Text>
                  </Pressable>
                </View>
                <View style={calendarStyles.grid}>
                  {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
                    <View key={`label${index}`} style={calendarStyles.cell}>
                      <Text style={styles.label}>{day}</Text>
                    </View>
                  ))}
                  {Array.from({ length: firstWeekday }, (_, i) => (
                    <View key={`blank${i}`} style={calendarStyles.cell} />
                  ))}
                  {Array.from({ length: days }, (_, i) => {
                    const value = new Date(
                      month.getFullYear(),
                      month.getMonth(),
                      i + 1,
                      12,
                    );
                    const key = getWaterDateKey(value);
                    const future = key > todayKey;
                    return (
                      <Pressable
                        key={key}
                        disabled={saving || future}
                        accessibilityRole="button"
                        accessibilityLabel={value.toLocaleDateString("es-AR")}
                        accessibilityState={{
                          selected: key === selectedKey,
                          disabled: future || saving,
                        }}
                        style={[
                          calendarStyles.cell,
                          key === selectedKey && calendarStyles.selected,
                          future && styles.disabled,
                        ]}
                        onPress={() => setDate(value)}
                      >
                        <Text style={styles.text}>{i + 1}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
            {!!error && (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={save}
              style={[styles.primary, saving && styles.disabled]}
            >
              <Text style={styles.primaryText}>
                {saving ? "Guardando…" : `Agregar ${amount} ml`}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={onClose}
              style={styles.cancel}
            >
              <Text style={styles.text}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const calendarStyles = StyleSheet.create({
  container: { gap: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: "14.285714%",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  selected: {
    backgroundColor: "#165276",
    borderWidth: 1,
    borderColor: "#A9E4FF",
  },
});

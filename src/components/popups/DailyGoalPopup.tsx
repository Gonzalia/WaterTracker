import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GoalSelector from "../selectors/GoalSelector";
import styles from "./popupStyles";

interface Props {
  visible: boolean;
  goal: number;
  onClose: () => void;
  onSaved: (goal: number) => void;
}

export default function DailyGoalPopup({
  visible,
  goal,
  onClose,
  onSaved,
}: Props) {
  const [selected, setSelected] = useState(goal);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  useEffect(() => {
    if (visible) {
      setSelected(goal);
      setError("");
    }
  }, [visible, goal]);

  const save = async () => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      await AsyncStorage.setItem("dailyGoal", String(selected));
      onSaved(selected);
      onClose();
    } catch {
      setError("No se pudo guardar el objetivo. Intentá de nuevo.");
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
            <Text style={styles.title}>Cambiar objetivo</Text>
            <Text style={styles.label}>Elegí cuánto querés tomar por día.</Text>
            <View pointerEvents={saving ? "none" : "auto"}>
              <GoalSelector value={selected} onChange={setSelected} />
            </View>
            {!!error && (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              style={[styles.primary, saving && styles.disabled]}
              disabled={saving}
              onPress={save}
            >
              <Text style={styles.primaryText}>
                {saving ? "Guardando…" : "Guardar objetivo"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={styles.cancel}
              disabled={saving}
              onPress={onClose}
            >
              <Text style={styles.text}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

import { ScrollView, StyleSheet, Text, Pressable, View } from "react-native";
import Colors from "../../constants/Colors";

interface GoalSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const goals = Array.from({ length: 17 }, (_, index) => 1000 + index * 250);

const GoalSelector = ({ value, onChange }: GoalSelectorProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Objetivo diario</Text>

      <Text style={styles.selected}>
        {(value / 1000).toFixed(value % 1000 === 0 ? 0 : 2)} L
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {goals.map((goal) => {
          const selected = goal === value;

          return (
            <Pressable
              key={goal}
              onPress={() => onChange(goal)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text
                style={[
                  styles.optionText,
                  selected && styles.optionTextSelected,
                ]}
              >
                {goal / 1000}L
              </Text>

              {selected && (
                <View style={styles.check}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default GoalSelector;

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  title: {
    color: Colors.WHITE,
    fontSize: 20,
    fontWeight: "700",
  },
  selected: {
    color: Colors.LIGHTBLUE,
    fontSize: 36,
    fontWeight: "700",
  },
  scrollContent: {
    gap: 12,
    paddingVertical: 6,
    paddingRight: 24,
  },
  option: {
    minWidth: 82,
    height: 74,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.DARKBLUE,
    borderRadius: 18,
    backgroundColor: "#0C2437",
  },
  optionSelected: {
    borderColor: Colors.LIGHTBLUE,
    backgroundColor: Colors.DARKBLUE,
  },
  optionText: {
    color: Colors.GRAY2,
    fontSize: 16,
    fontWeight: "600",
  },
  optionTextSelected: {
    color: Colors.WHITE,
  },
  check: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.LIGHTBLUE,
    justifyContent: "center",
    alignItems: "center",
  },
  checkText: {
    color: Colors.DARKGRAY,
    fontSize: 12,
    fontWeight: "900",
  },
});

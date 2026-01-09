import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Task } from '../../../types';

interface TaskItemProps {
  task: Task;
  onToggleDone: (id: string) => void;
}

export function TaskItem({ task, onToggleDone }: TaskItemProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggleDone(task.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.done }}
        accessibilityLabel={`Toggle ${task.title}`}
      >
        <View style={[styles.checkboxInner, task.done && styles.checkboxChecked]}>
          {task.done && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
      <Text style={[styles.title, task.done && styles.titleDone]}>{task.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
});

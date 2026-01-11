import { memo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { Task } from '../../../types';

interface TaskItemProps {
  task: Task;
  isEditing?: boolean;
  onToggleDone: (id: string) => void;
  onStartEdit?: (id: string) => void;
  onSaveEdit?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
}

function TaskItemComponent({
  task,
  isEditing = false,
  onToggleDone,
  onStartEdit,
  onSaveEdit,
  onDelete,
}: TaskItemProps) {
  const [editTitle, setEditTitle] = useState(task.title);

  const handleRowPress = () => {
    if (!isEditing && onStartEdit) {
      onStartEdit(task.id);
    }
  };

  const handleSave = () => {
    onSaveEdit?.(task.id, editTitle);
  };

  const handleDelete = () => {
    onDelete?.(task.id);
  };

  if (isEditing) {
    return (
      <View style={[styles.container, styles.containerEditing]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSave}
          accessibilityLabel="Save task"
          accessibilityRole="button"
        >
          <Text style={styles.actionButtonText}>✓</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.editInput}
          value={editTitle}
          onChangeText={setEditTitle}
          onSubmitEditing={handleSave}
          onBlur={handleSave}
          autoFocus
          selectTextOnFocus
          returnKeyType="done"
          accessibilityLabel="Edit task title"
        />
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          accessibilityLabel="Delete task"
          accessibilityRole="button"
        >
          <Text style={styles.actionButtonText}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleRowPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${task.title}`}
    >
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
    </TouchableOpacity>
  );
}

export const TaskItem = memo(TaskItemComponent);

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
  containerEditing: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
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
  editInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginHorizontal: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 16,
  },
});

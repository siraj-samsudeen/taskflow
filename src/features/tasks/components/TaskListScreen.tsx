  import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { Task } from '../../../types';
import { TaskItem } from './TaskItem';

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Set up project structure', done: true, created_at: '2024-01-01T10:00:00Z' },
  { id: '2', title: 'Implement task list UI', done: false, created_at: '2024-01-02T10:00:00Z' },
  { id: '3', title: 'Add toggle done functionality', done: false, created_at: '2024-01-03T10:00:00Z' },
  { id: '4', title: 'Write tests', done: false, created_at: '2024-01-04T10:00:00Z' },
];

export function TaskListScreen() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const handleToggleDone = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskItem task={item} onToggleDone={handleToggleDone} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});  
  


import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { Task } from '../../../types';
import { TaskItem } from './TaskItem';

type FilterTab = 'all' | 'active' | 'done';

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Set up project structure', done: true, created_at: '2024-01-01T10:00:00Z' },
  { id: '2', title: 'Implement task list UI', done: false, created_at: '2024-01-02T10:00:00Z' },
  {
    id: '3',
    title: 'Add toggle done functionality',
    done: false,
    created_at: '2024-01-03T10:00:00Z',
  },
  { id: '4', title: 'Write tests', done: false, created_at: '2024-01-04T10:00:00Z' },
];

export function TaskListScreen() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('active');

  const { activeTasks, doneTasks } = useMemo(() => {
    const sortByNewest = (a: Task, b: Task) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return {
      activeTasks: tasks.filter((t) => !t.done).sort(sortByNewest),
      doneTasks: tasks.filter((t) => t.done).sort(sortByNewest),
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (activeTab === 'active') return activeTasks;
    if (activeTab === 'done') return doneTasks;
    return [...activeTasks, ...doneTasks];
  }, [activeTab, activeTasks, doneTasks]);

  const handleToggleDone = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const handleAddTask = () => {
    const trimmedTitle = newTaskTitle.trim();
    if (!trimmedTitle) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: trimmedTitle,
      done: false,
      created_at: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          placeholderTextColor="#999"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addButton, !newTaskTitle.trim() && styles.addButtonDisabled]}
          onPress={handleAddTask}
          disabled={!newTaskTitle.trim()}
          accessibilityLabel="Add task"
          accessibilityRole="button"
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'all' }}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'active' }}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active ({activeTasks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'done' && styles.tabActive]}
          onPress={() => setActiveTab('done')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'done' }}
        >
          <Text style={[styles.tabText, activeTab === 'done' && styles.tabTextActive]}>Done</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredTasks}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    color: '#000',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 26,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db, id } from '../../../lib/instant';
import { TaskItem } from './TaskItem';

type FilterTab = 'all' | 'active' | 'done';

interface DisplayTask {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
}

export function TaskListScreen() {
  const { isLoading, data } = db.useQuery({ tasks: {} });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('active');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const tasks: DisplayTask[] = useMemo(() => {
    return (data?.tasks ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      done: t.done,
      createdAt: t.createdAt,
    }));
  }, [data?.tasks]);

  const { activeTasks, doneTasks } = useMemo(() => {
    const sortByNewest = (a: DisplayTask, b: DisplayTask) => b.createdAt - a.createdAt;
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

  const handleToggleDone = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      db.transact(
        db.tx.tasks[taskId].update({
          done: !task.done,
          updatedAt: Date.now(),
        })
      );
    }
  };

  const handleAddTask = async () => {
    const trimmedTitle = newTaskTitle.trim();
    if (!trimmedTitle) return;

    const now = Date.now();
    db.transact(
      db.tx.tasks[id()].update({
        title: trimmedTitle,
        description: '',
        done: false,
        priority: 'medium',
        createdAt: now,
        updatedAt: now,
      })
    );

    setNewTaskTitle('');
  };

  const handleStartEdit = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleSaveEdit = async (taskId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (trimmed) {
      db.transact(
        db.tx.tasks[taskId].update({
          title: trimmed,
          updatedAt: Date.now(),
        })
      );
    }
    setEditingTaskId(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    db.transact(db.tx.tasks[taskId].delete());
    setEditingTaskId(null);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
        renderItem={({ item }) => (
          <TaskItem
            task={{ id: item.id, title: item.title, done: item.done, created_at: String(item.createdAt) }}
            isEditing={editingTaskId === item.id}
            onToggleDone={handleToggleDone}
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onDelete={handleDeleteTask}
          />
        )}
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

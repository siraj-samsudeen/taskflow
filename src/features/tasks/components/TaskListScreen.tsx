import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRxDBContext } from '../../../contexts/RxDBContext';
import type { TaskDoc } from '../../../lib/rxdb-schema';
import { TaskItem } from './TaskItem';

type FilterTab = 'all' | 'active' | 'done';

interface DisplayTask {
  id: string;
  title: string;
  done: boolean;
  created_at: string;
}

function toDisplayTask(doc: TaskDoc): DisplayTask {
  return {
    id: doc.id,
    title: doc.title,
    done: doc.status === 'done',
    created_at: doc.created_at,
  };
}

export function TaskListScreen() {
  const { db, isReady } = useRxDBContext();
  const [tasks, setTasks] = useState<DisplayTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('active');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !isReady) return;

    const subscription = db.tasks
      .find({
        selector: { isDeleted: false },
      })
      .$.subscribe((docs) => {
        setTasks(docs.map((d) => toDisplayTask(d.toJSON())));
      });

    return () => subscription.unsubscribe();
  }, [db, isReady]);

  const { activeTasks, doneTasks } = useMemo(() => {
    const sortByNewest = (a: DisplayTask, b: DisplayTask) =>
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

  const handleToggleDone = async (id: string) => {
    if (!db) return;
    const doc = await db.tasks.findOne(id).exec();
    if (doc) {
      await doc.patch({
        status: doc.status === 'done' ? 'todo' : 'done',
        updated_at: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      });
    }
  };

  const handleAddTask = async () => {
    const trimmedTitle = newTaskTitle.trim();
    if (!trimmedTitle || !db) return;

    const now = new Date().toISOString();
    await db.tasks.insert({
      id: crypto.randomUUID(),
      title: trimmedTitle,
      description: null,
      status: 'todo',
      priority: 'medium',
      project_id: null,
      due_date: null,
      assigned_to: null,
      created_at: now,
      updated_at: now,
      isDeleted: false,
      modifiedAt: now,
    });

    setNewTaskTitle('');
  };

  const handleStartEdit = (id: string) => {
    setEditingTaskId(id);
  };

  const handleSaveEdit = async (id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (trimmed && db) {
      const doc = await db.tasks.findOne(id).exec();
      if (doc) {
        await doc.patch({
          title: trimmed,
          updated_at: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
        });
      }
    }
    setEditingTaskId(null);
  };

  const handleDeleteTask = async (id: string) => {
    if (!db) return;
    const doc = await db.tasks.findOne(id).exec();
    if (doc) {
      await doc.patch({
        isDeleted: true,
        modifiedAt: new Date().toISOString(),
      });
    }
    setEditingTaskId(null);
  };

  if (!isReady) {
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
            task={item}
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

import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppButton, AppText, AppTextInput, colors, spacing } from '../../../components/ui';
import { db } from '../../../lib/instant';
import { taskRepository } from '../api/taskRepository';
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
      await taskRepository.toggleTask(taskId, task.done);
    }
  };

  const handleAddTask = async () => {
    const trimmedTitle = newTaskTitle.trim();
    if (!trimmedTitle) return;

    await taskRepository.addTask(trimmedTitle);
    setNewTaskTitle('');
  };

  const handleStartEdit = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleSaveEdit = async (taskId: string, newTitle: string) => {
    await taskRepository.updateTaskTitle(taskId, newTitle);
    setEditingTaskId(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    await taskRepository.deleteTask(taskId);
    setEditingTaskId(null);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppText>Loading...</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <AppTextInput
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
          style={styles.input}
        />
        <AppButton
          label="+"
          onPress={handleAddTask}
          disabled={!newTaskTitle.trim()}
          accessibilityLabel="Add task"
          style={styles.addButton}
        />
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'all' }}
        >
          <AppText variant="captionMedium" color={activeTab === 'all' ? colors.primary : colors.gray600}>
            All
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'active' }}
        >
          <AppText variant="captionMedium" color={activeTab === 'active' ? colors.primary : colors.gray600}>
            Active ({activeTasks.length})
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'done' && styles.tabActive]}
          onPress={() => setActiveTab('done')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'done' }}
        >
          <AppText variant="captionMedium" color={activeTab === 'done' ? colors.primary : colors.gray600}>
            Done
          </AppText>
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
    backgroundColor: colors.gray50,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
  },
  addButton: {
    width: 36,
    height: 36,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
});

import { db, id } from '../../../lib/instant';

export const taskRepository = {
  async addTask(title: string): Promise<string> {
    const taskId = id();
    const now = Date.now();

    db.transact(
      db.tx.tasks[taskId].update({
        title,
        description: '',
        done: false,
        priority: 'medium',
        createdAt: now,
        updatedAt: now,
      })
    );

    return taskId;
  },

  async toggleTask(taskId: string, currentDone: boolean): Promise<void> {
    db.transact(
      db.tx.tasks[taskId].update({
        done: !currentDone,
        updatedAt: Date.now(),
      })
    );
  },

  async updateTaskTitle(taskId: string, title: string): Promise<void> {
    const trimmed = title.trim();
    if (!trimmed) return;

    db.transact(
      db.tx.tasks[taskId].update({
        title: trimmed,
        updatedAt: Date.now(),
      })
    );
  },

  async deleteTask(taskId: string): Promise<void> {
    db.transact(db.tx.tasks[taskId].delete());
  },
};

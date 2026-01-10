import { i } from '@instantdb/react-native';

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    clients: i.entity({
      name: i.string().indexed(),
      color: i.string(),
      createdAt: i.number().indexed(),
    }),
    projects: i.entity({
      name: i.string().indexed(),
      description: i.string().optional(),
      status: i.string().indexed(),
      createdAt: i.number().indexed(),
    }),
    tasks: i.entity({
      title: i.string().indexed(),
      description: i.string().optional(),
      done: i.boolean().indexed(),
      priority: i.string().indexed(),
      dueDate: i.number().optional().indexed(),
      createdAt: i.number().indexed(),
      updatedAt: i.number().indexed(),
    }),
    teamMembers: i.entity({
      name: i.string().indexed(),
      email: i.string().unique().indexed(),
      avatarUrl: i.string().optional(),
      createdAt: i.number().indexed(),
    }),
  },
  links: {
    projectClient: {
      forward: { on: 'projects', has: 'one', label: 'client' },
      reverse: { on: 'clients', has: 'many', label: 'projects' },
    },
    taskProject: {
      forward: { on: 'tasks', has: 'one', label: 'project' },
      reverse: { on: 'projects', has: 'many', label: 'tasks' },
    },
    taskAssignee: {
      forward: { on: 'tasks', has: 'one', label: 'assignee' },
      reverse: { on: 'teamMembers', has: 'many', label: 'assignedTasks' },
    },
    teamMemberUser: {
      forward: { on: 'teamMembers', has: 'one', label: 'user' },
      reverse: { on: '$users', has: 'one', label: 'profile' },
    },
  },
});

export type AppSchema = typeof _schema;
export default _schema;

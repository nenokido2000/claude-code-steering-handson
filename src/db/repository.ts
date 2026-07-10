export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

const todos: Todo[] = [];
let nextId = 1;

export const repository = {
  findAll(): Todo[] {
    return [...todos];
  },

  findById(id: number): Todo | undefined {
    return todos.find((t) => t.id === id);
  },

  create(title: string): Todo {
    const todo: Todo = {
      id: nextId++,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    todos.push(todo);
    return todo;
  },

  update(id: number, changes: Partial<Pick<Todo, 'title' | 'completed'>>): Todo | undefined {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return undefined;
    if (changes.title !== undefined) todo.title = changes.title;
    if (changes.completed !== undefined) todo.completed = changes.completed;
    return todo;
  },

  delete(id: number): boolean {
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return false;
    todos.splice(index, 1);
    return true;
  },

  clear(): void {
    todos.length = 0;
    nextId = 1;
  },
};

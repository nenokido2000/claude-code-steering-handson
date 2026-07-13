export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  categoryId: number | null;
  tagId: number | null;
  createdAt: string;
}

const todos: Todo[] = [];
let nextId = 1;

export const todoRepository = {
  findAll(): Todo[] {
    return [...todos];
  },

  findById(id: number): Todo | undefined {
    return todos.find((t) => t.id === id);
  },

  create(title: string, categoryId: number | null = null, tagId: number | null = null): Todo {
    const todo: Todo = {
      id: nextId++,
      title,
      completed: false,
      categoryId,
      tagId,
      createdAt: new Date().toISOString(),
    };
    todos.push(todo);
    return todo;
  },

  update(
    id: number,
    changes: Partial<Pick<Todo, 'title' | 'completed' | 'categoryId' | 'tagId'>>,
  ): Todo | undefined {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return undefined;
    if (changes.title !== undefined) todo.title = changes.title;
    if (changes.completed !== undefined) todo.completed = changes.completed;
    if (changes.categoryId !== undefined) todo.categoryId = changes.categoryId;
    if (changes.tagId !== undefined) todo.tagId = changes.tagId;
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

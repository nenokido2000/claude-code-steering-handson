export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

const categories: Category[] = [];
let nextId = 1;

export const categoryRepository = {
  findAll(): Category[] {
    return [...categories];
  },

  findById(id: number): Category | undefined {
    return categories.find((c) => c.id === id);
  },

  create(name: string, description: string): Category {
    const category: Category = {
      id: nextId++,
      name,
      description,
      createdAt: new Date().toISOString(),
    };
    categories.push(category);
    return category;
  },

  update(id: number, changes: Partial<Pick<Category, 'name' | 'description'>>): Category | undefined {
    const category = categories.find((c) => c.id === id);
    if (!category) return undefined;
    if (changes.name !== undefined) category.name = changes.name;
    if (changes.description !== undefined) category.description = changes.description;
    return category;
  },

  delete(id: number): boolean {
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return false;
    categories.splice(index, 1);
    return true;
  },

  clear(): void {
    categories.length = 0;
    nextId = 1;
  },
};

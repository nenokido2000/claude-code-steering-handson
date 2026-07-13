export interface Tag {
  id: number;
  name: string;
  createdAt: string;
}

const tags: Tag[] = [];
let nextId = 1;

export const tagRepository = {
  findAll(): Tag[] {
    return [...tags];
  },

  findById(id: number): Tag | undefined {
    return tags.find((t) => t.id === id);
  },

  create(name: string): Tag {
    const tag: Tag = {
      id: nextId++,
      name,
      createdAt: new Date().toISOString(),
    };
    tags.push(tag);
    return tag;
  },

  update(id: number, changes: Partial<Pick<Tag, 'name'>>): Tag | undefined {
    const tag = tags.find((t) => t.id === id);
    if (!tag) return undefined;
    if (changes.name !== undefined) tag.name = changes.name;
    return tag;
  },

  delete(id: number): boolean {
    const index = tags.findIndex((t) => t.id === id);
    if (index === -1) return false;
    tags.splice(index, 1);
    return true;
  },

  clear(): void {
    tags.length = 0;
    nextId = 1;
  },
};

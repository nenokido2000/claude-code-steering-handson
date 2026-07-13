import { Request, Response } from 'express';
import { todoRepository } from '../db/todo-repository';
import { categoryRepository } from '../db/category-repository';
import { tagRepository } from '../db/tag-repository';
import { logger } from '../utils/logger';

export function getTodos(req: Request, res: Response): void {
  const todos = todoRepository.findAll();
  logger.info('GET /todos', { count: todos.length });
  res.json(todos);
}

export function getTodo(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const todo = todoRepository.findById(id);
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  res.json(todo);
}

export function createTodo(req: Request, res: Response): void {
  const { title, categoryId, tagId } = req.body as {
    title?: string;
    categoryId?: number | null;
    tagId?: number | null;
  };
  if (!title || title.trim() === '') {
    res.status(400).json({ error: 'title is required' });
    return;
  }
  if (categoryId !== undefined && categoryId !== null && !categoryRepository.findById(categoryId)) {
    res.status(400).json({ error: 'categoryId not found' });
    return;
  }
  if (tagId !== undefined && tagId !== null && !tagRepository.findById(tagId)) {
    res.status(400).json({ error: 'tagId not found' });
    return;
  }
  const todo = todoRepository.create(title.trim(), categoryId ?? null, tagId ?? null);
  logger.info('Created todo', { id: todo.id });
  res.status(201).json(todo);
}

export function updateTodo(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const { title, completed, categoryId, tagId } = req.body as {
    title?: string;
    completed?: boolean;
    categoryId?: number | null;
    tagId?: number | null;
  };
  if (categoryId !== undefined && categoryId !== null && !categoryRepository.findById(categoryId)) {
    res.status(400).json({ error: 'categoryId not found' });
    return;
  }
  if (tagId !== undefined && tagId !== null && !tagRepository.findById(tagId)) {
    res.status(400).json({ error: 'tagId not found' });
    return;
  }
  const todo = todoRepository.update(id, { title, completed, categoryId, tagId });
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  logger.info('Updated todo', { id });
  res.json(todo);
}

export function deleteTodo(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const deleted = todoRepository.delete(id);
  if (!deleted) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  logger.info('Deleted todo', { id });
  res.status(204).send();
}

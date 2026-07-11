import { Request, Response } from 'express';
import { todoRepository } from '../db/todo-repository';
import { categoryRepository } from '../db/category-repository';
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
  const { title, categoryId } = req.body as { title?: string; categoryId?: number | null };
  if (!title || title.trim() === '') {
    res.status(400).json({ error: 'title is required' });
    return;
  }
  if (categoryId !== undefined && categoryId !== null && !categoryRepository.findById(categoryId)) {
    res.status(400).json({ error: 'categoryId not found' });
    return;
  }
  const todo = todoRepository.create(title.trim(), categoryId ?? null);
  logger.info('Created todo', { id: todo.id });
  res.status(201).json(todo);
}

export function updateTodo(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const { title, completed, categoryId } = req.body as {
    title?: string;
    completed?: boolean;
    categoryId?: number | null;
  };
  if (categoryId !== undefined && categoryId !== null && !categoryRepository.findById(categoryId)) {
    res.status(400).json({ error: 'categoryId not found' });
    return;
  }
  const todo = todoRepository.update(id, { title, completed, categoryId });
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

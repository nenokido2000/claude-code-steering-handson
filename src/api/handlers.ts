import { Request, Response } from 'express';
import { repository } from '../db/repository';
import { logger } from '../utils/logger';

export function getTodos(req: Request, res: Response): void {
  const todos = repository.findAll();
  logger.info('GET /todos', { count: todos.length });
  res.json(todos);
}

export function getTodo(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const todo = repository.findById(id);
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  res.json(todo);
}

export function createTodo(req: Request, res: Response): void {
  const { title } = req.body as { title?: string };
  if (!title || title.trim() === '') {
    res.status(400).json({ error: 'title is required' });
    return;
  }
  const todo = repository.create(title.trim());
  logger.info('Created todo', { id: todo.id });
  res.status(201).json(todo);
}

export function updateTodo(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const { title, completed } = req.body as { title?: string; completed?: boolean };
  const todo = repository.update(id, { title, completed });
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  logger.info('Updated todo', { id });
  res.json(todo);
}

export function deleteTodo(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const deleted = repository.delete(id);
  if (!deleted) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  logger.info('Deleted todo', { id });
  res.status(204).send();
}

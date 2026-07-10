import { Request, Response } from 'express';
import { categoryRepository } from '../db/category-repository';
import { logger } from '../utils/logger';

export function getCategories(req: Request, res: Response): void {
  const categories = categoryRepository.findAll();
  logger.info('GET /categories', { count: categories.length });
  res.json(categories);
}

export function getCategory(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const category = categoryRepository.findById(id);
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json(category);
}

export function createCategory(req: Request, res: Response): void {
  const { name, description } = req.body as { name?: string; description?: string };
  if (!name || name.trim() === '') {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const category = categoryRepository.create(name.trim(), description?.trim() ?? '');
  logger.info('Created category', { id: category.id });
  res.status(201).json(category);
}

export function updateCategory(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const { name, description } = req.body as { name?: string; description?: string };
  const category = categoryRepository.update(id, { name, description });
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  logger.info('Updated category', { id });
  res.json(category);
}

export function deleteCategory(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const deleted = categoryRepository.delete(id);
  if (!deleted) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  logger.info('Deleted category', { id });
  res.status(204).send();
}

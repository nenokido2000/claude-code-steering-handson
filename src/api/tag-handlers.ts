import { Request, Response } from 'express';
import { tagRepository } from '../db/tag-repository';
import { logger } from '../utils/logger';

export function getTags(req: Request, res: Response): void {
  const tags = tagRepository.findAll();
  logger.info('GET /tags', { count: tags.length });
  res.json(tags);
}

export function getTag(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const tag = tagRepository.findById(id);
  if (!tag) {
    res.status(404).json({ error: 'Tag not found' });
    return;
  }
  res.json(tag);
}

export function createTag(req: Request, res: Response): void {
  const { name } = req.body as { name?: string };
  if (!name || name.trim() === '') {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const tag = tagRepository.create(name.trim());
  logger.info('Created tag', { id: tag.id });
  res.status(201).json(tag);
}

export function updateTag(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const { name } = req.body as { name?: string };
  const tag = tagRepository.update(id, { name });
  if (!tag) {
    res.status(404).json({ error: 'Tag not found' });
    return;
  }
  logger.info('Updated tag', { id });
  res.json(tag);
}

export function deleteTag(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const deleted = tagRepository.delete(id);
  if (!deleted) {
    res.status(404).json({ error: 'Tag not found' });
    return;
  }
  logger.info('Deleted tag', { id });
  res.status(204).send();
}

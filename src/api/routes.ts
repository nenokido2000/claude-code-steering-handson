import { Router } from 'express';
import { getTodos, getTodo, createTodo, updateTodo, deleteTodo } from './todo-handlers';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from './category-handlers';
import { getTags, getTag, createTag, updateTag, deleteTag } from './tag-handlers';

const router = Router();

router.get('/todos', getTodos);
router.get('/todos/:id', getTodo);
router.post('/todos', createTodo);
router.patch('/todos/:id', updateTodo);
router.delete('/todos/:id', deleteTodo);

router.get('/categories', getCategories);
router.get('/categories/:id', getCategory);
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/tags', getTags);
router.get('/tags/:id', getTag);
router.post('/tags', createTag);
router.patch('/tags/:id', updateTag);
router.delete('/tags/:id', deleteTag);

export default router;

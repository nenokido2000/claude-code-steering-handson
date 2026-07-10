import { Router } from 'express';
import { getTodos, getTodo, createTodo, updateTodo, deleteTodo } from './handlers';

const router = Router();

router.get('/todos', getTodos);
router.get('/todos/:id', getTodo);
router.post('/todos', createTodo);
router.patch('/todos/:id', updateTodo);
router.delete('/todos/:id', deleteTodo);

export default router;

import request from 'supertest';
import { app } from '../src/index';
import { repository } from '../src/db/repository';

beforeEach(() => {
  repository.clear();
});

describe('GET /api/todos', () => {
  it('returns empty array initially', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/todos', () => {
  it('creates a todo', async () => {
    const res = await request(app).post('/api/todos').send({ title: 'Buy milk' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Buy milk');
    expect(res.body.completed).toBe(false);
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/todos').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/todos/:id', () => {
  it('returns 404 for missing todo', async () => {
    const res = await request(app).get('/api/todos/999');
    expect(res.status).toBe(404);
  });

  it('returns the todo', async () => {
    const created = await request(app).post('/api/todos').send({ title: 'Test' });
    const res = await request(app).get(`/api/todos/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Test');
  });
});

describe('PATCH /api/todos/:id', () => {
  it('updates completed status', async () => {
    const created = await request(app).post('/api/todos').send({ title: 'Task' });
    const res = await request(app)
      .patch(`/api/todos/${created.body.id}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });
});

describe('DELETE /api/todos/:id', () => {
  it('deletes a todo', async () => {
    const created = await request(app).post('/api/todos').send({ title: 'Delete me' });
    const res = await request(app).delete(`/api/todos/${created.body.id}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 for missing todo', async () => {
    const res = await request(app).delete('/api/todos/999');
    expect(res.status).toBe(404);
  });
});

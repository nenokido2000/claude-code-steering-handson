import request from 'supertest';
import { app } from '../src/index';
import { categoryRepository } from '../src/db/category-repository';

beforeEach(() => {
  categoryRepository.clear();
});

describe('GET /api/categories', () => {
  it('returns empty array initially', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/categories', () => {
  it('creates a category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Work', description: 'Work related tasks' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Work');
    expect(res.body.description).toBe('Work related tasks');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/categories').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/categories/:id', () => {
  it('returns 404 for missing category', async () => {
    const res = await request(app).get('/api/categories/999');
    expect(res.status).toBe(404);
  });

  it('returns the category', async () => {
    const created = await request(app).post('/api/categories').send({ name: 'Test' });
    const res = await request(app).get(`/api/categories/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test');
  });
});

describe('PATCH /api/categories/:id', () => {
  it('updates a category', async () => {
    const created = await request(app).post('/api/categories').send({ name: 'Task' });
    const res = await request(app)
      .patch(`/api/categories/${created.body.id}`)
      .send({ description: 'Updated description' });
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Updated description');
  });

  it('returns 404 for missing category', async () => {
    const res = await request(app).patch('/api/categories/999').send({ name: 'X' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/categories/:id', () => {
  it('deletes a category', async () => {
    const created = await request(app).post('/api/categories').send({ name: 'Delete me' });
    const res = await request(app).delete(`/api/categories/${created.body.id}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 for missing category', async () => {
    const res = await request(app).delete('/api/categories/999');
    expect(res.status).toBe(404);
  });
});

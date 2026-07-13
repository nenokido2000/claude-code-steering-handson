import request from 'supertest';
import { app } from '../src/index';
import { tagRepository } from '../src/db/tag-repository';

beforeEach(() => {
  tagRepository.clear();
});

describe('GET /api/tags', () => {
  it('returns empty array initially', async () => {
    const res = await request(app).get('/api/tags');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/tags', () => {
  it('creates a tag', async () => {
    const res = await request(app).post('/api/tags').send({ name: 'urgent' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('urgent');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/tags').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/tags/:id', () => {
  it('returns 404 for missing tag', async () => {
    const res = await request(app).get('/api/tags/999');
    expect(res.status).toBe(404);
  });

  it('returns the tag', async () => {
    const created = await request(app).post('/api/tags').send({ name: 'urgent' });
    const res = await request(app).get(`/api/tags/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('urgent');
  });
});

describe('PATCH /api/tags/:id', () => {
  it('updates a tag', async () => {
    const created = await request(app).post('/api/tags').send({ name: 'urgent' });
    const res = await request(app)
      .patch(`/api/tags/${created.body.id}`)
      .send({ name: 'important' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('important');
  });

  it('returns 404 for missing tag', async () => {
    const res = await request(app).patch('/api/tags/999').send({ name: 'x' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/tags/:id', () => {
  it('deletes a tag', async () => {
    const created = await request(app).post('/api/tags').send({ name: 'delete-me' });
    const res = await request(app).delete(`/api/tags/${created.body.id}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 for missing tag', async () => {
    const res = await request(app).delete('/api/tags/999');
    expect(res.status).toBe(404);
  });
});

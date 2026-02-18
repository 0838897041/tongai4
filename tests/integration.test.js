const request = require('supertest');
const app = require('../src/server');

describe('POST /prompt-check', () => {
  test('returns pass for valid input', async () => {
    const res = await request(app).post('/prompt-check').send({
      meta: { run_id: '9f1c2d3e-4a5b-6c7d-8e9f-0a1b2c3d4e5f', timestamp_utc: '2026-02-16T13:32:00Z' },
      original_prompt: 'สร้าง prompt ฝึกพูดอังกฤษ 30 วินาที',
      audience: 'developer',
      output_format: 'Markdown'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('pass');
  });

  test('returns RC001 for missing timestamp', async () => {
    const res = await request(app).post('/prompt-check').send({
      meta: { run_id: '2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d' },
      original_prompt: 'ข้อมูลเมตาขาด timestamp'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.reject_code).toBe('RC001');
  });

  test('returns RC003 for uncertainty term', async () => {
    const res = await request(app).post('/prompt-check').send({
      meta: { run_id: '7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a', timestamp_utc: '2026-02-16T13:32:00Z' },
      original_prompt: 'นายกรัฐมนตรีของไทยมีกี่คน อาจจะ...'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.reject_code).toBe('RC003');
  });
});

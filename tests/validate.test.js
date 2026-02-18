const { validatePayload } = require('../src/validate');

test('valid payload passes schema', () => {
  const payload = {
    meta: { run_id: '9f1c2d3e-4a5b-6c7d-8e9f-0a1b2c3d4e5f', timestamp_utc: '2026-02-16T13:32:00Z' },
    original_prompt: 'ทดสอบ prompt'
  };
  const { valid } = validatePayload(payload);
  expect(valid).toBe(true);
});

test('missing meta fails', () => {
  const payload = { original_prompt: 'x' };
  const { valid } = validatePayload(payload);
  expect(valid).toBe(false);
});

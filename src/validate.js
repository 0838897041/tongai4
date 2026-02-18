const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, strict: false });

const schema = {
  type: 'object',
  required: ['meta'],
  properties: {
    meta: {
      type: 'object',
      required: ['run_id','timestamp_utc'],
      properties: {
        run_id: { type: 'string', pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$' },
        timestamp_utc: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$' }
      }
    },
    original_prompt: { type: 'string' },
    audience: { type: 'string' },
    output_format: { type: 'string' }
  }
};

const validatePayload = (payload) => {
  const valid = ajv.validate(schema, payload);
  return { valid, errors: ajv.errors || [] };
};

module.exports = { validatePayload };

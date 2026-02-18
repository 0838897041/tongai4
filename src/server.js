const express = require('express');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');
const { validatePayload } = require('./validate');
const { detectUncertainty, detectPolitical, buildRewrittenPrompt } = require('./analyze');

const app = express();
app.use(express.json({ limit: '1mb' }));

function sendReject(res, code, message, meta = {}, report = {}) {
  const payload = {
    status: 'reject',
    reject_code: code,
    message,
    meta,
    report
  };
  res.status(code === 'RC001' ? 400 : 200).json(payload);
}

app.post('/prompt-check', (req, res) => {
  const requestId = uuidv4();
  const input = req.body || {};
  logger.info({ requestId, route: '/prompt-check', event: 'received' });

  const { valid, errors } = validatePayload(input);
  if (!valid) {
    logger.warn({ requestId, event: 'validation_failed', errors });
    return sendReject(res, 'RC001', 'meta.run_id หรือ meta.timestamp_utc ขาดหรือฟอร์แมตผิด', input.meta || {}, { summary: 'meta invalid', analysis: { errors } });
  }

  const prompt = input.original_prompt || '';
  const uncertainty = detectUncertainty(prompt);
  if (uncertainty.length) {
    logger.info({ requestId, event: 'uncertainty_detected', terms: uncertainty });
    return sendReject(res, 'RC003', `พบคำแสดงความไม่แน่นอน: ${uncertainty.join(',')}`, input.meta, { summary: 'พบคำแสดงความไม่แน่นอน', analysis: { uncertainty_terms_found: uncertainty, meta_valid: true } });
  }

  const political = detectPolitical(prompt);
  if (political) {
    logger.info({ requestId, event: 'political_flag' });
    return sendReject(res, 'RC002', 'คำขอมีลักษณะเป็นข้อเท็จจริงการเมือง ต้องยืนยันแหล่งข้อมูล', input.meta, { summary: 'คำขอเป็นข้อเท็จจริงการเมือง', analysis: { political_fact_request: true, meta_valid: true } });
  }

  const rewritten = buildRewrittenPrompt(input.meta, input);
  const response = {
    status: 'pass',
    reject_code: null,
    message: 'ผ่านการตรวจ',
    meta: input.meta,
    report: {
      summary: 'ผ่านการตรวจเบื้องต้น',
      analysis: { meta_valid: true },
      rewritten_prompt: rewritten,
      test_cases: []
    }
  };
  logger.info({ requestId, event: 'pass', meta: input.meta });
  res.json(response);
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => logger.info({ event: 'server_start', port }));
}

module.exports = app;

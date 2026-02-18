const uncertaintyTerms = ["อาจจะ","น่าจะ","อาจเป็นไปได้","อาจ"];
const politicalKeywords = ["นายกรัฐมนตรี","เลือกตั้ง","พรรค","รัฐมนตรี","กฎหมาย"];

function detectUncertainty(text) {
  if (!text) return [];
  return uncertaintyTerms.filter(t => text.includes(t));
}

function detectPolitical(text) {
  if (!text) return false;
  return politicalKeywords.some(k => text.includes(k));
}

function buildRewrittenPrompt(meta, input) {
  const audience = input.audience || 'unspecified';
  const output = input.output_format || 'Markdown';
  return `คุณคือ Prompt-Checker — Analyze and Rewrite (Thai, formal, production-ready). meta.run_id=${meta.run_id} timestamp_utc=${meta.timestamp_utc} audience=${audience} output_format=${output}. สร้าง Markdown ที่มี 8 ส่วน: สรุปงาน, การวิเคราะห์, Prompt ที่เขียนใหม่, กฎการตรวจสอบและตัวอย่างทดสอบ, ตัวอย่างการตอบกลับเมื่อไม่ผ่าน, คำแนะนำการใช้งาน, รายการตรวจสอบก่อนใช้งาน, ข้อมูลเมตาเพิ่มเติม. จำกัด summary ≤ 800 ตัวอักษร.`;
}

module.exports = { detectUncertainty, detectPolitical, buildRewrittenPrompt };

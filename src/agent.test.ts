import test from 'node:test';
import assert from 'node:assert/strict';
import { answerQuestion, searchPortfolio } from './agent.ts';
import { KB } from './knowledge.ts';

test('retrieval finds the source for a specific technical constraint', () => {
  assert.equal(searchPortfolio('Qwen2.5 offline VRAM')[0].doc.id, 'agribot');
});
test('agent answer ranks actual agent projects and cites known documents', () => {
  const result = answerQuestion('Show me his best agentic AI project');
  assert.equal(result.sources[0].id, 'agribot');
  assert.ok(result.sources.every((source) => KB.some((doc) => doc.id === source.id)));
});
test('research preserves accepted and preprint sources', () => {
  const result = answerQuestion('What research has he published?');
  assert.equal(result.sources.length, 4);
  assert.ok(result.sources.some((source) => source.summary.includes('accepted')));
  assert.ok(result.sources.some((source) => source.summary.includes('preprint')));
});
test('unknown, blank and markup input never invent an answer', () => {
  for (const question of [
    '',
    '   ',
    'quantum cheesemaking salary expectations',
    '<script>alert(document.cookie)</script>',
  ]) {
    const result = answerQuestion(question);
    assert.equal(result.weak, true);
    assert.equal(result.sources.length, 0);
  }
});
test('first questions a visitor asks are answered from profile documents', () => {
  for (const [question, id] of [
    ['What’s his tech stack?', 'skills'],
    ['Does he know Python?', 'skills'],
    ['Who is Asif?', 'about'],
    ['Where did he study?', 'education'],
    ['How can I contact him?', 'contact'],
    ['Tell me about the LinkedIn post generator', 'postgen'],
    ['What is the AI web scraper?', 'scraper'],
  ]) {
    const result = answerQuestion(question);
    assert.equal(result.weak, false, question);
    assert.ok(
      result.sources.some((source) => source.id === id),
      `${question} should cite ${id}`,
    );
  }
});
test('achievement questions cite the hackathon, Kaggle and reviewer records', () => {
  for (const question of ['What are his achievements?', 'Has he won anything?']) {
    const ids = answerQuestion(question).sources.map((source) => source.id);
    assert.deepEqual([...ids].sort(), ['ewu', 'kaggle', 'reviewer'], question);
  }
});
test('follow-up suggestions lead to answers, not dead ends', () => {
  const asked = new Set<string>();
  const queue = [...answerQuestion('Why hire Asif?').followUps];
  while (queue.length) {
    const question = queue.shift()!;
    if (asked.has(question)) continue;
    asked.add(question);
    const result = answerQuestion(question);
    assert.equal(result.weak, false, `“${question}” should have an answer`);
    queue.push(...result.followUps);
  }
  assert.ok(asked.size >= 8);
});

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

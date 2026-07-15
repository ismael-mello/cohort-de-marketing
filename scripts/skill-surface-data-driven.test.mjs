import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFile(path.join(ROOT, relative), 'utf8');
const json = async (relative) => JSON.parse(await read(relative));

async function loadContract() {
  const code = await read('mapa-skills-artifacts.js');
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: 'mapa-skills-artifacts.js' });
  assert.ok(sandbox.window.SkillSurfaceContract, 'SkillSurfaceContract precisa ser publicado pela distribuição');
  return sandbox.window.SkillSurfaceContract;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test('catálogo e regras formam um contrato único e completo das superfícies', async () => {
  const contract = await loadContract();
  const catalog = await json('data/skill-catalog.json');
  const rules = await json('data/skill-unlock-rules.json');
  const result = contract.validateContracts(catalog, rules);

  assert.equal(result.skills.length, catalog.skills.length);
  assert.deepEqual([...result.skills.map((skill) => skill.id)], catalog.skills.map((skill) => skill.id));
  assert.deepEqual([...result.edges.map(({ from, to, type }) => `${from}:${to}:${type}`)], catalog.edges.map(({ from, to, type }) => `${from}:${to}:${type}`));
});

test('inserir ou remover fixture muda a lista derivada sem literal de contagem', async () => {
  const contract = await loadContract();
  const catalog = await json('data/skill-catalog.json');
  const rules = await json('data/skill-unlock-rules.json');
  const insertedCatalog = clone(catalog);
  const insertedRules = clone(rules);
  insertedCatalog.skills.push({
    ...clone(catalog.skills.at(-1)),
    id: 'fixture-skill',
    title: 'fixture-skill',
    command: '/fixture-skill',
    skillPath: '.claude/skills/fixture-skill/SKILL.md',
    feeds: [],
  });
  insertedRules.skills['fixture-skill'] = {
    ...clone(rules.skills[catalog.skills.at(-1).id]),
    command: '/fixture-skill',
  };
  assert.equal(contract.validateContracts(insertedCatalog, insertedRules).skills.length, catalog.skills.length + 1);

  const removedId = catalog.skills.at(-1).id;
  const removedCatalog = clone(catalog);
  const removedRules = clone(rules);
  removedCatalog.skills = removedCatalog.skills.filter((skill) => skill.id !== removedId);
  removedCatalog.edges = removedCatalog.edges.filter((edge) => edge.from !== removedId && edge.to !== removedId);
  delete removedRules.skills[removedId];
  assert.equal(contract.validateContracts(removedCatalog, removedRules).skills.length, catalog.skills.length - 1);
});

test('divergência de skill, edge, requisito ou ArtifactIndex falha fechado', async () => {
  const contract = await loadContract();
  const catalog = await json('data/skill-catalog.json');
  const rules = await json('data/skill-unlock-rules.json');

  const cases = [
    [() => { const c = clone(catalog); c.edges.push({ from: 'orfa', to: c.skills[0].id, type: 'dependency' }); return [c, clone(rules)]; }, 'CATALOG_ORPHAN_EDGE'],
    [() => { const r = clone(rules); delete r.skills[catalog.skills[0].id]; return [clone(catalog), r]; }, 'SURFACE_ID_MISMATCH'],
    [() => { const r = clone(rules); r.skills[catalog.skills[0].id].requiredArtifacts = ['orfa']; return [clone(catalog), r]; }, 'RULE_ORPHAN_ARTIFACT'],
  ];

  for (const [fixture, code] of cases) {
    const [candidateCatalog, candidateRules] = fixture();
    assert.throws(() => contract.validateContracts(candidateCatalog, candidateRules), (error) => error?.code === code);
  }

  assert.throws(
    () => contract.evaluateSkills({ catalog, rules, projectBrief: {}, artifactIndex: { schemaVersion: 'errado', entries: [] } }),
    (error) => error?.code === 'INVALID_ARTIFACT_INDEX',
  );
});

test('estado é derivado de ProjectBrief v1 e ArtifactIndex confirmado', async () => {
  const contract = await loadContract();
  const catalog = await json('data/skill-catalog.json');
  const rules = await json('data/skill-unlock-rules.json');
  const projectBrief = {
    schemaVersion: '1.0.0',
    projectId: 'project-fixture',
    data: { project: { slug: 'fixture' } },
  };
  const artifactIndex = {
    schemaVersion: 'artifact-index-v1',
    project: { slug: 'fixture' },
    rules: { schemaVersion: String(rules.schemaVersion), confirmationRequiredByDefault: true },
    entries: [{ artifactType: 'avatar', confirmationStatus: 'confirmed', satisfiesCriticalRequirement: true }],
    summary: { total: 1, confirmed: 1, pendingConfirmation: 0 },
  };
  const evaluated = contract.evaluateSkills({ catalog, rules, projectBrief, artifactIndex });
  assert.deepEqual([...evaluated.map((item) => item.skillId)], catalog.skills.map((skill) => skill.id));
  assert.equal(evaluated.find((item) => item.skillId === 'avatar-funil').state, 'done');
  assert.ok(evaluated.every((item) => rules.states.includes(item.state)));
});

test('HTMLs consomem contratos por fetch e não mantêm banco de skills ou edges', async () => {
  for (const relative of ['briefing.html', 'mapa-skills.html']) {
    const html = await read(relative);
    assert.match(html, /fetch\(['"]\/data\/skill-catalog\.json['"]\)/);
    assert.match(html, /fetch\(['"]\/data\/skill-unlock-rules\.json['"]\)/);
    assert.doesNotMatch(html, /const\s+SKILLS\s*=\s*\[/);
    assert.doesNotMatch(html, /const\s+FLOW_EDGES\s*=\s*\[/);
    assert.doesNotMatch(html, />\s*25 skills\b/);
  }
});

test('distribuições raiz e aula-03 permanecem byte a byte equivalentes', async () => {
  for (const relative of ['briefing.html', 'mapa-skills.html', 'mapa-skills-artifacts.js']) {
    const rootBytes = await readFile(path.join(ROOT, relative));
    const aulaBytes = await readFile(path.join(ROOT, 'aula-03', 'materiais', relative));
    assert.ok(rootBytes.equals(aulaBytes), `${relative} divergiu da cópia distribuída`);
  }
});

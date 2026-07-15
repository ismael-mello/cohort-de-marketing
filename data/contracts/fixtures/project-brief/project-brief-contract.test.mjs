import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { migrateLegacyProjectBrief } from '../../../../scripts/migrate-project-brief.mjs';

const fixture = (name) => JSON.parse(
  readFileSync(fileURLToPath(new URL(name, import.meta.url)), 'utf8'),
);

test('migra 0.1.0 de forma deterministica e preserva dados e proveniencia', () => {
  const legacy = fixture('legacy-0.1.0.valid.json');
  const expected = fixture('migrated-1.0.0.valid.json');

  const first = migrateLegacyProjectBrief(legacy);
  const second = migrateLegacyProjectBrief(legacy);

  assert.deepEqual(first, expected);
  assert.deepEqual(second, expected);
  assert.equal(first.document.data.fieldMeta, undefined);
  assert.equal(first.document.fieldSources['project.name'].source, 'user');
  assert.equal(first.document.fieldSources['market.niche'].source, 'artifact');
  assert.equal(first.document.fieldSources['market.dominantPain'].confirmation, 'pending');
  assert.equal(first.document.fieldSources['offer.guarantee'].confirmation, 'not_applicable');
});

test('reprocessar o resultado v1 e um no-op idempotente', () => {
  const migrated = fixture('migrated-1.0.0.valid.json');

  assert.deepEqual(migrateLegacyProjectBrief(migrated), migrated);
  assert.deepEqual(migrateLegacyProjectBrief(migrated.document), migrated);
});

test('versao desconhecida falha fechado', () => {
  assert.throws(
    () => migrateLegacyProjectBrief(fixture('unknown-version.invalid.json')),
    /Unsupported ProjectBrief schemaVersion: 2\.0\.0/,
  );
});

test('campo critico invalido falha fechado', () => {
  assert.throws(
    () => migrateLegacyProjectBrief(fixture('critical-field.invalid.json')),
    /project\.slug|fieldMeta/,
  );
});

test('opcao de downgrade implicito falha fechado', () => {
  assert.throws(
    () => migrateLegacyProjectBrief(fixture('legacy-0.1.0.valid.json'), { targetVersion: '0.1.0' }),
    /Downgrade is not supported/,
  );
});

test('schema v1 usa o schema legado por referencia e nao duplica os 120 campos', () => {
  const schema = fixture('../../project-brief.v1.schema.json');

  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.deepEqual(schema.properties.data, { $ref: '../project-brief.schema.json' });
  assert.equal(schema.properties.data.properties, undefined);
  assert.deepEqual(schema.required, [
    'schemaVersion',
    'id',
    'workspaceId',
    'projectId',
    'revision',
    'status',
    'createdAt',
    'updatedAt',
    'data',
    'fieldSources',
  ]);
});

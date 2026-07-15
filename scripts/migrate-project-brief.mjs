import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LEGACY_VERSION = '0.1.0';
const CURRENT_VERSION = '1.0.0';
const MIGRATION_EPOCH = '1970-01-01T00:00:00.000Z';
const LEGACY_SOURCES = new Set(['user', 'artifact', 'inferred', 'pending_confirmation', 'not_applicable']);
const V1_SOURCES = new Set(['user', 'artifact', 'inferred', 'migration']);
const CONFIRMATIONS = new Set(['confirmed', 'pending', 'not_applicable']);
const STATUSES = new Set(['draft', 'active', 'superseded']);
const COMPLETION_STATUSES = new Set(['draft', 'ready_for_research', 'ready_for_offer', 'ready_for_funnel', 'ready_for_optimization']);
const LEGACY_ROOT_KEYS = new Set([
  'schemaVersion',
  'meta',
  'project',
  'market',
  'offer',
  'brand',
  'funnel',
  'channels',
  'data',
  'integrations',
  'fieldMeta',
  'artifacts',
]);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertNonEmptyString(value, path) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${path} must be a non-empty string.`);
  }
}

function assertDateTime(value, path) {
  assertNonEmptyString(value, path);
  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`${path} must be a valid date-time.`);
  }
}

function validateLegacyDocument(input) {
  for (const key of Object.keys(input)) {
    if (!LEGACY_ROOT_KEYS.has(key)) throw new Error(`Legacy ProjectBrief property is not allowed: ${key}.`);
  }
  if (!isPlainObject(input.project)) {
    throw new Error('Legacy ProjectBrief must contain project.');
  }
  if (typeof input.project.slug !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(input.project.slug)) {
    throw new Error('Legacy ProjectBrief project.slug is invalid.');
  }
  if (input.meta !== undefined && !isPlainObject(input.meta)) {
    throw new Error('Legacy ProjectBrief meta must be an object.');
  }
  for (const key of ['createdAt', 'updatedAt', 'lastSavedAt']) {
    if (input.meta?.[key] !== undefined) assertDateTime(input.meta[key], `meta.${key}`);
  }
  if (input.meta?.completionStatus !== undefined && !COMPLETION_STATUSES.has(input.meta.completionStatus)) {
    throw new Error(`meta.completionStatus is invalid: ${input.meta.completionStatus}.`);
  }
  if (input.fieldMeta !== undefined && !isPlainObject(input.fieldMeta)) {
    throw new Error('Legacy ProjectBrief fieldMeta must be an object.');
  }
  for (const [path, meta] of Object.entries(input.fieldMeta ?? {})) {
    if (!isPlainObject(meta) || !LEGACY_SOURCES.has(meta.source)) {
      throw new Error(`Legacy ProjectBrief fieldMeta.${path}.source is invalid.`);
    }
    if (meta.sourcePath !== undefined) assertNonEmptyString(meta.sourcePath, `fieldMeta.${path}.sourcePath`);
    if (meta.updatedAt !== undefined) assertDateTime(meta.updatedAt, `fieldMeta.${path}.updatedAt`);
  }
  if (input.artifacts !== undefined) {
    if (!isPlainObject(input.artifacts) || Object.values(input.artifacts).some((value) => typeof value !== 'boolean')) {
      throw new Error('Legacy ProjectBrief artifacts must map artifact types to booleans.');
    }
  }
}

function validateV1Document(document) {
  if (!isPlainObject(document) || document.schemaVersion !== CURRENT_VERSION) {
    throw new Error(`Unsupported ProjectBrief schemaVersion: ${document?.schemaVersion ?? 'missing'}.`);
  }
  for (const key of ['id', 'workspaceId', 'projectId']) assertNonEmptyString(document[key], key);
  if (!Number.isInteger(document.revision) || document.revision < 1) {
    throw new Error('revision must be an integer greater than zero.');
  }
  if (!STATUSES.has(document.status)) throw new Error(`status is invalid: ${document.status}.`);
  assertDateTime(document.createdAt, 'createdAt');
  assertDateTime(document.updatedAt, 'updatedAt');
  if (!isPlainObject(document.data) || document.data.schemaVersion !== LEGACY_VERSION) {
    throw new Error('data must contain a ProjectBrief 0.1.0 payload.');
  }
  validateLegacyDocument(document.data);
  if (document.data.fieldMeta !== undefined) {
    throw new Error('data.fieldMeta is not allowed in v1; use fieldSources.');
  }
  if (!isPlainObject(document.fieldSources)) throw new Error('fieldSources must be an object.');
  for (const [path, provenance] of Object.entries(document.fieldSources)) {
    if (!isPlainObject(provenance) || !V1_SOURCES.has(provenance.source)) {
      throw new Error(`fieldSources.${path}.source is invalid.`);
    }
    if (!CONFIRMATIONS.has(provenance.confirmation)) {
      throw new Error(`fieldSources.${path}.confirmation is invalid.`);
    }
    assertDateTime(provenance.updatedAt, `fieldSources.${path}.updatedAt`);
  }
}

function normalizedMigrationResult(input, options) {
  if (isPlainObject(input.document)) {
    validateV1Document(input.document);
    if (!Array.isArray(input.declaredArtifacts)) {
      throw new Error('declaredArtifacts must be an array.');
    }
    return structuredClone(input);
  }
  validateV1Document(input);
  return {
    document: structuredClone(input),
    declaredArtifacts: structuredClone(options.declaredArtifacts ?? []),
  };
}

export function migrateLegacyProjectBrief(input, options = {}) {
  if (options.targetVersion && options.targetVersion !== CURRENT_VERSION) {
    throw new Error(`Downgrade is not supported: targetVersion ${options.targetVersion}.`);
  }

  if (input?.schemaVersion === CURRENT_VERSION || input?.document?.schemaVersion === CURRENT_VERSION) {
    return normalizedMigrationResult(input, options);
  }
  if (!input || input.schemaVersion !== LEGACY_VERSION) {
    throw new Error(`Unsupported ProjectBrief schemaVersion: ${input?.schemaVersion ?? 'missing'}.`);
  }
  validateLegacyDocument(input);

  const now = options.now ?? input.meta?.updatedAt ?? input.meta?.createdAt ?? MIGRATION_EPOCH;
  assertDateTime(now, 'migration timestamp');
  const data = structuredClone(input);
  const declaredArtifacts = data.artifacts ?? {};
  delete data.artifacts;
  delete data.fieldMeta;

  const fieldSources = {};
  for (const [path, meta] of Object.entries(input.fieldMeta ?? {})) {
    fieldSources[path] = {
      source: V1_SOURCES.has(meta.source) ? meta.source : 'migration',
      confirmation: meta.source === 'pending_confirmation' ? 'pending' : meta.source === 'not_applicable' ? 'not_applicable' : 'confirmed',
      ...(meta.sourcePath ? { sourceArtifactId: meta.sourcePath } : {}),
      updatedAt: meta.updatedAt ?? now,
    };
  }

  const projectId = options.projectId ?? `project-${input.project.slug}`;
  const revision = options.revision ?? 1;
  if (!Number.isInteger(revision) || revision < 1) throw new Error('revision must be an integer greater than zero.');

  const result = {
    document: {
      schemaVersion: CURRENT_VERSION,
      id: options.id ?? `${projectId}:revision:${revision}`,
      workspaceId: options.workspaceId ?? 'standalone',
      projectId,
      revision,
      status: 'active',
      createdAt: input.meta?.createdAt ?? now,
      updatedAt: input.meta?.updatedAt ?? now,
      data,
      fieldSources,
    },
    declaredArtifacts: Object.entries(declaredArtifacts)
      .filter(([, declared]) => Boolean(declared))
      .map(([artifactType]) => ({ artifactType, verification: 'pending' })),
  };
  validateV1Document(result.document);
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    console.error('Usage: node scripts/migrate-project-brief.mjs <input.json> <output.json>');
    process.exit(1);
  }
  const migrated = migrateLegacyProjectBrief(JSON.parse(readFileSync(resolve(inputPath), 'utf8')));
  writeFileSync(resolve(outputPath), `${JSON.stringify(migrated, null, 2)}\n`);
  console.log(`Migrated ${inputPath} -> ${outputPath}`);
}

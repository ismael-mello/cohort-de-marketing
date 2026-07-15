import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { createHash, randomBytes } from 'node:crypto';
import {
  mkdir, open, readFile, rename, rm, stat, unlink, writeFile,
} from 'node:fs/promises';
import path, { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAula04Contract } from './validate-aula-04-contracts.mjs';

const LEDGER_VERSION = '1.0.0';
const LEDGER_SCHEMA_URL = new URL('../data/contracts/weekly-ledger.v1.schema.json', import.meta.url);
const SOURCE_REFERENCE_KINDS = new Set([
  'checkout-export',
  'operator-declaration',
  'platform-export',
  'tracking-audit',
]);
const PREMISE_REFERENCE_KINDS = new Set(['assumption']);
const REFERENCE_PATTERN = /^ref:([a-z][a-z0-9-]{0,31}):([a-z0-9][a-z0-9.-]{0,127})$/;
const DEFAULT_LOCK_TIMEOUT_MS = 10_000;
const DEFAULT_LOCK_RETRY_MS = 20;
const DEFAULT_LOCK_STALE_MS = 30_000;
const DEFAULT_CAS_RETRIES = 64;
const EMPTY_LEDGER = Object.freeze({
  contract: 'WeeklyLedger',
  schemaVersion: LEDGER_VERSION,
  hashAlgorithm: 'sha256',
  entries: Object.freeze([]),
  index: Object.freeze([]),
});

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function compareIdentity(left, right) {
  return compareText(left.projectId, right.projectId)
    || compareText(left.campaignId, right.campaignId)
    || compareText(left.weekStart, right.weekStart)
    || left.revision - right.revision;
}

function identityOf(record) {
  return {
    projectId: record.projectId,
    campaignId: record.campaignId,
    weekStart: record.weekStart,
    revision: record.revision,
  };
}

function identityKey(record) {
  return JSON.stringify([
    record.projectId,
    record.campaignId,
    record.weekStart,
    record.revision,
  ]);
}

function integerOption(name, fallback, minimum) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed >= minimum ? parsed : fallback;
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

function lockPathFor(ledgerPath) {
  return path.join(path.dirname(ledgerPath), `.${path.basename(ledgerPath)}.lock`);
}

function processIsAlive(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code !== 'ESRCH';
  }
}

async function readLockOwner(lockPath) {
  try {
    const owner = JSON.parse(await readFile(path.join(lockPath, 'owner.json'), 'utf8'));
    const createdAtMs = Date.parse(owner?.createdAt);
    if (
      owner?.version !== 1
      || !Number.isSafeInteger(owner.pid)
      || typeof owner.token !== 'string'
      || !Number.isFinite(createdAtMs)
      || createdAtMs > Date.now() + 60_000
    ) return null;
    return owner;
  } catch {
    return null;
  }
}

async function removeAbandonedLock(lockPath, staleMs) {
  const owner = await readLockOwner(lockPath);
  if (owner) {
    const ageMs = Date.now() - Date.parse(owner.createdAt);
    if (processIsAlive(owner.pid) || ageMs < staleMs) return false;
    await rm(lockPath, { recursive: true, force: true });
    return true;
  }

  try {
    const lockStat = await stat(lockPath);
    if (Date.now() - lockStat.mtimeMs < staleMs) return false;
    await rm(lockPath, { recursive: true, force: true });
    return true;
  } catch (error) {
    return error.code === 'ENOENT';
  }
}

async function acquireLedgerLock(ledgerPath) {
  const lockPath = lockPathFor(ledgerPath);
  const timeoutMs = integerOption('WEEKLY_LEDGER_LOCK_TIMEOUT_MS', DEFAULT_LOCK_TIMEOUT_MS, 1);
  const retryMs = integerOption('WEEKLY_LEDGER_LOCK_RETRY_MS', DEFAULT_LOCK_RETRY_MS, 1);
  const staleMs = integerOption('WEEKLY_LEDGER_LOCK_STALE_MS', DEFAULT_LOCK_STALE_MS, 1);
  const deadline = Date.now() + timeoutMs;

  while (Date.now() <= deadline) {
    const token = randomBytes(16).toString('hex');
    try {
      await mkdir(lockPath);
      const owner = {
        version: 1,
        pid: process.pid,
        token,
        createdAt: new Date().toISOString(),
      };
      await writeFile(path.join(lockPath, 'owner.json'), `${JSON.stringify(owner)}\n`, { flag: 'wx' });
      return { lockPath, token };
    } catch (error) {
      if (error.code !== 'EEXIST') {
        await rm(lockPath, { recursive: true, force: true }).catch(() => {});
        return null;
      }
      await removeAbandonedLock(lockPath, staleMs);
      if (Date.now() <= deadline) await delay(retryMs);
    }
  }
  return null;
}

async function releaseLedgerLock(lock) {
  if (!lock) return;
  const owner = await readLockOwner(lock.lockPath);
  if (owner?.token !== lock.token || owner.pid !== process.pid) return;
  await rm(lock.lockPath, { recursive: true, force: true });
}

function provenanceReference(value, allowedKinds) {
  if (typeof value !== 'string') return null;
  const match = REFERENCE_PATTERN.exec(value);
  if (!match || !allowedKinds.has(match[1])) return null;
  return { kind: match[1], id: match[2] };
}

function validateProvenanceReferences(panels) {
  for (const { panel, line } of panels) {
    for (let metricIndex = 0; metricIndex < panel.metrics.length; metricIndex += 1) {
      const metric = panel.metrics[metricIndex];
      if (!provenanceReference(metric.source, SOURCE_REFERENCE_KINDS)) {
        return {
          valid: false,
          code: 'INVALID_METRIC_PROVENANCE_REFERENCE',
          line,
          metricIndex,
          field: 'source',
        };
      }
      if (
        metric.premise !== null
        && !provenanceReference(metric.premise, PREMISE_REFERENCE_KINDS)
      ) {
        return {
          valid: false,
          code: 'INVALID_METRIC_PROVENANCE_REFERENCE',
          line,
          metricIndex,
          field: 'premise',
        };
      }
    }
  }
  return null;
}

/**
 * RFC 8785 is deliberately not claimed here. WeeklyLedger v1 freezes this
 * simpler JSON-domain algorithm: recursively sort object keys, preserve array
 * order, then emit compact JSON with JSON.stringify.
 */
export function canonicalSerialize(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalSerialize).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value).sort(compareText).map((key) => (
      `${JSON.stringify(key)}:${canonicalSerialize(value[key])}`
    )).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function canonicalHash(record) {
  return createHash('sha256').update(canonicalSerialize(record), 'utf8').digest('hex');
}

function metricReference(metric) {
  return {
    name: metric.name,
    value: metric.value,
    seal: metric.seal,
    sourceRef: provenanceReference(metric.source, SOURCE_REFERENCE_KINDS),
    attributionWindow: metric.attributionWindow,
    premiseRef: metric.premise === null
      ? null
      : provenanceReference(metric.premise, PREMISE_REFERENCE_KINDS),
    confirmedByHuman: metric.confirmedByHuman,
    cashConfirmed: metric.cashConfirmed,
  };
}

function ledgerEntry(panel) {
  return {
    projectId: panel.projectId,
    campaignId: panel.campaignId,
    weekStart: panel.weekStart,
    revision: panel.revision,
    weeklyPanelId: panel.id,
    schemaVersion: panel.schemaVersion,
    canonicalHash: canonicalHash(panel),
    metrics: panel.metrics.map(metricReference),
  };
}

function buildIndex(entries) {
  const groups = new Map();
  entries.forEach((entry, entryIndex) => {
    const key = JSON.stringify([entry.projectId, entry.campaignId, entry.weekStart]);
    let group = groups.get(key);
    if (!group) {
      group = {
        projectId: entry.projectId,
        campaignId: entry.campaignId,
        weekStart: entry.weekStart,
        revisions: [],
      };
      groups.set(key, group);
    }
    group.revisions.push({ revision: entry.revision, entryIndex });
  });

  return [...groups.values()]
    .map((group) => ({
      ...group,
      revisions: group.revisions.sort((left, right) => (
        left.revision - right.revision || left.entryIndex - right.entryIndex
      )),
    }))
    .sort(compareIdentity);
}

async function createLedgerValidator() {
  const schema = JSON.parse(await readFile(LEDGER_SCHEMA_URL, 'utf8'));
  const ajv = new Ajv2020({
    allErrors: true,
    coerceTypes: false,
    removeAdditional: false,
    strict: true,
    useDefaults: false,
    validateFormats: true,
  });
  addFormats(ajv);
  return ajv.compile(schema);
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function validateExistingLedger(ledger) {
  const validate = await createLedgerValidator();
  if (!validate(ledger)) return false;

  const identities = new Set();
  for (const entry of ledger.entries) {
    const key = identityKey(entry);
    if (identities.has(key)) return false;
    identities.add(key);
  }
  return sameJson(ledger.index, buildIndex(ledger.entries));
}

async function parseInput(inputPath) {
  let input;
  try {
    input = await readFile(inputPath, 'utf8');
  } catch {
    return { ioError: 'Unable to read ledger input.\n' };
  }

  const lines = input.endsWith('\n') ? input.slice(0, -1).split('\n') : input.split('\n');
  if (lines.length === 1 && lines[0] === '') {
    return { parseError: 'Unable to parse ledger input at line 1.\n' };
  }

  const panels = [];
  for (let index = 0; index < lines.length; index += 1) {
    let panel;
    try {
      panel = JSON.parse(lines[index]);
    } catch {
      return { parseError: `Unable to parse ledger input at line ${index + 1}.\n` };
    }
    panels.push({ panel, line: index + 1 });
  }
  return { panels };
}

async function validatePanels(panels, inputPath) {
  for (const { panel, line } of panels) {
    const result = await validateAula04Contract(panel, `${inputPath}:${line}`);
    if (panel?.contract !== 'WeeklyPanel' || !result.valid) {
      return {
        valid: false,
        code: 'INVALID_WEEKLY_PANEL',
        line,
        errors: result.errors,
      };
    }
  }
  return null;
}

async function readExistingLedger(ledgerPath) {
  try {
    const contents = await readFile(ledgerPath);
    const ledger = JSON.parse(contents.toString('utf8'));
    if (!await validateExistingLedger(ledger)) return { invalid: true };
    return {
      ledger,
      exists: true,
      snapshot: { exists: true, hash: createHash('sha256').update(contents).digest('hex') },
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        ledger: structuredClone(EMPTY_LEDGER),
        exists: false,
        snapshot: { exists: false, hash: null },
      };
    }
    return { invalid: true };
  }
}

async function destinationSnapshot(destination) {
  try {
    const contents = await readFile(destination);
    return { exists: true, hash: createHash('sha256').update(contents).digest('hex') };
  } catch (error) {
    if (error.code === 'ENOENT') return { exists: false, hash: null };
    throw error;
  }
}

async function atomicWrite(destination, contents, expectedSnapshot) {
  const temporary = path.join(
    path.dirname(destination),
    `.${path.basename(destination)}.${process.pid}.${randomBytes(8).toString('hex')}.tmp`,
  );
  let handle;
  try {
    handle = await open(temporary, 'wx');
    await handle.writeFile(contents, 'utf8');
    await handle.sync();
    await handle.close();
    handle = null;
    const currentSnapshot = await destinationSnapshot(destination);
    if (
      currentSnapshot.exists !== expectedSnapshot.exists
      || currentSnapshot.hash !== expectedSnapshot.hash
    ) {
      const error = new Error('Ledger changed while the update was being prepared.');
      error.code = 'LEDGER_CAS_MISMATCH';
      throw error;
    }
    await rename(temporary, destination);
  } catch (error) {
    if (handle) await handle.close().catch(() => {});
    await unlink(temporary).catch(() => {});
    throw error;
  }
}

export async function buildWeeklyLedger(panels, existingLedger) {
  const entries = existingLedger.entries.map((entry) => structuredClone(entry));
  const byIdentity = new Map(entries.map((entry) => [identityKey(entry), entry]));
  const candidates = panels.map(({ panel }) => ledgerEntry(panel)).sort(compareIdentity);
  let added = 0;
  let replayed = 0;

  for (const candidate of candidates) {
    const key = identityKey(candidate);
    const existing = byIdentity.get(key);
    if (existing) {
      if (existing.canonicalHash !== candidate.canonicalHash) {
        return { conflict: identityOf(candidate) };
      }
      replayed += 1;
      continue;
    }
    entries.push(candidate);
    byIdentity.set(key, candidate);
    added += 1;
  }

  return {
    ledger: {
      contract: 'WeeklyLedger',
      schemaVersion: LEDGER_VERSION,
      hashAlgorithm: 'sha256',
      entries,
      index: buildIndex(entries),
    },
    added,
    replayed,
  };
}

async function main(args) {
  if (args.length !== 2) {
    process.stderr.write('Usage: node scripts/build-weekly-ledger.mjs <input.jsonl> <ledger.json>\n');
    return 2;
  }
  const [inputPath, ledgerPath] = args;
  if (resolve(inputPath) === resolve(ledgerPath)) {
    process.stderr.write('Input and ledger paths must be different.\n');
    return 2;
  }

  const parsed = await parseInput(inputPath);
  if (parsed.ioError) {
    process.stderr.write(parsed.ioError);
    return 2;
  }
  if (parsed.parseError) {
    process.stderr.write(parsed.parseError);
    return 2;
  }

  const invalidPanel = await validatePanels(parsed.panels, inputPath);
  if (invalidPanel) {
    process.stdout.write(`${JSON.stringify(invalidPanel)}\n`);
    return 1;
  }

  const invalidProvenance = validateProvenanceReferences(parsed.panels);
  if (invalidProvenance) {
    process.stdout.write(`${JSON.stringify(invalidProvenance)}\n`);
    return 1;
  }

  try {
    if (!(await stat(path.dirname(ledgerPath))).isDirectory()) throw new Error('not a directory');
  } catch {
    process.stderr.write('Unable to write ledger atomically.\n');
    return 2;
  }

  const maxCasRetries = integerOption('WEEKLY_LEDGER_CAS_RETRIES', DEFAULT_CAS_RETRIES, 0);
  for (let attempt = 0; attempt <= maxCasRetries; attempt += 1) {
    const lock = await acquireLedgerLock(ledgerPath);
    if (!lock) {
      process.stderr.write('Unable to acquire ledger lock.\n');
      return 2;
    }

    let retryAfterCasMismatch = false;
    try {
      const existing = await readExistingLedger(ledgerPath);
      if (existing.ioError) {
        process.stderr.write('Unable to read existing ledger.\n');
        return 2;
      }
      if (existing.invalid) {
        process.stdout.write(`${JSON.stringify({ valid: false, code: 'INVALID_EXISTING_LEDGER' })}\n`);
        return 1;
      }

      const result = await buildWeeklyLedger(parsed.panels, existing.ledger);
      if (result.conflict) {
        process.stdout.write(`${JSON.stringify({
          valid: false,
          code: 'LEDGER_IDENTITY_CONFLICT',
          identity: result.conflict,
        })}\n`);
        return 1;
      }

      if (!await validateExistingLedger(result.ledger)) {
        process.stdout.write(`${JSON.stringify({ valid: false, code: 'INVALID_GENERATED_LEDGER' })}\n`);
        return 1;
      }

      if (result.added > 0 || !existing.exists) {
        try {
          await atomicWrite(
            ledgerPath,
            `${JSON.stringify(result.ledger, null, 2)}\n`,
            existing.snapshot,
          );
        } catch (error) {
          if (error.code === 'LEDGER_CAS_MISMATCH') {
            retryAfterCasMismatch = true;
          } else {
            process.stderr.write('Unable to write ledger atomically.\n');
            return 2;
          }
        }
      }
      if (!retryAfterCasMismatch) {
        process.stdout.write(`${JSON.stringify({
          added: result.added,
          replayed: result.replayed,
          total: result.ledger.entries.length,
        })}\n`);
        return 0;
      }
    } finally {
      await releaseLedgerLock(lock);
    }

    if (retryAfterCasMismatch && attempt < maxCasRetries) {
      await delay(integerOption('WEEKLY_LEDGER_LOCK_RETRY_MS', DEFAULT_LOCK_RETRY_MS, 1));
    }
  }

  process.stdout.write(`${JSON.stringify({
    valid: false,
    code: 'LEDGER_CONCURRENT_MODIFICATION',
  })}\n`);
  return 1;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  process.exitCode = await main(process.argv.slice(2));
}

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page } from 'playwright/test';
import { parse as parseYaml } from 'yaml';
import { createTrafficPilotFixture, TRAFFIC_PILOT } from './fixtures/traffic-pilot/fixture.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, '..');
const repoRoot = resolve(appRoot, '..', '..');
const evidenceDir = resolve(__dirname, 'fixtures/traffic-pilot/evidence');
const evidencePath = resolve(evidenceDir, 'run.json');
const e2eTimeoutMs = 30 * 60 * 1000;

test.use({ baseURL: TRAFFIC_PILOT.webUrl, trace: 'retain-on-failure' });
test.describe.configure({ mode: 'serial' });
test.setTimeout(e2eTimeoutMs);

type Service = ChildProcess & { captured?: string };
interface PilotApprovalEvidence {
  decision: string;
  state: string;
  [key: string]: unknown;
}
interface PilotStageEvidence {
  skillId: string;
  title: string;
  runId: string;
  jobId: string | null;
  status: string;
  durationMs: number;
  proposalHash: string | null;
  proposal: unknown;
  approvals: PilotApprovalEvidence[];
  artifacts: Array<Record<string, unknown>>;
  job: unknown;
}
interface PilotEvidence {
  story: string;
  base: string;
  startedAt: string;
  fixture: Record<string, unknown>;
  stages: PilotStageEvidence[];
  retries: Array<Record<string, unknown>>;
  refusals: Array<Record<string, unknown>>;
  reloads: Array<Record<string, unknown>>;
  visual: {
    desktop: string;
    mobile: string;
    sameState: boolean;
    overlaps: Array<{ a: string; b: string }>;
    consoleErrors: string[];
    networkFailures: string[];
    desktopViewport?: { width: number; height: number };
    mobileViewport?: { width: number; height: number };
  };
  guards: string[];
  noMetaMutation: boolean;
  finalCampaign: unknown;
}
let fixture: Awaited<ReturnType<typeof createTrafficPilotFixture>>;
let bff: Service | undefined;
let vite: Service | undefined;
const evidence: PilotEvidence = {
  story: '8.W3.1', base: '4f05847f6d172cadf2e83befe69fed0d74d55f6c', startedAt: new Date().toISOString(),
  fixture: { workspaceId: TRAFFIC_PILOT.workspaceId, projectId: TRAFFIC_PILOT.projectId, campaignId: TRAFFIC_PILOT.campaignId, projectSlug: TRAFFIC_PILOT.projectSlug, projectPath: resolve(repoRoot, 'projetos', TRAFFIC_PILOT.projectSlug), demoAuth: false, seededFromFilesystem: true },
  stages: [], retries: [], refusals: [], reloads: [], visual: { desktop: '', mobile: '', sameState: false, overlaps: [], consoleErrors: [], networkFailures: [] },
  guards: ['Runner autorizado no BFF por token local; Codex child em sandbox read-only.', 'Nenhuma publicação, pausa, escala ou kill foi enviada à Meta.'], noMetaMutation: true, finalCampaign: null,
};

function serviceEnv(extra: Record<string, string>): NodeJS.ProcessEnv { const env = { ...process.env, ...extra }; delete env.OPENAI_API_KEY; delete env.CODEX_API_KEY; return env; }

function launch(command: string, args: string[], env: NodeJS.ProcessEnv): Service {
  const child = spawn(command, args, { cwd: appRoot, env, stdio: ['ignore', 'pipe', 'pipe'] }) as Service;
  child.captured = ''; child.stdout?.on('data', (chunk) => { child.captured += chunk.toString(); }); child.stderr?.on('data', (chunk) => { child.captured += chunk.toString(); }); return child;
}

async function waitFor(url: string, timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs; let lastError = 'sem resposta';
  while (Date.now() < deadline) { try { const response = await fetch(url); if (response.ok) return; lastError = `HTTP ${response.status}`; } catch (error) { lastError = error instanceof Error ? error.message : String(error); } await new Promise((resolvePromise) => setTimeout(resolvePromise, 250)); }
  throw new Error(`Serviço não iniciou em ${url}: ${lastError}`);
}

async function stop(child: Service | undefined): Promise<void> {
  if (!child || child.killed) return; child.kill('SIGTERM'); await new Promise<void>((resolvePromise) => { const timer = setTimeout(() => { child.kill('SIGKILL'); resolvePromise(); }, 5_000); child.once('exit', () => { clearTimeout(timer); resolvePromise(); }); });
}

async function saveEvidence(): Promise<void> { await mkdir(evidenceDir, { recursive: true }); await writeFile(evidencePath, `${JSON.stringify({ ...evidence, finishedAt: new Date().toISOString() }, null, 2)}\n`, 'utf8'); }
function durationMs(start: number): number { return Date.now() - start; }

function normalizeText(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
function escapePattern(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function proposalStrings(value: unknown): string[] {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try { return proposalStrings(JSON.parse(trimmed)); } catch { return [value]; }
    }
    return [value];
  }
  if (Array.isArray(value)) return value.flatMap(proposalStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(proposalStrings);
  return [];
}
function unavailableMetricsFromStage(stage: PilotStageEvidence): string[] {
  const proposal = stage.proposal as { artifacts?: Array<{ artifactType?: string; content?: string }> } | null;
  const artifact = proposal?.artifacts?.find((candidate) => candidate.artifactType === 'trafficMetricReading');
  if (!artifact?.content) throw new Error('Leitor não produziu trafficMetricReading para validar o handoff.');
  const parsed = parseYaml(artifact.content) as { leitor?: { sinais?: Array<{ metrica?: string; valor?: unknown; selo?: string }> } };
  return (parsed.leitor?.sinais ?? [])
    .filter((signal) => signal.valor == null || normalizeText(signal.selo ?? '').replace(/[_-]+/g, ' ').includes('nao fornecido'))
    .map((signal) => signal.metrica)
    .filter((metric): metric is string => Boolean(metric));
}
function derivedUnavailableMetrics(proposal: unknown, metrics: string[]): string[] {
  const texts = proposalStrings(proposal).map(normalizeText);
  const assignment = '(?:valor|aproxim\\w*|calcul\\w*|derivad\\w*|estim\\w*|equival\\w*|result\\w*|seria|foi\\s+de|e\\s+de|[:=])';
  const numeric = '(?:r\\$\\s*)?\\d+(?:[.,]\\d+)*(?:\\s*[%x])?';
  return metrics.filter((metric) => {
    const name = escapePattern(normalizeText(metric));
    const forward = new RegExp(`\\b${name}\\b.{0,90}${assignment}.{0,24}${numeric}`, 'i');
    const reverse = new RegExp(`${numeric}.{0,24}${assignment}.{0,90}\\b${name}\\b`, 'i');
    const unit = new RegExp(`(?:\\b${name}\\b.{0,36}${numeric}\\s*[%x]|(?:r\\$\\s*)?\\d+(?:[.,]\\d+)*\\s*[%x].{0,36}\\b${name}\\b)`, 'i');
    return texts.some((text) => forward.test(text) || reverse.test(text) || unit.test(text));
  });
}

async function selectSkill(page: Page, title: string): Promise<void> {
  const heading = page.getByRole('heading', { name: title, exact: true });
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await page.getByRole('button', { name: new RegExp(`^${title}`) }).click();
    await heading.waitFor({ state: 'visible', timeout: 1_000 }).catch(() => undefined);
    if (!(await heading.isVisible())) continue;
    await page.waitForTimeout(600);
    if (await heading.isVisible()) return;
  }
  throw new Error(`A seleção da skill ${title} não estabilizou após a hidratação.`);
}
async function waitReview(page: Page): Promise<void> { await expect(page.getByTestId('artifact-approval-review')).toBeVisible({ timeout: 10 * 60 * 1000 }); }
async function approveCurrent(page: Page, title: string, operatorInput: string): Promise<PilotStageEvidence> {
  const skillId = title === 'Leitor de Metricas' ? 'leitor-de-metricas' : title.toLowerCase();
  const startedAt = Date.now(); await selectSkill(page, title); await page.getByLabel('Contexto adicional').fill(operatorInput); await page.getByRole('button', { name: 'Executar skill', exact: true }).click(); await fixture.waitForLatestJob(skillId, (job) => job.status === 'succeeded'); await reloadAndProve(page, `${title} pronto para revisão`); await selectSkill(page, title); await waitReview(page);
  const review = page.getByTestId('artifact-approval-review'); await expect(review.getByRole('button', { name: 'Aprovar', exact: true })).toBeEnabled(); await review.getByRole('button', { name: 'Aprovar', exact: true }).click(); await expect(review).not.toBeVisible({ timeout: 30_000 });
  const run = await fixture.waitForLatestSkillRun(skillId, (candidate) => candidate.status === 'done'); await selectSkill(page, title); await expect(page.locator('.cms-run-status strong')).toHaveText('Concluída', { timeout: 30_000 }); const approvals = await fixture.approvalFor(run.id); const artifacts = await fixture.artifactsFor(run.id); const jobs = await fixture.jobsFor();
  const reconciledArtifacts = await Promise.all(artifacts.map(async (artifact) => { const content = await readFile(resolve(fixture.projectRoot, artifact.path), 'utf8'); const filesystemHash = createHash('sha256').update(content, 'utf8').digest('hex'); expect(filesystemHash).toBe(artifact.content_hash); return { id: artifact.id, path: artifact.path, contentHash: artifact.content_hash, filesystemHash, state: artifact.state, verification: artifact.verification }; }));
  const stage: PilotStageEvidence = { skillId, title, runId: run.id, jobId: run.input_snapshot?.jobId ?? null, status: run.status, durationMs: durationMs(startedAt), proposalHash: run.proposal_hash, proposal: run.proposal, approvals: approvals.map((record) => ({ id: record.id, decision: record.decision, state: record.state, outcome: record.outcome, proposalHash: record.proposal_hash, proposalRevision: record.proposal_revision, plan: record.plan })), artifacts: reconciledArtifacts, job: jobs.find((candidate) => candidate.id === (run.input_snapshot?.jobId ?? '')) ?? null };
  evidence.stages.push(stage); await saveEvidence(); return stage;
}

async function reloadAndProve(page: Page, label: string): Promise<void> { await page.reload({ waitUntil: 'domcontentloaded' }); await expect(page.getByRole('heading', { name: /Mapa do trabalho/i })).toBeVisible({ timeout: 30_000 }); await expect(page.getByTestId('project-hydration-error')).not.toBeVisible(); await page.waitForTimeout(1_000); await expect(page.getByRole('heading', { name: /Mapa do trabalho/i })).toBeVisible(); evidence.reloads.push({ label, at: new Date().toISOString(), url: page.url(), hydrated: true }); await saveEvidence(); }

test.beforeAll(async () => {
  fixture = await createTrafficPilotFixture();
  const common = serviceEnv({ SUPABASE_URL: fixture.config.url, SUPABASE_SERVICE_ROLE_KEY: fixture.config.serviceRoleKey, COHORT_REPO_ROOT: fixture.repoRoot, LOCAL_SKILL_RUNNER_ENABLED: 'true', LOCAL_SKILL_RUNNER_TOKEN: TRAFFIC_PILOT.boundaryToken, CODEX_SKILL_TIMEOUT_MS: '600000', PORT: '3302', HOST: '127.0.0.1', CORS_ORIGIN: TRAFFIC_PILOT.webUrl });
  bff = launch('npm', ['run', 'dev:server'], common); await waitFor(`${TRAFFIC_PILOT.bffUrl}/healthz`);
  vite = launch('npm', ['run', 'dev', '--', '--config', 'e2e/fixtures/traffic-pilot/vite.config.mjs', '--host', '127.0.0.1', '--port', '5178'], serviceEnv({ VITE_SUPABASE_URL: fixture.config.url, VITE_SUPABASE_ANON_KEY: fixture.config.anonKey, VITE_DEMO_AUTH: 'false', LOCAL_SKILL_RUNNER_TOKEN: TRAFFIC_PILOT.boundaryToken })); await waitFor(TRAFFIC_PILOT.webUrl); await saveEvidence();
}, e2eTimeoutMs);

test.afterAll(async () => { evidence.finalCampaign = await fixture?.campaign().catch(() => null); await saveEvidence(); await stop(vite); await stop(bff); await fixture?.cleanup(); }, e2eTimeoutMs);

test('executa o Squad de Tráfego real pela interface e reconcilia DB/filesystem', async ({ page, browser }) => {
  const consoleErrors: string[] = []; const networkFailures: string[] = []; page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); }); page.on('requestfailed', (request) => { const errorText = request.failure()?.errorText ?? 'falha'; if (!errorText.includes('ERR_ABORTED')) networkFailures.push(`${request.method()} ${request.url()} · ${errorText}`); });
  await page.goto('/'); await page.getByLabel('E-mail').fill(TRAFFIC_PILOT.email); await page.getByLabel('Senha').fill(TRAFFIC_PILOT.password); await page.getByRole('button', { name: 'Entrar', exact: true }).click(); await expect(page.getByRole('heading', { name: /Seus projetos/i })).toBeVisible({ timeout: 30_000 }); await expect(page.getByRole('button', { name: new RegExp(TRAFFIC_PILOT.projectName) })).toBeVisible(); await page.getByRole('button', { name: new RegExp(TRAFFIC_PILOT.projectName) }).click(); await page.getByRole('link', { name: 'Jornada', exact: true }).click(); await expect(page.getByRole('heading', { name: /Mapa do trabalho/i })).toBeVisible();

  const refusalStart = Date.now(); await selectSkill(page, 'Zelador'); await page.getByLabel('Contexto adicional').fill('O operador não confirmou CAPI nem deduplicação. Responda CRITICO, registre a recusa honesta e não libere campanha.'); await page.getByRole('button', { name: 'Executar skill', exact: true }).click(); await fixture.waitForLatestJob('zelador', (job) => job.status === 'succeeded'); await reloadAndProve(page, 'Zelador crítico pronto para revisão'); await selectSkill(page, 'Zelador'); await waitReview(page); const refusalReview = page.getByTestId('artifact-approval-review'); const refusalText = await refusalReview.innerText(); await refusalReview.getByRole('button', { name: 'Rejeitar', exact: true }).click(); await expect(refusalReview).not.toBeVisible({ timeout: 30_000 }); const refusedRun = await fixture.waitForLatestSkillRun('zelador', (candidate) => candidate.status === 'cancelled'); evidence.refusals.push({ skillId: 'zelador', runId: refusedRun.id, durationMs: durationMs(refusalStart), reason: 'Revisão humana recusou proposta com CAPI/deduplicação não confirmadas.', proposalExcerpt: refusalText.slice(0, 600), outbox: await fixture.approvalFor(refusedRun.id) }); await saveEvidence();

  await reloadAndProve(page, 'recusa do Zelador persistida'); await selectSkill(page, 'Zelador'); const retryButton = page.getByRole('button', { name: 'Repetir', exact: true }); await expect(retryButton).toBeVisible(); const retryResponsePromise = page.waitForResponse((response) => response.url().endsWith(`/api/local/skill-runs/${refusedRun.input_snapshot?.jobId}/retry`) && response.request().method() === 'POST', { timeout: 30_000 }); await retryButton.dispatchEvent('click'); const retryResponse = await retryResponsePromise; expect(retryResponse.status()).toBe(202); await expect(page.getByRole('button', { name: 'Cancelar', exact: true })).toBeVisible({ timeout: 30_000 }); await page.getByRole('button', { name: 'Cancelar', exact: true }).click(); const retryJob = await fixture.waitForLatestJob('zelador', (job) => job.attempt >= 2 && job.status === 'cancelled'); await fixture.waitForLatestSkillRun('zelador', (candidate) => candidate.status === 'cancelled'); evidence.retries.push({ jobId: refusedRun.input_snapshot?.jobId ?? null, attempt: retryJob.attempt, status: retryJob.status, retryHttpStatus: retryResponse.status(), cancelAfterRetry: true }); await saveEvidence();

  await reloadAndProve(page, 'após recusa e retry do Zelador'); await approveCurrent(page, 'Zelador', 'Confirmação literal do operador: BM ativo; conta de anúncios ativa; Pixel Helper mostra evento disparando; CAPI Ativo no Events Manager; evento Compra apareceu uma vez com event_id; domínio verificado; pagamento aprovado. Status geral OK.'); await reloadAndProve(page, 'Zelador materializado'); await approveCurrent(page, 'Briefista', 'Use apenas os dois ângulos com nível de consciência declarado no copy.md. Gere opções e deixe a curadoria/decisão humana explícita; recuse o ângulo sem nível.'); await reloadAndProve(page, 'Briefista materializado'); await approveCurrent(page, 'Estruturador', 'Use somente os finalistas curados pelo operador. Default sagrado: Vendas, Conversão, público amplo/frio + Advantage+, posicionamento automático, R$30/dia por 7 dias. Não publique e deixe submetida_por_humano_em vazio.'); await reloadAndProve(page, 'Estruturador materializado'); const metricStage = await approveCurrent(page, 'Leitor de Metricas', 'O operador colou literalmente: gasto R$210; impressões 41.800; cliques no link 334; conversões Compra 4; CPA do gerenciador R$52,50; ROAS do gerenciador 3,1x. Não forneceu CTR, alcance, frequência, CPM nem janela de atribuição. Registre cada campo ausente com valor null e selo nao_fornecido; não calcule nada ausente. ROAS não foi confirmado no caixa, portanto é Estimado com premissa explícita.'); await reloadAndProve(page, 'Leitor materializado');
  const diagnosticStage = await approveCurrent(page, 'Diagnosticador', 'Leia somente a leitura literal anterior. Retorne UMA alavanca com hipótese, critério de sucesso, critério de reversão e circuit breaker. Não execute a alavanca; a decisão humana é aprovar ou rejeitar a recomendação.');
  expect(diagnosticStage.proposal).toBeTruthy(); const diagnosisText = JSON.stringify(diagnosticStage.proposal); expect(diagnosisText).toMatch(/alavanca|lever/i); expect(diagnosisText).toMatch(/sucesso|success/i); expect(diagnosisText).toMatch(/revers|reversal/i); expect(diagnosticStage.approvals.some((record) => record.decision === 'approve' && record.state === 'done')).toBe(true);
  const unavailableMetrics = unavailableMetricsFromStage(metricStage); const normalizedUnavailableMetrics = unavailableMetrics.map(normalizeText); expect(normalizedUnavailableMetrics).toEqual(expect.arrayContaining(['ctr', 'cpm', 'alcance', 'frequencia'])); expect(derivedUnavailableMetrics(diagnosticStage.proposal, unavailableMetrics)).toEqual([]);

  const dbCampaign = await fixture.campaign(); expect(dbCampaign?.status).toBe('draft'); expect(dbCampaign?.step_current).toBe(1); evidence.finalCampaign = dbCampaign;
  await page.setViewportSize({ width: 1280, height: 900 });
  const desktopPath = resolve(evidenceDir, 'traffic-pilot-desktop.png'); await page.screenshot({ path: desktopPath, fullPage: true }); const desktopState = await page.locator('body').innerText(); const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, storageState: await page.context().storageState() }); const mobilePage = await mobileContext.newPage(); const mobileConsoleErrors: string[] = []; const mobileNetworkFailures: string[] = []; mobilePage.on('console', (message) => { if (message.type() === 'error') mobileConsoleErrors.push(message.text()); }); mobilePage.on('requestfailed', (request) => { const errorText = request.failure()?.errorText ?? 'falha'; if (!errorText.includes('ERR_ABORTED')) mobileNetworkFailures.push(`${request.method()} ${request.url()} · ${errorText}`); }); await mobilePage.goto(page.url()); await expect(mobilePage.getByRole('heading', { name: /Mapa do trabalho/i })).toBeVisible({ timeout: 30_000 }); await mobilePage.waitForTimeout(1_000); await selectSkill(mobilePage, 'Diagnosticador'); await expect(mobilePage.locator('.cms-run-status strong')).toHaveText('Concluída'); const mobileState = await mobilePage.locator('body').innerText(); const mobilePath = resolve(evidenceDir, 'traffic-pilot-mobile.png'); await mobilePage.screenshot({ path: mobilePath, fullPage: true });
  const overlaps = await mobilePage.evaluate(() => { const elements = [...document.querySelectorAll('body *')].filter((element) => { const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0; }); const found: Array<{ a: string; b: string }> = []; for (let index = 0; index < elements.length; index += 1) { const a = elements[index].getBoundingClientRect(); for (let other = index + 1; other < elements.length; other += 1) { const b = elements[other].getBoundingClientRect(); const area = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)); if (area > 24 && elements[index].children.length === 0 && elements[other].children.length === 0) found.push({ a: elements[index].textContent?.trim().slice(0, 80) ?? elements[index].tagName, b: elements[other].textContent?.trim().slice(0, 80) ?? elements[other].tagName }); } } return found.slice(0, 20); });
  evidence.visual = { desktop: desktopPath, mobile: mobilePath, sameState: desktopState.includes('Diagnosticador') && mobileState.includes('Diagnosticador'), overlaps, consoleErrors: [...consoleErrors, ...mobileConsoleErrors], networkFailures: [...networkFailures, ...mobileNetworkFailures], desktopViewport: { width: 1280, height: 900 }, mobileViewport: { width: 390, height: 844 } }; await mobileContext.close(); await saveEvidence(); expect(evidence.visual.sameState).toBe(true); expect(evidence.visual.overlaps).toEqual([]); expect(evidence.visual.consoleErrors).toEqual([]); expect(evidence.visual.networkFailures).toEqual([]); expect(existsSync(desktopPath)).toBe(true); expect(existsSync(mobilePath)).toBe(true);
});

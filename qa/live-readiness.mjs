// Wait for the application lifecycle, then assert the UI. An upstream outage
// stays a failed live check, but is reported separately from a stuck frontend.
export function failedRequest(request) {
  let service = 'unknown';
  try { service = new URL(request.url()).hostname; } catch {}
  return {service, method: request.method(), status: null, outcome: request.failure()?.errorText || 'requestfailed', checkedAt: new Date().toISOString()};
}

export async function liveContext(page) {
  return page.evaluate(() => {
    const api = window.SitePivot, state = api?.app?.dataState, planning = api?.app?.property?.planning;
    const identity = state?.identity;
    return {
      view: api?.app?.view || null,
      identity: identity ? {status: identity.status, startedAt: identity.startedAt, deadlineMs: identity.deadlineMs, review:identity.review||null} : null,
      planning: planning ? {loading: planning.loading, failedKeys: planning.failedKeys || []} : null,
      externalDataUnavailable: identity?.status === 'unavailable' || !!planning?.failedKeys?.length,
      requests: (api?.requestDiagnostics || []).map(({service, method, attempt, status, outcome, elapsedMs, checkedAt, cache}) => ({service, method, attempt, status, outcome, elapsedMs, checkedAt, cache}))
    };
  }).catch(() => ({unavailable: true}));
}

export async function waitForIdentity(page) {
  const deadlineMs = await page.evaluate(() => window.SitePivot?.app?.dataState?.identity?.deadlineMs);
  if (!Number.isFinite(deadlineMs) || deadlineMs <= 0) throw new Error('Frontend readiness contract missing identity deadline');
  try {
    // One polling interval of grace lets the app publish its deadline outcome.
    await page.waitForFunction(() => ['verified', 'unavailable', 'needs-review'].includes(window.SitePivot?.app?.dataState?.identity?.status), null, {timeout: deadlineMs + 1000});
  } catch {
    throw new Error('Frontend identity lifecycle did not settle: ' + JSON.stringify(await liveContext(page)));
  }
  const context = await liveContext(page);
  if (context.identity.status !== 'verified') {
    throw new Error((context.identity.status==='needs-review'?'Live identity requires review: ':'Live identity unavailable: ') + JSON.stringify(context));
  }
  await page.locator('#view-property.active').waitFor();
  return context;
}

export async function waitForPlanning(page, timeout = 20000) {
  try {
    await page.waitForFunction(() => window.SitePivot?.app?.property?.planning?.loading === false, null, {timeout});
  } catch {
    throw new Error('Frontend planning lifecycle did not settle: ' + JSON.stringify(await liveContext(page)));
  }
  return liveContext(page);
}

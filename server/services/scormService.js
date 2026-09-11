import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import xml2js from 'xml2js';
import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_DIR = path.join(__dirname, '..', 'scorm-storage');

export async function parseManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    throw new Error('imsmanifest.xml not found in SCORM package');
  }

  const manifestXml = fs.readFileSync(manifestPath, 'utf8');
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(manifestXml);

  const manifest = result.manifest;
  const schemaVersion = manifest.metadata?.schemaversion || manifest.$?.version || '1.2';
  const is2004 = schemaVersion.includes('2004');
  const version = is2004 ? '2004' : '1.2';

  let title = 'SCORM Package';
  try {
    const orgs = manifest.organizations?.organization;
    if (orgs) {
      const org = Array.isArray(orgs) ? orgs[0] : orgs;
      title = org.title || title;
    }
  } catch {
    // fallback
  }

  let entryPoint = 'index.html';
  try {
    const resources = manifest.resources?.resource;
    if (resources) {
      const res = Array.isArray(resources) ? resources[0] : resources;
      entryPoint = res.$?.href || entryPoint;
    }
  } catch {
    // fallback
  }

  return {
    version,
    title,
    entryPoint,
    rawManifest: result
  };
}

export async function processScormZip(zipFilePath, orgId, courseId = null) {
  const packageId = 'scorm-' + uuidv4().slice(0, 8);
  const targetDir = path.join(STORAGE_DIR, packageId);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(targetDir, true);

  // Look for imsmanifest.xml
  let manifestPath = path.join(targetDir, 'imsmanifest.xml');
  if (!fs.existsSync(manifestPath)) {
    // Search subdirectories if nested
    const files = fs.readdirSync(targetDir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        const subManifest = path.join(targetDir, file.name, 'imsmanifest.xml');
        if (fs.existsSync(subManifest)) {
          manifestPath = subManifest;
          break;
        }
      }
    }
  }

  const parsed = await parseManifest(manifestPath);
  const stats = fs.statSync(zipFilePath);

  await run(
    `INSERT INTO scorm_packages (id, org_id, course_id, title, version, manifest_data_json, entry_point, package_dir, size_bytes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      packageId,
      orgId,
      courseId,
      parsed.title,
      parsed.version,
      JSON.stringify(parsed.rawManifest),
      parsed.entryPoint,
      packageId,
      stats.size
    ]
  );

  return {
    packageId,
    title: parsed.title,
    version: parsed.version,
    entryPoint: parsed.entryPoint
  };
}

export async function initializeAttempt(packageId, userId) {
  const pkg = await get('SELECT * FROM scorm_packages WHERE id = ?', [packageId]);
  if (!pkg) throw new Error('SCORM package not found');

  // Check for existing attempt
  let attempt = await get(
    'SELECT * FROM scorm_attempts WHERE package_id = ? AND user_id = ? ORDER BY attempt_number DESC LIMIT 1',
    [packageId, userId]
  );

  if (!attempt || attempt.status === 'completed' || attempt.status === 'passed') {
    const nextAttemptNumber = attempt ? attempt.attempt_number + 1 : 1;
    const attemptId = 'att-' + uuidv4().slice(0, 8);

    await run(
      `INSERT INTO scorm_attempts (id, package_id, user_id, attempt_number, status, started_at, last_accessed_at)
       VALUES (?, ?, ?, ?, 'incomplete', datetime('now'), datetime('now'))`,
      [attemptId, packageId, userId, nextAttemptNumber]
    );

    attempt = await get('SELECT * FROM scorm_attempts WHERE id = ?', [attemptId]);

    // Initialize baseline CMI elements
    const is2004 = pkg.version === '2004';
    const baseElements = is2004
      ? {
          'cmi.completion_status': 'incomplete',
          'cmi.success_status': 'unknown',
          'cmi.score.scaled': '0',
          'cmi.score.raw': '0',
          'cmi.score.min': '0',
          'cmi.score.max': '100',
          'cmi.location': '',
          'cmi.suspend_data': '',
          'cmi.total_time': 'PT0S'
        }
      : {
          'cmi.core.lesson_status': 'incomplete',
          'cmi.core.score.raw': '0',
          'cmi.core.score.min': '0',
          'cmi.core.score.max': '100',
          'cmi.core.lesson_location': '',
          'cmi.suspend_data': '',
          'cmi.core.total_time': '00:00:00'
        };

    for (const [key, val] of Object.entries(baseElements)) {
      await run(
        `INSERT INTO scorm_runtime_data (id, attempt_id, element_name, element_value) VALUES (?, ?, ?, ?)`,
        ['rt-' + uuidv4().slice(0, 8), attemptId, key, val]
      );
    }
  } else {
    // Update last accessed
    await run("UPDATE scorm_attempts SET last_accessed_at = datetime('now') WHERE id = ?", [attempt.id]);
  }

  // Load all runtime data for attempt
  const runtimeRows = await query('SELECT element_name, element_value FROM scorm_runtime_data WHERE attempt_id = ?', [attempt.id]);
  const cmiState = {};
  for (const r of runtimeRows) {
    cmiState[r.element_name] = r.element_value;
  }

  return {
    attemptId: attempt.id,
    version: pkg.version,
    entryPoint: pkg.entry_point,
    packageDir: pkg.package_dir,
    status: attempt.status,
    cmiState
  };
}

export async function setCmiValue(attemptId, elementName, elementValue) {
  const existing = await get(
    'SELECT id FROM scorm_runtime_data WHERE attempt_id = ? AND element_name = ?',
    [attemptId, elementName]
  );

  if (existing) {
    await run(
      "UPDATE scorm_runtime_data SET element_value = ?, updated_at = datetime('now') WHERE id = ?",
      [String(elementValue), existing.id]
    );
  } else {
    await run(
      'INSERT INTO scorm_runtime_data (id, attempt_id, element_name, element_value) VALUES (?, ?, ?, ?)',
      ['rt-' + uuidv4().slice(0, 8), attemptId, elementName, String(elementValue)]
    );
  }

  // Synchronize key summary fields back to scorm_attempts
  if (elementName === 'cmi.core.lesson_status' || elementName === 'cmi.completion_status') {
    await run('UPDATE scorm_attempts SET status = ? WHERE id = ?', [elementValue, attemptId]);
    if (elementValue === 'completed' || elementValue === 'passed') {
      await run("UPDATE scorm_attempts SET completed_at = datetime('now') WHERE id = ?", [attemptId]);
    }
  } else if (elementName === 'cmi.core.score.raw' || elementName === 'cmi.score.raw') {
    await run('UPDATE scorm_attempts SET score_raw = ? WHERE id = ?', [parseFloat(elementValue) || 0, attemptId]);
  } else if (elementName === 'cmi.score.scaled') {
    await run('UPDATE scorm_attempts SET score_scaled = ? WHERE id = ?', [parseFloat(elementValue) || 0, attemptId]);
  } else if (elementName === 'cmi.suspend_data') {
    await run('UPDATE scorm_attempts SET suspend_data = ? WHERE id = ?', [String(elementValue), attemptId]);
  } else if (elementName === 'cmi.core.lesson_location' || elementName === 'cmi.location') {
    await run('UPDATE scorm_attempts SET lesson_location = ? WHERE id = ?', [String(elementValue), attemptId]);
  } else if (elementName === 'cmi.core.session_time' || elementName === 'cmi.session_time') {
    await run('UPDATE scorm_attempts SET session_time = ? WHERE id = ?', [String(elementValue), attemptId]);
  }

  return true;
}

export async function commitAttempt(attemptId, cmiData = null) {
  if (cmiData && typeof cmiData === 'object') {
    for (const [key, val] of Object.entries(cmiData)) {
      if (val !== undefined && val !== null) {
        await setCmiValue(attemptId, key, val);
      }
    }
  }
  await run("UPDATE scorm_attempts SET last_accessed_at = datetime('now') WHERE id = ?", [attemptId]);
  return true;
}

export async function terminateAttempt(attemptId) {
  await run("UPDATE scorm_attempts SET last_accessed_at = datetime('now') WHERE id = ?", [attemptId]);
  const attempt = await get('SELECT * FROM scorm_attempts WHERE id = ?', [attemptId]);
  return attempt;
}


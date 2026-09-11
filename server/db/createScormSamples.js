import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_DIR = path.join(__dirname, '..', 'scorm-storage');

export function createSampleScormPackages() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }

  // --- PACKAGE 1: SCORM 1.2 "Enterprise Information Security & Zero Trust" ---
  const pkg1Dir = path.join(STORAGE_DIR, 'scorm-pkg-sec101');
  if (!fs.existsSync(pkg1Dir)) {
    fs.mkdirSync(pkg1Dir, { recursive: true });
  }

  const manifest12 = `<?xml version="1.0" standalone="no" ?>
<manifest identifier="STRATA_SCORM_12_SEC101" version="1.2"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="STRATA_ORG_1">
    <organization identifier="STRATA_ORG_1">
      <title>Enterprise Information Security &amp; Zero Trust Architecture</title>
      <item identifier="ITEM_1" identifierref="RES_1">
        <title>Zero Trust Architecture &amp; Identity Verification</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES_1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>`;

  const html12 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zero Trust Architecture &amp; Identity Verification</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px; color: #0f172a; background: #ffffff; }
    .header { border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 4px 10px; background: #eff6ff; color: #1e40af; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0 0 8px 0; }
    p { font-size: 15px; line-height: 1.6; color: #475569; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 16px 0; }
    .question-box { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .btn { background: #1e40af; color: #ffffff; border: none; padding: 10px 18px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s; }
    .btn:hover { background: #1d4ed8; }
    .btn-outline { background: transparent; border: 1px solid #cbd5e1; color: #334155; }
    .btn-outline:hover { background: #f1f5f9; }
    .status-panel { margin-top: 24px; padding: 12px 16px; border-radius: 6px; font-size: 13px; font-family: monospace; background: #0f172a; color: #f8fafc; }
    .radio-group label { display: block; margin: 8px 0; cursor: pointer; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <span class="badge">SCORM 1.2 Interactive SCO</span>
    <h1>Module 1: Foundations of Zero Trust Enterprise Security</h1>
    <p>Understand the core tenet: "Never Trust, Always Verify" across identity, endpoints, and microsegments.</p>
  </div>

  <div class="card">
    <h3 style="margin-top:0;">1. Core Zero Trust Architectural Pillars</h3>
    <ul>
      <li><strong>Identity-Centric Authentication:</strong> Continuous verification with contextual MFA.</li>
      <li><strong>Least Privilege Access:</strong> Just-in-Time (JIT) and Just-Enough-Access (JEA) controls.</li>
      <li><strong>Micro-Segmentation:</strong> Preventing lateral adversary movement across internal VPCs.</li>
      <li><strong>Continuous Telemetry:</strong> Real-time behavioral anomaly scoring.</li>
    </ul>
  </div>

  <div class="question-box">
    <h3>Interactive Knowledge Check</h3>
    <p>What is the fundamental architectural axiom of a Zero Trust model?</p>
    <div class="radio-group">
      <label><input type="radio" name="q1" value="A"> Trust internal network traffic by default once past perimeter firewalls.</label>
      <label><input type="radio" name="q1" value="B" id="correctAnswer"> Assume breach and continuously verify every access request regardless of origin.</label>
      <label><input type="radio" name="q1" value="C"> Rely strictly on static VPN credentials for employee access.</label>
    </div>
    <div style="margin-top: 14px; display: flex; gap: 10px;">
      <button class="btn" onclick="submitAssessment()">Submit &amp; Complete Module</button>
      <button class="btn btn-outline" onclick="saveBookmark()">Save Bookmark</button>
    </div>
  </div>

  <div class="status-panel" id="cmiLog">
    [SCORM 1.2 Runtime Ready] Waiting for user interaction...
  </div>

  <script>
    var scormAPI = null;
    function findAPI(win) {
      var findAttempts = 0;
      while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
        findAttempts++;
        if (findAttempts > 7) return null;
        win = win.parent;
      }
      return win.API;
    }

    function initSCORM() {
      scormAPI = findAPI(window);
      var logEl = document.getElementById('cmiLog');
      if (scormAPI) {
        var res = scormAPI.LMSInitialize("");
        var status = scormAPI.LMSGetValue("cmi.core.lesson_status");
        var suspend = scormAPI.LMSGetValue("cmi.suspend_data");
        logEl.innerText = "LMSInitialize: " + res + " | Current Status: " + status + " | Suspend Data: " + (suspend || "None");
      } else {
        logEl.innerText = "SCORM API adapter not detected in parent hierarchy (Standalone Preview Mode)";
      }
    }

    function submitAssessment() {
      var correct = document.getElementById('correctAnswer').checked;
      var logEl = document.getElementById('cmiLog');
      if (!scormAPI) {
        alert("Running in standalone preview mode. Score: " + (correct ? "100%" : "0%"));
        return;
      }
      if (correct) {
        scormAPI.LMSSetValue("cmi.core.score.raw", "100");
        scormAPI.LMSSetValue("cmi.core.score.min", "0");
        scormAPI.LMSSetValue("cmi.core.score.max", "100");
        scormAPI.LMSSetValue("cmi.core.lesson_status", "completed");
        scormAPI.LMSSetValue("cmi.core.session_time", "00:04:30");
        scormAPI.LMSSetValue("cmi.suspend_data", JSON.stringify({ q1Answered: true, score: 100 }));
        scormAPI.LMSCommit("");
        logEl.innerText = "Score Recorded: 100/100 | Status: COMPLETED | LMSCommit: Success";
        alert("Assessment passed! SCORM runtime data committed to LMS.");
      } else {
        scormAPI.LMSSetValue("cmi.core.score.raw", "50");
        scormAPI.LMSSetValue("cmi.core.lesson_status", "incomplete");
        scormAPI.LMSCommit("");
        logEl.innerText = "Score Recorded: 50/100 | Status: INCOMPLETE (Retake recommended)";
        alert("Incorrect selection. Please review the Zero Trust pillars and retry.");
      }
    }

    function saveBookmark() {
      if (scormAPI) {
        scormAPI.LMSSetValue("cmi.core.lesson_location", "section-1-pillars");
        scormAPI.LMSSetValue("cmi.suspend_data", JSON.stringify({ lastPosition: "section-1-pillars", timestamp: Date.now() }));
        scormAPI.LMSCommit("");
        document.getElementById('cmiLog').innerText = "Bookmark saved: 'section-1-pillars' to cmi.core.lesson_location";
        alert("Bookmark saved to LMS runtime.");
      }
    }

    window.onload = initSCORM;
    window.onunload = function() {
      if (scormAPI) {
        scormAPI.LMSFinish("");
      }
    };
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(pkg1Dir, 'imsmanifest.xml'), manifest12, 'utf8');
  fs.writeFileSync(path.join(pkg1Dir, 'index.html'), html12, 'utf8');

  // Also create a downloadable/uploadable ZIP for the package
  const zip1 = new AdmZip();
  zip1.addLocalFolder(pkg1Dir);
  zip1.writeZip(path.join(STORAGE_DIR, 'zero_trust_scorm_12.zip'));

  // --- PACKAGE 2: SCORM 2004 4th Edition "Strategic Decision Making & Risk" ---
  const pkg2Dir = path.join(STORAGE_DIR, 'scorm-pkg-strat201');
  if (!fs.existsSync(pkg2Dir)) {
    fs.mkdirSync(pkg2Dir, { recursive: true });
  }

  const manifest2004 = `<?xml version="1.0" encoding="utf-8" standalone="no" ?>
<manifest identifier="STRATA_SCORM_2004_STRAT201" version="1.0"
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
          xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
          xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
          xmlns:imsss="http://www.imsglobal.org/xsd/imsss">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
  </metadata>
  <organizations default="STRATA_ORG_2004">
    <organization identifier="STRATA_ORG_2004">
      <title>Strategic Decision Making &amp; Executive Risk Management</title>
      <item identifier="ITEM_STRAT_1" identifierref="RES_STRAT_1">
        <title>Probabilistic Scenario Planning &amp; Cognitive Biases</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES_STRAT_1" type="webcontent" adlcp:scormType="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>`;

  const html2004 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Strategic Decision Making &amp; Cognitive Biases</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px; color: #0f172a; background: #ffffff; }
    .header { border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 4px 10px; background: #fdf2f8; color: #9d174d; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0 0 8px 0; }
    p { font-size: 15px; line-height: 1.6; color: #475569; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 16px 0; }
    .btn { background: #0f172a; color: #ffffff; border: none; padding: 10px 18px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
    .btn:hover { background: #1e293b; }
    .status-panel { margin-top: 24px; padding: 12px 16px; border-radius: 6px; font-size: 13px; font-family: monospace; background: #0f172a; color: #f8fafc; }
  </style>
</head>
<body>
  <div class="header">
    <span class="badge">SCORM 2004 4th Edition SCO</span>
    <h1>Executive Risk &amp; Scenario Forecasting</h1>
    <p>Managing asymmetric risk and cognitive heuristics in high-stakes organizational decisions.</p>
  </div>

  <div class="card">
    <h3 style="margin-top:0;">Key Heuristics to Mitigate:</h3>
    <ul>
      <li><strong>Availability Cascade:</strong> Overweighting recent vivid events during risk modeling.</li>
      <li><strong>Sunk Cost Fallacy:</strong> Continuing underperforming capital allocations due to historical expenditure.</li>
      <li><strong>Confirmation Bias:</strong> Selectively curating market intelligence to corroborate hypotheses.</li>
    </ul>
    <button class="btn" onclick="complete2004SCO()">Complete Module &amp; Record 2004 Success</button>
  </div>

  <div class="status-panel" id="scorm2004Log">
    [SCORM 2004 Runtime Ready] Waiting for user action...
  </div>

  <script>
    var api2004 = null;
    function findAPI2004(win) {
      var findAttempts = 0;
      while ((win.API_1484_11 == null) && (win.parent != null) && (win.parent != win)) {
        findAttempts++;
        if (findAttempts > 7) return null;
        win = win.parent;
      }
      return win.API_1484_11;
    }

    function initSCORM2004() {
      api2004 = findAPI2004(window);
      var logEl = document.getElementById('scorm2004Log');
      if (api2004) {
        var res = api2004.Initialize("");
        var completion = api2004.GetValue("cmi.completion_status");
        var success = api2004.GetValue("cmi.success_status");
        logEl.innerText = "Initialize: " + res + " | completion_status: " + completion + " | success_status: " + success;
      } else {
        logEl.innerText = "SCORM 2004 API_1484_11 adapter not detected in hierarchy.";
      }
    }

    function complete2004SCO() {
      var logEl = document.getElementById('scorm2004Log');
      if (!api2004) {
        alert("Simulated Completion: 2004 Runtime passed.");
        return;
      }
      api2004.SetValue("cmi.completion_status", "completed");
      api2004.SetValue("cmi.success_status", "passed");
      api2004.SetValue("cmi.score.scaled", "0.95");
      api2004.SetValue("cmi.score.raw", "95");
      api2004.SetValue("cmi.session_time", "PT5M12S");
      api2004.Commit("");
      logEl.innerText = "cmi.completion_status: completed | cmi.success_status: passed | cmi.score.scaled: 0.95 | Commit: OK";
      alert("SCORM 2004 objective recorded as PASSED (95%).");
    }

    window.onload = initSCORM2004;
    window.onunload = function() {
      if (api2004) {
        api2004.Terminate("");
      }
    };
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(pkg2Dir, 'imsmanifest.xml'), manifest2004, 'utf8');
  fs.writeFileSync(path.join(pkg2Dir, 'index.html'), html2004, 'utf8');

  const zip2 = new AdmZip();
  zip2.addLocalFolder(pkg2Dir);
  zip2.writeZip(path.join(STORAGE_DIR, 'strategic_risk_scorm_2004.zip'));

  console.log("SCORM 1.2 and SCORM 2004 sample packages created in", STORAGE_DIR);
}

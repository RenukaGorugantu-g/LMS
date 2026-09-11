import { apiRequest } from './api';

export class ScormBridge {
  constructor(attemptId, version, initialCmi = {}, onLogCallback = null) {
    this.attemptId = attemptId;
    this.version = version;
    this.cmiData = { ...initialCmi };
    this.onLog = onLogCallback || (() => {});
    this.isInitialized = false;
    this.lastErrorCode = '0';

    this.bindToWindow();
  }

  log(action, element, value, result) {
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      version: this.version,
      action,
      element: element || '',
      value: value !== undefined ? String(value) : '',
      result: String(result)
    };
    this.onLog(entry);
  }

  bindToWindow() {
    if (this.version === '1.2') {
      window.API = {
        LMSInitialize: (param) => this.scorm12_Initialize(param),
        LMSFinish: (param) => this.scorm12_Finish(param),
        LMSGetValue: (element) => this.scorm12_GetValue(element),
        LMSSetValue: (element, value) => this.scorm12_SetValue(element, value),
        LMSCommit: (param) => this.scorm12_Commit(param),
        LMSGetLastError: () => this.lastErrorCode,
        LMSGetErrorString: (code) => 'No error',
        LMSGetDiagnostic: (code) => 'Diagnostic info for ' + code
      };
    } else {
      window.API_1484_11 = {
        Initialize: (param) => this.scorm2004_Initialize(param),
        Terminate: (param) => this.scorm2004_Terminate(param),
        GetValue: (element) => this.scorm2004_GetValue(element),
        SetValue: (element, value) => this.scorm2004_SetValue(element, value),
        Commit: (param) => this.scorm2004_Commit(param),
        GetLastError: () => this.lastErrorCode,
        GetErrorString: (code) => 'No error',
        GetDiagnostic: (code) => 'SCORM 2004 diagnostic info'
      };
    }
  }

  scorm12_Initialize(param) {
    this.isInitialized = true;
    this.log('LMSInitialize', '', '', 'true');
    return 'true';
  }

  scorm12_Finish(param) {
    this.isInitialized = false;
    this.log('LMSFinish', '', '', 'true');
    apiRequest('/scorm/terminate', {
      method: 'POST',
      body: JSON.stringify({ attemptId: this.attemptId })
    }).catch(console.error);
    return 'true';
  }

  scorm12_GetValue(element) {
    const val = this.cmiData[element] !== undefined ? this.cmiData[element] : '';
    this.log('LMSGetValue', element, '', val);
    return String(val);
  }

  scorm12_SetValue(element, value) {
    this.cmiData[element] = value;
    this.log('LMSSetValue', element, value, 'true');
    apiRequest('/scorm/setvalue', {
      method: 'POST',
      body: JSON.stringify({ attemptId: this.attemptId, element, value })
    }).catch(console.error);
    return 'true';
  }

  scorm12_Commit(param) {
    this.log('LMSCommit', '', '', 'true');
    apiRequest('/scorm/commit', {
      method: 'POST',
      body: JSON.stringify({ attemptId: this.attemptId })
    }).catch(console.error);
    return 'true';
  }

  // SCORM 2004 Methods
  scorm2004_Initialize(param) {
    this.isInitialized = true;
    this.log('Initialize', '', '', 'true');
    return 'true';
  }

  scorm2004_Terminate(param) {
    this.isInitialized = false;
    this.log('Terminate', '', '', 'true');
    apiRequest('/scorm/terminate', {
      method: 'POST',
      body: JSON.stringify({ attemptId: this.attemptId })
    }).catch(console.error);
    return 'true';
  }

  scorm2004_GetValue(element) {
    const val = this.cmiData[element] !== undefined ? this.cmiData[element] : '';
    this.log('GetValue', element, '', val);
    return String(val);
  }

  scorm2004_SetValue(element, value) {
    this.cmiData[element] = value;
    this.log('SetValue', element, value, 'true');
    apiRequest('/scorm/setvalue', {
      method: 'POST',
      body: JSON.stringify({ attemptId: this.attemptId, element, value })
    }).catch(console.error);
    return 'true';
  }

  scorm2004_Commit(param) {
    this.log('Commit', '', '', 'true');
    apiRequest('/scorm/commit', {
      method: 'POST',
      body: JSON.stringify({ attemptId: this.attemptId })
    }).catch(console.error);
    return 'true';
  }

  destroy() {
    if (window.API) delete window.API;
    if (window.API_1484_11) delete window.API_1484_11;
  }
}

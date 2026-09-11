import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, ArrowRight, RefreshCw, FileText, Cpu, 
  HelpCircle, AlertCircle, Eye, Check, Edit3, ShieldCheck, ChevronRight,
  Plus, Trash2, ArrowUp, ArrowDown, Video, BookOpen, Clock, Target, 
  Sliders, Layers, Award, Wand2, Compass, Play
} from 'lucide-react';
import { apiRequest } from '../../lib/api';

const TOPIC_PRESETS = [
  { label: 'Kubernetes & eBPF Security', topic: 'Kubernetes Cluster Hardening & eBPF Runtime Security' },
  { label: 'Generative AI & LLMs', topic: 'Autonomous LLM Agents & Enterprise RAG Systems' },
  { label: 'Zero Trust & Compliance', topic: 'Zero Trust Architecture & ISO-27001 Compliance' },
  { label: 'FinTech Risk & Fraud', topic: 'Financial Risk Modeling & Real-Time Fraud Detection' },
  { label: 'Clinical Protocols & HIPAA', topic: 'Healthcare Patient Safety & HIPAA Compliance' },
  { label: 'Executive Strategy & OKRs', topic: 'Executive Strategy & High-Performance Team Leadership' }
];

export default function AiCourseStudio() {
  const [activeStep, setActiveStep] = useState(1); // 1: IDEA, 2: BLUEPRINT, 3: REVIEW & AUDIT, 4: PUBLISH
  
  // Step 1: Precision Parameters
  const [topic, setTopic] = useState('Autonomous LLM Agents & Enterprise RAG Systems');
  const [audience, setAudience] = useState('Senior Platform Architects & Engineering Leads');
  const [difficulty, setDifficulty] = useState('ADVANCED');
  const [estimatedHours, setEstimatedHours] = useState(4);
  const [targetModules, setTargetModules] = useState(4);
  const [pedagogicalStyle, setPedagogicalStyle] = useState('PRACTICAL'); // PRACTICAL, CASE_STUDY, CONCEPTUAL, EXECUTIVE
  const [tone, setTone] = useState('PROFESSIONAL'); // PROFESSIONAL, CONVERSATIONAL, ACADEMIC, DIRECT
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [includeAssignment, setIncludeAssignment] = useState(true);
  const [includeVideo, setIncludeVideo] = useState(true);
  const [customObjectives, setCustomObjectives] = useState(
    'Architect production-grade vector search and cross-encoder reranking\nImplement automated LLM guardrails against prompt injection\nDesign telemetry-backed latency and token cost optimization'
  );
  const [sourceType, setSourceType] = useState('PROMPT');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Step 2: Blueprint Scaffold State
  const [blueprint, setBlueprint] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourseId, setGeneratedCourseId] = useState(null);
  const [readinessReport, setReadinessReport] = useState(null);

  // Step 3: AI Copilot State
  const [copilotCommand, setCopilotCommand] = useState('');
  const [copilotStatus, setCopilotStatus] = useState('');
  const [isCopilotExecuting, setIsCopilotExecuting] = useState(false);

  const navigate = useNavigate();

  // Step 1 -> 2: Synthesize Course Blueprint
  const handleGenerateBlueprint = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const bp = await apiRequest('/ai/blueprint', {
        method: 'POST',
        body: JSON.stringify({ 
          topic, 
          audience, 
          difficulty, 
          estimatedHours,
          targetModules,
          pedagogicalStyle,
          tone,
          includeQuiz,
          includeAssignment,
          includeVideo,
          learningObjectives: customObjectives
        })
      });
      setBlueprint(bp);
      setActiveStep(2);
    } catch (err) {
      alert('Blueprint generation failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Step 2 Blueprint Interactive Editing Helpers
  const handleUpdateModule = (modIndex, field, value) => {
    setBlueprint(prev => {
      const newMods = [...prev.modules];
      newMods[modIndex] = { ...newMods[modIndex], [field]: value };
      return { ...prev, modules: newMods };
    });
  };

  const handleAddModule = () => {
    setBlueprint(prev => {
      const newMod = {
        title: `Module ${prev.modules.length + 1}: Custom Practical Deep Dive`,
        desc: 'Advanced operational implementation, architecture patterns, and verification.',
        lessons: [
          { title: 'Core Principles & Architectural Layout', type: 'TEXT', durationMinutes: 20 },
          { title: 'Hands-on Execution Guide', type: 'TEXT', durationMinutes: 25 },
          { title: 'Knowledge Check Quiz', type: 'QUIZ', durationMinutes: 15 }
        ]
      };
      return { ...prev, modules: [...prev.modules, newMod] };
    });
  };

  const handleDeleteModule = (modIndex) => {
    if (blueprint.modules.length <= 1) {
      alert('A course must have at least one module.');
      return;
    }
    setBlueprint(prev => ({
      ...prev,
      modules: prev.modules.filter((_, idx) => idx !== modIndex)
    }));
  };

  const handleMoveModule = (modIndex, direction) => {
    setBlueprint(prev => {
      const newMods = [...prev.modules];
      const targetIndex = modIndex + direction;
      if (targetIndex < 0 || targetIndex >= newMods.length) return prev;
      const temp = newMods[modIndex];
      newMods[modIndex] = newMods[targetIndex];
      newMods[targetIndex] = temp;
      return { ...prev, modules: newMods };
    });
  };

  const handleUpdateLesson = (modIndex, lesIndex, field, value) => {
    setBlueprint(prev => {
      const newMods = [...prev.modules];
      const newLessons = [...newMods[modIndex].lessons];
      newLessons[lesIndex] = { ...newLessons[lesIndex], [field]: value };
      newMods[modIndex] = { ...newMods[modIndex], lessons: newLessons };
      return { ...prev, modules: newMods };
    });
  };

  const handleAddLesson = (modIndex) => {
    setBlueprint(prev => {
      const newMods = [...prev.modules];
      const newLesson = {
        title: `Technical Lesson ${newMods[modIndex].lessons.length + 1}`,
        type: 'TEXT',
        durationMinutes: 20
      };
      newMods[modIndex] = {
        ...newMods[modIndex],
        lessons: [...newMods[modIndex].lessons, newLesson]
      };
      return { ...prev, modules: newMods };
    });
  };

  const handleDeleteLesson = (modIndex, lesIndex) => {
    setBlueprint(prev => {
      const newMods = [...prev.modules];
      newMods[modIndex] = {
        ...newMods[modIndex],
        lessons: newMods[modIndex].lessons.filter((_, idx) => idx !== lesIndex)
      };
      return { ...prev, modules: newMods };
    });
  };

  // Step 2 -> 3: Approve Blueprint & Generate Full Course
  const handleApproveBlueprint = async () => {
    setIsGenerating(true);
    try {
      const res = await apiRequest('/ai/create-course', {
        method: 'POST',
        body: JSON.stringify({ blueprint })
      });
      setGeneratedCourseId(res.courseId);

      // Trigger automated quality audit
      const audit = await apiRequest(`/ai/audit/${res.courseId}`);
      setReadinessReport(audit);
      setActiveStep(3);
    } catch (err) {
      alert('Course generation failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run AI Copilot Command
  const handleRunCopilot = async (command) => {
    const cmd = command || copilotCommand;
    if (!cmd || !generatedCourseId) return;

    setIsCopilotExecuting(true);
    setCopilotStatus('');
    try {
      const res = await apiRequest('/ai/copilot', {
        method: 'POST',
        body: JSON.stringify({
          courseId: generatedCourseId,
          commandText: cmd
        })
      });
      setCopilotStatus(res.actionSummary);

      // Re-run audit
      const audit = await apiRequest(`/ai/audit/${generatedCourseId}`);
      setReadinessReport(audit);
      setCopilotCommand('');
    } catch (err) {
      alert('Copilot failed: ' + err.message);
    } finally {
      setIsCopilotExecuting(false);
    }
  };

  // Step 3 -> 4: Publish Course
  const handlePublishCourse = async () => {
    try {
      await apiRequest(`/courses/${generatedCourseId}/publish`, { method: 'POST' });
      setActiveStep(4);
    } catch (err) {
      alert('Publishing failed: ' + err.message);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Studio Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                AI Course Studio
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Precision curriculum authoring engine powered by instructional design scaffolding
              </p>
            </div>
          </div>
        </div>

        {/* 4 Pipeline Stages */}
        <div className="flex items-center space-x-1 sm:space-x-2 text-xs font-semibold overflow-x-auto pb-1">
          {[
            { num: 1, label: 'Parameters & Scope' },
            { num: 2, label: 'Blueprint Scaffold' },
            { num: 3, label: 'Quality Audit & Copilot' },
            { num: 4, label: 'Ready & Live' }
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition ${
                activeStep === s.num
                  ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-xs'
                  : activeStep > s.num
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'text-slate-400 border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                activeStep === s.num ? 'bg-white text-purple-700' : activeStep > s.num ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {activeStep > s.num ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline whitespace-nowrap">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: IDEA & PRECISION PARAMETERS */}
      {activeStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-8">
          <div>
            <h3 className="text-base font-bold text-slate-900">Step 1: Course Scope &amp; Pedagogical Precision</h3>
            <p className="text-xs text-slate-500">Fine-tune the target domain, depth, module count, and assessment components</p>
          </div>

          {/* Preset Topic Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Inspiration Presets (Click to Load)
            </label>
            <div className="flex flex-wrap gap-2">
              {TOPIC_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopic(p.topic)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    topic === p.topic
                      ? 'bg-purple-50 border-purple-300 text-purple-800 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ⚡ {p.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleGenerateBlueprint} className="space-y-6">
            {/* Subject Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Course Subject / Strategic Topic
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Autonomous LLM Agents & Enterprise RAG Systems"
                className="w-full px-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            {/* Audience, Difficulty & Scope */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Audience Level
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Senior Platform Architects"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="BEGINNER">Beginner / Foundational (L1)</option>
                  <option value="INTERMEDIATE">Intermediate Practitioner (L2-3)</option>
                  <option value="ADVANCED">Advanced / Specialist (L4-5)</option>
                  <option value="EXECUTIVE">Executive / Strategic Leadership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Curriculum Modules: <span className="text-purple-600 font-extrabold">{targetModules} Modules</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTargetModules(num)}
                      className={`py-2 text-center rounded-xl text-xs font-bold border transition ${
                        targetModules === num
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {num} {num === 2 ? 'Mini' : num === 6 ? 'Deep' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pedagogical Approach & Tone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pedagogical Architecture
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'PRACTICAL', label: 'Hands-on Technical', desc: 'Code blocks, CLI & runbooks' },
                    { id: 'CASE_STUDY', label: 'Case-Study Centric', desc: 'Real enterprise scenarios' },
                    { id: 'CONCEPTUAL', label: 'Architectural Frameworks', desc: 'Deep systemic principles' },
                    { id: 'EXECUTIVE', label: 'Strategic & Governance', desc: 'ROI, metrics & oversight' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setPedagogicalStyle(style.id)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        pedagogicalStyle === style.id
                          ? 'border-purple-600 bg-purple-50/60 text-purple-900 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold block">{style.label}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tone of Voice
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                >
                  <option value="PROFESSIONAL">Professional &amp; Authoritative (Standard Enterprise)</option>
                  <option value="CONVERSATIONAL">Engaging &amp; Conversational (Modern Tech Startup)</option>
                  <option value="ACADEMIC">Academic &amp; Rigorous (Certification Level)</option>
                  <option value="DIRECT">Direct &amp; Action-Oriented (Engineering Field Guide)</option>
                </select>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block uppercase">Include Components:</span>
                  <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeVideo}
                        onChange={(e) => setIncludeVideo(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Video Lectures</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeQuiz}
                        onChange={(e) => setIncludeQuiz(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Scenario Quizzes</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeAssignment}
                        onChange={(e) => setIncludeAssignment(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Capstone Assignment</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Learning Objectives */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Competency Objectives (One per line)
              </label>
              <textarea
                rows={3}
                value={customObjectives}
                onChange={(e) => setCustomObjectives(e.target.value)}
                placeholder="Enter specific outcomes you want the generated course to guarantee..."
                className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full sm:w-auto px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Tailored Instructional Blueprint...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Precision Course Blueprint →</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: INTERACTIVE BLUEPRINT SCAFFOLD EDITOR */}
      {activeStep === 2 && blueprint && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    Interactive Blueprint Scaffold
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Domain: <strong className="text-slate-800">{blueprint.domain}</strong>
                  </span>
                </div>
                <input
                  type="text"
                  value={blueprint.title}
                  onChange={(e) => setBlueprint({ ...blueprint, title: e.target.value })}
                  className="text-xl font-extrabold text-slate-900 mt-2 px-3 py-1.5 rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-none w-full"
                />
                <textarea
                  rows={2}
                  value={blueprint.description}
                  onChange={(e) => setBlueprint({ ...blueprint, description: e.target.value })}
                  className="text-xs text-slate-600 mt-1.5 px-3 py-1.5 rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-none w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition"
                >
                  ← Edit Parameters
                </button>
                <button
                  type="button"
                  onClick={handleApproveBlueprint}
                  disabled={isGenerating}
                  className="px-6 py-2.5 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 shadow-xs flex items-center space-x-2 transition disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authoring Lessons &amp; Quizzes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Approve &amp; Generate Course</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Blueprint Metadata Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Target Audience</span>
                <span className="font-semibold text-slate-800">{blueprint.audience}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Difficulty Level</span>
                <span className="font-semibold text-slate-800">{blueprint.difficulty}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Curriculum Depth</span>
                <span className="font-semibold text-slate-800">{blueprint.modules.length} Modules ({blueprint.durationHours}h)</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Category Tag</span>
                <span className="font-semibold text-slate-800">{blueprint.category}</span>
              </div>
            </div>

            {/* Interactive Module Scaffold List */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Modules &amp; Lessons Scaffold ({blueprint.modules.length} Sections)
                  </h4>
                  <p className="text-[11px] text-slate-500">Edit titles, reorder, add/remove modules, and customize lesson formats</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold border border-purple-200 flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Section</span>
                </button>
              </div>

              <div className="space-y-4">
                {blueprint.modules.map((mod, mIdx) => (
                  <div key={mIdx} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-shadow shadow-2xs space-y-3">
                    {/* Module Header Controls */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            Section {mIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={mod.title}
                            onChange={(e) => handleUpdateModule(mIdx, 'title', e.target.value)}
                            className="font-bold text-sm text-slate-900 px-2 py-1 rounded border border-transparent hover:border-slate-200 focus:border-purple-500 focus:bg-white focus:outline-none flex-1"
                          />
                        </div>
                        <input
                          type="text"
                          value={mod.desc}
                          onChange={(e) => handleUpdateModule(mIdx, 'desc', e.target.value)}
                          className="text-xs text-slate-500 px-2 py-0.5 rounded border border-transparent hover:border-slate-200 focus:border-purple-500 focus:bg-white focus:outline-none w-full"
                        />
                      </div>

                      {/* Module Reordering & Deletion */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          disabled={mIdx === 0}
                          onClick={() => handleMoveModule(mIdx, -1)}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={mIdx === blueprint.modules.length - 1}
                          onClick={() => handleMoveModule(mIdx, 1)}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteModule(mIdx)}
                          className="p-1 text-rose-400 hover:text-rose-600 rounded"
                          title="Delete Section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons inside Module */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {mod.lessons.map((les, lIdx) => (
                        <div key={lIdx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs">
                          {/* Format Icon */}
                          <div className={`p-1.5 rounded-lg ${
                            les.type === 'VIDEO' ? 'bg-purple-100 text-purple-700' :
                            les.type === 'QUIZ' ? 'bg-amber-100 text-amber-700' :
                            les.type === 'ASSIGNMENT' ? 'bg-rose-100 text-rose-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {les.type === 'VIDEO' ? <Video className="w-3.5 h-3.5" /> :
                             les.type === 'QUIZ' ? <HelpCircle className="w-3.5 h-3.5" /> :
                             les.type === 'ASSIGNMENT' ? <Award className="w-3.5 h-3.5" /> :
                             <BookOpen className="w-3.5 h-3.5" />}
                          </div>

                          {/* Lesson Title Input */}
                          <input
                            type="text"
                            value={les.title}
                            onChange={(e) => handleUpdateLesson(mIdx, lIdx, 'title', e.target.value)}
                            className="flex-1 font-medium text-slate-800 bg-transparent focus:bg-white focus:outline-none px-2 py-1 rounded border border-transparent focus:border-purple-300"
                          />

                          {/* Format Type Selector */}
                          <select
                            value={les.type}
                            onChange={(e) => handleUpdateLesson(mIdx, lIdx, 'type', e.target.value)}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
                          >
                            <option value="TEXT">Text Article</option>
                            <option value="VIDEO">Video Lecture</option>
                            <option value="QUIZ">Quiz Check</option>
                            <option value="ASSIGNMENT">Assignment</option>
                          </select>

                          {/* Duration */}
                          <span className="text-[11px] text-slate-400 whitespace-nowrap">
                            {les.durationMinutes}m
                          </span>

                          {/* Delete Lesson */}
                          <button
                            type="button"
                            onClick={() => handleDeleteLesson(mIdx, lIdx)}
                            className="p-1 text-slate-300 hover:text-rose-500 rounded"
                            title="Remove Lesson"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add Lesson Button */}
                      <button
                        type="button"
                        onClick={() => handleAddLesson(mIdx)}
                        className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 pt-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add Lesson to Section</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Generate CTA */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Total Sections: <strong>{blueprint.modules.length}</strong> • Total Lessons: <strong>{blueprint.modules.reduce((a, m) => a + m.lessons.length, 0)}</strong>
              </span>
              <button
                type="button"
                onClick={handleApproveBlueprint}
                disabled={isGenerating}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authoring Modules &amp; Quizzes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Approve Blueprint &amp; Generate Course →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: QUALITY READINESS AUDIT & AI COPILOT */}
      {activeStep === 3 && readinessReport && (
        <div className="space-y-8">
          {/* Readiness Score Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-900/50 px-2.5 py-1 rounded-full border border-purple-700">
                Instructional Quality Audit Complete
              </span>
              <h3 className="text-2xl font-extrabold text-white">Course Readiness Score™</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                MapleLMS AI synthesized authentic lesson articles, scenario evaluations, and learning scaffolds. The course has been saved as a Draft for instructional review.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <Link
                  to={`/app/courses/${generatedCourseId}/builder`}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Open in Visual Course Builder</span>
                </Link>
                <Link
                  to={`/learning/${generatedCourseId}`}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Preview in Course Player</span>
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 flex-shrink-0 w-56">
              <div className="text-5xl font-extrabold text-purple-400">{readinessReport.overallScore}/100</div>
              <span className="text-xs font-bold text-emerald-400 block">● {readinessReport.status}</span>
              <button
                type="button"
                onClick={handlePublishCourse}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs"
              >
                Approve &amp; Publish Course
              </button>
            </div>
          </div>

          {/* 6-Dimension Quality Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quality Dimension Breakdown</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {readinessReport.checks.map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{c.dimension}</span>
                    <span className="text-xs font-extrabold text-emerald-600">{c.score}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{c.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Context-Aware AI Copilot Assistant */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Context-Aware AI Course Copilot</h3>
                <p className="text-[11px] text-slate-500">Refine the generated curriculum in real time with natural language instructions</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                'Make this module more practical.',
                'Add a case study.',
                'Create five questions.',
                'Rewrite this for senior executives.',
                'Shorten this lesson.',
                'Add a scenario.',
                'Identify learning gaps.'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleRunCopilot(chip)}
                  disabled={isCopilotExecuting}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition border border-purple-200"
                >
                  "{chip}"
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={copilotCommand}
                onChange={(e) => setCopilotCommand(e.target.value)}
                placeholder="Type custom refinement command, e.g., 'Add troubleshooting exercise'..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => handleRunCopilot()}
                disabled={isCopilotExecuting || !copilotCommand}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50"
              >
                {isCopilotExecuting ? 'Applying...' : 'Execute Copilot'}
              </button>
            </div>

            {copilotStatus && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>{copilotStatus}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: PUBLISHED CONFIRMATION */}
      {activeStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-6 shadow-xs max-w-xl mx-auto animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900">Course Published Successfully</h3>
            <p className="text-xs text-slate-500">
              The course is now live in your organization's course catalog. Learners can enroll, study, and earn certificates.
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/learning/${generatedCourseId}`)}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Open in Course Player →
            </button>
            <button
              type="button"
              onClick={() => navigate(`/app/courses/${generatedCourseId}/builder`)}
              className="w-full sm:w-auto px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
            >
              Open Visual Builder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

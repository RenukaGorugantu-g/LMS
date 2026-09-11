import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Play, CheckCircle2, ChevronRight, ChevronLeft, ArrowLeft, 
  Award, Terminal, RefreshCw, FileText, Video, HelpCircle, Check, Sparkles,
  Lightbulb, ExternalLink, Image as ImageIcon, Link as LinkIcon, Download, File
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiRequest } from '../../lib/api';
import { ScormBridge } from '../../lib/scormApiBridge';

export default function CoursePlayer() {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [certIssued, setCertIssued] = useState(null);

  // SCORM bridge state
  const [scormLogs, setScormLogs] = useState([]);
  const [scormDebugOpen, setScormDebugOpen] = useState(false);
  const bridgeRef = useRef(null);

  // Modular Blocks Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    async function loadCourse() {
      try {
        const data = await apiRequest(`/courses/${courseId}`);
        setCourse(data);
      } catch (err) {
        console.error('Failed to load player:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  const activeModule = course?.modules?.[currentModuleIdx];
  const activeLesson = activeModule?.lessons?.[currentLessonIdx];

  // Initialize SCORM bridge when activeLesson is of type SCORM
  useEffect(() => {
    if (!activeLesson || activeLesson.lesson_type !== 'SCORM') {
      if (bridgeRef.current) {
        bridgeRef.current.destroy();
        bridgeRef.current = null;
      }
      return;
    }

    async function setupScorm() {
      try {
        const pkgId = activeLesson.scorm_package_id || course?.scorm_package?.id || 'scorm-pkg-sec101';
        const initData = await apiRequest('/scorm/initialize', {
          method: 'POST',
          body: JSON.stringify({ packageId: pkgId })
        });

        const bridge = new ScormBridge(
          initData.attemptId,
          initData.version,
          initData.cmiState,
          (logEntry) => {
            setScormLogs(prev => [logEntry, ...prev.slice(0, 49)]);
          }
        );
        bridgeRef.current = bridge;
      } catch (err) {
        console.error('SCORM init error in player:', err);
      }
    }

    setupScorm();

    return () => {
      if (bridgeRef.current) {
        bridgeRef.current.destroy();
        bridgeRef.current = null;
      }
    };
  }, [activeLesson, course]);

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    setMarkingComplete(true);
    try {
      const res = await apiRequest(`/courses/${courseId}/lessons/${activeLesson.id}/complete`, {
        method: 'POST'
      });

      // Update local state
      activeLesson.is_completed = true;
      if (res.isCompleted && res.certificateId) {
        setCertIssued(res.certificateId);
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        } catch {}
      }

      // Auto advance to next lesson
      handleNextLesson();
    } catch (err) {
      console.error('Completion mark error:', err);
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleNextLesson = () => {
    if (!activeModule) return;
    if (currentLessonIdx < activeModule.lessons.length - 1) {
      setCurrentLessonIdx(currentLessonIdx + 1);
    } else if (currentModuleIdx < course.modules.length - 1) {
      setCurrentModuleIdx(currentModuleIdx + 1);
      setCurrentLessonIdx(0);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIdx > 0) {
      setCurrentLessonIdx(currentLessonIdx - 1);
    } else if (currentModuleIdx > 0) {
      setCurrentModuleIdx(currentModuleIdx - 1);
      setCurrentLessonIdx(course.modules[currentModuleIdx - 1].lessons.length - 1);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading course player environment...</div>;
  }

  if (!course) {
    return <div className="p-12 text-center text-xs text-slate-500">Course not found.</div>;
  }

  const scormPkgId = activeLesson?.scorm_package_id || course?.scorm_package?.id || 'scorm-pkg-sec101';
  const scormIframeSrc = `/scorm-content/${scormPkgId}/index.html`;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden">
      {/* PLAYER HEADER BAR */}
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/app/learner')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-xs font-bold text-slate-900 block truncate">{course.title}</span>
            <span className="text-[11px] text-slate-400">
              Module {currentModuleIdx + 1} of {course.modules.length} • Lesson {currentLessonIdx + 1} of {activeModule?.lessons?.length || 0}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {activeLesson?.lesson_type === 'SCORM' && (
            <button
              onClick={() => setScormDebugOpen(!scormDebugOpen)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-emerald-400 text-xs font-mono font-bold flex items-center space-x-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>SCORM CMI Console</span>
            </button>
          )}

          <button
            onClick={handlePrevLesson}
            disabled={currentModuleIdx === 0 && currentLessonIdx === 0}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleMarkComplete}
            disabled={markingComplete}
            className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{activeLesson?.is_completed ? 'Completed (Advance)' : 'Mark Complete & Next'}</span>
          </button>

          <button
            onClick={handleNextLesson}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PLAYER SPLIT LAYOUT (SIDEBAR ON LEFT, CONTENT ON RIGHT) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: COURSE CURRICULUM SYLLABUS */}
        <aside className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto z-10">
          <div className="p-4 border-b border-slate-200 bg-white/80 sticky top-0 backdrop-blur-xs z-10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Course Syllabus</h4>
              <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                {course.enrollment?.progress_percent || 0}% Complete
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2.5">
              <div
                className="bg-brand-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${course.enrollment?.progress_percent || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="p-3 space-y-3 flex-1 overflow-y-auto">
            {course.modules?.map((mod, mIdx) => (
              <div key={mod.id} className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-100/75 font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span className="truncate">{mIdx + 1}. {mod.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 ml-1">
                    {mod.lessons?.length || 0} items
                  </span>
                </div>
                <div className="p-1.5 space-y-1">
                  {mod.lessons?.map((les, lIdx) => (
                    <button
                      key={les.id}
                      onClick={() => {
                        setCurrentModuleIdx(mIdx);
                        setCurrentLessonIdx(lIdx);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                        currentModuleIdx === mIdx && currentLessonIdx === lIdx
                          ? 'bg-brand-50 text-brand-900 font-bold shadow-xs border border-brand-200/60'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {les.is_completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0"></span>
                        )}
                        <span className="truncate">{les.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 ml-2">{les.duration_minutes || 10}m</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT / CENTER CONTENT VIEWPORT */}
        <main className="flex-1 bg-white overflow-y-auto flex flex-col justify-between">
          <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-brand-700 uppercase tracking-widest block mb-1">
                {activeModule?.title}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900">{activeLesson?.title}</h1>
            </div>

            {/* DYNAMIC LESSON MODALITY VIEWER */}
            {(() => {
              let lessonBlocks = [];
              if (activeLesson?.metadata_json?.blocks && Array.isArray(activeLesson.metadata_json.blocks)) {
                lessonBlocks = activeLesson.metadata_json.blocks;
              } else if (activeLesson?.metadata_json && typeof activeLesson.metadata_json === 'string') {
                try {
                  const parsed = JSON.parse(activeLesson.metadata_json);
                  if (Array.isArray(parsed.blocks)) lessonBlocks = parsed.blocks;
                } catch {}
              }

              if (lessonBlocks.length > 0) {
                return (
                  <div className="space-y-6">
                    {lessonBlocks.map((block, bIdx) => (
                      <div key={block.id || bIdx} className="space-y-3">
                        {/* Video Block */}
                        {block.type === 'video' && block.url && (
                          <div className="space-y-2">
                            {block.title && <h3 className="text-sm font-bold text-slate-800">{block.title}</h3>}
                            <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video shadow-card flex items-center justify-center">
                              <video
                                controls
                                poster={block.posterUrl || undefined}
                                src={block.url}
                                className="w-full h-full object-cover"
                              ></video>
                            </div>
                            {block.caption && (
                              <p className="text-xs text-slate-500 italic text-center">{block.caption}</p>
                            )}
                          </div>
                        )}

                        {/* Image Block */}
                        {block.type === 'image' && block.url && (
                          <div className="space-y-2">
                            <div className={`rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 ${
                              block.layout === 'banner' ? 'w-full h-80' : 'max-w-xl mx-auto'
                            }`}>
                              <img src={block.url} alt={block.altText || 'Lesson image'} className="w-full h-full object-cover" />
                            </div>
                            {block.caption && (
                              <p className="text-xs text-slate-500 italic text-center">{block.caption}</p>
                            )}
                          </div>
                        )}

                        {/* Text Narrative */}
                        {block.type === 'text' && block.content && (
                          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                            {block.content}
                          </div>
                        )}

                        {/* Key Takeaways Card */}
                        {block.type === 'takeaways' && (
                          <div className="rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/50 border border-indigo-200/80 p-6 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-indigo-950">
                                <Lightbulb className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                <h3 className="text-sm font-extrabold tracking-tight">{block.title || 'Key Takeaways'}</h3>
                              </div>
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-100/80 px-2 py-0.5 rounded-md">
                                Key Highlights
                              </span>
                            </div>
                            <div className="space-y-2">
                              {(block.items || []).map((item, itmIdx) => (
                                <div key={itmIdx} className="flex items-start space-x-2.5 text-xs text-slate-800">
                                  <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Knowledge Check Formative Quiz */}
                        {block.type === 'quiz' && (
                          <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                              <div className="flex items-center space-x-2">
                                <HelpCircle className="w-5 h-5 text-purple-600" />
                                <h3 className="text-sm font-extrabold text-slate-900">Knowledge Check</h3>
                              </div>
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                                Instant Feedback
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-900">{block.prompt}</p>
                            <div className="space-y-2">
                              {(block.options || []).map((opt, optIdx) => {
                                const isCorrect = optIdx === block.correctIdx;
                                const isSelected = quizAnswers[block.id] === optIdx;
                                const isSubmitted = quizSubmitted[block.id];

                                return (
                                  <div
                                    key={optIdx}
                                    onClick={() => {
                                      setQuizAnswers({ ...quizAnswers, [block.id]: optIdx });
                                      setQuizSubmitted({ ...quizSubmitted, [block.id]: true });
                                    }}
                                    className={`p-3 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                                      isSubmitted
                                        ? isCorrect
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                          : isSelected
                                          ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                                          : 'bg-slate-50 border-slate-200 text-slate-500'
                                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2.5">
                                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-mono">
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                    {isSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                                  </div>
                                );
                              })}
                            </div>
                            {quizSubmitted[block.id] && block.explanation && (
                              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 leading-relaxed">
                                <span className="font-bold">Explanation: </span>{block.explanation}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Link / External Resource */}
                        {block.type === 'link' && (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                                <LinkIcon className="w-4 h-4 text-cyan-600" />
                                <span>{block.title || 'External Resource'}</span>
                              </div>
                              <a
                                href={block.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                              >
                                <span>Open Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            {block.description && <p className="text-xs text-slate-500">{block.description}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              }

              if (activeLesson?.lesson_type === 'SCORM') {
                return (
                  <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-card bg-white">
                    <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs flex items-center justify-between">
                      <span className="font-mono text-[11px]">SCORM SCO Runtime: {scormPkgId}</span>
                      <span className="text-emerald-400 font-bold">● window.API Bridge Connected</span>
                    </div>
                    <iframe
                      src={scormIframeSrc}
                      title="SCORM SCO Content"
                      className="w-full h-[540px] border-none"
                    ></iframe>
                  </div>
                );
              }

              if (activeLesson?.lesson_type === 'VIDEO') {
                return (
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video shadow-card flex items-center justify-center">
                      <video
                        controls
                        className="w-full h-full"
                        src={activeLesson.video_url || 'https://www.w3schools.com/html/mov_bbb.mp4'}
                      ></video>
                    </div>
                    {activeLesson.body_text && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        {activeLesson.body_text}
                      </div>
                    )}
                  </div>
                );
              }

              if (activeLesson?.lesson_type === 'QUIZ') {
                return (
                  <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-4">
                    <HelpCircle className="w-12 h-12 text-brand-600 mx-auto" />
                    <h3 className="text-lg font-bold text-slate-900">{activeLesson.title}</h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      Interactive knowledge evaluation required to satisfy module completion. Passing threshold: {activeLesson.quiz_passing_score || 80}%.
                    </p>
                    <Link
                      to={`/app/quiz/${activeLesson.quiz_id || 'qz-sec-1'}`}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
                    >
                      <span>Launch Exam Runner</span>
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </Link>
                  </div>
                );
              }

              return (
                <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
                  <div className="whitespace-pre-line bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                    {activeLesson?.body_text || 'Welcome to this lesson module.'}
                  </div>
                </div>
              );
            })()}
          </div>
        </main>
      </div>

      {/* LIVE SCORM DEBUGGER DRAWER */}
      {scormDebugOpen && (
        <div className="h-64 bg-slate-950 text-slate-300 border-t border-slate-800 p-4 font-mono text-xs flex flex-col z-30 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-[11px]">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">Live SCORM CMI Protocol Transaction Console</span>
            </div>
            <button onClick={() => setScormDebugOpen(false)} className="text-slate-400 hover:text-white">
              ✕ Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {scormLogs.length === 0 ? (
              <p className="text-slate-600 text-center py-6">Waiting for CMI calls from SCO iframe...</p>
            ) : (
              scormLogs.map((log, idx) => (
                <div key={idx} className="text-[11px] flex items-center space-x-3 leading-tight">
                  <span className="text-slate-500">[{log.timestamp}]</span>
                  <span className="text-brand-400 font-bold">{log.action}</span>
                  <span className="text-slate-300">{log.element}</span>
                  {log.value && <span className="text-amber-300">= "{log.value}"</span>}
                  <span className="text-emerald-400">→ {log.result}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CERTIFICATE ISSUED CELEBRATION MODAL */}
      {certIssued && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl border border-slate-200">
            <Award className="w-16 h-16 text-emerald-600 mx-auto" />
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">100% Curriculum Completed</span>
              <h2 className="text-2xl font-extrabold text-slate-900">Certificate Issued!</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                You have successfully completed <strong>{course.title}</strong>. Your verifiable credential has been digitally signed and registered.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                to={`/app/certificates/${certIssued}`}
                className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
              >
                View Credential →
              </Link>
              <button
                onClick={() => setCertIssued(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

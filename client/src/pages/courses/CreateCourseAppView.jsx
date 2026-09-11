import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, Sparkles, FolderArchive, ArrowLeft, ArrowRight, 
  Layers, CheckCircle2, Image as ImageIcon, ShieldCheck, Clock, 
  Target, Award, Lightbulb, PenTool, Check, RefreshCw,
  Upload, UploadCloud, Link as LinkIcon, X, Loader2
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const PRESET_THUMBNAILS = [
  { label: 'Cybersecurity', url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80' },
  { label: 'Cloud Architecture', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80' },
  { label: 'Artificial Intelligence', url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80' },
  { label: 'Leadership & Strategy', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80' },
  { label: 'Engineering & DevOps', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80' }
];

const CATEGORIES = [
  'Cybersecurity & Compliance',
  'Cloud Engineering',
  'Artificial Intelligence & ML',
  'Leadership & Management',
  'Compliance & Governance',
  'DevOps & Site Reliability',
  'Product & Systems Design',
  'Enterprise Data Architecture'
];

export default function CreateCourseAppView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('MANUAL'); // 'MANUAL' | 'AI' | 'SCORM'
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState(CATEGORIES);
  const [category, setCategory] = useState('Cybersecurity & Compliance');
  const [showAddCatInline, setShowAddCatInline] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');
  const [level, setLevel] = useState('INTERMEDIATE');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [passingScore, setPassingScore] = useState(80);
  const [thumbnailUrl, setThumbnailUrl] = useState(PRESET_THUMBNAILS[0].url);
  const [thumbnailTab, setThumbnailTab] = useState('UPLOAD'); // 'UPLOAD' | 'URL' | 'PRESETS'
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await api.get('/categories');
        if (Array.isArray(data) && data.length > 0) {
          const names = data.map(c => c.name);
          setCategories(names);
          if (!category) setCategory(names[0]);
        }
      } catch {}
    }
    fetchCategories();
  }, []);

  async function handleCreateCategoryInline(e) {
    e.preventDefault();
    if (!inlineCatName.trim()) return;
    try {
      const created = await api.post('/categories', { name: inlineCatName.trim() });
      const newName = created.name || inlineCatName.trim();
      setCategories(prev => [...prev, newName]);
      setCategory(newName);
      setInlineCatName('');
      setShowAddCatInline(false);
    } catch (err) {
      alert('Failed to add category: ' + err.message);
    }
  }

  async function handleThumbnailUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/courses/upload', formData);
      if (res.url) {
        setThumbnailUrl(res.url);
      }
    } catch (err) {
      alert('Failed to upload image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleCreateCourse(e) {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Course title is required.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        level,
        durationMinutes: parseInt(durationMinutes, 10) || 60,
        passingScore: parseInt(passingScore, 10) || 80,
        thumbnailUrl: thumbnailUrl.trim() || PRESET_THUMBNAILS[0].url,
        courseType: 'STANDARD'
      };

      const created = await api.post('/courses', payload);
      
      // Navigate straight into the 3-column Visual Course Builder
      navigate(`/app/courses/${created.id}/builder`);
    } catch (err) {
      console.error('Course creation error:', err);
      setErrorMsg(err.message || 'Failed to create course. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="flex items-center space-x-3">
          <Link
            to="/app/courses"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Authoring Studio</span>
              <span>/</span>
              <span className="text-brand-600">New Course</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Enterprise Course</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/app/courses"
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* Creation Mode Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Option 1: Manual Builder */}
        <div
          onClick={() => setMode('MANUAL')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            mode === 'MANUAL'
              ? 'bg-white border-brand-500 ring-2 ring-brand-500/20 shadow-md'
              : 'bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <PenTool className="w-5 h-5" />
            </div>
            {mode === 'MANUAL' && (
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs">
                <Check className="w-3 h-3" />
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Build Your Own Course</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Create a custom course from scratch with your own modules, lessons, video uploads, text articles, and quizzes.
          </p>
        </div>

        {/* Option 2: AI Course Studio */}
        <div
          onClick={() => navigate('/app/ai-studio')}
          className="p-5 rounded-2xl border border-slate-200 bg-white/70 hover:border-purple-400 hover:bg-white hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              AI Powered
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
            Generate with AI Studio
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Enter a prompt or document to automatically synthesize an 8-step blueprint, modules, and draft lessons.
          </p>
        </div>

        {/* Option 3: SCORM Package */}
        <div
          onClick={() => navigate('/app/scorm')}
          className="p-5 rounded-2xl border border-slate-200 bg-white/70 hover:border-emerald-400 hover:bg-white hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FolderArchive className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              SCORM 1.2 / 2004
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
            Upload SCORM Package
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Import a standard SCORM package zip with manifest detection and runtime CMI telemetry tracking.
          </p>
        </div>
      </div>

      {/* Manual Course Creation Form */}
      {mode === 'MANUAL' && (
        <form onSubmit={handleCreateCourse} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" /> Course Information
              </h2>

              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Course Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Course Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Zero Trust Network Architecture & Microsegmentation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition"
                  required
                />
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Course Description & Overview
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide a comprehensive summary of the course, learning objectives, and what skills learners will master..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition"
                />
              </div>

              {/* Category & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Curriculum Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddCatInline(true)}
                      className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ New Category</span>
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLevel(lvl)}
                        className={`py-2 text-center rounded-xl text-[11px] font-bold border transition ${
                          level === lvl
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {lvl[0] + lvl.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Duration & Passing Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Estimated Duration (Minutes)
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      min="5"
                      max="600"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Exam Passing Score (%)
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={passingScore}
                      onChange={(e) => setPassingScore(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Selection */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-600" /> Course Cover Image
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload an image file from your device, paste an external link, or choose an enterprise preset.
                  </p>
                </div>
                {thumbnailUrl && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Cover Selected
                  </span>
                )}
              </div>

              {/* Source Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 w-fit">
                <button
                  type="button"
                  onClick={() => setThumbnailTab('UPLOAD')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    thumbnailTab === 'UPLOAD'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setThumbnailTab('URL')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    thumbnailTab === 'URL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setThumbnailTab('PRESETS')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    thumbnailTab === 'PRESETS'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Presets</span>
                </button>
              </div>

              {/* Tab 1: Upload File */}
              {thumbnailTab === 'UPLOAD' && (
                <div className="space-y-3">
                  <label className="border-2 border-dashed border-slate-200 hover:border-brand-500 hover:bg-slate-50/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-2 py-3">
                        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                        <span className="text-xs font-semibold text-slate-600">Uploading cover image...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-brand-50 text-slate-500 group-hover:text-brand-600 flex items-center justify-center mb-2 transition">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          Click to browse or drop an image file
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1">
                          PNG, JPG, WebP, or SVG up to 20MB
                        </span>
                      </>
                    )}
                  </label>
                  {thumbnailUrl && thumbnailUrl.startsWith('/uploads/') && (
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="font-mono text-slate-600 truncate">{thumbnailUrl}</span>
                      <button
                        type="button"
                        onClick={() => setThumbnailUrl(PRESET_THUMBNAILS[0].url)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Reset to default preset"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Custom URL */}
              {thumbnailTab === 'URL' && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase">
                    Direct Image URL
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Presets */}
              {thumbnailTab === 'PRESETS' && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {PRESET_THUMBNAILS.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => setThumbnailUrl(p.url)}
                      className={`rounded-xl overflow-hidden border cursor-pointer group relative transition ${
                        thumbnailUrl === p.url
                          ? 'border-brand-600 ring-2 ring-brand-500/30 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-16 object-cover group-hover:scale-105 transition duration-300" />
                      <div className="p-1.5 bg-white text-center text-[10px] font-semibold text-slate-700 truncate">
                        {p.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Course Card Preview & Action */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs sticky top-6 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Catalog Card Preview
              </h3>

              {/* Live Preview Card */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
                <div className="h-36 relative overflow-hidden bg-slate-900">
                  <img
                    src={thumbnailUrl || PRESET_THUMBNAILS[0].url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs">
                      {level}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Draft
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-brand-600 block">
                    {category}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                    {title || 'Untitled Course Name'}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {description || 'No course description provided yet.'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{durationMinutes}m</span>
                    </div>
                    <span>Passing: {passingScore}%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Next Step: Visual Builder
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Creating your course will initialize <strong>Module 1</strong>. You will then be redirected directly to the 3-column Visual Builder to add lessons, upload videos, write text, and craft quizzes.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Course Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Create Course &amp; Open Builder</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Inline Add Category Modal */}
      {showAddCatInline && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <FolderArchive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add New Category</h3>
                  <p className="text-[11px] text-slate-500">Create a category to group courses across the catalog</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCatInline(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCategoryInline} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={inlineCatName}
                  onChange={(e) => setInlineCatName(e.target.value)}
                  placeholder="e.g. Data Science & Analytics"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCatInline(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!inlineCatName.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Save &amp; Select Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

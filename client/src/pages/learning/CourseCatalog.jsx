import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, BookOpen, Clock, Play, CheckCircle2, ArrowRight, 
  Sparkles, Filter, Plus, Eye, Layers, Tag, ShieldCheck, PenTool,
  Cloud, Cpu, Terminal, Award, X, Edit2, Trash2, Check, Palette
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isCreatorOrAdmin = user?.role === 'COURSE_CREATOR' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // Dynamic Categories State
  const [categoriesList, setCategoriesList] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('BookOpen');
  const [newCatColor, setNewCatColor] = useState('#dc2626');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');

  const AVAILABLE_ICONS = ['BookOpen', 'ShieldCheck', 'Cloud', 'Cpu', 'Terminal', 'Award', 'Layers', 'Sparkles'];
  const AVAILABLE_COLORS = ['#dc2626', '#2563eb', '#9333ea', '#059669', '#d97706', '#0891b2', '#4f46e5', '#0f172a'];

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await apiRequest('/categories');
      setCategoriesList(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      try {
        let endpoint = `/courses?search=${encodeURIComponent(search)}`;
        if (category && category !== 'All Categories') endpoint += `&category=${encodeURIComponent(category)}`;
        if (level) endpoint += `&level=${encodeURIComponent(level)}`;
        const data = await apiRequest(endpoint);
        setCourses(data);
      } catch (err) {
        console.error('Catalog fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(fetchCourses, 150);
    return () => clearTimeout(timer);
  }, [search, category, level]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: newCatName.trim(),
          description: newCatDesc.trim(),
          icon: newCatIcon,
          color: newCatColor
        })
      });
      setNewCatName('');
      setNewCatDesc('');
      await loadCategories();
    } catch (err) {
      alert('Failed to create category: ' + err.message);
    }
  };

  const handleUpdateCategory = async (catId) => {
    if (!editingCatName.trim()) return;
    try {
      await apiRequest(`/categories/${catId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editingCatName.trim() })
      });
      setEditingCatId(null);
      await loadCategories();
    } catch (err) {
      alert('Failed to update category: ' + err.message);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      await apiRequest(`/categories/${catId}`, { method: 'DELETE' });
      await loadCategories();
      if (category === catName) setCategory('');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-sans">
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <BookOpen className="w-4 h-4 text-red-600" />
            <span>Curriculum &amp; Course Catalog</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {user?.role === 'LEARNER' ? 'Explore Course Catalog' : 'Course & Curriculum Management'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, author, and enroll in production-grade enterprise courses organized by specialized domain categories.
          </p>
        </div>

        {isCreatorOrAdmin && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
            >
              <Tag className="w-3.5 h-3.5 text-red-600" />
              <span>Manage Categories</span>
            </button>
            <Link
              to="/app/ai-studio"
              className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Course Studio</span>
            </Link>
            <Link
              to="/app/courses/new"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-xs transition flex items-center space-x-1.5 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </Link>
          </div>
        )}
      </div>

      {/* Dynamic Category Filter Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Browse by Domain Category
          </span>
          {category && (
            <button
              onClick={() => setCategory('')}
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
            >
              <span>Reset filter</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setCategory('')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 ${
              !category
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All Categories</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${!category ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {courses.length}
            </span>
          </button>

          {categoriesList.map((cat) => {
            const isSelected = category === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(isSelected ? '' : cat.name)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 border ${
                  isSelected
                    ? 'bg-red-50 text-red-700 border-red-300 shadow-xs ring-2 ring-red-500/20'
                    : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || '#dc2626' }}></span>
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-red-200/80 text-red-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cat.course_count || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses by title, topic, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-900"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium"
          >
            <option value="">All Complexity Levels</option>
            <option value="FOUNDATIONAL">Foundational</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-72 bg-slate-200/70 rounded-3xl"></div>
          <div className="h-72 bg-slate-200/70 rounded-3xl"></div>
          <div className="h-72 bg-slate-200/70 rounded-3xl"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">No courses found in this category</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No courses match your active search filters. Try clearing filters or create a new course.
            </p>
          </div>
          {isCreatorOrAdmin && (
            <Link
              to="/app/courses/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-xs"
            >
              <Plus className="w-4 h-4" /> Create Course Now
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-card hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              {/* Thumbnail header */}
              <div className="relative h-44 bg-slate-900 overflow-hidden">
                <img
                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white uppercase tracking-wider">
                    {course.course_type}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs ${
                    course.status === 'PUBLISHED'
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-amber-500/90 text-white'
                  }`}>
                    {course.status}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
                  <span className="font-bold text-white truncate max-w-[200px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span>{course.category}</span>
                  </span>
                  <span className="font-mono bg-black/40 px-2 py-0.5 rounded text-[10px]">{course.level}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description || 'Comprehensive learning modules, practical labs, and knowledge evaluation.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{course.duration_minutes || 60}m</span>
                  </div>

                  {user?.role === 'LEARNER' ? (
                    <Link
                      to={`/learning/${course.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center space-x-1 shadow-xs"
                    >
                      <span>{course.is_enrolled ? 'Resume' : 'Start Course'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/learning/${course.id}`}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold text-xs transition"
                        title="Preview player as a learner"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/app/courses/${course.id}/builder`}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-xs"
                      >
                        Visual Builder
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CATEGORIES MANAGEMENT MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-red-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Course Categories Management</h3>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Existing Categories List */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Current Course Categories ({categoriesList.length})
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {categoriesList.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0 pr-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color || '#dc2626' }}
                        ></span>
                        {editingCatId === cat.id ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <input
                              type="text"
                              value={editingCatName}
                              onChange={(e) => setEditingCatName(e.target.value)}
                              className="px-2 py-1 text-xs border rounded-lg bg-white flex-1"
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdateCategory(cat.id)}
                              className="px-2 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="truncate">
                            <span className="font-extrabold text-xs text-slate-900 block truncate">{cat.name}</span>
                            <span className="text-[10px] text-slate-400">{cat.course_count || 0} active courses</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setEditingCatName(cat.name);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-800"
                          title="Rename Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleCreateCategory} className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  + Create New Category
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Enterprise Data Architecture"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Domain coverage and scope..."
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color Theme</label>
                  <div className="flex items-center gap-2">
                    {AVAILABLE_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCatColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform ${newCatColor === c ? 'scale-125 ring-2 ring-slate-900 ring-offset-2' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition shadow-xs"
                  >
                    Create Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

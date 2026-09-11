import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Plus, Trash2, Copy, Save, Eye, 
  CheckCircle2, FileText, Video, HelpCircle, ArrowLeft, ChevronDown, 
  ChevronRight, Lightbulb, Check, AlertCircle, RefreshCw, Layers, 
  Play, Download, BookOpen, Clock, PenTool, Share2, Award, Zap,
  Upload, UploadCloud, Link as LinkIcon, Image as ImageIcon,
  GripVertical, ArrowUp, ArrowDown, Settings, X, ExternalLink,
  FileCode, Loader2, MoreVertical, Edit2, File
} from 'lucide-react';
import { apiRequest, api } from '../../lib/api';

const PRESET_THUMBNAILS = [
  { label: 'Cybersecurity', url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80' },
  { label: 'Cloud Architecture', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80' },
  { label: 'Artificial Intelligence', url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80' },
  { label: 'Leadership & Strategy', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80' },
  { label: 'Engineering & DevOps', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80' }
];

export default function CourseBuilder() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState('Saved');
  const [loading, setLoading] = useState(true);

  // Drag and Drop State for Lessons and Modules
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // Curriculum Creation State
  const [newModuleName, setNewModuleName] = useState('');
  const [newLessonName, setNewLessonName] = useState({});
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');

  // Course Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    title: '',
    description: '',
    category: '',
    level: 'INTERMEDIATE',
    passingScore: 80,
    durationMinutes: 60,
    thumbnailUrl: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);

  // AI Copilot In-Builder State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiGeneratingMode, setAiGeneratingMode] = useState(null); // 'LESSON', 'QUIZ', 'ENHANCE'
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');

  // Load Categories for Settings Dropdown
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await apiRequest('/categories');
        if (Array.isArray(cats)) setAvailableCategories(cats);
      } catch (e) {
        console.error('Failed to load categories in builder:', e);
      }
    }
    loadCategories();
  }, []);

  // Active Block Upload State
  const [uploadingMediaForBlock, setUploadingMediaForBlock] = useState(null);

  // Knowledge Check Live Test State
  const [quizTestAnswers, setQuizTestAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState({});

  // Autosave timer ref
  const saveTimeoutRef = useRef(null);

  // Load Course and First Lesson
  useEffect(() => {
    async function loadCourse() {
      try {
        const data = await apiRequest(`/courses/${courseId}`);
        setCourse(data);
        setSettingsForm({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'Enterprise Training',
          level: data.level || 'INTERMEDIATE',
          passingScore: data.passing_score || 80,
          durationMinutes: data.duration_minutes || 60,
          thumbnailUrl: data.thumbnail_url || PRESET_THUMBNAILS[0].url
        });

        if (data.modules?.length > 0) {
          const firstMod = data.modules[0];
          setSelectedModuleId(firstMod.id);
          if (firstMod.lessons?.length > 0) {
            selectLesson(firstMod.lessons[0], firstMod.id);
          }
        }
      } catch (err) {
        console.error('Failed to load course:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  // Select a lesson and parse its modular blocks (NO FORCED SAMPLE DATA)
  const selectLesson = (lesson, moduleId) => {
    setSelectedModuleId(moduleId);
    setSelectedLesson(lesson);

    let loadedBlocks = [];
    if (lesson.metadata_json?.blocks && Array.isArray(lesson.metadata_json.blocks)) {
      loadedBlocks = lesson.metadata_json.blocks;
    } else if (lesson.metadata_json && typeof lesson.metadata_json === 'string') {
      try {
        const parsed = JSON.parse(lesson.metadata_json);
        if (Array.isArray(parsed.blocks)) loadedBlocks = parsed.blocks;
      } catch {}
    } else if (lesson.body_text && lesson.body_text.trim()) {
      loadedBlocks.push({
        id: 'blk-' + Date.now(),
        type: 'text',
        content: lesson.body_text
      });
      if (lesson.video_url) {
        loadedBlocks.unshift({
          id: 'blk-vid-' + Date.now(),
          type: 'video',
          title: lesson.title,
          url: lesson.video_url,
          posterUrl: '',
          duration: `${lesson.duration_minutes || 10} min`,
          caption: ''
        });
      }
    }

    setBlocks(loadedBlocks);
    setAutosaveStatus('Saved');
  };

  // Trigger Save to SQLite backend
  const saveLessonBlocks = async (updatedBlocks, updatedTitle = null) => {
    if (!selectedLesson || !selectedModuleId) return;
    setAutosaveStatus('Saving...');

    try {
      const payload = {
        title: updatedTitle !== null ? updatedTitle : selectedLesson.title,
        lessonType: updatedBlocks.some(b => b.type === 'video') ? 'VIDEO' : 'TEXT',
        durationMinutes: selectedLesson.duration_minutes || 15,
        blocks: updatedBlocks,
        bodyText: updatedBlocks.filter(b => b.type === 'text').map(b => b.content).join('\n\n'),
        videoUrl: updatedBlocks.find(b => b.type === 'video')?.url || null
      };

      const res = await apiRequest(`/courses/${courseId}/modules/${selectedModuleId}/lessons/${selectedLesson.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      // Update local course state
      setCourse(prev => {
        if (!prev) return prev;
        const updatedMods = prev.modules.map(m => {
          if (m.id === selectedModuleId) {
            const updatedLessons = m.lessons.map(l => (l.id === selectedLesson.id ? { ...l, ...res } : l));
            return { ...m, lessons: updatedLessons };
          }
          return m;
        });
        return { ...prev, modules: updatedMods };
      });

      setSelectedLesson(prev => (prev ? { ...prev, ...res } : prev));
      setAutosaveStatus('Saved just now');
    } catch (err) {
      console.error('Save failed:', err);
      setAutosaveStatus('Save failed');
    }
  };

  // Debounced change handler for blocks
  const updateBlocksAndScheduleSave = (newBlocks) => {
    setBlocks(newBlocks);
    setAutosaveStatus('Unsaved changes...');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveLessonBlocks(newBlocks);
    }, 800);
  };

  // Block Manipulation Methods
  const addBlock = (type) => {
    const id = 'blk-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    let newBlock;

    switch (type) {
      case 'video':
        newBlock = {
          id,
          type: 'video',
          title: 'Video Lecture',
          url: '',
          posterUrl: '',
          duration: '10 min',
          caption: ''
        };
        break;
      case 'image':
        newBlock = {
          id,
          type: 'image',
          url: '',
          caption: 'Diagram description or note',
          altText: 'Instructional image',
          layout: 'contained'
        };
        break;
      case 'text':
        newBlock = {
          id,
          type: 'text',
          content: 'Write your comprehensive instructional narrative, key concepts, or step-by-step procedures here...'
        };
        break;
      case 'takeaways':
        newBlock = {
          id,
          type: 'takeaways',
          title: 'Key Takeaways',
          accentColor: 'violet',
          items: ['First key insight or actionable takeaway from this lesson']
        };
        break;
      case 'quiz':
        newBlock = {
          id,
          type: 'quiz',
          prompt: 'Enter your formative question prompt here...',
          options: [
            'First possible answer choice',
            'Second possible answer choice (correct)',
            'Third possible answer choice'
          ],
          correctIdx: 1,
          explanation: 'Explain why the correct answer is right to reinforce understanding.'
        };
        break;
      case 'link':
        newBlock = {
          id,
          type: 'link',
          title: 'Documentation / External Reference',
          url: 'https://',
          description: 'Official technical documentation or reading material.'
        };
        break;
      case 'document':
        newBlock = {
          id,
          type: 'document',
          title: 'Course Workbook / Reference PDF',
          url: '',
          fileType: 'PDF',
          size: '2.4 MB'
        };
        break;
      default:
        return;
    }

    const updated = [...blocks, newBlock];
    updateBlocksAndScheduleSave(updated);
  };

  const loadStarterTemplate = () => {
    const templateBlocks = [
      {
        id: 'blk-tpl-vid-' + Date.now(),
        type: 'video',
        title: 'Lesson Overview Video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        duration: '8 min',
        caption: 'Introduction to the core architecture and fundamental principles.'
      },
      {
        id: 'blk-tpl-txt-' + Date.now(),
        type: 'text',
        content: '### Core Architecture Overview\nIn this section, learners explore practical architectural designs and operational workflows. Focus on security, resilience, and scalable patterns.'
      },
      {
        id: 'blk-tpl-tak-' + Date.now(),
        type: 'takeaways',
        title: 'Key Highlights',
        accentColor: 'indigo',
        items: [
          'Verify cryptographic credentials on every service boundary',
          'Enforce strict least-privilege telemetry and automated audits'
        ]
      }
    ];
    updateBlocksAndScheduleSave(templateBlocks);
  };

  const updateBlock = (blockId, fieldUpdates) => {
    const updated = blocks.map(b => (b.id === blockId ? { ...b, ...fieldUpdates } : b));
    updateBlocksAndScheduleSave(updated);
  };

  const deleteBlock = (blockId) => {
    const updated = blocks.filter(b => b.id !== blockId);
    updateBlocksAndScheduleSave(updated);
  };

  const moveBlock = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    updateBlocksAndScheduleSave(updated);
  };

  const duplicateBlock = (blockId) => {
    const original = blocks.find(b => b.id === blockId);
    if (!original) return;
    const copy = {
      ...JSON.parse(JSON.stringify(original)),
      id: 'blk-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)
    };
    const originalIdx = blocks.findIndex(b => b.id === blockId);
    const updated = [...blocks];
    updated.splice(originalIdx + 1, 0, copy);
    updateBlocksAndScheduleSave(updated);
  };

  // AI Copilot Actions: Generate Lesson Content, Quiz, or Enhance
  const handleAiGenerateLesson = async () => {
    if (!selectedLesson) return;
    setAiGeneratingMode('LESSON');
    setAiFeedback('');
    try {
      const activeModule = course?.modules?.find(m => m.id === selectedModuleId);
      const res = await apiRequest('/ai/generate-lesson-content', {
        method: 'POST',
        body: JSON.stringify({
          lessonTitle: selectedLesson.title,
          moduleTitle: activeModule?.title || 'Core Foundations',
          courseTopic: course?.title || 'Enterprise Training',
          tone: 'PROFESSIONAL'
        })
      });

      if (res.content) {
        const textBlockId = 'blk-' + Date.now() + '-txt';
        const takeawaysId = 'blk-' + (Date.now() + 1) + '-tkw';
        
        const newBlocks = [
          {
            id: textBlockId,
            type: 'text',
            content: res.content
          },
          {
            id: takeawaysId,
            type: 'takeaways',
            title: 'Key Actionable Takeaways',
            accentColor: 'indigo',
            items: [
              `Decouple operational policy enforcement from runtime mechanics`,
              `Instrument automated continuous validation gates to detect state drift`,
              `Establish telemetry alerts anchored to user-impacting SLOs`
            ]
          }
        ];

        updateBlocksAndScheduleSave(newBlocks);
        setAiFeedback('✨ Successfully authored structured lesson content & key takeaways!');
        setTimeout(() => {
          setShowAiModal(false);
          setAiFeedback('');
        }, 1200);
      }
    } catch (err) {
      alert('AI lesson generation failed: ' + err.message);
    } finally {
      setAiGeneratingMode(null);
    }
  };

  const handleAiGenerateQuiz = async () => {
    if (!selectedLesson) return;
    setAiGeneratingMode('QUIZ');
    setAiFeedback('');
    try {
      const activeModule = course?.modules?.find(m => m.id === selectedModuleId);
      const res = await apiRequest('/ai/generate-quiz-questions', {
        method: 'POST',
        body: JSON.stringify({
          lessonTitle: selectedLesson.title,
          moduleTitle: activeModule?.title || 'Assessment',
          count: 2
        })
      });

      if (Array.isArray(res.questions) && res.questions.length > 0) {
        const newQuizBlocks = res.questions.map((q, idx) => ({
          id: 'blk-' + (Date.now() + idx) + '-qz',
          type: 'quiz',
          prompt: q.question,
          options: q.options.map(o => o.text),
          correctIdx: Math.max(0, q.options.findIndex(o => o.isCorrect)),
          explanation: q.explanation
        }));

        const updated = [...blocks, ...newQuizBlocks];
        updateBlocksAndScheduleSave(updated);
        setAiFeedback(`✨ Added ${newQuizBlocks.length} scenario evaluation questions with explanations!`);
        setTimeout(() => {
          setShowAiModal(false);
          setAiFeedback('');
        }, 1200);
      }
    } catch (err) {
      alert('AI quiz generation failed: ' + err.message);
    } finally {
      setAiGeneratingMode(null);
    }
  };

  const handleAiEnhanceContent = async () => {
    const textBlock = blocks.find(b => b.type === 'text');
    if (!textBlock) {
      alert('No text block found to enhance. Please generate or add a text block first.');
      return;
    }
    setAiGeneratingMode('ENHANCE');
    setAiFeedback('');
    try {
      const res = await apiRequest('/ai/enhance-content', {
        method: 'POST',
        body: JSON.stringify({
          text: textBlock.content,
          instruction: aiCustomPrompt || 'Elevate structure, clarify terminology, and add key takeaways'
        })
      });

      if (res.enhanced) {
        const updated = blocks.map(b => b.id === textBlock.id ? { ...b, content: res.enhanced } : b);
        updateBlocksAndScheduleSave(updated);
        setAiFeedback('✨ Enhanced and structured lesson content!');
        setTimeout(() => {
          setShowAiModal(false);
          setAiFeedback('');
        }, 1200);
      }
    } catch (err) {
      alert('Enhance failed: ' + err.message);
    } finally {
      setAiGeneratingMode(null);
    }
  };

  // Upload Media File for Blocks (Videos, Inside Images, Documents, Posters)
  const handleMediaUpload = async (e, blockId, fieldKey = 'url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingMediaForBlock(blockId + '-' + fieldKey);
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/courses/upload', formData);
      if (res.url) {
        updateBlock(blockId, { [fieldKey]: res.url });
      }
    } catch (err) {
      alert('Media upload failed: ' + err.message);
    } finally {
      setUploadingMediaForBlock(null);
    }
  };

  // Curriculum Management (Modules & Lessons)
  const handleAddModule = async (customTitle = null) => {
    const title = (customTitle || newModuleName || '').trim();
    if (!title) return;
    try {
      const mod = await apiRequest(`/courses/${courseId}/modules`, {
        method: 'POST',
        body: JSON.stringify({ title })
      });
      const newMod = { ...mod, lessons: [] };
      setCourse(prev => ({ ...prev, modules: [...(prev?.modules || []), newMod] }));
      setNewModuleName('');
      setSelectedModuleId(mod.id);
    } catch (err) {
      alert('Failed to add module: ' + err.message);
    }
  };

  const handleUpdateModule = async (moduleId) => {
    if (!editingModuleTitle.trim()) return;
    try {
      const updated = await apiRequest(`/courses/${courseId}/modules/${moduleId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: editingModuleTitle.trim() })
      });
      setCourse({
        ...course,
        modules: course.modules.map(m => (m.id === moduleId ? { ...m, title: updated.title } : m))
      });
      setEditingModuleId(null);
    } catch (err) {
      alert('Failed to update module: ' + err.message);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module and all its lessons?')) return;
    try {
      await apiRequest(`/courses/${courseId}/modules/${moduleId}`, { method: 'DELETE' });
      const remainingMods = course.modules.filter(m => m.id !== moduleId);
      setCourse({ ...course, modules: remainingMods });
      if (selectedModuleId === moduleId) {
        if (remainingMods.length > 0) {
          setSelectedModuleId(remainingMods[0].id);
          if (remainingMods[0].lessons?.length > 0) {
            selectLesson(remainingMods[0].lessons[0], remainingMods[0].id);
          } else {
            setSelectedLesson(null);
            setBlocks([]);
          }
        } else {
          setSelectedLesson(null);
          setBlocks([]);
        }
      }
    } catch (err) {
      alert('Failed to delete module: ' + err.message);
    }
  };

  const handleAddLesson = async (moduleId, customTitle = null, lessonType = 'TEXT') => {
    const targetModuleId = moduleId || selectedModuleId || course?.modules?.[0]?.id;
    if (!targetModuleId) {
      alert('Please add a section first.');
      return;
    }
    const title = (customTitle || newLessonName[targetModuleId] || '').trim();
    if (!title) return;
    try {
      let initialBlocks = [];
      if (lessonType === 'VIDEO') {
        initialBlocks = [{
          id: 'blk-vid-' + Date.now(),
          type: 'video',
          title: title,
          url: '',
          posterUrl: '',
          duration: '10 min',
          caption: 'Instructional video lecture'
        }];
      } else if (lessonType === 'QUIZ') {
        initialBlocks = [{
          id: 'blk-q-' + Date.now(),
          type: 'quiz',
          question: 'What is the primary takeaway or concept covered in this lesson?',
          options: ['Option A: Preliminary baseline', 'Option B: Standard architectural requirement', 'Option C: Deprecated approach'],
          correctIdx: 1,
          explanation: 'Option B accurately defines the necessary standard.'
        }];
      } else if (lessonType === 'DOCUMENT') {
        initialBlocks = [{
          id: 'blk-doc-' + Date.now(),
          type: 'document',
          title: 'Reference Manual / Architecture Guide',
          url: '',
          fileType: 'PDF',
          size: '1.2 MB'
        }];
      }

      const les = await apiRequest(`/courses/${courseId}/modules/${targetModuleId}/lessons`, {
        method: 'POST',
        body: JSON.stringify({ title, lessonType, blocks: initialBlocks })
      });
      setCourse(prev => {
        const updatedMods = (prev?.modules || []).map(m => {
          if (m.id === targetModuleId) {
            return { ...m, lessons: [...(m.lessons || []), les] };
          }
          return m;
        });
        return { ...prev, modules: updatedMods };
      });
      setNewLessonName(prev => ({ ...prev, [targetModuleId]: '' }));
      selectLesson(les, targetModuleId);
    } catch (err) {
      alert('Failed to add lesson: ' + err.message);
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await apiRequest(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
        method: 'DELETE'
      });
      const updatedMods = course.modules.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
        }
        return m;
      });
      setCourse({ ...course, modules: updatedMods });
      if (selectedLesson?.id === lessonId) {
        const firstAvailable = updatedMods.flatMap(m => m.lessons)[0] || null;
        if (firstAvailable) {
          const parentMod = updatedMods.find(m => m.lessons.some(l => l.id === firstAvailable.id));
          selectLesson(firstAvailable, parentMod.id);
        } else {
          setSelectedLesson(null);
          setBlocks([]);
        }
      }
    } catch (err) {
      alert('Failed to delete lesson: ' + err.message);
    }
  };

  // Drag and Drop Handlers for Lessons & Modules
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, targetItem) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverItem?.id !== targetItem.id) {
      setDragOverItem(targetItem);
    }
  };

  const handleDrop = async (e, targetItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    if (draggedItem.type === 'LESSON' && targetItem.type === 'LESSON') {
      const newModules = JSON.parse(JSON.stringify(course.modules));
      const sourceMod = newModules.find(m => m.id === draggedItem.moduleId);
      const targetMod = newModules.find(m => m.id === targetItem.moduleId);

      if (sourceMod && targetMod) {
        const [movedLesson] = sourceMod.lessons.splice(draggedItem.index, 1);
        movedLesson.module_id = targetMod.id;
        targetMod.lessons.splice(targetItem.index, 0, movedLesson);

        setCourse({ ...course, modules: newModules });

        try {
          await apiRequest(`/courses/${courseId}/curriculum/reorder`, {
            method: 'PUT',
            body: JSON.stringify({
              modules: newModules.map((m, mIdx) => ({
                id: m.id,
                orderIndex: mIdx + 1,
                lessons: m.lessons.map((l, lIdx) => ({ id: l.id, orderIndex: lIdx + 1, moduleId: m.id }))
              }))
            })
          });
        } catch (err) {
          console.error('Curriculum reorder error:', err);
        }
      }
    } else if (draggedItem.type === 'MODULE' && targetItem.type === 'MODULE') {
      const newModules = [...course.modules];
      const [movedMod] = newModules.splice(draggedItem.index, 1);
      newModules.splice(targetItem.index, 0, movedMod);

      setCourse({ ...course, modules: newModules });

      try {
        await apiRequest(`/courses/${courseId}/curriculum/reorder`, {
          method: 'PUT',
          body: JSON.stringify({
            modules: newModules.map((m, mIdx) => ({
              id: m.id,
              orderIndex: mIdx + 1,
              lessons: m.lessons.map((l, lIdx) => ({ id: l.id, orderIndex: lIdx + 1, moduleId: m.id }))
            }))
          })
        });
      } catch (err) {
        console.error('Curriculum reorder error:', err);
      }
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Move Lesson Up / Down
  const moveLessonOrder = async (moduleId, lessonIdx, direction) => {
    const targetIdx = lessonIdx + direction;
    const mod = course.modules.find(m => m.id === moduleId);
    if (!mod || targetIdx < 0 || targetIdx >= mod.lessons.length) return;

    const newModules = JSON.parse(JSON.stringify(course.modules));
    const targetMod = newModules.find(m => m.id === moduleId);
    const [moved] = targetMod.lessons.splice(lessonIdx, 1);
    targetMod.lessons.splice(targetIdx, 0, moved);

    setCourse({ ...course, modules: newModules });

    try {
      await apiRequest(`/courses/${courseId}/curriculum/reorder`, {
        method: 'PUT',
        body: JSON.stringify({
          modules: newModules.map((m, mIdx) => ({
            id: m.id,
            orderIndex: mIdx + 1,
            lessons: m.lessons.map((l, lIdx) => ({ id: l.id, orderIndex: lIdx + 1, moduleId: m.id }))
          }))
        })
      });
    } catch (err) {
      console.error('Reorder error:', err);
    }
  };

  // Move Module Up / Down
  const moveModuleOrder = async (moduleIdx, direction) => {
    const targetIdx = moduleIdx + direction;
    if (targetIdx < 0 || targetIdx >= course.modules.length) return;

    const newModules = [...course.modules];
    const [moved] = newModules.splice(moduleIdx, 1);
    newModules.splice(targetIdx, 0, moved);

    setCourse({ ...course, modules: newModules });

    try {
      await apiRequest(`/courses/${courseId}/curriculum/reorder`, {
        method: 'PUT',
        body: JSON.stringify({
          modules: newModules.map((m, mIdx) => ({
            id: m.id,
            orderIndex: mIdx + 1,
            lessons: m.lessons.map((l, lIdx) => ({ id: l.id, orderIndex: lIdx + 1, moduleId: m.id }))
          }))
        })
      });
    } catch (err) {
      console.error('Reorder error:', err);
    }
  };

  // Save Course Settings & Cover Image
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const updated = await apiRequest(`/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: settingsForm.title,
          description: settingsForm.description,
          category: settingsForm.category,
          level: settingsForm.level,
          passingScore: parseInt(settingsForm.passingScore, 10),
          durationMinutes: parseInt(settingsForm.durationMinutes, 10),
          thumbnailUrl: settingsForm.thumbnailUrl
        })
      });
      setCourse(prev => ({ ...prev, ...updated }));
      setShowSettingsModal(false);
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Upload Cover Image inside Settings Modal
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/courses/upload', formData);
      if (res.url) {
        setSettingsForm(prev => ({ ...prev, thumbnailUrl: res.url }));
      }
    } catch (err) {
      alert('Cover upload failed: ' + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // Toggle Publish Status
  const handleTogglePublish = async () => {
    try {
      const res = await apiRequest(`/courses/${courseId}/publish`, { method: 'POST' });
      setCourse({ ...course, status: res.status });
    } catch (err) {
      alert('Publish toggle failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3"></div>
        <div className="h-96 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
        Course not found.
      </div>
    );
  }

  // Calculate Course Readiness Score
  const healthChecks = [
    { label: 'Course title & category defined', pass: !!course.title && !!course.category },
    { label: 'Overview description provided', pass: !!course.description },
    { label: 'Cover thumbnail configured', pass: !!course.thumbnail_url },
    { label: 'At least 1 curriculum module created', pass: (course.modules?.length || 0) > 0 },
    { label: 'Lessons authored in curriculum', pass: course.modules?.some(m => m.lessons?.length > 0) },
    { label: 'Interactive blocks in active lesson', pass: blocks.length > 0 }
  ];
  const passedCount = healthChecks.filter(c => c.pass).length;
  const healthScore = Math.round((passedCount / healthChecks.length) * 100);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden font-sans">
      {/* 1. TOP BUILDER BAR */}
      <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between flex-shrink-0 z-20 shadow-2xs">
        <div className="flex items-center space-x-4 min-w-0">
          <button
            onClick={() => navigate('/app/courses')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-3 min-w-0">
            {course.thumbnail_url && (
              <img
                src={course.thumbnail_url}
                alt="Thumbnail"
                className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-slate-900 truncate max-w-md">{course.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  course.status === 'PUBLISHED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {course.status}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                <span>{course.category}</span>
                <span>•</span>
                <span className="text-emerald-600 font-medium">● {autosaveStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Settings & Cover Image Modal Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center space-x-1.5 transition"
            title="Course Settings & Cover Image"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Course Settings</span>
          </button>

          {/* Live Preview Mode Switcher */}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
              previewMode
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? 'Exit Learner Preview' : 'Learner Preview'}</span>
          </button>

          {/* Standalone Player Link */}
          <Link
            to={`/learning/${course.id}`}
            target="_blank"
            className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
          >
            <span>Learner View</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Link>

          {/* Publish / Draft Toggle */}
          <button
            onClick={handleTogglePublish}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition shadow-xs ${
              course.status === 'PUBLISHED'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish Course'}
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-COLUMN BUILDER WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMN 1 (LEFT): Curriculum Outline & Drag-and-Drop Reordering */}
        <aside className="w-80 md:w-88 border-r border-slate-200/90 bg-slate-50/60 overflow-y-auto p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-600" /> Curriculum Outline
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Drag to reorder</span>
            </div>

            {/* Modules List */}
            {course.modules?.map((mod, mIdx) => (
              <div
                key={mod.id}
                draggable
                onDragStart={(e) => handleDragStart(e, { type: 'MODULE', id: mod.id, index: mIdx })}
                onDragOver={(e) => handleDragOver(e, { type: 'MODULE', id: mod.id, index: mIdx })}
                onDrop={(e) => handleDrop(e, { type: 'MODULE', id: mod.id, index: mIdx })}
                className={`bg-white rounded-2xl border transition-all ${
                  dragOverItem?.id === mod.id && dragOverItem?.type === 'MODULE'
                    ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                    : 'border-slate-200/80 shadow-2xs'
                }`}
              >
                {/* Module Header */}
                <div className="p-3 bg-slate-50/80 rounded-t-2xl border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                    <span className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 p-0.5">
                      <GripVertical className="w-3.5 h-3.5" />
                    </span>
                    {editingModuleId === mod.id ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="text"
                          value={editingModuleTitle}
                          onChange={(e) => setEditingModuleTitle(e.target.value)}
                          className="px-2 py-1 text-xs border rounded-lg flex-1 bg-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateModule(mod.id)}
                          className="px-2 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="font-extrabold text-xs text-slate-800 truncate">{mod.title}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => moveModuleOrder(mIdx, -1)}
                      disabled={mIdx === 0}
                      className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-30"
                      title="Move Module Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveModuleOrder(mIdx, 1)}
                      disabled={mIdx === course.modules.length - 1}
                      className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-30"
                      title="Move Module Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingModuleId(mod.id);
                        setEditingModuleTitle(mod.title);
                      }}
                      className="p-1 text-slate-300 hover:text-slate-600"
                      title="Rename Module"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(mod.id)}
                      className="p-1 text-slate-300 hover:text-rose-600"
                      title="Delete Module"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Lessons in this Module */}
                <div className="p-2 space-y-1">
                  {mod.lessons?.map((les, lIdx) => {
                    const isSelected = selectedLesson?.id === les.id;
                    const hasVideo = les.lesson_type === 'VIDEO' || les.metadata_json?.blocks?.some(b => b.type === 'video');

                    return (
                      <div
                        key={les.id}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleDragStart(e, { type: 'LESSON', id: les.id, moduleId: mod.id, index: lIdx });
                        }}
                        onDragOver={(e) => {
                          e.stopPropagation();
                          handleDragOver(e, { type: 'LESSON', id: les.id, moduleId: mod.id, index: lIdx });
                        }}
                        onDrop={(e) => {
                          e.stopPropagation();
                          handleDrop(e, { type: 'LESSON', id: les.id, moduleId: mod.id, index: lIdx });
                        }}
                        onClick={() => selectLesson(les, mod.id)}
                        className={`group p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? 'bg-slate-900 text-white font-bold shadow-xs'
                            : dragOverItem?.id === les.id && dragOverItem?.type === 'LESSON'
                            ? 'bg-blue-50 text-blue-900 border-2 border-dashed border-blue-400'
                            : 'text-slate-700 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="cursor-grab active:cursor-grabbing text-slate-400 group-hover:text-slate-600 p-0.5">
                            <GripVertical className="w-3 h-3" />
                          </span>
                          {hasVideo ? (
                            <Video className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-300' : 'text-slate-400'}`} />
                          ) : (
                            <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-300' : 'text-slate-400'}`} />
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>

                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLessonOrder(mod.id, lIdx, -1);
                            }}
                            disabled={lIdx === 0}
                            className={`p-0.5 disabled:opacity-20 ${isSelected ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
                            title="Move Lesson Up"
                          >
                            <ArrowUp className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLessonOrder(mod.id, lIdx, 1);
                            }}
                            disabled={lIdx === mod.lessons.length - 1}
                            className={`p-0.5 disabled:opacity-20 ${isSelected ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
                            title="Move Lesson Down"
                          >
                            <ArrowDown className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteLesson(mod.id, les.id, e)}
                            className={`p-0.5 ${isSelected ? 'text-rose-300 hover:text-rose-100' : 'text-slate-400 hover:text-rose-600'}`}
                            title="Delete Lesson"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Lesson Input */}
                  <div className="pt-2 flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Add lesson..."
                      value={newLessonName[mod.id] || ''}
                      onChange={(e) => setNewLessonName({ ...newLessonName, [mod.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddLesson(mod.id)}
                      className="flex-1 px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 bg-white"
                    />
                    <button
                      onClick={() => handleAddLesson(mod.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 transition"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Module Input */}
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New module title..."
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 bg-white"
                />
                <button
                  onClick={handleAddModule}
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-2xs whitespace-nowrap"
                >
                  Add Module
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* COLUMN 2 (CENTER): Modular Lesson Canvas & Learner Preview */}
        <main className="flex-1 bg-white overflow-y-auto flex flex-col justify-between">
          {selectedLesson ? (
            <div className="p-8 max-w-3xl mx-auto w-full space-y-8">
              {/* Lesson Title & Duration Header */}
              <div className="space-y-2 border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[10px] font-extrabold uppercase tracking-wider text-brand-600">
                    <span>Modular Lesson Canvas</span>
                    <span>•</span>
                    <span>{blocks.length} Content Block{blocks.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAiModal(true)}
                      className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition border border-purple-200 shadow-2xs"
                      title="AI Copilot: Generate lesson draft or quiz questions"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Assist</span>
                    </button>
                    <button
                      onClick={() => saveLessonBlocks(blocks)}
                      className="px-3 py-1 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>

                {previewMode ? (
                  <h1 className="text-2xl font-extrabold text-slate-900">{selectedLesson.title}</h1>
                ) : (
                  <input
                    type="text"
                    value={selectedLesson.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setSelectedLesson({ ...selectedLesson, title: newTitle });
                      saveLessonBlocks(blocks, newTitle);
                    }}
                    className="text-2xl font-extrabold text-slate-900 border-none outline-none w-full focus:ring-0 p-0"
                    placeholder="Enter lesson title..."
                  />
                )}
                <p className="text-xs text-slate-400 font-mono">
                  Estimated duration: {selectedLesson.duration_minutes || 15} minutes
                </p>
              </div>

              {/* EMPTY STATE: Clean Slate when Lesson has No Blocks */}
              {blocks.length === 0 && (
                <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-10 text-center space-y-5 animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-white text-slate-600 shadow-xs border border-slate-200/80 flex items-center justify-center mx-auto">
                    <PenTool className="w-7 h-7 text-brand-600" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900">Start Building This Lesson</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Choose which blocks you want in this lesson. Upload video files, add inside images, write formatted text, highlight key takeaways, or attach an interactive knowledge check.
                    </p>
                  </div>

                  {/* AI Quick Draft Banner */}
                  <button
                    type="button"
                    onClick={handleAiGenerateLesson}
                    disabled={aiGeneratingMode !== null}
                    className="w-full max-w-lg mx-auto p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 hover:from-purple-100 hover:to-indigo-100 rounded-2xl border border-purple-200/80 text-left transition flex items-center justify-between shadow-2xs group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                          <span>Generate Complete Lesson with AI</span>
                          <span className="text-[9px] font-extrabold bg-purple-600 text-white px-1.5 py-0.2 rounded-full">Fast</span>
                        </div>
                        <p className="text-[11px] text-purple-700 mt-0.5">
                          Instantly writes executive summary, architecture patterns, code snippet, and key takeaways
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-purple-700 bg-white px-3 py-1 rounded-xl border border-purple-200 shadow-2xs whitespace-nowrap">
                      {aiGeneratingMode === 'LESSON' ? 'Drafting...' : 'Auto-Draft ✨'}
                    </span>
                  </button>

                  {/* Block Selection Palette */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto pt-2">
                    <button
                      onClick={() => addBlock('video')}
                      className="p-3 bg-white hover:bg-slate-100/80 rounded-xl border border-slate-200 text-left transition group shadow-2xs"
                    >
                      <Video className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition" />
                      <div className="text-xs font-bold text-slate-900">Video</div>
                      <div className="text-[10px] text-slate-400">File upload or URL</div>
                    </button>

                    <button
                      onClick={() => addBlock('image')}
                      className="p-3 bg-white hover:bg-slate-100/80 rounded-xl border border-slate-200 text-left transition group shadow-2xs"
                    >
                      <ImageIcon className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition" />
                      <div className="text-xs font-bold text-slate-900">Inside Image</div>
                      <div className="text-[10px] text-slate-400">File or link + caption</div>
                    </button>

                    <button
                      onClick={() => addBlock('text')}
                      className="p-3 bg-white hover:bg-slate-100/80 rounded-xl border border-slate-200 text-left transition group shadow-2xs"
                    >
                      <FileText className="w-5 h-5 text-indigo-600 mb-1.5 group-hover:scale-110 transition" />
                      <div className="text-xs font-bold text-slate-900">Rich Text</div>
                      <div className="text-[10px] text-slate-400">Narrative & markdown</div>
                    </button>

                    <button
                      onClick={() => addBlock('takeaways')}
                      className="p-3 bg-white hover:bg-slate-100/80 rounded-xl border border-slate-200 text-left transition group shadow-2xs"
                    >
                      <Lightbulb className="w-5 h-5 text-amber-600 mb-1.5 group-hover:scale-110 transition" />
                      <div className="text-xs font-bold text-slate-900">Takeaways</div>
                      <div className="text-[10px] text-slate-400">Key bullet points</div>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => addBlock('quiz')}
                      className="px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition flex items-center gap-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>+ Knowledge Check Quiz</span>
                    </button>
                    <button
                      onClick={loadStarterTemplate}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-100 transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      <span>Load Starter Template</span>
                    </button>
                  </div>
                </div>
              )}

              {/* DYNAMIC MODULAR BLOCKS */}
              <div className="space-y-6">
                {blocks.map((block, bIdx) => (
                  <div
                    key={block.id}
                    className={`rounded-2xl transition-all relative ${
                      previewMode
                        ? ''
                        : 'border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    {/* Block Toolbar (In Builder Mode) */}
                    {!previewMode && (
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 text-xs text-slate-400">
                        <div className="flex items-center space-x-2 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                          {block.type === 'video' && <Video className="w-4 h-4 text-blue-600" />}
                          {block.type === 'image' && <ImageIcon className="w-4 h-4 text-emerald-600" />}
                          {block.type === 'text' && <FileText className="w-4 h-4 text-indigo-600" />}
                          {block.type === 'takeaways' && <Lightbulb className="w-4 h-4 text-amber-600" />}
                          {block.type === 'quiz' && <HelpCircle className="w-4 h-4 text-purple-600" />}
                          {block.type === 'link' && <LinkIcon className="w-4 h-4 text-cyan-600" />}
                          {block.type === 'document' && <File className="w-4 h-4 text-rose-600" />}
                          <span>Block {bIdx + 1}: {block.type}</span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => moveBlock(bIdx, -1)}
                            disabled={bIdx === 0}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 disabled:opacity-20"
                            title="Move Block Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveBlock(bIdx, 1)}
                            disabled={bIdx === blocks.length - 1}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 disabled:opacity-20"
                            title="Move Block Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => duplicateBlock(block.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800"
                            title="Duplicate Block"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteBlock(block.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600"
                            title="Delete Block"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* BLOCK TYPE: VIDEO */}
                    {block.type === 'video' && (
                      <div className="space-y-4">
                        <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center relative shadow-sm">
                          {block.url ? (
                            <video
                              controls
                              poster={block.posterUrl || undefined}
                              src={block.url}
                              className="w-full h-full object-cover"
                            ></video>
                          ) : (
                            <div className="text-center p-6 text-slate-400 space-y-2">
                              <Video className="w-12 h-12 text-slate-600 mx-auto" />
                              <div className="text-xs font-bold text-slate-300">No Video Specified</div>
                              <p className="text-[11px] text-slate-500 max-w-xs">
                                Upload a video file or paste an MP4/web video link below.
                              </p>
                            </div>
                          )}
                        </div>

                        {!previewMode && (
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Video File Upload */}
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                  Upload Video File (MP4, WebM)
                                </label>
                                <label className="flex items-center justify-center gap-2 p-2 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 text-xs font-semibold text-slate-700 transition">
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => handleMediaUpload(e, block.id, 'url')}
                                    className="hidden"
                                  />
                                  {uploadingMediaForBlock === block.id + '-url' ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                                  ) : (
                                    <UploadCloud className="w-4 h-4 text-blue-600" />
                                  )}
                                  <span>{uploadingMediaForBlock === block.id + '-url' ? 'Uploading video...' : 'Browse Video File'}</span>
                                </label>
                              </div>

                              {/* Video Poster Thumbnail Upload */}
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                  Video Poster Thumbnail
                                </label>
                                <label className="flex items-center justify-center gap-2 p-2 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 text-xs font-semibold text-slate-700 transition">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleMediaUpload(e, block.id, 'posterUrl')}
                                    className="hidden"
                                  />
                                  {uploadingMediaForBlock === block.id + '-posterUrl' ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                                  ) : (
                                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                                  )}
                                  <span>{uploadingMediaForBlock === block.id + '-posterUrl' ? 'Uploading poster...' : 'Upload Poster Image'}</span>
                                </label>
                              </div>
                            </div>

                            {/* Or Direct Video URL */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                                Or Paste Direct Video URL
                              </label>
                              <input
                                type="url"
                                placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                                value={block.url || ''}
                                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono text-slate-800"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Video title (e.g. Architecture Overview)"
                                value={block.title || ''}
                                onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800"
                              />
                              <input
                                type="text"
                                placeholder="Duration (e.g. 12 min)"
                                value={block.duration || ''}
                                onChange={(e) => updateBlock(block.id, { duration: e.target.value })}
                                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* BLOCK TYPE: INSIDE IMAGE */}
                    {block.type === 'image' && (
                      <div className="space-y-3">
                        {block.url ? (
                          <div className={`rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 ${
                            block.layout === 'banner' ? 'w-full h-72' : 'max-w-xl mx-auto'
                          }`}>
                            <img
                              src={block.url}
                              alt={block.altText || 'Inside image'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center bg-slate-50/60">
                            <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                            <div className="text-xs font-bold text-slate-700">No Image Uploaded</div>
                            <p className="text-[11px] text-slate-400">Upload an image file or paste an image URL below.</p>
                          </div>
                        )}

                        {block.caption && (
                          <div className="text-center text-[11px] text-slate-500 italic">
                            {block.caption}
                          </div>
                        )}

                        {!previewMode && (
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <label className="flex items-center justify-center gap-2 p-2 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 text-xs font-semibold text-slate-700 transition">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleMediaUpload(e, block.id, 'url')}
                                  className="hidden"
                                />
                                {uploadingMediaForBlock === block.id + '-url' ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                                ) : (
                                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                                )}
                                <span>{uploadingMediaForBlock === block.id + '-url' ? 'Uploading...' : 'Upload Image File'}</span>
                              </label>

                              <select
                                value={block.layout || 'contained'}
                                onChange={(e) => updateBlock(block.id, { layout: e.target.value })}
                                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700"
                              >
                                <option value="contained">Standard Contained</option>
                                <option value="banner">Full-Width Banner</option>
                              </select>
                            </div>

                            <input
                              type="url"
                              placeholder="Or paste image URL (https://images.unsplash.com/...)"
                              value={block.url || ''}
                              onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono text-slate-800"
                            />

                            <input
                              type="text"
                              placeholder="Image Caption (e.g. Figure 1.2: Cryptographic Token Life Cycle)"
                              value={block.caption || ''}
                              onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* BLOCK TYPE: TEXT / NARRATIVE */}
                    {block.type === 'text' && (
                      <div className="space-y-3">
                        {!previewMode ? (
                          <div className="space-y-2">
                            <textarea
                              rows={8}
                              value={block.content || ''}
                              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                              placeholder="Write your lesson text narrative, code samples, or step-by-step guides..."
                              className="w-full p-4 text-xs font-mono rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed bg-slate-50/50 focus:bg-white transition"
                            />
                          </div>
                        ) : (
                          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl">
                            {block.content || 'Empty narrative block.'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* BLOCK TYPE: KEY TAKEAWAYS CARD */}
                    {block.type === 'takeaways' && (
                      <div className="rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/50 border border-indigo-200/80 p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-indigo-950">
                            <Lightbulb className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                            {!previewMode ? (
                              <input
                                type="text"
                                value={block.title || 'Key Takeaways'}
                                onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                className="font-extrabold text-sm text-indigo-950 bg-transparent border-b border-indigo-200 focus:outline-none"
                              />
                            ) : (
                              <h3 className="text-sm font-extrabold tracking-tight">{block.title || 'Key Takeaways'}</h3>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-100/80 px-2 py-0.5 rounded-md">
                            Key Highlights
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {(block.items || []).map((item, itmIdx) => (
                            <div key={itmIdx} className="flex items-start space-x-2.5 text-xs text-slate-800">
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                              {!previewMode ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => {
                                      const updatedItems = [...block.items];
                                      updatedItems[itmIdx] = e.target.value;
                                      updateBlock(block.id, { items: updatedItems });
                                    }}
                                    className="flex-1 bg-transparent border-b border-indigo-100 focus:border-indigo-400 focus:outline-none text-xs text-slate-800 py-0.5"
                                  />
                                  <button
                                    onClick={() => {
                                      const updatedItems = block.items.filter((_, i) => i !== itmIdx);
                                      updateBlock(block.id, { items: updatedItems });
                                    }}
                                    className="text-slate-300 hover:text-rose-500 p-0.5"
                                    title="Remove Item"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <span>{item}</span>
                              )}
                            </div>
                          ))}
                        </div>

                        {!previewMode && (
                          <button
                            onClick={() => {
                              const updatedItems = [...(block.items || []), 'New takeaway item'];
                              updateBlock(block.id, { items: updatedItems });
                            }}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Takeaway Bullet</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* BLOCK TYPE: FORMATIVE KNOWLEDGE CHECK */}
                    {block.type === 'quiz' && (
                      <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                          <div className="flex items-center space-x-2">
                            <HelpCircle className="w-5 h-5 text-purple-600" />
                            <h3 className="text-sm font-extrabold text-slate-900">Knowledge Check (Formative Quiz)</h3>
                          </div>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                            Instant Feedback
                          </span>
                        </div>

                        {/* Question Prompt */}
                        {!previewMode ? (
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-600 uppercase">
                              Question Prompt
                            </label>
                            <input
                              type="text"
                              value={block.prompt || ''}
                              onChange={(e) => updateBlock(block.id, { prompt: e.target.value })}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white"
                              placeholder="Enter question prompt..."
                            />
                          </div>
                        ) : (
                          <p className="text-xs font-bold text-slate-900">{block.prompt}</p>
                        )}

                        {/* Options List */}
                        <div className="space-y-2">
                          {(block.options || []).map((opt, optIdx) => {
                            const isCorrect = optIdx === block.correctIdx;
                            const isSelected = quizTestAnswers[block.id] === optIdx;
                            const isSubmitted = quizSubmitted[block.id];

                            if (previewMode) {
                              return (
                                <div
                                  key={optIdx}
                                  onClick={() => {
                                    setQuizTestAnswers({ ...quizTestAnswers, [block.id]: optIdx });
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
                            }

                            // Builder Editing Mode
                            return (
                              <div key={optIdx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                                <label
                                  className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600"
                                  title="Mark as correct answer"
                                >
                                  <input
                                    type="radio"
                                    name={`correct-${block.id}`}
                                    checked={isCorrect}
                                    onChange={() => updateBlock(block.id, { correctIdx: optIdx })}
                                    className="text-brand-600 focus:ring-0"
                                  />
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isCorrect ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-400'}`}>
                                    {isCorrect ? 'Correct' : `Option ${String.fromCharCode(65 + optIdx)}`}
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const updatedOpts = [...block.options];
                                    updatedOpts[optIdx] = e.target.value;
                                    updateBlock(block.id, { options: updatedOpts });
                                  }}
                                  className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                                />
                                {block.options.length > 2 && (
                                  <button
                                    onClick={() => {
                                      const updatedOpts = block.options.filter((_, i) => i !== optIdx);
                                      updateBlock(block.id, {
                                        options: updatedOpts,
                                        correctIdx: block.correctIdx >= updatedOpts.length ? 0 : block.correctIdx
                                      });
                                    }}
                                    className="p-1 text-slate-300 hover:text-rose-500"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {!previewMode && (
                          <div className="space-y-3 pt-2">
                            {block.options.length < 5 && (
                              <button
                                onClick={() => {
                                  const updatedOpts = [...block.options, 'New answer choice'];
                                  updateBlock(block.id, { options: updatedOpts });
                                }}
                                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Choice</span>
                              </button>
                            )}

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                Feedback &amp; Explanation (Shown after answering)
                              </label>
                              <input
                                type="text"
                                value={block.explanation || ''}
                                onChange={(e) => updateBlock(block.id, { explanation: e.target.value })}
                                placeholder="Explain why the answer is correct..."
                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                              />
                            </div>
                          </div>
                        )}

                        {previewMode && quizSubmitted[block.id] && block.explanation && (
                          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 leading-relaxed">
                            <span className="font-bold">Explanation: </span>{block.explanation}
                          </div>
                        )}
                      </div>
                    )}

                    {/* BLOCK TYPE: LINK / EXTERNAL RESOURCE */}
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
                        {block.description && (
                          <p className="text-xs text-slate-500">{block.description}</p>
                        )}
                        {!previewMode && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            <input
                              type="text"
                              placeholder="Link Title (e.g. AWS Security Whitepaper)"
                              value={block.title || ''}
                              onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                            />
                            <input
                              type="url"
                              placeholder="URL (https://...)"
                              value={block.url || ''}
                              onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-800"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* PERSISTENT "+ ADD BLOCK" BAR (Below Canvas) */}
              {!previewMode && blocks.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    + Add Another Block to Lesson
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => addBlock('video')}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>+ Video</span>
                    </button>
                    <button
                      onClick={() => addBlock('image')}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>+ Inside Image</span>
                    </button>
                    <button
                      onClick={() => addBlock('text')}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>+ Rich Text</span>
                    </button>
                    <button
                      onClick={() => addBlock('takeaways')}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>+ Takeaways Card</span>
                    </button>
                    <button
                      onClick={() => addBlock('quiz')}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>+ Knowledge Check Quiz</span>
                    </button>
                    <button
                      onClick={() => addBlock('link')}
                      className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>+ Resource Link</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 max-w-xl mx-auto my-auto text-center space-y-6">
              {!course?.modules || course.modules.length === 0 ? (
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-8 space-y-5 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl border border-red-200/70 shadow-2xs">
                    🍁
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-slate-900">Curriculum Ready to Design</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Clean slate authoring. Add your first section to organize lessons, video lectures, and quizzes with zero forced filler.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => handleAddModule('Module 1: Foundations & Architecture')}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-xs flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Create First Section</span>
                    </button>
                    <button
                      onClick={() => setShowSettingsModal(true)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center gap-2 bg-white"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Course Details</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-8 space-y-5 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200/70 shadow-2xs">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-slate-900">Add Lesson to Section</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Select a format below to create a lesson, or choose an existing lesson from the curriculum outline on the left.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    <button
                      onClick={() => handleAddLesson(selectedModuleId || course.modules[0]?.id, 'New Video Lecture', 'VIDEO')}
                      className="p-3 bg-white border border-slate-200 hover:border-red-400 hover:bg-red-50/30 rounded-2xl flex flex-col items-center gap-1.5 transition shadow-2xs group"
                    >
                      <Video className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-slate-800">Video</span>
                    </button>

                    <button
                      onClick={() => handleAddLesson(selectedModuleId || course.modules[0]?.id, 'New Article & Reading', 'TEXT')}
                      className="p-3 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-2xl flex flex-col items-center gap-1.5 transition shadow-2xs group"
                    >
                      <FileText className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-slate-800">Article</span>
                    </button>

                    <button
                      onClick={() => handleAddLesson(selectedModuleId || course.modules[0]?.id, 'Knowledge Check Quiz', 'QUIZ')}
                      className="p-3 bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50/30 rounded-2xl flex flex-col items-center gap-1.5 transition shadow-2xs group"
                    >
                      <HelpCircle className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-slate-800">Quiz</span>
                    </button>

                    <button
                      onClick={() => handleAddLesson(selectedModuleId || course.modules[0]?.id, 'Reference Documents', 'DOCUMENT')}
                      className="p-3 bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 rounded-2xl flex flex-col items-center gap-1.5 transition shadow-2xs group"
                    >
                      <File className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-slate-800">Document</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* COLUMN 3 (RIGHT): Content Health Check Audit & AI Assistant */}
        <aside className="w-80 md:w-88 border-l border-slate-200/90 bg-slate-50/60 overflow-y-auto p-5 space-y-6 shrink-0">
          {/* Health Audit Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Content Health Check
              </span>
              <span className="text-sm font-black font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {healthScore}/100
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${healthScore}%` }}
              ></div>
            </div>

            <div className="space-y-2 pt-1">
              {healthChecks.map((hc, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className={hc.pass ? 'text-slate-700' : 'text-slate-400'}>{hc.label}</span>
                  {hc.pass ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0"></span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Assistant Drawer */}
          <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 border border-purple-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-purple-900">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider">AI Content Assistant</h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Generate or enrich blocks with one click using contextual AI.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => addBlock('takeaways')}
                className="w-full py-2 px-3 bg-white border border-purple-200 hover:border-purple-400 rounded-xl text-xs font-bold text-purple-900 text-left transition flex items-center justify-between shadow-2xs"
              >
                <span>Generate Key Takeaways</span>
                <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
              </button>

              <button
                onClick={() => addBlock('quiz')}
                className="w-full py-2 px-3 bg-white border border-purple-200 hover:border-purple-400 rounded-xl text-xs font-bold text-purple-900 text-left transition flex items-center justify-between shadow-2xs"
              >
                <span>Generate Knowledge Check</span>
                <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* COURSE SETTINGS & COVER IMAGE MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Settings className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Course Settings &amp; Cover</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  value={settingsForm.title}
                  onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Course Description
                </label>
                <textarea
                  rows={3}
                  value={settingsForm.description}
                  onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Cover Image Upload & URL */}
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Course Cover Thumbnail
                </label>
                {settingsForm.thumbnailUrl && (
                  <div className="h-32 rounded-xl overflow-hidden border border-slate-200 relative">
                    <img
                      src={settingsForm.thumbnailUrl}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 text-xs font-bold text-slate-700 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                    {uploadingCover ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                    ) : (
                      <UploadCloud className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>{uploadingCover ? 'Uploading...' : 'Upload Cover Image'}</span>
                  </label>

                  <input
                    type="url"
                    placeholder="Or paste image URL..."
                    value={settingsForm.thumbnailUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, thumbnailUrl: e.target.value })}
                    className="px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              {/* Category, Level, Passing Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    list="course-categories-list"
                    value={settingsForm.category}
                    onChange={(e) => setSettingsForm({ ...settingsForm, category: e.target.value })}
                    placeholder="Select or enter category..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                  <datalist id="course-categories-list">
                    {availableCategories.map((c) => (
                      <option key={c.id || c.name} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={settingsForm.passingScore}
                    onChange={(e) => setSettingsForm({ ...settingsForm, passingScore: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-BUILDER AI ASSIST COPILOT MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">AI Lesson Copilot</h3>
                  <p className="text-[11px] text-slate-500">
                    Synthesize content, add scenario quizzes, or elevate current draft
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowAiModal(false); setAiFeedback(''); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/80 text-xs text-purple-900">
                <span className="font-bold block mb-0.5">Active Target Lesson:</span>
                <span className="font-semibold text-slate-800">{selectedLesson?.title}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Course: {course?.title}
                </span>
              </div>

              {aiFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{aiFeedback}</span>
                </div>
              )}

              {/* 3 Action Pathways */}
              <div className="space-y-2.5">
                {/* Option 1: Full Lesson Draft */}
                <div className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 transition flex items-center justify-between gap-4 group">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <h4 className="text-xs font-bold text-slate-900">Generate Structured Lesson Draft</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Creates executive summary, architecture principles, code/CLI patterns, and key takeaways tailored to this lesson.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiGenerateLesson}
                    disabled={aiGeneratingMode !== null}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-xs flex items-center gap-1.5 transition"
                  >
                    {aiGeneratingMode === 'LESSON' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Drafting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Option 2: Quiz Generator */}
                <div className="p-4 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition flex items-center justify-between gap-4 group">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs font-bold text-slate-900">Generate Scenario Knowledge Checks</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Appends multiple-choice evaluation questions with distractors and in-depth explanations directly to this lesson.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiGenerateQuiz}
                    disabled={aiGeneratingMode !== null}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-xs flex items-center gap-1.5 transition"
                  >
                    {aiGeneratingMode === 'QUIZ' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Quiz</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Option 3: Enhance Existing Text */}
                <div className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition space-y-2 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-bold text-slate-900">Enhance &amp; Structure Draft Content</h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleAiEnhanceContent}
                      disabled={aiGeneratingMode !== null}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-xs flex items-center gap-1.5 transition"
                    >
                      {aiGeneratingMode === 'ENHANCE' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Polishing...</span>
                        </>
                      ) : (
                        <>
                          <span>Enhance Text</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    placeholder="Custom instruction, e.g., 'Add troubleshooting step and warning alert'..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

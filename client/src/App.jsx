import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Navigation & Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import GlobalCommandPalette from './components/common/GlobalCommandPalette';

// Public Marketing Pages
import LandingPage from './pages/public/LandingPage';
import PlatformPage from './pages/public/PlatformPage';
import FeaturesPage from './pages/public/FeaturesPage';
import ScormPublicPage from './pages/public/ScormPublicPage';
import AiCourseCreatorPublicPage from './pages/public/AiCourseCreatorPublicPage';
import LearningPublicPage from './pages/public/LearningPublicPage';
import LearningPathsPublicPage from './pages/public/LearningPathsPublicPage';
import SkillsPublicPage from './pages/public/SkillsPublicPage';
import AnalyticsPublicPage from './pages/public/AnalyticsPublicPage';
import SolutionsPage from './pages/public/SolutionsPage';
import SolutionsEnterprisePage from './pages/public/SolutionsEnterprisePage';
import SolutionsTrainingPage from './pages/public/SolutionsTrainingPage';
import SolutionsCompliancePage from './pages/public/SolutionsCompliancePage';
import PricingPage from './pages/public/PricingPage';
import VerifyCertificatePage from './pages/public/VerifyCertificatePage';
import RequestDemoPage from './pages/public/RequestDemoPage';
import LoginPage from './pages/public/LoginPage';
import SignupPage from './pages/public/SignupPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import ResourcesPage from './pages/public/ResourcesPage';

// Authenticated Role Dashboards
import LearnerDashboard from './pages/dashboards/LearnerDashboard';
import CourseCreatorDashboard from './pages/dashboards/CourseCreatorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';

// Authoring & Studio
import AiCourseStudio from './pages/ai/AiCourseStudio';
import CourseBuilder from './pages/courses/CourseBuilder';
import CreateCourseAppView from './pages/courses/CreateCourseAppView';

// Multimodal Player & Quiz Runner
import CoursePlayer from './pages/learning/CoursePlayer';
import QuizRunner from './pages/learning/QuizRunner';

// Learning, Skills, Matrix & Gamification
import CourseCatalog from './pages/learning/CourseCatalog';
import LearningPathsAppView from './pages/learning/LearningPathsAppView';
import ScormPackagesView from './pages/learning/ScormPackagesView';
import SkillsMatrixAppView from './pages/learning/SkillsMatrixAppView';
import ManagerTeamAppView from './pages/learning/ManagerTeamAppView';
import GradingQueueAppView from './pages/learning/GradingQueueAppView';
import CertificatesAppView from './pages/learning/CertificatesAppView';
import GamificationAppView from './pages/learning/GamificationAppView';
import AnalyticsAppView from './pages/learning/AnalyticsAppView';

// Admin & Governance
import UsersManagementAppView from './pages/admin/UsersManagementAppView';
import OrganizationsListAppView from './pages/admin/OrganizationsListAppView';
import OrganizationSettingsAppView from './pages/admin/OrganizationSettingsAppView';
import AuditLogsAppView from './pages/admin/AuditLogsAppView';
import AnnouncementsAppView from './pages/admin/AnnouncementsAppView';

// Authenticated Layout Shell
function AppShellLayout() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Initializing MapleLMS workspace...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to login with return path
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      <GlobalCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}

// Smart Root Redirect based on user role
function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'SUPER_ADMIN') return <Navigate to="/app/superadmin" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/app/admin" replace />;
  if (user.role === 'COURSE_CREATOR') return <Navigate to="/app/creator" replace />;
  return <Navigate to="/app/learner" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ============================================================
              1. PUBLIC MARKETING & SALES ROUTES (18+ PAGES)
              ============================================================ */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/platform" element={<PlatformPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/scorm" element={<ScormPublicPage />} />
          <Route path="/ai-course-creator" element={<AiCourseCreatorPublicPage />} />
          <Route path="/learning" element={<LearningPublicPage />} />
          <Route path="/learning-paths" element={<LearningPathsPublicPage />} />
          <Route path="/skills" element={<SkillsPublicPage />} />
          <Route path="/analytics" element={<AnalyticsPublicPage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/solutions/enterprise" element={<SolutionsEnterprisePage />} />
          <Route path="/solutions/employee-training" element={<SolutionsTrainingPage />} />
          <Route path="/solutions/compliance" element={<SolutionsCompliancePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/request-demo" element={<RequestDemoPage />} />
          <Route path="/verify/:code" element={<VerifyCertificatePage />} />
          <Route path="/verify" element={<VerifyCertificatePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ============================================================
              2. STANDALONE DISTRACTION-FREE LEARNER EXPERIENCE
              ============================================================ */}
          <Route path="/learning/:id" element={<CoursePlayer />} />
          <Route path="/app/quiz/:id" element={<QuizRunner />} />

          {/* ============================================================
              3. AUTHENTICATED LMS / LXP WORKSPACE APPLICATION
              ============================================================ */}
          <Route path="/app" element={<AppShellLayout />}>
            {/* Index redirects to user's personalized dashboard */}
            <Route index element={<DashboardRedirect />} />

            {/* Role-Specific Dashboards */}
            <Route path="learner" element={<LearnerDashboard />} />
            <Route path="creator" element={<CourseCreatorDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="superadmin" element={<SuperAdminDashboard />} />

            {/* Course & Authoring Routes */}
            <Route path="courses" element={<CourseCatalog />} />
            <Route path="courses/new" element={<CreateCourseAppView />} />
            <Route path="courses/:id/builder" element={<CourseBuilder />} />
            <Route path="ai-studio" element={<AiCourseStudio />} />
            <Route path="my-learning" element={<CourseCatalog />} />
            <Route path="explore" element={<CourseCatalog />} />

            {/* Pathways & Standards */}
            <Route path="learning-paths" element={<LearningPathsAppView />} />
            <Route path="scorm" element={<ScormPackagesView />} />

            {/* Competency & Assessments */}
            <Route path="skills" element={<SkillsMatrixAppView />} />
            <Route path="assessments" element={<GradingQueueAppView />} />
            <Route path="grading" element={<GradingQueueAppView />} />
            <Route path="certificates" element={<CertificatesAppView />} />

            {/* Team & Gamification */}
            <Route path="my-team" element={<ManagerTeamAppView />} />
            <Route path="teams" element={<ManagerTeamAppView />} />
            <Route path="achievements" element={<GamificationAppView />} />
            <Route path="leaderboard" element={<GamificationAppView />} />
            <Route path="gamification" element={<GamificationAppView />} />
            <Route path="profile" element={<GamificationAppView />} />
            <Route path="calendar" element={<LearnerDashboard />} />

            {/* Analytics & Administration */}
            <Route path="analytics" element={<AnalyticsAppView />} />
            <Route path="users" element={<UsersManagementAppView />} />
            <Route path="organizations" element={<OrganizationsListAppView />} />
            <Route path="settings" element={<OrganizationSettingsAppView />} />
            <Route path="audit-logs" element={<AuditLogsAppView />} />
            <Route path="announcements" element={<AnnouncementsAppView />} />
            <Route path="notifications" element={<AnnouncementsAppView />} />
          </Route>

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

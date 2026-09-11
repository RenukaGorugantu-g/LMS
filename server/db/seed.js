import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { getDatabase, saveDatabaseToDisk } from './database.js';
import { createSampleScormPackages } from './createScormSamples.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSeed() {
  console.log('--- Initializing Strata LXP Database Seed ---');
  const db = await getDatabase();

  // 1. Run Schema
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schemaSql);
  console.log('✓ Relational schema applied');

  // 2. Generate SCORM packages
  createSampleScormPackages();
  console.log('✓ SCORM sample packages verified');

  // 3. Granular Permissions
  const permissions = [
    { id: 'p1', code: 'course.create', category: 'Course', description: 'Create new courses' },
    { id: 'p2', code: 'course.read', category: 'Course', description: 'View course catalog' },
    { id: 'p3', code: 'course.update', category: 'Course', description: 'Edit course structure and content' },
    { id: 'p4', code: 'course.delete', category: 'Course', description: 'Delete courses' },
    { id: 'p5', code: 'course.publish', category: 'Course', description: 'Publish draft courses' },
    { id: 'p6', code: 'lesson.create', category: 'Lesson', description: 'Create modules and lessons' },
    { id: 'p7', code: 'lesson.update', category: 'Lesson', description: 'Update lesson contents' },
    { id: 'p8', code: 'lesson.delete', category: 'Lesson', description: 'Remove lessons' },
    { id: 'p9', code: 'scorm.upload', category: 'SCORM', description: 'Upload SCORM packages' },
    { id: 'p10', code: 'scorm.manage', category: 'SCORM', description: 'Manage and delete SCORM packages' },
    { id: 'p11', code: 'learner.read', category: 'Learner', description: 'View learner records and progress' },
    { id: 'p12', code: 'learner.manage', category: 'Learner', description: 'Create and deactivate learners' },
    { id: 'p13', code: 'enrollment.create', category: 'Enrollment', description: 'Enroll learners in courses' },
    { id: 'p14', code: 'enrollment.manage', category: 'Enrollment', description: 'Manage due dates and assignments' },
    { id: 'p15', code: 'analytics.platform', category: 'Analytics', description: 'View cross-tenant platform metrics' },
    { id: 'p16', code: 'analytics.organisation', category: 'Analytics', description: 'View organization analytics' },
    { id: 'p17', code: 'analytics.course', category: 'Analytics', description: 'View course performance metrics' },
    { id: 'p18', code: 'analytics.team', category: 'Analytics', description: 'View team learner analytics' },
    { id: 'p19', code: 'ai.course.create', category: 'AI', description: 'Generate courses with AI Studio' },
    { id: 'p20', code: 'ai.content.generate', category: 'AI', description: 'Generate lessons with AI Copilot' },
    { id: 'p21', code: 'ai.assessment.generate', category: 'AI', description: 'Generate quiz questions with AI' },
    { id: 'p22', code: 'settings.manage', category: 'Settings', description: 'Manage organization configuration' },
    { id: 'p23', code: 'assignment.grade', category: 'Assignment', description: 'Grade learner submissions' }
  ];

  db.run("DELETE FROM role_permissions;");
  db.run("DELETE FROM permissions;");
  
  for (const p of permissions) {
    db.run("INSERT INTO permissions (id, code, category, description) VALUES (?, ?, ?, ?)", [p.id, p.code, p.category, p.description]);
  }

  // Super Admin gets ALL permissions
  for (const p of permissions) {
    db.run("INSERT INTO role_permissions (role, permission_id) VALUES ('SUPER_ADMIN', ?)", [p.id]);
  }

  // Admin permissions (Operational)
  const adminCodes = ['course.create', 'course.read', 'course.update', 'course.publish', 'lesson.create', 'lesson.update', 'scorm.upload', 'scorm.manage', 'learner.read', 'learner.manage', 'enrollment.create', 'enrollment.manage', 'analytics.organisation', 'analytics.course', 'analytics.team', 'ai.course.create', 'ai.content.generate', 'ai.assessment.generate', 'settings.manage', 'assignment.grade'];
  for (const code of adminCodes) {
    const p = permissions.find(x => x.code === code);
    if (p) db.run("INSERT INTO role_permissions (role, permission_id) VALUES ('ADMIN', ?)", [p.id]);
  }

  // Course Creator permissions
  const creatorCodes = ['course.create', 'course.read', 'course.update', 'course.publish', 'lesson.create', 'lesson.update', 'lesson.delete', 'scorm.upload', 'scorm.manage', 'learner.read', 'analytics.course', 'analytics.team', 'ai.course.create', 'ai.content.generate', 'ai.assessment.generate', 'assignment.grade'];
  for (const code of creatorCodes) {
    const p = permissions.find(x => x.code === code);
    if (p) db.run("INSERT INTO role_permissions (role, permission_id) VALUES ('COURSE_CREATOR', ?)", [p.id]);
  }

  // Learner permissions
  const learnerCodes = ['course.read'];
  for (const code of learnerCodes) {
    const p = permissions.find(x => x.code === code);
    if (p) db.run("INSERT INTO role_permissions (role, permission_id) VALUES ('LEARNER', ?)", [p.id]);
  }

  console.log('✓ Granular permissions mapped to 4 roles');

  // 4. Organizations
  db.run("DELETE FROM organizations;");
  db.run(`INSERT INTO organizations (id, name, slug, domain, logo_url, brand_color, plan, status, settings_json) VALUES 
    ('org-acme', 'Acme Global Technologies', 'acme-global', 'acmeglobal.com', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60', '#1e40af', 'ENTERPRISE', 'ACTIVE', '{"ssoEnabled": true, "certificateAutoIssue": true, "complianceRemindersDays": 7}'),
    ('org-health', 'HealthCorp International', 'healthcorp', 'healthcorp.io', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100&auto=format&fit=crop&q=60', '#047857', 'ENTERPRISE', 'ACTIVE', '{"ssoEnabled": true, "complianceRemindersDays": 14}'),
    ('org-fintech', 'FinTech Apex Capital', 'fintech-apex', 'fintechapex.com', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=60', '#4338ca', 'GROWTH', 'ACTIVE', '{"ssoEnabled": false}')
  `);
  console.log('✓ Organizations seeded');

  // 5. Users
  db.run("DELETE FROM users;");
  const defaultPasswordHash = bcrypt.hashSync('password123', 8);

  const usersList = [
    {
      id: 'usr-superadmin',
      org_id: 'org-acme',
      email: 'superadmin@stratalms.com',
      first_name: 'Marcus',
      last_name: 'Vance',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'SUPER_ADMIN',
      title: 'Chief Learning Officer & Platform Principal',
      department: 'Executive Operations',
      bio: 'Enterprise learning architect with 15+ years experience scaling L&D across Fortune 500 organizations.'
    },
    {
      id: 'usr-admin',
      org_id: 'org-acme',
      email: 'admin@acmeglobal.com',
      first_name: 'Sarah',
      last_name: 'Jenkins',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      role: 'ADMIN',
      title: 'Director of Enterprise Learning & Talent',
      department: 'Human Resources & Enablement',
      bio: 'Overseeing global talent development, compliance adherence, and strategic upskilling.'
    },
    {
      id: 'usr-creator',
      org_id: 'org-acme',
      email: 'creator@acmeglobal.com',
      first_name: 'David',
      last_name: 'Chen',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'COURSE_CREATOR',
      title: 'Senior Instructional Designer & Engineering Manager',
      department: 'Cloud Infrastructure & Security',
      bio: 'Author of enterprise technical curricula and engineering manager leading technical capability growth.'
    },
    {
      id: 'usr-learner',
      org_id: 'org-acme',
      email: 'elena.rostova@acmeglobal.com',
      first_name: 'Elena',
      last_name: 'Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'LEARNER',
      title: 'Senior Cloud & Security Systems Engineer',
      department: 'Cloud Infrastructure & Security',
      bio: 'Cloud architect focused on resilient distributed systems and Zero Trust security.'
    },
    // Team members for manager oversight
    {
      id: 'usr-member-1',
      org_id: 'org-acme',
      email: 'alexandre.dubois@acmeglobal.com',
      first_name: 'Alexandre',
      last_name: 'Dubois',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'LEARNER',
      title: 'Cloud Systems Engineer',
      department: 'Cloud Infrastructure & Security',
      bio: 'Backend infrastructure and container orchestration.'
    },
    {
      id: 'usr-member-2',
      org_id: 'org-acme',
      email: 'priya.sharma@acmeglobal.com',
      first_name: 'Priya',
      last_name: 'Sharma',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      role: 'LEARNER',
      title: 'DevOps Specialist',
      department: 'Cloud Infrastructure & Security',
      bio: 'CI/CD pipeline automation and Kubernetes reliability.'
    },
    {
      id: 'usr-member-3',
      org_id: 'org-acme',
      email: 'jordan.lee@acmeglobal.com',
      first_name: 'Jordan',
      last_name: 'Lee',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      role: 'LEARNER',
      title: 'Associate Site Reliability Engineer',
      department: 'Cloud Infrastructure & Security',
      bio: 'Infrastructure monitoring and observability tooling.'
    }
  ];

  for (const u of usersList) {
    db.run(`INSERT INTO users (id, org_id, email, password_hash, first_name, last_name, avatar_url, role, title, department, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.org_id, u.email, defaultPasswordHash, u.first_name, u.last_name, u.avatar_url, u.role, u.title, u.department, u.bio]
    );
  }
  console.log('✓ Users seeded (including 4 primary roles + team members)');

  // 6. Teams
  db.run("DELETE FROM teams;");
  db.run("DELETE FROM team_members;");
  db.run(`INSERT INTO teams (id, org_id, name, description, manager_id) VALUES 
    ('team-cloud-sec', 'org-acme', 'Cloud Infrastructure & Security', 'Core platform engineering and enterprise security operations.', 'usr-creator'),
    ('team-leadership', 'org-acme', 'Enterprise Strategic Leadership', 'Executive talent cohort and departmental leadership program.', 'usr-admin')
  `);

  db.run(`INSERT INTO team_members (team_id, user_id) VALUES 
    ('team-cloud-sec', 'usr-learner'),
    ('team-cloud-sec', 'usr-member-1'),
    ('team-cloud-sec', 'usr-member-2'),
    ('team-cloud-sec', 'usr-member-3')
  `);
  console.log('✓ Teams seeded with manager assignments');

  // 7. SCORM Packages
  db.run("DELETE FROM scorm_packages;");
  db.run(`INSERT INTO scorm_packages (id, org_id, course_id, title, version, manifest_data_json, entry_point, package_dir, size_bytes) VALUES 
    ('scorm-pkg-sec101', 'org-acme', 'crs-sec-101', 'Enterprise Information Security & Zero Trust Architecture', '1.2', '{"identifier":"STRATA_SCORM_12_SEC101","schema":"ADL SCORM 1.2"}', 'index.html', 'scorm-pkg-sec101', 45000),
    ('scorm-pkg-strat201', 'org-acme', 'crs-strat-201', 'Strategic Decision Making & Executive Risk Management', '2004', '{"identifier":"STRATA_SCORM_2004_STRAT201","schema":"ADL SCORM 2004 4th Edition"}', 'index.html', 'scorm-pkg-strat201', 52000)
  `);

  // 8. Courses
  db.run("DELETE FROM courses;");
  const courses = [
    {
      id: 'crs-sec-101',
      org_id: 'org-acme',
      creator_id: 'usr-creator',
      title: 'Enterprise Information Security & Zero Trust Architecture',
      slug: 'enterprise-security-zero-trust',
      description: 'Master practical implementation of Zero Trust principles, microsegmentation, and identity verification across modern enterprise infrastructure.',
      category: 'Cybersecurity & Compliance',
      level: 'ADVANCED',
      course_type: 'SCORM',
      duration_minutes: 120,
      thumbnail_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
      status: 'PUBLISHED',
      readiness_score: 95,
      passing_score: 80,
      is_featured: 1
    },
    {
      id: 'crs-strat-201',
      org_id: 'org-acme',
      creator_id: 'usr-creator',
      title: 'Strategic Decision Making & High-Performing Teams',
      slug: 'strategic-decision-making-teams',
      description: 'Frameworks for probabilistic scenario modeling, cognitive bias mitigation, and accelerating team performance under ambiguous constraints.',
      category: 'Leadership & Strategy',
      level: 'INTERMEDIATE',
      course_type: 'SCORM',
      duration_minutes: 90,
      thumbnail_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=80',
      status: 'PUBLISHED',
      readiness_score: 91,
      passing_score: 75,
      is_featured: 1
    },
    {
      id: 'crs-cloud-301',
      org_id: 'org-acme',
      creator_id: 'usr-creator',
      title: 'Cloud Native Architecture & Kubernetes Resilience',
      slug: 'cloud-native-kubernetes-resilience',
      description: 'Production patterns for building fault-tolerant microservices, service meshes, zero-downtime canary deployments, and chaos engineering.',
      category: 'Cloud Engineering',
      level: 'ADVANCED',
      course_type: 'STANDARD',
      duration_minutes: 180,
      thumbnail_url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&auto=format&fit=crop&q=80',
      status: 'PUBLISHED',
      readiness_score: 94,
      passing_score: 80,
      is_featured: 1
    },
    {
      id: 'crs-comp-401',
      org_id: 'org-acme',
      creator_id: 'usr-admin',
      title: 'Global Compliance, Anti-Corruption & Data Ethics 2026',
      slug: 'global-compliance-ethics-2026',
      description: 'Mandatory enterprise annual compliance certification covering FCPA, GDPR data privacy governance, whistleblower safeguards, and AI governance.',
      category: 'Compliance & Governance',
      level: 'FOUNDATIONAL',
      course_type: 'STANDARD',
      duration_minutes: 75,
      thumbnail_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
      status: 'PUBLISHED',
      readiness_score: 98,
      passing_score: 85,
      is_featured: 0
    },
    {
      id: 'crs-ai-501',
      org_id: 'org-acme',
      creator_id: 'usr-creator',
      title: 'Generative AI in Enterprise Workflows & Operations',
      slug: 'generative-ai-enterprise-workflows',
      description: 'Systematic guide to integrating LLM reasoning, retrieval augmented generation (RAG), and agentic workflows into mission-critical business systems.',
      category: 'Artificial Intelligence',
      level: 'INTERMEDIATE',
      course_type: 'BLENDED',
      duration_minutes: 105,
      thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80',
      status: 'PUBLISHED',
      readiness_score: 92,
      passing_score: 80,
      is_featured: 1
    },
    {
      id: 'crs-prod-601',
      org_id: 'org-acme',
      creator_id: 'usr-creator',
      title: 'Product Management Excellence & Product-Led Growth',
      slug: 'product-management-excellence-plg',
      description: 'End-to-end product discovery, continuous customer interviewing, activation funnel optimization, and enterprise PLG telemetry.',
      category: 'Product & Design',
      level: 'INTERMEDIATE',
      course_type: 'STANDARD',
      duration_minutes: 110,
      thumbnail_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80',
      status: 'DRAFT',
      readiness_score: 82,
      passing_score: 75,
      is_featured: 0
    }
  ];

  for (const c of courses) {
    db.run(`INSERT INTO courses (id, org_id, creator_id, title, slug, description, category, level, course_type, duration_minutes, thumbnail_url, status, readiness_score, passing_score, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.org_id, c.creator_id, c.title, c.slug, c.description, c.category, c.level, c.course_type, c.duration_minutes, c.thumbnail_url, c.status, c.readiness_score, c.passing_score, c.is_featured]
    );
  }
  console.log('✓ Production courses seeded');

  // 9. Course Modules & Lessons & Contents
  db.run("DELETE FROM course_modules;");
  db.run("DELETE FROM lessons;");
  db.run("DELETE FROM lesson_contents;");

  // Course 1 (crs-sec-101) modules & lessons
  db.run(`INSERT INTO course_modules (id, course_id, title, description, order_index) VALUES 
    ('mod-sec-1', 'crs-sec-101', 'Zero Trust Foundations & Perimeter Dismantling', 'Deconstructing legacy network perimeters and shifting toward identity-bound trust boundaries.', 1),
    ('mod-sec-2', 'crs-sec-101', 'Microsegmentation & Least Privilege Enforcement', 'Network-level workload isolation and ephemeral credential infrastructure.', 2)
  `);

  db.run(`INSERT INTO lessons (id, module_id, title, lesson_type, duration_minutes, order_index, is_mandatory) VALUES 
    ('les-sec-1', 'mod-sec-1', 'SCORM Interactive Package: Zero Trust SCO', 'SCORM', 30, 1, 1),
    ('les-sec-2', 'mod-sec-1', 'Contextual MFA and Continuous Signal Evaluation', 'VIDEO', 20, 2, 1),
    ('les-sec-3', 'mod-sec-2', 'VPC Microsegmentation Architecture Whitepaper', 'PDF', 25, 1, 1),
    ('les-sec-4', 'mod-sec-2', 'Zero Trust Certification Knowledge Exam', 'QUIZ', 25, 2, 1)
  `);

  db.run(`INSERT INTO lesson_contents (id, lesson_id, body_text, scorm_package_id) VALUES 
    ('lc-sec-1', 'les-sec-1', 'Launch the interactive SCORM 1.2 module to complete the Zero Trust core validation.', 'scorm-pkg-sec101')
  `);
  db.run(`INSERT INTO lesson_contents (id, lesson_id, body_text, video_url) VALUES 
    ('lc-sec-2', 'les-sec-2', 'In this video lecture, explore how modern identity providers consume behavioral telemetry, device posture, and geolocation signals to dynamically recalculate session risk.', 'https://www.w3schools.com/html/mov_bbb.mp4')
  `);
  db.run(`INSERT INTO lesson_contents (id, lesson_id, body_text, pdf_url) VALUES 
    ('lc-sec-3', 'les-sec-3', 'Detailed technical blueprint outlining host-based firewall policies, Cilium eBPF network segmentation, and service-to-service mTLS.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')
  `);

  // Course 3 (Cloud Native) Modules & Lessons
  db.run(`INSERT INTO course_modules (id, course_id, title, description, order_index) VALUES 
    ('mod-cld-1', 'crs-cloud-301', 'Resilient Microservices Architecture', 'Design principles for stateless scale and automated self-healing.', 1),
    ('mod-cld-2', 'crs-cloud-301', 'Kubernetes Deployment Strategies & Service Mesh', 'Blue-green, canary releases, and Istio traffic splitting.', 2),
    ('mod-cld-3', 'crs-cloud-301', 'Production Chaos Engineering & Observability', 'Proactive fault injection and distributed tracing.', 3)
  `);

  db.run(`INSERT INTO lessons (id, module_id, title, lesson_type, duration_minutes, order_index, is_mandatory) VALUES 
    ('les-cld-1', 'mod-cld-1', 'Architectural Axioms for Cloud Resilience', 'TEXT', 20, 1, 1),
    ('les-cld-2', 'mod-cld-1', 'Graceful Degradation and Circuit Breaking', 'VIDEO', 25, 2, 1),
    ('les-cld-3', 'mod-cld-2', 'Zero-Downtime Canary Rollouts with Argo Rollouts', 'TEXT', 30, 1, 1),
    ('les-cld-4', 'mod-cld-2', 'Kubernetes Architecture Mastery Quiz', 'QUIZ', 20, 2, 1),
    ('les-cld-5', 'mod-cld-3', 'Hands-on Assignment: Chaos Injection Plan', 'ASSIGNMENT', 45, 1, 1)
  `);

  db.run(`INSERT INTO lesson_contents (id, lesson_id, body_text) VALUES 
    ('lc-cld-1', 'les-cld-1', '### 1. The Reality of Distributed Systems\\n\\nIn distributed cloud infrastructure, failure is not an exceptional circumstance—it is the baseline expectation. Networks partition, nodes degrade, and downstream dependencies suffer from sudden latency spikes.\\n\\n#### Three Core Resilience Axioms:\\n1. **Blast Radius Containment:** Ensure failure in one domain cannot cascade across cluster boundaries.\\n2. **Stateless Workload Tiering:** Offload session state to distributed caches and transactional databases.\\n3. **Idempotent Operations:** Design every API mutation to be safely retryable.'),
    ('lc-cld-3', 'les-cld-3', '### Progressive Canary Delivery\\n\\nLearn how progressive traffic shifting reduces production release risk by automatically rolling back when error rates exceed SLI thresholds.')
  `);
  db.run(`INSERT INTO lesson_contents (id, lesson_id, body_text, video_url) VALUES 
    ('lc-cld-2', 'les-cld-2', 'Video breakdown of Netflix Hystrix/Resilience4j circuit breaking algorithms and exponential backoff retry jitter.', 'https://www.w3schools.com/html/mov_bbb.mp4')
  `);

  // Course 4 (Compliance) Modules & Lessons
  db.run(`INSERT INTO course_modules (id, course_id, title, description, order_index) VALUES 
    ('mod-cmp-1', 'crs-comp-401', 'Data Privacy, Security & AI Governance', 'Complying with global regulatory mandates and ethical AI principles.', 1)
  `);
  db.run(`INSERT INTO lessons (id, module_id, title, lesson_type, duration_minutes, order_index, is_mandatory) VALUES 
    ('les-cmp-1', 'mod-cmp-1', 'Global Regulatory Governance Guidelines', 'TEXT', 20, 1, 1),
    ('les-cmp-2', 'mod-cmp-1', 'Mandatory Annual Compliance Assessment', 'QUIZ', 30, 2, 1)
  `);
  db.run(`INSERT INTO lesson_contents (id, lesson_id, body_text) VALUES 
    ('lc-cmp-1', 'les-cmp-1', '### Enterprise Compliance & Ethics Handbook\\n\\nEvery employee is required to uphold zero tolerance for bribery, strict adherence to customer data minimization under GDPR/CCPA, and transparent reporting through official whistleblower mechanisms.')
  `);

  // Course 5 (AI) Modules & Lessons
  db.run(`INSERT INTO course_modules (id, course_id, title, description, order_index) VALUES 
    ('mod-ai-1', 'crs-ai-501', 'LLM Foundations & Enterprise Context', 'Architectural foundations of transformers and token economics.', 1),
    ('mod-ai-2', 'crs-ai-501', 'Retrieval-Augmented Generation (RAG) Architecture', 'Vector databases, hybrid search, and semantic embeddings.', 2)
  `);
  db.run(`INSERT INTO lessons (id, module_id, title, lesson_type, duration_minutes, order_index, is_mandatory) VALUES 
    ('les-ai-1', 'mod-ai-1', 'Executive Primer: Generative AI in the Enterprise', 'TEXT', 25, 1, 1),
    ('les-ai-2', 'mod-ai-2', 'Enterprise RAG Implementation Patterns', 'TEXT', 35, 1, 1),
    ('les-ai-3', 'mod-ai-2', 'GenAI Knowledge Check Quiz', 'QUIZ', 20, 2, 1)
  `);
  db.run(`INSERT INTO lesson_contents (id, lesson_id, body_text) VALUES 
    ('lc-ai-1', 'les-ai-1', '### Generative AI Operational Foundations\\n\\nUnderstand how generative reasoning transforms customer service, internal code development, and predictive intelligence with high data governance.'),
    ('lc-ai-2', 'les-ai-2', '### Building Production-Grade RAG Systems\\n\\nStep-by-step architecture for chunking, vector indexing with cosine similarity, and hallucination reduction prompts.')
  `);

  console.log('✓ Course modules and lessons seeded');

  // 10. Quizzes & Questions
  db.run("DELETE FROM quizzes;");
  db.run("DELETE FROM quiz_questions;");
  db.run("DELETE FROM quiz_options;");

  // Quiz for Security Course (les-sec-4)
  db.run(`INSERT INTO quizzes (id, lesson_id, course_id, title, description, passing_score, time_limit_minutes) VALUES 
    ('qz-sec-1', 'les-sec-4', 'crs-sec-101', 'Zero Trust Enterprise Security Certification Exam', 'Comprehensive assessment evaluating core principles of microsegmentation and identity boundary verification.', 80, 20),
    ('qz-cld-1', 'les-cld-4', 'crs-cloud-301', 'Kubernetes Architecture & Resilience Exam', 'Test your knowledge on canary deployments, circuit breaking, and distributed disaster recovery.', 80, 20),
    ('qz-cmp-1', 'les-cmp-2', 'crs-comp-401', 'Annual Mandatory Compliance & Ethics Examination', 'Required test for annual regulatory compliance. Passing score: 85%.', 85, 25),
    ('qz-ai-1', 'les-ai-3', 'crs-ai-501', 'Enterprise Generative AI & RAG Knowledge Check', 'Evaluate your understanding of prompt chaining, embeddings, and vector indexing.', 80, 15)
  `);

  // Questions for Security Quiz
  db.run(`INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, explanation, order_index) VALUES 
    ('qq-sec-1', 'qz-sec-1', 'What is the primary operational assumption of a Zero Trust Architecture (ZTA)?', 'SINGLE_CHOICE', 10, 'Zero trust explicitly assumes breach and continually validates every access request.', 1),
    ('qq-sec-2', 'qz-sec-1', 'Which of the following techniques prevent lateral adversary movement within an enterprise VPC? (Select all that apply)', 'MULTIPLE_CHOICE', 15, 'Microsegmentation and mutual TLS (mTLS) both isolate workloads and encrypt east-west traffic.', 2),
    ('qq-sec-3', 'qz-sec-1', 'True or False: In a modern Zero Trust model, an authenticated device posture check is performed only once per calendar year.', 'TRUE_FALSE', 10, 'False. Zero Trust requires continuous or real-time context-based verification upon each session and elevation.', 3),
    ('qq-sec-4', 'qz-sec-1', 'Scenario: An engineer requests temporary root access to a production database cluster during a critical Sev-1 incident. What is the recommended Zero Trust access workflow?', 'SCENARIO', 20, 'Just-in-Time (JIT) privileged access with peer sign-off, time-bound session duration, and full keystroke audit logging.', 4)
  `);

  // Options for qq-sec-1
  db.run(`INSERT INTO quiz_options (id, question_id, option_text, is_correct, order_index) VALUES 
    ('qo-1', 'qq-sec-1', 'Trust internal corporate VPN connections while blocking public internet endpoints.', 0, 1),
    ('qo-2', 'qq-sec-1', 'Assume breach: never trust, always verify every entity, transaction, and workload.', 1, 2),
    ('qo-3', 'qq-sec-1', 'Rely exclusively on perimeter border firewalls.', 0, 3),
    ('qo-4', 'qq-sec-1', 'Authorize users solely based on valid static credentials.', 0, 4)
  `);

  // Options for qq-sec-2
  db.run(`INSERT INTO quiz_options (id, question_id, option_text, is_correct, order_index) VALUES 
    ('qo-5', 'qq-sec-2', 'Fine-grained network microsegmentation policies', 1, 1),
    ('qo-6', 'qq-sec-2', 'Service-to-service Mutual TLS (mTLS) encryption', 1, 2),
    ('qo-7', 'qq-sec-2', 'Opening wide subnet CIDR blocks for faster routing', 0, 3),
    ('qo-8', 'qq-sec-2', 'Host-level container security profiles (e.g. AppArmor/SELinux)', 1, 4)
  `);

  // Options for qq-sec-3
  db.run(`INSERT INTO quiz_options (id, question_id, option_text, is_correct, order_index) VALUES 
    ('qo-9', 'qq-sec-3', 'True', 0, 1),
    ('qo-10', 'qq-sec-3', 'False', 1, 2)
  `);

  // Options for qq-sec-4
  db.run(`INSERT INTO quiz_options (id, question_id, option_text, is_correct, order_index) VALUES 
    ('qo-11', 'qq-sec-4', 'Grant permanent root credentials to avoid incident delay.', 0, 1),
    ('qo-12', 'qq-sec-4', 'Issue a Just-In-Time (JIT) time-bound privileged session with dual authorization and complete session recording.', 1, 2),
    ('qo-13', 'qq-sec-4', 'Require the engineer to email the IT helpdesk for a next-day ticket approval.', 0, 3)
  `);

  // Questions for Cloud Native Quiz
  db.run(`INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, explanation, order_index) VALUES 
    ('qq-cld-1', 'qz-cld-1', 'In a canary deployment, what metric is typically monitored to trigger an automated rollback?', 'SINGLE_CHOICE', 10, 'Spikes in HTTP 5xx error rates or p99 latency degradation trigger automated canary rollbacks.', 1),
    ('qq-cld-2', 'qz-cld-1', 'True or False: Circuit breakers prevent an overwhelmed downstream microservice from causing cascading thread pool exhaustion in upstream services.', 'TRUE_FALSE', 10, 'True. Circuit breakers fail fast when error rates exceed safe thresholds.', 2)
  `);

  db.run(`INSERT INTO quiz_options (id, question_id, option_text, is_correct, order_index) VALUES 
    ('qo-14', 'qq-cld-1', 'HTTP 5xx error rate and p99 latency threshold violations', 1, 1),
    ('qo-15', 'qq-cld-1', 'Total disk space utilization on master nodes', 0, 2),
    ('qo-16', 'qq-cld-1', 'Number of completed git commits in the repo', 0, 3),
    ('qo-17', 'qq-cld-2', 'True', 1, 1),
    ('qo-18', 'qq-cld-2', 'False', 0, 2)
  `);

  // Questions for Compliance Quiz
  db.run(`INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, explanation, order_index) VALUES 
    ('qq-cmp-1', 'qz-cmp-1', 'Under GDPR and enterprise data governance, what is the principle of data minimization?', 'SINGLE_CHOICE', 10, 'Organizations must only collect and process personal data that is strictly necessary for specified purposes.', 1),
    ('qq-cmp-2', 'qz-cmp-1', 'What should an employee do upon observing potential anti-competitive or bribery behavior?', 'SINGLE_CHOICE', 10, 'Report immediately via the confidential corporate compliance hotline or legal counsel.', 2)
  `);

  db.run(`INSERT INTO quiz_options (id, question_id, option_text, is_correct, order_index) VALUES 
    ('qo-19', 'qq-cmp-1', 'Collect as much user data as possible for future unspecified AI training.', 0, 1),
    ('qo-20', 'qq-cmp-1', 'Limit data collection and retention to only what is strictly necessary for specified legitimate objectives.', 1, 2),
    ('qo-21', 'qq-cmp-2', 'Ignore the incident if it involves senior executive staff.', 0, 1),
    ('qo-22', 'qq-cmp-2', 'Promptly report the matter via the confidential whistleblower ethics channel or directly to Corporate Compliance.', 1, 2)
  `);

  console.log('✓ Quizzes and assessment questions seeded');

  // 11. Assignments
  db.run("DELETE FROM assignments;");
  db.run("DELETE FROM assignment_submissions;");
  db.run(`INSERT INTO assignments (id, lesson_id, title, instructions, rubric_json, max_points) VALUES 
    ('asg-cld-1', 'les-cld-5', 'Enterprise Chaos Engineering Experiment Design', 
     'Submit a structured 2-page Chaos Engineering experiment document for a critical payment gateway service. Define hypothesis, blast radius boundaries, rollback conditions, and observability metrics.', 
     '[{"criterion": "Hypothesis Clarity", "points": 25}, {"criterion": "Blast Radius & Safety Limits", "points": 35}, {"criterion": "Observability & Metric Rigor", "points": 25}, {"criterion": "Actionable Rollback Procedure", "points": 15}]', 
     100)
  `);

  db.run(`INSERT INTO assignment_submissions (id, assignment_id, user_id, submission_text, status, grade, feedback, graded_by, submitted_at, graded_at) VALUES 
    ('sub-cld-1', 'asg-cld-1', 'usr-learner', 
     '### Payment Gateway Chaos Experiment: Latency Injection\\n\\n**Hypothesis:** If downstream tokenization latency increases by 500ms, the payment proxy will gracefully degrade by falling back to asynchronous queued settlement without dropping customer cart sessions.\\n\\n**Blast Radius:** 5% of synthetic test traffic in staging environment.\\n\\n**Rollback Trigger:** Error rate > 0.5% or timeout queue depth > 500 items.', 
     'GRADED', 96, 'Exceptional hypothesis formulation and thorough rollback criteria. Well aligned with enterprise resilience standards.', 'usr-creator', datetime('now', '-3 days'), datetime('now', '-1 days')),
    ('sub-cld-2', 'asg-cld-1', 'usr-member-1', 
     '### Kubernetes Pod Eviction Chaos Experiment\\n\\nTesting node drain behavior while pod disruption budgets (PDB) are enforced.', 
     'SUBMITTED', NULL, NULL, NULL, datetime('now', '-5 hours'), NULL)
  `);
  console.log('✓ Assignments and submissions seeded');

  // 12. Learning Paths
  db.run("DELETE FROM learning_paths;");
  db.run("DELETE FROM learning_path_courses;");
  db.run(`INSERT INTO learning_paths (id, org_id, title, slug, description, target_role, duration_hours, thumbnail_url, is_sequential) VALUES 
    ('lp-tech-exec', 'org-acme', 'Executive Technology Leadership & Architecture', 'executive-tech-leadership', 'Comprehensive certification track for senior engineering leads advancing to Principal Architect and Director roles.', 'Senior Architect / Lead', 18, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80', 1),
    ('lp-sec-mastery', 'org-acme', 'Enterprise Security & Compliance Mastery', 'enterprise-security-mastery', 'Essential curriculum for infrastructure teams covering Zero Trust, vulnerability governance, and data privacy.', 'Security Engineer', 12, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80', 1),
    ('lp-ai-ops', 'org-acme', 'Applied Enterprise AI Engineering & Ops', 'applied-ai-engineering', 'From prompt engineering and RAG pipelines to autonomous agents and production LLMOps.', 'AI / ML Engineer', 15, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', 0)
  `);

  db.run(`INSERT INTO learning_path_courses (path_id, course_id, order_index, is_required) VALUES 
    ('lp-tech-exec', 'crs-cloud-301', 1, 1),
    ('lp-tech-exec', 'crs-sec-101', 2, 1),
    ('lp-tech-exec', 'crs-strat-201', 3, 1),
    ('lp-sec-mastery', 'crs-sec-101', 1, 1),
    ('lp-sec-mastery', 'crs-comp-401', 2, 1),
    ('lp-ai-ops', 'crs-ai-501', 1, 1),
    ('lp-ai-ops', 'crs-cloud-301', 2, 0)
  `);
  console.log('✓ Learning paths seeded');

  // 13. Enrollments & Learner Progress
  db.run("DELETE FROM enrollments;");
  db.run("DELETE FROM lesson_progress;");

  // Elena Rostova's enrollments
  db.run(`INSERT INTO enrollments (id, user_id, course_id, org_id, status, progress_percent, started_at, completed_at, last_accessed_at, due_date) VALUES 
    ('enr-elena-cld', 'usr-learner', 'crs-cloud-301', 'org-acme', 'IN_PROGRESS', 68, datetime('now', '-10 days'), NULL, datetime('now', '-2 hours'), datetime('now', '+14 days')),
    ('enr-elena-sec', 'usr-learner', 'crs-sec-101', 'org-acme', 'COMPLETED', 100, datetime('now', '-20 days'), datetime('now', '-2 days'), datetime('now', '-2 days'), NULL),
    ('enr-elena-cmp', 'usr-learner', 'crs-comp-401', 'org-acme', 'OVERDUE', 35, datetime('now', '-40 days'), NULL, datetime('now', '-12 days'), datetime('now', '-3 days')),
    ('enr-elena-ai', 'usr-learner', 'crs-ai-501', 'org-acme', 'IN_PROGRESS', 40, datetime('now', '-5 days'), NULL, datetime('now', '-1 days'), datetime('now', '+20 days'))
  `);

  // Alexandre Dubois enrollments
  db.run(`INSERT INTO enrollments (id, user_id, course_id, org_id, status, progress_percent, started_at, completed_at, last_accessed_at, due_date) VALUES 
    ('enr-alex-cld', 'usr-member-1', 'crs-cloud-301', 'org-acme', 'IN_PROGRESS', 45, datetime('now', '-7 days'), NULL, datetime('now', '-6 hours'), datetime('now', '+10 days')),
    ('enr-alex-cmp', 'usr-member-1', 'crs-comp-401', 'org-acme', 'COMPLETED', 100, datetime('now', '-15 days'), datetime('now', '-5 days'), datetime('now', '-5 days'), NULL)
  `);

  // Priya Sharma enrollments
  db.run(`INSERT INTO enrollments (id, user_id, course_id, org_id, status, progress_percent, started_at, completed_at, last_accessed_at, due_date) VALUES 
    ('enr-priya-sec', 'usr-member-2', 'crs-sec-101', 'org-acme', 'IN_PROGRESS', 85, datetime('now', '-12 days'), NULL, datetime('now', '-1 hours'), datetime('now', '+5 days')),
    ('enr-priya-cmp', 'usr-member-2', 'crs-comp-401', 'org-acme', 'OVERDUE', 10, datetime('now', '-30 days'), NULL, datetime('now', '-15 days'), datetime('now', '-4 days'))
  `);

  // Lesson progress for Elena on crs-cloud-301
  db.run(`INSERT INTO lesson_progress (id, user_id, lesson_id, enrollment_id, status, time_spent_seconds, completed_at) VALUES 
    ('lp-1', 'usr-learner', 'les-cld-1', 'enr-elena-cld', 'COMPLETED', 1200, datetime('now', '-9 days')),
    ('lp-2', 'usr-learner', 'les-cld-2', 'enr-elena-cld', 'COMPLETED', 1500, datetime('now', '-8 days')),
    ('lp-3', 'usr-learner', 'les-cld-3', 'enr-elena-cld', 'COMPLETED', 1800, datetime('now', '-5 days')),
    ('lp-4', 'usr-learner', 'les-cld-4', 'enr-elena-cld', 'IN_PROGRESS', 600, NULL)
  `);

  // Lesson progress for Elena on crs-sec-101 (Completed)
  db.run(`INSERT INTO lesson_progress (id, user_id, lesson_id, enrollment_id, status, time_spent_seconds, completed_at) VALUES 
    ('lp-5', 'usr-learner', 'les-sec-1', 'enr-elena-sec', 'COMPLETED', 1900, datetime('now', '-5 days')),
    ('lp-6', 'usr-learner', 'les-sec-2', 'enr-elena-sec', 'COMPLETED', 1200, datetime('now', '-4 days')),
    ('lp-7', 'usr-learner', 'les-sec-3', 'enr-elena-sec', 'COMPLETED', 1500, datetime('now', '-3 days')),
    ('lp-8', 'usr-learner', 'les-sec-4', 'enr-elena-sec', 'COMPLETED', 1400, datetime('now', '-2 days'))
  `);

  // Quiz attempt for Elena
  db.run("DELETE FROM quiz_attempts;");
  db.run(`INSERT INTO quiz_attempts (id, quiz_id, user_id, score, max_score, percentage, passed, time_taken_seconds) VALUES 
    ('qa-elena-sec', 'qz-sec-1', 'usr-learner', 55, 55, 100, 1, 640)
  `);

  console.log('✓ Enrollments and lesson progress seeded');

  // 14. Certificates
  db.run("DELETE FROM certificates;");
  db.run(`INSERT INTO certificates (id, certificate_number, user_id, course_id, org_id, issue_date, expiry_date, verification_code, metadata_json) VALUES 
    ('cert-elena-sec', 'CERT-STRATA-2026-9842', 'usr-learner', 'crs-sec-101', 'org-acme', date('now', '-2 days'), date('now', '+728 days'), 'STRATA-SEC-VERIFY-9842', '{"grade": "A+", "score": 100, "instructor": "David Chen", "orgName": "Acme Global Technologies"}'),
    ('cert-alex-cmp', 'CERT-STRATA-2026-9721', 'usr-member-1', 'crs-comp-401', 'org-acme', date('now', '-5 days'), date('now', '+360 days'), 'STRATA-CMP-VERIFY-9721', '{"grade": "A", "score": 92, "instructor": "Sarah Jenkins", "orgName": "Acme Global Technologies"}')
  `);

  // Update enrollment with certificate ID
  db.run("UPDATE enrollments SET certificate_id = 'cert-elena-sec' WHERE id = 'enr-elena-sec'");
  console.log('✓ Certificates seeded with verifiable codes');

  // 15. Skills Matrix
  db.run("DELETE FROM skills;");
  db.run("DELETE FROM user_skills;");
  db.run("DELETE FROM course_skills;");

  const skills = [
    { id: 'sk-1', name: 'Zero Trust Architecture', category: 'Security', description: 'Network microsegmentation and identity boundary verification' },
    { id: 'sk-2', name: 'Kubernetes & Container Orchestration', category: 'Cloud Engineering', description: 'Production cluster management, ingress, and pod disruption policies' },
    { id: 'sk-3', name: 'Cloud Security Posture (CSPM)', category: 'Security', description: 'Infrastructure-as-code security scanning and runtime policy auditing' },
    { id: 'sk-4', name: 'Generative AI & LLM Integration', category: 'Artificial Intelligence', description: 'Prompt chaining, vector embeddings, and RAG pipelines' },
    { id: 'sk-5', name: 'High-Performing Team Leadership', category: 'Leadership', description: 'Coaching, executive decision making, and psychological safety' },
    { id: 'sk-6', name: 'Regulatory Data Privacy (GDPR/CCPA)', category: 'Compliance', description: 'Data minimization, sovereign compliance, and breach management' },
    { id: 'sk-7', name: 'Chaos Engineering & SRE', category: 'Cloud Engineering', description: 'Fault injection, error budgets, and latency resiliency testing' },
    { id: 'sk-8', name: 'Product-Led Growth Telemetry', category: 'Product', description: 'User cohort analysis, activation funnels, and feature adoption' }
  ];

  for (const s of skills) {
    db.run("INSERT INTO skills (id, name, category, description) VALUES (?, ?, ?, ?)", [s.id, s.name, s.category, s.description]);
  }

  // Learner skills for Elena Rostova (showing skills and gaps against Senior Architect profile)
  const elenaSkills = [
    { user_id: 'usr-learner', skill_id: 'sk-1', current: 5, target: 5 }, // Master
    { user_id: 'usr-learner', skill_id: 'sk-2', current: 4, target: 5 }, // Gap: 1
    { user_id: 'usr-learner', skill_id: 'sk-3', current: 4, target: 4 },
    { user_id: 'usr-learner', skill_id: 'sk-4', current: 2, target: 4 }, // Gap: 2
    { user_id: 'usr-learner', skill_id: 'sk-5', current: 2, target: 4 }, // Gap: 2
    { user_id: 'usr-learner', skill_id: 'sk-6', current: 3, target: 3 },
    { user_id: 'usr-learner', skill_id: 'sk-7', current: 3, target: 4 }  // Gap: 1
  ];

  for (const es of elenaSkills) {
    db.run("INSERT INTO user_skills (user_id, skill_id, current_level, target_level) VALUES (?, ?, ?, ?)", [es.user_id, es.skill_id, es.current, es.target]);
  }

  // Course skills mappings
  db.run(`INSERT INTO course_skills (course_id, skill_id, points_awarded) VALUES 
    ('crs-sec-101', 'sk-1', 2),
    ('crs-sec-101', 'sk-3', 2),
    ('crs-cloud-301', 'sk-2', 3),
    ('crs-cloud-301', 'sk-7', 2),
    ('crs-strat-201', 'sk-5', 3),
    ('crs-comp-401', 'sk-6', 2),
    ('crs-ai-501', 'sk-4', 3)
  `);
  console.log('✓ Skills matrix and learner skill gaps seeded');

  // 16. Gamification
  db.run("DELETE FROM badges;");
  db.run("DELETE FROM user_badges;");
  db.run("DELETE FROM gamification_profiles;");

  const badges = [
    { id: 'bdg-first', name: 'First Milestone', description: 'Completed your first enterprise course', icon: 'Award', category: 'Milestone' },
    { id: 'bdg-sec', name: 'Zero Trust Defender', description: 'Aced the Zero Trust Architecture exam with 100%', icon: 'ShieldCheck', category: 'Specialty' },
    { id: 'bdg-streak', name: '7-Day Streak', description: 'Maintained active daily learning for 7 consecutive days', icon: 'Flame', category: 'Engagement' },
    { id: 'bdg-speed', name: 'Speed Scholar', description: 'Finished a course 48 hours ahead of target due date', icon: 'Zap', category: 'Excellence' },
    { id: 'bdg-collab', name: 'Peer Contributor', description: 'Received instructor honors on an engineering assignment', icon: 'Users', category: 'Collaboration' }
  ];

  for (const b of badges) {
    db.run("INSERT INTO badges (id, name, description, icon, category) VALUES (?, ?, ?, ?, ?)", [b.id, b.name, b.description, b.icon, b.category]);
  }

  // Elena's badges
  db.run(`INSERT INTO user_badges (user_id, badge_id) VALUES 
    ('usr-learner', 'bdg-first'),
    ('usr-learner', 'bdg-sec'),
    ('usr-learner', 'bdg-streak'),
    ('usr-learner', 'bdg-collab')
  `);

  // Gamification profiles
  db.run(`INSERT INTO gamification_profiles (user_id, points, streak_days, last_streak_date, rank_title) VALUES 
    ('usr-learner', 2450, 12, date('now'), 'Cloud Sentinel'),
    ('usr-member-1', 1820, 5, date('now'), 'Senior Practitioner'),
    ('usr-member-2', 1540, 8, date('now'), 'Infrastructure Specialist'),
    ('usr-member-3', 950, 3, date('now'), 'Apprentice Engineer')
  `);
  console.log('✓ Gamification profiles and badges seeded');

  // 17. Communication & Notifications & Announcements
  db.run("DELETE FROM notifications;");
  db.run("DELETE FROM announcements;");

  db.run(`INSERT INTO notifications (id, user_id, org_id, title, message, type, is_read, action_url) VALUES 
    ('notif-1', 'usr-learner', 'org-acme', 'Mandatory Compliance Approaching Due Date', 'Global Compliance, Anti-Corruption & Data Ethics 2026 is due in 3 days.', 'DEADLINE', 0, '/learning/crs-comp-401'),
    ('notif-2', 'usr-learner', 'org-acme', 'Assignment Graded: Chaos Engineering', 'David Chen graded your assignment submission with 96/100.', 'SUCCESS', 0, '/learning/crs-cloud-301'),
    ('notif-3', 'usr-learner', 'org-acme', 'Certificate Ready: Zero Trust Architecture', 'Your verifiable certificate CERT-STRATA-2026-9842 has been issued.', 'INFO', 1, '/certificates'),
    ('notif-4', 'usr-admin', 'org-acme', 'Team Compliance Milestone', 'Cloud Infrastructure & Security reached 85% completion across Q3 mandatory courses.', 'SUCCESS', 0, '/admin')
  `);

  db.run(`INSERT INTO announcements (id, org_id, title, content, author_id, priority) VALUES 
    ('ann-1', 'org-acme', 'Launch of AI Learning Experience Platform (Strata LXP)', 'Welcome to the unified Strata LXP platform. You now have access to intelligent role-based courses, interactive SCORM simulations, and personalized skill development.', 'usr-admin', 'HIGH'),
    ('ann-2', 'org-acme', 'Q3 Mandatory Compliance Deadline Approaching', 'All enterprise personnel must complete the Global Compliance & Ethics certification by end of month to satisfy annual ISO/SOC-2 requirements.', 'usr-admin', 'URGENT')
  `);
  console.log('✓ Notifications and enterprise announcements seeded');

  // 18. Audit Logs
  db.run("DELETE FROM audit_logs;");
  db.run(`INSERT INTO audit_logs (id, org_id, user_id, action, entity_type, entity_id, details_json) VALUES 
    ('log-1', 'org-acme', 'usr-superadmin', 'ORGANIZATION_CONFIG_UPDATE', 'ORGANIZATION', 'org-acme', '{"field":"brand_color","old":"#2563eb","new":"#1e40af"}'),
    ('log-2', 'org-acme', 'usr-admin', 'USER_ROLE_ASSIGNMENT', 'USER', 'usr-learner', '{"role":"LEARNER","department":"Cloud Infrastructure & Security"}'),
    ('log-3', 'org-acme', 'usr-creator', 'COURSE_PUBLISHED', 'COURSE', 'crs-sec-101', '{"title":"Enterprise Information Security & Zero Trust Architecture","readiness_score":95}'),
    ('log-4', 'org-acme', 'usr-creator', 'ASSIGNMENT_GRADED', 'ASSIGNMENT', 'asg-cld-1', '{"student":"usr-learner","grade":96,"max_points":100}'),
    ('log-5', 'org-acme', 'usr-admin', 'COMPLIANCE_REMINDER_BROADCAST', 'TEAM', 'team-cloud-sec', '{"overdueCount":2,"action":"EMAIL_NOTIFY"}')
  `);
  console.log('✓ Audit logs seeded');

  // 19. AI Course Generation History
  db.run("DELETE FROM ai_generation_jobs;");
  db.run(`INSERT INTO ai_generation_jobs (id, org_id, user_id, prompt, status, blueprint_json, course_id, readiness_score, audit_report_json) VALUES 
    ('job-ai-1', 'org-acme', 'usr-creator', 'Create a production-grade course on Generative AI in Enterprise Workflows covering LLMs, prompt chaining, vector embeddings, and RAG architectures.', 'COMPLETED', 
     '{"title":"Generative AI in Enterprise Workflows & Operations","audience":"Senior Engineers & Product Leaders","difficulty":"Intermediate","durationHours":4.5,"modules":[{"title":"LLM Foundations & Enterprise Context","lessonCount":2},{"title":"Retrieval-Augmented Generation (RAG) Architecture","lessonCount":3}]}', 
     'crs-ai-501', 92, 
     '{"instructionalDesign": 95, "objectiveAlignment": 92, "clarity": 90, "engagement": 94, "accessibility": 88, "overallScore": 92, "recommendations": ["Expand interactive case studies in Module 2", "Include token rate-limiting scenario"]}')
  `);
  console.log('✓ AI Course Creator history seeded');

  saveDatabaseToDisk(db);
  console.log('--- Strata LXP Database Seed Completed Successfully ---');
}

// Run if called directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runSeed().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

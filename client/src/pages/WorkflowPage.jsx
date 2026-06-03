import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/* ────────────────────────────────────────────────────────────
 *  WORKFLOW DATA
 * ──────────────────────────────────────────────────────────── */
const PHASES = [
  {
    id: 1, title: 'Onboarding & Registration', icon: '🔑', color: '#3b82f6',
    status: 'REGISTRATION_PENDING',
    description: 'Scholar creates their account, completes the academic profile, and submits their thesis registration for HOD approval.',
    steps: [
      { actor: 'Student', action: 'Creates account on Signup page', page: 'Signup', notify: null },
      { actor: 'Student', action: 'Logs in — Profile Onboarding Modal appears if profile incomplete', page: 'Login → Dashboard', notify: null },
      { actor: 'Student', action: 'Fills General Info, Qualifications, Preferred Guide, Thesis Details in Profile tab', page: 'Student Dashboard → Profile', notify: null },
      { actor: 'Student', action: 'Clicks "Save Profile" to persist all academic details', page: 'Student Dashboard → Profile', notify: null },
      { actor: 'Student', action: 'Clicks "Submit for HOD Approval" in Overview tab', page: 'Student Dashboard → Overview', notify: { to: 'HOD (dept)', title: '⏳ New Scholar Profile Verification', type: 'PENDING_ACTION', page: 'Registration tab' } },
    ]
  },
  {
    id: 2, title: 'Registration Verification', icon: '📋', color: '#f59e0b',
    status: 'COURSEWORK',
    description: 'The Head of Department reviews the scholar\'s submitted profile and verifies their enrollment to advance them into the Coursework phase.',
    steps: [
      { actor: 'HOD', action: 'Reviews scholar profile details on Registration tab', page: 'Admin Dashboard → Registration', notify: null },
      { actor: 'HOD', action: 'Clicks "Verify Enrollment" — thesis moves to COURSEWORK', page: 'Admin Dashboard → Registration', notify: { to: 'Student', title: '🎉 Enrollment Verified!', type: 'SUCCESSFUL_ACTION', page: 'Overview tab' } },
      { actor: 'HOD', action: 'Assigns a Faculty Supervisor to the scholar', page: 'Admin Dashboard → Registration', notify: { to: 'Student + Faculty', title: '👨‍🏫 Supervisor Allocated / 📚 Assigned as Supervisor', type: 'SUCCESSFUL_ACTION', page: 'Overview tab' } },
    ]
  },
  {
    id: 3, title: 'Coursework Phase', icon: '📚', color: '#8b5cf6',
    status: 'SYNOPSIS_PENDING',
    description: 'The scholar completes mandatory coursework requirements. The supervisor or HOD clears them, auto-creating the Synopsis milestone.',
    steps: [
      { actor: 'Student', action: 'Completes all doctoral coursework requirements (offline)', page: 'Offline / University', notify: null },
      { actor: 'Supervisor / HOD', action: 'Clears coursework — thesis advances to SYNOPSIS_PENDING', page: 'Admin Dashboard / Faculty Dashboard', notify: { to: 'Student', title: '📚 Coursework Cleared!', type: 'SUCCESSFUL_ACTION', page: 'Overview tab' } },
      { actor: 'System', action: 'Auto-creates SYNOPSIS milestone (seq: 1)', page: 'Automatic', notify: null },
    ]
  },
  {
    id: 4, title: 'Synopsis & DRC Approval', icon: '📝', color: '#06b6d4',
    status: 'ACTIVE_RESEARCH',
    description: 'Scholar uploads their research synopsis document. After supervisor review, the HOD schedules a DRC (Departmental Research Committee) meeting to evaluate and approve the synopsis.',
    steps: [
      { actor: 'Student', action: 'Uploads synopsis document + plagiarism report in Thesis tab', page: 'Student Dashboard → Thesis', notify: { to: 'Supervisor', title: '⏳ Milestone Review Pending', type: 'PENDING_ACTION', page: 'Overview tab' } },
      { actor: 'Supervisor', action: 'Reviews synopsis — Approves or Requests Revision', page: 'Faculty Dashboard → Milestone Review', notify: { to: 'Student', title: '🎉 Approved / ⚠️ Revision Required', type: 'SUCCESSFUL_ACTION / PENDING_ACTION', page: 'Overview tab' } },
      { actor: 'HOD', action: 'Schedules DRC meeting for synopsis approval (date, time, venue)', page: 'Admin Dashboard → DRC', notify: { to: 'Student', title: '📆 DRC Scheduled!', type: 'INFO', page: 'Overview tab' } },
      { actor: 'DRC Panel', action: 'Evaluates synopsis — Approved or Revision Required', page: 'Admin Dashboard → DRC', notify: { to: 'Student', title: '🎉 DRC Approved! / ⚠️ Revision Required', type: 'SUCCESSFUL_ACTION / PENDING_ACTION', page: 'Overview tab' } },
      { actor: 'System', action: 'On DRC approval: thesis → ACTIVE_RESEARCH, 6-Month Report #1 auto-created', page: 'Automatic', notify: null },
    ]
  },
  {
    id: 5, title: 'Active Research', icon: '🔬', color: '#10b981',
    status: 'PRE_SUBMISSION',
    description: 'The core research phase. Every 6 months a progress report milestone is auto-generated. Scholars also submit publications and attend RAC reviews. Prerequisites must be met before advancing.',
    steps: [
      { actor: 'System', action: 'Auto-creates 6-Month Progress Report milestones every semester', page: 'Automatic', notify: null },
      { actor: 'Student', action: 'Uploads 6-month progress report document for each semester', page: 'Student Dashboard → Thesis', notify: { to: 'Supervisor', title: '⏳ Milestone Review Pending', type: 'PENDING_ACTION', page: 'Overview tab' } },
      { actor: 'Supervisor', action: 'Reviews and grades each progress report', page: 'Faculty Dashboard → Milestone Review', notify: { to: 'Student', title: '🎉 Approved / ⚠️ Revision Required', type: 'SUCCESSFUL_ACTION / PENDING_ACTION', page: 'Overview tab' } },
      { actor: 'Student', action: 'Submits research publications (Journals, Conferences, Patents)', page: 'Student Dashboard → Research Outputs', notify: null },
      { actor: 'Supervisor / HOD', action: 'Verifies publications — marks VERIFIED or REJECTED', page: 'Faculty/Admin Dashboard → Publications', notify: null },
      { actor: 'HOD', action: 'Schedules and conducts RAC reviews (RAC-1, RAC-2, etc.)', page: 'Admin Dashboard → RAC', notify: null },
      { actor: 'System', action: 'When 36+ months passed + all reports approved + 2 journals + 2 conferences verified → PRE_SUBMISSION milestone unlocked', page: 'Automatic', notify: null },
    ]
  },
  {
    id: 6, title: 'Pre-Submission & Seminar', icon: '📤', color: '#f97316',
    status: 'SUBMITTED',
    description: 'Scholar uploads their rough thesis draft and plagiarism clearance. The HOD schedules a pre-submission seminar defense. After clearance, the final submission milestone is created.',
    steps: [
      { actor: 'Student', action: 'Uploads pre-submission thesis draft + plagiarism clearance package', page: 'Student Dashboard → Thesis', notify: { to: 'Supervisor', title: '⏳ Milestone Review Pending', type: 'PENDING_ACTION', page: 'Overview tab' } },
      { actor: 'HOD', action: 'Schedules pre-submission seminar defense (date, time, venue, panel)', page: 'Admin Dashboard → Pre-Submission', notify: { to: 'Student', title: '📆 Seminar Scheduled!', type: 'PENDING_ACTION', page: 'Overview tab' } },
      { actor: 'HOD', action: 'Clears seminar defense (requires 2 verified journals + 2 verified conferences)', page: 'Admin Dashboard → Pre-Submission', notify: { to: 'Student', title: '🎯 Seminar Cleared!', type: 'SUCCESSFUL_ACTION', page: 'Overview tab' } },
      { actor: 'System', action: 'Auto-creates FINAL_SUBMISSION milestone (seq: 100)', page: 'Automatic', notify: null },
      { actor: 'Student', action: 'Uploads final thesis package for supervisor sign-off', page: 'Student Dashboard → Thesis', notify: { to: 'Supervisor', title: '⏳ Milestone Review Pending', type: 'PENDING_ACTION', page: 'Overview tab' } },
      { actor: 'Supervisor', action: 'Provides final digital sign-off → thesis status → SUBMITTED', page: 'Faculty Dashboard', notify: { to: 'Student', title: '🚀 Final Sign-off!', type: 'SUCCESSFUL_ACTION', page: 'Overview tab' } },
    ]
  },
  {
    id: 7, title: 'Evaluation & Degree Award', icon: '🎓', color: '#ef4444',
    status: 'AWARDED',
    description: 'The thesis is dispatched to external examiners. After favorable reports, a Viva-Voce defense is scheduled. A successful viva leads to the PhD degree being officially awarded.',
    steps: [
      { actor: 'HOD', action: 'Logs dispatch to external examiners (date, method, tracking number)', page: 'Admin Dashboard → Final', notify: { to: 'Student', title: '📬 Thesis Dispatched', type: 'SUCCESSFUL_ACTION', page: 'Overview tab' } },
      { actor: 'HOD', action: 'Schedules Viva-Voce defense (date, time, venue, panel members)', page: 'Admin Dashboard → Final', notify: { to: 'Student', title: '📅 Viva-Voce Scheduled!', type: 'SUCCESSFUL_ACTION', page: 'Overview tab' } },
      { actor: 'Viva Panel', action: 'Conducts Viva-Voce examination (offline)', page: 'University', notify: null },
      { actor: 'HOD', action: 'Records Viva outcome — SUCCESSFUL or UNSUCCESSFUL', page: 'Admin Dashboard → Final', notify: { to: 'Student', title: '🎉 Successful! / ⚠️ Revisions', type: 'SUCCESSFUL_ACTION / PENDING_ACTION', page: 'Overview tab' } },
      { actor: 'HOD', action: 'Awards PhD degree (only after successful viva)', page: 'Admin Dashboard → Final', notify: { to: 'Student', title: '🎓 PhD Degree Awarded!', type: 'SUCCESSFUL_ACTION', page: 'Overview tab' } },
    ]
  },
];

const PARALLEL_WORKFLOWS = [
  {
    id: 'publications', title: 'Research Publications', icon: '📄', color: '#a855f7',
    description: 'Scholars submit journal papers, conference presentations, and patents. Supervisors/HOD verify them. Required: 2 verified journals + 2 verified conferences before pre-submission clearance.',
    flow: ['Student submits publication', 'Status: PENDING', 'Supervisor/HOD reviews', 'VERIFIED or REJECTED']
  },
  {
    id: 'rac', title: 'RAC Reviews', icon: '🏛️', color: '#14b8a6',
    description: 'The Research Advisory Committee conducts periodic evaluations of the scholar\'s progress. HOD schedules RAC meetings, student uploads reports, and the committee marks Satisfactory/Unsatisfactory.',
    flow: ['HOD schedules RAC', 'Student uploads report', 'Committee evaluates', 'SATISFACTORY / UNSATISFACTORY']
  },
  {
    id: 'meetings', title: 'Guidance Meetings', icon: '📅', color: '#f43f5e',
    description: 'Students request guidance meetings with their supervisor. HOD must approve. Once approved, all invited faculty are notified.',
    flow: ['Student requests meeting', '🔔 HOD notified', 'HOD approves/rejects', '🔔 Student + Attendees notified']
  },
  {
    id: 'changes', title: 'Academic Change Requests', icon: '🔄', color: '#eab308',
    description: 'Scholars can request a change of thesis title or research guide. Requests go through HOD review. If approved, the thesis record is updated automatically.',
    flow: ['Student submits request', 'Type: Title/Guide Change', 'HOD reviews', 'APPROVED → Auto-update / REJECTED']
  },
  {
    id: 'vault', title: 'Document Vault', icon: '📂', color: '#64748b',
    description: 'Students upload additional documents (certificates, reports, letters) and forward them to their supervisor or HOD for review and remarks.',
    flow: ['Student uploads document', 'Forwards to Supervisor/HOD', '🔔 Recipient notified', 'Recipient reviews + remarks']
  },
  {
    id: 'transfer', title: 'Scholar Transfer', icon: '🔀', color: '#f97316',
    description: 'HOD can transfer a scholar\'s supervision to another faculty within the same department. Admin can execute global cross-department transfers.',
    flow: ['HOD/Admin initiates', 'Select target supervisor', 'Thesis updated', '🔔 All parties notified']
  },
];

const ROLES = [
  { role: 'Student', color: '#3b82f6', icon: '🎓', actions: ['Create account', 'Fill profile', 'Submit thesis', 'Upload milestones', 'Submit publications', 'Request meetings', 'Request changes', 'Upload vault docs', 'Download certificates'] },
  { role: 'Supervisor', color: '#8b5cf6', icon: '👨‍🏫', actions: ['Review milestones', 'Approve/Reject submissions', 'Verify publications', 'Clear coursework', 'Transfer scholars', 'Final digital sign-off'] },
  { role: 'HOD', color: '#10b981', icon: '🏛️', actions: ['Verify enrollment', 'Assign supervisors', 'Clear coursework', 'Schedule DRC/RAC', 'Approve meetings', 'Clear seminars', 'Dispatch thesis', 'Schedule viva', 'Record viva', 'Award degree', 'Force advancement', 'Manage dept users'] },
  { role: 'Admin', color: '#f59e0b', icon: '⚙️', actions: ['View all theses', 'Manage defaulters', 'Global transfers', 'Cross-dept operations'] },
  { role: 'Super Admin', color: '#ef4444', icon: '👑', actions: ['Create/Delete users', 'Manage departments', 'System seed/clear', 'Full access'] },
];

const NOTIFICATIONS_TABLE = [
  { trigger: 'Student submits for approval', from: 'Student', to: 'HOD (dept)', title: '⏳ New Scholar Profile Verification', type: 'PENDING_ACTION', tab: 'Registration' },
  { trigger: 'HOD verifies enrollment', from: 'HOD', to: 'Student', title: '🎉 Enrollment Verified!', type: 'SUCCESSFUL', tab: 'Overview' },
  { trigger: 'HOD assigns supervisor', from: 'HOD', to: 'Student', title: '👨‍🏫 Supervisor Allocated', type: 'SUCCESSFUL', tab: 'Overview' },
  { trigger: 'HOD assigns supervisor', from: 'HOD', to: 'Faculty', title: '📚 Assigned as Supervisor', type: 'SUCCESSFUL', tab: 'Overview' },
  { trigger: 'Coursework cleared', from: 'HOD/Faculty', to: 'Student', title: '📚 Coursework Cleared!', type: 'SUCCESSFUL', tab: 'Overview' },
  { trigger: 'Student uploads milestone', from: 'Student', to: 'Supervisor', title: '⏳ Milestone Review Pending', type: 'PENDING_ACTION', tab: 'Overview' },
  { trigger: 'Supervisor approves milestone', from: 'Faculty', to: 'Student', title: '🎉 Milestone Approved!', type: 'SUCCESSFUL', tab: 'Overview' },
  { trigger: 'Supervisor requests revision', from: 'Faculty', to: 'Student', title: '⚠️ Revision Required', type: 'PENDING_ACTION', tab: 'Overview' },
  { trigger: 'HOD schedules DRC', from: 'HOD', to: 'Student', title: '📆 DRC Scheduled!', type: 'INFO', tab: 'Overview' },
  { trigger: 'DRC approves synopsis', from: 'HOD', to: 'Student', title: '🎉 DRC Approved!', type: 'SUCCESSFUL', tab: 'Overview' },
  { trigger: 'HOD schedules seminar', from: 'HOD', to: 'Student', title: '📆 Seminar Scheduled!', type: 'PENDING_ACTION', tab: 'Overview' },
  { trigger: 'HOD clears seminar', from: 'HOD', to: 'Student', title: '🎯 Seminar Cleared!', type: 'SUCCESSFUL', tab: 'Overview' },
  { trigger: 'Supervisor final sign-off', from: 'Faculty', to: 'Student', title: '🚀 Final Sign-off!', type: 'SUCCESSFUL', tab: 'Overview' },
  { trigger: 'HOD dispatches thesis', from: 'HOD', to: 'Student', title: '📬 Thesis Dispatched', type: 'SUCCESSFUL', tab: 'Overview' },
  { trigger: 'HOD schedules viva', from: 'HOD', to: 'Student', title: '📅 Viva Scheduled!', type: 'SUCCESSFUL', tab: 'Overview' },
  { trigger: 'Viva successful', from: 'HOD', to: 'Student', title: '🎉 Viva Successful!', type: 'SUCCESSFUL', tab: 'Overview' },
  { trigger: 'Degree awarded', from: 'HOD', to: 'Student', title: '🎓 PhD Degree Awarded!', type: 'SUCCESSFUL', tab: 'Overview' },
  { trigger: 'Meeting requested', from: 'Student', to: 'HOD', title: '⏳ Meeting Approval Pending', type: 'PENDING_ACTION', tab: 'Meetings' },
  { trigger: 'Meeting approved', from: 'HOD', to: 'Student + Attendees', title: '✅ Meeting Approved / 📅 Invite', type: 'SUCCESSFUL + INFO', tab: 'Meetings' },
  { trigger: 'Document uploaded', from: 'Student', to: 'Forwarded recipient', title: '⏳ New Document Uploaded', type: 'PENDING_ACTION', tab: 'Documents' },
  { trigger: 'Document reviewed', from: 'Faculty/HOD', to: 'Student', title: '📋 Document Reviewed', type: 'SUCCESSFUL', tab: 'Documents' },
  { trigger: 'Scholar transferred', from: 'HOD/Admin', to: 'Student + New/Old Supervisor', title: '🔄 Transfer Executed', type: 'SYSTEM_ALERT', tab: 'Overview' },
];

const STATUS_FLOW = [
  { label: 'REGISTRATION_PENDING', color: '#f59e0b', by: 'Student submits' },
  { label: 'COURSEWORK', color: '#8b5cf6', by: 'HOD verifies' },
  { label: 'SYNOPSIS_PENDING', color: '#06b6d4', by: 'Coursework cleared' },
  { label: 'ACTIVE_RESEARCH', color: '#10b981', by: 'DRC approves' },
  { label: 'PRE_SUBMISSION', color: '#f97316', by: 'Seminar cleared' },
  { label: 'SUBMITTED', color: '#3b82f6', by: 'Supervisor signs off' },
  { label: 'AWARDED', color: '#ef4444', by: 'Degree awarded' },
];

/* ────────────────────────────────────────────────────────────
 *  PARTICLE BACKGROUND
 * ──────────────────────────────────────────────────────────── */
const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${p.opacity})`;
        ctx.fill();
        // Draw lines between close particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
};

/* ────────────────────────────────────────────────────────────
 *  SCROLL OBSERVER HOOK
 * ──────────────────────────────────────────────────────────── */
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [isVisible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, isVisible];
};

/* ────────────────────────────────────────────────────────────
 *  SECTION COMPONENTS
 * ──────────────────────────────────────────────────────────── */

const HeroSection = () => {
  const [ref, vis] = useInView(0.1);
  return (
    <section ref={ref} className={`wf-hero ${vis ? 'wf-visible' : ''}`}>
      <div className="wf-hero-badge">ScholarSync Hub</div>
      <h1 className="wf-hero-title">
        <span className="wf-hero-gradient">PhD Lifecycle</span>
        <br />Workflow Documentation
      </h1>
      <p className="wf-hero-subtitle">
        A comprehensive, interactive visualization of every role, action, notification, and milestone across the entire doctoral journey — from registration to degree award.
      </p>
      <div className="wf-hero-stats">
        <div className="wf-stat"><span className="wf-stat-num">7</span><span className="wf-stat-label">Phases</span></div>
        <div className="wf-stat"><span className="wf-stat-num">5</span><span className="wf-stat-label">Roles</span></div>
        <div className="wf-stat"><span className="wf-stat-num">22+</span><span className="wf-stat-label">Notifications</span></div>
        <div className="wf-stat"><span className="wf-stat-num">6</span><span className="wf-stat-label">Parallel Flows</span></div>
      </div>
      <div className="wf-scroll-cue">
        <span>Scroll to explore</span>
        <div className="wf-scroll-arrow">↓</div>
      </div>
    </section>
  );
};

const StatusPipeline = () => {
  const [ref, vis] = useInView(0.1);
  return (
    <section ref={ref} className={`wf-section ${vis ? 'wf-visible' : ''}`}>
      <h2 className="wf-section-title">Thesis Status Pipeline</h2>
      <p className="wf-section-desc">The thesis record progresses through 7 sequential statuses. Each transition is triggered by a specific role action.</p>
      <div className="wf-pipeline">
        {STATUS_FLOW.map((s, i) => (
          <React.Fragment key={s.label}>
            <div className="wf-pipeline-node" style={{ '--node-color': s.color, '--delay': `${i * 0.12}s` }}>
              <div className="wf-pipeline-dot" />
              <div className="wf-pipeline-label">{s.label.replace(/_/g, ' ')}</div>
              <div className="wf-pipeline-by">{s.by}</div>
            </div>
            {i < STATUS_FLOW.length - 1 && <div className="wf-pipeline-arrow" style={{ '--delay': `${i * 0.12 + 0.06}s` }}>→</div>}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

const PhaseCard = ({ phase, index }) => {
  const [open, setOpen] = useState(false);
  const [ref, vis] = useInView(0.1);

  return (
    <div ref={ref} className={`wf-phase-card ${vis ? 'wf-visible' : ''} ${open ? 'wf-phase-open' : ''}`}
      style={{ '--phase-color': phase.color, '--delay': `${index * 0.08}s` }}>
      <div className="wf-phase-header" onClick={() => setOpen(!open)}>
        <div className="wf-phase-number">{String(phase.id).padStart(2, '0')}</div>
        <div className="wf-phase-icon">{phase.icon}</div>
        <div className="wf-phase-info">
          <h3 className="wf-phase-title">{phase.title}</h3>
          <p className="wf-phase-desc">{phase.description}</p>
        </div>
        <div className="wf-phase-status-badge" style={{ background: phase.color + '22', color: phase.color }}>
          → {phase.status.replace(/_/g, ' ')}
        </div>
        <div className={`wf-phase-chevron ${open ? 'wf-phase-chevron-open' : ''}`}>▾</div>
      </div>
      <div className={`wf-phase-steps ${open ? 'wf-phase-steps-open' : ''}`}>
        <div className="wf-steps-inner">
          {phase.steps.map((step, si) => (
            <div key={si} className="wf-step" style={{ '--step-delay': `${si * 0.06}s` }}>
              <div className="wf-step-connector">
                <div className="wf-step-dot" style={{ background: phase.color }} />
                {si < phase.steps.length - 1 && <div className="wf-step-line" style={{ background: phase.color + '33' }} />}
              </div>
              <div className="wf-step-content">
                <div className="wf-step-actor-row">
                  <span className="wf-step-actor" style={{ background: phase.color + '22', color: phase.color }}>{step.actor}</span>
                  <span className="wf-step-page">📍 {step.page}</span>
                </div>
                <p className="wf-step-action">{step.action}</p>
                {step.notify && (
                  <div className="wf-step-notify">
                    <div className="wf-notify-pulse" />
                    <div className="wf-notify-content">
                      <span className="wf-notify-label">🔔 Notification →</span>
                      <span className="wf-notify-to">{step.notify.to}</span>
                      <span className="wf-notify-title">{step.notify.title}</span>
                      <span className="wf-notify-type" data-type={step.notify.type.includes('PENDING') ? 'pending' : step.notify.type.includes('SUCCESSFUL') ? 'success' : 'info'}>{step.notify.type}</span>
                      <span className="wf-notify-page">→ {step.notify.page}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PhaseTimeline = () => {
  const [ref, vis] = useInView(0.05);
  return (
    <section ref={ref} className={`wf-section ${vis ? 'wf-visible' : ''}`}>
      <h2 className="wf-section-title">Lifecycle Phases — Detailed Breakdown</h2>
      <p className="wf-section-desc">Click each phase to expand the complete step-by-step workflow with actors, actions, notification triggers, and destination pages.</p>
      <div className="wf-phases">
        {PHASES.map((p, i) => <PhaseCard key={p.id} phase={p} index={i} />)}
      </div>
    </section>
  );
};

const ParallelFlows = () => {
  const [active, setActive] = useState(null);
  const [ref, vis] = useInView(0.1);
  return (
    <section ref={ref} className={`wf-section ${vis ? 'wf-visible' : ''}`}>
      <h2 className="wf-section-title">Parallel Workflows</h2>
      <p className="wf-section-desc">These workflows run alongside the main thesis pipeline and can be initiated at any time during the active phases.</p>
      <div className="wf-parallel-grid">
        {PARALLEL_WORKFLOWS.map((pw, i) => (
          <div key={pw.id}
            className={`wf-parallel-card ${active === pw.id ? 'wf-parallel-active' : ''}`}
            style={{ '--pw-color': pw.color, '--delay': `${i * 0.1}s` }}
            onClick={() => setActive(active === pw.id ? null : pw.id)}
          >
            <div className="wf-parallel-icon">{pw.icon}</div>
            <h4 className="wf-parallel-title">{pw.title}</h4>
            <p className="wf-parallel-desc">{pw.description}</p>
            <div className={`wf-parallel-flow ${active === pw.id ? 'wf-parallel-flow-open' : ''}`}>
              {pw.flow.map((f, fi) => (
                <React.Fragment key={fi}>
                  <div className="wf-flow-node" style={{ '--fdelay': `${fi * 0.1}s` }}>
                    <div className="wf-flow-dot" style={{ background: pw.color }} />
                    <span>{f}</span>
                  </div>
                  {fi < pw.flow.length - 1 && <div className="wf-flow-connector-h" style={{ background: pw.color + '44' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const RoleMatrix = () => {
  const [activeRole, setActiveRole] = useState(0);
  const [ref, vis] = useInView(0.1);
  return (
    <section ref={ref} className={`wf-section ${vis ? 'wf-visible' : ''}`}>
      <h2 className="wf-section-title">Role Responsibilities</h2>
      <p className="wf-section-desc">Select a role to view their complete set of actions and capabilities within the portal.</p>
      <div className="wf-role-tabs">
        {ROLES.map((r, i) => (
          <button key={r.role} className={`wf-role-tab ${activeRole === i ? 'wf-role-tab-active' : ''}`}
            style={{ '--role-color': r.color }}
            onClick={() => setActiveRole(i)}>
            <span className="wf-role-tab-icon">{r.icon}</span>
            <span>{r.role}</span>
          </button>
        ))}
      </div>
      <div className="wf-role-detail" style={{ '--role-color': ROLES[activeRole].color }}>
        <div className="wf-role-detail-header">
          <span className="wf-role-big-icon">{ROLES[activeRole].icon}</span>
          <h3>{ROLES[activeRole].role}</h3>
        </div>
        <div className="wf-role-actions">
          {ROLES[activeRole].actions.map((a, i) => (
            <div key={a} className="wf-role-action-chip" style={{ '--achip-delay': `${i * 0.05}s` }}>
              <span className="wf-action-bullet" style={{ background: ROLES[activeRole].color }} />
              {a}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const NotificationExplorer = () => {
  const [filter, setFilter] = useState('ALL');
  const [ref, vis] = useInView(0.1);
  const filtered = filter === 'ALL' ? NOTIFICATIONS_TABLE : NOTIFICATIONS_TABLE.filter(n => n.type.includes(filter));
  return (
    <section ref={ref} className={`wf-section ${vis ? 'wf-visible' : ''}`}>
      <h2 className="wf-section-title">Notification Routing Explorer</h2>
      <p className="wf-section-desc">Every system notification — who triggers it, who receives it, and which dashboard tab it links to.</p>
      <div className="wf-notif-filters">
        {['ALL', 'PENDING_ACTION', 'SUCCESSFUL', 'INFO', 'SYSTEM_ALERT'].map(f => (
          <button key={f} className={`wf-notif-filter ${filter === f ? 'wf-notif-filter-active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'ALL' ? '🔔 All' : f === 'PENDING_ACTION' ? '⏳ Pending' : f === 'SUCCESSFUL' ? '✅ Success' : f === 'INFO' ? 'ℹ️ Info' : '⚠️ System'}
          </button>
        ))}
      </div>
      <div className="wf-notif-table-wrap">
        <table className="wf-notif-table">
          <thead>
            <tr>
              <th>Trigger Action</th>
              <th>From</th>
              <th>To</th>
              <th>Notification</th>
              <th>Type</th>
              <th>Dashboard Tab</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((n, i) => (
              <tr key={i} className="wf-notif-row" style={{ '--row-delay': `${i * 0.03}s` }}>
                <td className="wf-notif-trigger">{n.trigger}</td>
                <td><span className="wf-notif-badge wf-notif-from">{n.from}</span></td>
                <td><span className="wf-notif-badge wf-notif-to">{n.to}</span></td>
                <td className="wf-notif-title-cell">{n.title}</td>
                <td><span className={`wf-notif-type-badge ${n.type.includes('PENDING') ? 'wf-type-pending' : n.type.includes('SUCCESSFUL') ? 'wf-type-success' : n.type.includes('INFO') ? 'wf-type-info' : 'wf-type-system'}`}>{n.type.split(' ')[0]}</span></td>
                <td><span className="wf-notif-tab-badge">{n.tab}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const MilestoneAutoGen = () => {
  const [ref, vis] = useInView(0.1);
  const milestones = [
    { type: 'SYNOPSIS', seq: 1, trigger: 'Coursework cleared', icon: '📝' },
    { type: '6_MONTH_REPORT', seq: 'N', trigger: 'Every 6 months in Active Research', icon: '📊' },
    { type: 'PRE_SUBMISSION', seq: 99, trigger: '36+ months + all reports approved + 2J + 2C verified', icon: '📤' },
    { type: 'FINAL_SUBMISSION', seq: 100, trigger: 'Seminar cleared by HOD', icon: '📦' },
  ];
  return (
    <section ref={ref} className={`wf-section ${vis ? 'wf-visible' : ''}`}>
      <h2 className="wf-section-title">Milestone Auto-Generation</h2>
      <p className="wf-section-desc">The system automatically creates milestone checkpoints at key lifecycle transitions. Scholars upload documents against these milestones for supervisor review.</p>
      <div className="wf-milestone-grid">
        {milestones.map((m, i) => (
          <div key={m.type} className="wf-milestone-card" style={{ '--ms-color': PHASES[Math.min(i + 2, 6)].color, '--delay': `${i * 0.12}s` }}>
            <div className="wf-ms-icon">{m.icon}</div>
            <div className="wf-ms-type">{m.type.replace(/_/g, ' ')}</div>
            <div className="wf-ms-seq">Sequence: {m.seq}</div>
            <div className="wf-ms-trigger">
              <span className="wf-ms-trigger-label">Trigger:</span>
              {m.trigger}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ────────────────────────────────────────────────────────────
 *  MAIN PAGE
 * ──────────────────────────────────────────────────────────── */
const WorkflowPage = () => {
  const navigate = useNavigate();

  return (
    <div className="wf-page">
      <ParticleCanvas />

      {/* Floating nav */}
      <nav className="wf-nav">
        <button className="wf-nav-back" onClick={() => navigate('/')}>← Back to Portal</button>
        <span className="wf-nav-title">ScholarSync Workflow</span>
      </nav>

      <HeroSection />
      <StatusPipeline />
      <PhaseTimeline />
      <ParallelFlows />
      <RoleMatrix />
      <MilestoneAutoGen />
      <NotificationExplorer />

      {/* Footer */}
      <footer className="wf-footer">
        <p>ScholarSync Hub — PhD Lifecycle Management Portal</p>
        <p style={{ opacity: 0.5, fontSize: '0.75rem', marginTop: 4 }}>Himachal Pradesh University, Shimla</p>
      </footer>

      <style>{workflowCSS}</style>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────
 *  STYLES (inline for self-contained component)
 * ──────────────────────────────────────────────────────────── */
const workflowCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.wf-page {
  background: #07080c;
  color: #e2e8f0;
  font-family: 'Inter', -apple-system, sans-serif;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* ── NAV ── */
.wf-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; gap: 16px;
  padding: 14px 28px;
  background: rgba(7, 8, 12, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.wf-nav-back {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  color: #94a3b8; border-radius: 10px; padding: 8px 18px; cursor: pointer;
  font-size: 0.8rem; font-weight: 600; transition: all 0.2s;
}
.wf-nav-back:hover { background: rgba(255,255,255,0.12); color: #fff; }
.wf-nav-title { font-size: 0.85rem; font-weight: 700; color: #64748b; letter-spacing: 0.5px; }

/* ── HERO ── */
.wf-hero {
  min-height: 100vh; display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; padding: 120px 24px 60px; position: relative; z-index: 1;
  opacity: 0; transform: translateY(40px); transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
.wf-hero.wf-visible { opacity: 1; transform: translateY(0); }

.wf-hero-badge {
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 4px;
  color: #34d399; background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2);
  padding: 8px 24px; border-radius: 100px; margin-bottom: 32px;
}
.wf-hero-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; line-height: 1.1; margin-bottom: 24px;
  color: #ffffff; letter-spacing: -2px;
}
.wf-hero-gradient {
  background: linear-gradient(135deg, #34d399 0%, #3b82f6 50%, #a855f7 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.wf-hero-subtitle {
  max-width: 640px; font-size: 1.05rem; color: #94a3b8; line-height: 1.7; font-weight: 400; margin-bottom: 48px;
}
.wf-hero-stats {
  display: flex; gap: 32px; flex-wrap: wrap; justify-content: center;
}
.wf-stat {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; padding: 20px 28px; min-width: 100px;
  transition: all 0.3s; cursor: default;
}
.wf-stat:hover { background: rgba(255,255,255,0.08); transform: translateY(-4px); border-color: rgba(52,211,153,0.3); }
.wf-stat-num { font-size: 2rem; font-weight: 900; color: #34d399; }
.wf-stat-label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }

.wf-scroll-cue {
  position: absolute; bottom: 40px; display: flex; flex-direction: column; align-items: center; gap: 6px;
  color: #475569; font-size: 0.75rem; font-weight: 600; letter-spacing: 1px;
}
.wf-scroll-arrow {
  animation: wfBounce 2s infinite; font-size: 1.2rem;
}
@keyframes wfBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }

/* ── SECTIONS ── */
.wf-section {
  padding: 80px 24px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 1;
  opacity: 0; transform: translateY(50px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.wf-section.wf-visible { opacity: 1; transform: translateY(0); }

.wf-section-title {
  font-size: clamp(1.5rem, 3vw, 2.2rem); font-weight: 900; color: #fff; margin-bottom: 12px;
  letter-spacing: -0.5px;
}
.wf-section-desc {
  font-size: 0.95rem; color: #64748b; max-width: 700px; line-height: 1.7; margin-bottom: 40px;
}

/* ── STATUS PIPELINE ── */
.wf-pipeline {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: center;
  padding: 28px 0;
}
.wf-pipeline-node {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  opacity: 0; animation: wfFadeUp 0.5s forwards; animation-delay: var(--delay);
}
.wf-visible .wf-pipeline-node { opacity: 0; animation: wfFadeUp 0.5s forwards; animation-delay: var(--delay); }
.wf-pipeline-dot {
  width: 18px; height: 18px; border-radius: 50%; background: var(--node-color);
  box-shadow: 0 0 20px var(--node-color), 0 0 40px color-mix(in srgb, var(--node-color) 30%, transparent);
  animation: wfGlow 2s infinite alternate;
}
@keyframes wfGlow { from { box-shadow: 0 0 12px var(--node-color); } to { box-shadow: 0 0 24px var(--node-color), 0 0 48px color-mix(in srgb, var(--node-color) 20%, transparent); } }
.wf-pipeline-label {
  font-size: 0.65rem; font-weight: 800; color: var(--node-color); text-transform: uppercase;
  letter-spacing: 0.5px; text-align: center; max-width: 110px;
}
.wf-pipeline-by { font-size: 0.6rem; color: #475569; text-align: center; max-width: 110px; }
.wf-pipeline-arrow {
  font-size: 1.4rem; color: #334155; margin: 0 2px; opacity: 0;
  animation: wfFadeIn 0.3s forwards; animation-delay: var(--delay);
}
@keyframes wfFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes wfFadeIn { from { opacity: 0; } to { opacity: 1; } }

/* ── PHASE CARDS ── */
.wf-phases { display: flex; flex-direction: column; gap: 12px; }
.wf-phase-card {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px; overflow: hidden; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0; transform: translateX(-30px);
}
.wf-phase-card.wf-visible { opacity: 1; transform: translateX(0); transition-delay: var(--delay); }
.wf-phase-card:hover { border-color: var(--phase-color); box-shadow: 0 0 30px color-mix(in srgb, var(--phase-color) 8%, transparent); }
.wf-phase-card.wf-phase-open { border-color: var(--phase-color); background: rgba(255,255,255,0.03); }

.wf-phase-header {
  display: flex; align-items: center; gap: 16px; padding: 20px 24px; cursor: pointer;
  transition: background 0.2s;
}
.wf-phase-header:hover { background: rgba(255,255,255,0.02); }

.wf-phase-number { font-size: 0.7rem; font-weight: 900; color: var(--phase-color); opacity: 0.5; min-width: 24px; }
.wf-phase-icon { font-size: 1.6rem; flex-shrink: 0; }
.wf-phase-info { flex: 1; min-width: 0; }
.wf-phase-title { font-size: 1rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
.wf-phase-desc { font-size: 0.78rem; color: #64748b; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.wf-phase-open .wf-phase-desc { -webkit-line-clamp: unset; }

.wf-phase-status-badge {
  font-size: 0.6rem; font-weight: 800; padding: 6px 12px; border-radius: 8px;
  text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; flex-shrink: 0;
}

.wf-phase-chevron {
  font-size: 1.2rem; color: #475569; transition: transform 0.3s; flex-shrink: 0;
}
.wf-phase-chevron-open { transform: rotate(180deg); color: var(--phase-color); }

/* Steps */
.wf-phase-steps {
  max-height: 0; overflow: hidden; transition: max-height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.wf-phase-steps-open { max-height: 2000px; }
.wf-steps-inner { padding: 0 24px 24px 64px; }

.wf-step { display: flex; gap: 16px; }
.wf-step-connector { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; width: 20px; }
.wf-step-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
.wf-step-line { width: 2px; flex: 1; min-height: 16px; margin: 4px 0; }
.wf-step-content { flex: 1; padding-bottom: 20px; }
.wf-step-actor-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
.wf-step-actor {
  font-size: 0.68rem; font-weight: 800; padding: 3px 10px; border-radius: 6px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.wf-step-page { font-size: 0.68rem; color: #475569; }
.wf-step-action { font-size: 0.85rem; color: #cbd5e1; line-height: 1.6; }

.wf-step-notify {
  display: flex; align-items: flex-start; gap: 10px; margin-top: 10px;
  background: rgba(52,211,153,0.04); border: 1px solid rgba(52,211,153,0.1);
  border-radius: 10px; padding: 10px 14px; position: relative; overflow: hidden;
}
.wf-notify-pulse {
  width: 8px; height: 8px; border-radius: 50%; background: #34d399; flex-shrink: 0; margin-top: 4px;
  animation: wfPulse 2s infinite;
}
@keyframes wfPulse { 0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(52,211,153,0.4); } 50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(52,211,153,0); } }

.wf-notify-content { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.wf-notify-label { font-size: 0.68rem; font-weight: 700; color: #34d399; }
.wf-notify-to { font-size: 0.68rem; font-weight: 800; color: #fff; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px; }
.wf-notify-title { font-size: 0.72rem; color: #94a3b8; }
.wf-notify-type {
  font-size: 0.58rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.wf-notify-type[data-type="pending"] { background: rgba(245,158,11,0.15); color: #f59e0b; }
.wf-notify-type[data-type="success"] { background: rgba(52,211,153,0.15); color: #34d399; }
.wf-notify-type[data-type="info"] { background: rgba(59,130,246,0.15); color: #3b82f6; }
.wf-notify-page { font-size: 0.62rem; color: #475569; }

/* ── PARALLEL WORKFLOWS ── */
.wf-parallel-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
.wf-parallel-card {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px; padding: 24px; cursor: pointer; transition: all 0.4s;
  opacity: 0; animation: wfFadeUp 0.5s forwards; animation-delay: var(--delay);
}
.wf-parallel-card:hover { border-color: var(--pw-color); transform: translateY(-4px); box-shadow: 0 8px 30px color-mix(in srgb, var(--pw-color) 10%, transparent); }
.wf-parallel-active { border-color: var(--pw-color) !important; background: rgba(255,255,255,0.04); }
.wf-parallel-icon { font-size: 2rem; margin-bottom: 12px; }
.wf-parallel-title { font-size: 1rem; font-weight: 800; color: #fff; margin-bottom: 8px; }
.wf-parallel-desc { font-size: 0.78rem; color: #64748b; line-height: 1.6; margin-bottom: 16px; }

.wf-parallel-flow {
  max-height: 0; overflow: hidden; transition: max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding-top: 0;
}
.wf-parallel-flow-open { max-height: 200px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
.wf-flow-node {
  display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: #94a3b8; font-weight: 500;
  opacity: 0; animation: wfFadeIn 0.3s forwards; animation-delay: var(--fdelay);
}
.wf-parallel-flow-open .wf-flow-node { opacity: 0; animation: wfFadeIn 0.3s forwards; animation-delay: var(--fdelay); }
.wf-flow-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.wf-flow-connector-h { width: 20px; height: 2px; flex-shrink: 0; border-radius: 1px; }

/* ── ROLE MATRIX ── */
.wf-role-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
.wf-role-tab {
  display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02);
  color: #94a3b8; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.3s;
}
.wf-role-tab:hover { border-color: var(--role-color); color: #fff; }
.wf-role-tab-active { border-color: var(--role-color) !important; background: color-mix(in srgb, var(--role-color) 12%, transparent) !important; color: var(--role-color) !important; }
.wf-role-tab-icon { font-size: 1.1rem; }

.wf-role-detail {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px; padding: 28px; transition: all 0.3s; border-color: color-mix(in srgb, var(--role-color) 30%, transparent);
}
.wf-role-detail-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.wf-role-big-icon { font-size: 2.5rem; }
.wf-role-detail-header h3 { font-size: 1.3rem; font-weight: 900; color: #fff; }

.wf-role-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.wf-role-action-chip {
  display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
  font-size: 0.78rem; color: #cbd5e1; font-weight: 500; transition: all 0.2s;
  opacity: 0; animation: wfFadeUp 0.3s forwards; animation-delay: var(--achip-delay);
}
.wf-role-action-chip:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); }
.wf-action-bullet { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

/* ── MILESTONE AUTO-GEN ── */
.wf-milestone-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.wf-milestone-card {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px; padding: 24px; text-align: center; transition: all 0.4s;
  opacity: 0; animation: wfFadeUp 0.5s forwards; animation-delay: var(--delay);
}
.wf-milestone-card:hover { border-color: var(--ms-color); transform: translateY(-6px); box-shadow: 0 12px 40px color-mix(in srgb, var(--ms-color) 10%, transparent); }
.wf-ms-icon { font-size: 2.5rem; margin-bottom: 12px; }
.wf-ms-type { font-size: 0.85rem; font-weight: 800; color: var(--ms-color); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.wf-ms-seq { font-size: 0.7rem; color: #475569; margin-bottom: 12px; font-weight: 600; }
.wf-ms-trigger { font-size: 0.75rem; color: #94a3b8; line-height: 1.5; }
.wf-ms-trigger-label { font-weight: 700; color: #64748b; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 0.6rem; letter-spacing: 1px; }

/* ── NOTIFICATION TABLE ── */
.wf-notif-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
.wf-notif-filter {
  padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02); color: #94a3b8; font-size: 0.75rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.wf-notif-filter:hover { border-color: rgba(52,211,153,0.3); color: #fff; }
.wf-notif-filter-active { background: rgba(52,211,153,0.1) !important; border-color: rgba(52,211,153,0.3) !important; color: #34d399 !important; }

.wf-notif-table-wrap {
  overflow-x: auto; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
}
.wf-notif-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
.wf-notif-table thead { background: rgba(255,255,255,0.04); }
.wf-notif-table th {
  padding: 14px 16px; text-align: left; font-weight: 800; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.5px; font-size: 0.65rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.wf-notif-row {
  opacity: 0; animation: wfFadeIn 0.3s forwards; animation-delay: var(--row-delay);
  transition: background 0.2s;
}
.wf-notif-row:hover { background: rgba(255,255,255,0.03); }
.wf-notif-table td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); color: #cbd5e1; vertical-align: middle; }
.wf-notif-trigger { font-weight: 600; }
.wf-notif-badge {
  font-size: 0.65rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; white-space: nowrap;
}
.wf-notif-from { background: rgba(139,92,246,0.12); color: #a78bfa; }
.wf-notif-to { background: rgba(59,130,246,0.12); color: #60a5fa; }
.wf-notif-title-cell { font-size: 0.75rem; }
.wf-notif-type-badge {
  font-size: 0.58rem; font-weight: 800; padding: 3px 8px; border-radius: 5px;
  text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap;
}
.wf-type-pending { background: rgba(245,158,11,0.15); color: #fbbf24; }
.wf-type-success { background: rgba(52,211,153,0.15); color: #34d399; }
.wf-type-info { background: rgba(59,130,246,0.15); color: #60a5fa; }
.wf-type-system { background: rgba(239,68,68,0.15); color: #f87171; }
.wf-notif-tab-badge {
  font-size: 0.65rem; font-weight: 700; color: #94a3b8;
  background: rgba(255,255,255,0.06); padding: 3px 10px; border-radius: 6px;
}

/* ── FOOTER ── */
.wf-footer {
  text-align: center; padding: 60px 24px 40px; color: #334155;
  font-size: 0.8rem; font-weight: 600; position: relative; z-index: 1;
  border-top: 1px solid rgba(255,255,255,0.04);
}

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .wf-phase-header { flex-wrap: wrap; gap: 10px; }
  .wf-phase-status-badge { order: 5; }
  .wf-steps-inner { padding-left: 20px; }
  .wf-pipeline { gap: 4px; }
  .wf-pipeline-node { min-width: 80px; }
  .wf-parallel-grid { grid-template-columns: 1fr; }
  .wf-hero-stats { gap: 12px; }
  .wf-stat { padding: 14px 18px; }
  .wf-role-tabs { gap: 4px; }
  .wf-role-tab { padding: 8px 12px; font-size: 0.72rem; }
  .wf-notif-table { min-width: 800px; }
}
`;

export default WorkflowPage;

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Atom, 
  Cpu, 
  Dna, 
  FlaskConical, 
  Users, 
  FileText, 
  Coins, 
  Calendar, 
  ArrowRight, 
  Search, 
  Sparkles, 
  ChevronRight, 
  Award,
  BookOpen, 
  Mail, 
  Send 
} from 'lucide-react';

const GenericPage = ({ title, description }) => {
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // Collaboration form states
  const [collabForm, setCollabForm] = useState({ name: '', email: '', institution: '', project: '', details: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleCollabSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setCollabForm({ name: '', email: '', institution: '', project: '', details: '' });
    }, 4000);
  };

  // Mock Data for Research Labs
  const labsData = [
    {
      id: 1,
      name: "AI & Neural Systems Laboratory",
      department: "Department of Computer Science",
      lead: "Dr. Aarav Mehta",
      icon: Cpu,
      focus: "Deep Learning, Autonomous Agents, NLP",
      projects: ["Transformers in Medical Imaging", "Reinforcement Learning for Autonomous Drone Swarms"],
      status: "Actively Recruiting Scholars"
    },
    {
      id: 2,
      name: "Quantum Mechanics & Advanced Materials Lab",
      department: "Department of Physics",
      lead: "Dr. Sophia Lin",
      icon: Atom,
      focus: "Superconductors, Quantum Cryptography, Nanotubes",
      projects: ["High-Temp Superconductivity in Hydrides", "Quantum Cryptographic Protocol Validation"],
      status: "2 Research Slots Open"
    },
    {
      id: 3,
      name: "Bio-Informatics & Genomics Centre",
      department: "Department of Data Science and Artificial Intelligence",
      lead: "Dr. Elena Rostova",
      icon: Dna,
      focus: "Cancer Genome Sequencing, Neural Protein Folding",
      projects: ["AlphaFold Pipelines for Enzyme Optimization", "High-Throughput DNA Sequence Alignment"],
      status: "Collaborating with Biotech Inc."
    },
    {
      id: 4,
      name: "Chemical Kinetics & Environmental Synthesis Lab",
      department: "Department of Chemistry",
      lead: "Dr. Marcus Vance",
      icon: FlaskConical,
      focus: "Green Catalysts, Photochemistry, CO2 Capture",
      projects: ["Organocatalytic Hydrogen Generation", "Solar-Driven Polymeric CO2 Sequestration"],
      status: "Grant Funded by DST-SERB"
    }
  ];

  // Mock Data for Publications
  const publicationsData = [
    {
      id: 1,
      title: "Scalable Graph Attention Networks for Multi-Agent Pathfinding in Complex Grid Environments",
      authors: "Aarav Mehta, Rajesh Khanna, Student User",
      journal: "IEEE Transactions on Pattern Analysis and Machine Intelligence (PAMI)",
      year: "2026",
      category: "Computer Science",
      citations: 42,
      doi: "10.1109/TPAMI.2026.103948"
    },
    {
      id: 2,
      title: "Enhanced Photo-Electrochemical Efficiency in Perovskite Solar Cells via Novel Carbon-Dot Passivation",
      authors: "Marcus Vance, Priya Nair",
      journal: "Nature Materials",
      year: "2025",
      category: "Physical Sciences",
      citations: 118,
      doi: "10.1038/s41563-025-0914"
    },
    {
      id: 3,
      title: "Clinical NLP Transformers: A Comparative Study on Electronic Health Record Summarization Pipelines",
      authors: "Elena Rostova, David Wright",
      journal: "ACM Computing Surveys",
      year: "2026",
      category: "Data Science",
      citations: 19,
      doi: "10.1145/384910.2026"
    }
  ];

  // Mock Data for Funding
  const fundingData = [
    {
      id: 1,
      title: "DST-SERB Core Research Grant",
      agency: "Department of Science and Technology, Govt. of India",
      amount: "₹45,00,000",
      duration: "3 Years",
      scope: "Supports fundamental research in science, technology, and advanced AI frameworks.",
      status: "Applications Open"
    },
    {
      id: 2,
      title: "ScholarSync Corporate Innovation Fellowship",
      agency: "Kizen Tech Corp",
      amount: "₹8,00,000 / Year + Stipend",
      duration: "Ongoing",
      scope: "Awarded to elite scholars focusing on industrial automation and cloud-native database orchestration.",
      status: "Actively Reviewing"
    },
    {
      id: 3,
      title: "Global Green-Tech Council Research Grant",
      agency: "Global Green-Tech Alliance",
      amount: "$120,000",
      duration: "2 Years",
      scope: "Granted to breakthrough green chemistry, solar conversion, and environmental recycling concepts.",
      status: "Call Ends July 2026"
    }
  ];

  // Mock Data for Events
  const eventsData = [
    {
      id: 1,
      title: "Annual University Research Symposium & Doctoral Colloquium 2026",
      date: "June 12-14, 2026",
      time: "09:30 AM - 05:30 PM",
      location: "Auditorium & Virtual Stream",
      speaker: "Keynote: Dr. Andrew Ng (Co-Founder, Coursera & DeepLearning.AI)",
      type: "Conference"
    },
    {
      id: 2,
      title: "Hands-on Workshop: Scalable Machine Learning Pipelines with PyTorch & Ray",
      date: "June 28, 2026",
      time: "02:00 PM - 06:00 PM",
      location: "Data Science Lab-4",
      speaker: "Conducted by: Elena Rostova & Core AI Faculty",
      type: "Workshop"
    },
    {
      id: 3,
      title: "PhD Thesis Pre-Submission Defense: Autonomous Drone Trajectory Mapping",
      date: "July 05, 2026",
      time: "11:00 AM - 01:00 PM",
      location: "Seminar Hall C",
      speaker: "Scholar: Student User (Department of Computer Science)",
      type: "Defense Viva"
    }
  ];

  const handleCopyDOI = (doi, index) => {
    navigator.clipboard.writeText(doi);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Render Page Content based on Title
  const renderRichContent = () => {
    switch (title) {
      case "Research Labs":
        const filteredLabs = selectedDept === 'All' 
          ? labsData 
          : labsData.filter(lab => lab.department === selectedDept);
        return (
          <div>
            {/* Department Filters */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
              {['All', 'Department of Computer Science', 'Department of Physics', 'Department of Chemistry', 'Department of Data Science and Artificial Intelligence'].map(dept => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`btn-outline-small ${selectedDept === dept ? 'active' : ''}`}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '20px',
                    borderColor: selectedDept === dept ? '#133A26' : '#D1D5DB',
                    background: selectedDept === dept ? '#133A26' : 'rgba(255,255,255,0.6)',
                    color: selectedDept === dept ? 'white' : '#4B5563',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  {dept === 'All' ? 'All Departments' : dept.replace('Department of ', '')}
                </button>
              ))}
            </div>

            {/* Labs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {filteredLabs.map(lab => {
                const LabIcon = lab.icon;
                return (
                  <div key={lab.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(255, 255, 255, 0.4)', background: 'rgba(255, 255, 255, 0.85)', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ background: '#EAF4EE', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#133A26' }}>
                        <LabIcon size={26} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#133A26' }}>{lab.name}</h3>
                        <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{lab.department}</p>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                      <p style={{ fontSize: '0.85rem', color: '#374151', marginBottom: '8px' }}>
                        <strong>Lead Principal Investigator:</strong> {lab.lead}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#374151', marginBottom: '12px' }}>
                        <strong>Research Focus:</strong> {lab.focus}
                      </p>
                      
                      <strong style={{ fontSize: '0.8rem', color: '#133A26', display: 'block', marginBottom: '6px' }}>Active Projects:</strong>
                      <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: '#4B5563', lineHeight: '1.5' }}>
                        {lab.projects.map((proj, idx) => <li key={idx}>{proj}</li>)}
                      </ul>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                      <span style={{ fontSize: '0.72rem', background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>{lab.status}</span>
                      <button className="btn-outline-small" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>Inquire ➔</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "Publications":
        const filteredPubs = searchQuery 
          ? publicationsData.filter(pub => 
              pub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              pub.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
              pub.category.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : publicationsData;

        return (
          <div>
            {/* Search Bar */}
            <div style={{ position: 'relative', maxWidth: '480px', margin: '0 auto 32px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search publications by title, author, or keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '44px', borderRadius: '24px', background: 'white' }}
              />
              <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '15px' }} />
            </div>

            {/* Publications List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredPubs.map((pub, idx) => (
                <div key={pub.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(255, 255, 255, 0.85)', padding: '24px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', background: '#EAF4EE', color: '#133A26', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
                      {pub.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpen size={14} /> Citations: <strong>{pub.citations}</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', lineHeight: '1.4' }}>
                    {pub.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: '#4B5563' }}>
                    <strong>Authors:</strong> {pub.authors}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #E5E7EB', paddingTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                        <strong>Journal:</strong> {pub.journal} ({pub.year})
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>
                        DOI: {pub.doi} 
                        <button 
                          onClick={() => handleCopyDOI(pub.doi, idx)} 
                          style={{ background: 'none', border: 'none', color: '#133A26', cursor: 'pointer', paddingLeft: '6px', fontWeight: 600 }}
                        >
                          {copiedIndex === idx ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </p>
                    </div>
                    <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      📥 Download PDF
                    </button>
                  </div>
                </div>
              ))}
              {filteredPubs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>No publications found matching your search.</div>
              )}
            </div>
          </div>
        );

      case "Collaborate":
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            {/* Info & Opportunities */}
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#133A26', marginBottom: '16px' }}>Active Collaboration Calls</h2>
              <p style={{ color: '#4B5563', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '24px' }}>
                ScholarSync is built to nurture global academic-industry integrations. We actively seek joint doctoral guides, industry project sponsorships, and collaborative research initiatives.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#FFF3CD', borderLeft: '4px solid #D97706', padding: '16px', borderRadius: '8px' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#92400E', marginBottom: '4px' }}>🔴 Call for Industry Mentors: AI in Agriculture</h4>
                  <p style={{ fontSize: '0.8rem', color: '#78350F' }}>Department of Data Science is seeking domain partners to guide 3 Ph.D. scholars on crop disease detection frameworks.</p>
                </div>
                <div style={{ background: '#E0F2FE', borderLeft: '4px solid #2563EB', padding: '16px', borderRadius: '8px' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E40AF', marginBottom: '4px' }}>🔵 Inter-Dept Initiative: Physics & Chemistry Fusion</h4>
                  <p style={{ fontSize: '0.8rem', color: '#1E3A8A' }}>Joint grant proposal for high-energy battery substrates. Seeking specialized mathematical modelers.</p>
                </div>
              </div>
            </div>

            {/* Collaboration Request Form */}
            <div className="card" style={{ background: 'white', borderRadius: '16px', padding: '30px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#133A26', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} /> Partner Inquiry Form
              </h3>

              {formSubmitted ? (
                <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '20px', borderRadius: '8px', textAlign: 'center', margin: '20px 0' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>✨ Submission Received!</h4>
                  <p style={{ fontSize: '0.85rem' }}>Thank you for expressing interest. Our research board will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleCollabSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Your Name / Title</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      value={collabForm.name} 
                      onChange={e => setCollabForm({...collabForm, name: e.target.value})} 
                      style={{ fontSize: '0.85rem', padding: '10px 14px' }} 
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Email</label>
                      <input 
                        type="email" 
                        required 
                        className="form-input" 
                        value={collabForm.email} 
                        onChange={e => setCollabForm({...collabForm, email: e.target.value})} 
                        style={{ fontSize: '0.85rem', padding: '10px 14px' }} 
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Organization</label>
                      <input 
                        type="text" 
                        required 
                        className="form-input" 
                        value={collabForm.institution} 
                        onChange={e => setCollabForm({...collabForm, institution: e.target.value})} 
                        style={{ fontSize: '0.85rem', padding: '10px 14px' }} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Focus Subject / Project Title</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder="e.g. Molecular Design Collaboration" 
                      value={collabForm.project} 
                      onChange={e => setCollabForm({...collabForm, project: e.target.value})} 
                      style={{ fontSize: '0.85rem', padding: '10px 14px' }} 
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Brief Proposal Details</label>
                    <textarea 
                      required 
                      rows={4} 
                      className="form-input" 
                      placeholder="Explain how you would like to collaborate..."
                      value={collabForm.details} 
                      onChange={e => setCollabForm({...collabForm, details: e.target.value})} 
                      style={{ fontSize: '0.85rem', padding: '10px 14px', resize: 'none', fontFamily: 'inherit' }} 
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '10px', marginTop: '6px', fontSize: '0.9rem' }}>
                    Send Collaboration Request ➔
                  </button>
                </form>
              )}
            </div>
          </div>
        );

      case "Funding":
        return (
          <div>
            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {[
                { label: 'Active Funding Pool', value: '₹5.2 Crores', color: '#133A26' },
                { label: 'Active Grants Supported', value: '18 Scholars', color: '#059669' },
                { label: 'Corporate Sponsors', value: '8 Partners', color: '#2563EB' }
              ].map((stat, idx) => (
                <div key={idx} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.85)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Grants List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {fundingData.map(grant => (
                <div key={grant.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.85)', padding: '24px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
                      {grant.status}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#133A26' }}>
                      {grant.amount}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{grant.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280' }}><strong>Agency:</strong> {grant.agency}</p>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: '1.5' }}>
                    {grant.scope}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                      <strong>Duration:</strong> {grant.duration}
                    </span>
                    <button className="btn-outline-small" style={{ fontSize: '0.75rem', padding: '6px 14px' }}>Explore Grant ➔</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "Events":
        return (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {eventsData.map(evt => (
                <div key={evt.id} className="card" style={{ display: 'flex', gap: '20px', background: 'rgba(255, 255, 255, 0.85)', padding: '24px', borderRadius: '16px', flexWrap: 'wrap' }}>
                  {/* Styled Date Calendar Icon */}
                  <div style={{ width: '80px', height: '80px', background: '#133A26', color: 'white', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={24} style={{ marginBottom: '4px' }} />
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>{evt.type}</span>
                  </div>

                  {/* Event Details */}
                  <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', lineHeight: '1.4' }}>
                      {evt.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>
                      📅 {evt.date} &nbsp;|&nbsp; 🕒 {evt.time}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#4B5563' }}>
                      📍 <strong>Venue:</strong> {evt.location}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#6B7280', italic: 'true' }}>
                      👤 {evt.speaker}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                    <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                      Register Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "About":
        return (
          <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Introduction */}
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#133A26', marginBottom: '12px' }}>Empowering the Next Generation of Academicians</h2>
              <p style={{ color: '#4B5563', fontSize: '0.95rem', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto' }}>
                ScholarSync is an integrated thesis tracking and research management ecosystem designed to streamline, automate, and orchestrate the complete academic lifecycle of Ph.D. scholars, faculty supervisors, and administrative heads.
              </p>
            </div>

            {/* Lifecycle Timeline */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#133A26', marginBottom: '24px', textAlign: 'center', position: 'relative' }}>
                🎓 Ph.D. Scholar Journey Milestones
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '30px' }}>
                <div style={{ position: 'absolute', left: '10px', top: '10px', bottom: '10px', width: '2px', background: '#A5D6A7' }} />

                {[
                  { title: "Stage 1: Thesis Registration", desc: "Scholar submits detailed research title, scope, and initial proposal. Reviewed and approved by Department HOD." },
                  { title: "Stage 2: Supervisor Assignment", desc: "HOD delegates a certified Faculty Supervisor matching the scholar's research area of interest." },
                  { title: "Stage 3: Coursework Phase", desc: "Scholar undertakes mandatory doctoral course credits, evaluated by the supervisor upon successful completion." },
                  { title: "Stage 4: Active Research & DRC Approval", desc: "Departmental Research Committee (DRC) approves the primary research synopsis, unlocking full dissertation creation." },
                  { title: "Stage 5: Pre-Submission Seminar", desc: "Scholar defends preliminary thesis findings in a public university-wide pre-submission presentation." },
                  { title: "Stage 6: External Thesis Evaluation", desc: "Completed dissertation is securely dispatched to high-profile external subject matter expert examiners." },
                  { title: "Stage 7: Degree Awarded!", desc: "Upon receiving satisfactory external review reports, the final Viva-Voce defense is cleared, and the doctorate degree is officially awarded." }
                ].map((stage, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-25px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: '#133A26', border: '3px solid #EAF4EE' }} />
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#133A26', marginBottom: '4px' }}>{stage.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: '1.5' }}>{stage.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Advantages */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {[
                { title: 'Absolute Transparency', desc: 'Real-time timeline progression charts accessible by supervisors, scholars, and department heads alike.' },
                { title: 'Secure Audited Files', desc: 'Secure repository for uploading coursework sheets, RAC review slides, synopsis documents, and external reviews.' },
                { title: 'Automated Reminders', desc: 'Dynamic alert systems to keep candidates informed about upcoming milestones, vivas, and DRC deadlines.' }
              ].map((feat, idx) => (
                <div key={idx} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.85)', borderRadius: '12px' }}>
                  <div style={{ color: '#133A26', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} />
                    <strong style={{ fontSize: '0.95rem' }}>{feat.title}</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: '1.4' }}>{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            This section is currently under development. Please check back later.
          </div>
        );
    }
  };

  return (
    <div className="subpage-container">
      <Navbar />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Dynamic Main Header Panel */}
        <div 
          className="glass-panel" 
          style={{ 
            maxWidth: title === 'About' || title === 'Events' ? '850px' : '1100px', 
            margin: '40px auto 20px', 
            padding: '40px 30px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px' }}>{title}</h1>
            <p className="page-desc" style={{ maxWidth: '650px', margin: '0 auto', fontSize: '1rem', color: '#4B5563' }}>{description}</p>
          </div>
          
          {/* Dynamic Rich Content Area */}
          <div style={{ borderTop: '1px solid rgba(19, 58, 38, 0.1)', paddingTop: '32px' }}>
            {renderRichContent()}
          </div>
        </div>
      </div>

      {/* Reusable Consolidated Footer */}
      <Footer />
    </div>
  );
};

export default GenericPage;

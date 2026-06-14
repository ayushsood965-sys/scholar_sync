import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { FileText, Download, Loader } from 'lucide-react';
import { API_URL } from '../config';
import { ThesisContext } from '../context/ThesisContext';
import { useToast } from '../context/ToastContext';

const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const DetailedReportsTab = ({ user }) => {
  const toast = useToast();
  const { allTheses, fetchDeptTheses, fetchAssignedTheses, fetchAllTheses, fetchThesisById } = useContext(ThesisContext);
  
  const [session, setSession] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  // Determine subrole or HOD level
  const subRole = user?.role === 'HOD' ? 'HOD' : user?.subRole;

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAllTheses();
    } else if (user?.role === 'HOD' || subRole === 'HOD') {
      fetchDeptTheses();
    } else {
      fetchAssignedTheses();
    }
  }, [user, subRole]);

  // Filter department theses locally
  const deptTheses = allTheses.filter(t => t.department === user?.department);

  const loadLogoAsBase64 = () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = '/hpu_logo.png';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        resolve(null);
      };
    });
  };

  const drawMilestoneDonut = (canvas, completed, total) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    const pct = total > 0 ? completed / total : 0;

    // Gray circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 14;
    ctx.stroke();

    // Progress circle
    ctx.beginPath();
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (pct * 2 * Math.PI);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 14;
    ctx.stroke();

    // Text
    ctx.font = 'bold 24px Helvetica';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(pct * 100)}%`, centerX, centerY - 5);

    ctx.font = '600 10px Helvetica';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Milestones Completed', centerX, centerY + 18);
  };

  const drawPublicationsBarChart = (canvas, journals, conferences) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;
    const paddingLeft = 40;
    const paddingBottom = 30;
    const paddingTop = 20;
    const paddingRight = 20;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const categories = ['Journals', 'Conferences'];
    const values = [journals, conferences];
    const maxVal = Math.max(4, ...values) + 1;

    // Grid
    ctx.font = '10px Helvetica';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const val = (maxVal / gridLines) * i;
      const y = height - paddingBottom - (chartHeight / gridLines) * i;
      ctx.fillText(Math.round(val).toString(), paddingLeft - 8, y);

      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Bars
    const barWidth = 40;
    const colors = ['#3b82f6', '#8b5cf6'];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i < categories.length; i++) {
      const val = values[i];
      const barHeight = (val / maxVal) * chartHeight;
      const x = paddingLeft + (chartWidth / categories.length) * i + (chartWidth / categories.length - barWidth) / 2;
      const y = height - paddingBottom - barHeight;

      ctx.fillStyle = colors[i];
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px Helvetica';
      ctx.fillText(val.toString(), x + barWidth / 2, y - 14);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 10px Helvetica';
      ctx.fillText(categories[i], x + barWidth / 2, height - paddingBottom + 8);
    }

    // Base line
    ctx.beginPath();
    ctx.moveTo(paddingLeft, height - paddingBottom);
    ctx.lineTo(width - paddingRight, height - paddingBottom);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  const drawHeader = (doc, logoBase64) => {
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 15, 10, 25, 25);
    }
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text('Himachal Pradesh University', 105, 17, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("(NAAC Accredited 'A' Grade University)", 105, 23, { align: 'center' });
    doc.text('Summerhill, Shimla 171005', 105, 28, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 38, 195, 38);

    return 45;
  };

  const checkNewPage = (doc, neededHeight, currentY, logoBase64) => {
    if (currentY + neededHeight > 275) {
      doc.addPage();
      return drawHeader(doc, logoBase64);
    }
    return currentY;
  };

  const addPageNumbers = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (!session) {
      return toast.warning('Please select an Academic Session.');
    }

    const sourceTheses = user?.role === 'ADMIN' ? allTheses : deptTheses;

    if (sourceTheses.length === 0) {
      return toast.error('No scholar candidates found in this department.');
    }

    // Determine target theses
    let targets = [];
    if (selectedCandidateId) {
      const match = sourceTheses.find(t => t._id === selectedCandidateId);
      if (match) targets = [match];
    } else {
      targets = sourceTheses;
    }

    if (targets.length === 0) {
      return toast.error('No scholar records found matching the selection.');
    }

    setDownloading(true);
    setLoadingMsg('Initiating report compiler...');

    try {
      // 1. Fetch all relevant meetings based on user role once
      let allMeetings = [];
      try {
        const endpoint = user?.role === 'ADMIN' || user?.role === 'HOD' || subRole === 'HOD' ? 'dept' : 'faculty';
        const meetRes = await axios.get(`${API_URL}/meetings/${endpoint}`, getAuthHeader());
        allMeetings = meetRes.data || [];
      } catch (meetErr) {
        console.error('Failed to pre-fetch meetings:', meetErr);
      }

      // 2. Fetch all detailed data first
      const compiledData = [];
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        setLoadingMsg(`Compiling candidate data for ${t.scholarId?.name || 'Scholar'} (${i + 1}/${targets.length})...`);
        
        // Fetch detailed thesis + milestones
        const details = await fetchThesisById(t._id);
        
        // Fetch publications
        let publications = [];
        try {
          const pubRes = await axios.get(`${API_URL}/publications/thesis/${t._id}`, getAuthHeader());
          publications = pubRes.data || [];
        } catch (pubErr) {
          console.error(`Failed to fetch publications for thesis ${t._id}:`, pubErr);
        }

        // Fetch DRC meetings
        let drcMeetings = [];
        try {
          const drcRes = await axios.get(`${API_URL}/lifecycle/drc/thesis/${t._id}`, getAuthHeader());
          drcMeetings = drcRes.data || [];
        } catch (drcErr) {
          console.error(`Failed to fetch DRC meetings for thesis ${t._id}:`, drcErr);
        }

        // Fetch RAC reviews
        let racSessions = [];
        try {
          const racRes = await axios.get(`${API_URL}/lifecycle/rac/thesis/${t._id}`, getAuthHeader());
          racSessions = racRes.data || [];
        } catch (racErr) {
          console.error(`Failed to fetch RAC reviews for thesis ${t._id}:`, racErr);
        }

        // Fetch Additional Documents
        let additionalDocuments = [];
        try {
          const docRes = await axios.get(`${API_URL}/additional-documents/thesis/${t._id}`, getAuthHeader());
          additionalDocuments = docRes.data || [];
        } catch (docErr) {
          console.error(`Failed to fetch additional documents for thesis ${t._id}:`, docErr);
        }

        // Filter meetings locally
        const candidateMeetings = allMeetings.filter(m => 
          m.thesisId === t._id || 
          m.thesisId?._id === t._id || 
          m.scholarId === t.scholarId?._id || 
          m.scholarId?._id === t.scholarId?._id
        );

        compiledData.push({
          thesis: details.thesis,
          milestones: details.milestones || [],
          publications,
          drcMeetings,
          racSessions,
          additionalDocuments,
          meetings: candidateMeetings
        });
      }

      // 2. Load the HPU logo image
      setLoadingMsg('Loading official HPU crest logo...');
      const logoBase64 = await loadLogoAsBase64();

      // 3. Create PDF
      setLoadingMsg('Assembling PDF document...');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Create reusable off-screen canvas elements for charts
      const donutCanvas = document.createElement('canvas');
      donutCanvas.width = 300;
      donutCanvas.height = 300;

      const barCanvas = document.createElement('canvas');
      barCanvas.width = 400;
      barCanvas.height = 300;

      for (let i = 0; i < compiledData.length; i++) {
        if (i > 0) {
          doc.addPage();
        }

        const data = compiledData[i];
        const { thesis, milestones, publications, drcMeetings, racSessions, additionalDocuments, meetings } = data;
        const studentName = thesis.scholarId?.name || 'N/A';

        // Draw page header
        let currentY = drawHeader(doc, logoBase64);

        // Subtitle
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(`DOCTORAL SCHOLAR PROGRESS RECORD — ACADEMIC SESSION ${session}`, 105, currentY, { align: 'center' });

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 195, currentY, { align: 'right' });
        currentY += 8;

        // PROFILE CARD
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, currentY, 180, 52, 3, 3, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, currentY, 180, 52, 3, 3, 'D');

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text("SCHOLAR DETAILS", 20, currentY + 6);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);

        // Column 1
        doc.text("Name:", 20, currentY + 14);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(studentName, 48, currentY + 14);

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text("Enrollment No:", 20, currentY + 21);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(thesis.enrollmentNumber || 'N/A', 48, currentY + 21);

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text("Department:", 20, currentY + 28);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(thesis.department || 'N/A', 48, currentY + 28);

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text("Admission Date:", 20, currentY + 35);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(thesis.scholarId?.profile?.admissionDate ? new Date(thesis.scholarId.profile.admissionDate).toLocaleDateString() : 'N/A', 48, currentY + 35);

        // Column 2
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text("Supervisor:", 110, currentY + 14);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(thesis.supervisorId?.name || 'Not Allocated', 138, currentY + 14);

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text("Ph.D. Mode:", 110, currentY + 21);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(thesis.scholarId?.profile?.phdMode || 'N/A', 138, currentY + 21);

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text("Specialization:", 110, currentY + 28);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(thesis.scholarId?.profile?.specialization || 'N/A', 138, currentY + 28);

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text("Current Phase:", 110, currentY + 35);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(30, 58, 138);
        doc.text(thesis.status?.replace(/_/g, ' ') || 'N/A', 138, currentY + 35);

        // Title line at bottom of profile card
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text("Thesis Title:", 20, currentY + 44);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        let tTitle = thesis.title || 'N/A';
        if (tTitle.length > 85) tTitle = tTitle.substring(0, 82) + '...';
        doc.text(tTitle, 48, currentY + 44);

        currentY += 58;

        // CHARTS SIDE-BY-SIDE
        setLoadingMsg(`Rendering progress charts for ${studentName}...`);
        const completedMilestones = milestones.filter(m => m.status === 'APPROVED' || m.status === 'VERIFIED').length;
        const totalMilestones = milestones.length;
        
        const journals = publications.filter(p => p.type === 'JOURNAL' && p.status === 'VERIFIED').length;
        const conferences = publications.filter(p => p.type === 'CONFERENCE' && p.status === 'VERIFIED').length;

        // Redraw on off-screen canvases
        drawMilestoneDonut(donutCanvas, completedMilestones, totalMilestones);
        drawPublicationsBarChart(barCanvas, journals, conferences);

        const donutBase64 = donutCanvas.toDataURL('image/png');
        const barBase64 = barCanvas.toDataURL('image/png');

        currentY = checkNewPage(doc, 54, currentY, logoBase64);

        // Draw card borders for graphs
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, currentY, 85, 48, 3, 3, 'FD');
        doc.roundedRect(110, currentY, 85, 48, 3, 3, 'FD');

        // Add donut image
        doc.addImage(donutBase64, 'PNG', 32, currentY + 4, 50, 40);

        // Add bar image
        doc.addImage(barBase64, 'PNG', 115, currentY + 4, 75, 40);

        currentY += 54;

        // MILESTONES TABLE
        currentY = checkNewPage(doc, 25, currentY, logoBase64);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 58, 138);
        doc.text("RESEARCH LIFECYCLE & MILESTONES", 15, currentY);
        currentY += 4;

        doc.setFillColor(241, 245, 249);
        doc.rect(15, currentY, 180, 7, 'F');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text("Milestone Deliverable", 18, currentY + 5);
        doc.text("Due Date", 85, currentY + 5);
        doc.text("Status", 125, currentY + 5);
        doc.text("Outcome Date", 160, currentY + 5);
        currentY += 7;

        if (milestones.length === 0) {
          currentY = checkNewPage(doc, 10, currentY, logoBase64);
          doc.setFont('Helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text("No milestones assigned to this candidate.", 18, currentY + 5);
          currentY += 10;
        } else {
          milestones.forEach((m) => {
            currentY = checkNewPage(doc, 8, currentY, logoBase64);
            doc.setDrawColor(241, 245, 249);
            doc.setLineWidth(0.5);
            doc.line(15, currentY + 7, 195, currentY + 7);

            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(15, 23, 42);

            let mTitle = m.title || m.type || 'N/A';
            if (mTitle.length > 38) mTitle = mTitle.substring(0, 36) + '...';
            doc.text(mTitle, 18, currentY + 5);

            const dDate = m.dueDate ? new Date(m.dueDate).toLocaleDateString() : '—';
            doc.text(dDate, 85, currentY + 5);

            let st = m.status || 'PENDING';
            if (st === 'APPROVED' || st === 'VERIFIED') {
              doc.setTextColor(5, 150, 105);
            } else if (st === 'REVISION_REQUIRED' || st === 'REJECTED') {
              doc.setTextColor(220, 38, 38);
            } else if (st === 'SUBMITTED') {
              doc.setTextColor(37, 99, 235);
            } else {
              doc.setTextColor(100, 116, 139);
            }
            doc.setFont('Helvetica', 'bold');
            doc.text(st, 125, currentY + 5);

            doc.setFont('Helvetica', 'normal');
            doc.setTextColor(15, 23, 42);
            const compDate = m.updatedAt && m.status !== 'PENDING' ? new Date(m.updatedAt).toLocaleDateString() : '—';
            doc.text(compDate, 160, currentY + 5);

            currentY += 8;
          });
        }
        currentY += 4;

        // PUBLICATIONS TABLE
        currentY = checkNewPage(doc, 25, currentY, logoBase64);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 58, 138);
        doc.text("RESEARCH PUBLICATIONS & CONFERENCES", 15, currentY);
        currentY += 4;

        doc.setFillColor(241, 245, 249);
        doc.rect(15, currentY, 180, 7, 'F');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text("Publication Title", 18, currentY + 5);
        doc.text("Type", 95, currentY + 5);
        doc.text("Journal/Publisher", 115, currentY + 5);
        doc.text("Status", 165, currentY + 5);
        currentY += 7;

        if (publications.length === 0) {
          currentY = checkNewPage(doc, 10, currentY, logoBase64);
          doc.setFont('Helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text("No publication logs recorded for this scholar.", 18, currentY + 5);
          currentY += 10;
        } else {
          publications.forEach((p) => {
            currentY = checkNewPage(doc, 8, currentY, logoBase64);
            doc.setDrawColor(241, 245, 249);
            doc.setLineWidth(0.5);
            doc.line(15, currentY + 7, 195, currentY + 7);

            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(15, 23, 42);

            let pTitle = p.title || 'N/A';
            if (pTitle.length > 45) pTitle = pTitle.substring(0, 42) + '...';
            doc.text(pTitle, 18, currentY + 5);

            doc.text(p.type || 'N/A', 95, currentY + 5);

            let jName = p.journalName || p.conferenceName || 'N/A';
            if (jName.length > 25) jName = jName.substring(0, 22) + '...';
            doc.text(jName, 115, currentY + 5);

            let pSt = p.status || 'PENDING';
            if (pSt === 'VERIFIED') {
              doc.setTextColor(5, 150, 105);
            } else if (pSt === 'REJECTED') {
              doc.setTextColor(220, 38, 38);
            } else {
              doc.setTextColor(100, 116, 139);
            }
            doc.setFont('Helvetica', 'bold');
            doc.text(pSt, 165, currentY + 5);

            currentY += 8;
          });
        }
        currentY += 4;

        // AUDIT LOGS TABLE
        currentY = checkNewPage(doc, 25, currentY, logoBase64);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 58, 138);
        doc.text("CANDIDATE LOG AUDIT TRAIL", 15, currentY);
        currentY += 4;

        doc.setFillColor(241, 245, 249);
        doc.rect(15, currentY, 180, 7, 'F');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text("Timestamp", 18, currentY + 5);
        doc.text("System Action", 50, currentY + 5);
        doc.text("Verification Remark / Details", 95, currentY + 5);
        currentY += 7;

        const auditLog = thesis.auditLog || [];
        if (auditLog.length === 0) {
          currentY = checkNewPage(doc, 10, currentY, logoBase64);
          doc.setFont('Helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text("No audit log events recorded for this candidate.", 18, currentY + 5);
          currentY += 10;
        } else {
          const sortedAudit = [...auditLog].sort((a, b) => new Date(a.date) - new Date(b.date));
          sortedAudit.forEach((log) => {
            const noteText = log.note || '—';
            const splitNote = doc.splitTextToSize(noteText, 95);
            const textHeight = splitNote.length * 4;
            const neededHeight = Math.max(10, textHeight + 6);

            currentY = checkNewPage(doc, neededHeight, currentY, logoBase64);

            doc.setDrawColor(241, 245, 249);
            doc.setLineWidth(0.5);
            doc.line(15, currentY + neededHeight - 1, 195, currentY + neededHeight - 1);

            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(15, 23, 42);

            const lDate = log.date ? new Date(log.date).toLocaleString() : 'N/A';
            doc.text(lDate, 18, currentY + 5);

            doc.setFont('Helvetica', 'bold');
            doc.text(log.action || 'EVENT', 50, currentY + 5);

            doc.setFont('Helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text(splitNote, 95, currentY + 5);

            currentY += neededHeight;
          });
        }

        // DETAILED EVALUATION, DOCUMENTS & CONSULTATION CHRONOLOGY
        currentY = checkNewPage(doc, 25, currentY, logoBase64);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 58, 138);
        doc.text("DETAILED EVALUATION, DOCUMENTS & CONSULTATION CHRONOLOGY", 15, currentY);
        currentY += 5;

        // Draw Summary Statistics Matrix Card
        currentY = checkNewPage(doc, 45, currentY, logoBase64);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, currentY, 180, 30, 2, 2, 'F');
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.6);
        doc.roundedRect(15, currentY, 180, 30, 2, 2, 'D');

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 58, 138);
        doc.text("SUMMARY EVALUATION & CONSULTATION MATRIX", 20, currentY + 6);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);

        // DRC Summary
        doc.text(`DRC Evaluations: ${drcMeetings.length}`, 20, currentY + 14);
        doc.setFont('Helvetica', 'bold');
        doc.text(`(Approved: ${drcMeetings.filter(d => d.status === 'APPROVED').length} | Revision: ${drcMeetings.filter(d => d.status === 'REVISION_REQUIRED').length})`, 20, currentY + 20);

        // RAC Summary
        doc.setFont('Helvetica', 'normal');
        doc.text(`RAC Panels: ${racSessions.length}`, 62, currentY + 14);
        doc.setFont('Helvetica', 'bold');
        doc.text(`(Satis.: ${racSessions.filter(r => r.status === 'SATISFACTORY').length} | Unsatis.: ${racSessions.filter(r => r.status === 'UNSATISFACTORY').length})`, 62, currentY + 20);

        // Consultations Summary
        doc.setFont('Helvetica', 'normal');
        doc.text(`Consultations: ${meetings.length}`, 105, currentY + 14);
        doc.setFont('Helvetica', 'bold');
        doc.text(`(Appr: ${meetings.filter(m => m.status === 'APPROVED').length} | Rej: ${meetings.filter(m => m.status === 'REJECTED').length} | Pend: ${meetings.filter(m => m.status === 'PENDING').length})`, 105, currentY + 20);

        // Uploads Summary
        doc.setFont('Helvetica', 'normal');
        doc.text(`Uploads/Documents: ${additionalDocuments.length}`, 148, currentY + 14);
        doc.setFont('Helvetica', 'bold');
        doc.text(`(Rev.: ${additionalDocuments.filter(ad => ad.status === 'REVIEWED').length} | Sub.: ${additionalDocuments.filter(ad => ad.status === 'SUBMITTED').length})`, 148, currentY + 20);

        currentY += 36;

        // 1. DRC Meetings Chronology
        currentY = checkNewPage(doc, 20, currentY, logoBase64);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 58, 138);
        doc.text("1. Departmental Research Committee (DRC) Evaluations", 15, currentY);
        currentY += 6;

        if (drcMeetings.length === 0) {
          currentY = checkNewPage(doc, 10, currentY, logoBase64);
          doc.setFont('Helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text("No DRC evaluation meetings recorded.", 18, currentY + 4);
          currentY += 8;
        } else {
          drcMeetings.forEach((d, index) => {
            const title = `${index + 1}. ${d.title || 'DRC Meeting'} ${d.isSynopsisApproval ? '(Synopsis Approval Evaluation)' : ''}`;
            const schedDateStr = d.scheduledDate ? new Date(d.scheduledDate).toLocaleDateString() : '—';
            const schedTimeStr = d.scheduledTime || '—';
            const venue = d.venue || '—';
            const members = d.committeeMembers || '—';
            const agenda = d.agenda || '—';
            const remarks = d.remarks || '—';
            const status = d.status || 'SCHEDULED';

            const splitMembers = doc.splitTextToSize(members, 125);
            const splitAgenda = doc.splitTextToSize(agenda, 132);
            const splitRemarks = doc.splitTextToSize(remarks, 120);

            const textLinesCount = 3 + splitMembers.length + splitAgenda.length + splitRemarks.length;
            const neededHeight = (textLinesCount * 4.5) + 14;

            currentY = checkNewPage(doc, neededHeight, currentY, logoBase64);

            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.roundedRect(15, currentY, 180, neededHeight - 4, 2, 2, 'FD');

            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text(title, 18, currentY + 6);

            let badgeColor = [100, 116, 139];
            if (status === 'APPROVED') badgeColor = [5, 150, 105];
            else if (status === 'REVISION_REQUIRED') badgeColor = [220, 38, 38];
            else if (status === 'SCHEDULED') badgeColor = [37, 99, 235];

            doc.setFont('Helvetica', 'bold');
            doc.setTextColor(...badgeColor);
            doc.text(`Status: ${status}`, 190, currentY + 6, { align: 'right' });

            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);

            let cardY = currentY + 12;
            doc.text(`Scheduled Date/Time: ${schedDateStr} at ${schedTimeStr}  |  Venue: ${venue}`, 18, cardY);
            cardY += 4.5;

            doc.text(`Committee Members:`, 18, cardY);
            doc.setTextColor(15, 23, 42);
            doc.text(splitMembers, 48, cardY);
            cardY += (splitMembers.length * 4.5);

            doc.setTextColor(71, 85, 105);
            doc.text(`Agenda / Focus:`, 18, cardY);
            doc.setTextColor(15, 23, 42);
            doc.text(splitAgenda, 42, cardY);
            cardY += (splitAgenda.length * 4.5);

            doc.setTextColor(71, 85, 105);
            doc.text(`Committee Remarks / MoM:`, 18, cardY);
            doc.setTextColor(15, 23, 42);
            doc.text(splitRemarks, 55, cardY);

            currentY += neededHeight;
          });
        }
        currentY += 4;

        // 2. RAC Reviews Chronology
        currentY = checkNewPage(doc, 20, currentY, logoBase64);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 58, 138);
        doc.text("2. Research Advisory Committee (RAC) Panels", 15, currentY);
        currentY += 6;

        if (racSessions.length === 0) {
          currentY = checkNewPage(doc, 10, currentY, logoBase64);
          doc.setFont('Helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text("No formal RAC review panel records found.", 18, currentY + 4);
          currentY += 8;
        } else {
          racSessions.forEach((r, index) => {
            const title = `RAC Session Review #${r.racNumber || index + 1}`;
            const condDateStr = r.conductedDate ? new Date(r.conductedDate).toLocaleDateString() : '—';
            const nextDateStr = r.nextMeetingDate ? new Date(r.nextMeetingDate).toLocaleDateString() : '—';
            const chairedBy = r.committeeChairedBy || '—';
            const members = r.committeeMembers || '—';
            const progress = r.researchProgress || '—';
            const targets = r.nextMilestones || '—';
            const remarks = r.remarks || r.comments || '—';
            const status = r.status || 'SCHEDULED';

            const splitMembers = doc.splitTextToSize(members, 125);
            const splitProgress = doc.splitTextToSize(progress, 125);
            const splitTargets = doc.splitTextToSize(targets, 125);
            const splitRemarks = doc.splitTextToSize(remarks, 125);

            const textLinesCount = 4 + splitMembers.length + splitProgress.length + splitTargets.length + splitRemarks.length;
            const neededHeight = (textLinesCount * 4.5) + 16;

            currentY = checkNewPage(doc, neededHeight, currentY, logoBase64);

            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.roundedRect(15, currentY, 180, neededHeight - 4, 2, 2, 'FD');

            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text(title, 18, currentY + 6);

            let badgeColor = [100, 116, 139];
            if (status === 'SATISFACTORY') badgeColor = [5, 150, 105];
            else if (status === 'UNSATISFACTORY') badgeColor = [220, 38, 38];

            doc.setTextColor(...badgeColor);
            doc.text(`Outcome: ${status}`, 190, currentY + 6, { align: 'right' });

            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);

            let cardY = currentY + 12;
            doc.text(`Conducted Date: ${condDateStr}  |  Next Review Date: ${nextDateStr}`, 18, cardY);
            cardY += 4.5;

            doc.text(`Committee Chaired By: ${chairedBy}`, 18, cardY);
            cardY += 4.5;

            doc.text(`Committee Members:`, 18, cardY);
            doc.setTextColor(15, 23, 42);
            doc.text(splitMembers, 48, cardY);
            cardY += (splitMembers.length * 4.5);

            doc.setTextColor(71, 85, 105);
            doc.text(`Research Progress:`, 18, cardY);
            doc.setTextColor(15, 23, 42);
            doc.text(splitProgress, 46, cardY);
            cardY += (splitProgress.length * 4.5);

            doc.setTextColor(71, 85, 105);
            doc.text(`Next Targets Set:`, 18, cardY);
            doc.setTextColor(15, 23, 42);
            doc.text(splitTargets, 42, cardY);
            cardY += (splitTargets.length * 4.5);

            doc.setTextColor(71, 85, 105);
            doc.text(`Committee Remarks:`, 18, cardY);
            doc.setTextColor(15, 23, 42);
            doc.text(splitRemarks, 46, cardY);

            currentY += neededHeight;
          });
        }
        currentY += 4;

        // 3. Guidance Consultation Meetings
        currentY = checkNewPage(doc, 20, currentY, logoBase64);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 58, 138);
        doc.text("3. Guidance Consultation Meetings Log", 15, currentY);
        currentY += 6;

        if (meetings.length === 0) {
          currentY = checkNewPage(doc, 10, currentY, logoBase64);
          doc.setFont('Helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text("No guidance consultation meeting requests recorded.", 18, currentY + 4);
          currentY += 8;
        } else {
          meetings.forEach((m, index) => {
            const title = `Guidance Consultation Request #${index + 1}`;
            const schedDateStr = m.date ? new Date(m.date).toLocaleDateString() : '—';
            const schedTimeStr = m.time || '—';
            const createdDateStr = m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—';
            const reason = m.reason || '—';
            const remarks = m.remarks || '—';
            const status = m.status || 'PENDING';

            const invited = m.invitedAttendees?.map(a => `${a.name} (${a.role === 'HOD' ? 'HOD' : (a.subRole || 'Faculty')})`).join(', ') || 'None';
            const accepted = m.attendees?.map(a => a.name).join(', ') || 'None';
            const rejected = m.rejectedAttendees?.map(r => r.name).join(', ') || 'None';

            const splitReason = doc.splitTextToSize(reason, 125);
            const splitInvited = doc.splitTextToSize(invited, 125);
            const splitAccepted = doc.splitTextToSize(accepted, 125);
            const splitRejected = doc.splitTextToSize(rejected, 125);
            const splitRemarks = doc.splitTextToSize(remarks, 125);

            const textLinesCount = 3 + splitReason.length + splitInvited.length + splitAccepted.length + splitRejected.length + splitRemarks.length;
            const neededHeight = (textLinesCount * 4.5) + 16;

            currentY = checkNewPage(doc, neededHeight, currentY, logoBase64);

            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.roundedRect(15, currentY, 180, neededHeight - 4, 2, 2, 'FD');

            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text(title, 18, currentY + 6);

            let badgeColor = [217, 119, 6];
            if (status === 'APPROVED') badgeColor = [5, 150, 105];
            else if (status === 'REJECTED') badgeColor = [220, 38, 38];

            doc.setTextColor(...badgeColor);
            doc.text(`Status: ${status}`, 190, currentY + 6, { align: 'right' });

            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);

            let cardY = currentY + 12;
            doc.text(`Meeting Date/Time: ${schedDateStr} at ${schedTimeStr}  |  Requested: ${createdDateStr}`, 18, cardY);
            cardY += 4.5;

            doc.text(`Consultation Reason:`, 18, cardY);
            doc.setTextColor(15, 23, 42);
            doc.text(splitReason, 48, cardY);
            cardY += (splitReason.length * 4.5);

            doc.setTextColor(71, 85, 105);
            doc.text(`Invited Faculty:`, 18, cardY);
            doc.setTextColor(15, 23, 42);
            doc.text(splitInvited, 40, cardY);
            cardY += (splitInvited.length * 4.5);

            doc.setTextColor(71, 85, 105);
            doc.text(`Accepted Attendees:`, 18, cardY);
            doc.setTextColor(15, 23, 42);
            doc.text(splitAccepted, 46, cardY);
            cardY += (splitAccepted.length * 4.5);

            doc.setTextColor(71, 85, 105);
            doc.text(`Rejected Attendees:`, 18, cardY);
            doc.setTextColor(15, 23, 42);
            doc.text(splitRejected, 46, cardY);
            cardY += (splitRejected.length * 4.5);

            doc.setTextColor(71, 85, 105);
            doc.text(`Consultation Remarks:`, 18, cardY);
            doc.setTextColor(15, 23, 42);
            doc.text(splitRemarks, 48, cardY);

            currentY += neededHeight;
          });
        }
        currentY += 4;

        // 4. Uploaded Documents / Institutional Submissions
        currentY = checkNewPage(doc, 20, currentY, logoBase64);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 58, 138);
        doc.text("4. Institutional Uploads & Additional Documents", 15, currentY);
        currentY += 6;

        if (additionalDocuments.length === 0) {
          currentY = checkNewPage(doc, 10, currentY, logoBase64);
          doc.setFont('Helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text("No additional uploaded documents recorded.", 18, currentY + 4);
          currentY += 8;
        } else {
          additionalDocuments.forEach((ad, index) => {
            const title = `${index + 1}. Document: ${ad.title || 'Untitled'}`;
            const docDateStr = ad.createdAt ? new Date(ad.createdAt).toLocaleDateString() : '—';
            const description = ad.description || '—';
            const recipient = ad.forwardedTo?.name ? `${ad.forwardedTo.name} (${ad.forwardedRole})` : '—';
            const status = ad.status || 'SUBMITTED';
            const remarks = ad.remarks || '—';
            const docUrl = ad.documentUrl || '—';

            const splitDesc = doc.splitTextToSize(description, 125);
            const splitRemarks = doc.splitTextToSize(remarks, 125);
            const splitUrl = doc.splitTextToSize(docUrl, 120);

            const textLinesCount = 3 + splitDesc.length + splitRemarks.length + splitUrl.length;
            const neededHeight = (textLinesCount * 4.5) + 16;

            currentY = checkNewPage(doc, neededHeight, currentY, logoBase64);

            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.roundedRect(15, currentY, 180, neededHeight - 4, 2, 2, 'FD');

            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text(title, 18, currentY + 6);

            let badgeColor = [100, 116, 139];
            if (status === 'REVIEWED') badgeColor = [5, 150, 105];

            doc.setTextColor(...badgeColor);
            doc.text(`Status: ${status}`, 190, currentY + 6, { align: 'right' });

            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);

            let cardY = currentY + 12;
            doc.text(`Uploaded Date: ${docDateStr}  |  Forwarded Recipient: ${recipient}`, 18, cardY);
            cardY += 4.5;

            doc.text(`Description:`, 18, cardY);
            doc.setTextColor(15, 23, 42);
            doc.text(splitDesc, 36, cardY);
            cardY += (splitDesc.length * 4.5);

            doc.text(`Document Reference/Link:`, 18, cardY);
            doc.setTextColor(15, 23, 42);
            doc.text(splitUrl, 52, cardY);
            cardY += (splitUrl.length * 4.5);

            doc.setTextColor(71, 85, 105);
            doc.text(`Evaluation Remarks:`, 18, cardY);
            doc.setTextColor(15, 23, 42);
            doc.text(splitRemarks, 46, cardY);

            currentY += neededHeight;
          });
        }
      }

      // Add page numbers on all pages
      setLoadingMsg('Finalizing formatting & page numbering...');
      addPageNumbers(doc);

      // Download
      const fileName = `HPU_Detailed_Report_${session}_${(user?.department || 'Department').replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      toast.success('Scholar Progress Record downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate or compile PDF report.');
    } finally {
      setDownloading(false);
      setLoadingMsg('');
    }
  };

  return (
    <div className="card" style={{ padding: '24px 32px', maxWidth: '800px', margin: '0 auto', borderRadius: 16 }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
      `}</style>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--color-border, #E2E8F0)', paddingBottom: 16, marginBottom: 24 }}>
        <div style={{ background: '#EFF6FF', padding: 12, borderRadius: 12, color: '#1E40AF' }}>
          <FileText size={24} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #0F172A)' }}>Detailed Academic Reports</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary, #64748B)' }}>
            Compile and export verified Ph.D. progress records, milestones progress, publications records, and audit logs to print-ready PDF formats.
          </p>
        </div>
      </div>

      <form onSubmit={handleGenerateReport} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Academic Session */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-secondary, #475569)', marginBottom: 6 }}>
              Academic Session <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              className="form-input"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              required
              disabled={downloading}
              style={{ width: '100%', padding: '10px' }}
            >
              <option value="">-- Select Session --</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
              <option value="2021-2022">2021-2022</option>
            </select>
          </div>

          {/* Department - Pre-selected and Disabled */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-secondary, #475569)', marginBottom: 6 }}>
              Department
            </label>
            <select
              className="form-input"
              value={user?.department || ''}
              disabled
              style={{ width: '100%', padding: '10px', background: '#F1F5F9', cursor: 'not-allowed' }}
            >
              <option value={user?.department || ''}>{user?.department || 'N/A'}</option>
            </select>
          </div>
        </div>

        {/* Scholar Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-secondary, #475569)', marginBottom: 6 }}>
            Scholar / Candidate <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94A3B8' }}>(Optional)</span>
          </label>
          <select
            className="form-input"
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            disabled={downloading}
            style={{ width: '100%', padding: '10px' }}
          >
            <option value="">-- All Department Candidates (Bulk Report) --</option>
            {deptTheses.map(t => (
              <option key={t._id} value={t._id}>
                {t.scholarId?.name} ({t.enrollmentNumber || 'No Enrollment'})
              </option>
            ))}
          </select>
        </div>

        {/* Generate Button / Progress */}
        <div style={{ borderTop: '1px solid var(--color-border, #E2E8F0)', paddingTop: 20, marginTop: 10 }}>
          {downloading ? (
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px 20px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Loader className="spin-icon" size={20} color="#3B82F6" />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>Processing Request...</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic' }}>
                {loadingMsg}
              </p>
            </div>
          ) : (
            <button
              type="submit"
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                fontSize: '0.9rem',
                fontWeight: 700,
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
              }}
            >
              <Download size={18} /> Compile & Download PDF Report
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DetailedReportsTab;

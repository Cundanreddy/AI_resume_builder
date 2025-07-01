import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Resume } from '../types';

export const generatePDF = async (resume: Resume): Promise<void> => {
  try {
    const element = document.getElementById('resume-content');
    if (!element) {
      throw new Error('Resume content not found');
    }

    // Capture the resume content as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    // Download the PDF
    const fileName = `${resume.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const generateSimplePDF = (resume: Resume): void => {
  const pdf = new jsPDF();
  let yPosition = 20;

  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(resume.personalInfo.fullName, 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${resume.personalInfo.email} | ${resume.personalInfo.phone} | ${resume.personalInfo.address}`, 20, yPosition);
  yPosition += 15;

  // Summary
  if (resume.summary) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Professional Summary', 20, yPosition);
    yPosition += 7;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const summaryLines = pdf.splitTextToSize(resume.summary, 170);
    pdf.text(summaryLines, 20, yPosition);
    yPosition += summaryLines.length * 4 + 5;
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Education', 20, yPosition);
    yPosition += 7;

    resume.education.forEach((edu) => {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${edu.degree} in ${edu.field}`, 20, yPosition);
      yPosition += 5;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${edu.institution} | ${edu.startYear} - ${edu.endYear}`, 20, yPosition);
      if (edu.gpa) {
        pdf.text(`GPA: ${edu.gpa}`, 150, yPosition);
      }
      yPosition += 8;
    });
    yPosition += 5;
  }

  // Experience
  if (resume.experience && resume.experience.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Work Experience', 20, yPosition);
    yPosition += 7;

    resume.experience.forEach((exp) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(exp.position, 20, yPosition);
      yPosition += 5;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${exp.company} | ${exp.startDate} - ${exp.endDate}`, 20, yPosition);
      yPosition += 5;

      const descLines = pdf.splitTextToSize(exp.description, 170);
      pdf.text(descLines, 20, yPosition);
      yPosition += descLines.length * 4 + 5;
    });
  }

  // Skills
  if (resume.skills && resume.skills.length > 0) {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Skills', 20, yPosition);
    yPosition += 7;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const skillsText = typeof resume.skills === 'string' 
      ? resume.skills 
      : resume.skills.join(', ');
    const skillsLines = pdf.splitTextToSize(skillsText, 170);
    pdf.text(skillsLines, 20, yPosition);
  }

  const fileName = `${resume.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
  pdf.save(fileName);
};
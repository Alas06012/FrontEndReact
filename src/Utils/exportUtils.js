// src/Utils/exportUtils.js

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatStatus = (status) => {
  switch (status) {
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Completed';
    case 'FAILED':
      return 'Failed';
    default:
      return status;
  }
};

export const transformExportData = (data) =>
  data.map((item) => ({
    'Full Name': `${item.user_name} ${item.user_lastname}`,
    Email: item.user_email,
    Date: formatDate(item.created_at),
    Level: item.level_name || 'Unassigned',
    Points: item.test_points ?? 'N/A',
    Status: formatStatus(item.status),
  }));

export const exportToExcel = (data, fileName = 'report') => {
  const exportData = transformExportData(data);

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['NecDiagnostics - TOIC Practice Test Report'],
    ['This report lists students who have taken the TOIC practice test using the NecDiagnostics system.'], // Espacio vacío
  ]);

  // Agrega encabezado + datos a partir de la fila 3
  XLSX.utils.sheet_add_json(worksheet, exportData, {
    origin: 'A4',
    skipHeader: false,
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};


export const exportToPDF = (data, fileName = 'report') => {
  const exportData = transformExportData(data);
  const doc = new jsPDF();

  // Header
  doc.setFontSize(14);
  doc.text('NecDiagnostics - TOIC Practice Test Report', 14, 20);
  doc.setFontSize(11);
  doc.text(
    'This report lists students who have taken the TOIC practice test using the NecDiagnostics system.',
    14,
    28
  );

  const columns = Object.keys(exportData[0] || {});
  const rows = exportData.map((row) => columns.map((col) => row[col]));

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 35,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 160, 133] },
  });

  doc.save(`${fileName}.pdf`);
};


export const exportResultDetailToPDF = (data, fileName = 'test_result') => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Test Result', 14, 20);

  doc.setFontSize(12);
  doc.text(`Name: ${data.user_name} ${data.user_lastname}`, 14, 30);
  doc.text(`Email: ${data.user_email}`, 14, 36);
  doc.text(`Level: ${data.level_name || 'Unassigned'}`, 14, 42);
  doc.text(`Date: ${new Date(data.date).toLocaleString()}`, 14, 48);
  doc.text(`Score: ${data.score ?? 'N/A'}`, 14, 54);
  doc.text(`Status: ${data.test_passed ? 'Passed' : 'Failed'}`, 14, 60);

  const addSection = (title, items, startY, color) => {
    doc.setFontSize(13);
    doc.setTextColor(...color);
    doc.text(title, 14, startY);

    autoTable(doc, {
      startY: startY + 4,
      head: [['Details']],
      body: (items?.length > 0 ? items : [{ text: 'None' }]).map((i) => [i.text]),
      styles: { fontSize: 10 },
      theme: 'striped',
      headStyles: { fillColor: color },
      margin: { left: 14, right: 14 },
    });

    return doc.lastAutoTable.finalY + 10;
  };

  let y = 70;
  y = addSection('Strengths', data.strengths, y, [34, 139, 34]); // green
  y = addSection('Weaknesses', data.weaknesses, y, [220, 53, 69]); // red
  y = addSection('Recommendations', data.recommendations, y, [30, 144, 255]); // blue

  doc.save(`${fileName}.pdf`);
};


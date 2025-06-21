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

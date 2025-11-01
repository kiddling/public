import jsPDF from 'jspdf';

interface DesignLogData {
  projectName: string;
  projectType: string;
  date: string;
  objective: string;
  inspiration: string;
  process: string;
  challenges: string;
  outcome: string;
  reflection: string;
  nextSteps: string;
  tags: string;
  tools: string;
}

export const useDesignLogPDF = () => {
  const exportToPDF = async (data: DesignLogData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let currentY = margin;

    // Helper function to add text with word wrap
    const addText = (label: string, content: string, fontSize: number = 12, isBold: boolean = false) => {
      // Check if we need a new page
      if (currentY > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }

      // Add label
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.text(label, margin, currentY);
      currentY += lineHeight;

      // Add content with word wrap
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(content || '无', pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (currentY > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }
        doc.text(line, margin, currentY);
        currentY += lineHeight - 1;
      });

      currentY += lineHeight; // Add space after section
    };

    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('设计日志 (Design Log)', pageWidth / 2, currentY, { align: 'center' });
    currentY += lineHeight * 2;

    // Add horizontal line
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += lineHeight * 1.5;

    // Project Information
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('项目信息', margin, currentY);
    currentY += lineHeight * 1.5;

    addText('项目名称:', data.projectName, 12, true);
    addText('项目类型:', getProjectTypeLabel(data.projectType), 12, true);
    addText('日期:', data.date, 12, true);

    // Add separator
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += lineHeight;

    // Design Process
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('设计过程', margin, currentY);
    currentY += lineHeight * 1.5;

    addText('设计目标:', data.objective);
    addText('灵感来源:', data.inspiration);
    addText('设计步骤:', data.process);
    addText('遇到的挑战:', data.challenges);

    // Add separator
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += lineHeight;

    // Results and Reflection
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('结果与反思', margin, currentY);
    currentY += lineHeight * 1.5;

    addText('最终成果:', data.outcome);
    addText('反思总结:', data.reflection);
    addText('后续计划:', data.nextSteps);

    // Add separator
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += lineHeight;

    // Tags and Tools
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('标签和工具', margin, currentY);
    currentY += lineHeight * 1.5;

    addText('标签:', data.tags);
    addText('使用工具:', data.tools);

    // Add footer
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text(
      `生成时间: ${new Date().toLocaleString('zh-CN')}`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );

    // Save PDF
    const filename = `设计日志-${data.projectName}-${data.date}.pdf`;
    doc.save(filename);
  };

  const getProjectTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      web: '网页设计',
      mobile: '移动应用',
      graphic: '平面设计',
      'ui-ux': 'UI/UX设计',
      other: '其他',
    };
    return labels[type] || type;
  };

  const exportMultipleToPDF = async (logs: DesignLogData[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let currentY = margin;

    // Add title page
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('设计日志合集', pageWidth / 2, 100, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`共 ${logs.length} 个项目`, pageWidth / 2, 120, { align: 'center' });
    doc.text(`生成时间: ${new Date().toLocaleString('zh-CN')}`, pageWidth / 2, 130, { align: 'center' });

    // Add each log
    for (let i = 0; i < logs.length; i++) {
      doc.addPage();
      // Generate individual log content
      await exportToPDF(logs[i]);
    }

    // Save combined PDF
    const filename = `设计日志合集-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  return {
    exportToPDF,
    exportMultipleToPDF,
  };
};

const PDFDocument = require('pdfkit');
const path = require('path');

const FONT = path.join(__dirname, '../assets/fonts/DejaVuSans.ttf');
const FONT_BOLD = path.join(__dirname, '../assets/fonts/DejaVuSans-Bold.ttf');

const generateCertificatePDF = (cert, userName) => {
  return new Promise((resolve, reject) => {
    const W = 922;
    const H = 494;
    const doc = new PDFDocument({ size: [W, H], margin: 0, autoFirstPage: false });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.addPage({ size: [W, H], margin: 0 });

    doc.rect(0, 0, W, H).fill('#0C1B33');

    doc.save();
    doc.moveTo(702, 0).lineTo(W, 0).lineTo(W, H).lineTo(650, H).closePath().fill('#1e3260');
    doc.restore();

    const goldGrad = doc.linearGradient(0, 0, 700, 0);
    goldGrad.stop(0, '#C9A84C').stop(1, '#0C1B33');
    doc.rect(0, 0, 700, 3).fill(goldGrad);

    const goldGrad2 = doc.linearGradient(0, 0, 600, 0);
    goldGrad2.stop(0, '#C9A84C').stop(1, '#0C1B33');
    doc.rect(0, H - 3, 600, 3).fill(goldGrad2);

    doc.fontSize(11).fillColor('rgba(255,255,255,0.45)').font(FONT)
      .text('БАТЛАМЖ', 72, 60, { width: 580, characterSpacing: 4 });

    doc.fontSize(48).fillColor('#ffffff').font(FONT_BOLD)
      .text(userName, 72, 90, { width: 580 });

    doc.rect(72, 155, 80, 2).fill('#C9A84C');

    doc.fontSize(13).fillColor('#ffffff').font(FONT)
      .text(`Дараах үйл ажиллагаанд ${cert.hours} цаг оролцож амжилттай дуусгасныг гэрчилнэ`, 72, 168, { width: 580 });

    doc.fontSize(18).fillColor('#C9A84C').font(FONT_BOLD)
      .text(cert.activity_title, 72, 200, { width: 580 });

    const date = new Date(cert.issued_at).toLocaleDateString('mn-MN');
    const meta = [['Огноо', date, '#ffffff'], ['Цаг', `${cert.hours} цаг`, '#ffffff'], ['Төлөв', '✓ Баталгаажсан', '#C9A84C']];
    meta.forEach(([label, value, color], i) => {
      const x = 72 + i * 180;
      doc.fontSize(9).fillColor('#aaaaaa').font(FONT)
        .text(label.toUpperCase(), x, 280);
      doc.fontSize(14).fillColor(color).font(FONT_BOLD)
        .text(value, x, 296);
    });

    doc.fontSize(8).fillColor('#444444').font(FONT)
      .text(`SHA-256: ${cert.hash}`, 72, H - 30, { width: 700 });

    doc.end();
  });
};

module.exports = { generateCertificatePDF };
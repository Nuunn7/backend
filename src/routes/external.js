const express = require('express');
const router = express.Router();
const apiKey = require('../middlewares/apiKey');
const { getByIdentifier } = require('../services/certificate_service');
const { generateCertificatePDF } = require('../services/certfificate_pdf_service');

router.get('/students/:studentId/certifications/:certId/pdf', apiKey, async (req, res) => {
  const { studentId, certId } = req.params;
  try {
    const certs = await getByIdentifier(studentId);
    const cert = certs.find(c => c.id === parseInt(certId));
    if (!cert) return res.status(404).json({ message: 'Not found' });

    const pdf = await generateCertificatePDF(cert, cert.user_name);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${certId}.pdf"`);
    res.send(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
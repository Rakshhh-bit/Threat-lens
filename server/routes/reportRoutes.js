const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { listReports, getReport, exportReportHtml } = require('../controllers/reportController');

router.get('/', authMiddleware, listReports);
router.get('/:id', authMiddleware, getReport);
router.get('/:id/export', authMiddleware, exportReportHtml);

module.exports = router;

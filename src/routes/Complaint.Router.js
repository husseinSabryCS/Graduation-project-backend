const express = require('express');

const ComplaintController = require('../controllers/complaint.controller');
const Token = require('../middlewares/verifyToken');
const router = express.Router();



// Routes for Complaints
router.route('/complaints')
       .post(Token.verifyToken, Token.authorize([0]),ComplaintController.createComplaint)
       .get(Token.verifyToken, Token.authorize([1,2]),ComplaintController.getAllComplaints)
       .delete(Token.verifyToken, Token.authorize([1,2]),ComplaintController.deleteComplaint);
 router.route('/complaints/name')
       .get(Token.verifyToken, Token.authorize([0]),ComplaintController.getComplaintsByStudentName);

router.route('/complaints/reviewed')
       .put(Token.verifyToken, Token.authorize([1,2]),ComplaintController.updateComplaintReviewStatus);

module.exports = router;

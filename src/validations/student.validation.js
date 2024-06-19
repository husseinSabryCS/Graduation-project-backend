const { body } = require('express-validator');

class StudentValidator {
  static insertAdmissionRequest = [
    body('nationality')
    .trim()
    .notEmpty().withMessage('يجب إدخال الجنسية')
    .isIn(['وافد', 'مصرى', 'مصري']).withMessage('الجنسية غير صالحة')
    .optional({ nullable: true, checkFalsy: true }) // Make the field optional
    .default('مصري'), // Set the default value
    body('national_id').if(body('nationality').equals('مصرى')).notEmpty().isLength({ min: 14, max: 14 }),
    body('passport_number').if(body('nationality').equals('وافد')).notEmpty(),
    body('name').notEmpty(),
    body('high_school_department_from_abroad').optional(),
    body('student_id').optional(),
    body('password').optional(),
    body('confirm_password').optional(),
    body('date_of_birth').optional(),
    body('place_of_birth').optional(),
    body('phone').optional(),
    body('gender').trim().notEmpty().isIn(['ذكر', 'انثي']),
    body('religion').trim().notEmpty().isIn(['مسلم', 'مسيحي', 'يهودي']),
    body('residence_address').trim().notEmpty().isLength({ min: 3, max: 100 }),
    body('detailed_address').trim().notEmpty().isLength({ min: 3, max: 150 }),
    body('email').trim().notEmpty().isEmail(),
    body('mobile_number').trim().notEmpty().isLength({ min: 3, max: 50 }),
    body('father_name').if(body('nationality').equals('مصرى')).notEmpty().isLength({ min: 3, max: 70 }),
    body('father_national_id').if(body('nationality').equals('مصرى')).notEmpty().isLength({ min: 14, max: 14 }),
    body('father_occupation').optional(),
    body('father_phone_number').if(body('nationality').equals('مصرى')).optional().isLength({ min: 3, max: 50 }),
    body('guardian_name').optional(),
    body('guardian_national_id').if(body('nationality').equals('مصرى')).optional(),
    body('guardian_relationship').optional(),
    body('guardian_states').optional(),
    body('guardian_phone_number').optional(),
    body('parents_status').optional(),
    body('college').trim().notEmpty().isLength({ min: 3, max: 100 }),
    body('previous_academic_year_gpa').if(body('Student_type').equals('قديم')).notEmpty().isFloat({ min: 0, max: 4 }),
    body('Housing_in_previous_years').if(body('Student_type').equals('قديم')).notEmpty().isLength({ min: 3, max: 100 }),
    body('housing_type').trim().notEmpty().isIn(['مميز', 'عادي']),
    body('university_name').trim().notEmpty().isLength({ min: 3, max: 50 }),
    body('family_from_abroad').optional().isBoolean().default(false),
    body('special_needs').optional().isBoolean().default(false),
    body('Secondary_Division').if(body('Student_type').equals('مستجد')).notEmpty().isLength({ min: 3, max: 100 }),
    body('Total_grades_high_school').optional(),
    body('Passport_issuing_authority').if(body('nationality').equals('وافد')).notEmpty(),
  ];
}

module.exports = StudentValidator; 

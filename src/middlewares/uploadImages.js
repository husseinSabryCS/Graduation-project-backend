const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads"); // تعديل المسار إلى المجلد المخصص
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // يُفضل استخدام قيمة فريدة مثل id الخاص بالجامعة
    const university_id = req.body.university_id; // تأكد من توفر الـ university_id في الطلب

    // إذا لم يكن متوفرًا، يمكنك استخدام قيمة أخرى أو توليف قيمة فريدة
    if (!university_id) {
      return cb(new Error("يرجى تحديد university_id في الطلب"));
    }

    // يمكنك تخصيص اسم الملف باستخدام id الخاص بالجامعة
    const filename = `${university_id}${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });
module.exports = upload;

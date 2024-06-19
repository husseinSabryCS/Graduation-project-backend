const conn = require("../models/dbConnectoin");
const fs = require("fs");
const path = require("path");

class Supervising_systemController {
  static getMaleBuildings(req, res) {
    const gender = "ذكر";

    // استعلام لاختيار المباني بناءً على الجنس
    const selectBuildingsQuery = `SELECT * FROM buildings WHERE gender = ?`;

    conn.query(selectBuildingsQuery, [gender], (err, results) => {
      if (err) {
        console.error("خطأ في استرجاع المباني:", err.stack);
        return res.status(500).json({ error: "حدث خطأ أثناء استرجاع المباني" });
      }

      // إذا لم تكن هناك مباني، قم بإرجاع رسالة بالعثور على مبانٍ
      if (results.length === 0) {
        return res.status(404).json({ message: "لم يتم العثور على مبانٍ" });
      }

      // إرجاع المباني
      res.status(200).json({ buildings: results });
    });
  }

  static getFemaleBuildings(req, res) {
    const gender = "انثي";

    // استعلام لاختيار المباني بناءً على الجنس
    const selectBuildingsQuery = `SELECT * FROM buildings WHERE gender = ?`;

    conn.query(selectBuildingsQuery, [gender], (err, results) => {
      if (err) {
        console.error("خطأ في استرجاع المباني:", err.stack);
        return res.status(500).json({ error: "حدث خطأ أثناء استرجاع المباني" });
      }

      // إذا لم تكن هناك مباني، قم بإرجاع رسالة بالعثور على مبانٍ
      if (results.length === 0) {
        return res.status(404).json({ message: "لم يتم العثور على مبانٍ" });
      }

      // إرجاع المباني
      res.status(200).json({ buildings: results });
    });
  }

  //================================================================================
  static addBuilding = (req, res) => {
    const { name, gender } = req.body;
    const city_id = req.body.city_id || 1; // تعيين القيمة الافتراضية لـ city_id إلى 1 إذا لم يتم تقديم قيمة

    // التحقق من عدم وجود مبنى بنفس الاسم
    const checkBuildingQuery = "SELECT id FROM buildings WHERE name = ?";
    conn.query(checkBuildingQuery, [name], (err, results) => {
      if (err) {
        console.error("خطأ في التحقق من اسم المبنى:", err.stack);
        return res
          .status(500)
          .json({ error: "حدث خطأ أثناء التحقق من اسم المبنى" });
      }

      // إذا وجد مبنى بنفس الاسم، قم بإرجاع رسالة بأن المبنى موجود بالفعل
      if (results.length > 0) {
        return res.status(409).json({ error: "المبنى موجود بالفعل" });
      }

      // إذا لم يوجد مبنى بنفس الاسم، قم بإضافة المبنى
      const addBuildingQuery =
        "INSERT INTO buildings (name, city_id, gender) VALUES (?, ?, ?)";
      conn.query(addBuildingQuery, [name, city_id, gender], (err, result) => {
        if (err) {
          console.error("خطأ في إضافة المبنى:", err.stack);
          return res.status(500).json({ error: "حدث خطأ أثناء إضافة المبنى" });
        }

        // إذا تمت العملية بنجاح، قم بإرجاع رسالة بنجاح إضافة المبنى
        return res.status(200).json({ message: "تمت إضافة المبنى بنجاح" });
      });
    });
  };

  //=============================================================================================
  static addRoom = (req, res) => {
    const { room_number, type, cap } = req.body;
    const status = req.body.status || 1; // تعيين القيمة الافتراضية لـ status إلى 1 إذا لم يتم تقديم قيمة
    const building_id = req.query.building_id;

    // التحقق من وجود جميع المعلومات المطلوبة في جسم الطلب
    if (!room_number || !type || !building_id || !cap) {
      return res
        .status(400)
        .json({ error: "يجب تقديم رقم الغرفة والنوع ومعرف المبنى والسعة." });
    }

    // التحقق من وجود المبنى المحدد
    const checkBuildingQuery = "SELECT id FROM buildings WHERE id = ?";
    conn.query(checkBuildingQuery, [building_id], (err, results) => {
      if (err) {
        console.error("خطأ في التحقق من المبنى:", err.stack);
        return res
          .status(500)
          .json({ error: "حدث خطأ أثناء التحقق من المبنى" });
      }

      // إذا لم يتم العثور على المبنى، قم بإرجاع رسالة بأن المبنى غير موجود
      if (results.length === 0) {
        return res.status(404).json({ error: "المبنى المحدد غير موجود." });
      }

      // التحقق من عدم وجود غرفة بنفس الرقم في نفس المبنى
      const checkRoomQuery =
        "SELECT id FROM rooms WHERE room_number = ? AND building_id = ?";
      conn.query(checkRoomQuery, [room_number, building_id], (err, results) => {
        if (err) {
          console.error("خطأ في التحقق من رقم الغرفة:", err.stack);
          return res
            .status(500)
            .json({ error: "حدث خطأ أثناء التحقق من رقم الغرفة" });
        }

        // إذا وجدت غرفة بنفس الرقم في نفس المبنى، قم بإرجاع رسالة بأن الغرفة موجودة بالفعل
        if (results.length > 0) {
          return res
            .status(409)
            .json({ error: "الغرفة موجودة بالفعل في نفس المبنى." });
        }

        // إذا لم توجد غرفة بنفس الرقم في نفس المبنى، قم بإضافتها
        const addRoomQuery =
          "INSERT INTO rooms (room_number, type, status, building_id, cap) VALUES (?, ?, ?, ?, ?)";
        conn.query(
          addRoomQuery,
          [room_number, type, status, building_id, cap],
          (err, result) => {
            if (err) {
              console.error("خطأ في إضافة الغرفة:", err.stack);
              return res
                .status(500)
                .json({ error: "حدث خطأ أثناء إضافة الغرفة" });
            }

            // إذا تمت العملية بنجاح، قم بإرجاع رسالة بنجاح إضافة الغرفة
            return res.status(200).json({ message: "تمت إضافة الغرفة بنجاح" });
          }
        );
      });
    });
  };
  static updateRoomById = (req, res) => {
    const roomId = req.query.id; // استخراج معرف الغرفة من معلمة الطلب
    const { room_number, type, cap, status } = req.body;

    // التحقق من وجود الغرفة المراد تحديثها
    const checkRoomQuery = "SELECT * FROM rooms WHERE id = ?";
    conn.query(checkRoomQuery, [roomId], (err, results) => {
        if (err) {
            console.error("خطأ في التحقق من الغرفة:", err.stack);
            return res
                .status(500)
                .json({ error: "حدث خطأ أثناء التحقق من الغرفة" });
        }

        // التحقق مما إذا كانت الغرفة موجودة
        if (results.length === 0) {
            return res
                .status(404)
                .json({ error: "الغرفة المحددة غير موجودة." });
        }

        // تحديث معلومات الغرفة
        let updateFields = [];
        let updateValues = [];

        if (room_number !== undefined && room_number !== results[0].room_number) {
            updateFields.push('room_number = ?');
            updateValues.push(room_number);
        }

        if (type !== undefined && type !== results[0].type) {
            updateFields.push('type = ?');
            updateValues.push(type);
        }

        if (cap !== undefined && cap !== results[0].cap) {
            updateFields.push('cap = ?');
            updateValues.push(cap);
        }

        if (status !== undefined && status !== results[0].status) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }

        if (updateFields.length === 0) {
            // لم يتم تقديم أي بيانات للتحديث
            return res.status(400).json({ error: "لم يتم تقديم أي بيانات للتحديث." });
        }

        const updateRoomQuery = `
            UPDATE rooms
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `;

        conn.query(
            updateRoomQuery,
            [...updateValues, roomId],
            (err, result) => {
                if (err) {
                    console.error("خطأ في تحديث الغرفة:", err.stack);
                    return res
                        .status(500)
                        .json({ error: "حدث خطأ أثناء تحديث الغرفة" });
                }

                // إذا تم التحديث بنجاح، قم بإرجاع رسالة بنجاح
                return res.status(200).json({ message: "تم تحديث الغرفة بنجاح" });
            }
        );
    });
};

  //==========================================================================
  static getRoomsInBuilding = (req, res) => {
    const building_id = req.query.building_id;

    // التحقق من وجود معرف المبنى في استعلام الاستعلام
    if (!building_id) {
      return res.status(400).json({ error: "يجب تقديم معرف المبنى." });
    }

    // استعلام لاختيار الغرف في المبنى المحدد
    const selectRoomsQuery = "SELECT * FROM rooms WHERE building_id = ?";

    conn.query(selectRoomsQuery, [building_id], (err, results) => {
      if (err) {
        console.error("خطأ في استرجاع الغرف:", err.stack);
        return res.status(500).json({ error: "حدث خطأ أثناء استرجاع الغرف" });
      }

      // إذا لم يتم العثور على الغرف في المبنى المحدد، قم بإرجاع رسالة بأنه لا توجد غرف
      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "لا توجد غرف في المبنى المحدد" });
      }

      // إذا وجدت الغرف في المبنى المحدد، قم بإرجاعها
      res.status(200).json({ rooms: results });
    });
  };

  static getRoomById = (req, res) => {
    const room_id = req.query.room_id;

    // التحقق من وجود معرف الغرفة في استعلام الاستعلام
    if (!room_id) {
      return res.status(400).json({ error: "يجب تقديم معرف الغرفة." });
    }

    // استعلام لاختيار الغرفة بناءً على معرف الغرفة
    const selectRoomQuery = "SELECT * FROM rooms WHERE id = ?";

    conn.query(selectRoomQuery, [room_id], (err, results) => {
      if (err) {
        console.error("خطأ في استرجاع الغرفة:", err.stack);
        return res.status(500).json({ error: "حدث خطأ أثناء استرجاع الغرفة" });
      }

      // إذا لم يتم العثور على الغرفة بالمعرف المحدد، قم بإرجاع رسالة بأنه لا يوجد غرفة بهذا المعرف
      if (results.length === 0) {
        return res.status(404).json({ message: "لا توجد غرفة بهذا المعرف" });
      }

      // إذا تم العثور على الغرفة بالمعرف المحدد، قم بإرجاعها
      res.status(200).json({ room: results[0] });
    });
  };
}
module.exports = Supervising_systemController;

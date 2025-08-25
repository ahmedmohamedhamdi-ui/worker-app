import React, { useState, useEffect, useContext } from "react";
import "./addworker.css";
import { Namevalue, Jobvalue, Idvalue } from "../Contextdata";
import { db } from "../../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { useLocation } from "react-router-dom";

export const Addworker = () => {
  const { name, setName } = useContext(Namevalue);
  const { job, setJob } = useContext(Jobvalue);
  const { idValue, setIdValue } = useContext(Idvalue);

  const [workerId, setWorkerId] = useState(null);

  // الحقول الجديدة
  const [nationality, setNationality] = useState("");
  const [religion, setReligion] = useState("");
  const [fileNumber, setFileNumber] = useState("");
  const [housing, setHousing] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [room, setRoom] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const location = useLocation();
  const worker = location.state?.worker;

  useEffect(() => {
    if (worker) {
      setName(worker.name || "");
      setJob(worker.job || "");
      setIdValue(worker.idValue || "");
      setWorkerId(worker.id || null);

      // الحقول الجديدة
      setNationality(worker.nationality || "");
      setReligion(worker.religion || "");
      setFileNumber(worker.fileNumber || "");
      setHousing(worker.housing || "");
      setFloor(worker.floor || "");
      setApartment(worker.apartment || "");
      setRoom(worker.room || "");
      setPhone(worker.phone || "");
      setNotes(worker.notes || "");
    }
  }, [worker, setName, setJob, setIdValue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (workerId) {
        const workerRef = doc(db, "workers", workerId);
        await updateDoc(workerRef, {
          name,
          job,
          idValue,
          nationality,
          religion,
          fileNumber,
          housing,
          floor,
          apartment,
          room,
          phone,
          notes,
        });
        alert("تم تحديث بيانات العامل ✅");
      } else {
        await addDoc(collection(db, "workers"), {
          name,
          job,
          idValue,
          nationality,
          religion,
          fileNumber,
          housing,
          floor,
          apartment,
          room,
          phone,
          notes,
          createdAt: new Date(),
        });
        alert("تم إضافة العامل بنجاح ✅");
      }

      // إعادة تعيين القيم
      setName("");
      setJob("");
      setIdValue("");
      setWorkerId(null);

      setNationality("");
      setReligion("");
      setFileNumber("");
      setHousing("");
      setFloor("");
      setApartment("");
      setRoom("");
      setPhone("");
      setNotes("");
    } catch (error) {
      console.error("خطأ في إرسال البيانات:", error);
      alert("حدث خطأ أثناء الإرسال ❌");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="container mt-5 p-4 rounded shadow-lg"
    >
      <div className="row g-3">
        {/* الجنسية */}
        <div className="col-md-6">
          <label className="form-label text-white">الجنسية / Nationality</label>
          <select
            className="form-select text-dark"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          >
            <option value="">اختر الجنسية / Select nationality</option>
            <option value="Egyptian">مصري / Egyptian</option>
            <option value="Indian">هندي / Indian</option>
            <option value="Pakistani">باكستاني / Pakistani</option>
          </select>
        </div>

        {/* الاسم */}
        <div className="col-md-6">
          <label className="form-label text-white">الاسم / Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control text-dark"
          />
        </div>

        {/* الديانة */}
        <div className="col-md-6">
          <label className="form-label text-white">الديانة / Religion</label>
          <input
            type="text"
            value={religion}
            onChange={(e) => setReligion(e.target.value)}
            className="form-control text-dark"
          />
        </div>

        {/* رقم الإقامة أو جواز السفر */}
        <div className="col-md-6">
          <label className="form-label text-white">
            رقم الإقامة أو جواز السفر / ID or Passport No.
          </label>
          <input
            type="text"
            value={idValue}
            onChange={(e) => setIdValue(e.target.value)}
            className="form-control text-dark"
          />
        </div>

        {/* رقم الملف */}
        <div className="col-md-6">
          <label className="form-label text-white">
            رقم الملف / File Number
          </label>
          <input
            type="text"
            value={fileNumber}
            onChange={(e) => setFileNumber(e.target.value)}
            className="form-control text-dark"
          />
        </div>

        {/* الوظيفة */}
        <div className="col-md-6">
          <label className="form-label text-white">الوظيفة / Job</label>
          <input
            type="text"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            className="form-control text-dark"
          />
        </div>

        {/* السكن */}
        <div className="col-md-6">
          <label className="form-label text-white">اسم السكن / Housing</label>
          <select
            className="form-select text-dark"
            value={housing}
            onChange={(e) => setHousing(e.target.value)}
          >
            <option value="">اختر السكن / Select housing</option>
            <option value="Camp A">سكن أ / Camp A</option>
            <option value="Camp B">سكن ب / Camp B</option>
          </select>
        </div>

        {/* رقم الدور */}
        <div className="col-md-6">
          <label className="form-label text-white">رقم الدور / Floor</label>
          <input
            type="number"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="form-control text-dark"
          />
        </div>

        {/* رقم الشقة */}
        <div className="col-md-4">
          <label className="form-label text-white">رقم الشقة / Apartment</label>
          <input
            type="number"
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
            className="form-control text-dark"
          />
        </div>

        {/* رقم الغرفة */}
        <div className="col-md-2">
          <label className="form-label text-white">رقم الغرفة / Room</label>
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="form-control text-dark"
          />
        </div>

        {/* رقم الجوال */}
        <div className="col-md-6">
          <label className="form-label text-white">رقم الجوال / Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="form-control text-dark"
          />
        </div>

        {/* الملاحظات */}
        <div className="col-12">
          <label className="form-label text-white">ملاحظات / Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-control text-dark"
          />
        </div>
      </div>

      <button type="submit" className="btn btn-success w-100 mt-3">
        {workerId ? "تحديث" : "إضافة"}
      </button>
    </form>
  );
};

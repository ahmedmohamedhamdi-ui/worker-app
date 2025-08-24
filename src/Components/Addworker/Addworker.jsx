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

  const location = useLocation();
  const worker = location.state?.worker;

  useEffect(() => {
    if (worker) {
      setName(worker.name || "");
      setJob(worker.job || "");
      setIdValue(worker.idValue || ""); // رقم الإقامة المستخدم
      setWorkerId(worker.id || null); // Firestore doc id
    }
  }, [worker, setName, setJob, setIdValue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (workerId) {
        // تعديل عامل موجود
        const workerRef = doc(db, "workers", workerId);
        await updateDoc(workerRef, { name, job, idValue });
        alert("تم تحديث بيانات العامل ✅");
      } else {
        // إضافة عامل جديد
        await addDoc(collection(db, "workers"), {
          name,
          job,
          idValue, // رقم الإقامة اللي دخله المستخدم
          createdAt: new Date(),
        });
        alert("تم إضافة العامل بنجاح ✅");
      }

      // إعادة تعيين القيم بعد الإضافة أو التعديل
      setName("");
      setJob("");
      setIdValue("");
      setWorkerId(null);
    } catch (error) {
      console.error("خطأ في إرسال البيانات:", error);
      alert("حدث خطأ أثناء الإرسال ❌");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="container mt-5 p-4 bg-dark rounded shadow-lg"
    >
      <div className="mb-3">
        <label className="form-label text-white fw-bold">: الاسم</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label text-white fw-bold">: المهنة</label>
        <input
          type="text"
          value={job}
          onChange={(e) => setJob(e.target.value)}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label text-white fw-bold">: رقم الإقامة</label>
        <input
          type="text"
          value={idValue}
          onChange={(e) => setIdValue(e.target.value)}
          className="form-control"
        />
      </div>

      <button type="submit" className="btn btn-success w-100 fw-bold">
        {workerId ? "تحديث" : "إضافة"}
      </button>
    </form>
  );
};

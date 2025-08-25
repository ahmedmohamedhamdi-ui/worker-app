import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./workers.css";

export const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState(null);
  const navigate = useNavigate();

  // جلب العمال وترقيمهم
  const fetchWorkers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "workers"));
      const data = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((worker) => worker.idValue);

      // إعادة الترقيم
      const reIndexed = data.map((worker, i) => ({
        ...worker,
        index: i + 1,
      }));

      setWorkers(reIndexed);
    } catch (error) {
      console.error("Error fetching workers: ", error);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleEdit = (worker) => {
    navigate("/addworker", { state: { worker } });
  };

  const handleDeleteClick = (worker) => {
    setWorkerToDelete(worker);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "workers", workerToDelete.id));

      // إعادة الترقيم بعد الحذف
      const updatedWorkers = workers
        .filter((w) => w.id !== workerToDelete.id)
        .map((w, i) => ({ ...w, index: i + 1 }));

      setWorkers(updatedWorkers);
      setShowConfirm(false);
      setWorkerToDelete(null);
      alert("تم حذف العامل ✅");
    } catch (error) {
      console.error("خطأ في الحذف:", error);
      alert("حدث خطأ أثناء الحذف ❌");
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setWorkerToDelete(null);
  };

  return (
    <div
      className="container-fluid mt-5"
      style={{ width: "85%", margin: "auto" }}
    >
      <h2 className="text-center text-white p-3 rounded shadow">
        قائمة العمال
      </h2>

      {workers.length === 0 ? (
        <p className="text-center text-muted mt-3">لا يوجد عمال بعد</p>
      ) : (
        <div className="table-responsive mt-4">
          <table className="table table-striped table-bordered table-hover text-center align-middle shadow">
            <thead className="table-orange">
              <tr className="datahead">
                <th>#</th>
                <th>الاسم / Name</th>
                <th>الجنسيه / Nationality</th>
                <th>الديانه / Religion</th>
                <th>رقم الإقامة / ID</th>
                <th>رقم الملف / File No.</th>
                <th>الوظيفة / Job</th>
                <th>السكن / Housing</th>
                <th>رقم الدور / Floor</th>
                <th>رقم الشقة / Apartment</th>
                <th>رقم الغرفة / Room</th>
                <th>رقم الجوال / Phone</th>
                <th>ملاحظات / Notes</th>
                <th>تعديلات / Edit</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr className="datarow" key={worker.id}>
                  <td>{worker.index}</td>
                  <td>{worker.name}</td>
                  <td>{worker.nationality}</td>
                  <td>{worker.religion}</td>
                  <td>{worker.idValue}</td>
                  <td>{worker.fileNumber}</td>
                  <td>{worker.job}</td>
                  <td>{worker.housing}</td>
                  <td>{worker.floor}</td>
                  <td>{worker.apartment}</td>
                  <td>{worker.room}</td>
                  <td>{worker.phone}</td>
                  <td>{worker.notes}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(worker)}
                    >
                      تعديل / Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteClick(worker)}
                    >
                      حذف / Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showConfirm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">تأكيد الحذف</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cancelDelete}
                ></button>
              </div>
              <div className="modal-body">
                <p>هل أنت متأكد من حذف العامل "{workerToDelete.name}"؟</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={cancelDelete}>
                  رجوع
                </button>
                <button className="btn btn-danger" onClick={confirmDelete}>
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

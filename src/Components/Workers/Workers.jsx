import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "workers"));
        const data = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((worker) => worker.idValue); // ✅ يظهر فقط اللي عنده رقم إقامة
        setWorkers(data);
      } catch (error) {
        console.error("Error fetching workers: ", error);
      }
    };
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
      setWorkers(workers.filter((w) => w.id !== workerToDelete.id));
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
    <div className="container mt-5">
      <h2 className="text-center text-white p-3 rounded shadow">
        قائمة العمال
      </h2>

      {workers.length === 0 ? (
        <p className="text-center text-muted mt-3">لا يوجد عمال بعد</p>
      ) : (
        <div className="table-responsive mt-4">
          <table className="table table-striped table-bordered text-center align-middle shadow">
            <thead className="table-dark">
              <tr>
                <th>الاسم</th>
                <th>المهنة</th>
                <th>رقم الإقامة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr key={worker.id}>
                  <td>{worker.name}</td>
                  <td>{worker.job}</td>
                  <td>{worker.idValue}</td> {/* ✅ رقم الإقامة */}
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(worker)}
                    >
                      تعديل
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteClick(worker)}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup التأكيد */}
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

import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./workers.css";

export const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedWorkers, setSelectedWorkers] = useState([]); // ✅ العمال المحددين
  const navigate = useNavigate();

  // جلب العمال
  const fetchWorkers = async () => {
    try {
      const q = query(collection(db, "workers"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const reIndexed = data.map((worker, i) => ({
        ...worker,
        index: i + 1,
        source: "firestore",
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
      if (workerToDelete.id) {
        await deleteDoc(doc(db, "workers", workerToDelete.id));
      }
      const updatedWorkers = workers
        .filter((w) => w.index !== workerToDelete.index)
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

  // ✅ مسح جميع العمال
  const deleteAllWorkers = async () => {
    if (!window.confirm("⚠️ هل أنت متأكد أنك تريد مسح جميع العمال؟")) return;
    try {
      const querySnapshot = await getDocs(collection(db, "workers"));
      const deletePromises = querySnapshot.docs.map((document) =>
        deleteDoc(doc(db, "workers", document.id))
      );
      await Promise.all(deletePromises);
      setWorkers([]);
      setSelectedWorkers([]);
      alert("تم مسح جميع العمال بنجاح ✅");
    } catch (error) {
      console.error("خطأ في مسح جميع العمال:", error);
      alert("حدث خطأ أثناء مسح جميع العمال ❌");
    }
  };

  // ✅ مسح العمال المحددين فقط
  const deleteSelectedWorkers = async () => {
    if (selectedWorkers.length === 0) {
      alert("⚠️ من فضلك حدد عمال أولاً");
      return;
    }
    if (!window.confirm("هل تريد حذف العمال المحددين؟")) return;
    try {
      const deletePromises = selectedWorkers.map((id) =>
        deleteDoc(doc(db, "workers", id))
      );
      await Promise.all(deletePromises);
      const updatedWorkers = workers.filter(
        (worker) => !selectedWorkers.includes(worker.id)
      );
      setWorkers(updatedWorkers);
      setSelectedWorkers([]);
      alert("تم حذف العمال المحددين ✅");
    } catch (error) {
      console.error("خطأ في حذف العمال المحددين:", error);
      alert("حدث خطأ أثناء الحذف ❌");
    }
  };

  // رفع ملف Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const mappedData = jsonData.map((row, i) => ({
        index: i + 1,
        name: row["Name"] || row["الاسم"] || "",
        nationality: row["Nationality"] || row["الجنسيه"] || "",
        religion: row["Religion"] || row["الديانه"] || "",
        idValue: row["ID"] || row["رقم الإقامة"] || "",
        fileNumber: row["File No."] || row["رقم الملف"] || "",
        job: row["Job"] || row["الوظيفة"] || "",
        housing: row["Housing"] || row["السكن"] || "",
        floor: row["Floor"] || row["رقم الدور"] || "",
        apartment: row["Apartment"] || row["رقم الشقة"] || "",
        room: row["Room"] || row["رقم الغرفة"] || "",
        phone: row["Phone"] || row["رقم الجوال"] || "",
        notes: row["Notes"] || row["ملاحظات"] || "",
        source: "excel",
      }));

      const reversedData = mappedData.reverse();
      setWorkers(reversedData);
      setExcelData(reversedData);
    };

    reader.readAsArrayBuffer(file);
  };

  // رفع بيانات Excel
  const saveExcelDataToFirestore = async () => {
    try {
      for (let worker of excelData) {
        await addDoc(collection(db, "workers"), {
          name: worker.name,
          nationality: worker.nationality,
          religion: worker.religion,
          idValue: worker.idValue,
          fileNumber: worker.fileNumber,
          job: worker.job,
          housing: worker.housing,
          floor: worker.floor,
          apartment: worker.apartment,
          room: worker.room,
          phone: worker.phone,
          notes: worker.notes,
          createdAt: new Date(),
        });
      }
      alert("تم حفظ جميع بيانات Excel في قاعدة البيانات ✅");
      fetchWorkers();
      setExcelData([]);
    } catch (error) {
      console.error("خطأ في حفظ البيانات:", error);
      alert("حدث خطأ أثناء الحفظ ❌");
    }
  };

  // ✅ تحديث الفلاتر
  const handleFilterChange = (e, column) => {
    setFilters({
      ...filters,
      [column]: e.target.value,
    });
  };

  // ✅ تطبيق الفلاتر
  const filteredWorkers = workers.filter((worker) =>
    Object.keys(filters).every((key) =>
      worker[key]
        ?.toString()
        .toLowerCase()
        .includes(filters[key]?.toLowerCase() || "")
    )
  );

  // ✅ اختيار/إلغاء عامل
  const toggleSelectWorker = (id) => {
    setSelectedWorkers((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  // ✅ اختيار/إلغاء الكل
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedWorkers(filteredWorkers.map((worker) => worker.id));
    } else {
      setSelectedWorkers([]);
    }
  };

  return (
    <div
      className="container-fluid mt-5 workers-page"
      style={{ width: "85%", margin: "auto" }}
    >
      <h2 className="text-center text-white p-3 rounded shadow">
        قائمة العمال
      </h2>

      {/* رفع ملف Excel + زرار مسح جميع العمال + زرار مسح المحددين */}
      <div className="text-center mt-3">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="form-control w-50 mx-auto"
        />
        {excelData.length > 0 && (
          <button
            className="btn btn-success mt-2 mx-2"
            onClick={saveExcelDataToFirestore}
          >
            حفظ بيانات Excel
          </button>
        )}
        {workers.length > 0 && (
          <>
            <button
              className="btn btn-danger mt-2 mx-2"
              onClick={deleteAllWorkers}
            >
              🗑️ مسح جميع العمال
            </button>
            <button
              className="btn btn-warning mt-2"
              onClick={deleteSelectedWorkers}
            >
              🗑️ مسح العمال المحددين
            </button>
          </>
        )}
      </div>

      {workers.length === 0 ? (
        <p className="text-center text-muted mt-3">لا يوجد عمال بعد</p>
      ) : (
        <div className="workers-table-wrap mt-4">
          <table className="table table-striped table-bordered table-hover text-center align-middle shadow workers-table">
            <thead className="table-orange">
              <tr className="datahead">
                <th>
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={
                      selectedWorkers.length === filteredWorkers.length &&
                      filteredWorkers.length > 0
                    }
                  />
                </th>
                <th>No#م</th>
                <th>الاسم /Name</th>
                <th>Nationality/ الجنسية</th>
                <th>Religion/دِين</th>
                <th>رقم الاقامة/Iqama Number</th>
                <th>رقم الملف/File Number</th>
                <th>الوظيفة /Job</th>
                <th>Residence name/ اسم السكن</th>
                <th>رقم الدور/Floor Number</th>
                <th>رقم الشقة/Apartment Number</th>
                <th>رقم الغرفة /Room Number</th>
                <th>رقم الجوال /Mobile Number</th>
                <th>Notes</th>
                <th>تعديلات / Edit</th>
              </tr>
              {/* ✅ صف الفلاتر */}
              <tr>
                <th></th>
                {[
                  "index",
                  "name",
                  "nationality",
                  "religion",
                  "idValue",
                  "fileNumber",
                  "job",
                  "housing",
                  "floor",
                  "apartment",
                  "room",
                  "phone",
                  "notes",
                ].map((col) => (
                  <th key={col}>
                    {col !== "index" && (
                      <input
                        type="text"
                        placeholder="فلترة"
                        value={filters[col] || ""}
                        onChange={(e) => handleFilterChange(e, col)}
                        className="form-control form-control-sm"
                      />
                    )}
                  </th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((worker) => (
                <tr key={worker.id || worker.index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedWorkers.includes(worker.id)}
                      onChange={() => toggleSelectWorker(worker.id)}
                    />
                  </td>
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

      {/* ✅ مودال الحذف الفردي */}
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
                <p>هل أنت متأكد من حذف العامل "{workerToDelete?.name}"؟</p>
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

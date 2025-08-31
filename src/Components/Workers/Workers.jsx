// src/Components/Workers/Workers.jsx
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
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./workers.css";

export default function Workers({ isLoggedIn, setIsLoggedIn }) {
  const [workers, setWorkers] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [filters, setFilters] = useState({});
  // ⬇️ تحسين اختيار العمال باستخدام Set بدل المصفوفة
  const [selectedWorkers, setSelectedWorkers] = useState(new Set());
  const [showTransfer, setShowTransfer] = useState(false);
  const [workerToTransfer, setWorkerToTransfer] = useState(null);
  const [newResidence, setNewResidence] = useState("");
  const [showTransferMultiple, setShowTransferMultiple] = useState(false);
  const [newResidenceMultiple, setNewResidenceMultiple] = useState("");

  // ⬇️ ترقيم الصفحات
  const PAGE_SIZE = 50;
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const residenceOptions = [
    "al wafa",
    "al falah",
    "al fadila",
    "al sanabl",
    "al abra",
  ];

  const fetchWorkers = async () => {
    try {
      const q = query(collection(db, "workers"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((docu) => ({
        id: docu.id,
        ...docu.data(),
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

  const handleTransferClick = (worker) => {
    setWorkerToTransfer(worker);
    setNewResidence(worker.housing || "");
    setShowTransfer(true);
  };

  // ⬇️ دالة مساعدة لصياغة نص الملاحظة
  const buildTransferNote = (oldH, newH) => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `transferd from ${
      oldH || "none"
    } to ${newH} /  date : ${yyyy}/${mm}/${dd}`;
  };

  const confirmTransfer = async () => {
    try {
      if (workerToTransfer?.id && newResidence) {
        const workerRef = doc(db, "workers", workerToTransfer.id);
        const oldHousing = workerToTransfer.housing || "";
        const oldNotes = workerToTransfer.notes || "";
        const noteLine = buildTransferNote(oldHousing, newResidence);
        const newNotes = oldNotes ? `${oldNotes} | ${noteLine}` : noteLine;

        await updateDoc(workerRef, { housing: newResidence, notes: newNotes });

        const updatedWorkers = workers.map((w) =>
          w.id === workerToTransfer.id
            ? { ...w, housing: newResidence, notes: newNotes }
            : w
        );
        setWorkers(updatedWorkers);
        setShowTransfer(false);
        setWorkerToTransfer(null);
        alert("تم نقل العامل بنجاح ✅");
      }
    } catch (error) {
      console.error("خطأ في النقل:", error);
      alert("حدث خطأ أثناء النقل ❌");
    }
  };

  const handleTransferMultipleClick = () => {
    if (selectedWorkers.size === 0) {
      alert("⚠️ من فضلك حدد عمال أولاً");
      return;
    }
    setShowTransferMultiple(true);
    setNewResidenceMultiple(residenceOptions[0] || "");
  };

  const confirmTransferMultiple = async () => {
    try {
      if (!newResidenceMultiple) return;

      const ids = Array.from(selectedWorkers);

      const updates = ids.map((id) => {
        const w = workers.find((x) => x.id === id);
        const oldHousing = w?.housing || "";
        const oldNotes = w?.notes || "";
        const noteLine = buildTransferNote(oldHousing, newResidenceMultiple);
        const newNotes = oldNotes ? `${oldNotes} | ${noteLine}` : noteLine;

        return updateDoc(doc(db, "workers", id), {
          housing: newResidenceMultiple,
          notes: newNotes,
        });
      });

      await Promise.all(updates);

      const updatedWorkers = workers.map((w) =>
        selectedWorkers.has(w.id)
          ? {
              ...w,
              housing: newResidenceMultiple,
              notes:
                (w.notes ? `${w.notes} | ` : "") +
                buildTransferNote(w.housing || "", newResidenceMultiple),
            }
          : w
      );

      setWorkers(updatedWorkers);
      setSelectedWorkers(new Set());
      setShowTransferMultiple(false);
      alert("تم نقل العمال المحددين بنجاح ✅");
    } catch (error) {
      console.error("خطأ في نقل العمال المحددين:", error);
      alert("حدث خطأ أثناء النقل ❌");
    }
  };

  const deleteAllWorkers = async () => {
    if (!window.confirm("⚠️ هل أنت متأكد أنك تريد مسح جميع العمال؟")) return;
    try {
      const querySnapshot = await getDocs(collection(db, "workers"));
      const deletePromises = querySnapshot.docs.map((document) =>
        deleteDoc(doc(db, "workers", document.id))
      );
      await Promise.all(deletePromises);
      setWorkers([]);
      setSelectedWorkers(new Set());
      alert("تم مسح جميع العمال بنجاح ✅");
    } catch (error) {
      console.error("خطأ في مسح جميع العمال:", error);
      alert("حدث خطأ أثناء مسح جميع العمال ❌");
    }
  };

  const deleteSelectedWorkers = async () => {
    if (selectedWorkers.size === 0) {
      alert("⚠️ من فضلك حدد عمال أولاً");
      return;
    }
    if (!window.confirm("هل تريد حذف العمال المحددين؟")) return;
    try {
      const ids = Array.from(selectedWorkers);
      const deletePromises = ids.map((id) => deleteDoc(doc(db, "workers", id)));
      await Promise.all(deletePromises);
      const updatedWorkers = workers
        .filter((worker) => !selectedWorkers.has(worker.id))
        .map((w, i) => ({ ...w, index: i + 1 }));
      setWorkers(updatedWorkers);
      setSelectedWorkers(new Set());
      alert("تم حذف العمال المحددين ✅");
    } catch (error) {
      console.error("خطأ في حذف العمال المحددين:", error);
      alert("حدث خطأ أثناء الحذف ❌");
    }
  };

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

      setWorkers(mappedData.reverse());
      setExcelData(mappedData.reverse());
      setCurrentPage(1); // رجّع لأول صفحة بعد التحميل
    };
    reader.readAsArrayBuffer(file);
  };

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
      await fetchWorkers();
      setExcelData([]);
      setCurrentPage(1);
    } catch (error) {
      console.error("خطأ في حفظ البيانات:", error);
      alert("حدث خطأ أثناء الحفظ ❌");
    }
  };

  const handleFilterChange = (e, column) => {
    setFilters({
      ...filters,
      [column]: e.target.value,
    });
    setCurrentPage(1); // رجّع لأول صفحة عند تغيير الفلتر
  };

  const filteredWorkers = workers.filter((worker) =>
    Object.keys(filters).every((key) =>
      worker[key]
        ?.toString()
        .toLowerCase()
        .includes((filters[key] || "").toLowerCase())
    )
  );

  // ⬇️ حساب الصفحات
  const totalPages = Math.max(1, Math.ceil(filteredWorkers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedWorkers = filteredWorkers.slice(startIndex, endIndex);

  const toggleSelectWorker = (id) => {
    if (!id) return;
    setSelectedWorkers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      // نفس منطقك القديم: اختيار كل العمال في النتائج المفلترة (مش بس الصفحة الحالية)
      const allIds = filteredWorkers.filter((w) => !!w.id).map((w) => w.id);
      setSelectedWorkers(new Set(allIds));
    } else {
      setSelectedWorkers(new Set());
    }
  };

  const goFirst = () => setCurrentPage(1);
  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setCurrentPage(totalPages);

  return (
    <div
      className="container-fluid mt-5 workers-page"
      style={{ width: "100%", margin: "auto" }}
    >
      <h2 className="text-center text-white p-3 rounded shadow">
        قائمة العمال
      </h2>

      {isLoggedIn && (
        <div className="text-center my-3">
          <button
            className="btn btn-danger"
            onClick={() => setIsLoggedIn(false)}
          >
            Logout
          </button>
        </div>
      )}

      {isLoggedIn && (
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
                className="btn btn-warning mt-2 mx-2"
                onClick={deleteSelectedWorkers}
              >
                🗑️ مسح العمال المحددين
              </button>
              <button
                className="btn  mt-2 mx-2"
                onClick={handleTransferMultipleClick}
                style={{ backgroundColor: "green", color: "white" }}
              >
                🚚 نقل العمال المحددين
              </button>
            </>
          )}
        </div>
      )}

      {/* جدول العمال */}
      {workers.length === 0 ? (
        <p className="text-center text-muted mt-3">لا يوجد عمال بعد</p>
      ) : (
        <>
          {/* ⬇️ لف الجدول بوعاء قابل للتمرير لتعمل خاصية sticky */}
          <div
            className="workers-table-wrap mt-4 cursor-pointer"
            style={{
              maxHeight: "120vh",
              overflow: "auto",
              borderRadius: 8,
              border: "1px solid #dddddd41",
            }}
          >
            <table
              className="table-bordered text-center align-middle cursor-pointer"
              style={{ width: "100%" }}
            >
              <thead>
                <tr className="custom-row">
                  {isLoggedIn && (
                    <th
                      style={{
                        position: "sticky",
                        top: 0,

                        zIndex: 3,
                      }}
                    >
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={
                          selectedWorkers.size > 0 &&
                          selectedWorkers.size ===
                            filteredWorkers.filter((w) => !!w.id).length &&
                          filteredWorkers.filter((w) => !!w.id).length > 0
                        }
                      />
                    </th>
                  )}
                  {[
                    "No#",
                    "Name",
                    "Nationality",
                    "Religion",
                    "Iqama Number",
                    "File Number",
                    "Job",
                    "Residence",
                    "Floor",
                    "Apartment",
                    "Room",
                    "Mobile",
                    "Notes",
                    ...(isLoggedIn ? ["Editing"] : []),
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        position: "sticky",
                        top: 0,

                        zIndex: 2,
                        color: "white",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>

                {/* صف الفلتر */}
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  {isLoggedIn && (
                    <th
                      style={{
                        position: "sticky",
                        top: 42, // ارتفاع الصف الأول التقريبي

                        zIndex: 3,
                      }}
                    ></th>
                  )}
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
                    <th
                      key={col}
                      style={{
                        position: "sticky",
                        top: 42,

                        zIndex: 2,
                        color: "white",
                      }}
                    >
                      {col !== "index" && (
                        <input
                          type="text"
                          placeholder="Filter"
                          value={filters[col] || ""}
                          onChange={(e) => handleFilterChange(e, col)}
                          className="form-control form-control-sm"
                        />
                      )}
                    </th>
                  ))}
                  {isLoggedIn && (
                    <th
                      style={{
                        position: "sticky",
                        top: 42,

                        zIndex: 2,
                        color: "white",
                      }}
                    ></th>
                  )}
                </tr>
              </thead>

              <tbody>
                {paginatedWorkers.map((worker, i) => {
                  const isSelected =
                    !!worker.id && selectedWorkers.has(worker.id);
                  const rowNumber = startIndex + i + 1; // رقم الصف مع مراعاة الصفحة
                  return (
                    <tr
                      key={worker.id || `${worker.name}-${rowNumber}`}
                      style={{
                        backgroundColor: isSelected
                          ? "rgb(255, 201, 131)"
                          : "transparent",
                      }}
                    >
                      {isLoggedIn && (
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectWorker(worker.id)}
                            disabled={!worker.id}
                            title={
                              worker.id
                                ? ""
                                : "احفظ البيانات أولًا قبل التحديد/الحذف"
                            }
                          />
                        </td>
                      )}
                      <td>{rowNumber}</td>
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
                      <td
                        title={worker.notes} // ده اللي بيظهر النص كامل لما توقف بالماوس
                        style={{
                          maxWidth: "150px", // عرض محدد
                          whiteSpace: "nowrap", // يمنع نزول النص لسطر تاني
                          overflow: "hidden", // يخفي الزيادة
                          textOverflow: "ellipsis", // يجيب "..."
                          cursor: "pointer", // شكل اليد عشان تبقى واضحة إنها تتشاف
                          backgroundColor:
                            worker.notes && worker.notes.trim() !== ""
                              ? "#fff3b0"
                              : "",
                          // اصفر فاتح لو فيه نص
                        }}
                      >
                        {worker.notes}
                      </td>
                      {isLoggedIn && (
                        <td>
                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => handleEdit(worker)}
                          >
                            تعديل
                          </button>
                          <button
                            className="btn btn-danger btn-sm me-2"
                            onClick={() => handleDeleteClick(worker)}
                          >
                            حذف
                          </button>
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => handleTransferClick(worker)}
                          >
                            نقل
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ⬇️ تحكم التصفح بين الصفحات */}
          <div className="d-flex justify-content-center align-items-center gap-2 mt-3 pages color-black">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={goFirst}
              disabled={safePage === 1}
            >
              ⏮️ الأول
            </button>
            <button
              className="btn btn-outline-secondary btn-sm "
              onClick={goPrev}
              disabled={safePage === 1}
            >
              ◀️ السابق
            </button>
            <span className="mx-2">
              صفحة {safePage} من {totalPages} — عدد السجلات:{" "}
              {filteredWorkers.length}
            </span>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={goNext}
              disabled={safePage === totalPages}
              style={{ color: "black", backgroundColor: "white" }}
            >
              التالي ▶️
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={goLast}
              disabled={safePage === totalPages}
            >
              الأخير ⏭️
            </button>
          </div>
        </>
      )}

      {/* مودال الحذف */}
      {showConfirm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
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
                <p>هل تريد حذف العامل {workerToDelete.name}؟</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={cancelDelete}>
                  إلغاء
                </button>
                <button className="btn btn-danger" onClick={confirmDelete}>
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال النقل لعامل واحد */}
      {showTransfer && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">نقل العامل</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowTransfer(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>اختر السكن الجديد للعامل {workerToTransfer.name}</p>
                <select
                  className="form-control"
                  value={newResidence}
                  onChange={(e) => setNewResidence(e.target.value)}
                >
                  {residenceOptions.map((res) => (
                    <option key={res} value={res}>
                      {res}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowTransfer(false)}
                >
                  إلغاء
                </button>
                <button className="btn btn-primary" onClick={confirmTransfer}>
                  نقل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال النقل لعدة عمال */}
      {showTransferMultiple && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">نقل العمال المحددين</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowTransferMultiple(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>اختر السكن الجديد للعمال المحددين</p>
                <select
                  className="form-control"
                  value={newResidenceMultiple}
                  onChange={(e) => setNewResidenceMultiple(e.target.value)}
                >
                  {residenceOptions.map((res) => (
                    <option key={res} value={res}>
                      {res}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowTransferMultiple(false)}
                >
                  إلغاء
                </button>
                <button
                  className="btn btn-primary"
                  onClick={confirmTransferMultiple}
                >
                  نقل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

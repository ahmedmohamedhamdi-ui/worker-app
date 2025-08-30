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
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [showTransfer, setShowTransfer] = useState(false);
  const [workerToTransfer, setWorkerToTransfer] = useState(null);
  const [newResidence, setNewResidence] = useState("");
  const [showTransferMultiple, setShowTransferMultiple] = useState(false);
  const [newResidenceMultiple, setNewResidenceMultiple] = useState("");
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

  const confirmTransfer = async () => {
    try {
      if (workerToTransfer?.id && newResidence) {
        const workerRef = doc(db, "workers", workerToTransfer.id);
        await updateDoc(workerRef, { housing: newResidence });

        const updatedWorkers = workers.map((w) =>
          w.id === workerToTransfer.id ? { ...w, housing: newResidence } : w
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
    if (selectedWorkers.length === 0) {
      alert("⚠️ من فضلك حدد عمال أولاً");
      return;
    }
    setShowTransferMultiple(true);
    setNewResidenceMultiple(residenceOptions[0] || "");
  };

  const confirmTransferMultiple = async () => {
    try {
      if (!newResidenceMultiple) return;
      const updatePromises = selectedWorkers.map((id) =>
        updateDoc(doc(db, "workers", id), { housing: newResidenceMultiple })
      );
      await Promise.all(updatePromises);
      const updatedWorkers = workers.map((w) =>
        selectedWorkers.includes(w.id)
          ? { ...w, housing: newResidenceMultiple }
          : w
      );
      setWorkers(updatedWorkers);
      setSelectedWorkers([]);
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
      setSelectedWorkers([]);
      alert("تم مسح جميع العمال بنجاح ✅");
    } catch (error) {
      console.error("خطأ في مسح جميع العمال:", error);
      alert("حدث خطأ أثناء مسح جميع العمال ❌");
    }
  };

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
      const updatedWorkers = workers
        .filter((worker) => !selectedWorkers.includes(worker.id))
        .map((w, i) => ({ ...w, index: i + 1 }));
      setWorkers(updatedWorkers);
      setSelectedWorkers([]);
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
      fetchWorkers();
      setExcelData([]);
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
  };

  const filteredWorkers = workers.filter((worker) =>
    Object.keys(filters).every((key) =>
      worker[key]
        ?.toString()
        .toLowerCase()
        .includes(filters[key]?.toLowerCase() || "")
    )
  );

  const toggleSelectWorker = (id) => {
    if (!id) return;
    setSelectedWorkers((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedWorkers(
        filteredWorkers.filter((w) => !!w.id).map((worker) => worker.id)
      );
    } else {
      setSelectedWorkers([]);
    }
  };

  return (
    <div
      className="container-fluid mt-5 workers-page"
      style={{ width: "95%", margin: "auto" }}
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
        <div className="workers-table-wrap mt-4 cursor-pointer">
          <table className="table-bordered text-center align-middle cursor-pointer">
            <thead>
              <tr className="custom-row">
                {isLoggedIn && (
                  <th>
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={
                        selectedWorkers.length > 0 &&
                        selectedWorkers.length ===
                          filteredWorkers.filter((w) => !!w.id).length &&
                        filteredWorkers.filter((w) => !!w.id).length > 0
                      }
                    />
                  </th>
                )}
                <th>No#</th>
                <th>Name</th>
                <th>Nationality</th>
                <th>Religion</th>
                <th>Iqama Number</th>
                <th>File Number</th>
                <th>Job</th>
                <th>Residence</th>
                <th>Floor</th>
                <th>Apartment</th>
                <th>Room</th>
                <th>Mobile</th>
                <th>Notes</th>
                {isLoggedIn && <th>Editing</th>}
              </tr>

              {/* صف الفلتر */}
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                {isLoggedIn && <th></th>}
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
                        placeholder="Filter"
                        value={filters[col] || ""}
                        onChange={(e) => handleFilterChange(e, col)}
                        className="form-control form-control-sm"
                      />
                    )}
                  </th>
                ))}
                {isLoggedIn && <th></th>}
              </tr>
            </thead>

            <tbody>
              {filteredWorkers.map((worker, i) => {
                const isSelected =
                  !!worker.id && selectedWorkers.includes(worker.id);
                return (
                  <tr
                    key={worker.id || i}
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
                    <td>{i + 1}</td>
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

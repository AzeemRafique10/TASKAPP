import React, { useState, useEffect } from "react";
import { read, utils, writeFile } from "xlsx";
import { firestore } from "./firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
} from "firebase/firestore";

const HomeComponent = () => {
  const [students, setStudents] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedStudent, setEditedStudent] = useState({});
  const [ImpordedData, setImportedData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(firestore, "students"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(data);
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleImport = async ($event) => {
    const files = $event.target.files;
    if (files.length) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const wb = read(event.target.result, { type: "array" });
          const sheets = wb.SheetNames;

          if (sheets.length) {
            const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
            setImportedData(rows);

            const collectionRef = collection(firestore, "students");
            await Promise.all(
              rows.map(async (row) => {
                try {
                  await addDoc(collectionRef, row);
                } catch (error) {
                  console.log("Error uploading document:", error);
                }
              })
            );
            console.log("Data has been pushed to the Firestore database");
            alert("uploaded");
          }
        } catch (error) {
          console.log("Error reading file:", error);
          alert("error");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleExport = () => {
    const headings = [
      ["Student Name", "Exam Name", "Exam Date", "Exam Points"],
    ];
    const wb = utils.book_new();
    const ws = utils.json_to_sheet([]);
    utils.sheet_add_aoa(ws, headings);
    utils.sheet_add_json(ws, students, { origin: "A2", skipHeader: true });
    utils.book_append_sheet(wb, ws, "Report");
    writeFile(wb, "Students Report.xlsx");
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditedStudent({ ...students[index] });
  };

  const handleSave = async () => {
    try {
      const updatedStudents = [...students];
      updatedStudents[editingIndex] = { ...editedStudent };
      setStudents(updatedStudents);

      await setDoc(
        doc(firestore, "students", updatedStudents[editingIndex].id),
        { ...updatedStudents[editingIndex] },
        { merge: true }
      );

      console.log("Data has been updated in the database");
      setEditingIndex(null);
      setEditedStudent({});
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const handleDelete = async (index) => {
    try {
      const updatedStudents = [...students];
      updatedStudents.splice(index, 1);
      setStudents(updatedStudents);

      await deleteDoc(doc(firestore, "students", students[index].id));

      console.log("Data has been deleted from the database");
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const handleChange = (field, value) => {
    setEditedStudent((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className="row mb-2 mt-5">
        <div className="col-sm-6 offset-3">
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <div className="custom-file">
                  <input
                    type="file"
                    name="file"
                    className="custom-file-input"
                    id="inputGroupFile"
                    required
                    onChange={handleImport}
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  />
                  <label className="custom-file-label" htmlFor="inputGroupFile">
                    Choose file
                  </label>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <button
                onClick={handleExport}
                className="btn btn-primary float-right"
              >
                Export <i className="fa fa-download"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-6 offset-3">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Id</th>
                <th scope="col">Student Name</th>
                <th scope="col">Exam Name</th>
                <th scope="col">Exam Date</th>
                <th scope="col">Exam Points</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index}>
                  <th scope="row">{index + 1}</th>
                  <td>
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editedStudent.StudentName || ""}
                        onChange={(e) =>
                          handleChange("StudentName", e.target.value)
                        }
                      />
                    ) : (
                      student.StudentName
                    )}
                  </td>
                  <td>
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editedStudent.ExamName || ""}
                        onChange={(e) =>
                          handleChange("ExamName", e.target.value)
                        }
                      />
                    ) : (
                      student.ExamName
                    )}
                  </td>
                  <td>
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editedStudent.Date || ""}
                        onChange={(e) => handleChange("Date", e.target.value)}
                      />
                    ) : (
                      student.Date
                    )}
                  </td>
                  <td>
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editedStudent.Rating || ""}
                        onChange={(e) => handleChange("Rating", e.target.value)}
                      />
                    ) : (
                      student.Rating
                    )}
                  </td>
                  <td>
                    {editingIndex === index ? (
                      <>
                        <button
                          className="btn btn-primary mr-2"
                          onClick={handleSave}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => setEditingIndex(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-success mr-2"
                          onClick={() => handleEdit(index)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(index)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default HomeComponent;

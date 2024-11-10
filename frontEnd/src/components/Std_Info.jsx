import React, { useState, useEffect } from "react";
import "../App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const StudentsTable = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    parent_id: '',
  });
  const [students, setStudents] = useState([]);
  const [searchStudent, setSearchStudent] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setFormData({ name: '', email: '', age: '', parent_id: '' });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  useEffect(() => {
    axios.get("http://localhost:5000/api/student")
      .then(response => {
        setStudents(response.data.data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, [formData]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.age) {
      toast.error("Please fill in all fields", {
        autoClose: 5000,
      })
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/student', formData);
      toast.success(response?.data?.message, {
        autoClose: 5000,
      })
      closeModal();
    } 
    catch (error) {
        if (error.response) {
          if (error.response.status === 400) {
            toast.error(error?.response?.data?.message, {
                autoClose: 5000,
            })
          } 
          else {
            toast.error(error?.response?.data?.message || "Something went wrong", {
                autoClose: 5000,
            })
          }
        } 
        else {
          alert("Catch edit error");
        }
        console.error("Error editing student:", error);
      }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/student/${studentToDelete}`);
      setStudents(students.filter((student) => student.id !== studentToDelete));
      toast.success(response?.data?.message, {
        autoClose: 5000,
      })
      
      closeDeleteModal();
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(error?.response?.data?.message, {
            autoClose: 5000,
        })
        } else {
          alert("Something went wrong");
        }
      } else {
        alert("Error deleting student");
      }
      console.error("Error deleting student:", error);
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.age) {
        toast.error("Please fill in all fields", {
            autoClose: 5000,
        })
        return;
    }
    
    try {
        const response = await axios.put(`http://localhost:5000/api/student/${currentStudentId}`, formData);
        
        toast.success(response?.data?.message, {
            autoClose: 5000,
        })
        
        closeModal();
    } 
    catch (error) {
        if (error.response) {
          if (error.response.status === 400) {
            toast.error(error?.response?.data?.message, {
                autoClose: 5000,
            })
          } 
          else {
            toast.error(error?.response?.data?.message || "Something went wrong" , {
                autoClose: 5000,
            })
          }
        } 
        else {
          alert("Catch edit error");
        }
        console.error("Error editing student:", error);
      }
  };

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      email: student.email,
      age: student.age,
      parent_id: student.parent_id || '',
    });
    setIsEditMode(true);
    setCurrentStudentId(student.id);
    openModal();
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const openDeleteModal = (id) => {
    setStudentToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  return (
    <>
      {showModal && (
        <div className="modal" tabIndex="-1" style={{ display: 'block' }} aria-hidden="false">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditMode ? "Edit Student" : "Add New Student"}</h5>
                <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form onSubmit={isEditMode ? handleEditStudent : handleAddStudent}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Member Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Member Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="age" className="form-label">Member Age</label>
                    <input
                      type="text"
                      className="form-control"
                      id="age"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="parent_id" className="form-label">Member Parent Id</label>
                    <input
                      type="text"
                      className="form-control"
                      id="parent_id"
                      value={formData.parent_id}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">
                      {isEditMode ? "Save Changes" : "Add Student"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    {showDeleteModal && (
        <div className="modal show" tabIndex="-1" style={{ display: "block" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center">
                <div className="mb-3">
                    <img src="/exclamationMark.png"
                    alt="Image" height="100px" />
                </div>
                <h5>Are you sure?</h5>
                <p>If you delete this Member, this action cannot be undone.</p>
              </div>
              <div className="modal-footer d-flex justify-content-center">
                <button onClick={handleDelete} className="btn btn-primary">
                  Yes, delete it!
                </button>
                <button onClick={closeDeleteModal} className="btn btn-danger">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}    

      <div className="students-table">
        <div className="search-add-container">
          <input
            type="text"
            placeholder="Search by name"
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            className="search-input"
          />
          <button onClick={openModal} className="add-button">
            Add New Student
          </button>
        </div>

        <hr style={{ border: '1px solid black', width: '100%' }} />

        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Id</th>
              <th>Student Name</th>
              <th>Student Email</th>
              <th>Age</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.age}</td>
                <td>
                  <button onClick={() => handleEdit(student)} className="edit-button">
                    ✏️
                  </button>
                  <button onClick={() => openDeleteModal(student.id)} className="delete-button">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default StudentsTable;

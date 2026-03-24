import React, { useEffect, useState } from "react";
import { api } from "../services/api";

const API = "/administrator";

/* ================= TYPES ================= */

type Admin = {
  id: number;
  username: string;
  fullName: string;
};

type Department = {
  id: number;
  name: string;
};

type AdminForm = {
  username: string;
  fullName: string;
  passwordHash: string;
  phone: string;
  email: string;
};

type DepartmentForm = {
  name: string;
  description: string;
};

function AdministratorDashboard() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);

  const [adminForm, setAdminForm] = useState<AdminForm>({
    username: "",
    fullName: "",
    passwordHash: "",
    phone: "",
    email: "",
  });

  const [departmentForm, setDepartmentForm] = useState<DepartmentForm>({
    name: "",
    description: "",
  });

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadAdmins();
    loadDepartments();
  }, []);

  const loadAdmins = async () => {
    try {
      const res = await api.get(`${API}/admins`);
      setAdmins(res.data);
    } catch (err) {
      console.error("Load admins error:", err);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await api.get(`${API}/departments`);
      setDepartments(res.data);
    } catch (err) {
      console.error("Load departments error:", err);
    }
  };

  /* ================= CREATE ADMIN ================= */

  const createAdmin = async () => {
    try {
      await api.post(`${API}/admins`, adminForm);
      loadAdmins();
      resetAdminForm();
    } catch (err) {
      console.error("Create admin error:", err);
    }
  };

  /* ================= UPDATE ADMIN ================= */

  const updateAdmin = async () => {
    try {
      await api.put(`${API}/admins/${editingAdminId}`, adminForm);
      loadAdmins();
      resetAdminForm();
    } catch (err) {
      console.error("Update admin error:", err);
    }
  };

  const resetAdminForm = () => {
    setEditingAdminId(null);
    setAdminForm({
      username: "",
      fullName: "",
      passwordHash: "",
      phone: "",
      email: "",
    });
  };

  /* ================= DELETE ADMIN ================= */

  const deleteAdmin = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    try {
      await api.delete(`${API}/admins/${id}`);
      loadAdmins();
    } catch (err) {
      console.error("Delete admin error:", err);
    }
  };

  /* ================= ADD DEPARTMENT ================= */

  const addDepartment = async () => {
    try {
      await api.post(`${API}/departments`, departmentForm);
      loadDepartments();
      setDepartmentForm({ name: "", description: "" });
    } catch (err) {
      console.error("Add department error:", err);
    }
  };

  /* ================= DELETE DEPARTMENT ================= */

  const deleteDepartment = async (id: number) => {
    if (!window.confirm("Delete this department?")) return;

    try {
      await api.delete(`${API}/departments/${id}`);
      loadDepartments();
    } catch (err) {
      console.error("Delete department error:", err);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Administrator Dashboard</h1>

      {/* ================= ADMIN SECTION ================= */}

      <h2>{editingAdminId ? "Update Admin" : "Create Focal Person"}</h2>

      <input
        placeholder="Username"
        value={adminForm.username}
        onChange={(e) =>
          setAdminForm({ ...adminForm, username: e.target.value })
        }
      />

      <input
        placeholder="Full Name"
        value={adminForm.fullName}
        onChange={(e) =>
          setAdminForm({ ...adminForm, fullName: e.target.value })
        }
      />

      <input
        placeholder="Password"
        type="password"
        value={adminForm.passwordHash}
        onChange={(e) =>
          setAdminForm({ ...adminForm, passwordHash: e.target.value })
        }
      />

      <input
        placeholder="Phone"
        value={adminForm.phone}
        onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
      />

      <input
        placeholder="Email"
        value={adminForm.email}
        onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
      />

      <br />

      <button onClick={editingAdminId ? updateAdmin : createAdmin}>
        {editingAdminId ? "Update Admin" : "Create Admin"}
      </button>

      {editingAdminId && (
        <button onClick={resetAdminForm} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      )}

      <h3>Focal Person Accounts</h3>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Full Name</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td>{admin.id}</td>
              <td>{admin.username}</td>
              <td>{admin.fullName}</td>
              <td>
                <button
                  onClick={() => {
                    setEditingAdminId(admin.id);
                    setAdminForm({
                      username: admin.username,
                      fullName: admin.fullName,
                      passwordHash: "",
                      phone: "",
                      email: "",
                    });
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteAdmin(admin.id)}
                  style={{ marginLeft: "10px" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= DEPARTMENT SECTION ================= */}

      <h2 style={{ marginTop: "40px" }}>Departments</h2>

      <input
        placeholder="Department Name"
        value={departmentForm.name}
        onChange={(e) =>
          setDepartmentForm({ ...departmentForm, name: e.target.value })
        }
      />

      <input
        placeholder="Description"
        value={departmentForm.description}
        onChange={(e) =>
          setDepartmentForm({
            ...departmentForm,
            description: e.target.value,
          })
        }
      />

      <button onClick={addDepartment}>Add Department</button>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Department</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {departments.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.name}</td>
              <td>
                <button onClick={() => deleteDepartment(d.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdministratorDashboard;

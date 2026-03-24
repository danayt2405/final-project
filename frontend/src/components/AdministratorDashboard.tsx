import React, { useEffect, useState } from "react";
import { api } from "../services/api";

const API = "/administrator";

/* ================= TYPES ================= */

type Admin = {
  id: number;
  username: string;
  fullName: string;
  role: string;
  email?: string;
  phone?: string;
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

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | "">(
    ""
  );

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

  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadAdmins();
    loadDepartments();
  }, []);

  const loadAdmins = async () => {
    try {
      const res = await api.get(`${API}/admins`);

      // ✅ only admin + super_admin
      const filtered = res.data.filter(
        (u: any) => u.role === "admin" || u.role === "super_admin"
      );

      setAdmins(filtered);
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
      if (!selectedDepartmentId) {
        alert("Please select a department");
        return;
      }

      await api.post(
        `${API}/admins?departmentId=${selectedDepartmentId}`,
        adminForm
      );

      loadAdmins();

      setAdminForm({
        username: "",
        fullName: "",
        passwordHash: "",
        phone: "",
        email: "",
      });

      setSelectedDepartmentId("");
    } catch (err) {
      console.error("Create admin error:", err);
    }
  };

  /* ================= UPDATE ADMIN ================= */

  const updateAdmin = async (id: number) => {
    try {
      await api.put(`${API}/admins/${id}`, adminForm);

      setEditingAdminId(null);
      loadAdmins();

      setAdminForm({
        username: "",
        fullName: "",
        passwordHash: "",
        phone: "",
        email: "",
      });
    } catch (err) {
      console.error("Update admin error:", err);
    }
  };

  /* ================= DELETE ADMIN ================= */

  const deleteAdmin = async (id: number) => {
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

      setDepartmentForm({
        name: "",
        description: "",
      });
    } catch (err) {
      console.error("Add department error:", err);
    }
  };

  /* ================= DELETE DEPARTMENT ================= */

  const deleteDepartment = async (id: number) => {
    try {
      await api.delete(`${API}/departments/${id}`);
      loadDepartments();
    } catch (err) {
      console.error("Delete department error:", err);
    }
  };

  /* ================= EDIT ADMIN ================= */

  const startEdit = (admin: Admin) => {
    setEditingAdminId(admin.id);

    setAdminForm({
      username: admin.username,
      fullName: admin.fullName,
      passwordHash: "",
      phone: admin.phone || "",
      email: admin.email || "",
    });
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Administrator Dashboard</h1>

      {/* ================= ADMIN SECTION ================= */}

      <h2>Create / Update Admin</h2>

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
        placeholder="Password (leave empty to keep same)"
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

      {/* ✅ Department selection */}
      <select
        value={selectedDepartmentId}
        onChange={(e) => setSelectedDepartmentId(Number(e.target.value))}
      >
        <option value="">Select Department</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      {editingAdminId ? (
        <button onClick={() => updateAdmin(editingAdminId)}>
          Update Admin
        </button>
      ) : (
        <button onClick={createAdmin}>Create Admin</button>
      )}

      <h3>Admin Accounts</h3>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td>{admin.id}</td>
              <td>{admin.username}</td>
              <td>{admin.fullName}</td>
              <td>{admin.role}</td>
              <td>
                <button onClick={() => startEdit(admin)}>Edit</button>
                <button onClick={() => deleteAdmin(admin.id)}>Delete</button>
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

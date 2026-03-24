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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl tracking-tight text-slate-800 mb-1">
            System Administrator
          </h1>
          <p className="text-sm text-slate-500">
            Manage focal persons and departments
          </p>
        </div>

        {/* ================= DEPARTMENT SECTION ================= */}

        <div className="bg-white/80 backdrop-blur rounded-lg shadow-sm border border-slate-200/60 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500/90 to-teal-500/90 px-6 py-4">
            <h2 className="text-lg text-white font-medium">Departments</h2>
            <p className="text-emerald-50 text-base font-medium mt-1">
              Create and manage departments
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Department Name
                </label>
                <input
                  placeholder="Enter department name"
                  value={departmentForm.name}
                  onChange={(e) =>
                    setDepartmentForm({
                      ...departmentForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 outline-none transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Description
                </label>
                <input
                  placeholder="Enter description"
                  value={departmentForm.description}
                  onChange={(e) =>
                    setDepartmentForm({
                      ...departmentForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 outline-none transition-all bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={addDepartment}
                className="px-5 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-all"
              >
                Add Department
              </button>
            </div>
          </div>
        </div>

        {/* Departments Table */}
        <div className="bg-white/80 backdrop-blur rounded-lg shadow-sm border border-slate-200/60 mb-8 overflow-hidden">
          <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-200/60">
            <h3 className="text-sm font-medium text-slate-700">
              All Departments
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              View and manage existing departments
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full max-w-2xl mx-auto">
              <thead>
                <tr className="bg-emerald-50/50 border-b border-emerald-100/60">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-emerald-800 uppercase tracking-wide">
                    ID
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-emerald-800 uppercase tracking-wide">
                    Department
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-emerald-800 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {departments.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-slate-700">
                      {d.id}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-slate-700">
                      {d.name}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                      <button
                        onClick={() => deleteDepartment(d.id)}
                        className="px-3 py-1.5 text-xs bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= ADMIN SECTION ================= */}

        <div className="bg-white/80 backdrop-blur rounded-lg shadow-sm border border-slate-200/60 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/90 to-indigo-500/90 px-6 py-4">
            <h2 className="text-lg text-white font-medium">
              {editingAdminId ? "Update Admin" : "Create New Admin"}
            </h2>

            <p className="text-blue-50 text-base font-medium mt-1">
              {editingAdminId
                ? "Modify administrator details"
                : "Add a new administrator to the system"}
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Username
                </label>
                <input
                  placeholder="Enter username"
                  value={adminForm.username}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, username: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 outline-none transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Full Name
                </label>
                <input
                  placeholder="Enter full name"
                  value={adminForm.fullName}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 outline-none transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Password
                </label>
                <input
                  placeholder="please enter a password"
                  type="password"
                  value={adminForm.passwordHash}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, passwordHash: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 outline-none transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Phone
                </label>
                <input
                  placeholder="Enter phone number"
                  value={adminForm.phone}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 outline-none transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Email
                </label>
                <input
                  placeholder="Enter email address"
                  value={adminForm.email}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 outline-none transition-all bg-white"
                />
              </div>

              {/* ✅ Department selection */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Department
                </label>
                <select
                  value={selectedDepartmentId}
                  onChange={(e) =>
                    setSelectedDepartmentId(Number(e.target.value))
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 outline-none transition-all bg-white"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              {editingAdminId ? (
                <button
                  onClick={() => updateAdmin(editingAdminId)}
                  className="px-5 py-2 text-sm text-white font-medium bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm hover:shadow"
                >
                  Update Admin
                </button>
              ) : (
                <button
                  onClick={createAdmin}
                  className="px-5 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-all"
                >
                  Create Admin
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Admin Accounts Table */}
        <div className="bg-white/80 backdrop-blur rounded-lg shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-200/60">
            <h3 className="text-sm font-medium text-slate-700">
              Admin Accounts
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage existing administrator accounts
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full max-w-2xl mx-auto">
              <thead>
                <tr className="bg-blue-50/50 border-b border-blue-100/60">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-blue-800 uppercase tracking-wide">
                    ID
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-blue-800 uppercase tracking-wide">
                    Username
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-blue-800 uppercase tracking-wide">
                    Full Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-blue-800 uppercase tracking-wide">
                    Role
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-blue-800 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-slate-700">
                      {admin.id}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-slate-700">
                      {admin.username}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-slate-700">
                      {admin.fullName}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          admin.role === "super_admin"
                            ? "bg-purple-100/80 text-purple-700"
                            : "bg-sky-100/80 text-sky-700"
                        }`}
                      >
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(admin)}
                          className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAdmin(admin.id)}
                          className="px-3 py-1.5 text-xs bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdministratorDashboard;

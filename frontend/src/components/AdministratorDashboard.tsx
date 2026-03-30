import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const API = "/administrator";

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

function AdministratorDashboard() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | "">(
    ""
  );
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);

  const [adminForm, setAdminForm] = useState({
    username: "",
    fullName: "",
    passwordHash: "",
    phone: "",
    email: "",
  });

  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    description: "",
  });

  /* 🎨 CONSISTENT STYLES */
  const deptCard =
    "bg-gradient-to-br from-sky-100 to-sky-50 border border-sky-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1";

  const adminCard =
    "bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1";

  const statCard =
    "hover:shadow-lg transition-all duration-300 hover:-translate-y-1";

  useEffect(() => {
    loadAdmins();
    loadDepartments();
  }, []);

  const loadAdmins = async () => {
    const res = await api.get(`${API}/admins`);
    setAdmins(
      res.data.filter(
        (u: any) => u.role === "admin" || u.role === "super_admin"
      )
    );
  };

  const loadDepartments = async () => {
    const res = await api.get(`${API}/departments`);
    setDepartments(res.data);
  };

  const createAdmin = async () => {
    if (!selectedDepartmentId) return alert("Select department");

    await api.post(
      `${API}/admins?departmentId=${selectedDepartmentId}`,
      adminForm
    );
    loadAdmins();
    resetAdminForm();
  };

  const updateAdmin = async (id: number) => {
    await api.put(`${API}/admins/${id}`, adminForm);
    setEditingAdminId(null);
    loadAdmins();
    resetAdminForm();
  };

  const deleteAdmin = async (id: number) => {
    await api.delete(`${API}/admins/${id}`);
    loadAdmins();
  };

  const addDepartment = async () => {
    await api.post(`${API}/departments`, departmentForm);
    loadDepartments();
    setDepartmentForm({ name: "", description: "" });
  };

  const deleteDepartment = async (id: number) => {
    await api.delete(`${API}/departments/${id}`);
    loadDepartments();
  };

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

  const resetAdminForm = () => {
    setAdminForm({
      username: "",
      fullName: "",
      passwordHash: "",
      phone: "",
      email: "",
    });
    setSelectedDepartmentId("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage system data easily</p>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className={`bg-sky-100 ${statCard}`}>
            <CardContent className="p-6">
              <p>Total Admins</p>
              <h2 className="text-2xl font-bold">{admins.length}</h2>
            </CardContent>
          </Card>

          <Card className={`bg-purple-100 ${statCard}`}>
            <CardContent className="p-6">
              <p>Departments</p>
              <h2 className="text-2xl font-bold">{departments.length}</h2>
            </CardContent>
          </Card>

          <Card className={`bg-green-100 ${statCard}`}>
            <CardContent className="p-6">
              <p>Super Admins</p>
              <h2 className="text-2xl font-bold">
                {admins.filter((a) => a.role === "super_admin").length}
              </h2>
            </CardContent>
          </Card>
        </div>

        {/* DEPARTMENTS FORM */}
        <Card className={`${deptCard} mb-8`}>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Manage departments</CardDescription>
          </CardHeader>

          <CardContent className="grid md:grid-cols-3 gap-4">
            <Input
              placeholder="Department name"
              value={departmentForm.name}
              onChange={(e) =>
                setDepartmentForm({ ...departmentForm, name: e.target.value })
              }
            />
            <Input
              placeholder="Description"
              value={departmentForm.description}
              onChange={(e) =>
                setDepartmentForm({
                  ...departmentForm,
                  description: e.target.value,
                })
              }
            />
            <Button onClick={addDepartment}>Add</Button>
          </CardContent>
        </Card>

        {/* DEPARTMENTS TABLE */}
        <Card className={`${deptCard} mb-10`}>
          <CardHeader>
            <CardTitle>All Departments</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {departments.map((d) => (
                  <TableRow key={d.id} className="hover:bg-white/60 transition">
                    <TableCell>{d.id}</TableCell>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteDepartment(d.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ADMIN FORM */}
        <Card className={`${adminCard} mb-8`}>
          <CardHeader>
            <CardTitle>
              {editingAdminId ? "Update Admin" : "Create Admin"}
            </CardTitle>
          </CardHeader>

          <CardContent className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Username"
              value={adminForm.username}
              onChange={(e) =>
                setAdminForm({ ...adminForm, username: e.target.value })
              }
            />
            <Input
              placeholder="Full Name"
              value={adminForm.fullName}
              onChange={(e) =>
                setAdminForm({ ...adminForm, fullName: e.target.value })
              }
            />
            <Input
              type="password"
              placeholder="Password"
              value={adminForm.passwordHash}
              onChange={(e) =>
                setAdminForm({ ...adminForm, passwordHash: e.target.value })
              }
            />
            <Input
              placeholder="Phone"
              value={adminForm.phone}
              onChange={(e) =>
                setAdminForm({ ...adminForm, phone: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              value={adminForm.email}
              onChange={(e) =>
                setAdminForm({ ...adminForm, email: e.target.value })
              }
            />

            <Select
              value={selectedDepartmentId ? String(selectedDepartmentId) : ""}
              onValueChange={(value) =>
                setSelectedDepartmentId(value ? Number(value) : "")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="col-span-2 flex justify-end">
              {editingAdminId ? (
                <Button onClick={() => updateAdmin(editingAdminId)}>
                  Update
                </Button>
              ) : (
                <Button onClick={createAdmin}>Create</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ADMIN TABLE */}
        <Card className={adminCard}>
          <CardHeader>
            <CardTitle>Admin Accounts</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {admins.map((admin) => (
                  <TableRow
                    key={admin.id}
                    className="hover:bg-white/60 transition"
                  >
                    <TableCell>{admin.username}</TableCell>
                    <TableCell>{admin.fullName}</TableCell>
                    <TableCell>
                      <Badge>{admin.role}</Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => startEdit(admin)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteAdmin(admin.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdministratorDashboard;

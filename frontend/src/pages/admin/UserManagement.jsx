import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  UserCheck,
  UserX,
  ShieldAlert,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  GraduationCap,
  BriefcaseBusiness,
  AlertTriangle,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
} from "../../services/adminUserService";
import Loading from "../../components/Loading";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [pagination, setPagination] = useState({
    totalUsers: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 20,
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  // --------------------------------------------------
  // FETCH USERS
  // --------------------------------------------------

  const fetchUsers = async (requestedPage = 1) => {
    try {
      setLoading(true);

      const data = await getAllUsers({
        search: search.trim() || undefined,
        role: role || undefined,
        status: status || undefined,
        page: requestedPage,
        limit: 20,
      });

      if (data.success) {
        setUsers(data.users || []);

        setPagination({
          totalUsers: data.pagination?.totalUsers || 0,
          totalPages: data.pagination?.totalPages || 0,
          currentPage: data.pagination?.currentPage || requestedPage,
          limit: data.pagination?.limit || 20,
        });
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [role, status]);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const handleSearch = (event) => {
    event.preventDefault();
    fetchUsers(1);
  };

  // --------------------------------------------------
  // CLEAR FILTERS
  // --------------------------------------------------

  const handleClearFilters = () => {
    setSearch("");
    setRole("");
    setStatus("");
  };

  // --------------------------------------------------
  // VIEW USER
  // --------------------------------------------------

  const handleViewUser = async (userId) => {
    try {
      setActionLoading(true);

      const data = await getUserById(userId);

      if (data.success) {
        setSelectedUser(data.user);
        setShowProfileModal(true);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // STATUS CHANGE
  // --------------------------------------------------

  const handleStatusChange = async () => {
    if (!statusTarget) return;

    try {
      setActionLoading(true);

      const data = await updateUserStatus(
        statusTarget._id,
        statusTarget.newStatus,
      );

      if (data.success) {
        setStatusTarget(null);

        await fetchUsers(pagination.currentPage);
      }
    } catch (error) {
      console.error("Failed to update user status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // DELETE USER
  // --------------------------------------------------

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoading(true);

      const data = await deleteUser(deleteTarget._id);

      if (data.success) {
        setDeleteTarget(null);

        const currentPage =
          users.length === 1 && pagination.currentPage > 1
            ? pagination.currentPage - 1
            : pagination.currentPage;

        await fetchUsers(currentPage);
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getInitials = (name = "") => {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) return "U";

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getAvatarStyle = (role) => {
    if (role === "ALUMNI") {
      return "bg-gradient-to-br from-violet-500 to-purple-600";
    }

    return "bg-gradient-to-br from-indigo-500 to-blue-600";
  };

  const getStatusBadge = (userStatus) => {
    const styles = {
      ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
      INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
      SUSPENDED: "bg-red-50 text-red-700 border-red-200",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
          styles[userStatus] || "bg-slate-100 text-slate-600 border-slate-200"
        }`}
      >
        {userStatus}
      </span>
    );
  };

  const getRoleBadge = (userRole) => {
    if (userRole === "ALUMNI") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
          <BriefcaseBusiness size={13} />
          Alumni
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
        <GraduationCap size={13} />
        Student
      </span>
    );
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Users size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  User Management
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage registered students and alumni accounts
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => fetchUsers(pagination.currentPage)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* FILTERS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]"
          >
            {/* SEARCH */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            {/* ROLE */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            >
              <option value="">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="ALUMNI">Alumni</option>
            </select>

            {/* STATUS */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            {/* SEARCH BUTTON */}
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Search
            </button>
          </form>

          {(search || role || status) && (
            <button
              onClick={handleClearFilters}
              className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* SUMMARY */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Registered Users
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {pagination.totalUsers}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Current Page</p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {pagination.currentPage}
              <span className="text-base font-medium text-slate-400">
                {" "}
                / {pagination.totalPages || 1}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Showing</p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {users.length}
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <Loading text="Loading users..." />
          ) : users.length === 0 ? (
            <div className="flex min-h-75 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Users size={25} className="text-slate-400" />
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-800">
                No users found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Try changing your search or filter criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-225">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        User
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Role
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Registered
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        {/* USER */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${getAvatarStyle(
                                user.role,
                              )}`}
                            >
                              {getInitials(user.name)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {user.name}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ROLE */}
                        <td className="px-5 py-4">{getRoleBadge(user.role)}</td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          {getStatusBadge(user.status)}
                        </td>

                        {/* REGISTERED DATE */}
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "—"}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {/* VIEW */}
                            <button
                              onClick={() => handleViewUser(user._id)}
                              title="View user"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              <Eye size={17} />
                            </button>

                            {/* STATUS */}
                            {user.status === "ACTIVE" && (
                              <>
                                <button
                                  onClick={() =>
                                    setStatusTarget({
                                      ...user,
                                      newStatus: "SUSPENDED",
                                    })
                                  }
                                  title="Suspend user"
                                  className="rounded-lg p-2 text-amber-500 transition hover:bg-amber-50 hover:text-amber-600"
                                >
                                  <ShieldAlert size={17} />
                                </button>

                                <button
                                  onClick={() =>
                                    setStatusTarget({
                                      ...user,
                                      newStatus: "INACTIVE",
                                    })
                                  }
                                  title="Deactivate user"
                                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                  <UserX size={17} />
                                </button>
                              </>
                            )}

                            {(user.status === "INACTIVE" ||
                              user.status === "SUSPENDED") && (
                              <button
                                onClick={() =>
                                  setStatusTarget({
                                    ...user,
                                    newStatus: "ACTIVE",
                                  })
                                }
                                title="Activate user"
                                className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                              >
                                <UserCheck size={17} />
                              </button>
                            )}

                            {/* DELETE */}
                            <button
                              onClick={() => setDeleteTarget(user)}
                              title="Delete user account"
                              className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
                <p className="text-sm text-slate-500">
                  Page{" "}
                  <span className="font-semibold text-slate-700">
                    {pagination.currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {pagination.totalPages || 1}
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={pagination.currentPage <= 1}
                    onClick={() => fetchUsers(pagination.currentPage - 1)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    disabled={pagination.currentPage >= pagination.totalPages}
                    onClick={() => fetchUsers(pagination.currentPage + 1)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ==================================================
          USER PROFILE MODAL
      ================================================== */}

      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">User Details</h2>

              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setSelectedUser(null);
                }}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* PROFILE HEADER */}
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white ${getAvatarStyle(
                    selectedUser.role,
                  )}`}
                >
                  {getInitials(selectedUser.name)}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedUser.name}
                  </h3>

                  <p className="text-sm text-slate-500">{selectedUser.email}</p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>
              </div>

              {/* ACCOUNT DETAILS */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                  Account Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Name" value={selectedUser.name} />

                  <DetailItem label="Email" value={selectedUser.email} />

                  <DetailItem label="Role" value={selectedUser.role} />

                  <DetailItem label="Status" value={selectedUser.status} />

                  <DetailItem
                    label="Registered"
                    value={
                      selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleDateString()
                        : "—"
                    }
                  />
                </div>
              </div>

              {/* ALUMNI PROFILE */}
              {selectedUser.role === "ALUMNI" && selectedUser.alumniId && (
                <div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                    Alumni Profile
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailItem
                      label="Passout Year"
                      value={selectedUser.alumniId.passoutYear}
                    />

                    <DetailItem
                      label="Department"
                      value={selectedUser.alumniId.department}
                    />

                    <DetailItem
                      label="Current Location"
                      value={selectedUser.alumniId.currentLocation}
                    />

                    <DetailItem
                      label="Native Place"
                      value={selectedUser.alumniId.nativePlace}
                    />

                    <DetailItem
                      label="Company"
                      value={selectedUser.alumniId.companyName}
                    />

                    <DetailItem
                      label="Mobile"
                      value={selectedUser.alumniId.mobileNo}
                    />

                    <DetailItem
                      label="LinkedIn"
                      value={selectedUser.alumniId.linkedinUrl || "—"}
                    />
                  </div>

                  {selectedUser.alumniId.areaOfExpertise?.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-semibold text-slate-700">
                        Areas of Expertise
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {selectedUser.alumniId.areaOfExpertise.map(
                          (item, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                            >
                              {item}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedUser.role === "ALUMNI" && !selectedUser.alumniId && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                  This alumni account does not currently have a linked alumni
                  profile.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          STATUS CONFIRMATION MODAL
      ================================================== */}

      {statusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <ShieldAlert size={24} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Change User Status
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to change{" "}
              <span className="font-semibold text-slate-700">
                {statusTarget.name}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-700">
                {statusTarget.newStatus}
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setStatusTarget(null)}
                disabled={actionLoading}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleStatusChange}
                disabled={actionLoading}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {actionLoading ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          DELETE CONFIRMATION MODAL
      ================================================== */}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle size={24} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Delete User Account?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You are about to permanently delete the account of{" "}
              <span className="font-semibold text-slate-700">
                {deleteTarget.name}
              </span>
              .
            </p>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
              This deletes the user's login account. The linked alumni profile
              is not deleted.
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={actionLoading}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {actionLoading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE LOADING */}
      {actionLoading && !statusTarget && !deleteTarget && !showProfileModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/20">
          <div className="rounded-xl bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-xl">
            Loading...
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// --------------------------------------------------
// DETAIL ITEM
// --------------------------------------------------

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>

      <p className="mt-1 wrap-break-word text-sm font-semibold text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

export default UserManagement;

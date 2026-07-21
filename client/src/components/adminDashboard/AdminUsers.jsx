import React from "react";

const AdminUsers = () => {
  return (
    <div className="overflow-y-auto h-full">
      <h2 className="text-2xl font-bold mb-6">Users Management</h2>
      <div className="bg-(--color-base-200) p-4 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--color-secondary)">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Type</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-(--color-secondary)">
              <td colSpan="4" className="text-center py-4 text-(--color-neutral)">
                Loading users...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;

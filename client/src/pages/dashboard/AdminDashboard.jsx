import React from "react";
import Sidebar from "../../components/adminDashboard/Sidebar";
import AdminOverview from "../../components/adminDashboard/AdminOverview";
import AdminUsers from "../../components/adminDashboard/AdminUsers";
import AdminReports from "../../components/adminDashboard/AdminReports";
import AdminSetting from "../../components/adminDashboard/AdminSetting";
import { useLocation , useNavigate} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { user, isLogin } = useAuth();
  const navigate = useNavigate();
  const active = useLocation().state?.activeTab;
  const [activeTab, setActiveTab] = React.useState(active || "overview");

  if (!isLogin || user?.userType !== "admin") {
    return (
      <div className="h-[92vh] bg-[url('/foodTable.webp')]  bg-cover bg-center">
        <div className="h-full backdrop-blur-lg flex flex-col items-center justify-center ">
          <h1 className="text-2xl font-bold text-(--color-neutral-content)">
            Access Denied. Please log in as an admin to view this page.
          </h1>
          <button
            className="mt-4 px-4 py-2 bg-(--color-primary) text-white rounded-md"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-[92vh] flex gap-2 m-2">
        <div className="w-3/17 bg-(--color-base-200) p-4 rounded-lg shadow-md h-full">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="w-14/17 bg-(--color-base-100) p-4 rounded-lg shadow-md h-full">
          {activeTab === "overview" && <AdminOverview />}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "reports" && <AdminReports />}
          {activeTab === "settings" && <AdminSetting />}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

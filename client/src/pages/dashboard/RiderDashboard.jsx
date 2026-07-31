import React from "react";
import Sidebar from "../../components/riderDashboard/Sidebar";
import RiderOverview from "../../components/riderDashboard/RiderOverview";
import RiderDeliveries from "../../components/riderDashboard/RiderDeliveries";
import RiderEarnings from "../../components/riderDashboard/RiderEarnings";
import RiderSetting from "../../components/riderDashboard/RiderSetting";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";

const dashboardBg = `${import.meta.env.BASE_URL}foodTable.webp`;

const RiderDashboard = () => {
  const { user, isLogin } = useAuth();
  const navigate = useNavigate();
  const active = useLocation().state?.activeTab;
  const [activeTab, setActiveTab] = React.useState(active || "overview");

  if (!isLogin || user?.userType !== "rider") {
    return (
      <div
        className="h-[92vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${dashboardBg})` }}
      >
        <div className="h-full backdrop-blur-lg flex flex-col items-center justify-center ">
          <h1 className="text-2xl font-bold text-(--color-neutral-content)">
            Access Denied. Please log in as a rider to view this page.
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
      <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-2 m-2">
        <div className="w-full lg:w-72 xl:w-80 bg-(--color-base-200) p-4 rounded-lg shadow-md h-auto lg:h-full">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="w-full flex-1 bg-(--color-base-100) p-4 rounded-lg shadow-md h-auto lg:h-full overflow-y-auto">
          {activeTab === "overview" && <RiderOverview />}
          {activeTab === "deliveries" && <RiderDeliveries />}
          {activeTab === "earnings" && <RiderEarnings />}
          {activeTab === "settings" && <RiderSetting />}
        </div>
      </div>
    </>
  );
};

export default RiderDashboard;

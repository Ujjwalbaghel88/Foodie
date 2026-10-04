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
      <main id="rider-dashboard" className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1600px] flex-col gap-3 p-3 sm:p-4 lg:flex-row">
        <aside className="w-full shrink-0 rounded-xl bg-(--color-base-200) p-3 shadow-md sm:p-4 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:w-64 xl:w-72">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </aside>
        <section className="min-w-0 w-full flex-1 overflow-hidden rounded-xl bg-(--color-base-100) p-3 shadow-md sm:p-5 lg:min-h-[calc(100vh-6rem)] lg:p-6">
          {activeTab === "overview" && <RiderOverview />}
          {activeTab === "deliveries" && <RiderDeliveries />}
          {activeTab === "earnings" && <RiderEarnings />}
          {activeTab === "settings" && <RiderSetting />}
        </section>
      </main>
    </>
  );
};

export default RiderDashboard;

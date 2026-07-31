import React from "react";
import Sidebar from "../../components/customerDashboard/Sidebar";
import CustomerOverview from "../../components/customerDashboard/CustomerOverview";
import CustomerOrders from "../../components/customerDashboard/CustomerOrders";
import CustomerSetting from "../../components/customerDashboard/CustomerSetting";
import { useLocation , useNavigate} from "react-router-dom";
import useAuth from "../../context/useAuth";

const dashboardBg = `${import.meta.env.BASE_URL}foodTable.webp`;

const CustomerDashboard = () => {
  const { user, isLogin } = useAuth();
  const navigate = useNavigate();
  const active = useLocation().state?.activeTab;
  const [activeTab, setActiveTab] = React.useState(active || "overview");

  if (!isLogin || user?.userType !== "customer") {
    return (
      <div
        className="h-[92vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${dashboardBg})` }}
      >
        <div className="h-full backdrop-blur-lg flex flex-col items-center justify-center ">
          <h1 className="text-2xl font-bold text-(--color-neutral-content)">
            Access Denied. Please log in as a customer to view this
            page.
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
          {activeTab === "overview" && <CustomerOverview />}
          {activeTab === "orders" && <CustomerOrders />}
          {activeTab === "settings" && <CustomerSetting />}
        </div>
      </div>
    </>
  );
};

export default CustomerDashboard;

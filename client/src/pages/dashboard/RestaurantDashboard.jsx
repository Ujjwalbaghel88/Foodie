import React from "react";
import Sidebar from "../../components/restaurantDashbaord/Sidebar";
import RestaurantOverview from "../../components/restaurantDashbaord/RestaurantOverview";
import RestaurantOrders from "../../components/restaurantDashbaord/RestaurantOrders";
import RestaurantMenu from "../../components/restaurantDashbaord/RestaurantMenu";
import RestaurantReviews from "../../components/restaurantDashbaord/RestaurantReviews";
import RestaurantSetting from "../../components/restaurantDashbaord/RestaurantSetting";
import { useLocation , useNavigate} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RestaurantDashboard = () => {
  const { user, isLogin } = useAuth();
  const navigate = useNavigate();
  const active = useLocation().state?.activeTab;
  // console.log(active);

  const [activeTab, setActiveTab] = React.useState(active || "overview");
  if (!isLogin || user?.userType !== "restaurant") {
    return (
      <div className="h-[92vh] bg-[url('/foodTable.webp')]  bg-cover bg-center">
        <div className="h-full backdrop-blur-lg flex flex-col items-center justify-center ">
          <h1 className="text-2xl font-bold text-(--color-neutral-content)">
            Access Denied. Please log in as an restaurant manager to view this
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
      <div className="h-[92vh] flex gap-2 m-2">
        <div className="w-3/17 bg-(--color-base-200) p-4 rounded-lg shadow-md h-full">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="w-14/17 bg-(--color-base-100) p-4 rounded-lg shadow-md h-full">
          {activeTab === "overview" && <RestaurantOverview />}
          {activeTab === "orders" && <RestaurantOrders />}
          {activeTab === "menu" && <RestaurantMenu />}
          {activeTab === "reviews" && <RestaurantReviews />}
          {activeTab === "settings" && <RestaurantSetting />}
        </div>
      </div>
    </>
  );
};

export default RestaurantDashboard;

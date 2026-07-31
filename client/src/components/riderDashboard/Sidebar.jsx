import React from "react";
import { MdDashboard } from "react-icons/md";
import { FaTruck } from "react-icons/fa";
import { MdAttachMoney } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const mainTabs = [
    { name: "Overview", value: "overview", icon: <MdDashboard /> },
    { name: "Deliveries", value: "deliveries", icon: <FaTruck /> },
    { name: "Earnings", value: "earnings", icon: <MdAttachMoney /> },
  ];

  const settingsTab = { name: "Settings", value: "settings", icon: <IoMdSettings /> };

  const renderTab = (tab) => (
    <li
      key={tab.value}
      className={`cursor-pointer rounded-full px-3 py-2 text-sm text-(--color-neutral) flex items-center gap-2 whitespace-nowrap ${
        activeTab === tab.value
          ? "bg-(--color-primary) text-(--color-primary-content) font-semibold"
          : "hover:bg-(--color-secondary) hover:text-(--color-secondary-content) transition-colors duration-200"
      }`}
      onClick={() => setActiveTab(tab.value)}
    >
      {tab.icon} {tab.name}
    </li>
  );

  return (
    <>
      <div className="h-full flex flex-col">
        <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-4 lg:overflow-visible lg:pb-0 flex-1">
          {mainTabs.map((tab) => renderTab(tab))}
        </ul>
        <ul className="flex gap-2 overflow-x-auto border-t border-(--color-secondary) pt-4 lg:flex-col lg:gap-4 lg:overflow-visible">
          {renderTab(settingsTab)}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;

import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import TabNavigation from "../../components/common/TabNavigation.tsx";
import KitchenTab from "./KitchenTab.tsx";
import CategoryTab from "./CategoryTab.tsx";
import ExpenseTab from "./ExpenseTab.tsx";

export default function KitchenList() {
    const [activeTab, setActiveTab] = useState("kitchen");

    const tabs = [
        {
            id: "kitchen",
            label: "Кухня",
        },
        {
            id: "category",
            label: "Категория",
        },
        {
            id: "expense",
            label: "Расход",
        },
    ];

    const renderActiveTab = () => {
        switch (activeTab) {
            case "kitchen":
                return <KitchenTab />;
            case "category":
                return <CategoryTab />;
            case "expense":
                return <ExpenseTab />;
            default:
                return <KitchenTab />;
        }
    };

    return (
        <>
            <PageMeta title="PH-sklad" description="Кухня" />
            <PageBreadcrumb pageTitle="Кухня" />

            <div className="space-y-6">
                <TabNavigation
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {renderActiveTab()}
            </div>
        </>
    );
}

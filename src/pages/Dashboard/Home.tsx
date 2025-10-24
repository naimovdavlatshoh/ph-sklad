// import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
// import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "../../components/ecommerce/StatisticsChart";
// import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
// import RecentOrders from "../../components/ecommerce/RecentOrders";
// import DemographicCard from "../../components/ecommerce/DemographicCard";
import ArrivalPaymentsChart from "../../components/ecommerce/ArrivalPaymentsChart";
import KitchenChart from "../../components/ecommerce/KitchenChart";
import MaterialsChart from "../../components/ecommerce/MaterialsChart";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
    return (
        <>
            <PageMeta
                title="PH-sklad Dashboard"
                description="Dashboard for PH-sklad warehouse management system"
            />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                {/* New Dashboard Components */}
                <div className="col-span-12">
                    <ArrivalPaymentsChart />
                </div>

                <div className="col-span-12 xl:col-span-6">
                    <KitchenChart />
                </div>

                <div className="col-span-12 xl:col-span-6">
                    <MaterialsChart />
                </div>

                {/* Original Components */}
                {/* <div className="col-span-12 space-y-6 xl:col-span-7">
                    <EcommerceMetrics />
                    <MonthlySalesChart />
                </div>

                <div className="col-span-12 xl:col-span-5">
                    <MonthlyTarget />
                </div>

                <div className="col-span-12">
                    <StatisticsChart />
                </div>

                <div className="col-span-12 xl:col-span-5">
                    <DemographicCard />
                </div>

                <div className="col-span-12 xl:col-span-7">
                    <RecentOrders />
                </div> */}
            </div>
        </>
    );
}

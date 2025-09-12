import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import UserList from "./pages/Users/UserList";
import { Toaster } from "react-hot-toast";
import { SearchProvider } from "./context/SearchContext";

import CategoryList from "./pages/Categories";
import MaterialList from "./pages/Materials";
import SupplierList from "./pages/Suppliers";
import ForemanList from "./pages/Foremen";
import ArrivalList from "./pages/Arrivals";
import { MaterialsIssuesList } from "./pages/MaterialsIssues";
import { WriteOff } from "./pages/WriteOff";
import { BalanceList } from "./pages/Balance";
import { ReturnList } from "./pages/Returns";
import { PaymentList } from "./pages/Payments";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/signin" replace />;
    }

    return <>{children}</>;
};

// Public Route Component (for auth pages)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");

    if (token) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default function App() {
    return (
        <>
            <SearchProvider>
                <Router>
                    <ScrollToTop />
                    <Routes>
                        {/* Dashboard Layout - Protected Routes */}
                        <Route
                            element={
                                <ProtectedRoute>
                                    <AppLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index path="/" element={<Home />} />

                            {/* Others Page */}
                            <Route path="/profile" element={<UserProfiles />} />
                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/blank" element={<Blank />} />

                            {/* Forms */}
                            <Route
                                path="/form-elements"
                                element={<FormElements />}
                            />

                            {/* Tables */}
                            <Route
                                path="/basic-tables"
                                element={<BasicTables />}
                            />
                            <Route path="/users" element={<UserList />} />

                            <Route
                                path="/categories"
                                element={<CategoryList />}
                            />

                            <Route
                                path="/materials"
                                element={<MaterialList />}
                            />

                            <Route
                                path="/suppliers"
                                element={<SupplierList />}
                            />

                            <Route path="/foremen" element={<ForemanList />} />

                            <Route path="/arrivals" element={<ArrivalList />} />

                            <Route
                                path="/materialsissues"
                                element={<MaterialsIssuesList />}
                            />

                            <Route path="/balance" element={<BalanceList />} />

                            <Route path="/returns" element={<ReturnList />} />

                            <Route path="/payments" element={<PaymentList />} />

                            <Route path="/writeoff" element={<WriteOff />} />

                            {/* Ui Elements */}
                            <Route path="/alerts" element={<Alerts />} />
                            <Route path="/avatars" element={<Avatars />} />
                            <Route path="/badge" element={<Badges />} />
                            <Route path="/buttons" element={<Buttons />} />
                            <Route path="/images" element={<Images />} />
                            <Route path="/videos" element={<Videos />} />

                            {/* Charts */}
                            <Route path="/line-chart" element={<LineChart />} />
                            <Route path="/bar-chart" element={<BarChart />} />
                        </Route>

                        {/* Auth Layout - Public Routes */}
                        <Route
                            path="/signin"
                            element={
                                <PublicRoute>
                                    <SignIn />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                <PublicRoute>
                                    <SignUp />
                                </PublicRoute>
                            }
                        />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Toaster position="bottom-right" reverseOrder={false} />
                </Router>
            </SearchProvider>
        </>
    );
}

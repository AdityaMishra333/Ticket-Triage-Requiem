import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateTicket from "./pages/CreateTicket";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TicketDetails from "./pages/TicketDetails";
import TrackTicket from "./pages/TrackTicket";
import AuthValidator from "./components/AuthValidator";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTicketDetails from "./pages/AdminTicketDetails"
import NotFound from "./pages/NotFound";

function App() {
    return (
<BrowserRouter>
    <Routes>
        <Route
            path="*"
            element={
                <AuthValidator>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/create-ticket" element={<CreateTicket />} />
                        <Route path="/track-ticket" element={<TrackTicket />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/tickets/:ticketId" element={<AdminTicketDetails />} />
                        <Route path="/tickets/:ticketId" element={<TicketDetails />}
/>
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </AuthValidator>
            }
        />
    </Routes>
</BrowserRouter>
    );
}

export default App;

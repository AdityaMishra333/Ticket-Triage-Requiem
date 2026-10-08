import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateTicket from "./pages/CreateTicket";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TicketDetails from "./pages/TicketDetails";
import TrackTicket from "./pages/TrackTicket";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-ticket" element={<CreateTicket />} />
                <Route path="/track-ticket" element={<TrackTicket />} />
                <Route
    path="/tickets/:ticketId"
    element={<TicketDetails />}
/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
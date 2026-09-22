import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateTicket from "./pages/CreateTicket";
import TrackTicket from "./pages/TrackTicket";
import TicketDetails from "./pages/TicketDetails";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/create-ticket"
                    element={<CreateTicket />}
                />

                <Route
                    path="/track-ticket"
                    element={<TrackTicket />}
                />

                <Route
                    path="/tickets/:ticketId"
                    element={<TicketDetails />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;
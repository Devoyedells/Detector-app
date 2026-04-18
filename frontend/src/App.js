import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Detector from "./pages/Detector";
import { Toaster } from "sonner";

function App() {
    return (
        <div className="App dark">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Detector />} />
                </Routes>
            </BrowserRouter>
            <Toaster
                theme="dark"
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: "rgba(14,20,38,0.85)",
                        backdropFilter: "blur(14px)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#f1f5f9",
                    },
                }}
            />
        </div>
    );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import Cyber from "./pages/Cyber";
import WorldNews from "./pages/WorldNews";
import OSINT from "./pages/OSINT";
import DarkWeb from "./pages/DarkWeb";
import SocialMedia from "./pages/SocialMedia";
import "./styles/global.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="cyber" element={<Cyber />} />
          <Route path="world" element={<WorldNews />} />
          <Route path="osint" element={<OSINT />} />
          <Route path="darkweb" element={<DarkWeb />} />
          <Route path="social" element={<SocialMedia />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { CompanyPage } from "./pages/CompanyPage";
import { HomePage } from "./pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/entreprise/:id" element={<CompanyPage />} />
          <Route path="*" element={<p>Page introuvable.</p>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;

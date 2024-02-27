import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "../i18n.config";

const DashboardPage = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard }))
);

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/app">
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

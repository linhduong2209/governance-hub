import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "../i18n.config";

const DashboardPage = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard }))
);
const CreateDaoPage = lazy(() =>
  import("./pages/CreateDAO").then((module) => ({
    default: module.CreateDAO,
  }))
);

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/app">
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="create" element={<CreateDaoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

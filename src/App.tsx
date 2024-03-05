import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GridLayout } from "src/components/Layout";
import Navbar from "src/containers/Navbar";
import { WalletMenu } from "src/containers/WalletMenu";

import "../i18n.config";

const DashboardPage = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard }))
);
const CreateDaoPage = lazy(() =>
  import("./pages/CreateDAO").then((module) => ({
    default: module.CreateDAO,
  }))
);

const DaoWrapper: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <GridLayout>
          <Routes>
            <Route path="create" element={<CreateDaoPage />} />
          </Routes>
        </GridLayout>
      </div>
    </>
  );
};

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dao/*" element={<DaoWrapper />} />
        </Routes>
        <WalletMenu />
      </BrowserRouter>
    </>
  );
}

export default App;

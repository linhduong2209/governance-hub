import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GridLayout } from "src/components/Layout";
import Navbar from "src/containers/Navbar";

import "../i18n.config";
import { ContextProvider } from "./services/web3modal";

const DashboardPage = lazy(() =>
  import("./pages/Dashboard").then(module => ({ default: module.Dashboard }))
);
const CreateDaoPage = lazy(() =>
  import("./pages/CreateDAO").then(module => ({
    default: module.CreateDAO
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
    <ContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dao/*" element={<DaoWrapper />} />
        </Routes>
        {/* <WalletMenu /> */}
      </BrowserRouter>
    </ContextProvider>
  );
}

export default App;

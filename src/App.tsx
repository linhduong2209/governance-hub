import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { GridLayout } from "src/components/layout";
import Navbar from "src/containers/Navbar";

import "../i18n.config";
import { Loading } from "./components/Temporary";

const DashboardPage = lazy(() =>
  import("./pages/Dashboard").then(module => ({ default: module.Dashboard })),
);
const CreateDaoPage = lazy(() =>
  import("./pages/CreateDAO").then(module => ({
    default: module.CreateDAO,
  })),
);
const DaoPage = lazy(() =>
  import("./pages/DAODetail").then(module => ({
    default: module.DAODetail,
  })),
);

const DaoWrapper: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <GridLayout>
          <CreateDaoPage />
        </GridLayout>
      </div>
    </>
  );
};

const DaosWrapper: React.FC = () => {
  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen">
        <GridLayout>
          <Routes>
            <Route path="dao-detail" element={<DaoPage />} />
          </Routes>
          {/* <DaoPage /> */}
        </GridLayout>
      </div>
    </>
  );
};

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="create/*" element={<DaoWrapper />} />
      </Routes>
      {/* <WalletMenu /> */}
    </Suspense>
  );
}

export default App;

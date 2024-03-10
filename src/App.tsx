import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { GridLayout } from "src/components/Layout";
import Navbar from "src/containers/Navbar";

import "../i18n.config";
import { Loading } from "./components/Temporary";
import { BrowserRouter } from "react-router-dom";
import { NetworkProvider } from "./context/network";
import { NetworkErrorMenu } from "./containers/NetworkErrorMenu";

const DashboardPage = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard }))
);
const CreateDaoPage = lazy(() =>
  import("./pages/CreateDAO").then((module) => ({
    default: module.CreateDAO,
  }))
);
const DaoPage = lazy(() =>
  import("./pages/DAODetail").then((module) => ({
    default: module.DAODetail,
  }))
);

const ProposalPage = lazy(() =>
  import("./pages/ProposalDetail").then((module) => ({
    default: module.ProposalDetail,
  }))
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
      <div className="min-h-screen">
        <GridLayout>
          <DaoPage />
        </GridLayout>
      </div>
    </>
  );
};

const ProposalWrapper: React.FC = () => {
  return (
    <>
      <div className="min-h-screen">
        <GridLayout>
          <ProposalPage />
        </GridLayout>
      </div>
    </>
  );
};

function App() {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <BrowserRouter>
          <NetworkProvider>
            <Routes>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="create/*" element={<DaoWrapper />} />
              <Route path="dao-detail" element={<DaosWrapper />} />
              <Route path="proposal-detail" element={<ProposalWrapper />} />
            </Routes>
          </NetworkProvider>
        </BrowserRouter>
      </Suspense>
      <NetworkErrorMenu />
    </>
  );
}

export default App;

import React from "react";
import ReactDOM from "react-dom/client";
import { LinearProgress } from "./@aragon/ods-old";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <React.Suspense fallback={<LinearProgress color="secondary" />}>
      <App />
    </React.Suspense>
  </React.StrictMode>
);

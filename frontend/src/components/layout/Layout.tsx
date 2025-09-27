import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { ConnectionStatus } from "./ConnectionStatus";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 animate-fade-in">
          <div className="mb-4">
            <ConnectionStatus />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
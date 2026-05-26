import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useTimer } from "./features/timer/timerStore";

function App() {
  const tick = useTimer((s) => s.tick);
  const endBreak = useTimer((s) => s.endBreak);
  const onboardingComplete = useTimer((s) => s.profile.onboardingComplete);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!onboardingComplete) {
      navigate("/onboarding", { replace: true });
    }
  }, [onboardingComplete, navigate]);

  useEffect(() => {
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    const unlisten = listen("break-finished", () => {
      endBreak();
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [endBreak]);

  return (
    <div className="h-full flex flex-col">
      <nav className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="font-semibold tracking-tight">Stretch Desk</div>
        <div className="flex gap-4 text-sm text-muted">
          <Link
            to="/"
            className={location.pathname === "/" ? "text-text" : "hover:text-text"}
          >
            Timer
          </Link>
          <Link
            to="/settings"
            className={
              location.pathname === "/settings" ? "text-text" : "hover:text-text"
            }
          >
            Settings
          </Link>
        </div>
      </nav>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default App;

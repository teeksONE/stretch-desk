import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";

export default function Warning() {
  const [params] = useSearchParams();
  const total = Math.max(1, parseInt(params.get("seconds") ?? "10", 10));
  const [remaining, setRemaining] = useState(total);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const next = Math.max(0, total - elapsed);
      setRemaining(next);
      if (next === 0) {
        clearInterval(id);
        invoke("close_warning_pill").catch(() => {});
      }
    }, 200);
    return () => clearInterval(id);
  }, [total]);

  return (
    <div className="fixed inset-0 bg-surface text-text flex items-center px-4 select-none border border-border rounded-lg">
      <div className="flex items-center gap-3 w-full">
        <div className="text-2xl">⏰</div>
        <div className="flex flex-col leading-tight">
          <div className="text-[10px] uppercase tracking-widest text-muted">
            Break in
          </div>
          <div className="text-2xl font-mono tabular-nums">{remaining}s</div>
        </div>
      </div>
    </div>
  );
}

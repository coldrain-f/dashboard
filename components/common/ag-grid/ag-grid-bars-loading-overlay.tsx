import React from "react";
import type { CustomLoadingOverlayProps } from "ag-grid-react";

export default (props: CustomLoadingOverlayProps & { loadingMessage: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="flex gap-1 h-8 items-end">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1.5 bg-slate-500 rounded-full animate-pulse"
            style={{
              height: `${12 + Math.random() * 20}px`,
              animationDelay: `${i * 100}ms`,
              animationDuration: '0.8s',
            }}
          />
        ))}
      </div>
      <span className="text-sm text-slate-500">{props.loadingMessage}</span>
    </div>
  );
};
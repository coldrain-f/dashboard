import React from "react";
import type { CustomLoadingOverlayProps } from "ag-grid-react";

export default (props: CustomLoadingOverlayProps & { loadingMessage: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12">
        <svg className="animate-spin w-12 h-12" viewBox="0 0 50 50">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="text-sm text-slate-500">{props.loadingMessage}</span>
    </div>
  );
};
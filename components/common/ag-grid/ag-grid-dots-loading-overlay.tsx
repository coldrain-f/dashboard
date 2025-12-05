import React from "react";
import type { CustomLoadingOverlayProps } from "ag-grid-react";

export default (props: CustomLoadingOverlayProps & { loadingMessage: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-slate-500">{props.loadingMessage}</span>
    </div>
  );
};
import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (props: CustomCellRendererProps) => {
    if (props.node.group) {
        return null;
    }

    return (
        <div className="w-full h-10 flex items-center px-3 border border-slate-200 rounded bg-white hover:border-slate-300">
            {props.value}
        </div>
    );
};
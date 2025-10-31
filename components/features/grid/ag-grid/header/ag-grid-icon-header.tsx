import React from 'react';
import { IconLockFilled } from "@tabler/icons-react"

import type { CustomInnerHeaderProps } from 'ag-grid-react';



export interface MyCustomInnerHeaderProps extends CustomInnerHeaderProps {
    isLock: boolean;
}

export default (props: MyCustomInnerHeaderProps) => {
    return (
        <div className="customInnerHeader">
            {/* {props.icon && <i className={`fa ${props.icon}`}></i>} */}
            <div className='flex gap-2'>
                {props.isLock && <IconLockFilled size={15} />}
                <span>{props.displayName}</span>
            </div>
        </div>
    );
};
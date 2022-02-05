import * as React from 'react';
import { useContext, useEffect, useState } from 'react';

import { isMobile } from 'react-device-detect';

const MobileContext = React.createContext<boolean>(isMobile);

export function useMobile() {
    return useContext(MobileContext);
}

type Props = {
    children: React.ReactNode
}

export function MobileProvider({ children }: Props) {
    const [mobile, setMobile] = useState(isMobile);

    useEffect(() => {
        // console.log('Mobile Provider useEffect')
        setMobile(isMobile);
    }, []);

    return (
        <MobileContext.Provider value={mobile}>
            {children}
        </MobileContext.Provider>
    );
}

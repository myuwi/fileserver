const LOGGER = {
    debug: (...args: any) => {
        const css = 'background: #587ff3; color: #fff; padding: 2px 6px; border-radius: 2px;';
        console.log('%cDEBUG%c', css, '', ...args);
    }
};

export { LOGGER };
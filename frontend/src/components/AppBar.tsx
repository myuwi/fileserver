type Props = {
    children: React.ReactNode;
    background?: string;
}


const AppBar = ({ children, background, ...rest }: Props) => {

    return (
        <div className="AppBar" {...rest}>
            {children}
        </div>
    );
};

type ButtonProps = {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
}

const AppBarIconButton = ({ children, onClick, className }: ButtonProps) => {
    const classes = className ? `AppBarIconButton ${className}` : 'AppBarIconButton';

    return (
        <button className={classes} onClick={onClick}>{children}</button>
    );
};


type TitleProps = {
    children: React.ReactNode;
}

const AppBarTitle = ({ children }: TitleProps) => {
    return (
        <div className="AppBarTitle">{children}</div>
    );
};

AppBar.IconButton = AppBarIconButton;
AppBar.Title = AppBarTitle;

export { AppBar };
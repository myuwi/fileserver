import { DetailedHTMLProps, ButtonHTMLAttributes } from 'react';

type Props = {
    children: React.ReactNode;
    background?: string;
}


const AppBar = ({ children, ...rest }: Props) => {

    return (
        <div className="AppBar" {...rest}>
            {children}
        </div>
    );
};


type ButtonProps = DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
>

const AppBarIconButton = ({ children, className, ...props }: ButtonProps) => {
    const classes = className ? `AppBarIconButton ${className}` : 'AppBarIconButton';

    return (
        <button
            className={classes}
            {...props}
        >{children}</button>
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
import { DetailedHTMLProps, ButtonHTMLAttributes } from 'react';

type Props = {
    children: React.ReactNode;
    background?: string;
}


export const AppBar = ({ children, ...rest }: Props) => {

    return (
        <div className="flex flex-row flex-nowrap items-center flex-none absolute z-20 top-0 inset-x-0 overflow-hidden h-14 px-4 bg-white" {...rest}>
            {children}
        </div>
    );
};


type ButtonProps = DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
>

const AppBarIconButton = ({ children, className, ...props }: ButtonProps) => {
    return (
        <button
            className={`h-6 w-6 p-0 mx-0 my-4 border-none outline-none focus:outline-none bg-transparent text-secondary-800${className ? ` ${className}` : ''}`}
            {...props}
        >{children}</button>
    );
};


type TitleProps = {
    children: React.ReactNode;
}

const AppBarTitle = ({ children }: TitleProps) => {
    return (
        <div className="flex-auto text-base leading-4 mx-8 font-bold whitespace-nowrap overflow-hidden overflow-ellipsis">{children}</div>
    );
};

AppBar.IconButton = AppBarIconButton;
AppBar.Title = AppBarTitle;

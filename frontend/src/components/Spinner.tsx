const sizeClasses = {
    '16': 'h-4 w-4',
    '64': 'h-16 w-16',
};

const positionClasses = {
    default: '',
    center: ' absolute left-1/2 transform -translate-x-1/2',
};

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    size?: keyof typeof sizeClasses;
    position?: keyof typeof positionClasses;
};

export const Spinner = ({ className, size = '64', position = 'default', ...rest }: Props) => {
    return (
        <div className={`${sizeClasses[size]}${positionClasses[position]}${className ? className : ''}`}>
            <div
                className="inline-block h-full w-full border-3 border-primary-500 border-t-transparent rounded-full align-bottom flex-none animate-spin"
                {...rest}
            />
        </div>
    );
};

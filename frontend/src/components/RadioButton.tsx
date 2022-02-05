import classNames from 'classnames';

type Props = {
    checked: boolean;
    onChange: (e: React.MouseEvent) => void;
    label?: string;
}

export const RadioButton = ({ checked, onChange, label, ...rest }: Props) => {
    const classes = classNames({
        'radio-button': true,
        selected: checked
    });

    return (
        <div className={classes} onClick={onChange} >
            <div className="dot"></div>
            {label && <div className="label">{label}</div>}
        </div>
    );
};

import { RadioButton } from './RadioButton';

type Props = {
    items: any[];
    onChange: (value: any) => void;
    value: any;
}

const RadioGroup = ({ items, value, onChange, ...rest }: Props) => {
    const handleSetChecked = (i: number) => {
        if (typeof onChange === 'function') return onChange(i);
    };

    return (
        <div className="radio-group" {...rest}>
            {/* {label && <div className="radio-group-label">{label}</div>} */}
            <div className="radio-buttons">
                {items.map((e, i: number) => {
                    const checked = value === e.value;
                    return <RadioButton key={e.value} label={e.name} checked={checked} onChange={() => handleSetChecked(e.value)} />;
                })}
            </div>
        </div>
    );
};

export { RadioGroup };

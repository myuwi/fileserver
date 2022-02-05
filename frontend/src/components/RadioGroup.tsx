import { RadioButton } from './RadioButton';

type Props = {
    items: any[];
    onChange: (value: any) => void;
    value: any;
}

export const RadioGroup = ({ items, value, onChange, ...rest }: Props) => {
    const handleSetChecked = (e: any) => {
        console.log(e);
        if (typeof onChange === 'function') return onChange(e.value);
    };

    return (
        <div className="radio-group" {...rest}>
            {/* {label && <div className="radio-group-label">{label}</div>} */}
            <div className="radio-buttons">
                {items.map((e, i: number) => {
                    const checked = value === e.value;
                    return <RadioButton key={e.value} label={e.name} checked={checked} onChange={() => handleSetChecked(e)} />;
                })}
            </div>
        </div>
    );
};

type Props = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export const Switch = ({ checked, onChange, disabled = false }: Props) => {

    const handleChange = () => {
        if (disabled) return;
        if (typeof onChange === 'function') return onChange(!checked);
    };

    return (
        <div
            className="switch"
            role="switch"
            tabIndex={0}
            onClick={handleChange}
            aria-checked={checked}
            aria-disabled={disabled}
        >
        </div>
    );
};

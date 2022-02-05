import * as React from 'react';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { mdiMagnify, mdiClose } from '@mdi/js';

type Props = {
    onChange: (value: string) => void;
    value: string;
}

export const SearchBar = React.forwardRef(({
    onChange,
    value
}: Props, ref: React.ForwardedRef<HTMLInputElement>) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const clearValue = () => {
        onChange('');
    };

    return (
        <div className="flex flex-row flex-nowrap w-80 bg-secondary-100 p-1 rounded-sm h-8">
            <Icon icon={mdiMagnify} size="18" className="box-content p-0.75" />
            <form
                className="flex flex-row flex-nowrap flex-auto px-1"
                autoComplete='disabled'
                onSubmit={(e) => e.preventDefault()}
            >
                <input
                    className="flex-auto outline-none bg-transparent h-full"
                    ref={ref}
                    type="text"
                    placeholder="Search Files"
                    value={value}
                    onChange={handleChange}
                />
            </form>
            {value !== '' && (
                <IconButton icon={mdiClose} iconSize="18" onClick={clearValue} />
            )}
        </div>
    );
});

SearchBar.displayName = 'SearchBar';

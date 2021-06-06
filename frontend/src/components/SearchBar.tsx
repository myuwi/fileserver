import * as React from 'react';
import { Icon } from './Icon';
import { mdiMagnify, mdiClose } from '@mdi/js';

type Props = {
    onChange: (value: string) => void;
    value: string;
}

const SearchBar = ({ onChange, value }: Props) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const clearValue = () => {
        onChange('');
    };

    return (
        <div className="fs-searchbar">
            <Icon icon={mdiMagnify} className="magnify" />
            <form
                autoComplete='disabled'
                onSubmit={(e) => e.preventDefault()}
            >
                <input
                    type="text"
                    placeholder="Search Files"
                    value={value}
                    onChange={handleChange}
                />
            </form>
            {value !== '' && (
                <Icon icon={mdiClose} className="close" onClick={clearValue} />
            )}
        </div>
    );
};




export { SearchBar };

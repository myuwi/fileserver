import { IconButton } from './IconButton';

import { mdiImage, mdiViewList } from '@mdi/js';

type Props = {
    list: boolean;
    setList: (a: boolean) => void;
}

const FSBottomBar = ({ list, setList }: Props) => {
    return (
        <div className="fs-bottom-bar">
            <IconButton icon={mdiViewList} onClick={() => setList(!list)} />
            <IconButton icon={mdiImage} onClick={() => setList(!list)} />
        </div>
    );
};

export { FSBottomBar };

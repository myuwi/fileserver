import { IconButton } from './IconButton';

import { mdiViewList, mdiViewModule } from '@mdi/js';

type Props = {
    list: boolean;
    setList: (a: boolean) => void;
}

const FSBottomBar = ({ list, setList }: Props) => {
    return (
        <div className="fs-bottom-bar">
            <IconButton icon={!list ? mdiViewModule : mdiViewList} onClick={() => setList(!list)} />
        </div>
    );
};

export { FSBottomBar };

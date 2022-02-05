import { Icon } from './Icon';
import { IconButton } from './IconButton';

import { mdiArrowUp, mdiViewList, mdiViewModule } from '@mdi/js';

type Props = {
    list: boolean;
    setList: (a: boolean) => void;
}

export const MobileSort = ({ list, setList }: Props) => {
    return (
        <div className="fs-itemlist-mobile-sort">
            <button className="sort-button">
                <span>Sort by</span>
                <span className="sort-type">Name</span>
                <Icon icon={mdiArrowUp} />
            </button>
            <IconButton icon={!list ? mdiViewModule : mdiViewList} onClick={() => setList(!list)} />
        </div>
    );
};

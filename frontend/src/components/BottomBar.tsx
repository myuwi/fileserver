import { IconButton } from './IconButton';

import { mdiImage, mdiViewList } from '@mdi/js';
import { useSettings, ViewMode } from '../hooks/useSettings';

export const BottomBar = () => {
    const { settings, updateSettings } = useSettings();

    const modes: {
        icon: string;
        value: ViewMode;
    }[] = [
            {
                icon: mdiViewList,
                value: 'details'
            },
            {
                icon: mdiImage,
                value: 'grid'
            }
        ];

    return (
        <div className="flex flex-row flex-nowrap justify-end bg-white border-t border-secondary-100 absolute bottom-0 left-0 right-0">
            {modes.map((mode) => {
                return (
                    <IconButton
                        key={mode.value}
                        icon={mode.icon}
                        className={`transition-opacity duration-50 ease-in-out ${settings.viewMode === mode.value ? '' : 'opacity-20'}`}
                        onClick={() => updateSettings({ type: 'VIEW_MODE', payload: mode.value })}
                    />
                );
            })}
        </div>
    );
};

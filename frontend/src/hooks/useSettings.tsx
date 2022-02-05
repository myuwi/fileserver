import createPersistedState from 'use-persisted-state';

const useSettingsState = createPersistedState('settings');

export const uiSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type UiSize = typeof uiSizes[number];

export const viewModes = ['details', 'grid'] as const;
export type ViewMode = typeof viewModes[number];

type DarkModeAction = {
    type: 'DARK_MODE';
    payload: boolean;
}

type UiSizeAction = {
    type: 'UI_SIZE';
    payload: UiSize;
}

type ViewModeAction = {
    type: 'VIEW_MODE';
    payload: ViewMode;
}

type Action = DarkModeAction | UiSizeAction | ViewModeAction;

interface Settings {
    darkMode: boolean;
    uiSize: UiSize;
    viewMode: ViewMode;
}

const defaultSettings: Settings = {
    darkMode: false,
    uiSize: 'md',
    viewMode: 'grid'
};

export const useSettings = () => {
    const [settings, setSettings] = useSettingsState(defaultSettings);

    const updateSettings = (action: Action) => {
        switch (action.type) {
            case 'DARK_MODE':
                setSettings({
                    ...settings,
                    darkMode: action.payload
                });
                break;
            case 'UI_SIZE':
                setSettings({
                    ...settings,
                    uiSize: action.payload
                });
                break;
            case 'VIEW_MODE':
                setSettings({
                    ...settings,
                    viewMode: action.payload
                });
                break;
            default:
                break;
        }
    };

    return { settings, updateSettings };
};

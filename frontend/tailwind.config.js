module.exports = {
    content: ['./src/**/*.tsx', './public/index.html'],
    theme: {
        fontFamily: {
            sans: ['Nunito', 'sans-serif'],
        },
        colors: {
            transparent: 'transparent',
            white: '#fff',
            black: '#000',
            'modal-bg': 'rgba(0,0,0,0.5)',
            primary: {
                50: '#f7f9fe',
                100: '#eef2fe',
                200: '#d5dffc',
                300: '#bcccfa',
                400: '#8aa5f7',
                500: '#587ff3',
                600: '#4f72db',
                700: '#425fb6',
                800: '#354c92',
                900: '#2b3e77',
            },
            secondary: {
                50: '#f9f9fa',
                100: '#f2f3f5',
                200: '#e0e1e5',
                300: '#cdcfd6',
                400: '#a7abb7',
                500: '#818798',
                600: '#747a89',
                700: '#616572',
                800: '#4d515b',
                900: '#3f424a',
            },
        },
        spacing: {
            px: '1px',
            0: '0',
            0.5: '2px',
            0.75: '3px',
            1: '4px',
            1.25: '5px',
            1.5: '6px',
            1.75: '7px',
            2: '8px',
            2.5: '10px',
            3: '12px',
            3.5: '14px',
            4: '16px',
            4.5: '18px',
            5: '20px',
            6: '24px',
            7: '28px',
            8: '32px',
            9: '36px',
            10: '40px',
            11: '44px',
            12: '48px',
            14: '56px',
            16: '64px',
            20: '80px',
            24: '96px',
            28: '112px',
            32: '128px',
            36: '144px',
            40: '160px',
            44: '176px',
            48: '192px',
            52: '208px',
            56: '224px',
            60: '240px',
            64: '256px',
            72: '288px',
            80: '320px',
            96: '384px',
        },
        extend: {
            flex: {
                50: '0 1 50%',
            },
            minWidth: {
                px: '1px',
                0: '0',
                0.5: '2px',
                0.75: '3px',
                1: '4px',
                1.25: '5px',
                1.5: '6px',
                1.75: '7px',
                2: '8px',
                2.5: '10px',
                3: '12px',
                3.5: '14px',
                4: '16px',
                4.5: '18px',
                5: '20px',
                6: '24px',
                7: '28px',
                8: '32px',
                9: '36px',
                10: '40px',
                11: '44px',
                12: '48px',
                14: '56px',
                16: '64px',
                20: '80px',
                24: '96px',
                28: '112px',
                32: '128px',
                36: '144px',
                40: '160px',
                44: '176px',
                48: '192px',
                52: '208px',
                56: '224px',
                60: '240px',
                64: '256px',
                72: '288px',
                80: '320px',
                96: '384px',
            },
            maxWidth: {
                '1/2': '50%',
            },
            padding: {
                full: '100%',
            },
            gridTemplateColumns: {
                '128px': 'repeat(auto-fill, 128px)',
                '1/5': 'repeat(auto-fill, 19%);',
                '1/4': 'repeat(auto-fill, 24%);',
                '1/3': 'repeat(auto-fill, 32%);',
                '1/2': 'repeat(auto-fill, 49%);',
                full: 'repeat(auto-fill, 100%);',
                half: '50% 50%',
            },
            borderWidth: {
                3: '3px',
            },
            height: {
                screen: 'calc(var(--vh, 1vh) * 100)',
            },
        },
    },
    plugins: [],
};

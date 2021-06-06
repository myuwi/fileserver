/**
 * Returns a boolean value based on whether the input string is a numeric value or not.
 */
export const isNumeric = (str: string) => {
    if (typeof str === 'string') {
        return /^\d+$/.test(str);
    }
    return false;
};

/**
 * Returns a random alphanumeric string with the given length.
 */
export const generateId = (length: number = 8) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
export const copyToClipboard = (str: string) => {
    const elem = document.createElement('textarea');
    elem.value = str;
    document.body.appendChild(elem);
    elem.select();
    document.execCommand('copy');
    document.body.removeChild(elem);
};
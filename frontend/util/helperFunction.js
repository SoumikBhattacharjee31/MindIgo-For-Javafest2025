function formatText(input) {
    const escapeCharacterMapping = {
        '\\n': '\n',
        '\\t': '\t',
        '\\"': '"',
        '\\\\': '\\'
    };

    // Replace escape characters
    let formattedText = input.replace(/\\n|\\t|\\"|\\\\/g, (match) => escapeCharacterMapping[match]);

    // Make text between ** bold
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Make text between * italic
    formattedText = formattedText.replace(/\*(?!\*)(.*?)\*(?!\*)/g, '<em>$1</em>');

    return formattedText;
}

export {formatText}

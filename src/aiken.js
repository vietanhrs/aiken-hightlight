const KEYWORDS = [
    "if", "else", "when", "is", "fn", "use", "let", "pub", "type", "opaque",
    "const", "todo", "expect", "test", "bench", "trace", "fail", "validator",
    "and", "or", "as", "via", "once"
];

const R_COMMENT = "(\\/\\/.*)";
const R_STRING = "(\"(?:\\\\.|[^\"\\\\])*\")";
const R_KEYWORD = `\\b(${KEYWORDS.join("|")})\\b`;
const R_BOOLEAN = "\\b(True|False)\\b";
const R_NUMBER = "\\b(0x[0-9a-fA-F]+|0b[01]+|\\d+[\\d_]*(?:\\.\\d+)?)\\b";
const R_TYPE = "\\b([A-Z][a-zA-Z0-9_]*)\\b";
const R_FUNCTION = "\\b([a-z][a-zA-Z0-9_]*)(?=\\()";
const R_OPERATOR = "(\\->|\\<\\-|\\|\\>|\\.\\.|<=|>=|==|!=|<|>|&&|\\|\\||\\|/|\\*|%|=)";

// 1 = Comment
// 2 = String
// 3 = Keyword
// 4 = Boolean
// 5 = Number
// 6 = Type
// 7 = Function
// 8 = Operator
const TOKENIZER = new RegExp(
    [R_COMMENT, R_STRING, R_KEYWORD, R_BOOLEAN, R_NUMBER, R_TYPE, R_FUNCTION, R_OPERATOR].join("|"),
    "g"
);

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function highlightAiken(code) {
    let html = "";
    let lastIndex = 0;
    
    TOKENIZER.lastIndex = 0;
    
    let match;
    while ((match = TOKENIZER.exec(code)) !== null) {
        if (match.index > lastIndex) {
            html += escapeHtml(code.substring(lastIndex, match.index));
        }

        const [fullMatch, comment, string, keyword, boolean, number, type, func, operator] = match;

        if (comment) {
            html += `<span class="aiken-comment">${escapeHtml(comment)}</span>`;
        } else if (string) {
            html += `<span class="aiken-string">${escapeHtml(string)}</span>`;
        } else if (keyword) {
            html += `<span class="aiken-keyword">${escapeHtml(keyword)}</span>`;
        } else if (boolean) {
             html += `<span class="aiken-number">${escapeHtml(boolean)}</span>`; // Treating boolean as number color-wise
        } else if (number) {
            html += `<span class="aiken-number">${escapeHtml(number)}</span>`;
        } else if (type) {
            html += `<span class="aiken-type">${escapeHtml(type)}</span>`;
        } else if (func) {
            html += `<span class="aiken-function">${escapeHtml(func)}</span>`;
        } else if (operator) {
            html += `<span class="aiken-operator">${escapeHtml(operator)}</span>`;
        } else {
            html += escapeHtml(fullMatch);
        }

        lastIndex = TOKENIZER.lastIndex;
    }

    if (lastIndex < code.length) {
        html += escapeHtml(code.substring(lastIndex));
    }

    return html;
}

window.highlightAiken = highlightAiken;

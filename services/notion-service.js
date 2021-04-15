const { NotionAPI } = require("notion-client");

const api = new NotionAPI();

function uuidify(i) {
    return (
        i.substr(0, 8) +
        "-" +
        i.substr(8, 4) +
        "-" +
        i.substr(12, 4) +
        "-" +
        i.substr(16, 4) +
        "-" +
        i.substr(20)
    );
}

class NotionId {
    // private _uuid: string = "";
    // private _plain: string = "";

    constructor(str) {
        if (!str) {
        } else if (str.includes("-")) {
            this._uuid = str;
            this._plain = str.replace(/-/g, "");
        } else {
            this._uuid = uuidify(str);
            this._plain = str;
        }
    }

    get plain() {
        return this._plain;
    }

    get uuid() {
        return this._uuid;
    }
}

async function getNotionPage(notionUrl) {
    const m = notionUrl.match(/[a-z0-9]{32}$/);

    const plainId = m && m[0];

    if (plainId) {
        const notionPageId = new NotionId(plainId);
        const notionBlocks = await api.getPage(notionPageId.plain);

        return {
            id: notionPageId.plain,
            notionBlocks,
        };
    } else return false;
}

module.exports = {
    getNotionPage,
};

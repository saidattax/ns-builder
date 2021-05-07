const { NotionAPI } = require("notion-client");
const fetch = require("node-fetch").default;

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

async function getNotionPageFromDB(path, websiteId) {
    const BASE_API_URL = process.env.BASE_API_URL;

    console.log("[getNotionPageFromDB]", path, websiteId);

    const res = await fetch(
        BASE_API_URL + `/websites/${websiteId}/page?path=${encodeURI(path)}`
    );

    const json = await res.json();

    const page = json.payload.page;

    if (page && page.notionId && page.recordMap) {
        return {
            id: page.notionId,
            notionBlocks: JSON.parse(page.recordMap),
        };
    } else {
        console.log("error, page not found!");
        return false;
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
    getNotionPageFromDB,
};

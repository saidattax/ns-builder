// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async (req, res) => {
    const get = require("lodash/get");
    const { getNotionPage } = require("../../services/notion-service");

    console.log("context query", req.query);

    let path = get(req, "query.path", []);

    let slug = "transmitte-9uf1yp";

    const formattedPath = `${"/" + encodeURI(path.join("/"))}`;

    const resp = await fetch("http://localhost:5038/websites/public/" + slug);

    const json = await resp.json();

    const pages = get(json, "payload.website.pages", []);
    // TODO: const settings = get(json, "payload.website.settings", {});

    console.log("GOT RES", json);

    let page = {
        id: "",
        notionBlocks: null,
    };

    const p = pages.find((p) => p.path === formattedPath);

    const notionUrl = get(p, "notionUrl");

    console.log("--- Got notion Url", notionUrl);

    if (notionUrl) {
        const notionRes = await getNotionPage(notionUrl);

        if (notionRes) {
            page = notionRes;
        }
    } else {
        // redirect to 404
    }

    /* return {
        props: , // will be passed to the page component as props
    };
 */

    res.status(200).json({
        notionBlocks: page.notionBlocks,
        // settings,
        pages,
    });
};

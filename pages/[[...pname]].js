//@ts-ignore
import styles from "../styles/Home.module.css";

import { NotionRenderer, Pdf } from "react-notion-x";

import "react-notion-x/src/styles.css";
import { NotionId } from "../utils/string";

import Link from "next/link";
import { useEffect } from "react";
import Head from "next/head";

export default function Home(props) {
    // console.log("[Home]", props.notionBlocks);

    if (!props.notionBlocks) {
        return null;
    }

    useEffect(() => {
        return () => {};
    }, []);

    function getPrettyPath(id) {
        // console.log("getPrettyPath", id, props.pages);

        const notionId = new NotionId(id);
        const page = props.pages.find((p) => p.notionId === notionId.plain);

        if (page) {
            return page.path;
        } else return "/";
    }

    const myProps = {
        // bodyClassName: "not-notion-full-width index-page",
        // components: {
        // pageLink: "ƒ pageLink() {}",
        // code: "ƒ () {}",
        // collection: "ƒ ao() {}",
        // collectionRow: "ƒ l() {}",
        // tweet: "ƒ se() {}",
        // modal: "{$$typeof: Symbol(react.forward_ref), render: ƒ i()…}",
        // pdf: "{$$typeof: Symbol(react.forward_ref), render: ƒ i()…}",
        // equation: "{$$typeof: Symbol(react.forward_ref), render: ƒ i()…}",
        // },
        // rootPageId: "4db4066b-3873-40e8-a654-97d67b095f38",
        fullPage: true,
        darkMode: false,
        previewImages: true,
        showCollectionViewDropdown: true,
        showTableOfContents: false,
        // for caching
        // mapPageUrl: "ƒ () {}",
        // for caching
        // mapImageUrl: "ƒ Oe() {}",
        pageFooter: null,
        // footer: "<Ae />",
    };

    return (
        <div className={styles.selectText}>
            <Head>{props.title && <title>{props.title}</title>}</Head>

            <div
                dangerouslySetInnerHTML={{
                    __html: props.html || "",
                }}
            ></div>

            {/* custom styles */}
            <style
                dangerouslySetInnerHTML={{
                    __html: props.css || "",
                }}
            ></style>

            {/* custom JS */}
            <div
                dangerouslySetInnerHTML={{
                    __html: props.javascript || "",
                }}
            ></div>

            <NotionRenderer
                components={{
                    pageLink: (props) => {
                        // console.log("Link props", props);

                        return (
                            <Link href={props.href}>
                                <a className={props.className}>
                                    {props.children}
                                </a>
                            </Link>
                        );
                    },
                }}
                mapPageUrl={(pageId) => {
                    const p = getPrettyPath(pageId);
                    return p;
                }}
                {...myProps}
                recordMap={props.notionBlocks}
            />
        </div>
    );
}

export async function getStaticPaths() {
    const dotenv = require("dotenv");
    const get = require("lodash/get");

    // builder always expects JSON from a local file as it doesn't know which website
    // it is going to get from
    const websiteRes = await fetch(
        process.env.NS_BASE_API_URL +
            process.env.NS_BUILD_EP +
            "/" +
            process.env.NS_SITE_ID
    );

    const resJson = await websiteRes.json();

    const pages = get(resJson, "payload.website.pages", []);

    console.log("[getStaticPaths] Got pages", pages.length);

    const paths = pages
        // get only public paths
        .filter((p) => p.visibility === "PUBLIC")
        .map((p) => {
            return {
                params: {
                    pname:
                        p.path === "/"
                            ? false
                            : p.path.split("/").filter((e) => e),
                },
            };
        });

    console.log("Exporting paths", paths);

    return { paths, fallback: true };
}

// This function gets called at build time
export async function getStaticProps(context) {
    const dotenv = require("dotenv");
    const get = require("lodash/get");

    const {
        getNotionPage,
        getNotionPageFromDB,
    } = require("../services/notion-service");

    console.log("context.params", context.params);

    // pages are fetched from website json
    // const websiteJson = require("../website.json");

    let path = get(context, "params.pname", []);

    const formattedPath = `${"/" + encodeURI(path.join("/"))}`;

    console.log(
        "got env variables",
        process.env.NS_BASE_API_URL,
        process.env.NS_BUILD_EP,
        process.env.NS_SITE_ID
    );

    // all other website properties are fetched at runtime (for further updating)
    const websiteRes = await fetch(
        process.env.NS_BASE_API_URL +
            process.env.NS_BUILD_EP +
            "/" +
            process.env.NS_SITE_ID
    );

    const resJson = await websiteRes.json();

    const pages = get(resJson, "payload.website.pages", []);
    console.log("Got pages", pages.length);

    // global website details
    const css = get(resJson, "payload.website.cssProd", "");
    const html = get(resJson, "payload.website.htmlProd", "");
    const javascript = get(resJson, "payload.website.javascriptProd", "");

    // const json = await res.json();
    // console.log("GOT RES", json);

    // current page details
    const currentPage = pages.find((p) => p.path === formattedPath);
    const title = get(currentPage, "title", "");
    const notionUrl = get(currentPage, "notionUrl");

    const notionPage = await getNotionPageFromDB(
        formattedPath,
        process.env.NS_SITE_ID
    );

    console.log("Got notion Url", notionUrl);
    console.log("title of this page is", title, formattedPath);

    // const notionPage = await getNotionPage(notionUrl);

    if (notionPage) {
        console.log("GOT NOTION PAGE", notionPage.id);

        return {
            props: {
                notionBlocks: notionPage.notionBlocks,
                title,
                css,
                html,
                javascript,
                // settings,
                pages,
            }, // will be passed to the page component as props
            revalidate: 5,
        };
    } else {
        console.log("DID NOT GET NOTION PAGE, null page");

        return {
            props: {},
        };
    }
}

/* export async function getServerSideProps(context) {
    const get = require("lodash/get");
    const { getNotionPage } = require("../services/notion-service");

    console.log("context query", context.query);

    let path = get(context, "query.path", []);

    const formattedPath = `${"/" + encodeURI(path.join("/"))}`;

    const res = await fetch("http://localhost:5038/websites/public/" + slug);

    const json = await res.json();

    const pages = get(json, "payload.website.pages", []);
    // TODO: const settings = get(json, "payload.website.settings", {});

    console.log("GOT RES", json);

    let page = {
        id: "",
        notionBlocks: null,
    };

    const p = pages.find((p) => p.path === formattedPath);

    const notionUrl = get(p, "notionUrl");

    console.log("Got notion Url", notionUrl);

    if (notionUrl) {
        const res = await getNotionPage(notionUrl);

        if (res) {
            page = res;
        }
    } else {
        // redirect to 404
    }

    return {
        props: {
            notionBlocks: page.notionBlocks,
            // settings,
            pages,
        }, // will be passed to the page component as props
    };
}
 */

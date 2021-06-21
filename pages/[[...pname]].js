//@ts-ignore
import styles from "../styles/Home.module.css";

import { Collection, CollectionRow, NotionRenderer, Pdf } from "react-notion-x";

import { NotionId } from "../utils/string";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect } from "react";
import Head from "next/head";
import RenderNotodoc from "../components/RenderNotodoc";
import get from "lodash/get";

export default function Home(props) {
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
        // rootPageId: "",
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

    // console.log("[Home]", props.notionBlocks);

    const router = useRouter();

    useEffect(() => {
        return () => {};
    }, []);

    // --- Render Waterfall

    // If the page is not yet generated, this will be displayed
    // initially until getStaticProps() finishes running
    if (router.isFallback) {
        return <div>⚡ Preparing...</div>;
    }

    if (!props.notionBlocks) {
        return <div>This page doesn't exist yet...</div>;
    }

    /* if (
        props.isNotodoc &&
        props.formattedPath === "/" &&
        typeof window !== "undefined"
    ) {
        console.log("redir");
        let url = get(props, "drawerLinks[0].path", undefined);
        url = url || get(props, "drawerLinks[0].paths[0].path", undefined);

        if (url) {
            router.push(url);
        }
    } */

    function getPrettyPath(id) {
        // console.log("getPrettyPath", id, props.pages);

        const notionId = new NotionId(id);

        const page = props.pages.find((p) => p.notionId === notionId.plain);

        if (page) {
            return page.path;
        } else {
            // console.log("Could not find pretty path for", id);
            return "#";
        }
    }

    return (
        <div className={styles.selectText}>
            <Head>
                <title>{props.title || "Untitled"}</title>

                {/* <meta name="description" content={description} /> */}

                {/* og tags */}
                <meta property="og:title" content={props.title || "Untitled"} />
                <meta property="og:locale" content="en_US" />
                {/* <meta property="og:description" content={description} /> */}
                <meta
                    property="og:image"
                    itemProp="image"
                    content={props.metaImage}
                />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content={props.metaImage} />
            </Head>

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

            <div>
                {props.isNotodoc && <RenderNotodoc {...props} />}

                {props.isPage && (
                    <NotionRenderer
                        components={{
                            pageLink: (props) => {
                                // console.log("Link props", props);

                                if (props.href === "#") {
                                    return (
                                        <a className={props.className}>
                                            {props.children}
                                        </a>
                                    );
                                } else {
                                    return (
                                        <Link href={props.href}>
                                            <a className={props.className}>
                                                {props.children}
                                            </a>
                                        </Link>
                                    );
                                }
                            },
                            collection: Collection,
                            collectionRow: CollectionRow,
                        }}
                        mapPageUrl={(pageId) => {
                            const p = getPrettyPath(pageId);
                            return p;
                        }}
                        {...myProps}
                        recordMap={props.notionBlocks}
                    />
                )}
            </div>
        </div>
    );
}

export async function getStaticPaths() {
    const dotenv = require("dotenv");
    const get = require("lodash/get");

    // builder always expects JSON from a local file as it doesn't know which website
    // it is going to get from
    try {
        const websiteRes = await fetch(
            process.env.NS_BASE_API_URL +
                process.env.NS_BUILD_EP +
                "/" +
                process.env.NS_SITE_ID
        );
        const resJson = await websiteRes.json();

        const pages = get(resJson, "payload.website.pages", []);

        console.log("[getStaticPaths] Got pages", pages.length);

        let paths = pages
            // get only public paths
            .filter((p) => p.visibility === "PUBLIC")
            // do not pre-render / path for notodocs
            .filter((p) => (p.isNotodoc && p.path === "/" ? false : true))
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

        return {
            paths,
            fallback: false,
        };
    } catch (err) {
        console.error("ERR AT getStaticPaths()", err);

        return {
            paths: [],
            fallback: false,
        };
    }
}

// This function gets called at build time
export async function getStaticProps(context) {
    try {
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

        // console.log("Got websiteJson", JSON.stringify(resJson));

        const pages = get(resJson, "payload.website.pages", []);
        console.log("Got pages", pages.length);

        // global website details
        const css = get(resJson, "payload.website.cssProd", "");
        const html = get(resJson, "payload.website.htmlProd", "");
        const javascript = get(resJson, "payload.website.javascriptProd", "");
        const drawerLinks = get(resJson, "payload.website.drawerLinks", []);
        const notodocTitle = get(resJson, "payload.website.notodocTitle", "");
        const notodocPageIcon = get(resJson, "payload.website.pageIcon", "");

        // const json = await res.json();
        // console.log("GOT RES", json);

        // current page details
        const currentPage = pages.find((p) => p.path === formattedPath);
        const notionUrl = get(currentPage, "notionUrl", "");

        const notionPage = await getNotionPageFromDB(
            formattedPath,
            process.env.NS_SITE_ID
        );

        const title = get(notionPage, "title", "");
        const notionBlocks = get(notionPage, "recordMap", null);
        const metaImage = get(notionPage, "metaImage", "");
        const metaDescription = get(notionPage, "metaDescription", "");
        const isNotodoc = get(notionPage, "isNotodoc", false);
        // if this page is notodoc
        // const notodocId = get(notionPage, "notodocId", "");

        // console.log("Got notion Url", notionUrl);
        console.log("title of this page is", title, formattedPath, {
            isNotodoc,
        });

        // const notionPage = await getNotionPage(notionUrl);

        if (notionPage && notionBlocks) {
            console.log("GOT NOTION PAGE", notionPage.notionId);

            if (isNotodoc && formattedPath === "/") {
                let toPath = get(drawerLinks, "[0].path", undefined);
                toPath =
                    toPath || get(drawerLinks, "[0].paths[0].path", undefined);

                console.log("toPath", toPath);
                console.log("context", context);

                return {
                    redirect: {
                        destination: toPath,
                        permanent: false,
                    },
                };
            }

            return {
                props: {
                    notionBlocks: notionBlocks,
                    title,
                    css,
                    html,
                    javascript,
                    // meta tags
                    metaImage,
                    metaDescription,
                    // settings,
                    pages,
                    formattedPath,
                    //
                    isNotodoc,
                    drawerLinks,
                    notodocTitle,
                    notodocPageIcon,
                    //
                    isPage: !isNotodoc, //!notodocId,
                }, // will be passed to the page component as props
                // revalidate: 5,
            };
        } else {
            console.log("DID NOT GET NOTION PAGE, null page");

            return {
                props: {},
                // revalidate: 5,
            };
        }
    } catch (err) {
        console.error("ERR AT getStaticProps()", err);

        return {
            props: {},
            // revalidate: 5,
        };
    }
}

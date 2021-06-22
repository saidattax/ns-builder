import React, { useState } from "react";
import { Collection, CollectionRow, NotionRenderer, Pdf } from "react-notion-x";
import { NotionId } from "../utils/string";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect } from "react";
import Head from "next/head";
import cn from "classnames";
const get = require("lodash/get");

function RenderNotodoc(props) {
    // console.log("RenderNotodoc", props);

    const router = useRouter();

    const [showDrawer, setShowDrawer] = useState(false);

    const [homeUrl, setHomeUrl] = useState("/");

    useEffect(() => {
        let url = get(props, "drawerLinks[0].path", undefined);
        url = url || get(props, "drawerLinks[0].paths[0].path", undefined);

        if (url) {
            setHomeUrl(url);
        }

        return () => {};
    }, []);

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
        fullPage: false,
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

    console.log("router.pathname", router.asPath);

    const drawerBody = (
        <div>
            {props.drawerLinks.map((l) => {
                if ("path" in l) {
                    return (
                        <Link href={l.path}>
                            <a
                                onClick={() => setShowDrawer(false)}
                                className={cn(
                                    "nd-drawer-page-link",
                                    router.asPath === l.path && "active"
                                )}
                            >
                                {l.title}
                            </a>
                        </Link>
                    );
                }

                return (
                    <div>
                        <div className="nd-drawer-group-title">{l.title}</div>
                        <div>
                            {l.paths.map((e) => {
                                return (
                                    <>
                                        <Link href={e.path}>
                                            <a
                                                onClick={() =>
                                                    setShowDrawer(false)
                                                }
                                                className={cn(
                                                    "nd-drawer-page-link",
                                                    router.asPath === e.path &&
                                                        "active"
                                                )}
                                            >
                                                {e.title}
                                            </a>
                                        </Link>
                                    </>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    //auto forward to the FIRST page in the list of pages

    // scaffold
    return (
        <div className="notodoc nd-scaffold">
            <div className="nd-header">
                <div className="nd-header-left">
                    <button
                        onClick={() => setShowDrawer(true)}
                        className="nd-menu btn"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="nd-menu-icon"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                </div>
                <Link href={homeUrl}>
                    <a className="nd-logo-container">
                        {props.notodocPageIcon ? (
                            props.notodocPageIcon.includes("https://") ? (
                                <img
                                    src={props.notodocPageIcon}
                                    height="40px"
                                    className="nd-logo"
                                />
                            ) : (
                                <div>{props.notodocPageIcon}</div>
                            )
                        ) : null}
                        <div className="nd-logo-text">{props.notodocTitle}</div>
                    </a>
                </Link>
                <div className="nd-header-right"></div>
            </div>
            <div className="nd-main">
                {/* render inner page */}

                {showDrawer && (
                    <div className="nd-drawer-mobile">
                        <button
                            onClick={() => setShowDrawer(false)}
                            className="nd-close btn"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="nd-close-icon"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </button>

                        {drawerBody}
                    </div>
                )}

                <div className="nd-drawer">{drawerBody}</div>
                <div className="nd-content">
                    {props.formattedPath === "/" ? (
                        <div></div>
                    ) : (
                        <div>
                            <h1 className="nd-padding">{props.title}</h1>
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
                                                    <a
                                                        className={
                                                            props.className
                                                        }
                                                    >
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
                            <div
                                style={{
                                    height: 100,
                                }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RenderNotodoc;

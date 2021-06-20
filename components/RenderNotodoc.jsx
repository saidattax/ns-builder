import React from "react";
import { Collection, CollectionRow, NotionRenderer, Pdf } from "react-notion-x";
import { NotionId } from "../utils/string";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect } from "react";
import Head from "next/head";

function RenderNotodoc(props) {
    console.log("RenderNotodoc", props);

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

    //auto forward to the FIRST page in the list of pages

    // scaffold
    return (
        <div className="notodoc notodoc-scaffold">
            <div className="notodoc-header">
                <div className="notodoc-logo-container">
                    {props.notodocPageIcon ? (
                        props.notodocPageIcon.includes("https://") ? (
                            <img
                                src={props.notodocPageIcon}
                                height="40px"
                                className="notodoc-logo"
                            />
                        ) : (
                            <div>{props.notodocPageIcon}</div>
                        )
                    ) : null}
                    <div className="notodoc-logo-text">
                        {props.notodocTitle}
                    </div>
                </div>
            </div>
            <div className="notodoc-main">
                {/* render inner page */}
                <div className="notodoc-drawer">
                    <div>
                        {props.drawerLinks.map((link) => {
                            if ("path" in link) {
                                return (
                                    <a
                                        className="notodoc-drawer-page-link"
                                        href={link.path}
                                    >
                                        {link.title}
                                    </a>
                                );
                            }

                            return (
                                <div>
                                    <div className="notodoc-drawer-group-title">
                                        {link.title}
                                    </div>
                                    <div>
                                        {link.paths.map((e) => {
                                            return (
                                                <a
                                                    className="notodoc-drawer-page-link"
                                                    href={e.path}
                                                >
                                                    {e.title}
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="notodoc-content">
                    {props.formattedPath === "/" ? (
                        <div></div>
                    ) : (
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
        </div>
    );
}

export default RenderNotodoc;

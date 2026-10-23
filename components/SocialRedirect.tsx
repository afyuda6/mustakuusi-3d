"use client";

import {useEffect} from "react";
import {detectTiktokBrowser} from "@/utils";

export function SocialRedirect() {

    useEffect(() => {

        const {isTiktokBrowser} = detectTiktokBrowser();

        const params = new URLSearchParams(window.location.search);
        const src = params.get("src");

        if (src && !isTiktokBrowser) {
            window.location.replace("https://linktr.ee/mustakuusi");
        }

    }, []);

    return null;
}
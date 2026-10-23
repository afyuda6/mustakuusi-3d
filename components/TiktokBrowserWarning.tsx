"use client";

import {CSSProperties, useEffect} from "react";
import {usePathname} from "next/navigation";
import {detectTiktokBrowser} from "@/utils";

export function TiktokBrowserWarning() {
    const pathname = usePathname();

    const {isTiktokBrowser} = detectTiktokBrowser();

    useEffect(() => {
        if (!isTiktokBrowser) return;
    }, [isTiktokBrowser, pathname]);

    if (!isTiktokBrowser) return null;

    return (
        <div style={overlayStyle}>
            <div style={cardStyle}>
                <h2>
                    Anda membuka dari TikTok
                </h2>

                <p>
                    Untuk membuka Play Store dengan benar:
                </p>

                <ol style={{textAlign: "left"}}>
                    <li>
                        <>Tap ikon <b>⋯</b> di pojok kanan atas</>
                    </li>
                    <li>
                        <>Pilih <b>Buka di browser</b></>
                    </li>
                </ol>

                <p style={{marginTop: "10px"}}>
                    Anda akan diarahkan ke halaman pilih game.
                </p>
            </div>
        </div>
    );
}

const overlayStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    color: "white"
};

const cardStyle: CSSProperties = {
    background: "#111",
    padding: "30px",
    borderRadius: "12px",
    maxWidth: "340px",
    textAlign: "center"
};
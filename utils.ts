export function getImageUrl(path: string): string {
    const cleanPath = path.replace(/^\/+/, "");
    return `/assets/${cleanPath}`;
}

export function detectTiktokBrowser() {

    const ua =
        typeof navigator !== "undefined"
            ? navigator.userAgent
            : "";

    const isTiktokBrowser = /TikTok|TTWebView|musical_ly|ByteLocale|ByteFullLocale/i.test(ua);

    return {
        isTiktokBrowser
    };
}
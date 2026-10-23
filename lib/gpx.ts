import type {LatLng} from "./geo";

export interface ParsedGpx {
    points: LatLng[];
    name?: string;
}

export const parseGpx = (text: string): ParsedGpx => {
    if (typeof DOMParser === "undefined") {
        throw new Error("File GPX hanya bisa dibaca di browser");
    }

    const document = new DOMParser().parseFromString(text, "application/xml");

    if (document.getElementsByTagName("parsererror").length > 0) {
        throw new Error("File GPX tidak valid");
    }

    const elements = Array.from(document.getElementsByTagName("*"));
    const points: LatLng[] = [];

    elements.forEach((element) => {
        const tag = element.localName?.toLowerCase();

        if (tag !== "trkpt" && tag !== "rtept") return;

        const lat = Number(element.getAttribute("lat"));
        const lng = Number(element.getAttribute("lon"));

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const last = points[points.length - 1];

        if (last && last[0] === lat && last[1] === lng) return;

        points.push([lat, lng]);
    });

    if (points.length < 2) {
        throw new Error("File GPX tidak berisi titik rute yang cukup");
    }

    const nameNode = elements.find((element) => element.localName?.toLowerCase() === "name");
    const name = nameNode?.textContent?.trim();

    return {points, name: name || undefined};
};

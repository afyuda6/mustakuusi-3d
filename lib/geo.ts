export type LatLng = [number, number];

export interface SvgRoute {
    path: string;
    start: {x: number; y: number};
    end: {x: number; y: number};
}

const EARTH_RADIUS_KM = 6371;

const toRadian = (value: number) => (value * Math.PI) / 180;

export const decodePolyline = (encoded: string): LatLng[] => {
    const points: LatLng[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
        let shift = 0;
        let result = 0;
        let byte: number;

        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        lat += result & 1 ? ~(result >> 1) : result >> 1;

        shift = 0;
        result = 0;

        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        lng += result & 1 ? ~(result >> 1) : result >> 1;

        points.push([lat / 1e5, lng / 1e5]);
    }

    return points;
};

export const distanceKm = (points: LatLng[]): number => {
    let total = 0;

    for (let i = 1; i < points.length; i += 1) {
        const [lat1, lng1] = points[i - 1];
        const [lat2, lng2] = points[i];
        const dLat = toRadian(lat2 - lat1);
        const dLng = toRadian(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2
            + Math.cos(toRadian(lat1)) * Math.cos(toRadian(lat2)) * Math.sin(dLng / 2) ** 2;
        total += 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
    }

    return total;
};

export const projectToSvg = (
    points: LatLng[],
    width: number,
    height: number,
    padding = 14,
    maxPoints = 600,
): SvgRoute | null => {
    const valid = points.filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

    if (valid.length < 2) return null;

    const latitudes = valid.map(([lat]) => lat);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const middleLat = (minLat + maxLat) / 2;
    const lngScale = Math.cos(toRadian(middleLat));

    const xy = valid.map(([lat, lng]) => ({x: lng * lngScale, y: lat}));
    const xs = xy.map((point) => point.x);
    const ys = xy.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const spanX = Math.max(maxX - minX, 1e-9);
    const spanY = Math.max(maxY - minY, 1e-9);
    const innerWidth = Math.max(width - padding * 2, 1);
    const innerHeight = Math.max(height - padding * 2, 1);
    const scale = Math.min(innerWidth / spanX, innerHeight / spanY);

    const offsetX = padding + (innerWidth - spanX * scale) / 2;
    const offsetY = padding + (innerHeight - spanY * scale) / 2;

    const projected = xy.map((point) => ({
        x: offsetX + (point.x - minX) * scale,
        y: offsetY + (maxY - point.y) * scale,
    }));

    const stride = Math.max(1, Math.ceil(projected.length / maxPoints));
    const sampled = projected.filter((_, index) => index % stride === 0 || index === projected.length - 1);
    const path = sampled
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
        .join(" ");

    return {
        path,
        start: projected[0],
        end: projected[projected.length - 1],
    };
};

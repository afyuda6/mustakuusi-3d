import {NextResponse} from "next/server";
import {decodePolyline, distanceKm, type LatLng} from "@/lib/geo";

export const dynamic = "force-dynamic";

class RouteError extends Error {
    status: number;

    constructor(message: string, status = 400) {
        super(message);
        this.status = status;
    }
}

let tokenCache: {token: string; expiresAt: number} | null = null;

const getAccessToken = async (): Promise<string> => {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;
    const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new RouteError(
            "Integrasi Strava belum dikonfigurasi. Hubungi pemilik toko.",
            503,
        );
    }

    if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
        return tokenCache.token;
    }

    const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
        cache: "no-store",
    });

    if (!response.ok) {
        throw new RouteError("Gagal terhubung ke Strava. Coba lagi nanti.", 502);
    }

    const data = await response.json();
    const token = data?.access_token;
    const expiresAt = Number(data?.expires_at);

    if (typeof token !== "string" || !token) {
        throw new RouteError("Gagal mendapatkan token Strava.", 502);
    }

    tokenCache = {
        token,
        expiresAt: Number.isFinite(expiresAt) ? expiresAt * 1000 : Date.now() + 30 * 60 * 1000,
    };

    return token;
};

const parseStravaUrl = (input: string): {kind: "route" | "activity"; id: string} => {
    let url: URL;

    try {
        url = new URL(input);
    } catch {
        throw new RouteError("Link Strava tidak valid.");
    }

    const host = url.hostname.replace(/^www\./i, "").toLowerCase();

    if (host !== "strava.com") {
        throw new RouteError("Gunakan link dari strava.com.");
    }

    const route = url.pathname.match(/\/routes\/(\d+)/);

    if (route) return {kind: "route", id: route[1]};

    const activity = url.pathname.match(/\/activities\/(\d+)/);

    if (activity) return {kind: "activity", id: activity[1]};

    throw new RouteError("Link harus berupa rute atau aktivitas Strava.");
};

export async function GET(request: Request) {
    const input = new URL(request.url).searchParams.get("url")?.trim();

    if (!input) {
        return NextResponse.json({error: "Link Strava wajib diisi."}, {status: 400});
    }

    try {
        const target = parseStravaUrl(input);
        const token = await getAccessToken();
        const endpoint = target.kind === "route" ? "routes" : "activities";
        const response = await fetch(`https://www.strava.com/api/v3/${endpoint}/${target.id}`, {
            headers: {Authorization: `Bearer ${token}`},
            cache: "no-store",
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new RouteError("Rute tidak ditemukan atau bukan rute publik.", 404);
            }

            if (response.status === 401 || response.status === 403) {
                throw new RouteError("Tidak punya akses ke rute ini. Pastikan rutenya publik.", 403);
            }

            throw new RouteError("Gagal mengambil data dari Strava.", 502);
        }

        const data = await response.json();
        const encoded = data?.map?.polyline ?? data?.map?.summary_polyline ?? "";
        const points: LatLng[] = typeof encoded === "string" && encoded ? decodePolyline(encoded) : [];

        if (points.length < 2) {
            throw new RouteError("Strava tidak mengembalikan titik rute.", 404);
        }

        return NextResponse.json({
            name: typeof data?.name === "string" ? data.name : "",
            distanceKm: typeof data?.distance === "number" ? data.distance / 1000 : distanceKm(points),
            elevationGain: typeof data?.elevation_gain === "number" ? data.elevation_gain : null,
            activityType: typeof data?.type === "string" ? data.type : null,
            points,
        });
    } catch (error) {
        if (error instanceof RouteError) {
            return NextResponse.json({error: error.message}, {status: error.status});
        }

        return NextResponse.json({error: "Terjadi kesalahan saat mengambil rute."}, {status: 500});
    }
}

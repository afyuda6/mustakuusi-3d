"use client";

import {type ChangeEvent, CSSProperties, useMemo, useState} from "react";
import styles from "@/styles/ProductCustomizer.module.css";
import {distanceKm, projectToSvg, type LatLng} from "@/lib/geo";
import {parseGpx} from "@/lib/gpx";

type CustomizerType = "keychain" | "strava";

interface ProductCustomizerProps {
    type: CustomizerType;
    title: string;
    orderLink: string;
}

const KEYCHAIN_COLORS = [
    {label: "Hitam", value: "#222222"},
    {label: "Putih", value: "#f2f2f2"},
    {label: "Merah", value: "#d64545"},
    {label: "Biru", value: "#3b6fd4"},
    {label: "Hijau", value: "#3f9a63"},
    {label: "Kuning", value: "#e8c547"},
    {label: "Ungu", value: "#8a5bbf"},
    {label: "Oranye", value: "#e3823a"},
];

const ACTIVITY_TYPES = [
    {label: "Run", value: "Run"},
    {label: "Trail Run", value: "Trail Run"},
    {label: "Walk", value: "Walk"},
    {label: "Hike", value: "Hike"},
    {label: "Ride", value: "Ride"},
    {label: "Swim", value: "Swim"},
];

const KEYCHAIN_FONTS = [
    {label: "Dekko", value: "var(--font-dekko), cursive"},
    {label: "Chilanka", value: "var(--font-chilanka), cursive"},
    {label: "Roboto", value: "var(--font-roboto), sans-serif"},
    {label: "Serif", value: "Georgia, 'Times New Roman', serif"},
    {label: "Monospace", value: "'Courier New', monospace"},
];

const MONTHS = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

const getContrastColor = (hex: string) => {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.62 ? "#1b1b1b" : "#ffffff";
};

const formatDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day || !MONTHS[month - 1]) return "Pilih tanggal";
    return `${day} ${MONTHS[month - 1]} ${year}`;
};

export const ProductCustomizer = ({type, title, orderLink}: ProductCustomizerProps) => {
    const [name, setName] = useState("Nama Kamu");
    const [fontFamily, setFontFamily] = useState(KEYCHAIN_FONTS[1].value);
    const [color, setColor] = useState(KEYCHAIN_COLORS[0].value);

    const [activity, setActivity] = useState(ACTIVITY_TYPES[0].value);
    const [distance, setDistance] = useState("10.00 KM");
    const [elapsedTime, setElapsedTime] = useState("1h 0m");
    const [avgPace, setAvgPace] = useState("6:00 /KM");
    const [route, setRoute] = useState("Senayan Loop");

    const [routePoints, setRoutePoints] = useState<LatLng[] | null>(null);
    const [stravaUrl, setStravaUrl] = useState("");
    const [routeStatus, setRouteStatus] = useState<{
        tone: "idle" | "loading" | "error" | "success";
        message: string;
    }>({tone: "idle", message: ""});

    const applyRoute = (points: LatLng[], name?: string, distance?: number) => {
        setRoutePoints(points);

        if (name?.trim()) setRoute(name.trim());
        if (typeof distance === "number" && Number.isFinite(distance) && distance > 0) {
            setDistance(`${distance.toFixed(1)} KM`);
        }
    };

    const handleStravaImport = async () => {
        const value = stravaUrl.trim();

        if (!value) {
            setRouteStatus({tone: "error", message: "Tempel link Strava dulu."});
            return;
        }

        setRouteStatus({tone: "loading", message: "Mengambil rute dari Strava..."});

        try {
            const response = await fetch(`/api/strava-route?url=${encodeURIComponent(value)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error ?? "Gagal mengambil rute.");
            }

            applyRoute(data.points, data.name, data.distanceKm);
            setRouteStatus({tone: "success", message: "Rute berhasil dimuat."});
        } catch (error) {
            setRouteStatus({
                tone: "error",
                message: error instanceof Error ? error.message : "Gagal mengambil rute.",
            });
        }
    };

    const handleGpxUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        try {
            const parsed = parseGpx(await file.text());
            applyRoute(parsed.points, parsed.name, distanceKm(parsed.points));
            setRouteStatus({tone: "success", message: `Rute dari ${file.name} berhasil dimuat.`});
        } catch (error) {
            setRouteStatus({
                tone: "error",
                message: error instanceof Error ? error.message : "Gagal membaca file GPX.",
            });
        }
    };

    const previewRoute = useMemo(
        () => (routePoints ? projectToSvg(routePoints, 320, 150) : null),
        [routePoints],
    );

    const selectedColor = KEYCHAIN_COLORS.find((item) => item.value === color) ?? KEYCHAIN_COLORS[0];
    const selectedFont = KEYCHAIN_FONTS.find((item) => item.value === fontFamily) ?? KEYCHAIN_FONTS[0];
    const textColor = getContrastColor(color);

    const detailLines = type === "keychain"
        ? [
            `Nama: ${name.trim() || "-"}`,
            `Font: ${selectedFont.label}`,
            `Warna: ${selectedColor.label}`,
        ]
        : [
            `Tipe: ${activity}`,
            `Rute: ${route.trim() || "-"}`,
            ...(stravaUrl.trim() ? [`Link Strava: ${stravaUrl.trim()}`] : []),
            `Distance: ${distance.trim() || "-"}`,
            `Pace: ${avgPace.trim() || "-"}`,
            `Time: ${elapsedTime.trim() || "-"}`,
        ];

    const orderHref = (() => {
        const base = orderLink.split("?")[0];
        const message = `Halo mustakuusi3D, saya ingin pesan ${title}.\n\nDetail kustom:\n${detailLines.join("\n")}`;
        return `${base}?text=${encodeURIComponent(message)}`;
    })();

    const previewStyle = {
        "--keychain-color": color,
        "--keychain-text": textColor,
        "--keychain-font": fontFamily,
    } as CSSProperties;

    return (
        <section className={styles.container} id="customizer">
            <h2 className={styles.label}>KUSTOMISASI PRODUK</h2>

            <div className={styles.layout}>
                <div className={styles.previewPane}>
                    {type === "keychain" ? (
                        <div className={styles.keychainStage} style={previewStyle}>
                            <div className={styles.keychainAssembly}>
                                <div className={styles.keychainRing}/>
                                <div className={styles.keychainTag}>
                                    <span className={styles.keychainName}>
                                        {name.trim() || "Nama Kamu"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`${styles.stravaPlaque} stravaPreview`}>
                            <div className={styles.stravaTop}>
                                <span className={styles.stravaBrand}>STRAVA</span>
                                <span className={styles.stravaType}>{activity}</span>
                            </div>

                            <svg className={styles.stravaMap} viewBox="0 0 320 150" aria-hidden="true">
                                {previewRoute ? (
                                    <>
                                        <path
                                            d={previewRoute.path}
                                            fill="none"
                                            stroke="#fc4c02"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <circle
                                            cx={previewRoute.start.x}
                                            cy={previewRoute.start.y}
                                            r="7"
                                            fill="#ffffff"
                                            stroke="#fc4c02"
                                            strokeWidth="3"
                                        />
                                        <circle
                                            cx={previewRoute.end.x}
                                            cy={previewRoute.end.y}
                                            r="7"
                                            fill="#fc4c02"
                                            stroke="#ffffff"
                                            strokeWidth="3"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <path
                                            d="M 20 118 C 46 58 86 112 108 72 S 166 28 188 72 S 250 104 292 48"
                                            fill="none"
                                            stroke="#fc4c02"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <circle cx="20" cy="118" r="7" fill="#ffffff" stroke="#fc4c02" strokeWidth="3"/>
                                        <circle cx="292" cy="48" r="7" fill="#fc4c02" stroke="#ffffff" strokeWidth="3"/>
                                    </>
                                )}
                            </svg>

                            <span className={styles.stravaRoute}>{route.trim() || "Nama rute"}</span>
                            <div className={styles.stravaStats}>
                                <div className={styles.stravaStatItem}>
                                    <span className={styles.stravaStatLabel}>DISTANCE</span>
                                    <span className={styles.stravaStatValue}>{distance.trim() || "-"}</span>
                                </div>
                                <div className={styles.stravaStatItem}>
                                    <span className={styles.stravaStatLabel}>PACE</span>
                                    <span className={styles.stravaStatValue}>{avgPace.trim() || "-"}</span>
                                </div>
                                <div className={styles.stravaStatItem}>
                                    <span className={styles.stravaStatLabel}>TIME</span>
                                    <span className={styles.stravaStatValue}>{elapsedTime.trim() || "-"}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.form}>
                    {type === "keychain" ? (
                        <>
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Nama pada gantungan</span>
                                <input
                                    className={styles.textInput}
                                    type="text"
                                    value={name}
                                    maxLength={18}
                                    placeholder="Contoh: Budi"
                                    onChange={(event) => setName(event.target.value)}
                                />
                            </label>

                            <div className={styles.field}>
                                <span className={styles.fieldLabel}>Font</span>
                                <div className={styles.fontGrid}>
                                    {KEYCHAIN_FONTS.map((font) => (
                                        <button
                                            key={font.label}
                                            type="button"
                                            className={`${styles.fontBtn} ${fontFamily === font.value ? styles.fontBtnActive : ""}`}
                                            style={{fontFamily: font.value}}
                                            aria-pressed={fontFamily === font.value}
                                            onClick={() => setFontFamily(font.value)}
                                        >
                                            {font.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.field}>
                                <span className={styles.fieldLabel}>Warna filament</span>
                                <div className={styles.swatchGrid}>
                                    {KEYCHAIN_COLORS.map((item) => (
                                        <button
                                            key={item.value}
                                            type="button"
                                            className={`${styles.swatch} ${color === item.value ? styles.swatchActive : ""}`}
                                            aria-pressed={color === item.value}
                                            aria-label={item.label}
                                            onClick={() => setColor(item.value)}
                                        >
                                            <span className={styles.swatchDot} style={{background: item.value}}/>
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.field}>
                                <span className={styles.fieldLabel}>Tipe aktivitas</span>
                                <div className={styles.swatchGrid}>
                                    {ACTIVITY_TYPES.map((item) => (
                                        <button
                                            key={item.value}
                                            type="button"
                                            className={`${styles.swatch} ${activity === item.value ? styles.swatchActive : ""}`}
                                            aria-pressed={activity === item.value}
                                            onClick={() => setActivity(item.value)}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.field}>
                                <span className={styles.fieldLabel}>Gambar rute</span>
                                <p className={styles.hint}>
                                    Kirim screenshot/gambar rute Strava kamu langsung via WhatsApp saat pesan.
                                </p>
                            </div>

                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Nama rute</span>
                                <input
                                    className={styles.textInput}
                                    type="text"
                                    value={route}
                                    maxLength={28}
                                    placeholder="Contoh: Senayan Loop"
                                    onChange={(event) => setRoute(event.target.value)}
                                />
                            </label>

                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Distance</span>
                                <input
                                    className={styles.textInput}
                                    type="text"
                                    value={distance}
                                    maxLength={12}
                                    placeholder="Contoh: 10.0 KM"
                                    onChange={(event) => setDistance(event.target.value)}
                                />
                            </label>

                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Pace</span>
                                <input
                                    className={styles.textInput}
                                    type="text"
                                    value={avgPace}
                                    maxLength={12}
                                    placeholder={"Contoh: 6:00 /KM"}
                                    onChange={(event) => setAvgPace(event.target.value)}
                                />
                            </label>

                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Time</span>
                                <input
                                    className={styles.textInput}
                                    type="text"
                                    value={elapsedTime}
                                    maxLength={12}
                                    placeholder="Contoh: 1h 0m"
                                    onChange={(event) => setElapsedTime(event.target.value)}
                                />
                            </label>
                        </>
                    )}

                    <a
                        className={styles.orderBtn}
                        href={orderHref}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Pesan via WhatsApp
                    </a>
                    <p className={styles.hint}>
                        Detail kustomisasi akan otomatis terlampir pada pesan WhatsApp.
                    </p>
                </div>
            </div>
        </section>
    );
};

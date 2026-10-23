"use client";

import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import {useInView} from "@/hooks/useInView";
import {getImageUrl} from "@/utils";
import styles from "@/styles/Hero.module.css";
import localProducts from "@/public/data/products.json";

interface StatItem {
    value: number;
    label: string;
}

interface ProductData {
    id: string;
    date: string;
}

interface HeroProps {
    title: string;
    description: string;
    orderLink?: string;
    ctaLabel?: string;
    imageUrl: string;
    date?: string;
    stats?: StatItem[];
}

export const Hero = ({
                         title,
                         description,
                         orderLink,
                         ctaLabel,
                         imageUrl,
                         date,
                         stats,
                     }: HeroProps) => {
    const {ref, isVisible} = useInView<HTMLDivElement>(0.06);
    const pathname = usePathname();

    const isHomePage = pathname === "/";
    const isProductPage = !isHomePage;

    const [countdown, setCountdown] = useState("");

    const now = Date.now();

    const dynamicStats: StatItem[] = [
        {
            value: (localProducts as ProductData[]).filter(g => new Date(g.date).getTime() <= now).length,
            label: "Produk",
        },
    ];

    useEffect(() => {
        if (date) {
            const updateCountdown = () => {
                const now = new Date();
                const release = new Date(date);

                const diffMs = release.getTime() - now.getTime();
                if (diffMs <= 0) {
                    setCountdown("");
                    return;
                }

                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const releaseDay = new Date(release.getFullYear(), release.getMonth(), release.getDate());
                const dayDiff = Math.round((releaseDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                const timeStr = `${release.getHours().toString().padStart(2, '0')}:${release.getMinutes().toString().padStart(2, '0')}`;

                if (dayDiff === 0) {
                    setCountdown(
                        `Hari ini ${timeStr} WIB`
                    );
                } else if (dayDiff === 1) {
                    setCountdown(
                        `Besok ${timeStr} WIB`
                    );
                } else {
                    setCountdown(
                        `${dayDiff} hari lagi`
                    );
                }
            };

            updateCountdown();
            const timer = setInterval(updateCountdown, 1000 * 60 * 60);
            return () => clearInterval(timer);
        }
    }, [date]);

    const desc = description;

    const googleBadge = "googlebadge-id.png";

    const resolvedTitle = title;

    const resolvedStats = isHomePage ? dynamicStats : stats;

    return (
        <section ref={ref} className={`${styles.container} ${styles.fadeUp} ${isVisible ? styles.visible : ""}`}>
            <div className={styles.content}>
                <h1 className={styles.title}>{resolvedTitle}</h1>
                <p className={styles.description}
                   dangerouslySetInnerHTML={{__html: desc}}></p>

                {resolvedStats && resolvedStats.length > 0 && (
                    <div className={styles.stats}>
                        {resolvedStats.map((stat, index) => (
                            <div key={index} className={styles.statItem}>
                                <span className={styles.statValue}>{stat.value}</span>
                                <span className={styles.statLabel}>
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {isHomePage && (
                    <div className={styles.homeButtons}>
                        <a href="#products" className={styles.productBtn} onClick={() => {
                            setTimeout(() => {
                                history.replaceState(null, '', window.location.pathname);
                            }, 200);
                        }}>Cari Produk</a>
                    </div>
                )}

                {isProductPage && (
                    <div className={styles.buttonGroup}>
                        {orderLink && ctaLabel && (
                            <a
                                href={orderLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.productBtn}
                            >
                                {ctaLabel}
                            </a>
                        )}
                        {orderLink && !ctaLabel && (
                            <a href={orderLink} target="_blank" rel="noopener">
                                <img
                                    src={getImageUrl(googleBadge)}
                                    alt="Pesan sekarang"
                                    className={styles.homeBadge}
                                    loading="lazy"
                                />
                            </a>
                        )}
                        {!orderLink && (
                            <span className={styles.unavailable}>
                                Produk sudah tidak tersedia.
                            </span>
                        )}
                    </div>
                )}
            </div>

            <img
                src={getImageUrl(`${imageUrl}`)}
                alt="hero"
                className={styles.heroImg}
                loading="lazy"
            />
        </section>
    );
};
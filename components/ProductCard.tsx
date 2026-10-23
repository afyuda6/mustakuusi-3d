"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useInView} from "@/hooks/useInView";
import {getImageUrl} from "@/utils";
import styles from "@/styles/ProductCard.module.css";

interface ProductProps {
    title: string;
    imageSrc: string;
    date: string;
    description: string;
    categories: string[];
    detail: string;
    orderLink: string;
    ctaLabel?: string;
}

interface ProductCardProps {
    product: ProductProps;
    searchKeyword?: string;
    animateOnMount?: boolean;
    onCategoryClick?: (category: string) => void;
    activeCategories?: string[];
}

export const ProductCard = ({
                             product: {title, imageSrc, date, categories, detail, orderLink, ctaLabel},
                             searchKeyword = "",
                             animateOnMount = true,
                             onCategoryClick,
                             activeCategories = [],
                         }: ProductCardProps) => {
    const {ref, isVisible} = useInView<HTMLDivElement>(0.06);
    const [countdown, setCountdown] = useState("");

    const currentCategories = categories;

    const resolvedTitle = title;
    const normalizedTitle = resolvedTitle.toLowerCase();
    const normalizedSearch = searchKeyword.toLowerCase();

    const matchingCategories = currentCategories.filter((category) =>
        category.toLowerCase().includes(normalizedSearch)
    );

    const hasDirectMatch =
        !!normalizedSearch &&
        (normalizedTitle.includes(normalizedSearch) ||
            matchingCategories.length > 0);

    useEffect(() => {
        if (!date) return;

        const updateCountdown = () => {
            const now = new Date();
            const release = new Date(date);

            const diffMs = release.getTime() - now.getTime();
            if (diffMs <= 0) {
                setCountdown("");
                return;
            }

            const today = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );
            const releaseDay = new Date(
                release.getFullYear(),
                release.getMonth(),
                release.getDate()
            );

            const dayDiff = Math.round(
                (releaseDay.getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            const timeStr = `${release
                .getHours()
                .toString()
                .padStart(2, "0")}:${release
                .getMinutes()
                .toString()
                .padStart(2, "0")}`;

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
    }, [date]);

    const containerClassName = animateOnMount
        ? `${styles.container} ${styles.fadeUp} ${isVisible ? styles.visible : ""}`
        : styles.container;

    const detailHref = detail;

    const googleBadge = "googlebadge-id.png";

    return (
        <div ref={ref} className={containerClassName}>
            <div className={`${styles.card} ${hasDirectMatch ? styles.cardMatched : ""}`}>
                <img src={getImageUrl(imageSrc)} alt={`Image of ${resolvedTitle}`} className={styles.image}
                     loading="lazy"/>

                <h3 className={styles.title}>
                    <Link
                        href={detailHref}
                        onClick={() => {
                            const html = document.documentElement;
                            html.style.scrollBehavior = "auto";

                            requestAnimationFrame(() => {
                                window.scrollTo(0, 0);

                                requestAnimationFrame(() => {
                                    html.style.scrollBehavior = "smooth";
                                });
                            });
                        }}
                    >
                        {resolvedTitle}
                    </Link>
                </h3>
                <ul className={styles.categories}>
                    {currentCategories.map((category, id) => (
                        <li
                            key={id}
                            className={`${styles.category} ${onCategoryClick ? styles.categoryClickable : ""} ${
                                activeCategories.includes(category) ? styles.categoryActive : ""
                            }`}
                            onClick={() => onCategoryClick?.(category)}
                        >
                            {category}
                        </li>
                    ))}
                </ul>

                <div className={styles.links}>
                    {countdown && <h2 className={styles.badge}>{countdown}</h2>}

                    {!countdown && orderLink && ctaLabel && (
                        <a
                            href={orderLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.ctaBtn}
                        >
                            {ctaLabel}
                        </a>
                    )}

                    {!countdown && orderLink && !ctaLabel && (
                        <a href={orderLink} target="_blank" rel="noopener">
                            <img
                                src={getImageUrl(googleBadge)}
                                alt="Pesan sekarang"
                                className={styles.badge}
                                loading="lazy"
                            />
                        </a>
                    )}

                    {!countdown && !orderLink && (
                        <span className={styles.link}>
                            Produk sudah tidak tersedia.
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
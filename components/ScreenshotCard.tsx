"use client";

import {useInView} from "@/hooks/useInView";
import styles from "@/styles/ScreenshotCard.module.css";
import {getImageUrl} from "@/utils";

interface ScreenshotCardProps {
    title: string;
    imageSrc: string;
}

export const ScreenshotCard = ({title, imageSrc}: ScreenshotCardProps) => {
    const {ref, isVisible} = useInView(0.06);

    return (
        <div ref={ref} className={`${styles.container} ${styles.fadeUp} ${isVisible ? styles.visible : ""}`}>
            <img src={getImageUrl(imageSrc)} alt={title} className={styles.image} loading="lazy"/>
        </div>
    );
};
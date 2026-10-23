"use client";

import {ScreenshotCard} from "./ScreenshotCard";
import styles from "@/styles/Screenshots.module.css";

interface ScreenshotsProps {
    screenshots: string[];
    title: string;
}

export const Screenshots = ({screenshots, title}: ScreenshotsProps) => {
    return (
        <section className={styles.container} id="screenshots">
            <h2 className={styles.screenshotsLabel}>{title}</h2>
            <div className={styles.screenshots}>
                {screenshots.map((src, id) => (
                    <ScreenshotCard key={id} imageSrc={src} title={title}/>
                ))}
            </div>
        </section>
    );
};
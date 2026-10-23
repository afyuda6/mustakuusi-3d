"use client";

import {useInView} from "@/hooks/useInView";
import styles from "@/styles/About.module.css";

interface AboutProps {
    itemDescription: string;
    title: string;
}

export const About = ({itemDescription, title}: AboutProps) => {
    const {ref, isVisible} = useInView(0.06);

    return (
        <section ref={ref} className={`${styles.container} ${styles.fadeUp} ${isVisible ? styles.visible : ""}`}
                 id="about">
            <div className={styles.content}>
                <h2 className={styles.aboutLabel}>{title}</h2>
                <ul className={styles.aboutItems}>
                    <li className={styles.aboutItem}>
                        <div className={styles.aboutItemText}>
                            <p>{itemDescription}</p>
                        </div>
                    </li>
                </ul>
            </div>
        </section>
    );
};
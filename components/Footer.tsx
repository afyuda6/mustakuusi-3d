"use client";

import styles from "@/styles/Footer.module.css";

export const Footer = () => {
    return (
        <div className={styles.container}>
            <p className={styles.text}>
                Dibangun dengan Next.js:<br/>
                mustakuusi3D — lahir dari tubuh yang tak duduk.
            </p>
        </div>
    );
};
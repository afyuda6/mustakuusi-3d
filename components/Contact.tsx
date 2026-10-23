"use client";

import styles from "@/styles/Contact.module.css";

import {MdEmail} from "react-icons/md";
import {SiWhatsapp} from "react-icons/si";

const contacts = [
    {
        label: "Email",
        href: "mailto:mustakuusi6@gmail.com",
        icon: <MdEmail size={20}/>
    },
    {
        label: "WhatsApp",
        href: "https://wa.me/6285801582436",
        icon: <SiWhatsapp size={20}/>,
    },
];

export const Contact = ({title}: { title: string }) => {
    return (
        <footer className={styles.container} id="contact">
            <h2 className={styles.contactLabel}>{title}</h2>
            <ul className={styles.grid}>
                {contacts.map((c) => (
                    <li key={c.label}>
                        <a
                            href={c.href}
                            className={styles.card}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className={styles.iconWrap}>
                                {c.icon}
                            </div>
                            <span className={styles.label}>{c.label}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </footer>
    );
};
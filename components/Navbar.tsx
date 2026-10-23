"use client";

import Link from "next/link";
import {useEffect, useRef, useState} from "react";
import {usePathname} from "next/navigation";
import styles from "@/styles/Navbar.module.css";

export const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();
    const navbarRef = useRef<HTMLElement>(null);

    const isHomePage = pathname === "/";
    const isProductPage = !isHomePage;

    const homeHref = "/";

    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (
                menuOpen &&
                navbarRef.current &&
                !navbarRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [menuOpen]);

    const handleAnchorClick = () => {
        setTimeout(() => {
            history.replaceState(null, "", window.location.pathname);
        }, 200);
    };

    return (
        <nav className={styles.navbar} ref={navbarRef}>
            <div className={styles.titleGroup}>
                <Link
                    href={homeHref}
                    className={styles.title}
                    onClick={() => {
                        const html = document.documentElement;

                        html.style.scrollBehavior = "auto";
                        window.scrollTo(0, 0);

                        setTimeout(() => {
                            html.style.scrollBehavior = "smooth";
                        }, 50);
                    }}
                >mustakuusi3D</Link>
            </div>

            <div className={styles.menu}>
                <div
                    className={`${styles.burger} ${menuOpen ? styles.open : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <ul className={`${styles.menuItems} ${menuOpen && styles.menuOpen}`} onClick={() => setMenuOpen(false)}>
                    {(isHomePage || isProductPage) && (
                        <li>
                            <a href="#about" onClick={handleAnchorClick}>
                                Tentang
                            </a>
                        </li>
                    )}

                    {(isHomePage) && (
                        <li>
                            <a href="#products" onClick={handleAnchorClick}>
                                Produk
                            </a>
                        </li>
                    )}

                    {isProductPage && (
                        <li>
                            <a href="#customizer" onClick={handleAnchorClick}>
                                Kustomisasi
                            </a>
                        </li>
                    )}

                    {isProductPage && (
                        <li>
                            <a href="#screenshots" onClick={handleAnchorClick}>
                                Cuplikan
                            </a>
                        </li>
                    )}

                    {isHomePage && (
                        <li>
                            <a href="#faq" onClick={handleAnchorClick}>
                                Pertanyaan
                            </a>
                        </li>
                    )}

                    <li>
                        <a href="#contact" onClick={handleAnchorClick}>
                            Kontak
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    );
};
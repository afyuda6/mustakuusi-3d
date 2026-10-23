"use client";

import {useState} from "react";
import {useInView} from "@/hooks/useInView";
import styles from "@/styles/FAQ.module.css";
import localFaq from "@/public/data/faq.json";

interface FAQProps {
    title: string;
}

interface FAQItem {
    question: string;
    answer: string;
}

export const FAQ = ({title}: FAQProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const {ref, isVisible} = useInView(0.06);

    const toggle = (index: number) => {
        setOpenIndex(prev => (prev === index ? null : index));
    };

    return (
        <section
            ref={ref}
            className={`${styles.container} ${styles.fadeUp} ${isVisible ? styles.visible : ""}`}
            id="faq"
        >
            <div className={styles.content}>
                <h2 className={styles.faqLabel}>{title}</h2>
                <ul className={styles.faqItems}>
                    {(localFaq as FAQItem[]).map((item, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <li
                                key={index}
                                className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}
                            >
                                <button
                                    type="button"
                                    className={styles.faqQuestion}
                                    onClick={() => toggle(index)}
                                    aria-expanded={isOpen}
                                >
                                    <span>{item.question}</span>
                                    <span className={styles.faqIcon} aria-hidden="true">
                                        {isOpen ? "−" : "+"}
                                    </span>
                                </button>
                                <div
                                    className={`${styles.faqAnswerWrapper} ${isOpen ? styles.faqAnswerWrapperOpen : ""}`}
                                    aria-hidden={!isOpen}
                                >
                                    <p className={styles.faqAnswer}>
                                        <span className={styles.faqAnswerInner}>
                                            {item.answer
                                                .split(/(mailto:[^\s]+)/g)
                                                .map((part, i) =>
                                                    part.startsWith(
                                                        "mailto:"
                                                    ) ? (
                                                        <a
                                                            key={i}
                                                            href={part}
                                                            className={
                                                                styles.emailLink
                                                            }
                                                        >
                                                            {part.replace(
                                                                "mailto:",
                                                                ""
                                                            )}
                                                        </a>
                                                    ) : (
                                                        part
                                                    )
                                                )}
                                        </span>
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
};
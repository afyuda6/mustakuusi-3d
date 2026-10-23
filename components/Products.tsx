"use client";

import {ChangeEvent, startTransition, useCallback, useDeferredValue, useState} from "react";
import {ProductCard} from "./ProductCard";
import {useInfiniteCarousel} from "@/hooks/useInfiniteCarousel";
import styles from "@/styles/Products.module.css";
import rawCategoryTree from "@/public/data/categories.json";

interface CategoryLabel {
    id: string;
    en: string;
}

interface CategoryNode {
    value: string;
    label: CategoryLabel;
    children: CategoryNode[];
}

interface ProductProps {
    id: string;
    title: string;
    imageSrc: string;
    date: string;
    description: string;
    categories: string[];
    detail: string;
    orderLink: string;
    ctaLabel?: string;
}

interface ProductsSectionProps {
    products: ProductProps[];
    allProducts?: ProductProps[];
    productSearch: string;
    isUpcoming?: boolean;
    sectionId?: string;
}

const categoryTree = rawCategoryTree as CategoryNode[];

const getCategoryLabel = (value: string): string | null => {
    for (const parent of categoryTree) {
        if (parent.value === value) return parent.label.id;
        const child = parent.children.find(c => c.value === value);
        if (child) return child.label.id;
    }
    return null;
};

export const Products = ({products, allProducts, productSearch, isUpcoming, sectionId}: ProductsSectionProps) => {
    const now = Date.now();

    const categorySource = (allProducts ?? products).filter(product => {
        const releaseTime = new Date(product.date).getTime();
        return isUpcoming ? releaseTime > now : releaseTime <= now;
    });

    const availableCategoryTree = categoryTree
        .map(parent => ({
            ...parent,
            children: parent.children.filter(child => {
                const childLabel = getCategoryLabel(child.value);
                return categorySource.some(product => {
                    const cats = product.categories;
                    return cats.includes(childLabel ?? "");
                });
            })
        }))
        .filter(parent => {
            const parentLabel = getCategoryLabel(parent.value);
            return categorySource.some(product => {
                const cats = product.categories;
                return cats.includes(parentLabel ?? "");
            });
        });

    const [searchKeyword, setSearchKeyword] = useState("");
    const [activeParent, setActiveParent] = useState("all");
    const [activeChild, setActiveChild] = useState<string | null>(null);

    const deferredKeyword = useDeferredValue(searchKeyword);
    const normalizedKeyword = deferredKeyword.trim().toLowerCase();

    const isSearching = normalizedKeyword.length > 0;
    const isFilteringCategory = activeParent !== "all" || activeChild !== null;

    const filteredProducts = products.filter((product) => {
        const releaseTime = new Date(product.date).getTime();
        const matchesRelease = isUpcoming ? releaseTime > now : releaseTime <= now;
        if (!matchesRelease) return false;

        const currentCategories = product.categories;

        const matchesCategory = (() => {
            if (activeParent === "all") return true;

            const parentLabel = getCategoryLabel(activeParent);
            if (!parentLabel) return true;
            if (!currentCategories.includes(parentLabel)) return false;
            if (!activeChild) return true;

            const childLabel = getCategoryLabel(activeChild);
            if (!childLabel) return true;
            return currentCategories.includes(childLabel);
        })();

        if (!normalizedKeyword) return matchesCategory;

        const combinedText = [
            product.title,
            product.description,
            ...currentCategories
        ]
            .join(" ")
            .toLowerCase();

        const keywords = normalizedKeyword.split(/\s+/);
        const matchesSearch = keywords.every((word) => combinedText.includes(word));

        return matchesCategory && matchesSearch;
    })
        .sort((a, b) => {
            const aTime = new Date(a.date).getTime();
            const bTime = new Date(b.date).getTime();
            return isUpcoming ? aTime - bTime : bTime - aTime;
        });

    const total = filteredProducts.length;

    const {
        trackRef,
        renderItems,
        activeRenderIndex,
        activeIndex,
        isSingle,
        goTo,
        next,
        prev,
        pause,
        resume,
    } = useInfiniteCarousel({
        items: filteredProducts,
        getId: (g) => g.id,
        slideClassName: styles.carouselSlide,
        resetKey: `${normalizedKeyword}|${activeParent}|${activeChild}`,
    });

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        startTransition(() => setSearchKeyword(event.target.value));
    };

    const handleParentChange = (value: string) => {
        startTransition(() => {
            setActiveParent((prev) => (prev === value ? "all" : value));
            setActiveChild(null);
        });
    };

    const handleChildChange = (value: string) => {
        startTransition(() => {
            setActiveChild((prev) => (prev === value ? null : value));
        });
    };

    const activeTree = availableCategoryTree.find((c) => c.value === activeParent);

    const handleCategoryClickFromCard = useCallback((categoryLabel: string) => {
        for (const parent of categoryTree) {
            const parentLabel = parent.label.id;
            if (parentLabel === categoryLabel) {
                startTransition(() => {
                    setActiveParent((prev) => prev === parent.value ? "all" : parent.value);
                    setActiveChild(null);
                });
                return;
            }
            const child = parent.children.find(c =>
                c.label.id === categoryLabel
            );
            if (child) {
                startTransition(() => {
                    setActiveParent(parent.value);
                    setActiveChild((prev) => prev === child.value ? null : child.value);
                });
                return;
            }
        }
    }, []);

    const activeCategories = (() => {
        const result: string[] = [];
        if (activeParent !== "all") {
            const parentLabel = getCategoryLabel(activeParent);
            if (parentLabel) result.push(parentLabel);
        }
        if (activeChild) {
            const childLabel = getCategoryLabel(activeChild);
            if (childLabel) result.push(childLabel);
        }
        return result;
    })();

    return (
        <section className={`${styles.container} ${total === 0 ? styles.containerEmpty : ""}`}
                 id={sectionId ?? "products"}>
            <div className={styles.searchRow}>
                <label
                    className={styles.searchLabel}
                    htmlFor={!isUpcoming ? "products-search" : undefined}
                >
                    {productSearch}
                </label>

                {!isUpcoming && (
                    <input
                        id="products-search"
                        type="search"
                        value={searchKeyword}
                        onChange={handleSearchChange}
                        placeholder="Ketik judul, kategori, atau kata kunci..."
                        className={styles.searchInput}
                    />
                )}
            </div>

            <div className={styles.categoryFilter}>
                {availableCategoryTree.map(({value}) => (
                    <button
                        key={value}
                        className={`${styles.categoryBtn} ${
                            activeParent === value ? styles.categoryBtnActive : ""
                        }`}
                        onClick={() => handleParentChange(value)}
                    >
                        {getCategoryLabel(value)}
                    </button>
                ))}
            </div>

            {activeTree && activeTree.children.length > 0 && (
                <div className={styles.subCategoryFilter}>
                    {activeTree.children.map((child) => (
                        <button
                            key={child.value}
                            className={`${styles.categoryBtn} ${styles.categoryBtnSub} ${
                                activeChild === child.value ? styles.categoryBtnActive : ""
                            }`}
                            onClick={() => handleChildChange(child.value)}
                        >
                            {getCategoryLabel(child.value)}
                        </button>
                    ))}
                </div>
            )}

            {(isSearching || isFilteringCategory) && (
                <p className={styles.productCount}>
                    {`Menampilkan ${total} product`}
                </p>
            )}

            {total > 0 ? (
                <div
                    className={styles.carouselWrapper}
                    onMouseEnter={pause}
                    onMouseLeave={resume}
                    onPointerDown={pause}
                    onPointerUp={resume}
                    onFocusCapture={pause}
                    onBlurCapture={resume}
                >
                    <button
                        className={`${styles.navBtn} ${styles.btnPrev}`}
                        onClick={prev}
                        disabled={isSingle}
                    >
                        &#8249;
                    </button>

                    <div className={styles.carouselViewport}>
                        <div
                            className={`${styles.carouselTrack} ${isSingle ? styles.carouselTrackSingle : ""}`}
                            ref={trackRef}
                        >
                            {!isSingle && (
                                <div className={styles.carouselSpacerSlide} data-spacer="true" aria-hidden="true">
                                    <div>
                                        <span></span>
                                    </div>
                                </div>
                            )}

                            {renderItems.map(({item, key, renderIndex}) => (
                                <div
                                    key={key}
                                    className={`${styles.carouselSlide} ${
                                        renderIndex === activeRenderIndex ? styles.slideActive : ""
                                    }`}
                                >
                                    <ProductCard
                                        product={item}
                                        searchKeyword={normalizedKeyword}
                                        onCategoryClick={handleCategoryClickFromCard}
                                        activeCategories={activeCategories}
                                    />
                                </div>
                            ))}

                            {!isSingle && (
                                <div className={styles.carouselSpacerSlide} data-spacer="true" aria-hidden="true">
                                    <div>
                                        <span></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        className={`${styles.navBtn} ${styles.btnNext}`}
                        onClick={next}
                        disabled={isSingle}
                    >
                        &#8250;
                    </button>

                    {!isSingle && (
                        <div className={styles.dots}>
                            {filteredProducts.map((_, i) => (
                                <button
                                    key={i}
                                    className={`${styles.dot} ${
                                        i === activeIndex ? styles.dotActive : ""
                                    }`}
                                    onClick={() => goTo(i)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <p className={styles.emptyState}>
                    {isSearching
                        ? `Tidak ada produk yang cocok dengan "${searchKeyword.trim()}".`
                        : isFilteringCategory
                            ? "Tidak ada produk dalam kategori ini."
                            : "Belum ada produk."}
                </p>
            )}
        </section>
    );
};
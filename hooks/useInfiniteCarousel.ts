"use client";

import {useCallback, useEffect, useRef, useState} from "react";

interface UseInfiniteCarouselOptions<T> {
    items: T[];
    getId: (item: T) => string;
    slideClassName: string;
    resetKey?: string | number;
    autoPlayInterval?: number;
}

export interface CarouselRenderItem<T> {
    item: T;
    key: string;
    renderIndex: number;
}

export const useInfiniteCarousel = <T,>({
    items,
    getId,
    slideClassName,
    resetKey = "",
    autoPlayInterval = 1800,
}: UseInfiniteCarouselOptions<T>) => {
    const realCount = items.length;
    const isSingle = realCount <= 1;

    const trackRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pausedRef = useRef(false);
    const visibleRef = useRef(false);

    const [activeIndex, setActiveIndex] = useState(0);

    const resetKeyStr = `${resetKey}|${realCount}`;
    const [resetSource, setResetSource] = useState(resetKeyStr);

    if (resetSource !== resetKeyStr) {
        setResetSource(resetKeyStr);
        setActiveIndex(0);
    }

    const getSlides = useCallback(() => {
        const track = trackRef.current;
        if (!track) return [] as HTMLElement[];
        return Array.from(track.children).filter(
            (child) =>
                child.classList.contains(slideClassName) &&
                !child.hasAttribute("data-spacer")
        ) as HTMLElement[];
    }, [slideClassName]);

    const scrollToIndex = useCallback(
        (index: number, behavior: ScrollBehavior = "smooth") => {
            const track = trackRef.current;
            if (!track) return;

            const slides = getSlides();
            const slide = slides[index];
            if (!slide) return;

            isScrollingRef.current = true;
            track.scrollTo({
                left: slide.offsetLeft - (track.offsetWidth - slide.offsetWidth) / 2,
                behavior,
            });

            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(() => {
                isScrollingRef.current = false;
            }, behavior === "smooth" ? 400 : 0);
        },
        [getSlides]
    );

    const goTo = useCallback(
        (realIndex: number) => {
            if (realCount <= 1) return;

            const normalized = ((realIndex % realCount) + realCount) % realCount;
            setActiveIndex(normalized);
            scrollToIndex(normalized);
        },
        [realCount, scrollToIndex]
    );

    const next = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);
    const prev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex]);

    const pause = useCallback(() => {
        pausedRef.current = true;
    }, []);

    const resume = useCallback(() => {
        pausedRef.current = false;
    }, []);

    useEffect(() => {
        scrollToIndex(0, "auto");
    }, [resetSource, scrollToIndex]);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const handleScroll = () => {
            if (isScrollingRef.current) return;

            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(() => {
                const slides = getSlides();
                if (!slides.length) return;

                const trackCenter = track.scrollLeft + track.offsetWidth / 2;
                let closestIndex = 0;
                let closestDistance = Infinity;

                slides.forEach((slide, i) => {
                    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
                    const distance = Math.abs(trackCenter - slideCenter);

                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = i;
                    }
                });

                setActiveIndex(closestIndex);
            }, 50);
        };

        track.addEventListener("scroll", handleScroll, {passive: true});
        return () => {
            track.removeEventListener("scroll", handleScroll);
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        };
    }, [realCount, getSlides]);

    useEffect(() => {
        const track = trackRef.current;
        if (!track || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                visibleRef.current = entry.isIntersecting;
            },
            {threshold: 0.1}
        );

        observer.observe(track);
        return () => observer.disconnect();
    }, [realCount]);

    useEffect(() => {
        if (isSingle || realCount <= 1 || autoPlayInterval <= 0) return;

        const id = setInterval(() => {
            if (pausedRef.current || isScrollingRef.current || document.hidden || !visibleRef.current) return;
            next();
        }, autoPlayInterval);

        return () => clearInterval(id);
    }, [isSingle, realCount, autoPlayInterval, next]);

    const renderItems: CarouselRenderItem<T>[] = items.map((item, i) => ({
        item,
        key: `${i}-${getId(item)}`,
        renderIndex: i,
    }));

    return {
        trackRef,
        renderItems,
        activeRenderIndex: activeIndex,
        activeIndex,
        isSingle,
        goTo,
        next,
        prev,
        pause,
        resume,
    };
};
import {MetadataRoute} from "next";
import products from "@/public/data/products.json";

const BASE_URL = "https://mustakuusi3d.vercel.app";

const LOCALES = ["", "en"];

interface ProductData {
    id: string;
}

export default function sitemap(): MetadataRoute.Sitemap {
    const productList = products as ProductData[];
    const productRoutes = LOCALES.flatMap((locale) =>
        productList.map((product) => ({
            url: `${BASE_URL}/${locale ? `${locale}/` : ""}${product.id}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.9,
        }))
    );

    return [
        ...LOCALES.map((locale) => ({
            url: locale ? `${BASE_URL}/${locale}` : BASE_URL,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 1.0,
        })),
        ...productRoutes,
    ];
}
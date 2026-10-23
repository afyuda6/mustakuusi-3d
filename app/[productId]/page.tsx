import {Navbar} from "@/components/Navbar";
import {Hero} from "@/components/Hero";
import {About} from "@/components/About";
import {Screenshots} from "@/components/Screenshots";
import {ProductCustomizer} from "@/components/ProductCustomizer";
import {Contact} from "@/components/Contact";
import localProducts from "@/public/data/products.json";
import {notFound} from "next/navigation";

interface ProductData {
    id: string;
    title: string;
    iconSrc: string;
    imageSrc: string;
    date: string;
    description: string;
    categories: string[];
    detail: string;
    orderLink: string;
    ctaLabel?: string;
    longDescription: string;
    screenshots: string[];
    customizer?: {
        type: "keychain" | "strava";
    };
}

export async function generateStaticParams() {
    const productsList = (localProducts as ProductData[]);
    return productsList.map((g) => ({productId: g.id}));
}

export async function generateMetadata({params}: { params: Promise<{ productId: string }> }) {
    const {productId} = await params;
    const product = (localProducts as ProductData[]).find((p) => p.id === productId);
    return {
        title: product ? `${product.title} | mustakuusi3D` : "Product not found",
    };
}

export default async function ProductPage({params}: { params: Promise<{ productId: string }> }) {
    const {productId} = await params;
    const productsList = localProducts as ProductData[];
    const product = productsList.find((p) => p.id === productId);

    if (!product) {
        notFound();
    }

    return (
        <div>
            <Navbar/>
            <Hero
                title={product.title}
                description={product.description}
                orderLink={product.orderLink}
                ctaLabel={product.ctaLabel}
                imageUrl={product.iconSrc}
                date={product.date}
            />
            <About
                title="DESKRIPSI PRODUK"
                itemDescription={product.longDescription}
            />
            {product.customizer && (
                <ProductCustomizer
                    type={product.customizer.type}
                    title={product.title}
                    orderLink={product.orderLink}
                />
            )}
            <Screenshots screenshots={product.screenshots} title="CUPLIKAN PRODUK"/>
            <Contact title="HUBUNGI KAMI"/>
        </div>
    );
}
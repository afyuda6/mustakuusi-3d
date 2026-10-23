import {SocialRedirect} from "@/components/SocialRedirect";
import {TiktokBrowserWarning} from "@/components/TiktokBrowserWarning";
import {Navbar} from "@/components/Navbar";
import {Hero} from "@/components/Hero";
import {About} from "@/components/About";
import {Products} from "@/components/Products";
import {Contact} from "@/components/Contact";
import localProducts from "@/public/data/products.json";
import localFaq from "@/public/data/faq.json";
import {FAQ} from "@/components/FAQ";

export async function generateMetadata() {
    return {
        title: "mustakuusi3D",
    };
}

export default async function HomePage() {

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": localFaq.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer,
            },
        })),
    };

    return (
        <div>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}}
            />
            <SocialRedirect/>
            <TiktokBrowserWarning/>
            <Navbar/>
            <Hero
                title="Personalisasi Tanpa Batas"
                description="Menghadirkan produk yang lebih personal melalui teknologi 3D printing."
                imageUrl="hero.png"
            />
            <About
                title="TENTANG KAMI"
                itemDescription="Kami menghadirkan produk 3D printing yang dapat dipersonalisasi sesuai preferensi pengguna. Melalui platform kami, pengguna dapat menyesuaikan elemen seperti tulisan, font, dan warna untuk menciptakan produk yang mencerminkan gaya mereka sendiri. Kami berfokus pada kemudahan kustomisasi dan proses pemesanan yang praktis, sehingga siapa pun dapat memiliki produk yang lebih personal. Tujuan kami adalah menghadirkan pengalaman personalisasi yang kreatif, mudah, dan menyenangkan melalui teknologi 3D printing."
            />
            <Products products={localProducts} allProducts={localProducts} productSearch="SEMUA PRODUK" sectionId="products"/>
            <FAQ title="PERTANYAAN YANG SERING DIAJUKAN"/>
            <Contact title="HUBUNGI KAMI"/>
        </div>
    );
}
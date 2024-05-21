import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Providers from "./Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hierba Mala",
  description: "Para compartir y disfrutar - familia y amigos. Ofrecemos Entradas , Asados , comida mexicana, Antojos dulces, Cócteles de autor, Shots",
  manifest:"/manifest.json",
  icons: {
    apple: "/icon-192x192"
  },
  themeColor: "#417505 "
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

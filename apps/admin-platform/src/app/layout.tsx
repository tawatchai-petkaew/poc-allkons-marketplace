import type { Metadata } from "next";
import { Noto_Sans_Thai_Looped } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Providers } from "./providers";
import "./globals.css";

const notoSansThaiLooped = Noto_Sans_Thai_Looped({
  weight: ["300", "400", "500", "700"],
  subsets: ["thai"],
});

export const metadata: Metadata = {
  title: "Allkons Admin",
  description: "Allkons Marketplace Admin Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${notoSansThaiLooped.className} antialiased`}>
        <AntdRegistry>
          <Providers>{children}</Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// Configure the Quicksand font
const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Specify the weights you need
  display: "swap", // Ensures the text uses fallback fonts until the web font is loaded
});

export const metadata: Metadata = {
  title: "Spiral Chat",
  description: "Highest level of privacy and security for your conversations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider dynamic>
      <html lang="en" suppressHydrationWarning>
        <body className={`${quicksand.className} antialiased`}>
          <ConvexClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

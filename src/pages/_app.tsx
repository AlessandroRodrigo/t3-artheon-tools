import { type AppType } from "next/app";
import { Inter as FontSans } from "next/font/google";
import { cn } from "~/lib/utils";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Toaster } from "~/components/ui/sonner";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Component
        {...pageProps}
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      />
      <Toaster />
    </>
  );
};

export default api.withTRPC(MyApp);

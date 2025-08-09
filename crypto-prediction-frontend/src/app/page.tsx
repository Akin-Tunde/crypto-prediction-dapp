// src/app/page.tsx
import { ConnectButton } from "@/components/ConnectButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Crypto Prediction Market</h1>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
            <ConnectButton />
        </div>
      </div>

      <div className="mt-20">
        {/* Our dApp UI will go here */}
      </div>
    </main>
  );
}
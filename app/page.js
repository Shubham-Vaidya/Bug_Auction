"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="relative isolate min-h-screen w-full overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/LandingPage/HeroBack.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-10 bg-linear-to-b from-[rgba(4,8,16,0.18)] to-[rgba(3,8,14,0.35)]" />

      <Image
        className="pointer-events-none fixed bottom-0 right-0 z-20 h-auto w-[min(280px,62vw)] opacity-95 sm:w-[min(400px,52vw)] lg:w-[min(560px,44vw)]"
        src="/LandingPage/Character.png"
        alt="Bug Auction mascot"
        width={760}
        height={1240}
        priority
      />

      <div className="relative z-30 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <Image
            className="block h-auto w-[58px] object-contain sm:w-[74px]"
            src="/csi_logo 1.png"
            alt="CSI logo"
            width={140}
            height={96}
            priority
            sizes="(max-width: 600px) 58px, 74px"
          />
          <Image
            className="block h-auto w-[108px] object-contain sm:w-[136px]"
            src="/Enthusia.png"
            alt="Enthusia logo"
            width={260}
            height={96}
            priority
            sizes="(max-width: 600px) 108px, 136px"
          />
        </div>

        <section className="slide-up mt-6 flex w-full max-w-[620px] flex-1 flex-col items-center justify-center gap-5 px-2 pb-24 text-center sm:mt-8 sm:gap-7 lg:max-w-[700px] lg:pb-14">
          <Image
            className="h-auto w-full max-w-[660px]"
            src="/LandingPage/HeadingHome.png"
            alt="Bug Auction Arena"
            width={920}
            height={610}
            priority
            sizes="(max-width: 700px) 95vw, 700px"
          />
          <p className="max-w-[95%] text-[0.74rem] font-bold leading-[1.2] text-[#e8db2f] [text-shadow:0_1px_2px_rgba(0,0,0,0.7)] sm:text-[1rem] lg:text-[1.35rem]">
            Spot the Bugs, Win the Bid, Boosting the Ultimate Hack
          </p>

          <div className="mx-auto flex w-full max-w-[330px] flex-col items-center gap-3 pt-2 sm:max-w-[390px] lg:max-w-[440px]">
            <button
              className="w-full cursor-pointer rounded-[7px] border border-white/40 bg-white/50 px-4 py-4 text-[0.95rem] font-bold text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.5)] backdrop-blur-[1px] transition hover:-translate-y-px hover:bg-white/60 sm:py-5 sm:text-[1.05rem] lg:text-[1.3rem]"
              onClick={() => router.push("/admin/login")}
            >
              Enter as Admin
            </button>
            <button
              className="w-full cursor-pointer rounded-[7px] border border-white/40 bg-white/50 px-4 py-4 text-[0.95rem] font-bold text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.5)] backdrop-blur-[1px] transition hover:-translate-y-px hover:bg-white/60 sm:py-5 sm:text-[1.05rem] lg:text-[1.3rem]"
              onClick={() => router.push("/signup")}
            >
              Register as a Team
            </button>
            <button
              className="w-full cursor-pointer rounded-[7px] border border-white/40 bg-white/50 px-4 py-4 text-[0.95rem] font-bold text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.5)] backdrop-blur-[1px] transition hover:-translate-y-px hover:bg-white/60 sm:py-5 sm:text-[1.05rem] lg:text-[1.3rem]"
              onClick={() => router.push("/join-room")}
            >
              Join as Team
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

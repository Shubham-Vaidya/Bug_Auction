"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main
      className="relative flex min-h-screen w-full  justify-center overflow-hidden px-4 pb-6 pt-7 sm:pt-6"
      style={{
        backgroundImage: "url('/LandingPage/HeroBack.png')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[rgba(4,8,16,0.2)] to-[rgba(3,8,14,0.35)]" />

      <div className="absolute left-1/2 top-2 z-10 flex -translate-x-1/2 items-center justify-center gap-3.5 sm:gap-5.5">
        <Image
          className="block h-auto w-14 object-contain sm:w-[min(240px,70vw)]"
          src="/csi_logo 1.png"
          alt="CSI logo"
          width={140}
          height={96}
          priority
          sizes="(max-width: 600px) 56px, 70px"
        />
        <Image
          className="block h-auto w-26.5 object-contain sm:w-[min(230px,32vw)]"
          src="/Enthusia.png"
          alt="Enthusia logo"
          width={260}
          height={96}
          priority
          sizes="(max-width: 600px) 106px, 130px"
        />
      </div>

      <Image
        className="pointer-events-none absolute -bottom-2 -right-3 z-2 h-auto w-[min(230px,58vw)] opacity-95 sm:right-0 sm:w-[min(290px,64vw)] md:right-4 md:w-[min(680px,72vw)] md:opacity-100"
        src="/LandingPage/Character.png"
        alt="Bug Auction mascot"
        width={760}
        height={1240}
        priority
      />

      <section className="slide-up absolute top-[20%] z-10 flex w-full max-w-110 flex-col items-center gap-6 px-2 text-center sm:max-w-130 sm:gap-8">

        <Image
          className="h-auto w-full max-w-165"
          src="/LandingPage/HeadingHome.png"
          alt="Bug Auction Arena"
          width={920}
          height={610}
          priority
          sizes="(max-width: 700px) 95vw, 960px"
        />
        <p className="max-w-[92%] text-[0.6rem] font-bold leading-[1.2] text-[#e8db2f] [text-shadow:0_1px_2px_rgba(0,0,0,0.7)] sm:text-[0.98rem] md:text-[1.68rem]">
          Spot the Bugs, Win the Bid, Boosting the Ultimate Hack
        </p>

        <div className="mx-auto flex w-full max-w-62.5 flex-col items-center self-center gap-3.5 pt-2 sm:max-w-67.5 md:max-w-70">
          <button
            className="w-full cursor-pointer rounded-[7px] border border-white/40 bg-white/50 px-4.5 py-6 text-[0.9rem] font-bold text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.5)] backdrop-blur-[1px] transition hover:-translate-y-px hover:bg-white/60 sm:text-[0.98rem] md:text-[1.58rem]"
            onClick={() => router.push("/admin/login")}
          >
            Enter as Admin
          </button>
          <button
            className="w-full cursor-pointer rounded-[7px] border border-white/40 bg-white/50 px-4.5 py-6 text-[0.9rem] font-bold text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.5)] backdrop-blur-[1px] transition hover:-translate-y-px hover:bg-white/60 sm:text-[0.98rem] md:text-[1.58rem]"
            onClick={() => router.push("/signup")}
          >
            Register as a Team
          </button>
          <button
            className="w-full cursor-pointer rounded-[7px] border border-white/40 bg-white/50 px-4.5 py-6 text-[0.9rem] font-bold text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.5)] backdrop-blur-[1px] transition hover:-translate-y-px hover:bg-white/60 sm:text-[0.98rem] md:text-[1.58rem]"
            onClick={() => router.push("/join-room")}
          >
            Join as Team
          </button>
        </div>
      </section>
    </main>
  );
}

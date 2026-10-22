import React from 'react'

export const HeroText: React.FC = () => {
  return (
    <div className="absolute bottom-8 sm:bottom-10 md:bottom-12 lg:bottom-16 left-6 sm:left-10 md:left-14 lg:left-20 z-20 pointer-events-none select-none max-w-xl lg:max-w-2xl">
      <h1 className="font-hero text-2xl sm:text-3xl md:text-4xl lg:text-[3.15rem] xl:text-[3.5rem] font-semibold tracking-[-0.03em] leading-[1.08] text-[#111827]">
        <span className="block">Your Next Move</span>
        <span className="block">Starts Here.</span>
      </h1>

      <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-slate-800 font-normal leading-relaxed max-w-lg">
        Navigate the evolving tech industry, discover career paths that fit your skills, and find out what to learn next to stay ahead.
      </p>
    </div>
  )
}

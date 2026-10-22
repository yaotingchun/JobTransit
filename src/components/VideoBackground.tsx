import React, { useRef, useState } from 'react'
import launchingVideo from '../assets/JobTransitLaunchingPage.mp4'

interface VideoBackgroundProps {
  className?: string
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({ className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Background Video */}
      <video
        ref={videoRef}
        src={launchingVideo}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={() => setIsVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Atmospheric left fading wash for enhanced typography legibility */}
      <div className="left-fade-wash z-10" />

      {/* Secondary soft horizontal gradient fade from the left */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-3/5 max-w-3xl bg-gradient-to-r from-white/75 via-white/40 to-transparent z-10" />

      {/* Top subtle vignette for header contrast */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/20 via-black/5 to-transparent z-10" />
    </div>
  )
}

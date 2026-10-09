"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { heroMedia } from "../lib/hero-media";

export default function HeroBackground() {
  const [source, setSource] = useState("");
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 600px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    function chooseSource() {
      setSource(
        reduced.matches
          ? ""
          : mobile.matches
            ? heroMedia.mobile
            : heroMedia.desktop,
      );
      setFailed(false);
      setPlaying(false);
      setMuted(true);
    }
    chooseSource();
    mobile.addEventListener("change", chooseSource);
    reduced.addEventListener("change", chooseSource);
    return () => {
      mobile.removeEventListener("change", chooseSource);
      reduced.removeEventListener("change", chooseSource);
    };
  }, []);
  async function toggle() {
    if (!video.current) return;
    if (video.current.paused) {
      try {
        await video.current.play();
      } catch {
        setPlaying(false);
      }
    } else video.current.pause();
  }
  return (
    <>
      <div className="hero-photo">
        <Image
          src={heroMedia.poster}
          alt="Punch Mentality technical sparring inside the Dalakian boxing ring"
          fill
          priority
          sizes="100vw"
        />
        {source && !failed && (
          <video
            key={source}
            ref={video}
            className="hero-video"
            src={source}
            poster={heroMedia.poster}
            autoPlay
            muted={muted}
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            disablePictureInPicture
            onError={() => setFailed(true)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        )}
      </div>
      <div className="hero-shade" aria-hidden="true" />
      {source && !failed && (
        <div className="hero-controls"><button
          type="button"
          className="hero-control"
          onClick={toggle}
          aria-label={
            playing ? "Pause background video" : "Play background video"
          }
        >
          {playing ? "PAUSE VIDEO" : "PLAY VIDEO"}
        </button><button type="button" className="hero-control" aria-pressed={!muted} onClick={()=>{if(video.current){video.current.muted=!muted;setMuted(!muted);void video.current.play().catch(()=>setPlaying(false));}}}>{muted?'MUSIC ON':'MUSIC OFF'}</button></div>
      )}
    </>
  );
}

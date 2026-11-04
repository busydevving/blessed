'use client';
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { Congregation as Engine } from '@/lib/sea/engine';

export interface CongregationHandle {
  setPointer: (fx: number, fy: number) => void;
  clearPointer: () => void;
  /** Centre of the launch block and its half-size, as fractions of this element. */
  setFocus: (fx: number, fy: number, hw: number, hh: number) => void;
  nudge: () => void;
  bless: () => void;
}

/** The glyph-cell congregation filling its parent: a front canvas and a blurred back canvas for the deep ones. */
export function Congregation({ ref, paused, className = '' }: { ref?: Ref<CongregationHandle>; paused: boolean; className?: string }) {
  const frontRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const eng = useRef<Engine | null>(null);

  useImperativeHandle(ref, () => ({
    setPointer: (x, y) => eng.current?.setPointer(x, y),
    clearPointer: () => eng.current?.clearPointer(),
    setFocus: (x, y, w, h) => eng.current?.setFocus(x, y, w, h),
    nudge: () => eng.current?.nudge(),
    bless: () => eng.current?.bless(),
  }));

  useEffect(() => {
    const front = frontRef.current!;
    const e = new Engine(front, backRef.current!);
    // next/font hashes the family name; read the real one from the CSS variable.
    e.fontFamily = getComputedStyle(document.body).getPropertyValue('--font-mono').trim() || '"Martian Mono"';
    eng.current = e;
    const fit = () => e.resize(front.clientWidth, front.clientHeight, Math.min(2, window.devicePixelRatio || 1));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(front);
    e.start();
    document.fonts?.ready.then(fit);
    return () => { ro.disconnect(); cancelAnimationFrame(e.raf); e.raf = 0; eng.current = null; };
  }, []);

  useEffect(() => { eng.current?.setPaused(paused); }, [paused]);

  return (
    <div className={className} aria-hidden>
      <canvas ref={backRef} className="sea sea-back" />
      <canvas ref={frontRef} className="sea" />
    </div>
  );
}

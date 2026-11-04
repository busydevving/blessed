'use client';
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { Altar as Engine } from '@/lib/sea/engine';

export interface AltarHandle {
  setPointer: (fx: number, fy: number) => void;
  clearPointer: () => void;
  /** Centre and height of the hands' slot, as fractions of this element. */
  setSlot: (fx: number, fy: number, fh: number) => void;
  nudge: () => void;
  bless: () => void;
}

/** The home hero: one pair of glyph-cell hands coming together, a halo, a few deep coins and candles. */
export function Altar({ ref, paused }: { ref?: Ref<AltarHandle>; paused: boolean }) {
  const frontRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const eng = useRef<Engine | null>(null);
  useImperativeHandle(ref, () => ({
    setPointer: (x, y) => eng.current?.setPointer(x, y),
    clearPointer: () => eng.current?.clearPointer(),
    setSlot: (x, y, h) => eng.current?.setSlot(x, y, h),
    nudge: () => eng.current?.nudge(),
    bless: () => eng.current?.bless(),
  }));
  useEffect(() => {
    const front = frontRef.current!;
    const e = new Engine(front, backRef.current!);
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
    <>
      <canvas ref={backRef} className="sea sea-back" aria-hidden />
      <canvas ref={frontRef} className="sea" aria-hidden />
    </>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { Mark } from './icons';

/** One-time acknowledgement (restricted regions + risk), remembered in localStorage. */
export function TermsGate() {
  const [show, setShow] = useState(false);
  const [ok, setOk] = useState(false);
  useEffect(() => { try { if (localStorage.getItem('blessed-terms') !== '1') setShow(true); } catch {} }, []);
  if (!show) return null;
  return (
    <div className="modal-back">
      <div className="modal" role="dialog" aria-label="Before you enter">
        <Mark size={28} />
        <h3 style={{ marginTop: 12 }}>Before you enter</h3>
        <p className="muted" style={{ fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
          Blessed is not offered in the United States, the United Kingdom or Canada. If you use it from there, you do so at your own risk and under your own laws. Trading digital assets carries a high risk of losing all the capital you commit.
        </p>
        <label className="check">
          <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
          <span>I am not a sanctioned person, and I accept these restrictions, this risk and the <a href="/terms" style={{ textDecoration: 'underline' }}>terms</a>.</span>
        </label>
        <button type="button" className="btn primary block" disabled={!ok} onClick={() => { try { localStorage.setItem('blessed-terms', '1'); } catch {} setShow(false); }}>Enter</button>
      </div>
    </div>
  );
}

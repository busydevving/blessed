'use client';
import { useConnect } from 'wagmi';
import { useApp } from './AppContext';
import { Icon } from './icons';

/** Wallet picker. Lists whatever connectors wagmi was configured with (lib/wagmi.ts). */
export function ConnectModal() {
  const { connectOpen, closeConnect, say } = useApp();
  const { connectors, connect, isPending, variables } = useConnect();
  if (!connectOpen) return null;
  return (
    <div className="modal-back" onClick={closeConnect}>
      <div className="modal" role="dialog" aria-label="Connect a wallet" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="x" onClick={closeConnect} aria-label="Close"><Icon name="x" width={16} height={16} /></button>
        <h3>Connect a wallet</h3>
        <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>Blessed launches on HyperEVM and lists on Elysium.</p>
        <div style={{ marginTop: 14 }}>
          {connectors.map((c) => (
            <button key={c.uid} type="button" className="wopt" disabled={isPending}
              onClick={() => connect({ connector: c }, {
                onSuccess: () => { closeConnect(); say('Wallet connected'); },
                onError: (err) => say(err.message.split('\n')[0]),
              })}>
              {c.name === 'Injected' ? 'Browser wallet' : c.name}
              <span className="m faint">{isPending && variables && 'connector' in variables && (variables.connector as { uid?: string }).uid === c.uid ? 'opening…' : '→'}</span>
            </button>
          ))}
        </div>
        <p className="hint" style={{ marginTop: 14 }}>By connecting you accept the <a href="/terms" style={{ textDecoration: 'underline' }}>terms</a> and the <a href="/risks" style={{ textDecoration: 'underline' }}>risks</a>.</p>
      </div>
    </div>
  );
}

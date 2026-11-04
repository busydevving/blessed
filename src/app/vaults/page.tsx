import { Page, PageHead } from '@/components/ui';

export default function VaultsPage() {
  return (
    <Page narrow>
      <PageHead eyebrow="vaults · soon" title="Vaults" lede="Shares backed by Hyperliquid perps, funded by the treasury. Coming after launch." />
      <div className="box"><p className="muted">Vaults will let you hold 3× long or short exposure to stocks and HYPE as a single token, usable as a quote for new memes. Follow <a href="https://x.com/blesseddotfun" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>@blesseddotfun</a> for the date.</p></div>
    </Page>
  );
}

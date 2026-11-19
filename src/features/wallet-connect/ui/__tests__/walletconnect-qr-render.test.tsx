import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

// Regression: cuer@0.0.3 (pinned by RainbowKit) passed border=0 to qr>=0.6, which throws "invalid border=0".
// cuer is a transitive dep, so resolve it from RainbowKit's own location.
const WC_URI = `wc:${'a1'.repeat(32)}@2?relay-protocol=irn&symKey=${'b2'.repeat(32)}`;

describe('WalletConnect QR render (RainbowKit -> cuer -> qr)', () => {
  it('renders a WalletConnect URI to an svg without throwing', async () => {
    const rainbowkitEntry = createRequire(import.meta.url).resolve('@rainbow-me/rainbowkit');
    const cuerPath = createRequire(rainbowkitEntry).resolve('cuer');
    const { Cuer } = (await import(pathToFileURL(cuerPath).href)) as {
      Cuer: (props: { value: string }) => React.ReactElement;
    };

    const html = renderToStaticMarkup(createElement(Cuer, { value: WC_URI }));

    expect(html).toContain('<svg');
  });
});

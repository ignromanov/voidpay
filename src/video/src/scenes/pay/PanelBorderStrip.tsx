/** Static border/shadow strip — placed after panel in DOM so cascade wins over Tailwind. */
export const PanelBorderStrip: React.FC = () => (
  <style>{`
    .remotion-pay-panel [data-testid="payment-panel"] { box-shadow: none !important; border-width: 0px !important; border-style: none !important; border-color: transparent !important; outline: none !important; }
    .remotion-pay-panel [data-testid="payment-panel"][data-status="paid"],
    .remotion-pay-panel [data-testid="payment-panel"][data-status="confirming"] { border-width: 0px !important; border-style: none !important; border-color: transparent !important; }
    /* D31: gradient bar (h-1 = 4px) scaled to 12px for video visibility; animate-pulse killed (CSS flicker) */
    .remotion-pay-panel [data-testid="gradient-bar"] { height: 12px !important; }
    .remotion-pay-panel .motion-safe\\:animate-pulse { animation: none !important; }
    /* D34: success state gradient bar — emerald matches "Payment Successful" theme */
    .remotion-pay-panel [data-testid="payment-panel"][data-status="paid"] [data-testid="gradient-bar"] {
      background: linear-gradient(to right, rgb(16, 185, 129), rgb(52, 211, 153)) !important;
    }
  `}</style>
);

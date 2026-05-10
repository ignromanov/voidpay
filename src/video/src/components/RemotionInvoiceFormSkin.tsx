import { FONT_SANS, FONT_MONO } from "../fonts";
import { DEMO_INVOICE, DEMO_FROM_ADDRESS } from "../constants/demo-invoice";

/**
 * Remotion-only mock of the InvoiceForm — full Mocks v2 pixel fidelity.
 * Sizes: Mocks v2 design viewport 360px → ×3 for 1080 Remotion viewport.
 *
 * DO NOT import production <InvoiceForm> or <InvoiceFormView> here.
 * This is a parallel slim component with inlined Mocks v2 token CSS.
 *
 * Field structure (Mocks v2 F2/F3/F4):
 *   Header: / Create invoice
 *   Row 1: From | Bill to (50/50)
 *   Row 2 (full): Description (focused at F2)
 *   Row 2 (full): Wallet · 0x receive (focused at F3, mono)
 *   Row 3: Qty | Rate · USDC (50/50)
 *   MagicDustToggle (on by default)
 *   CTA: "Generate Invoice Link →"
 */

// ×3 sizing reference (Mocks v2 design → 1080 Remotion)
const S = {
  formPadding:    36,   // 12px → 36px
  formRadius:     30,   // 10px → 30px
  headerFont:     33,   // 11px → 33px
  headerPreFont:  27,   // 9px → 27px
  fieldMB:        21,   // 7px → 21px
  labelFont:      19.5, // 6.5px → 19.5px
  inputHeight:    66,   // 22px → 66px
  inputPadV:      15,   // 5px → 15px
  inputPadH:      21,   // 7px → 21px
  inputFont:      27,   // 9px → 27px
  inputMonoFont:  24,   // 8px → 24px
  rowGap:         18,   // 6px → 18px
  toggleMT:       24,   // 8px → 24px
  togglePad:      24,   // 8px → 24px
  toggleRadius:   21,   // 7px → 21px
  toggleNameFont: 27,   // 9px → 27px
  toggleBodyFont: 22.5, // 7.5px → 22.5px
  switchW:        66,   // 22px → 66px
  switchH:        39,   // 13px → 39px
  switchKnob:     27,   // 9px → 27px
  ctaMT:          30,   // 10px → 30px
  ctaPad:         27,   // 9px → 27px
  ctaFont:        30,   // 10px → 30px
  ctaRadius:      21,   // 7px → 21px
};

interface FieldProps {
  label: string;
  value: string;
  empty?: boolean;
  mono?: boolean;
  focused?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, value, empty, mono, focused }) => (
  <div style={{ marginBottom: S.fieldMB }}>
    <div style={{
      fontFamily: `${FONT_MONO}, monospace`,
      fontWeight: 600,
      fontSize: S.labelFont,
      letterSpacing: "0.08em",
      color: "#71717a",
      textTransform: "uppercase",
      marginBottom: 6,
    }}>
      {label}
    </div>
    <div style={{
      background: "#14141b",
      border: `1px solid ${focused ? "#a78bfa" : "rgba(63,63,70,0.5)"}`,
      boxShadow: focused ? "0 0 0 6px rgba(167,139,250,0.18)" : undefined,
      borderRadius: 15,
      padding: `${S.inputPadV}px ${S.inputPadH}px`,
      fontFamily: mono ? `${FONT_MONO}, monospace` : `${FONT_SANS}, sans-serif`,
      fontWeight: 500,
      fontSize: mono ? S.inputMonoFont : S.inputFont,
      minHeight: S.inputHeight,
      display: "flex",
      alignItems: "center",
      color: empty ? "#52525b" : "#f4f4f5",
    }}>
      {value}
    </div>
  </div>
);

interface Props {
  /** Which field is currently "focused" (violet ring) */
  focusedField?: "description" | "wallet";
  /** Whether the wallet address is visible */
  showWallet?: boolean;
  /** Whether client name is filled */
  showClient?: boolean;
  /** Whether description field is filled */
  showDescription?: boolean;
  /** Whether price field is filled */
  showPrice?: boolean;
  /** Whether MagicDust toggle is on */
  magicDustOn?: boolean;
  /** CTA state */
  ctaEnabled?: boolean;
  ctaPressed?: boolean;
  ctaGenerating?: boolean;
}

export const RemotionInvoiceFormSkin: React.FC<Props> = ({
  focusedField,
  showWallet,
  showClient,
  showDescription,
  showPrice,
  magicDustOn = true,
  ctaEnabled,
  ctaPressed,
  ctaGenerating,
}) => {
  // Switch knob position: left when off, right when on
  const knobLeft = magicDustOn ? S.switchW - S.switchKnob - 3 : 3;

  // CTA press scale (Mocks v2 .cta.pressed → scale(0.96))
  const ctaScale = ctaPressed ? 0.96 : 1;

  return (
    <div style={{
      background: "rgba(14,14,19,0.95)",
      border: "1px solid rgba(63,63,70,0.5)",
      borderRadius: S.formRadius,
      padding: S.formPadding,
      boxShadow: "0 16px 50px rgba(0,0,0,0.5)",
      fontFamily: `${FONT_SANS}, sans-serif`,
      textAlign: "left",
    }}>
      {/* Header: / Create invoice */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        marginBottom: 24,
        paddingBottom: 18,
        borderBottom: "1px solid rgba(63,63,70,0.5)",
        fontSize: S.headerFont,
        fontWeight: 700,
        color: "rgba(244,244,245,1)",
        letterSpacing: "-0.005em",
        lineHeight: 1.2,
      }}>
        <span style={{
          fontFamily: `${FONT_MONO}, monospace`,
          fontWeight: 500,
          fontSize: S.headerPreFont,
          color: "#71717a",
        }}>/</span>
        Create invoice
      </div>

      {/* Row 1: From | Bill to */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: S.rowGap,
      }}>
        <Field
          label="From"
          value={showClient ? DEMO_INVOICE.from?.name ?? "Alex" : "Alex"}
          empty={false}
        />
        <Field
          label="Bill to"
          value="Acme Corp"
          empty={!showClient}
        />
      </div>

      {/* Row 2a: Description */}
      <Field
        label="Description"
        value="Web design — Acme Corp"
        empty={!showDescription}
        focused={focusedField === "description"}
      />

      {/* Row 2b: Wallet · 0x receive */}
      <Field
        label="Wallet · 0x receive"
        value={showWallet ? `0x${DEMO_FROM_ADDRESS.slice(2, 24)}` : "0x… address"}
        empty={!showWallet}
        mono
        focused={focusedField === "wallet"}
      />

      {/* Row 3: Qty | Rate · USDC */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: S.rowGap,
      }}>
        <Field
          label="Qty"
          value="1"
          empty={!showDescription}
        />
        <Field
          label="Rate · USDC"
          value="250.00"
          empty={!showPrice}
        />
      </div>

      {/* MagicDustToggle */}
      <div style={{
        marginTop: S.toggleMT,
        border: "1px solid rgba(63,63,70,0.4)",
        background: "rgba(24,24,27,0.5)",
        borderRadius: S.toggleRadius,
        padding: S.togglePad,
      }}>
        {/* Top row: icon + name + switch */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            {/* Fingerprint icon placeholder (SVG inline) */}
            <svg
              width={S.toggleNameFont}
              height={S.toggleNameFont}
              viewBox="0 0 24 24"
              fill="none"
              stroke={magicDustOn ? "#a78bfa" : "#52525b"}
              strokeWidth="2"
            >
              <path d="M12 11a4 4 0 1 1 4 4" />
              <path d="M12 6v0M12 18v0" />
            </svg>
            <div style={{
              fontWeight: 700,
              fontSize: S.toggleNameFont,
              color: "#d4d4d8",
            }}>
              Magic Dust Verification
            </div>
          </div>
          {/* Toggle switch */}
          <div style={{
            width: S.switchW,
            height: S.switchH,
            borderRadius: 9999,
            background: magicDustOn ? "#7c3aed" : "#27272a",
            border: `1px solid ${magicDustOn ? "#a78bfa" : "rgba(63,63,70,0.5)"}`,
            position: "relative",
            flexShrink: 0,
          }}>
            <div style={{
              position: "absolute",
              width: S.switchKnob,
              height: S.switchKnob,
              background: magicDustOn ? "white" : "#71717a",
              borderRadius: "50%",
              top: (S.switchH - S.switchKnob) / 2,
              left: knobLeft,
            }} />
          </div>
        </div>
        {/* Body text */}
        <div style={{
          marginTop: 15,
          paddingTop: 15,
          borderTop: "1px solid rgba(63,63,70,0.4)",
          fontSize: S.toggleBodyFont,
          color: "#a1a1aa",
          lineHeight: 1.4,
        }}>
          Adds a tiny random amount (e.g.{" "}
          <span style={{ color: "#d4d4d8", fontWeight: 600 }}>0.000042</span>
          ) to the total to{" "}
          <span style={{ color: "#d4d4d8", fontWeight: 600 }}>instantly verify payment</span>
          {" "}on-chain without a database.
        </div>
      </div>

      {/* CTA button */}
      <div style={{
        marginTop: S.ctaMT,
        transform: `scale(${ctaScale})`,
        transformOrigin: "center",
      }}>
        <div style={{
          width: "100%",
          background: ctaEnabled
            ? "linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)"
            : "rgba(39,39,42,0.6)",
          color: ctaEnabled ? "white" : "#52525b",
          borderRadius: S.ctaRadius,
          padding: S.ctaPad,
          fontWeight: 600,
          fontSize: S.ctaFont,
          textAlign: "center",
          boxShadow: ctaEnabled ? "0 6px 18px rgba(167,139,250,0.32)" : undefined,
          border: ctaEnabled ? "none" : "1px solid rgba(63,63,70,0.4)",
          position: "relative",
          overflow: "hidden",
        }}>
          {ctaGenerating ? "Generating…" : "Generate Invoice Link →"}
        </div>
      </div>
    </div>
  );
};

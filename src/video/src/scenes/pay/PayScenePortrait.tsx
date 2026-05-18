import { AbsoluteFill, interpolate, useVideoConfig } from 'remotion'
import { NetworkBackground } from '@/widgets/network-background'
import { COLORS } from '../../constants/colors'
import { RemotionFakeToast } from '../../components/RemotionFakeToast'
import { Caption } from '../../components/Caption'
import { PAY_CAPTIONS_VERTICAL, PAY_CAPTIONS_V2_VERTICAL } from '../captions/pay-captions'
import type { HookVariant } from '../captions/thesis-captions'
import { NetworkBackgroundLayer } from '../../components/NetworkBackgroundLayer'
import { WalletPill } from '../../components/WalletPill'
import { PaperBackdrop } from '../../components/PaperBackdrop'
import {
  CHROME_HEIGHT_PORTRAIT,
  PANEL_EXIT_START,
  PANEL_EXIT_END,
  PHASE_CONNECTED,
  SUCCESS,
  PAPER_PROPS_PENDING,
  PAPER_PROPS_PAID,
  PACK_Y_OFFSET_PORTRAIT,
} from './constants'
import { PanelCascadeStyle } from './PanelCascadeStyle'
import { PanelBorderStrip } from './PanelBorderStrip'
import { MagicDustHalo } from './MagicDustHalo'
import { PaymentPanelContent } from './PaymentPanelContent'
import { usePaySceneState } from './usePaySceneState'

type Props = {
  hookVariant?: HookVariant
}

export const PayScenePortrait: React.FC<Props> = ({ hookVariant = 'v1' }) => {
  const { width, height } = useVideoConfig()

  // Mocks v2 surgical: panel width = 84% of stage width (portrait only)
  const panelWidth = Math.round(width * 0.84)

  const {
    frame,
    cardScale,
    step,
    idleSubState,
    panelStatus,
    ctaPressTriggerFrame,
    confirmations,
    magicDustPulseOpacity,
    panelTxHash,
    paperPaid,
    panelFinalized,
    panelExit,
    panelExitOpacity,
    walletOpacity,
    packProgress,
    paperPackOpacity,
  } = usePaySceneState(hookVariant)

  // R9r: No dim in portrait per user requirement.
  const uiDimOpacity = 1.0

  // Portrait: blur paper while panel is foreground, sharp at PANEL_EXIT_END.
  const paperBlur = interpolate(frame, [PANEL_EXIT_START, PANEL_EXIT_END], [2, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // F2: pack-into-URL animation — portrait-specific Y offset.
  const paperPackTransform = `scale(${1 - packProgress}) translateY(${-PACK_Y_OFFSET_PORTRAIT * packProgress}px)`

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <NetworkBackgroundLayer variant="soft" />
      <NetworkBackground />

      {/* Round 9c L2: InvoicePaper as full-bleed scene backdrop.
           Portrait paper: shared PaperBackdrop with D39 canonical sizing.
           CHROME_HEIGHT_PORTRAIT passed via containerHeight + parent top offset (offsetTop removed). */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: CHROME_HEIGHT_PORTRAIT,
          width,
          height: height - CHROME_HEIGHT_PORTRAIT,
          transform: paperPackTransform,
          transformOrigin: 'center top',
          opacity: paperPackOpacity,
        }}
      >
        <PaperBackdrop
          paperProps={paperPaid ? PAPER_PROPS_PAID : PAPER_PROPS_PENDING}
          containerWidth={width}
          containerHeight={height - CHROME_HEIGHT_PORTRAIT}
          opacity={1.0}
          blurPx={paperBlur}
        />
      </div>

      {/* F1.C1: Magic Dust visual peak — violet halo anchored to paper totals area.
           Spec: bottom-right of totals, radial-gradient ellipse, blur(14px). */}
      <MagicDustHalo
        opacity={magicDustPulseOpacity}
        position={{ kind: 'percentage', bottom: '18%', right: '4%' }}
      />

      {/* UI dim wrap during Magic Dust peak — panel + chrome dim together */}
      <div style={{ position: 'absolute', inset: 0, opacity: uiDimOpacity, pointerEvents: 'none' }}>
        {/* β1+β2: Payment panel as floating center modal.
             Mocks v2 surgical: width = 84% of stage, side padding = 36px (12px × 3).
             F2.D1: CreateYourOwnCta suppressed — voice-gate violation (self-referential in video). */}
        <PanelCascadeStyle frame={frame} />
        <div
          className="remotion-pay-panel"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: panelWidth,
            fontSize: 'inherit',
            // θ6: panel at full scale matching production size
            transform: `translate(-50%, -50%) scale(${cardScale}) translateY(${panelExit}px)`,
            transformOrigin: 'center center',
            opacity: cardScale * (1 - panelExitOpacity),
            borderRadius: 30,
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none',
            overflow: 'hidden',
            padding: 0,
            pointerEvents: 'auto',
          }}
        >
          {/* Inner padding wrapper */}
          <div style={{ padding: '36px 36px 30px' }}>
            <PaymentPanelContent
              frame={frame}
              step={step}
              idleSubState={idleSubState}
              panelStatus={panelStatus}
              panelTxHash={panelTxHash}
              confirmations={confirmations}
              ctaPressTriggerFrame={ctaPressTriggerFrame}
              panelFinalized={panelFinalized}
            />
          </div>
        </div>
        {/* Border/shadow strip placed AFTER panel in DOM so this <style> wins the cascade over Tailwind */}
        <PanelBorderStrip />

        {/* C7: WalletPill — disconnected (F9) → connected (F10-F11), exits at success (F12) */}
        {frame < SUCCESS && (
          <WalletPill connected={frame >= PHASE_CONNECTED} opacity={walletOpacity} />
        )}
      </div>

      {/* Narrative toasts — round-10b: frames aligned to updated phase constants */}
      <RemotionFakeToast
        variant="success"
        title="Wallet connected"
        startAt={140}
        hold={40}
        stackOffset={0}
      />
      <RemotionFakeToast
        variant="success"
        title="Network switched to Arbitrum"
        startAt={190}
        hold={40}
        stackOffset={0}
      />
      <RemotionFakeToast
        variant="loading"
        title="Confirming on-chain"
        description="Waiting for finality"
        startAt={300}
        hold={80}
        stackOffset={0}
      />
      <RemotionFakeToast
        variant="success"
        title="Payment received"
        description="Cryptographic receipt verified"
        startAt={420}
        hold={100}
        stackOffset={0}
      />

      {/* Captions from caption-data (portrait) */}
      {(hookVariant === 'v2' ? PAY_CAPTIONS_V2_VERTICAL : PAY_CAPTIONS_VERTICAL).map((c) => (
        <Caption
          key={c.startAt}
          text={c.text}
          startAt={c.startAt}
          endAt={c.endAt}
          fontSize={c.fontSize}
          position={c.position}
          variant={c.variant}
          weight={c.weight}
          emphasizedWord={c.emphasizedWord}
          springConfig={c.springConfig}
        />
      ))}
    </AbsoluteFill>
  )
}

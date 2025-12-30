'use client';

import { useState, useEffect } from 'react';
import { InvoiceSchemaV2 } from '@/entities/invoice/model/schema-v2';
import { generateRandomInvoice } from '@/shared/lib/test-utils/invoice-generator';
import { compress } from '@/shared/lib/compression';
import { encodeBinary, decodeBinary, encodeBinaryV2, decodeBinaryV2, encodeBinaryV3, decodeBinaryV3 } from '@/shared/lib/binary-codec';

interface CompressionStats {
  method: string;
  version: string;
  encoded: string;
  byteSize: number;
  charCount: number;
  compressionRatio: number;
  steps: Array<{
    step: string;
    description: string;
    value: string;
  }>;
}

// Animated counter hook
function useAnimatedCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

export default function ComparePage() {
  const [invoice, setInvoice] = useState<InvoiceSchemaV2 | null>(null);
  const [lzStats, setLzStats] = useState<CompressionStats | null>(null);
  const [binaryStats, setBinaryStats] = useState<CompressionStats | null>(null);
  const [binaryV2Stats, setBinaryV2Stats] = useState<CompressionStats | null>(null);
  const [binaryV3Stats, setBinaryV3Stats] = useState<CompressionStats | null>(null);
  const [showLzSteps, setShowLzSteps] = useState(false);
  const [showBinarySteps, setShowBinarySteps] = useState(false);
  const [showBinaryV2Steps, setShowBinaryV2Steps] = useState(false);
  const [showBinaryV3Steps, setShowBinaryV3Steps] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateNewInvoice();
  }, []);

  const generateNewInvoice = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newInvoice = generateRandomInvoice();
      setInvoice(newInvoice);

      // LZ-String compression
      const jsonStr = JSON.stringify(newInvoice);
      const lzEncoded = compress(jsonStr);
      const lzByteSize = new TextEncoder().encode(lzEncoded).length;

      setLzStats({
        method: 'LZ-String',
        version: 'Current',
        encoded: lzEncoded,
        byteSize: lzByteSize,
        charCount: lzEncoded.length,
        compressionRatio: (lzByteSize / jsonStr.length) * 100,
        steps: [
          { step: '1', description: 'Original JSON', value: `${jsonStr.length} chars` },
          { step: '2', description: 'Stringify invoice object', value: jsonStr.substring(0, 100) + '...' },
          { step: '3', description: 'Apply LZ compression', value: 'lzString.compressToEncodedURIComponent()' },
          { step: '4', description: 'Final encoded string', value: `${lzEncoded.length} chars, ${lzByteSize} bytes` },
        ],
      });

      // Binary compression V1
      try {
        const binaryEncoded = encodeBinary(newInvoice);
        const binaryByteSize = new TextEncoder().encode(binaryEncoded).length;

        setBinaryStats({
          method: 'Binary Codec',
          version: 'V1',
          encoded: binaryEncoded,
          byteSize: binaryByteSize,
          charCount: binaryEncoded.length,
          compressionRatio: (binaryByteSize / jsonStr.length) * 100,
          steps: [
            { step: '1', description: 'Convert UUID to 16 bytes', value: `${newInvoice.invoiceId} → 16 bytes` },
            { step: '2', description: 'Convert addresses to 20 bytes each', value: '0x... → 20 bytes' },
            { step: '3', description: 'Pack timestamps as UInt32', value: '4 bytes each' },
            { step: '4', description: 'Use varint for small numbers', value: 'Chain ID, decimals, etc.' },
            { step: '5', description: 'Length-prefixed strings', value: 'Names, descriptions, etc.' },
            { step: '6', description: 'Encode to Base62', value: `${binaryEncoded.length} chars, ${binaryByteSize} bytes` },
          ],
        });
      } catch (error) {
        console.error('Binary V1 encoding error:', error);
        setBinaryStats(null);
      }

      // Binary compression V2 (Enhanced)
      try {
        const binaryV2Encoded = encodeBinaryV2(newInvoice, false);
        const binaryV2ByteSize = new TextEncoder().encode(binaryV2Encoded).length;

        setBinaryV2Stats({
          method: 'Binary Codec',
          version: 'V2 Enhanced',
          encoded: binaryV2Encoded,
          byteSize: binaryV2ByteSize,
          charCount: binaryV2Encoded.length,
          compressionRatio: (binaryV2ByteSize / jsonStr.length) * 100,
          steps: [
            { step: '1', description: 'Bit-pack all optional fields', value: '2 bytes for all flags' },
            { step: '2', description: 'Dictionary compression', value: 'USDC, ETH, token addresses → 1 byte codes' },
            { step: '3', description: 'Delta encoding for dates', value: 'due = iss + delta (saves 2-3 bytes)' },
            { step: '4', description: 'Binary packing (V1 techniques)', value: 'UUID, addresses, varint, etc.' },
            { step: '5', description: 'Encode result', value: `${binaryV2Encoded.length} chars, ${binaryV2ByteSize} bytes` },
          ],
        });
      } catch (error) {
        console.error('Binary V2 encoding error:', error);
        setBinaryV2Stats(null);
      }

      // Binary compression V3 (Hybrid Strategy)
      try {
        const binaryV3Encoded = encodeBinaryV3(newInvoice);
        const binaryV3ByteSize = new TextEncoder().encode(binaryV3Encoded).length;

        setBinaryV3Stats({
          method: 'Binary Codec',
          version: 'V3 Hybrid',
          encoded: binaryV3Encoded,
          byteSize: binaryV3ByteSize,
          charCount: binaryV3Encoded.length,
          compressionRatio: (binaryV3ByteSize / jsonStr.length) * 100,
          steps: [
            { step: '1', description: 'Binary pack structured data', value: 'UUID, addresses, numbers, dates' },
            { step: '2', description: 'Collect all text fields', value: 'notes, names, emails, descriptions' },
            { step: '3', description: 'Check text length threshold', value: '> 50 chars? Apply LZ compression' },
            { step: '4', description: 'Selective text compression', value: 'LZ only for text, binary unchanged' },
            { step: '5', description: 'Combine binary + text data', value: 'Best of both worlds' },
            { step: '6', description: 'Encode result', value: `${binaryV3Encoded.length} chars, ${binaryV3ByteSize} bytes` },
          ],
        });
      } catch (error) {
        console.error('Binary V3 encoding error:', error);
        setBinaryV3Stats(null);
      }

      setIsGenerating(false);
    }, 100);
  };

  if (!invoice || !lzStats) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
          * { font-family: 'JetBrains Mono', monospace; }
        `}</style>
        <div className="text-[#00ffaa] text-lg animate-pulse">
          <span className="inline-block animate-[spin_1s_linear_infinite]">◢</span> INITIALIZING COMPRESSION LAB...
        </div>
      </div>
    );
  }

  const savingsV1 = lzStats.byteSize - (binaryStats?.byteSize || 0);
  const savingsPercentV1 = ((savingsV1 / lzStats.byteSize) * 100).toFixed(1);

  const savingsV2 = lzStats.byteSize - (binaryV2Stats?.byteSize || 0);
  const savingsPercentV2 = ((savingsV2 / lzStats.byteSize) * 100).toFixed(1);

  const savingsV3 = lzStats.byteSize - (binaryV3Stats?.byteSize || 0);
  const savingsPercentV3 = ((savingsV3 / lzStats.byteSize) * 100).toFixed(1);

  const copyAnalysisData = async () => {
    try {
      // Test decoding for all methods
      const lzDecodeResult = { success: true, error: null, data: invoice };

      let v1DecodeResult = { success: false, error: null as string | null, data: null as any };
      if (binaryStats) {
        try {
          const decoded = decodeBinary(binaryStats.encoded);
          const matches = JSON.stringify(decoded) === JSON.stringify(invoice);
          v1DecodeResult = { success: matches, error: matches ? null : 'Data mismatch', data: decoded };
        } catch (error) {
          v1DecodeResult = { success: false, error: (error as Error).message, data: null };
        }
      }

      let v2DecodeResult = { success: false, error: null as string | null, data: null as any };
      if (binaryV2Stats) {
        try {
          const decoded = decodeBinaryV2(binaryV2Stats.encoded);
          const matches = JSON.stringify(decoded) === JSON.stringify(invoice);
          v2DecodeResult = { success: matches, error: matches ? null : 'Data mismatch', data: decoded };
        } catch (error) {
          v2DecodeResult = { success: false, error: (error as Error).message, data: null };
        }
      }

      let v3DecodeResult = { success: false, error: null as string | null, data: null as any };
      if (binaryV3Stats) {
        try {
          const decoded = decodeBinaryV3(binaryV3Stats.encoded);
          const matches = JSON.stringify(decoded) === JSON.stringify(invoice);
          v3DecodeResult = { success: matches, error: matches ? null : 'Data mismatch', data: decoded };
        } catch (error) {
          v3DecodeResult = { success: false, error: (error as Error).message, data: null };
        }
      }

      const analysisReport = {
        timestamp: new Date().toISOString(),
        sample: {
          invoiceId: invoice.invoiceId,
          network: invoice.networkId,
          currency: invoice.currency,
          itemCount: invoice.items.length,
          hasNotes: !!invoice.notes,
          hasToken: !!invoice.tokenAddress,
        },
        originalData: invoice,
        compressionResults: {
          lzString: {
            method: lzStats.method,
            version: lzStats.version,
            byteSize: lzStats.byteSize,
            charCount: lzStats.charCount,
            compressionRatio: lzStats.compressionRatio.toFixed(2) + '%',
            encoded: lzStats.encoded,
            steps: lzStats.steps,
          },
          binaryV1: binaryStats ? {
            method: binaryStats.method,
            version: binaryStats.version,
            byteSize: binaryStats.byteSize,
            charCount: binaryStats.charCount,
            compressionRatio: binaryStats.compressionRatio.toFixed(2) + '%',
            savingsVsLZ: `-${savingsPercentV1}%`,
            encoded: binaryStats.encoded,
            steps: binaryStats.steps,
          } : null,
          binaryV2: binaryV2Stats ? {
            method: binaryV2Stats.method,
            version: binaryV2Stats.version,
            byteSize: binaryV2Stats.byteSize,
            charCount: binaryV2Stats.charCount,
            compressionRatio: binaryV2Stats.compressionRatio.toFixed(2) + '%',
            savingsVsLZ: `-${savingsPercentV2}%`,
            encoded: binaryV2Stats.encoded,
            steps: binaryV2Stats.steps,
          } : null,
          binaryV3: binaryV3Stats ? {
            method: binaryV3Stats.method,
            version: binaryV3Stats.version,
            byteSize: binaryV3Stats.byteSize,
            charCount: binaryV3Stats.charCount,
            compressionRatio: binaryV3Stats.compressionRatio.toFixed(2) + '%',
            savingsVsLZ: `-${savingsPercentV3}%`,
            encoded: binaryV3Stats.encoded,
            steps: binaryV3Stats.steps,
          } : null,
        },
        decodingResults: {
          lzString: lzDecodeResult,
          binaryV1: v1DecodeResult,
          binaryV2: v2DecodeResult,
          binaryV3: v3DecodeResult,
        },
        summary: {
          bestMethod: binaryV3Stats ? 'Binary V3' : binaryV2Stats ? 'Binary V2' : binaryStats ? 'Binary V1' : 'LZ-String',
          bestSize: binaryV3Stats ? binaryV3Stats.byteSize : binaryV2Stats ? binaryV2Stats.byteSize : binaryStats ? binaryStats.byteSize : lzStats.byteSize,
          totalSavings: `${savingsV3} bytes (-${savingsPercentV3}%)`,
          allDecodesSuccessful: lzDecodeResult.success && v1DecodeResult.success && v2DecodeResult.success && v3DecodeResult.success,
        }
      };

      const reportText = `
═══════════════════════════════════════════════════════════
  BINARY CODEC BENCHMARK - ANALYSIS REPORT
═══════════════════════════════════════════════════════════

Generated: ${analysisReport.timestamp}
Sample ID: ${analysisReport.sample.invoiceId}

───────────────────────────────────────────────────────────
SAMPLE OVERVIEW
───────────────────────────────────────────────────────────
Network:      CHAIN_${analysisReport.sample.network}
Currency:     ${analysisReport.sample.currency}
Items:        ${analysisReport.sample.itemCount}
Has Notes:    ${analysisReport.sample.hasNotes ? 'Yes' : 'No'}
Has Token:    ${analysisReport.sample.hasToken ? 'Yes' : 'No'}

───────────────────────────────────────────────────────────
COMPRESSION RESULTS
───────────────────────────────────────────────────────────

[1] LZ-STRING (BASELINE)
    Size:        ${analysisReport.compressionResults.lzString.byteSize} bytes
    Characters:  ${analysisReport.compressionResults.lzString.charCount}
    Ratio:       ${analysisReport.compressionResults.lzString.compressionRatio}

${binaryStats ? `[2] BINARY CODEC V1
    Size:        ${analysisReport.compressionResults.binaryV1?.byteSize} bytes
    Characters:  ${analysisReport.compressionResults.binaryV1?.charCount}
    Ratio:       ${analysisReport.compressionResults.binaryV1?.compressionRatio}
    vs LZ:       ${analysisReport.compressionResults.binaryV1?.savingsVsLZ}
` : ''}
${binaryV2Stats ? `[3] BINARY CODEC V2 (ENHANCED)
    Size:        ${analysisReport.compressionResults.binaryV2?.byteSize} bytes
    Characters:  ${analysisReport.compressionResults.binaryV2?.charCount}
    Ratio:       ${analysisReport.compressionResults.binaryV2?.compressionRatio}
    vs LZ:       ${analysisReport.compressionResults.binaryV2?.savingsVsLZ}
` : ''}
${binaryV3Stats ? `[4] BINARY CODEC V3 (HYBRID)
    Size:        ${analysisReport.compressionResults.binaryV3?.byteSize} bytes
    Characters:  ${analysisReport.compressionResults.binaryV3?.charCount}
    Ratio:       ${analysisReport.compressionResults.binaryV3?.compressionRatio}
    vs LZ:       ${analysisReport.compressionResults.binaryV3?.savingsVsLZ}
` : ''}
───────────────────────────────────────────────────────────
DECODING VERIFICATION
───────────────────────────────────────────────────────────

LZ-String:    ${lzDecodeResult.success ? '✓ SUCCESS' : '✗ FAILED'}
              ${lzDecodeResult.error ? `Error: ${lzDecodeResult.error}` : 'Data matches original'}

Binary V1:    ${v1DecodeResult.success ? '✓ SUCCESS' : '✗ FAILED'}
              ${v1DecodeResult.error ? `Error: ${v1DecodeResult.error}` : binaryStats ? 'Data matches original' : 'N/A'}

Binary V2:    ${v2DecodeResult.success ? '✓ SUCCESS' : '✗ FAILED'}
              ${v2DecodeResult.error ? `Error: ${v2DecodeResult.error}` : binaryV2Stats ? 'Data matches original' : 'N/A'}

Binary V3:    ${v3DecodeResult.success ? '✓ SUCCESS' : '✗ FAILED'}
              ${v3DecodeResult.error ? `Error: ${v3DecodeResult.error}` : binaryV3Stats ? 'Data matches original' : 'N/A'}

───────────────────────────────────────────────────────────
SUMMARY
───────────────────────────────────────────────────────────

Best Method:  ${analysisReport.summary.bestMethod}
Best Size:    ${analysisReport.summary.bestSize} bytes
Total Saved:  ${analysisReport.summary.totalSavings} vs LZ-String
All Valid:    ${analysisReport.summary.allDecodesSuccessful ? '✓ YES' : '✗ NO'}

═══════════════════════════════════════════════════════════

FULL DATA (JSON):

${JSON.stringify(analysisReport, null, 2)}
`;

      await navigator.clipboard.writeText(reportText);
      alert('✓ ANALYSIS DATA COPIED TO CLIPBOARD');
    } catch (error) {
      alert('✗ COPY FAILED: ' + (error as Error).message);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * {
          font-family: 'JetBrains Mono', monospace;
          -webkit-font-smoothing: antialiased;
        }

        body {
          background: #0a0e14;
          background-image:
            linear-gradient(rgba(0, 255, 170, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 170, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          33% { transform: translate(-2px, 2px); }
          66% { transform: translate(2px, -2px); }
        }

        @keyframes dataflow {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .scanline {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(to bottom, transparent, rgba(0, 255, 170, 0.3), transparent);
          animation: scanline 8s linear infinite;
          pointer-events: none;
          z-index: 100;
        }

        .data-panel {
          background: rgba(10, 14, 20, 0.9);
          border: 1px solid rgba(0, 255, 170, 0.2);
          position: relative;
          overflow: hidden;
        }

        .data-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 4px;
          border-top: 1px solid #00ffaa;
          border-left: 1px solid #00ffaa;
        }

        .data-panel::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 4px;
          height: 4px;
          border-bottom: 1px solid #00ffaa;
          border-right: 1px solid #00ffaa;
        }

        .hex-display {
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.1em;
        }

        .metric-card {
          animation: dataflow 0.5s ease-out;
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
      `}</style>

      <div className="scanline" />

      <div className="min-h-screen bg-transparent text-[#e0e0e0] p-4 md:p-8 py-12">
        <div className="max-w-[1400px] mx-auto space-y-10">
          {/* Header */}
          <div className="data-panel p-8 md:p-10 border-b-2 border-[#00ffaa]">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="text-[10px] text-[#00ffaa] mb-3 tracking-widest">COMPRESSION ANALYSIS LAB</div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  <span className="text-[#00ffaa]">◢</span> BINARY CODEC BENCHMARK
                </h1>
                <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
                  Real-time performance analysis: LZ-String (legacy) vs Binary Codec V1 (optimized) vs V2 (enhanced) vs V3 (hybrid)
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={copyAnalysisData}
                  className="px-4 py-2 bg-transparent border border-[#ffb000] text-[#ffb000] hover:bg-[#ffb000] hover:text-[#0a0e14] transition-all duration-200 font-medium text-sm"
                  title="Copy full analysis report to clipboard"
                >
                  ◈ COPY REPORT
                </button>
                <button
                  onClick={generateNewInvoice}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-transparent border border-[#00ffaa] text-[#00ffaa] hover:bg-[#00ffaa] hover:text-[#0a0e14] transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? '◢ GENERATING...' : '◢ NEW SAMPLE'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 text-xs">
              <div>
                <div className="text-gray-500 mb-2">SAMPLE_ID</div>
                <div className="text-[#ffb000] font-mono text-sm">{invoice.invoiceId.split('-')[0]}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-2">NETWORK</div>
                <div className="text-[#00ffaa] text-sm">CHAIN_{invoice.networkId}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-2">TIMESTAMP</div>
                <div className="text-white text-sm">{new Date().toISOString().split('T')[1]?.split('.')[0]}</div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <MetricCard
              label="LZ-STRING"
              value={lzStats.byteSize}
              unit="BYTES"
              color="#808080"
              delay="stagger-1"
            />
            <MetricCard
              label="BINARY_V1"
              value={binaryStats?.byteSize || 0}
              unit="BYTES"
              color="#00a8ff"
              subtitle={`-${savingsPercentV1}%`}
              delay="stagger-2"
            />
            <MetricCard
              label="BINARY_V2"
              value={binaryV2Stats?.byteSize || 0}
              unit="BYTES"
              color="#9370db"
              subtitle={`-${savingsPercentV2}%`}
              delay="stagger-3"
            />
            <MetricCard
              label="BINARY_V3"
              value={binaryV3Stats?.byteSize || 0}
              unit="BYTES"
              color="#00ffaa"
              subtitle={`-${savingsPercentV3}%`}
              delay="stagger-4"
            />
            <MetricCard
              label="BEST_RESULT"
              value={Number(savingsV3)}
              unit="BYTES_SAVED"
              color="#39ff14"
              subtitle={`${savingsPercentV3}% reduction`}
              delay="stagger-5"
              highlight
            />
          </div>

          {/* Compression Ratio Visualization */}
          <div className="data-panel p-8">
            <div className="text-[10px] text-[#00ffaa] mb-6 tracking-widest">COMPRESSION EFFICIENCY</div>
            <div className="space-y-6">
              <CompressionBar label="LZ-STRING" percent={100 - lzStats.compressionRatio} color="#808080" />
              <CompressionBar
                label="BINARY_V1"
                percent={100 - (binaryStats?.compressionRatio || 0)}
                color="#00a8ff"
              />
              <CompressionBar
                label="BINARY_V2"
                percent={100 - (binaryV2Stats?.compressionRatio || 0)}
                color="#9370db"
              />
              <CompressionBar
                label="BINARY_V3"
                percent={100 - (binaryV3Stats?.compressionRatio || 0)}
                color="#00ffaa"
              />
            </div>
          </div>

          {/* Method Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <MethodPanel
              stats={lzStats}
              showSteps={showLzSteps}
              onToggleSteps={() => setShowLzSteps(!showLzSteps)}
              color="#808080"
              icon="◢"
            />
            {binaryStats && (
              <MethodPanel
                stats={binaryStats}
                showSteps={showBinarySteps}
                onToggleSteps={() => setShowBinarySteps(!showBinarySteps)}
                color="#00a8ff"
                icon="◣"
              />
            )}
            {binaryV2Stats && (
              <MethodPanel
                stats={binaryV2Stats}
                showSteps={showBinaryV2Steps}
                onToggleSteps={() => setShowBinaryV2Steps(!showBinaryV2Steps)}
                color="#9370db"
                icon="◤"
              />
            )}
            {binaryV3Stats && (
              <MethodPanel
                stats={binaryV3Stats}
                showSteps={showBinaryV3Steps}
                onToggleSteps={() => setShowBinaryV3Steps(!showBinaryV3Steps)}
                color="#00ffaa"
                icon="◥"
              />
            )}
          </div>

          {/* Raw Data */}
          <div className="data-panel p-8">
            <div className="text-[10px] text-[#00ffaa] mb-6 tracking-widest flex items-center justify-between">
              <span>RAW_SAMPLE_DATA</span>
              <span className="text-gray-500">HEX_VIEW</span>
            </div>
            <pre className="bg-black/50 p-6 text-xs overflow-x-auto border border-[#00ffaa]/20 text-[#00ffaa] leading-relaxed">
              {JSON.stringify(invoice, null, 2)}
            </pre>
          </div>

          {/* URL Comparison */}
          <div className="data-panel p-8">
            <div className="text-[10px] text-[#00ffaa] mb-6 tracking-widest">ENCODED_URLS</div>
            <div className="space-y-6">
              <URLDisplay
                label="LZ-STRING"
                size={lzStats.byteSize}
                url={`https://voidpay.com/pay?d=${lzStats.encoded}`}
                color="#808080"
              />
              {binaryStats && (
                <URLDisplay
                  label="BINARY_V1"
                  size={binaryStats.byteSize}
                  url={`https://voidpay.com/pay?b1=${binaryStats.encoded}`}
                  color="#00a8ff"
                  savings={savingsPercentV1}
                />
              )}
              {binaryV2Stats && (
                <URLDisplay
                  label="BINARY_V2"
                  size={binaryV2Stats.byteSize}
                  url={`https://voidpay.com/pay?b2=${binaryV2Stats.encoded}`}
                  color="#9370db"
                  savings={savingsPercentV2}
                />
              )}
              {binaryV3Stats && (
                <URLDisplay
                  label="BINARY_V3"
                  size={binaryV3Stats.byteSize}
                  url={`https://voidpay.com/pay?b3=${binaryV3Stats.encoded}`}
                  color="#00ffaa"
                  savings={savingsPercentV3}
                />
              )}
            </div>
          </div>

          {/* Verification */}
          <div className="data-panel p-8">
            <div className="text-[10px] text-[#00ffaa] mb-6 tracking-widest">INTEGRITY_CHECK</div>
            <div className="flex flex-wrap gap-4">
              <VerifyButton
                label="VERIFY_V1"
                onClick={() => {
                  try {
                    const decoded = decodeBinary(binaryStats!.encoded);
                    const matches = JSON.stringify(decoded) === JSON.stringify(invoice);
                    alert(matches ? '✓ V1 DECODE_SUCCESS' : '✗ V1 DECODE_FAIL');
                  } catch (error) {
                    alert('✗ V1 ERROR: ' + (error as Error).message);
                  }
                }}
                disabled={!binaryStats}
                color="#00a8ff"
              />
              <VerifyButton
                label="VERIFY_V2"
                onClick={() => {
                  try {
                    const decoded = decodeBinaryV2(binaryV2Stats!.encoded);
                    const matches = JSON.stringify(decoded) === JSON.stringify(invoice);
                    alert(matches ? '✓ V2 DECODE_SUCCESS' : '✗ V2 DECODE_FAIL');
                  } catch (error) {
                    alert('✗ V2 ERROR: ' + (error as Error).message);
                  }
                }}
                disabled={!binaryV2Stats}
                color="#9370db"
              />
              <VerifyButton
                label="VERIFY_V3"
                onClick={() => {
                  try {
                    const decoded = decodeBinaryV3(binaryV3Stats!.encoded);
                    const matches = JSON.stringify(decoded) === JSON.stringify(invoice);
                    alert(matches ? '✓ V3 DECODE_SUCCESS' : '✗ V3 DECODE_FAIL');
                  } catch (error) {
                    alert('✗ V3 ERROR: ' + (error as Error).message);
                  }
                }}
                disabled={!binaryV3Stats}
                color="#00ffaa"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Sub-components
function MetricCard({
  label,
  value,
  unit,
  color,
  subtitle,
  delay = '',
  highlight = false
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  subtitle?: string;
  delay?: string;
  highlight?: boolean;
}) {
  const animatedValue = useAnimatedCounter(value);

  return (
    <div className={`data-panel p-6 metric-card ${delay} ${highlight ? 'border-2' : ''}`} style={{ borderColor: highlight ? color : undefined }}>
      <div className="text-[9px] text-gray-500 mb-3 tracking-widest">{label}</div>
      <div className="text-3xl font-bold mb-2 hex-display" style={{ color }}>
        {animatedValue.toLocaleString()}
      </div>
      <div className="text-[10px] text-gray-400 mb-2">{unit}</div>
      {subtitle && <div className="text-xs mt-3 pt-3 border-t border-gray-800" style={{ color }}>{subtitle}</div>}
    </div>
  );
}

function CompressionBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-3">
        <span className="text-gray-400">{label}</span>
        <span className="font-bold" style={{ color }}>{percent.toFixed(1)}%</span>
      </div>
      <div className="h-3 bg-black/50 border border-[#00ffaa]/20 overflow-hidden">
        <div
          className="h-full transition-all duration-1000 ease-out"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${color}, ${color}88)`
          }}
        />
      </div>
    </div>
  );
}

function MethodPanel({
  stats,
  showSteps,
  onToggleSteps,
  color,
  icon
}: {
  stats: CompressionStats;
  showSteps: boolean;
  onToggleSteps: () => void;
  color: string;
  icon: string;
}) {
  return (
    <div className="data-panel p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-[9px] text-gray-500 tracking-widest mb-2">{stats.method}</div>
          <div className="text-lg font-bold" style={{ color }}>
            {icon} {stats.version}
          </div>
        </div>
        <button
          onClick={onToggleSteps}
          className="text-xs px-3 py-2 border transition-colors"
          style={{
            borderColor: color,
            color: showSteps ? '#0a0e14' : color,
            backgroundColor: showSteps ? color : 'transparent'
          }}
        >
          {showSteps ? 'HIDE' : 'SHOW'}
        </button>
      </div>

      <div className="text-xs mb-4">
        <div className="text-gray-500 mb-2">ENCODED_PREVIEW</div>
        <div className="bg-black/50 p-3 border border-[#00ffaa]/10 overflow-hidden font-mono text-[10px] text-gray-400 break-all">
          {stats.encoded.substring(0, 80)}...
        </div>
      </div>

      {showSteps && (
        <div className="space-y-3 mt-6 pt-6 border-t border-[#00ffaa]/20">
          {stats.steps.map((step, idx) => (
            <div key={idx} className="text-xs">
              <div className="flex gap-2">
                <span className="text-[10px]" style={{ color }}>
                  [{step.step}]
                </span>
                <div className="flex-1">
                  <div className="text-gray-300">{step.description}</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">{step.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function URLDisplay({
  label,
  size,
  url,
  color,
  savings
}: {
  label: string;
  size: number;
  url: string;
  color: string;
  savings?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-gray-400">
          {label} <span className="font-bold" style={{ color }}>({size} bytes)</span>
        </div>
        {savings && (
          <div className="text-sm font-bold" style={{ color }}>
            -{savings}%
          </div>
        )}
      </div>
      <div
        className="bg-black/50 p-4 border text-[10px] font-mono break-all"
        style={{ borderColor: `${color}33` }}
      >
        <span className="text-gray-600">{url.substring(0, 30)}</span>
        <span style={{ color: `${color}88` }}>{url.substring(30)}</span>
      </div>
    </div>
  );
}

function VerifyButton({
  label,
  onClick,
  disabled,
  color
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-3 border text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
      style={{
        borderColor: color,
        color,
        background: 'transparent'
      }}
    >
      {label}
    </button>
  );
}

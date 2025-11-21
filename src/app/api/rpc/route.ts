import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { chainId, method, params } = body

    // Basic validation
    if (!chainId || !method) {
      return NextResponse.json({ error: 'Missing chainId or method' }, { status: 400 })
    }

    // Select RPC URL based on chainId (simplified logic for now)
    let rpcUrl = ''
    switch (chainId) {
      case 1: // Ethereum Mainnet
        rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_ETH_URL || ''
        break
      case 137: // Polygon
        rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_POLY_URL || ''
        break
      case 10: // Optimism
        rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_OPT_URL || ''
        break
      case 42161: // Arbitrum
        rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_ARB_URL || ''
        break
      default:
        return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 })
    }

    if (!rpcUrl) {
      return NextResponse.json({ error: 'RPC URL not configured' }, { status: 500 })
    }

    // Forward request to RPC provider
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('RPC Proxy Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

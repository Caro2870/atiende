import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Atiende — Tu negocio responde solo por WhatsApp, 24/7'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#080B09',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#25D366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
            }}
          >
            💬
          </div>
          <span style={{ color: '#E8EDE9', fontSize: 48, fontWeight: 800 }}>Atiende</span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            color: '#E8EDE9',
            fontSize: 62,
            fontWeight: 900,
            textAlign: 'center',
            lineHeight: 1.1,
            maxWidth: 900,
            marginBottom: 24,
          }}
        >
          Tu negocio responde solo las 24 horas
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            color: '#6B7A6C',
            fontSize: 28,
            textAlign: 'center',
            maxWidth: 700,
            marginBottom: 48,
          }}
        >
          Automatiza WhatsApp para negocios en Lima 🇵🇪
        </div>

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(37,211,102,0.1)',
            border: '1px solid rgba(37,211,102,0.3)',
            borderRadius: 100,
            padding: '12px 28px',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#25D366', display: 'flex' }} />
          <span style={{ color: '#25D366', fontSize: 22, fontWeight: 600 }}>
            Primer mes gratis · atiende.prittor.com
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}

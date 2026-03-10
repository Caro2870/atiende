'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ══════════════════════════════════════════════════════════════
// TYPES & CHATBOT DATA
// ══════════════════════════════════════════════════════════════

interface Message {
  id: string
  type: 'user' | 'bot'
  text: string
  time: string
}

interface Business {
  id: string
  name: string
  subtitle: string
  emoji: string
  triggers: { keywords: string[]; response: string }[]
  defaultResponse: string
  quickReplies: string[]
}

const businesses: Business[] = [
  {
    id: 'huarique',
    name: 'El Huarique',
    subtitle: 'Restaurante',
    emoji: '🍽️',
    triggers: [
      {
        keywords: ['horario', 'hora', 'abierto', 'abren', 'cierran'],
        response: '¡Hola! 🍽️ Estamos abiertos de lunes a sábado de 12pm a 10pm y domingos de 12pm a 8pm.',
      },
      {
        keywords: ['delivery', 'despacho', 'envío', 'envio', 'domicilio'],
        response:
          '¡Sí hacemos delivery! 🛵 Solo dentro de Miraflores y San Isidro. Pedido mínimo S/30. Tiempo estimado: 30-45 min.',
      },
      {
        keywords: ['carta', 'menu', 'menú', 'platos', 'comida'],
        response:
          'Nuestra carta incluye ceviche, lomo saltado, arroz con leche y más. Te la enviamos por aquí 👇 [carta-huarique.pdf]',
      },
      {
        keywords: ['reserva', 'reservar', 'mesa', 'reservación', 'reservacion'],
        response:
          'Para reservas escribe tu nombre, fecha, hora y número de personas. También puedes llamarnos al 987-654-321.',
      },
      {
        keywords: ['precio', 'cuánto', 'cuanto', 'costo', 'vale', 'cuesta'],
        response:
          'Nuestros platos van desde S/18 hasta S/45. El menú del día cuesta S/15 e incluye entrada, fondo y refresco.',
      },
      {
        keywords: ['ubicación', 'ubicacion', 'donde', 'dirección', 'direccion', 'llegar'],
        response: 'Estamos en Av. Reducto 1234, Miraflores 📍 A media cuadra del Parque Kennedy.',
      },
    ],
    defaultResponse:
      '¡Hola! Soy el asistente de El Huarique 🍽️ Puedo ayudarte con horarios, delivery, carta y reservas. ¿En qué te ayudo?',
    quickReplies: ['¿Cuál es el horario?', '¿Hacen delivery?', 'Ver la carta', '¿Dónde están?'],
  },
  {
    id: 'sanvida',
    name: 'Clínica SanVida',
    subtitle: 'Clínica',
    emoji: '🏥',
    triggers: [
      {
        keywords: ['cita', 'turno', 'agendar', 'consulta', 'reservar'],
        response:
          'Para agendar una cita, dinos: ¿qué especialidad necesitas? Tenemos medicina general, pediatría, ginecología y más.',
      },
      {
        keywords: ['horario', 'hora', 'atienden', 'abierto'],
        response: 'Atendemos de lunes a viernes de 8am a 8pm y sábados de 9am a 2pm. 🏥',
      },
      {
        keywords: ['precio', 'costo', 'tarifa', 'cuánto', 'cuanto', 'vale'],
        response:
          'Las consultas van desde S/60 (medicina general) hasta S/120 (especialidades). Aceptamos SIS y seguros privados.',
      },
      {
        keywords: ['ubicación', 'ubicacion', 'donde', 'dirección', 'direccion'],
        response: 'Estamos en Av. Javier Prado Este 2500, San Borja 📍 Frente al Jockey Plaza.',
      },
      {
        keywords: ['especialidades', 'doctores', 'médicos', 'medicos', 'servicios'],
        response:
          'Contamos con: Medicina General, Pediatría, Ginecología, Traumatología, Cardiología y más.',
      },
    ],
    defaultResponse:
      '¡Hola! Soy el asistente de Clínica SanVida 🏥 Puedo ayudarte a agendar citas, consultar precios y horarios. ¿En qué te puedo ayudar?',
    quickReplies: ['Agendar cita', '¿Qué especialidades?', '¿Cuánto es la consulta?', '¿Dónde están?'],
  },
  {
    id: 'belleza',
    name: 'Salón Belleza Lima',
    subtitle: 'Salón de belleza',
    emoji: '💇‍♀️',
    triggers: [
      {
        keywords: ['precio', 'costo', 'cuánto', 'cuanto', 'vale', 'cuesta', 'precios'],
        response:
          'Nuestros precios: Corte dama S/35, Corte caballero S/20, Tinte S/80-120, Keratina S/150, Manicure S/25, Pedicure S/30.',
      },
      {
        keywords: ['cita', 'turno', 'reservar', 'disponible', 'disponibilidad', 'agendar'],
        response:
          '¡Claro! Para reservar dinos tu nombre, el servicio que quieres y tu día/hora preferida 💅',
      },
      {
        keywords: ['horario', 'hora', 'abierto', 'abren', 'cierran'],
        response: 'Atendemos de martes a sábado de 9am a 7pm y domingos de 10am a 4pm. Lunes cerrado.',
      },
      {
        keywords: ['ubicación', 'ubicacion', 'donde', 'dirección', 'direccion'],
        response: 'Estamos en Av. Larco 456, Miraflores 📍 A dos cuadras de la Huaca Pucllana.',
      },
    ],
    defaultResponse:
      '¡Hola! Soy la asistente del Salón Belleza Lima 💇‍♀️ Puedo informarte sobre precios, disponibilidad y servicios. ¿Qué necesitas?',
    quickReplies: ['Ver precios', 'Reservar cita', '¿Cuál es el horario?', '¿Dónde están?'],
  },
]

function getBotResponse(business: Business, message: string): string {
  const lower = message.toLowerCase()
  for (const trigger of business.triggers) {
    if (trigger.keywords.some((kw) => lower.includes(kw))) return trigger.response
  }
  return business.defaultResponse
}

function getTime(): string {
  return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

// ══════════════════════════════════════════════════════════════
// SCROLL REVEAL HOOK
// ══════════════════════════════════════════════════════════════

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// ══════════════════════════════════════════════════════════════
// ICONS
// ══════════════════════════════════════════════════════════════

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ══════════════════════════════════════════════════════════════
// NAV
// ══════════════════════════════════════════════════════════════

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-bg/95 backdrop-blur-md border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <WhatsAppIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-text">Atiende</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[
            ['#como-funciona', 'Cómo funciona'],
            ['#demo', 'Demo'],
            ['#precios', 'Precios'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="text-muted hover:text-text transition-colors text-sm">
              {label}
            </a>
          ))}
        </div>
        <a
          href="https://wa.me/51920236307"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
        >
          Empezar gratis
        </a>
      </div>
    </nav>
  )
}

// ══════════════════════════════════════════════════════════════
// PHONE MOCKUP (hero decoration)
// ══════════════════════════════════════════════════════════════

function PhoneMockup() {
  const msgs = [
    { type: 'user', text: 'Hola, ¿hacen delivery?' },
    {
      type: 'bot',
      text: '¡Sí hacemos delivery! 🛵 Solo en Miraflores y San Isidro. Pedido mínimo S/30.',
    },
    { type: 'user', text: '¿Cuánto cuesta el menú?' },
    { type: 'bot', text: 'El menú del día es S/15 e incluye entrada, fondo y refresco. 🍽️' },
  ]

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div
        className="relative w-64 rounded-[36px] border border-white/10 overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(160deg, #1c1c1e 0%, #111 100%)',
          height: 510,
        }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#111] rounded-b-xl z-10" />

        <div className="h-full flex flex-col">
          {/* WA Header */}
          <div className="bg-[#075E54] pt-6 pb-2.5 px-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#128C7E] flex items-center justify-center text-lg">
              🍽️
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">El Huarique</p>
              <p className="text-green-300 text-xs">En línea</p>
            </div>
            <div className="ml-auto">
              <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 wa-chat-bg p-2.5 space-y-2 overflow-hidden">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] rounded-lg px-2.5 py-1.5 shadow-sm text-xs leading-relaxed ${
                    m.type === 'user'
                      ? 'bg-[#DCF8C6] text-gray-800 rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                  <span className="block text-right text-[9px] text-gray-400 mt-0.5">
                    {i < 2 ? '14:32' : '14:33'} {m.type === 'user' ? '✓✓' : ''}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex justify-start">
              <div className="bg-white rounded-lg rounded-bl-sm px-3 py-2.5 shadow-sm flex gap-1 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 typing-dot" />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 typing-dot" />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 typing-dot" />
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="bg-[#F0F0F0] px-2 py-2 flex items-center gap-2">
            <div className="flex-1 bg-white rounded-full px-3 py-1.5">
              <p className="text-gray-400 text-xs">Escribe un mensaje...</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// HERO
// ══════════════════════════════════════════════════════════════

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden hero-grain">
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-bg to-bg" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/4 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-sm font-medium">Para negocios en Lima 🇵🇪</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] leading-[1.02] mb-6 text-text">
            Tu negocio
            <br />
            <span className="text-gradient">responde solo</span>
            <br />
            las 24 horas
          </h1>

          <p className="text-muted text-lg leading-relaxed mb-10 max-w-lg">
            Automatiza los mensajes de WhatsApp de tu restaurante, clínica o salón. Nunca más
            pierdas un cliente por no responder a tiempo.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#demo"
              className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-4 rounded-2xl transition-all glow-hover inline-flex items-center gap-2.5"
            >
              Ver demo gratis
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            <a
              href="https://wa.me/51920236307"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-border hover:border-primary/40 text-text font-semibold px-8 py-4 rounded-2xl transition-all inline-flex items-center gap-2.5"
            >
              <WhatsAppIcon className="w-5 h-5 text-primary" />
              Contactar por WhatsApp
            </a>
          </div>

          <div className="flex items-center gap-4 mt-10">
            <div className="flex -space-x-2">
              {['MR', 'CV', 'LP'].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full bg-card border-2 border-bg flex items-center justify-center text-xs font-bold text-primary"
                >
                  {i}
                </div>
              ))}
            </div>
            <p className="text-muted text-sm">
              <span className="text-text font-semibold">+50 negocios</span> en Lima ya usan Atiende
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex justify-center lg:justify-end">
          <PhoneMockup />
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
// HOW IT WORKS
// ══════════════════════════════════════════════════════════════

function HowItWorks() {
  const steps = [
    {
      n: '01',
      emoji: '⚙️',
      title: 'Configuras las respuestas',
      desc: 'Defines las preguntas frecuentes: horarios, precios, ubicación, servicios. Sin código, en minutos.',
    },
    {
      n: '02',
      emoji: '💬',
      title: 'Tus clientes escriben',
      desc: 'Tus clientes te contactan por WhatsApp como siempre. No cambia nada para ellos.',
    },
    {
      n: '03',
      emoji: '⚡',
      title: 'Atiende responde solo',
      desc: 'Atiende detecta la pregunta y responde al instante, de día o de noche, sin que tú hagas nada.',
    },
  ]

  return (
    <section id="como-funciona" className="py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Así de simple</p>
          <h2 className="font-display font-black text-3xl lg:text-5xl text-text">Funciona en 3 pasos</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.15}s` }}>
              <div className="relative bg-card rounded-2xl p-8 border border-border hover:border-primary/30 transition-all group glow-hover h-full">
                <div className="absolute top-5 right-6 font-display font-black text-6xl text-border group-hover:text-primary/15 transition-colors select-none">
                  {s.n}
                </div>
                <div className="text-4xl mb-5">{s.emoji}</div>
                <h3 className="font-display font-bold text-xl text-text mb-3">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
// INDUSTRIES
// ══════════════════════════════════════════════════════════════

function Industries() {
  const items = [
    { emoji: '🍽️', name: 'Restaurantes', desc: 'Horarios, delivery, carta y reservas. Sin llamadas, sin demoras.' },
    { emoji: '🏥', name: 'Clínicas', desc: 'Citas, especialidades, precios y horarios. Atención automática 24/7.' },
    { emoji: '💇‍♀️', name: 'Salones', desc: 'Reservas, precios y disponibilidad. Siempre disponible, nunca pierdas una cita.' },
    { emoji: '🔧', name: 'Ferreterías', desc: 'Inventario, precios, horarios y cotizaciones. Respuestas al instante.' },
  ]

  return (
    <section className="py-24 bg-bg">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Casos de uso</p>
          <h2 className="font-display font-black text-3xl lg:text-5xl text-text">Para cualquier negocio</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item, i) => (
            <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all text-center group h-full">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">
                  {item.emoji}
                </div>
                <h3 className="font-display font-bold text-lg text-text mb-2">{item.name}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
// CHAT DEMO
// ══════════════════════════════════════════════════════════════

function ChatDemo() {
  const [selected, setSelected] = useState<Business>(businesses[0])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([{ id: '0', type: 'bot', text: selected.defaultResponse, time: getTime() }])
  }, [selected])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, typing])

  const send = useCallback(
    async (text: string) => {
      if (!text.trim()) return
      setMessages((prev) => [...prev, { id: Date.now().toString(), type: 'user', text: text.trim(), time: getTime() }])
      setInput('')
      setTyping(true)
      await new Promise((r) => setTimeout(r, 900 + Math.random() * 700))
      setTyping(false)
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'bot', text: getBotResponse(selected, text), time: getTime() },
      ])
    },
    [selected]
  )

  return (
    <section id="demo" className="py-24 bg-surface overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12 reveal">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Demo interactivo</p>
          <h2 className="font-display font-black text-3xl lg:text-5xl text-text mb-4">Pruébalo ahora mismo</h2>
          <p className="text-muted max-w-xl mx-auto">
            Escribe como si fueras un cliente. Cambia de negocio para ver cómo Atiende se adapta a cada uno.
          </p>
        </div>

        {/* Business selector */}
        <div className="flex flex-wrap gap-3 justify-center mb-10 reveal">
          {businesses.map((biz) => (
            <button
              key={biz.id}
              onClick={() => setSelected(biz)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${
                selected.id === biz.id
                  ? 'bg-primary/10 border-primary/50 text-primary'
                  : 'border-border text-muted hover:border-primary/30 hover:text-text'
              }`}
            >
              <span>{biz.emoji}</span>
              <span>{biz.name}</span>
            </button>
          ))}
        </div>

        {/* WhatsApp widget */}
        <div className="max-w-sm mx-auto reveal">
          <div
            className="rounded-3xl overflow-hidden shadow-2xl border border-white/8"
            style={{ height: 580, display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <button className="text-white/70 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-9 h-9 rounded-full bg-[#128C7E] flex items-center justify-center text-xl flex-shrink-0">
                {selected.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold leading-tight truncate">{selected.name}</p>
                <p className="text-green-300 text-xs">{selected.subtitle} · En línea</p>
              </div>
              <svg className="w-5 h-5 text-white/60 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2 wa-chat-bg chat-scroll">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] rounded-lg px-3 py-2 shadow-sm ${
                      msg.type === 'user'
                        ? 'bg-[#DCF8C6] text-gray-800 rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-[10px] mt-0.5 ${msg.type === 'user' ? 'text-right text-gray-500' : 'text-gray-400'}`}>
                      {msg.time}
                      {msg.type === 'user' ? ' ✓✓' : ''}
                    </p>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg rounded-bl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400 typing-dot" />
                    <div className="w-2 h-2 rounded-full bg-gray-400 typing-dot" />
                    <div className="w-2 h-2 rounded-full bg-gray-400 typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick replies */}
            <div className="bg-[#ECE5DD] px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
              {selected.quickReplies.map((r, i) => (
                <button
                  key={i}
                  onClick={() => send(r)}
                  className="flex-shrink-0 bg-white text-[#128C7E] text-xs px-3 py-1.5 rounded-full border border-[#128C7E]/25 hover:bg-[#128C7E]/10 transition-colors whitespace-nowrap font-medium"
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input) }}
              className="bg-[#F0F0F0] px-3 py-2.5 flex items-center gap-2 flex-shrink-0"
            >
              <div className="flex-1 bg-white rounded-full px-4 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="w-full bg-transparent text-gray-700 text-sm outline-none placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full bg-[#128C7E] hover:bg-[#075E54] disabled:bg-gray-300 transition-colors flex items-center justify-center flex-shrink-0"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </div>
          <p className="text-center text-muted text-xs mt-4">
            🤖 Demo simulado — así responderá tu bot real
          </p>
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
// PRICING
// ══════════════════════════════════════════════════════════════

function Pricing() {
  const plans = [
    {
      name: 'Básico',
      price: 89,
      highlighted: false,
      features: ['1 número de WhatsApp', 'Respuestas ilimitadas', 'Hasta 500 mensajes/mes', 'Soporte por email'],
    },
    {
      name: 'Profesional',
      price: 149,
      highlighted: true,
      features: [
        '3 números de WhatsApp',
        'Hasta 2,000 mensajes/mes',
        'Reportes y estadísticas',
        'Soporte prioritario',
        'Personalización avanzada',
      ],
    },
    {
      name: 'Empresarial',
      price: 299,
      highlighted: false,
      features: [
        'Números ilimitados',
        'Mensajes ilimitados',
        'Reportes avanzados',
        'Soporte dedicado 24/7',
        'Integración personalizada',
        'Capacitación incluida',
      ],
    },
  ]

  return (
    <section id="precios" className="py-24 bg-bg">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Planes</p>
          <h2 className="font-display font-black text-3xl lg:text-5xl text-text mb-5">
            Precio claro, sin sorpresas
          </h2>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2">
            <span className="text-primary text-sm font-semibold">🎉 Primer mes gratis en todos los planes</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.15}s` }}>
              <div
                className={`relative rounded-2xl p-8 border transition-all h-full flex flex-col ${
                  p.highlighted ? 'bg-primary/5 border-primary/50 glow' : 'bg-card border-border hover:border-primary/30'
                }`}
              >
                {p.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                    MÁS POPULAR
                  </div>
                )}
                <div className="mb-7">
                  <h3 className="font-display font-bold text-xl text-text mb-3">{p.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-muted font-semibold">S/</span>
                    <span className="font-display font-black text-5xl text-text">{p.price}</span>
                    <span className="text-muted text-sm">/mes</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-text">{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="https://wa.me/51920236307"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    p.highlighted
                      ? 'bg-primary hover:bg-primary-dark text-white glow-hover'
                      : 'border border-border hover:border-primary/50 text-text hover:text-primary'
                  }`}
                >
                  Empezar gratis
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
// TESTIMONIALS
// ══════════════════════════════════════════════════════════════

function Testimonials() {
  const items = [
    {
      name: 'María Rosa Quispe',
      role: 'Dueña, Restaurante El Rincón Criollo',
      avatar: 'MR',
      text: 'Antes perdía clientes porque no podía responder mientras cocinaba. Ahora Atiende responde solo y mis pedidos de delivery aumentaron 40%.',
    },
    {
      name: 'Carlos Vega Mendoza',
      role: 'Administrador, Clínica Familiar Vega',
      avatar: 'CV',
      text: 'Nuestros pacientes preguntan horarios y precios todo el día. Atiende responde al instante y nos ahorra horas de trabajo cada semana.',
    },
    {
      name: 'Luciana Paredes',
      role: 'Propietaria, Salón Glamour Miraflores',
      avatar: 'LP',
      text: 'Lo mejor es que funciona de noche también. Muchas clientas reservan después de las 9pm y antes se perdían esas citas. Ahora no.',
    },
  ]

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Testimonios</p>
          <h2 className="font-display font-black text-3xl lg:text-5xl text-text">
            Negocios que ya automatizan
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.15}s` }}>
              <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/30 transition-all h-full flex flex-col">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted leading-relaxed text-sm flex-1 mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-text font-semibold text-sm">{t.name}</p>
                    <p className="text-muted text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
// FINAL CTA
// ══════════════════════════════════════════════════════════════

function FinalCTA() {
  return (
    <section className="py-32 bg-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-primary/5 to-bg" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl" />
      <div className="relative max-w-3xl mx-auto px-6 text-center reveal">
        <h2 className="font-display font-black text-3xl lg:text-6xl text-text mb-6 leading-tight">
          ¿Listo para automatizar
          <br />
          <span className="text-gradient">tu WhatsApp?</span>
        </h2>
        <p className="text-muted text-lg mb-12 leading-relaxed">
          Únete a los negocios en Lima que ya responden solos.
          <br />
          Primer mes completamente gratis, sin tarjeta de crédito.
        </p>
        <a
          href="https://wa.me/51920236307"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-primary hover:bg-primary-dark text-white font-bold px-10 py-5 rounded-2xl text-lg transition-all glow-hover"
        >
          <WhatsAppIcon className="w-6 h-6" />
          Hablar con nosotros
        </a>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
// FOOTER
// ══════════════════════════════════════════════════════════════

function Footer() {
  return (
    <footer className="bg-surface border-t border-border py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <WhatsAppIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-text">Atiende</span>
          <span className="text-muted text-sm">· by Prittor</span>
        </div>
        <p className="text-muted text-sm">© 2025 Atiende · atiende.prittor.com</p>
        <a
          href="https://wa.me/51920236307"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
        >
          Contactar
        </a>
      </div>
    </footer>
  )
}

// ══════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════

export default function Page() {
  useScrollReveal()
  return (
    <>
      <Nav />
      <Hero />
      <HowItWorks />
      <Industries />
      <ChatDemo />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </>
  )
}

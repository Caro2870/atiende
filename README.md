# Atiende

Landing page para **Atiende**, un SaaS de automatización de WhatsApp para negocios en Lima, Perú.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Docker**

## Correr en local

```bash
docker compose up --build
```

Abre [http://localhost:3001](http://localhost:3001)

## Desarrollo sin Docker

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Build para producción

```bash
npm run build
npm start
```

## Estructura

```
app/
├── page.tsx              # Landing completa (hero, demo, precios, etc.)
├── layout.tsx            # Metadata SEO, fuentes
├── globals.css           # Estilos base y animaciones
├── opengraph-image.tsx   # Imagen OG generada automáticamente
├── sitemap.ts            # Sitemap para Google
└── robots.ts             # robots.txt
```

## Demo interactivo

El chatbot simulado en la sección demo usa respuestas predefinidas en `app/page.tsx` (array `businesses`). Para agregar un nuevo negocio o modificar respuestas, edita ese array.

## Deploy

El proyecto incluye `Dockerfile` y `docker-compose.yml`. Para desplegarlo en tu servidor:

```bash
git pull
docker compose up --build -d
```

## Contacto

WhatsApp: [+51 920 236 307](https://wa.me/51920236307)
Dominio: [atiende.prittor.com](https://atiende.prittor.com)

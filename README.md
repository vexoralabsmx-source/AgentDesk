# AgentDesk

AgentDesk es una plataforma web SaaS con Next.js, TypeScript, Tailwind CSS y Supabase para conectar API keys propias de OpenAI, Gemini y Claude, crear agentes, activar skills y ejecutar tareas en modos single, parallel, debate y router.

## Configuracion local

1. Instala dependencias:

```bash
npm install
```

2. Crea `.env.local` usando `.env.example`.

3. En Supabase, ejecuta el SQL de `supabase/schema.sql`.

4. Inicia la web:

```bash
npm run dev
```

## Variables de entorno

- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon public key de Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: solo para tareas administrativas futuras; no se usa en frontend.
- `ENCRYPTION_SECRET`: secreto largo para cifrar API keys. Usa al menos 32 caracteres.
- `DEFAULT_DAILY_TASK_LIMIT`: limite diario basico por usuario.

## Deploy

### Vercel

1. Conecta el repositorio.
2. Agrega las variables de entorno.
3. Ejecuta `supabase/schema.sql` en Supabase.
4. Deploy con build command `npm run build`.

### Netlify

1. Conecta el repositorio.
2. Usa build command `npm run build`.
3. Publish directory: `.next`.
4. Agrega el runtime/plugin de Next si Netlify lo solicita.

## Seguridad

- Las API keys nunca viajan al navegador despues de guardarse.
- El vault muestra solo provider, hint y fecha.
- Las keys se cifran con AES-256-GCM antes de guardarse.
- Las rutas API validan sesion y ownership con Supabase RLS.
- Los modos parallel y debate piden confirmacion en UI antes de ejecutar.

# AgentDesk

AgentDesk es una plataforma web SaaS con Next.js, TypeScript, Tailwind CSS y Supabase para trabajar con agentes de IA, comparar proveedores y ejecutar tareas con OpenAI, Claude y Gemini desde un dashboard seguro.

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
- `OPENAI_API_KEY`: key privada de OpenAI para `/api/chat`.
- `ANTHROPIC_API_KEY`: key privada de Anthropic Claude para `/api/chat`.
- `GEMINI_API_KEY`: key privada de Google Gemini para `/api/chat`.

Ejemplo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...
ENCRYPTION_SECRET=agentdesk_clave_larga_privada_de_32_chars_minimo
DEFAULT_DAILY_TASK_LIMIT=25
OPENAI_API_KEY=tu_openai_api_key
ANTHROPIC_API_KEY=tu_anthropic_api_key
GEMINI_API_KEY=tu_gemini_api_key
```

Nunca subas `.env` o `.env.local` al repositorio. Ya estan ignorados en `.gitignore`.

## Providers

La ruta `/api/chat` ejecuta llamadas a modelos desde backend usando:

- OpenAI: `gpt-4o-mini`
- Claude: `claude-3-5-haiku-latest`
- Gemini: `gemini-1.5-flash`

Tambien existe el flujo original de API Vault, donde cada usuario puede guardar sus propias keys cifradas para el Task Runner avanzado.

## Agentes incluidos

Los agentes base viven en `src/config/agents.ts`:

- Atlas Director: orquestador principal.
- Nova Coder: desarrollo full-stack.
- Pixel Architect: UI/UX.
- Shield Guard: seguridad.
- Hype Writer: copywriting y marketing.
- Flow Builder: automatizaciones.
- Discord Operator: servidores Discord.

## Modos de trabajo

- Individual: usa un provider y un agente.
- Comparar: manda el mismo prompt a OpenAI, Claude y Gemini.
- Equipo: varios agentes responden y Atlas Director consolida.
- Debate: una IA propone, otra critica y otra mejora.

## Endpoint principal

`POST /api/chat`

Body:

```json
{
  "message": "Crea una landing premium para...",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "agentId": "atlas-director",
  "mode": "individual",
  "selectedAgents": ["nova-coder", "pixel-architect", "shield-guard"]
}
```

Respuesta:

```json
{
  "answer": "...",
  "providerUsed": "openai",
  "modelUsed": "gpt-4o-mini",
  "agentUsed": "Atlas Director",
  "mode": "individual",
  "results": []
}
```

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
- `/api/chat` usa solo keys del servidor y valida sesion, provider, agente, modo y longitud del mensaje.
- Hay rate limit basico en memoria para evitar abuso accidental.

## Proximos pasos recomendados

- Migrar historial local del Chat Workspace a Supabase.
- Agregar cuotas por plan y dashboard de consumo por provider.
- Permitir modelos personalizados por workspace.
- Agregar streaming de respuestas.
- Agregar observabilidad de errores por provider.

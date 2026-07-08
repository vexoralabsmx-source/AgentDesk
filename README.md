# AgentDesk

AgentDesk es una plataforma web SaaS con Next.js, TypeScript, Tailwind CSS y Supabase para trabajar con agentes de IA, comparar proveedores y ejecutar tareas con OpenAI y Gemini desde un dashboard seguro.

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
- `OPENAI_API_KEY`: fallback privado de OpenAI.
- `GEMINI_API_KEY`: fallback privado de Google Gemini.
- `PRO_OPENAI_API_KEY`: key privada de OpenAI para usuarios Pro.
- `PRO_GEMINI_API_KEY`: key privada de Gemini para usuarios Pro.

Ejemplo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...
ENCRYPTION_SECRET=agentdesk_clave_larga_privada_de_32_chars_minimo
DEFAULT_DAILY_TASK_LIMIT=25
OPENAI_API_KEY=tu_openai_api_key
GEMINI_API_KEY=tu_gemini_api_key
PRO_OPENAI_API_KEY=tu_openai_key_para_pro
PRO_GEMINI_API_KEY=tu_gemini_key_para_pro
```

Nunca subas `.env` o `.env.local` al repositorio. Ya estan ignorados en `.gitignore`.

## Providers

La ruta `/api/chat` ejecuta llamadas a modelos desde backend usando:

- OpenAI: `gpt-4o-mini`, `gpt-4o`, `gpt-4.1`, `gpt-4.1-mini`, `gpt-4.1-nano`, `o4-mini`, `o3-mini`
- Gemini: `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash`, `gemini-2.0-flash-lite`, `gemini-2.5-flash`, `gemini-2.5-pro`

En plan Free, el usuario usa sus propias keys cifradas desde API Vault. En plan Pro, la app usa las keys privadas del servidor (`PRO_OPENAI_API_KEY` y `PRO_GEMINI_API_KEY`) sin exponerlas al navegador.

## Planes y admin

- Free: funciona con las API keys propias del usuario en API Vault.
- Pro: activa keys predeterminadas del servidor y mayor limite diario.
- Compra Pro: escribir a `vexoralabsmx@gmail.com`.
- Panel admin: `/dashboard/admin`, visible para `vexoralabsmx@gmail.com`.
- Las llaves Pro se crean desde el panel admin y solo sirven una vez.

## Agentes incluidos

Los agentes base viven en `src/config/agents.ts`:

- Atlas Director: orquestador principal.
- Nova Coder: desarrollo full-stack.
- Pixel Architect: UI/UX.
- Shield Guard: seguridad.
- Hype Writer: copywriting y marketing.
- Flow Builder: automatizaciones.
- Discord Operator: servidores Discord.
- Ops Commander: estrategia operativa.
- Growth Analyst: crecimiento y conversion.
- Data Scout: datos e insights.

## Modos de trabajo

- Individual: usa un provider y un agente.
- Comparar: manda el mismo prompt a OpenAI y Gemini.
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

## Seguridad

- Las API keys nunca viajan al navegador despues de guardarse.
- El vault muestra solo provider, hint y fecha.
- Las keys se cifran con AES-256-GCM antes de guardarse.
- Las rutas API validan sesion y ownership con Supabase RLS.
- Los modos parallel y debate piden confirmacion en UI antes de ejecutar.
- `/api/chat` usa keys del plan: Free toma API Vault; Pro toma keys privadas del servidor.
- Valida sesion, provider, agente, modo y longitud del mensaje.
- Hay rate limit basico en memoria para evitar abuso accidental.

## Proximos pasos recomendados

- Migrar historial local del Chat Workspace a Supabase.
- Agregar cuotas por plan y dashboard de consumo por provider.
- Permitir modelos personalizados por workspace.
- Agregar streaming de respuestas.
- Agregar observabilidad de errores por provider.

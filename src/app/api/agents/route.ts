import { providers, type Provider } from "@/lib/ai/types";
import { skillCatalog } from "@/lib/skills/catalog";
import { json, readJson, requireUser } from "@/lib/api/http";

type AgentBody = {
  id?: string;
  name: string;
  role: string;
  description: string;
  basePrompt: string;
  favoriteProvider: Provider;
  model: string;
  activeSkills: string[];
};

export async function GET() {
  const { supabase, user, response } = await requireUser();
  if (response || !user) return response;

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return json({ error: error.message }, { status: 500 });
  return json({ agents: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response || !user) return response;

  let body: AgentBody;
  try {
    body = await readJson<AgentBody>(request);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Solicitud invalida" }, { status: 400 });
  }

  if (!body.name?.trim() || !body.role?.trim() || !body.basePrompt?.trim()) {
    return json({ error: "Nombre, rol y prompt base son requeridos" }, { status: 400 });
  }

  if (!providers.includes(body.favoriteProvider)) {
    return json({ error: "Provider favorito invalido" }, { status: 400 });
  }

  const validSkillIds = new Set(skillCatalog.map((skill) => skill.id));
  const activeSkills = (body.activeSkills ?? []).filter((skillId) => validSkillIds.has(skillId));

  const payload = {
    user_id: user.id,
    name: body.name.trim(),
    role: body.role.trim(),
    description: body.description?.trim() ?? "",
    base_prompt: body.basePrompt.trim(),
    favorite_provider: body.favoriteProvider,
    model: body.model?.trim() ?? "",
    active_skills: activeSkills
  };

  const query = body.id
    ? supabase.from("agents").update(payload).eq("id", body.id).eq("user_id", user.id).select("*").single()
    : supabase.from("agents").insert(payload).select("*").single();

  const { data, error } = await query;
  if (error) return json({ error: error.message }, { status: 500 });

  return json({ agent: data });
}

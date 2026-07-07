import { skillCatalog } from "@/lib/skills/catalog";
import { json, readJson, requireUser } from "@/lib/api/http";

type SkillBody = {
  skillId: string;
  enabled: boolean;
};

export async function GET() {
  const { supabase, user, response } = await requireUser();
  if (response || !user) return response;

  const { data, error } = await supabase
    .from("user_skill_settings")
    .select("skill_id, enabled")
    .eq("user_id", user.id);

  if (error) return json({ error: error.message }, { status: 500 });

  const settings = new Map((data ?? []).map((row: { skill_id: string; enabled: boolean }) => [row.skill_id, row.enabled]));
  const skills = skillCatalog.map((skill) => ({
    ...skill,
    enabled: settings.get(skill.id) ?? false
  }));

  return json({ skills });
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response || !user) return response;

  let body: SkillBody;
  try {
    body = await readJson<SkillBody>(request);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Solicitud invalida" }, { status: 400 });
  }

  if (!skillCatalog.some((skill) => skill.id === body.skillId)) {
    return json({ error: "Skill invalida" }, { status: 400 });
  }

  const { error } = await supabase.from("user_skill_settings").upsert(
    {
      user_id: user.id,
      skill_id: body.skillId,
      enabled: Boolean(body.enabled)
    },
    { onConflict: "user_id,skill_id" }
  );

  if (error) return json({ error: error.message }, { status: 500 });
  return json({ ok: true });
}

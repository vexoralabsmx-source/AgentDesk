export type Skill = {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
};

export const skillCatalog: Skill[] = [
  {
    id: "security-review",
    title: "Security Review",
    category: "Calidad",
    description: "Revisa permisos, secretos, sesiones y riesgos comunes.",
    prompt: "Actua como revisor de seguridad. Busca exposicion de secretos, permisos flojos, errores de autenticacion y recomendaciones practicas."
  },
  {
    id: "frontend-polish",
    title: "Frontend Polish",
    category: "Producto",
    description: "Mejora UX, responsive, jerarquia visual y microcopy.",
    prompt: "Actua como especialista UI/UX. Mejora claridad, accesibilidad, responsive, estados vacios y experiencia visual sin sobreingenieria."
  },
  {
    id: "api-architect",
    title: "API Architect",
    category: "Backend",
    description: "Disena endpoints, validaciones, errores y contratos limpios.",
    prompt: "Actua como arquitecto backend. Propone APIs claras, validacion server-side, errores utiles y separacion de responsabilidades."
  },
  {
    id: "copy-chief",
    title: "Copy Chief",
    category: "Growth",
    description: "Convierte ideas en textos claros, premium y orientados a conversion.",
    prompt: "Actua como copywriter senior. Escribe con claridad, precision y enfoque comercial sin sonar generico."
  },
  {
    id: "qa-release",
    title: "QA Release",
    category: "Deploy",
    description: "Crea checklist de pruebas, riesgos y pasos antes de publicar.",
    prompt: "Actua como QA engineer. Detecta rutas rotas, errores de build, accesibilidad, formularios, responsive y riesgos de deploy."
  }
];

export function getSkillsByIds(ids: string[]) {
  return skillCatalog.filter((skill) => ids.includes(skill.id));
}

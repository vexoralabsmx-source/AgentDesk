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
  },
  {
    id: "growth-audit",
    title: "Growth Audit",
    category: "Growth",
    description: "Analiza oferta, funnel, precios, objeciones y oportunidades de conversion.",
    prompt: "Actua como growth strategist. Evalua oferta, publico, funnel, pricing, objeciones, confianza y acciones concretas para mejorar conversion."
  },
  {
    id: "automation-map",
    title: "Automation Map",
    category: "Ops",
    description: "Convierte un proceso en pasos, triggers, webhooks y herramientas.",
    prompt: "Actua como arquitecto de automatizaciones. Disena flujos con triggers, acciones, datos necesarios, errores esperados y version MVP de bajo costo."
  },
  {
    id: "data-brief",
    title: "Data Brief",
    category: "Data",
    description: "Resume informacion en metricas, patrones, tablas e insights accionables.",
    prompt: "Actua como analista de datos. Extrae patrones, metricas, anomalias, preguntas abiertas y recomendaciones claras."
  },
  {
    id: "premium-prompting",
    title: "Premium Prompting",
    category: "AI",
    description: "Mejora prompts para agentes, sistemas multi-modelo y tareas complejas.",
    prompt: "Actua como prompt engineer senior. Refina instrucciones, contexto, criterios de exito, restricciones, formato de salida y pruebas de calidad."
  }
];

export function getSkillsByIds(ids: string[]) {
  return skillCatalog.filter((skill) => ids.includes(skill.id));
}

const STORAGE_KEY = "academic-crm.locale.v1";
const FALLBACK_LOCALE = "en";

export const localeCatalog = {
  en: {
    label: "English",
  },
  es: {
    label: "Español",
  },
};

const messages = {
  en: {
    "shell.brand.note": "Modular admissions workspace",
    "shell.tenant.label": "Company space",
    "shell.tenant.placeholder": "Tenant Brand",
    "shell.tenant.aria": "Tenant brand placeholder",
    "shell.search.aria": "Global search placeholder",
    "shell.search.placeholder": "Search applicants, modules, tasks",
    "shell.session.label": "Active session",
    "shell.session.role": "Admissions Analyst",
    "shell.session.actions": "Session actions",
    "shell.actions.hideModuleBar": "Hide module bar",
    "shell.actions.showModuleBar": "Show module bar",
    "shell.actions.loginAsAnotherUser": "Login as another user",
    "shell.actions.logout": "Logout",
    "nav.primary": "Primary navigation",
    "nav.overview": "Overview",
    "nav.configuration": "Configuration",
    "nav.applicants": "Applicants",
    "routes.overview.eyebrow": "Overview Module",
    "routes.overview.title": "Operational overview across admissions and advising.",
    "routes.overview.copy":
      "Use this shell as the landing layer. Configuration and Applicants now live as first-class modules with their own URLs and navigation state.",
    "routes.configuration.eyebrow": "Configuration Module",
    "routes.configuration.title": "Theme tokens, typography and visual defaults stay isolated.",
    "routes.configuration.copy":
      "This module owns palette, font selection, localization and runtime presentation rules so business areas inherit visual decisions instead of redefining them.",
    "routes.applicants.eyebrow": "Applicants Module",
    "routes.applicants.title": "Admissions queue, graph rules and applicant capture.",
    "routes.applicants.copy":
      "Applicants move through a configurable graph, not a fixed list. Stages, sub-stages and rule-based transitions shape the shell before we persist the model in endpoints and schema.",
    "configuration.kicker": "Configuration Module",
    "configuration.title": "Theme Tokens",
    "configuration.description":
      "Presets define the base direction. User overrides are stored locally so palette changes, color mode and locale can be tested before business modules exist.",
    "configuration.foundation.kicker": "Visual Foundation",
    "configuration.foundation.title":
      "Readable, configurable and institutional without looking generic.",
    "configuration.foundation.copy":
      "The design base now prioritizes semantic tokens, editorial hierarchy, localization and runtime theming. Business modules can inherit this layer without fixing brand colors or language inside each component.",
    "configuration.framework.summary":
      "Bootstrap and Tailwind stay out of the foundation layer so the visual language remains fully configurable at runtime.",
    "configuration.token.topDown": "Top-down UI first",
    "configuration.token.theme": "Runtime theme presets",
    "configuration.token.semantic": "Semantic color tokens",
    "configuration.palette.primary": "Primary",
    "configuration.palette.secondary": "Secondary",
    "configuration.palette.accent": "Accent",
    "configuration.specimen.display": "Display",
    "configuration.specimen.body": "Body",
    "configuration.specimen.data": "Data",
    "configuration.specimen.displaySample": "Admissions and advising with hierarchy.",
    "configuration.specimen.bodySample":
      "Use this layer for dense operational text, form labels and contextual help.",
    "configuration.specimen.dataSample": "Applicant score 91.0 - Task due 2026-04-07",
    "configuration.sample.primary": "Primary Action",
    "configuration.sample.secondary": "Secondary Action",
    "configuration.section.experience": "Experience",
    "configuration.language.label": "Language",
    "configuration.language.en": "English",
    "configuration.language.es": "Spanish",
    "configuration.mode.label": "Color mode",
    "configuration.mode.system": "System",
    "configuration.mode.light": "Light",
    "configuration.mode.dark": "Dark",
    "configuration.preset.label": "Theme preset",
    "configuration.preset.royalAcademic":
      "Violet, cobalt and restrained red over neutral silver support.",
    "configuration.preset.andesWarm": "Editorial, warm and grounded.",
    "configuration.preset.slateLibrary": "Cooler and more institutional.",
    "configuration.preset.campusSignal": "Brighter and more contemporary.",
    "configuration.typography.title": "Typography",
    "configuration.typography.display": "Display font",
    "configuration.typography.body": "Body font",
    "configuration.typography.mono": "Mono font",
    "configuration.color.title": "Color Tokens",
    "configuration.color.bg": "Background",
    "configuration.color.bgAlt": "Background Alt",
    "configuration.color.surface": "Surface",
    "configuration.color.text": "Text",
    "configuration.color.muted": "Muted",
    "configuration.color.line": "Line",
    "configuration.color.primary": "Primary",
    "configuration.color.secondary": "Secondary",
    "configuration.color.accent": "Accent",
    "configuration.actions.restoreDefaults": "Restore Defaults",
    "applicants.module.kicker": "Applicants Module",
    "applicants.module.title": "Admissions Pipeline",
    "applicants.actions.refresh": "Refresh",
    "applicants.controls.searchLabel": "Search applicants",
    "applicants.controls.searchPlaceholder": "Search by name, email or program",
    "applicants.controls.stageFilterLabel": "Filter by stage",
    "applicants.controls.statusFilterLabel": "Filter by status",
    "applicants.controls.allStageFamilies": "All stage families",
    "applicants.controls.allStatuses": "All statuses",
    "applicants.queue.title": "Applicant Queue",
    "applicants.capture.kicker": "Capture",
    "applicants.capture.title": "New applicant",
    "applicants.capture.fullName": "Full name",
    "applicants.capture.email": "Email",
    "applicants.capture.program": "Program",
    "applicants.capture.status": "Status",
    "applicants.capture.stage": "Stage",
    "applicants.capture.score": "Score",
    "applicants.capture.placeholder.fullName": "Laura Rios",
    "applicants.capture.placeholder.email": "laura.rios@example.edu",
    "applicants.capture.placeholder.program": "MBA",
    "applicants.capture.placeholder.stage": "Configure a stage node first",
    "applicants.capture.submit": "Create applicant",
    "applicants.pipeline.kicker": "Pipeline Graph",
    "applicants.pipeline.title": "Applicants Flow Studio",
    "applicants.pipeline.intro":
      "Applicants should not move through a fixed list. This view treats the pipeline as a graph with configurable stages, sub-stages and rule-based transitions.",
    "dashboard.tasks.kicker": "Advising",
    "dashboard.tasks.title": "Open tasks",
    "dashboard.dueDate": "due {date}",
    "dashboard.priority": "{priority} priority",
    "dashboard.task.status": "{status}",
    "dashboard.stat.applicants": "Applicants",
    "dashboard.stat.interviewsPending": "Interviews Pending",
    "dashboard.stat.offersReady": "Offers Ready",
    "dashboard.stat.openAdvisingTasks": "Open Advising Tasks",
    "applicants.summary.visible": "Visible Applicants",
    "applicants.summary.activeNodes": "Active Nodes",
    "applicants.summary.branchPoints": "Branch Points",
    "applicants.summary.configuredRules": "Configured Rules",
    "applicants.summary.scope.program": "{count} applicants in {program}",
    "applicants.summary.scope.global": "{count} total in current scope",
    "applicants.summary.nodesConfigured": "{count} configured in the graph",
    "applicants.summary.branchNodes": "Nodes with more than one outgoing rule",
    "applicants.summary.ruleLogic": "Reusable transition logic across the pipeline",
    "applicants.empty.noMatch.kicker": "No match",
    "applicants.empty.noMatch.title": "No applicants match the current filters.",
    "applicants.empty.noMatch.copy":
      "Adjust the search term or filter values to recover the broader list.",
    "applicants.spotlight.kicker": "Spotlight",
    "applicants.spotlight.emptyTitle": "Applicant focus",
    "applicants.spotlight.emptyCopy":
      "Select an applicant from the queue to inspect the current node, eligible next steps and incoming rules.",
    "applicants.spotlight.unmappedStage": "Unmapped stage",
    "applicants.spotlight.unmappedNodeCopy":
      "This applicant currently sits on a stage label that is not mapped in the graph yet.",
    "applicants.spotlight.nodeNeedsDescription":
      "This node exists in the graph but still needs a richer operational description.",
    "applicants.spotlight.stage": "Stage",
    "applicants.spotlight.stageFamily": "Stage Family",
    "applicants.spotlight.status": "Status",
    "applicants.spotlight.score": "Score",
    "applicants.spotlight.email": "Email",
    "applicants.spotlight.created": "Created",
    "applicants.spotlight.nextSteps": "Eligible Next Steps",
    "applicants.spotlight.arriveFrom": "Can Arrive From",
    "applicants.empty.graph.kicker": "Graph empty",
    "applicants.empty.graph.title": "No pipeline nodes are configured.",
    "applicants.empty.graph.copy":
      "Add at least one top-level stage in the studio to define how applicants move.",
    "pipeline.preview.kicker": "Graph Preview",
    "pipeline.preview.title": "Applicant Flow Map",
    "pipeline.preview.copy":
      "This view emphasizes how stage families branch, converge and loop back. The SVG map is a quick structural read; use each stage toggle inside the canvas to reveal sub-stages and the accordions below for the detailed rule inventory.",
    "pipeline.preview.scope.program":
      "Viewing the {program} flow version and applicants scoped to that program.",
    "pipeline.preview.scope.global": "Viewing the global default flow version across all programs.",
    "pipeline.preview.flowVersion": "Flow Version",
    "pipeline.preview.ariaLabel": "Applicants pipeline graph map",
    "pipeline.preview.topLevelStage": "Top-level stage",
    "pipeline.preview.subStage": "Sub-stage",
    "pipeline.preview.badgeApplicants": "Badge = active applicants",
    "pipeline.preview.stageMeta": "STAGE",
    "pipeline.preview.primaryNode": "Primary node",
    "pipeline.preview.showSubstages": "Show sub-stages",
    "pipeline.preview.hideSubstages": "Hide sub-stages",
    "pipeline.preview.expandCount": "expand {count}",
    "pipeline.preview.substageCount": "{count} sub-stages",
    "pipeline.preview.rulesCount": "{count} rules",
    "pipeline.family.title": "Stage family",
    "pipeline.family.noDescription": "No description yet for this stage family.",
    "pipeline.family.noSubstages": "This stage family has no sub-stages yet.",
    "pipeline.node.noDescription": "No description yet for this node.",
    "pipeline.node.routesOut": "Routes Out",
    "pipeline.node.routesIn": "Routes In",
    "pipeline.node.outCount": "{count} out",
    "pipeline.node.inCount": "{count} in",
    "pipeline.node.activeCount": "{count} active",
    "pipeline.node.noOutgoing": "No outgoing rules yet.",
    "pipeline.node.noInbound": "No inbound rules yet.",
    "pipeline.studio.emptyGraph.kicker": "No graph yet",
    "pipeline.studio.emptyGraph.title": "Add the first stage family.",
    "pipeline.studio.emptyGraph.copy":
      "Start with a top-level stage, then add sub-stages and transition rules.",
    "pipeline.studio.emptyRules.kicker": "No rules yet",
    "pipeline.studio.emptyRules.title": "Add the first transition rule.",
    "pipeline.studio.emptyRules.copy":
      "Rules define when applicants branch, advance, loop back or converge.",
    "pipeline.studio.title": "Pipeline Studio",
    "pipeline.studio.editTitle": "Edit graph configuration",
    "pipeline.studio.editCopy":
      "Full-width editing panel for stages, sub-stages and transition rules. Collapse it when you want to focus only on the flow view.",
    "pipeline.studio.graphConfiguration": "Graph configuration",
    "pipeline.studio.resetAllVersions": "Reset all versions",
    "pipeline.studio.graphCopy":
      "The pipeline is modeled as a graph. Stages, sub-stages and rule-based transitions can branch, converge or move backward without forcing a linear order, and each program can own its own version.",
    "pipeline.studio.version.program":
      "You are editing the program-specific version for {program}.",
    "pipeline.studio.version.global":
      "You are editing the global default flow that programs can clone and specialize.",
    "pipeline.studio.flowVersions": "Flow Versions",
    "pipeline.studio.createProgramVersion": "Create Program Version",
    "pipeline.studio.programName": "Program name",
    "pipeline.studio.cloneFrom": "Clone from",
    "pipeline.studio.createVersion": "Create version",
    "pipeline.studio.addStageNode": "Add Stage Node",
    "pipeline.studio.label": "Label",
    "pipeline.studio.placeholder.nodeLabel": "Scholarship Review",
    "pipeline.studio.nodeType": "Node type",
    "pipeline.studio.parentStage": "Parent stage",
    "pipeline.studio.chooseParentStage": "Choose a parent stage",
    "pipeline.studio.description": "Description",
    "pipeline.studio.placeholder.description": "Operational context for this node",
    "pipeline.studio.addNode": "Add node",
    "pipeline.studio.addRule": "Add Rule",
    "pipeline.studio.ruleLabel": "Rule label",
    "pipeline.studio.placeholder.ruleLabel": "Escalate to committee",
    "pipeline.studio.sourceNode": "Source node",
    "pipeline.studio.destinationNode": "Destination node",
    "pipeline.studio.chooseSourceNode": "Choose the source node",
    "pipeline.studio.chooseDestinationNode": "Choose the destination node",
    "pipeline.studio.direction": "Direction",
    "pipeline.studio.condition": "Condition",
    "pipeline.studio.placeholder.condition": "Explain the decision rule or trigger",
    "pipeline.studio.addRuleAction": "Add rule",
    "pipeline.studio.stageFamilies": "Stage Families",
    "pipeline.studio.transitionRules": "Transition Rules",
    "pipeline.studio.globalDefault": "Global default",
    "pipeline.studio.programVersion": "Program version",
    "pipeline.studio.statsSummary": "{stages} stages / {rules} rules / {nodes} nodes",
    "pipeline.messages.default":
      "Configure the graph and the rest of the module will inherit it.",
    "pipeline.messages.programCreated": "Program-specific flow version created.",
    "pipeline.messages.nodeAdded": "Pipeline node added.",
    "pipeline.messages.ruleAdded": "Transition rule added.",
    "pipeline.messages.graphReset": "Pipeline graph reset to the default preset.",
    "pipeline.messages.versionChanged": "Flow version changed.",
    "pipeline.messages.nodeRemoved": "Pipeline node removed.",
    "pipeline.messages.ruleRemoved": "Transition rule removed.",
    "pipeline.errors.programNameTooShort": "Program name must be at least 2 characters.",
    "pipeline.errors.programExists": "That program already has a specific flow version.",
    "pipeline.errors.stageLabelTooShort": "Stage label must be at least 2 characters.",
    "pipeline.errors.invalidNodeKind":
      "Choose whether the new node is a stage or a sub-stage.",
    "pipeline.errors.duplicateStageLabel":
      "Stage labels must stay unique because they are used across the module.",
    "pipeline.errors.invalidSubstageParent":
      "Sub-stages must point to an existing top-level stage.",
    "pipeline.errors.ruleNeedsEndpoints":
      "A rule needs both source and destination nodes.",
    "pipeline.errors.ruleSameDestination":
      "Rules must point to a different destination node.",
    "pipeline.errors.ruleSourceMissing": "The selected source node no longer exists.",
    "pipeline.errors.ruleDestinationMissing":
      "The selected destination node no longer exists.",
    "pipeline.errors.ruleLabelTooShort": "Rule label must be at least 2 characters.",
    "pipeline.errors.ruleConditionTooShort":
      "Describe the rule condition with a bit more detail.",
    "pipeline.errors.invalidDirection": "Choose a valid transition direction.",
    "pipeline.errors.duplicateRule":
      "A rule with the same source, destination and label already exists.",
    "pipeline.actions.remove": "Remove",
    "pipeline.status.active": "{count} active",
    "pipeline.status.nodes": "{count} nodes",
    "pipeline.status.rules": "{count} rules",
    "pipeline.domain.stage": "Stage",
    "pipeline.domain.substage": "Sub-stage",
    "pipeline.direction.forward": "Forward",
    "pipeline.direction.branch": "Branch",
    "pipeline.direction.backward": "Backward",
    "pipeline.direction.lateral": "Lateral",
    "domain.applicantStatus.inReview": "In Review",
    "domain.applicantStatus.offerReady": "Offer Ready",
    "domain.applicantStatus.awaitingDocuments": "Awaiting Documents",
    "domain.taskStatus.open": "Open",
    "domain.taskStatus.inProgress": "In Progress",
    "domain.taskStatus.done": "Done",
    "domain.priority.high": "High",
    "domain.priority.medium": "Medium",
    "domain.priority.low": "Low",
    "app.status.savingApplicant": "Saving applicant...",
    "app.status.applicantCreated": "Applicant created.",
    "app.status.requestFailed": "Request failed.",
  },
  es: {
    "shell.brand.note": "Espacio modular de admisiones",
    "shell.tenant.label": "Espacio de empresa",
    "shell.tenant.placeholder": "Marca del cliente",
    "shell.tenant.aria": "Espacio reservado para la marca del cliente",
    "shell.search.aria": "Espacio de búsqueda global",
    "shell.search.placeholder": "Buscar aspirantes, módulos y tareas",
    "shell.session.label": "Sesión activa",
    "shell.session.role": "Analista de admisiones",
    "shell.session.actions": "Acciones de sesión",
    "shell.actions.hideModuleBar": "Ocultar barra de módulos",
    "shell.actions.showModuleBar": "Mostrar barra de módulos",
    "shell.actions.loginAsAnotherUser": "Ingresar con otro usuario",
    "shell.actions.logout": "Cerrar sesión",
    "nav.primary": "Navegación principal",
    "nav.overview": "Resumen",
    "nav.configuration": "Configuración",
    "nav.applicants": "Aspirantes",
    "routes.overview.eyebrow": "Módulo de resumen",
    "routes.overview.title": "Vista operativa de admisiones y acompañamiento.",
    "routes.overview.copy":
      "Usa este shell como capa de aterrizaje. Configuración y Aspirantes ahora viven como módulos de primera clase con URL y estado de navegación propios.",
    "routes.configuration.eyebrow": "Módulo de configuración",
    "routes.configuration.title":
      "Los tokens de tema, tipografía y defaults visuales quedan aislados.",
    "routes.configuration.copy":
      "Este módulo controla paleta, selección tipográfica, localización y reglas de presentación en runtime para que las áreas de negocio hereden decisiones visuales en lugar de redefinirlas.",
    "routes.applicants.eyebrow": "Módulo de aspirantes",
    "routes.applicants.title":
      "Cola de admisiones, reglas del grafo y captura de aspirantes.",
    "routes.applicants.copy":
      "Los aspirantes se mueven por un grafo configurable, no por una lista fija. Etapas, sub-etapas y transiciones por reglas dan forma al shell antes de persistir el modelo en endpoints y esquema.",
    "configuration.kicker": "Módulo de configuración",
    "configuration.title": "Tokens de tema",
    "configuration.description":
      "Los presets definen la dirección base. Las personalizaciones del usuario se guardan localmente para probar paleta, modo de color e idioma antes de que existan los módulos de negocio.",
    "configuration.foundation.kicker": "Base visual",
    "configuration.foundation.title":
      "Legible, configurable e institucional sin verse genérico.",
    "configuration.foundation.copy":
      "La base de diseño ahora prioriza tokens semánticos, jerarquía editorial, localización y tematización en runtime. Los módulos de negocio pueden heredar esta capa sin fijar colores ni idioma dentro de cada componente.",
    "configuration.framework.summary":
      "Bootstrap y Tailwind quedan fuera de la capa fundacional para que el lenguaje visual siga siendo completamente configurable en runtime.",
    "configuration.token.topDown": "UI top-down primero",
    "configuration.token.theme": "Presets de tema en runtime",
    "configuration.token.semantic": "Tokens semánticos de color",
    "configuration.palette.primary": "Primario",
    "configuration.palette.secondary": "Secundario",
    "configuration.palette.accent": "Acento",
    "configuration.specimen.display": "Display",
    "configuration.specimen.body": "Cuerpo",
    "configuration.specimen.data": "Datos",
    "configuration.specimen.displaySample": "Admisiones y acompañamiento con jerarquía.",
    "configuration.specimen.bodySample":
      "Usa esta capa para texto operativo denso, labels de formulario y ayuda contextual.",
    "configuration.specimen.dataSample":
      "Puntaje del aspirante 91.0 - Tarea vence 2026-04-07",
    "configuration.sample.primary": "Acción principal",
    "configuration.sample.secondary": "Acción secundaria",
    "configuration.section.experience": "Experiencia",
    "configuration.language.label": "Idioma",
    "configuration.language.en": "Inglés",
    "configuration.language.es": "Español",
    "configuration.mode.label": "Modo de color",
    "configuration.mode.system": "Sistema",
    "configuration.mode.light": "Claro",
    "configuration.mode.dark": "Oscuro",
    "configuration.preset.label": "Preset de tema",
    "configuration.preset.royalAcademic":
      "Violeta, azul cobalto y rojo contenido sobre soporte plata neutro.",
    "configuration.preset.andesWarm": "Editorial, cálido y aterrizado.",
    "configuration.preset.slateLibrary": "Más frío y más institucional.",
    "configuration.preset.campusSignal": "Más brillante y contemporáneo.",
    "configuration.typography.title": "Tipografía",
    "configuration.typography.display": "Fuente display",
    "configuration.typography.body": "Fuente de cuerpo",
    "configuration.typography.mono": "Fuente mono",
    "configuration.color.title": "Tokens de color",
    "configuration.color.bg": "Fondo",
    "configuration.color.bgAlt": "Fondo alterno",
    "configuration.color.surface": "Superficie",
    "configuration.color.text": "Texto",
    "configuration.color.muted": "Texto suave",
    "configuration.color.line": "Línea",
    "configuration.color.primary": "Primario",
    "configuration.color.secondary": "Secundario",
    "configuration.color.accent": "Acento",
    "configuration.actions.restoreDefaults": "Restaurar valores",
    "applicants.module.kicker": "Módulo de aspirantes",
    "applicants.module.title": "Pipeline de admisiones",
    "applicants.actions.refresh": "Actualizar",
    "applicants.controls.searchLabel": "Buscar aspirantes",
    "applicants.controls.searchPlaceholder": "Buscar por nombre, correo o programa",
    "applicants.controls.stageFilterLabel": "Filtrar por etapa",
    "applicants.controls.statusFilterLabel": "Filtrar por estado",
    "applicants.controls.allStageFamilies": "Todas las familias de etapa",
    "applicants.controls.allStatuses": "Todos los estados",
    "applicants.queue.title": "Cola de aspirantes",
    "applicants.capture.kicker": "Captura",
    "applicants.capture.title": "Nuevo aspirante",
    "applicants.capture.fullName": "Nombre completo",
    "applicants.capture.email": "Correo",
    "applicants.capture.program": "Programa",
    "applicants.capture.status": "Estado",
    "applicants.capture.stage": "Etapa",
    "applicants.capture.score": "Puntaje",
    "applicants.capture.placeholder.fullName": "Laura Rios",
    "applicants.capture.placeholder.email": "laura.rios@example.edu",
    "applicants.capture.placeholder.program": "MBA",
    "applicants.capture.placeholder.stage": "Configura primero un nodo de etapa",
    "applicants.capture.submit": "Crear aspirante",
    "applicants.pipeline.kicker": "Grafo del pipeline",
    "applicants.pipeline.title": "Studio del flujo de aspirantes",
    "applicants.pipeline.intro":
      "Los aspirantes no deberían moverse por una lista fija. Esta vista trata el pipeline como un grafo con etapas, sub-etapas y transiciones configurables por reglas.",
    "dashboard.tasks.kicker": "Acompañamiento",
    "dashboard.tasks.title": "Tareas abiertas",
    "dashboard.dueDate": "vence {date}",
    "dashboard.priority": "Prioridad {priority}",
    "dashboard.task.status": "{status}",
    "dashboard.stat.applicants": "Aspirantes",
    "dashboard.stat.interviewsPending": "Entrevistas pendientes",
    "dashboard.stat.offersReady": "Ofertas listas",
    "dashboard.stat.openAdvisingTasks": "Tareas abiertas de acompañamiento",
    "applicants.summary.visible": "Aspirantes visibles",
    "applicants.summary.activeNodes": "Nodos activos",
    "applicants.summary.branchPoints": "Puntos de bifurcación",
    "applicants.summary.configuredRules": "Reglas configuradas",
    "applicants.summary.scope.program": "{count} aspirantes en {program}",
    "applicants.summary.scope.global": "{count} totales en el alcance actual",
    "applicants.summary.nodesConfigured": "{count} configurados en el grafo",
    "applicants.summary.branchNodes": "Nodos con más de una regla de salida",
    "applicants.summary.ruleLogic": "Lógica de transición reutilizable en el pipeline",
    "applicants.empty.noMatch.kicker": "Sin coincidencias",
    "applicants.empty.noMatch.title": "Ningún aspirante coincide con los filtros actuales.",
    "applicants.empty.noMatch.copy":
      "Ajusta el término de búsqueda o los filtros para recuperar la lista completa.",
    "applicants.spotlight.kicker": "Foco",
    "applicants.spotlight.emptyTitle": "Detalle del aspirante",
    "applicants.spotlight.emptyCopy":
      "Selecciona un aspirante de la cola para revisar el nodo actual, los siguientes pasos posibles y las reglas de entrada.",
    "applicants.spotlight.unmappedStage": "Etapa sin mapear",
    "applicants.spotlight.unmappedNodeCopy":
      "Este aspirante está en una etiqueta de etapa que todavía no está mapeada en el grafo.",
    "applicants.spotlight.nodeNeedsDescription":
      "Este nodo existe en el grafo pero todavía necesita una descripción operativa más rica.",
    "applicants.spotlight.stage": "Etapa",
    "applicants.spotlight.stageFamily": "Familia de etapa",
    "applicants.spotlight.status": "Estado",
    "applicants.spotlight.score": "Puntaje",
    "applicants.spotlight.email": "Correo",
    "applicants.spotlight.created": "Creado",
    "applicants.spotlight.nextSteps": "Siguientes pasos elegibles",
    "applicants.spotlight.arriveFrom": "Puede llegar desde",
    "applicants.empty.graph.kicker": "Grafo vacío",
    "applicants.empty.graph.title": "No hay nodos configurados en el pipeline.",
    "applicants.empty.graph.copy":
      "Agrega al menos una etapa de nivel superior en el studio para definir cómo se mueven los aspirantes.",
    "pipeline.preview.kicker": "Vista del grafo",
    "pipeline.preview.title": "Mapa del flujo de aspirantes",
    "pipeline.preview.copy":
      "Esta vista enfatiza cómo las familias de etapas se bifurcan, convergen y retroceden. El mapa SVG da una lectura estructural rápida; usa el toggle de cada etapa dentro del canvas para revelar sub-etapas y los acordiones inferiores para revisar el inventario detallado de reglas.",
    "pipeline.preview.scope.program":
      "Viendo la versión del flujo de {program} y los aspirantes acotados a ese programa.",
    "pipeline.preview.scope.global":
      "Viendo la versión global por defecto del flujo para todos los programas.",
    "pipeline.preview.flowVersion": "Versión del flujo",
    "pipeline.preview.ariaLabel": "Mapa del grafo del flujo de aspirantes",
    "pipeline.preview.topLevelStage": "Etapa principal",
    "pipeline.preview.subStage": "Sub-etapa",
    "pipeline.preview.badgeApplicants": "Badge = aspirantes activos",
    "pipeline.preview.stageMeta": "ETAPA",
    "pipeline.preview.primaryNode": "Nodo principal",
    "pipeline.preview.showSubstages": "Mostrar sub-etapas",
    "pipeline.preview.hideSubstages": "Ocultar sub-etapas",
    "pipeline.preview.expandCount": "ver {count}",
    "pipeline.preview.substageCount": "{count} sub-etapas",
    "pipeline.preview.rulesCount": "{count} reglas",
    "pipeline.family.title": "Familia de etapa",
    "pipeline.family.noDescription": "Todavía no hay descripción para esta familia de etapa.",
    "pipeline.family.noSubstages": "Esta familia de etapa todavía no tiene sub-etapas.",
    "pipeline.node.noDescription": "Todavía no hay descripción para este nodo.",
    "pipeline.node.routesOut": "Rutas de salida",
    "pipeline.node.routesIn": "Rutas de entrada",
    "pipeline.node.outCount": "{count} salidas",
    "pipeline.node.inCount": "{count} entradas",
    "pipeline.node.activeCount": "{count} activos",
    "pipeline.node.noOutgoing": "Todavía no hay reglas de salida.",
    "pipeline.node.noInbound": "Todavía no hay reglas de entrada.",
    "pipeline.studio.emptyGraph.kicker": "Todavía no hay grafo",
    "pipeline.studio.emptyGraph.title": "Agrega la primera familia de etapa.",
    "pipeline.studio.emptyGraph.copy":
      "Empieza con una etapa de nivel superior y luego agrega sub-etapas y reglas de transición.",
    "pipeline.studio.emptyRules.kicker": "Todavía no hay reglas",
    "pipeline.studio.emptyRules.title": "Agrega la primera regla de transición.",
    "pipeline.studio.emptyRules.copy":
      "Las reglas definen cuándo los aspirantes se bifurcan, avanzan, retroceden o convergen.",
    "pipeline.studio.title": "Pipeline Studio",
    "pipeline.studio.editTitle": "Editar configuración del grafo",
    "pipeline.studio.editCopy":
      "Panel de edición de ancho completo para etapas, sub-etapas y reglas de transición. Colápsalo cuando quieras concentrarte solo en la vista del flujo.",
    "pipeline.studio.graphConfiguration": "Configuración del grafo",
    "pipeline.studio.resetAllVersions": "Restablecer todas las versiones",
    "pipeline.studio.graphCopy":
      "El pipeline se modela como un grafo. Etapas, sub-etapas y transiciones por reglas pueden bifurcarse, converger o retroceder sin forzar un orden lineal, y cada programa puede tener su propia versión.",
    "pipeline.studio.version.program":
      "Estás editando la versión específica del programa {program}.",
    "pipeline.studio.version.global":
      "Estás editando el flujo global por defecto que los programas pueden clonar y especializar.",
    "pipeline.studio.flowVersions": "Versiones del flujo",
    "pipeline.studio.createProgramVersion": "Crear versión de programa",
    "pipeline.studio.programName": "Nombre del programa",
    "pipeline.studio.cloneFrom": "Clonar desde",
    "pipeline.studio.createVersion": "Crear versión",
    "pipeline.studio.addStageNode": "Agregar nodo de etapa",
    "pipeline.studio.label": "Etiqueta",
    "pipeline.studio.placeholder.nodeLabel": "Revisión de becas",
    "pipeline.studio.nodeType": "Tipo de nodo",
    "pipeline.studio.parentStage": "Etapa padre",
    "pipeline.studio.chooseParentStage": "Elige una etapa padre",
    "pipeline.studio.description": "Descripción",
    "pipeline.studio.placeholder.description": "Contexto operativo para este nodo",
    "pipeline.studio.addNode": "Agregar nodo",
    "pipeline.studio.addRule": "Agregar regla",
    "pipeline.studio.ruleLabel": "Etiqueta de regla",
    "pipeline.studio.placeholder.ruleLabel": "Escalar a comité",
    "pipeline.studio.sourceNode": "Nodo origen",
    "pipeline.studio.destinationNode": "Nodo destino",
    "pipeline.studio.chooseSourceNode": "Elige el nodo origen",
    "pipeline.studio.chooseDestinationNode": "Elige el nodo destino",
    "pipeline.studio.direction": "Dirección",
    "pipeline.studio.condition": "Condición",
    "pipeline.studio.placeholder.condition": "Explica la regla de decisión o disparador",
    "pipeline.studio.addRuleAction": "Agregar regla",
    "pipeline.studio.stageFamilies": "Familias de etapa",
    "pipeline.studio.transitionRules": "Reglas de transición",
    "pipeline.studio.globalDefault": "Global por defecto",
    "pipeline.studio.programVersion": "Versión de programa",
    "pipeline.studio.statsSummary": "{stages} etapas / {rules} reglas / {nodes} nodos",
    "pipeline.messages.default":
      "Configura el grafo y el resto del módulo lo heredará.",
    "pipeline.messages.programCreated": "Se creó la versión específica del programa.",
    "pipeline.messages.nodeAdded": "Se agregó el nodo del pipeline.",
    "pipeline.messages.ruleAdded": "Se agregó la regla de transición.",
    "pipeline.messages.graphReset": "El grafo del pipeline volvió al preset por defecto.",
    "pipeline.messages.versionChanged": "La versión del flujo cambió.",
    "pipeline.messages.nodeRemoved": "Se eliminó el nodo del pipeline.",
    "pipeline.messages.ruleRemoved": "Se eliminó la regla de transición.",
    "pipeline.errors.programNameTooShort":
      "El nombre del programa debe tener al menos 2 caracteres.",
    "pipeline.errors.programExists":
      "Ese programa ya tiene una versión específica del flujo.",
    "pipeline.errors.stageLabelTooShort":
      "La etiqueta de etapa debe tener al menos 2 caracteres.",
    "pipeline.errors.invalidNodeKind":
      "Elige si el nuevo nodo es una etapa o una sub-etapa.",
    "pipeline.errors.duplicateStageLabel":
      "Las etiquetas de etapa deben ser únicas porque se usan en todo el módulo.",
    "pipeline.errors.invalidSubstageParent":
      "Las sub-etapas deben apuntar a una etapa principal existente.",
    "pipeline.errors.ruleNeedsEndpoints":
      "Una regla necesita nodo origen y nodo destino.",
    "pipeline.errors.ruleSameDestination":
      "Las reglas deben apuntar a un nodo destino diferente.",
    "pipeline.errors.ruleSourceMissing": "El nodo origen seleccionado ya no existe.",
    "pipeline.errors.ruleDestinationMissing":
      "El nodo destino seleccionado ya no existe.",
    "pipeline.errors.ruleLabelTooShort":
      "La etiqueta de la regla debe tener al menos 2 caracteres.",
    "pipeline.errors.ruleConditionTooShort":
      "Describe la condición de la regla con un poco más de detalle.",
    "pipeline.errors.invalidDirection": "Elige una dirección de transición válida.",
    "pipeline.errors.duplicateRule":
      "Ya existe una regla con el mismo origen, destino y etiqueta.",
    "pipeline.actions.remove": "Eliminar",
    "pipeline.status.active": "{count} activos",
    "pipeline.status.nodes": "{count} nodos",
    "pipeline.status.rules": "{count} reglas",
    "pipeline.domain.stage": "Etapa",
    "pipeline.domain.substage": "Sub-etapa",
    "pipeline.direction.forward": "Avance",
    "pipeline.direction.branch": "Bifurcación",
    "pipeline.direction.backward": "Retroceso",
    "pipeline.direction.lateral": "Lateral",
    "domain.applicantStatus.inReview": "En revisión",
    "domain.applicantStatus.offerReady": "Oferta lista",
    "domain.applicantStatus.awaitingDocuments": "Documentos pendientes",
    "domain.taskStatus.open": "Abierta",
    "domain.taskStatus.inProgress": "En progreso",
    "domain.taskStatus.done": "Hecha",
    "domain.priority.high": "Alta",
    "domain.priority.medium": "Media",
    "domain.priority.low": "Baja",
    "app.status.savingApplicant": "Guardando aspirante...",
    "app.status.applicantCreated": "Aspirante creado.",
    "app.status.requestFailed": "La solicitud falló.",
  },
};

const applicantStatusMessageKeys = {
  "In Review": "domain.applicantStatus.inReview",
  "Offer Ready": "domain.applicantStatus.offerReady",
  "Awaiting Documents": "domain.applicantStatus.awaitingDocuments",
};

const taskStatusMessageKeys = {
  Open: "domain.taskStatus.open",
  "In Progress": "domain.taskStatus.inProgress",
  Done: "domain.taskStatus.done",
};

const priorityMessageKeys = {
  High: "domain.priority.high",
  Medium: "domain.priority.medium",
  Low: "domain.priority.low",
};

const statMessageKeys = {
  Applicants: "dashboard.stat.applicants",
  "Interviews Pending": "dashboard.stat.interviewsPending",
  "Offers Ready": "dashboard.stat.offersReady",
  "Open Advising Tasks": "dashboard.stat.openAdvisingTasks",
};

const nodeKindMessageKeys = {
  stage: "pipeline.domain.stage",
  substage: "pipeline.domain.substage",
};

const directionMessageKeys = {
  forward: "pipeline.direction.forward",
  branch: "pipeline.direction.branch",
  backward: "pipeline.direction.backward",
  lateral: "pipeline.direction.lateral",
};

function interpolate(template, values = {}) {
  return String(template).replaceAll(/\{(\w+)\}/g, (_, token) =>
    values[token] === undefined || values[token] === null ? `{${token}}` : String(values[token])
  );
}

function resolveLocale(locale) {
  if (locale && localeCatalog[locale]) {
    return locale;
  }

  return FALLBACK_LOCALE;
}

function getStoredLocale() {
  try {
    return resolveLocale(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return FALLBACK_LOCALE;
  }
}

function guessLocaleFromNavigator() {
  const candidates = Array.isArray(window.navigator.languages)
    ? window.navigator.languages
    : [window.navigator.language];

  for (const candidate of candidates) {
    const normalized = String(candidate ?? "")
      .toLowerCase()
      .split("-")[0];

    if (localeCatalog[normalized]) {
      return normalized;
    }
  }

  return FALLBACK_LOCALE;
}

function translateMappedValue(i18n, catalog, value) {
  const key = catalog[value];

  if (!key) {
    return value;
  }

  return i18n.t(key, {}, value);
}

export function getInitialLocalePreference() {
  const storedLocale = getStoredLocale();

  if (storedLocale !== FALLBACK_LOCALE || window.localStorage.getItem(STORAGE_KEY)) {
    return storedLocale;
  }

  return guessLocaleFromNavigator();
}

export function saveLocalePreference(locale) {
  window.localStorage.setItem(STORAGE_KEY, resolveLocale(locale));
}

export function getLocaleOptions(i18n) {
  return Object.keys(localeCatalog).map((locale) => ({
    value: locale,
    label: i18n.t(`configuration.language.${locale}`, {}, localeCatalog[locale].label),
  }));
}

export function createI18n(locale) {
  const activeLocale = resolveLocale(locale);
  const activeMessages = messages[activeLocale] ?? {};
  const fallbackMessages = messages[FALLBACK_LOCALE] ?? {};

  const i18n = {
    locale: activeLocale,
    label: localeCatalog[activeLocale]?.label ?? localeCatalog[FALLBACK_LOCALE].label,
    t(key, values = {}, fallback = key) {
      const template = activeMessages[key] ?? fallbackMessages[key] ?? fallback;
      return interpolate(template, values);
    },
    formatNumber(value, options = {}) {
      return new Intl.NumberFormat(activeLocale, options).format(value);
    },
    formatDate(value, options = {}) {
      const parsed = value instanceof Date ? value : new Date(value);

      if (Number.isNaN(parsed.getTime())) {
        return String(value);
      }

      return new Intl.DateTimeFormat(activeLocale, {
        dateStyle: "medium",
        ...options,
      }).format(parsed);
    },
    localizeApplicantStatus(value) {
      return translateMappedValue(i18n, applicantStatusMessageKeys, value);
    },
    localizeTaskStatus(value) {
      return translateMappedValue(i18n, taskStatusMessageKeys, value);
    },
    localizePriority(value) {
      return translateMappedValue(i18n, priorityMessageKeys, value);
    },
    localizeStatLabel(value) {
      return translateMappedValue(i18n, statMessageKeys, value);
    },
    localizeNodeKind(value) {
      return translateMappedValue(i18n, nodeKindMessageKeys, value);
    },
    localizeDirection(value) {
      return translateMappedValue(i18n, directionMessageKeys, value);
    },
  };

  return i18n;
}

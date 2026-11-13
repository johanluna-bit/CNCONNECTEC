/**
 * CN ConnectEC — services-data.js
 * Datos de respaldo offline del catálogo de servicios.
 * Se usa cuando el backend no está disponible.
 */

const SERVICES_DATA = [
  {
    id: "tramite-1",
    title: "Intermediación en Trámites",
    category: "tramites",
    categoryLabel: "Tramites",
    provider: "Gestoría Integral Manta",
    verified: true,
    active: true,
    priceNote: "Honorarios desde $30",
    zones: ["Manta Centro", "Los Esteros", "Tarqui", "Jocay", "Urbanizaciones", "Toda Manta"],
    badge: "",
    badgeColor: "",
    image: "assets/services/tramites.jpg",
    description: "Gestión e intermediación ágil en trámites notariales, vehiculares (SRI, ANT), contratos, escrituras y documentación civil en Manta. Acompañamiento legal de principio a fin.",
    features: ["Gestión en 24-48h", "Asesoría legal y notarial", "Acompañamiento integral"],
    whatsappPhone: "+593992316303",
    whatsappPreset: "Hola, los contacto desde CN ConnectEC (Manta). Necesito asesoría e intermediación en trámites.",
    createdAt: "2026-11-01T10:00:00.000Z"
  },
  {
    id: "vehiculo-1",
    title: "Servicio de Taxi Ejecutivo",
    category: "taxi",
    categoryLabel: "Taxi",
    provider: "Executive Drive Manta",
    verified: true,
    active: true,
    priceNote: "Tarifa desde $5 urbana",
    zones: ["Manta Centro", "Los Esteros", "Tarqui", "Jocay", "Urbanizaciones", "Toda Manta"],
    badge: "",
    badgeColor: "",
    image: "assets/services/taxi-ejecutivo.jpg",
    description: "Traslados ejecutivos seguros, puntuales y climatizados en Manta. Servicio puerta a puerta, traslados al aeropuerto Eloy Alfaro, hoteles y viajes intercantonales.",
    features: ["Conductores profesionales", "Vehículos climatizados", "Puntualidad garantizada"],
    whatsappPhone: "+593992316303",
    whatsappPreset: "Hola, los contacto desde CN ConnectEC (Manta). Necesito solicitar un taxi ejecutivo.",
    createdAt: "2026-11-01T10:00:00.000Z"
  },
  {
    id: "vehiculo-2",
    title: "Servicio de Vehículo de Turismo con Conductor",
    category: "taxi",
    categoryLabel: "Taxi",
    provider: "Ruta Costera Tours Manta",
    verified: true,
    active: true,
    priceNote: "Por día desde $45",
    zones: ["Manta Centro", "Los Esteros", "Tarqui", "Urbanizaciones", "Toda Manta"],
    badge: "",
    badgeColor: "",
    image: "assets/services/turismo-conductor.jpg",
    description: "Rutas turísticas y paseos por las playas de Manabí (San Lorenzo, Santa Marianita, Los Frailes) con chofer guía local bilingüe y vehículos amplios con seguro completo.",
    features: ["Chofer y guía local", "Rutas personalizadas", "Vehículo amplio y cómodo"],
    whatsappPhone: "+593992316303",
    whatsappPreset: "Hola, los contacto desde CN ConnectEC (Manta). Quiero consultar por el servicio de vehículo de turismo con conductor.",
    createdAt: "2026-11-01T10:00:00.000Z"
  },
  {
    id: "delivery-1",
    title: "Delivery Express",
    category: "delivery",
    categoryLabel: "Delivery",
    provider: "MotoFlash Manta",
    verified: true,
    active: true,
    priceNote: "Desde $2.50 en la ciudad",
    zones: ["Manta Centro", "Los Esteros", "Tarqui", "Jocay", "Urbanizaciones", "Toda Manta"],
    badge: "",
    badgeColor: "",
    image: "assets/services/delivery.jpg",
    description: "Entregas inmediatas en motocicleta: encomiendas, paquetes, compras, documentos y pedidos urgentes con seguimiento en tiempo real vía WhatsApp.",
    features: ["Entrega en 30-45 min", "Seguimiento por WhatsApp", "Cobertura urbana completa"],
    whatsappPhone: "+593992316303",
    whatsappPreset: "Hola, los contacto desde CN ConnectEC (Manta). Necesito un servicio de Delivery Express.",
    createdAt: "2026-11-01T10:00:00.000Z"
  },
  {
    id: "asistencia-1",
    title: "Servicio de Limpieza del Hogar",
    category: "limpieza",
    categoryLabel: "Limpieza",
    provider: "CleanHome Manta",
    verified: true,
    active: true,
    priceNote: "Jornada desde $25",
    zones: ["Manta Centro", "Los Esteros", "Tarqui", "Jocay", "Urbanizaciones", "Toda Manta"],
    badge: "",
    badgeColor: "",
    image: "assets/services/limpieza-hogar.jpg",
    description: "Limpieza profunda y de mantenimiento para casas, departamentos y oficinas en Manta. Personal de confianza verificado por CN ConnectEC, insumos adecuados y máxima puntualidad.",
    features: ["Personal 100% verificado", "Limpieza profunda y estándar", "Horarios flexibles"],
    whatsappPhone: "+593992316303",
    whatsappPreset: "Hola, los contacto desde CN ConnectEC (Manta). Necesito cotizar el servicio de limpieza del hogar.",
    createdAt: "2026-11-01T10:00:00.000Z"
  }
];

// Exportar para módulos y para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SERVICES_DATA;
}

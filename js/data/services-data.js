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
    categoryLabel: "Trámites y Compra-Venta",
    provider: "Gestoría Integral Manta",
    verified: true,
    active: true,
    rating: 4.9,
    reviews: 88,
    priceNote: "Honorarios desde $30",
    zones: ["Manta Centro", "Los Esteros", "Tarqui", "Jocay", "Urbanizaciones", "Toda Manta"],
    badge: "Verificado CN",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
    description: "Gestión e intermediación ágil en trámites notariales, vehiculares (SRI, ANT), contratos, escrituras y documentación civil en Manta. Acompañamiento legal de principio a fin.",
    features: ["Gestión en 24-48h", "Asesoría legal y notarial", "Acompañamiento integral"],
    whatsappPhone: "+593XXXXXXXXX",
    whatsappPreset: "Hola, los contacto desde CN ConnectEC (Manta). Necesito asesoría e intermediación en trámites.",
    createdAt: "2026-11-01T10:00:00.000Z"
  },
  {
    id: "vehiculo-1",
    title: "Servicio de Taxi Ejecutivo",
    category: "vehiculos",
    categoryLabel: "Alquiler y Vehículos",
    provider: "Executive Drive Manta",
    verified: true,
    active: true,
    rating: 4.9,
    reviews: 115,
    priceNote: "Tarifa desde $5 urbana",
    zones: ["Manta Centro", "Los Esteros", "Tarqui", "Jocay", "Urbanizaciones", "Toda Manta"],
    badge: "Top Calificado",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    image: "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=600&q=80",
    description: "Traslados ejecutivos seguros, puntuales y climatizados en Manta. Servicio puerta a puerta, traslados al aeropuerto Eloy Alfaro, hoteles y viajes intercantonales.",
    features: ["Conductores profesionales", "Vehículos climatizados", "Puntualidad garantizada"],
    whatsappPhone: "+593XXXXXXXXX",
    whatsappPreset: "Hola, los contacto desde CN ConnectEC (Manta). Necesito solicitar un taxi ejecutivo.",
    createdAt: "2026-11-01T10:00:00.000Z"
  },
  {
    id: "vehiculo-2",
    title: "Servicio de Vehículo de Turismo con Conductor",
    category: "vehiculos",
    categoryLabel: "Alquiler y Vehículos",
    provider: "Ruta Costera Tours Manta",
    verified: true,
    active: true,
    rating: 5.0,
    reviews: 64,
    priceNote: "Por día desde $45",
    zones: ["Manta Centro", "Los Esteros", "Tarqui", "Urbanizaciones", "Toda Manta"],
    badge: "Oficial",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
    description: "Rutas turísticas y paseos por las playas de Manabí (San Lorenzo, Santa Marianita, Los Frailes) con chofer guía local bilingüe y vehículos amplios con seguro completo.",
    features: ["Chofer y guía local", "Rutas personalizadas", "Vehículo amplio y cómodo"],
    whatsappPhone: "+593XXXXXXXXX",
    whatsappPreset: "Hola, los contacto desde CN ConnectEC (Manta). Quiero consultar por el servicio de vehículo de turismo con conductor.",
    createdAt: "2026-11-01T10:00:00.000Z"
  },
  {
    id: "delivery-1",
    title: "Delivery Express",
    category: "delivery",
    categoryLabel: "Deliverys y Envíos",
    provider: "MotoFlash Manta",
    verified: true,
    active: true,
    rating: 4.8,
    reviews: 210,
    priceNote: "Desde $2.50 en la ciudad",
    zones: ["Manta Centro", "Los Esteros", "Tarqui", "Jocay", "Urbanizaciones", "Toda Manta"],
    badge: "Verificado CN",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80",
    description: "Entregas inmediatas en motocicleta: encomiendas, paquetes, compras, documentos y pedidos urgentes con seguimiento en tiempo real vía WhatsApp.",
    features: ["Entrega en 30-45 min", "Seguimiento por WhatsApp", "Cobertura urbana completa"],
    whatsappPhone: "+593XXXXXXXXX",
    whatsappPreset: "Hola, los contacto desde CN ConnectEC (Manta). Necesito un servicio de Delivery Express.",
    createdAt: "2026-11-01T10:00:00.000Z"
  },
  {
    id: "asistencia-1",
    title: "Servicio de Limpieza del Hogar",
    category: "asistencia",
    categoryLabel: "Auxilio y Asistencia",
    provider: "CleanHome Manta",
    verified: true,
    active: true,
    rating: 4.9,
    reviews: 92,
    priceNote: "Jornada desde $25",
    zones: ["Manta Centro", "Los Esteros", "Tarqui", "Jocay", "Urbanizaciones", "Toda Manta"],
    badge: "Verificado CN",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    description: "Limpieza profunda y de mantenimiento para casas, departamentos y oficinas en Manta. Personal de confianza verificado por CN ConnectEC, insumos adecuados y máxima puntualidad.",
    features: ["Personal 100% verificado", "Limpieza profunda y estándar", "Horarios flexibles"],
    whatsappPhone: "+593XXXXXXXXX",
    whatsappPreset: "Hola, los contacto desde CN ConnectEC (Manta). Necesito cotizar el servicio de limpieza del hogar.",
    createdAt: "2026-11-01T10:00:00.000Z"
  }
];

// Exportar para módulos y para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SERVICES_DATA;
}

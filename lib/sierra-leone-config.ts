export interface PopularDestination {
  name: string
  coordinates: [number, number] // [lat, lng]
  type: "city" | "landmark" | "airport" | "hospital" | "university" | "market" | "beach"
  district: string
}

export interface VehicleType {
  id: string
  name: string
  description: string
  basePrice: number // in Sierra Leone Leones
  pricePerKm: number
  capacity: number
  icon: string
  available: boolean
}

export interface PaymentMethod {
  id: string
  name: string
  description: string
  available: boolean
  icon: string
}

export const sierraLeoneConfig = {
  // Popular destinations across Sierra Leone
  popularDestinations: [
    // Freetown Area
    {
      name: "Cotton Tree",
      coordinates: [8.484, -13.2299] as [number, number],
      type: "landmark" as const,
      district: "Western Area",
    },
    {
      name: "Lumley Beach",
      coordinates: [8.4219, -13.2846] as [number, number],
      type: "beach" as const,
      district: "Western Area",
    },
    {
      name: "Aberdeen",
      coordinates: [8.4167, -13.2667] as [number, number],
      type: "city" as const,
      district: "Western Area",
    },
    {
      name: "Lungi International Airport",
      coordinates: [8.6164, -13.1955] as [number, number],
      type: "airport" as const,
      district: "Port Loko",
    },
    {
      name: "Big Market",
      coordinates: [8.48, -13.235] as [number, number],
      type: "market" as const,
      district: "Western Area",
    },
    {
      name: "Connaught Hospital",
      coordinates: [8.475, -13.24] as [number, number],
      type: "hospital" as const,
      district: "Western Area",
    },
    {
      name: "Fourah Bay College",
      coordinates: [8.49, -13.18] as [number, number],
      type: "university" as const,
      district: "Western Area",
    },

    // Major Cities
    {
      name: "Bo",
      coordinates: [7.9644, -11.7383] as [number, number],
      type: "city" as const,
      district: "Bo District",
    },
    {
      name: "Kenema",
      coordinates: [7.8767, -11.19] as [number, number],
      type: "city" as const,
      district: "Kenema District",
    },
    {
      name: "Makeni",
      coordinates: [8.8833, -12.0333] as [number, number],
      type: "city" as const,
      district: "Bombali District",
    },
    {
      name: "Koidu",
      coordinates: [8.6439, -10.9708] as [number, number],
      type: "city" as const,
      district: "Kono District",
    },

    // Additional Landmarks
    {
      name: "Tacugama Chimpanzee Sanctuary",
      coordinates: [8.5167, -13.1833] as [number, number],
      type: "landmark" as const,
      district: "Western Area",
    },
    {
      name: "Banana Islands",
      coordinates: [8.1667, -13.0833] as [number, number],
      type: "landmark" as const,
      district: "Western Area",
    },
    {
      name: "Bunce Island",
      coordinates: [8.5667, -13.0333] as [number, number],
      type: "landmark" as const,
      district: "Western Area",
    },
  ] as PopularDestination[],

  // Vehicle types available in Sierra Leone
  vehicleTypes: [
    {
      id: "okada",
      name: "Okada (Motorcycle)",
      description: "Quick and affordable motorcycle taxi",
      basePrice: 5000, // 5,000 Leones
      pricePerKm: 2000, // 2,000 Leones per km
      capacity: 1,
      icon: "🏍️",
      available: true,
    },
    {
      id: "keke",
      name: "Keke (Tricycle)",
      description: "Three-wheeled taxi for short distances",
      basePrice: 8000, // 8,000 Leones
      pricePerKm: 3000, // 3,000 Leones per km
      capacity: 2,
      icon: "🛺",
      available: true,
    },
    {
      id: "poda-poda",
      name: "Poda Poda",
      description: "Shared minibus for longer routes",
      basePrice: 3000, // 3,000 Leones
      pricePerKm: 1000, // 1,000 Leones per km
      capacity: 14,
      icon: "🚐",
      available: true,
    },
    {
      id: "taxi",
      name: "Taxi",
      description: "Private car taxi service",
      basePrice: 15000, // 15,000 Leones
      pricePerKm: 5000, // 5,000 Leones per km
      capacity: 4,
      icon: "🚗",
      available: true,
    },
    {
      id: "luxury",
      name: "Luxury Car",
      description: "Premium vehicle with air conditioning",
      basePrice: 30000, // 30,000 Leones
      pricePerKm: 8000, // 8,000 Leones per km
      capacity: 4,
      icon: "🚙",
      available: true,
    },
  ] as VehicleType[],

  // Payment methods available in Sierra Leone
  paymentMethods: [
    {
      id: "cash",
      name: "Cash",
      description: "Pay with Sierra Leone Leones",
      available: true,
      icon: "💵",
    },
    {
      id: "orange-money",
      name: "Orange Money",
      description: "Mobile money payment",
      available: true,
      icon: "📱",
    },
    {
      id: "afrimoney",
      name: "Afrimoney",
      description: "Mobile money payment",
      available: true,
      icon: "📱",
    },
    {
      id: "qmoney",
      name: "QMoney",
      description: "Mobile money payment",
      available: true,
      icon: "📱",
    },
    {
      id: "bank-transfer",
      name: "Bank Transfer",
      description: "Direct bank transfer",
      available: false, // Not yet implemented
      icon: "🏦",
    },
  ] as PaymentMethod[],

  // Sierra Leone specific settings
  settings: {
    currency: "SLL", // Sierra Leone Leone
    currencySymbol: "Le",
    timezone: "GMT",
    emergencyNumber: "999",
    countryCode: "+232",

    // Operational hours
    operationalHours: {
      start: "05:00",
      end: "23:00",
    },

    // Surge pricing times (24-hour format)
    surgePricing: {
      peakHours: [
        { start: "07:00", end: "09:00" }, // Morning rush
        { start: "17:00", end: "19:00" }, // Evening rush
      ],
      nightSurge: { start: "22:00", end: "06:00" },
      rainySeason: { start: 4, end: 9 }, // May to October (0-indexed months)
    },

    // Distance and duration settings
    maxRideDistance: 200, // km
    estimatedSpeed: {
      city: 25, // km/h
      highway: 40, // km/h
      rural: 20, // km/h
    },

    // Booking settings
    maxAdvanceBooking: 24, // hours
    cancellationWindow: 5, // minutes
    driverSearchRadius: 10, // km

    // Rating system
    minRating: 1,
    maxRating: 5,
    minDriverRating: 3.0,
  },

  // Districts and regions
  districts: [
    "Western Area",
    "Bo District",
    "Bonthe District",
    "Moyamba District",
    "Pujehun District",
    "Kenema District",
    "Kailahun District",
    "Kono District",
    "Bombali District",
    "Falaba District",
    "Koinadugu District",
    "Kambia District",
    "Karene District",
    "Port Loko District",
  ],

  // Languages spoken
  languages: [
    { code: "en", name: "English", native: "English" },
    { code: "kri", name: "Krio", native: "Krio" },
    { code: "men", name: "Mende", native: "Mende" },
    { code: "tem", name: "Temne", native: "Temne" },
  ],
}

export default sierraLeoneConfig

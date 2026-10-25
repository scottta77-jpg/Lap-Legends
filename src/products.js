/**
 * Lap Legends - Official Product Catalogue
 * Contains all framed motorsport prints, variant styles, metadata, and Amazon buy destinations.
 */

export const AMAZON_STORE_URL = 'https://www.amazon.co.uk/stores/LapLegends/page/4F106B9E-4F21-44E2-866C-C6AA25125C89';

export const PRODUCTS = [
  {
    id: 'lando-norris',
    slug: 'lando-norris-framed-print',
    title: 'LANDO NORRIS FRAMED PRINT',
    shortTitle: 'Lando Norris',
    category: 'drivers',
    categoryLabel: 'DRIVER PRINTS',
    price: 19.99,
    currency: 'GBP',
    formattedPrice: '£19.99 GBP',
    driver: 'Lando Norris',
    number: '4',
    team: 'McLaren F1 Team',
    description: 'Bring your passion for racing into your space. A detailed motorsport print, presented in a black wooden frame and ready to display.',
    format: 'A4 / BLACK FRAME',
    signature: 'Reproduced digital signature.',
    amazonUrl: AMAZON_STORE_URL,
    defaultStyle: 'car',
    styles: [
      { id: 'car', label: 'CAR', image: '/assets/products/lando_car_frame.png', caption: 'McLaren MCL38 Frontal Livery & Signature' },
      { id: 'helmet', label: 'HELMET', image: '/assets/products/lando_helmet_framed.png', caption: 'Lando Norris Neon Yellow & Carbon Livery Helmet' },
      { id: 'bold', label: 'BOLD', image: '/assets/products/lando_bold_frame.png', caption: 'Split Composite Artwork — Car & Helmet' }
    ],
    gallery: [
      '/assets/products/lando_car_frame.png',
      '/assets/products/lando_helmet_framed.png',
      '/assets/products/lando_bold_frame.png',
      '/assets/lifestyle/cat_drivers.png'
    ],
    details: [
      'Black wooden frame with satin finish',
      'A4 printed artwork (210 x 297 mm)',
      'Wall hanging hook or tabletop fold-out display',
      'Digitally reproduced official driver signature',
      'High-clarity shatterproof acrylic front'
    ],
    dimensions: {
      frame: '23.5 x 32.2 cm (9.25 x 12.7 in)',
      print: 'Standard A4 (21 x 29.7 cm)',
      depth: '18 mm solid wood profile',
      glazing: '1.2 mm optical-grade styrene glazing'
    },
    relatedIds: ['lewis-hamilton', 'silverstone', 'oscar-piastri', 'race-calendar']
  },
  {
    id: 'lewis-hamilton',
    slug: 'lewis-hamilton-framed-print',
    title: 'LEWIS HAMILTON FRAMED PRINT',
    shortTitle: 'Lewis Hamilton',
    category: 'drivers',
    categoryLabel: 'DRIVER PRINTS',
    price: 19.99,
    currency: 'GBP',
    formattedPrice: '£19.99 GBP',
    driver: 'Lewis Hamilton',
    number: '44',
    team: 'Mercedes-AMG Petronas F1 Team',
    description: 'Celebrate the seven-time World Champion. High-definition helmet portrait in royal purple and neon yellow, set in an elegant black wooden frame.',
    format: 'A4 / BLACK FRAME',
    signature: 'Reproduced digital signature.',
    amazonUrl: AMAZON_STORE_URL,
    defaultStyle: 'helmet',
    styles: [
      { id: 'helmet', label: 'HELMET', image: '/assets/products/lewis_framed.png', caption: 'Official #44 Helmet in Royal Purple & Electric Yellow' },
      { id: 'bold', label: 'BOLD', image: '/assets/products/lewis_framed.png', caption: 'Signature Presentation' }
    ],
    gallery: [
      '/assets/products/lewis_framed.png',
      '/assets/lifestyle/hero_group_framed.png'
    ],
    details: [
      'Black wooden frame with clean bevelled edge',
      'A4 printed artwork on 250gsm archival silk stock',
      'Wall hanging bracket and fold-out desk stand included',
      'Digitally reproduced Lewis Hamilton signature'
    ],
    dimensions: {
      frame: '23.5 x 32.2 cm',
      print: 'A4 (21 x 29.7 cm)',
      depth: '18 mm',
      glazing: 'Crystal-clear shatterproof acrylic'
    },
    relatedIds: ['lando-norris', 'silverstone', 'charles-leclerc', 'race-calendar']
  },
  {
    id: 'silverstone',
    slug: 'silverstone-framed-print',
    title: 'SILVERSTONE FRAMED PRINT',
    shortTitle: 'Silverstone',
    category: 'circuits',
    categoryLabel: 'CIRCUIT ART',
    price: 19.99,
    currency: 'GBP',
    formattedPrice: '£19.99 GBP',
    driver: null,
    number: 'GB',
    team: 'Great Britain (52.0786° N, 1.0169° W)',
    description: 'The home of British motorsport. Minimalist technical track layout of the Silverstone Grand Prix Circuit with coordinates and national insignia.',
    format: 'A4 / BLACK FRAME',
    signature: 'Technical circuit specification.',
    amazonUrl: AMAZON_STORE_URL,
    defaultStyle: 'circuit',
    styles: [
      { id: 'circuit', label: 'CIRCUIT', image: '/assets/products/silverstone_framed.png', caption: 'Technical Track Layout on Pitch Black' },
      { id: 'wet', label: 'WET TRACK', image: '/assets/products/silverstone_wet_frame.png', caption: 'Sunset Rain Hangar Straight Photography' }
    ],
    gallery: [
      '/assets/products/silverstone_framed.png',
      '/assets/products/silverstone_wet_frame.png',
      '/assets/lifestyle/cat_circuits.png'
    ],
    details: [
      'Precision circuit contour on matte museum card',
      'Official geographic GPS coordinates included',
      'Pre-mounted in black timber gallery frame',
      'Ready to hang or stand'
    ],
    dimensions: {
      frame: '23.5 x 32.2 cm',
      print: 'A4 (21 x 29.7 cm)',
      depth: '18 mm',
      glazing: 'Optical grade shatterproof acrylic'
    },
    relatedIds: ['monaco', 'lando-norris', 'race-calendar', 'lewis-hamilton']
  },
  {
    id: 'oscar-piastri',
    slug: 'oscar-piastri-framed-print',
    title: 'OSCAR PIASTRI FRAMED PRINT',
    shortTitle: 'Oscar Piastri',
    category: 'drivers',
    categoryLabel: 'DRIVER PRINTS',
    price: 19.99,
    currency: 'GBP',
    formattedPrice: '£19.99 GBP',
    driver: 'Oscar Piastri',
    number: '81',
    team: 'McLaren F1 Team',
    description: 'Showcase the sensational Australian McLaren ace. High-impact aerodynamic livery artwork featuring car #81 and Piastri’s official signature.',
    format: 'A4 / BLACK FRAME',
    signature: 'Reproduced digital signature.',
    amazonUrl: AMAZON_STORE_URL,
    defaultStyle: 'car',
    styles: [
      { id: 'car', label: 'CAR', image: '/assets/products/oscar_framed.png', caption: 'McLaren Car #81 Front View' }
    ],
    gallery: [
      '/assets/products/oscar_framed.png',
      '/assets/lifestyle/cat_drivers.png'
    ],
    details: [
      'Solid timber frame with deep matte black finish',
      'Vibrant Papaya orange and carbon fiber print detail',
      'Digitally reproduced Oscar Piastri signature'
    ],
    dimensions: {
      frame: '23.5 x 32.2 cm',
      print: 'A4 (21 x 29.7 cm)',
      depth: '18 mm',
      glazing: 'UV-resistant protective styrene'
    },
    relatedIds: ['lando-norris', 'silverstone', 'lewis-hamilton', 'charles-leclerc']
  },
  {
    id: 'race-calendar',
    slug: 'race-calendar-framed-print',
    title: '2024 RACE CALENDAR FRAMED PRINT',
    shortTitle: '2024 Race Calendar',
    category: 'calendars',
    categoryLabel: 'RACE CALENDARS',
    price: 19.99,
    currency: 'GBP',
    formattedPrice: '£19.99 GBP',
    driver: null,
    number: '24',
    team: 'Formula 1 World Championship',
    description: 'The ultimate season overview. All 24 Formula 1 championship circuits meticulously outlined with track names, flags, and circuit layouts.',
    format: 'A4 / BLACK FRAME',
    signature: 'Championship Season Edition.',
    amazonUrl: AMAZON_STORE_URL,
    defaultStyle: 'calendar',
    styles: [
      { id: 'calendar', label: 'FULL CALENDAR', image: '/assets/products/calendar_framed.png', caption: 'All 24 Championship Circuits on Black' }
    ],
    gallery: [
      '/assets/products/calendar_framed.png',
      '/assets/lifestyle/cat_calendars.png'
    ],
    details: [
      'All 24 Grand Prix tracks plotted in accurate scale',
      'High-contrast technical typography',
      'Solid wooden frame with protective front',
      'Ready to hang or stand'
    ],
    dimensions: {
      frame: '23.5 x 32.2 cm',
      print: 'A4 (21 x 29.7 cm)',
      depth: '18 mm',
      glazing: 'Clear acrylic glazing'
    },
    relatedIds: ['silverstone', 'monaco', 'lando-norris', 'lewis-hamilton']
  },
  {
    id: 'monaco',
    slug: 'monaco-framed-print',
    title: 'MONACO GRAND PRIX FRAMED PRINT',
    shortTitle: 'Monaco',
    category: 'circuits',
    categoryLabel: 'CIRCUIT ART',
    price: 19.99,
    currency: 'GBP',
    formattedPrice: '£19.99 GBP',
    driver: null,
    number: 'MC',
    team: 'Monte Carlo, Principality of Monaco',
    description: 'The jewel in motorsport’s crown. The iconic Monaco street circuit layout with Casino Square, Grand Hotel Hairpin, and Portier corner markings.',
    format: 'A4 / BLACK FRAME',
    signature: 'Historic Circuit Edition.',
    amazonUrl: AMAZON_STORE_URL,
    defaultStyle: 'circuit',
    styles: [
      { id: 'circuit', label: 'CIRCUIT', image: '/assets/products/monaco_frame.png', caption: 'Monaco Street Circuit Layout' }
    ],
    gallery: [
      '/assets/products/monaco_frame.png',
      '/assets/lifestyle/monaco_banner.png'
    ],
    details: [
      'Deep emerald dark olive card background',
      'Minimalist white circuit line vector artwork',
      'Black wooden gallery frame ready to display'
    ],
    dimensions: {
      frame: '23.5 x 32.2 cm',
      print: 'A4 (21 x 29.7 cm)',
      depth: '18 mm',
      glazing: 'Shatterproof styrene front'
    },
    relatedIds: ['silverstone', 'race-calendar', 'charles-leclerc', 'lando-norris']
  },
  {
    id: 'charles-leclerc',
    slug: 'charles-leclerc-framed-print',
    title: 'CHARLES LECLERC FRAMED PRINT',
    shortTitle: 'Charles Leclerc',
    category: 'drivers',
    categoryLabel: 'DRIVER PRINTS',
    price: 19.99,
    currency: 'GBP',
    formattedPrice: '£19.99 GBP',
    driver: 'Charles Leclerc',
    number: '16',
    team: 'Scuderia Ferrari',
    description: 'The pride of the Tifosi. Official Charles Leclerc Rosso Corsa helmet artwork, framed with museum-quality mounting and reproduced signature.',
    format: 'A4 / BLACK FRAME',
    signature: 'Reproduced digital signature.',
    amazonUrl: AMAZON_STORE_URL,
    defaultStyle: 'helmet',
    styles: [
      { id: 'helmet', label: 'HELMET', image: '/assets/products/charles_framed.png', caption: 'Scuderia Ferrari #16 Scarlet & White Livery Helmet' }
    ],
    gallery: [
      '/assets/products/charles_framed.png',
      '/assets/lifestyle/hero_group_framed.png'
    ],
    details: [
      'Satin black timber gallery frame',
      'Ferrari Rosso Corsa and white helmet artwork',
      'Reproduced Leclerc signature and driver number #16',
      'Wall hook and table stand pre-attached'
    ],
    dimensions: {
      frame: '23.5 x 32.2 cm',
      print: 'A4 (21 x 29.7 cm)',
      depth: '18 mm',
      glazing: 'High-clarity optical styrene'
    },
    relatedIds: ['monaco', 'lewis-hamilton', 'lando-norris', 'oscar-piastri']
  }
];

export function getProductById(id) {
  return PRODUCTS.find(p => p.id === id || p.slug === id) || null;
}

export function getProductsByCategory(category) {
  if (!category || category === 'all') return PRODUCTS;
  return PRODUCTS.filter(p => p.category === category);
}

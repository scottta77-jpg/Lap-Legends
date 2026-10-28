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
    description: 'Bring your passion for racing into your space. Official McLaren #1 livery artwork featuring Lando Norris’s neon yellow helmet and car, presented in an elegant black wooden frame ready to display.',
    format: 'A4 / BLACK FRAME',
    signature: 'Reproduced digital signature.',
    amazonUrl: AMAZON_STORE_URL,
    homeFrame: '/assets/products/lando_home_frame.png',
    defaultStyle: 'car',
    styles: [
      { id: 'car', label: 'CAR & HELMET', image: '/assets/products/lando_home_frame.png', caption: 'McLaren MCL38 Livery, Helmet & Driver Signature' },
      { id: 'helmet', label: 'HELMET', image: '/assets/products/lando_helmet_framed.png', caption: 'Lando Norris Neon Yellow & Carbon Livery Helmet' },
      { id: 'standing', label: 'PORTRAIT', image: '/assets/products/lando_standing_frame.png', caption: 'Lando Norris Official Team Portrait & Livery' }
    ],
    gallery: [
      '/assets/products/lando_home_frame.png',
      '/assets/products/lando_helmet_framed.png',
      '/assets/products/lando_standing_frame.png',
      '/assets/products/frame_spec.jpg'
    ],
    details: [
      'Black wooden frame with satin finish',
      'A4 printed artwork (210 x 297 mm)',
      'Wall hanging hook and tabletop fold-out easel display',
      'Digitally reproduced official driver signature',
      'High-clarity shatterproof acrylic front'
    ],
    dimensions: {
      frame: '22.5 x 32.5 cm (A4 Frame)',
      print: 'Standard A4 (21 x 29.7 cm)',
      depth: '18 mm solid wood profile',
      glazing: '1.2 mm optical-grade shatterproof front'
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
    team: 'Scuderia Ferrari / Mercedes-AMG',
    description: 'Celebrate the seven-time World Champion. Official #44 helmet portrait and livery, mounted in an elegant black wooden frame ready to hang or stand.',
    format: 'A4 / BLACK FRAME',
    signature: 'Reproduced digital signature.',
    amazonUrl: AMAZON_STORE_URL,
    homeFrame: '/assets/products/lewis_home_frame.png',
    defaultStyle: 'helmet',
    styles: [
      { id: 'helmet', label: 'HELMET & CAR', image: '/assets/products/lewis_home_frame.png', caption: 'Official #44 Helmet & Car with Signature' },
      { id: 'standing', label: 'PORTRAIT', image: '/assets/products/lewis_framed.png', caption: 'Lewis Hamilton Scuderia Ferrari Race Suit Portrait' }
    ],
    gallery: [
      '/assets/products/lewis_home_frame.png',
      '/assets/products/lewis_framed.png',
      '/assets/products/frame_spec.jpg'
    ],
    details: [
      'Black wooden frame with clean bevelled edge',
      'A4 printed artwork on 250gsm archival silk stock',
      'Wall hanging bracket and fold-out desk stand included',
      'Digitally reproduced Lewis Hamilton signature'
    ],
    dimensions: {
      frame: '22.5 x 32.5 cm',
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
    description: 'The home of British motorsport. Minimalist technical track layout of the Silverstone Grand Prix Circuit with coordinates, track map, and national insignia.',
    format: 'A4 / BLACK FRAME',
    signature: 'Technical circuit specification.',
    amazonUrl: AMAZON_STORE_URL,
    homeFrame: '/assets/products/silverstone_home_frame.png',
    defaultStyle: 'circuit',
    styles: [
      { id: 'circuit', label: 'CIRCUIT', image: '/assets/products/silverstone_home_frame.png', caption: 'Technical Track Layout and Grand Prix Photography' }
    ],
    gallery: [
      '/assets/products/silverstone_home_frame.png',
      '/assets/products/frame_spec.jpg'
    ],
    details: [
      'Precision circuit contour on matte museum card',
      'Official geographic GPS coordinates and circuit stats',
      'Pre-mounted in black timber gallery frame',
      'Ready to hang or stand'
    ],
    dimensions: {
      frame: '22.5 x 32.5 cm',
      print: 'A4 (21 x 29.7 cm)',
      depth: '18 mm',
      glazing: 'Optical grade shatterproof acrylic'
    },
    relatedIds: ['monaco', 'lando-norris', 'race-calendar', 'hungaroring']
  },
  {
    id: 'race-calendar',
    slug: 'race-calendar-framed-print',
    title: '2027 RACE CALENDAR FRAMED PRINT',
    shortTitle: '2027 Race Calendar',
    category: 'calendars',
    categoryLabel: 'RACE CALENDARS',
    price: 19.99,
    currency: 'GBP',
    formattedPrice: '£19.99 GBP',
    driver: null,
    number: '24',
    team: 'Formula 1 World Championship',
    description: 'The ultimate season overview. All 24 Formula 1 championship circuits meticulously outlined with track names, national flags, and accurate circuit layouts.',
    format: 'A4 / BLACK FRAME',
    signature: 'Championship Season Edition.',
    amazonUrl: AMAZON_STORE_URL,
    homeFrame: '/assets/products/calendar_home_frame.png',
    defaultStyle: 'calendar',
    styles: [
      { id: 'calendar', label: 'FULL CALENDAR', image: '/assets/products/calendar_home_frame.png', caption: 'All 24 Championship Circuits on Black' }
    ],
    gallery: [
      '/assets/products/calendar_home_frame.png',
      '/assets/products/frame_spec.jpg'
    ],
    details: [
      'All 24 Grand Prix tracks plotted in accurate scale',
      'High-contrast technical typography with sprint flags',
      'Solid wooden frame with protective front',
      'Ready to hang or stand'
    ],
    dimensions: {
      frame: '22.5 x 32.5 cm',
      print: 'A4 (21 x 29.7 cm)',
      depth: '18 mm',
      glazing: 'Clear acrylic glazing'
    },
    relatedIds: ['silverstone', 'monaco', 'lando-norris', 'lewis-hamilton']
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
    description: 'Showcase the sensational Australian McLaren ace. High-impact aerodynamic livery artwork featuring car #81, Piastri’s official helmet, and digital signature.',
    format: 'A4 / BLACK FRAME',
    signature: 'Reproduced digital signature.',
    amazonUrl: AMAZON_STORE_URL,
    homeFrame: '/assets/products/oscar_home_frame.png',
    defaultStyle: 'car',
    styles: [
      { id: 'car', label: 'HELMET & CAR', image: '/assets/products/oscar_home_frame.png', caption: 'McLaren Car #81 and Helmet Presentation' }
    ],
    gallery: [
      '/assets/products/oscar_home_frame.png',
      '/assets/products/frame_spec.jpg'
    ],
    details: [
      'Solid timber frame with deep matte black finish',
      'Vibrant Papaya orange and carbon fiber print detail',
      'Digitally reproduced Oscar Piastri signature'
    ],
    dimensions: {
      frame: '22.5 x 32.5 cm',
      print: 'A4 (21 x 29.7 cm)',
      depth: '18 mm',
      glazing: 'UV-resistant protective styrene'
    },
    relatedIds: ['lando-norris', 'silverstone', 'lewis-hamilton', 'charles-leclerc']
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
    description: 'The jewel in motorsport’s crown. The iconic Monaco street circuit layout with harbor photo, turn specifications, and Principality emblem.',
    format: 'A4 / BLACK FRAME',
    signature: 'Historic Circuit Edition.',
    amazonUrl: AMAZON_STORE_URL,
    homeFrame: '/assets/products/monaco_home_frame.png',
    defaultStyle: 'circuit',
    styles: [
      { id: 'circuit', label: 'CIRCUIT', image: '/assets/products/monaco_home_frame.png', caption: 'Monaco Street Circuit Layout & Grand Prix Photo' }
    ],
    gallery: [
      '/assets/products/monaco_home_frame.png',
      '/assets/products/frame_spec.jpg'
    ],
    details: [
      'Crisp high-contrast technical typography',
      'Circuit contour with official GPS coordinates',
      'Black wooden gallery frame ready to display'
    ],
    dimensions: {
      frame: '22.5 x 32.5 cm',
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
    team: 'Scuderia Ferrari HP',
    description: 'The Monegasque maestro. Detailed Scuderia Ferrari helmet livery and #16 car in scarlet red, mounted in black timber moulding.',
    format: 'A4 / BLACK FRAME',
    signature: 'Reproduced digital signature.',
    amazonUrl: AMAZON_STORE_URL,
    homeFrame: '/assets/products/charles_home_frame.png',
    defaultStyle: 'helmet',
    styles: [
      { id: 'helmet', label: 'HELMET & CAR', image: '/assets/products/charles_home_frame.png', caption: 'Scuderia Ferrari #16 Official Helmet & Car' }
    ],
    gallery: [
      '/assets/products/charles_home_frame.png',
      '/assets/products/frame_spec.jpg'
    ],
    details: [
      'Official Ferrari red and white helmet livery art',
      'Satin black wooden gallery frame',
      'Ready to display on wall or desktop'
    ],
    dimensions: {
      frame: '22.5 x 32.5 cm',
      print: 'A4 (21 x 29.7 cm)',
      depth: '18 mm',
      glazing: 'Optical grade styrene front'
    },
    relatedIds: ['lewis-hamilton', 'monaco', 'lando-norris', 'silverstone']
  },
  {
    id: 'kimi-antonelli',
    slug: 'kimi-antonelli-framed-print',
    title: 'ANDREA KIMI ANTONELLI FRAMED PRINT',
    shortTitle: 'Kimi Antonelli',
    category: 'drivers',
    categoryLabel: 'DRIVER PRINTS',
    price: 19.99,
    currency: 'GBP',
    formattedPrice: '£19.99 GBP',
    driver: 'Andrea Kimi Antonelli',
    number: '12',
    team: 'Mercedes-AMG Petronas F1 Team',
    description: 'The new Silver Arrows era begins. Official #12 Mercedes helmet in Italian tricolore accents and silver aerodynamic car artwork.',
    format: 'A4 / BLACK FRAME',
    signature: 'Reproduced digital signature.',
    amazonUrl: AMAZON_STORE_URL,
    homeFrame: '/assets/products/kimi_home_frame.png',
    defaultStyle: 'helmet',
    styles: [
      { id: 'helmet', label: 'HELMET & CAR', image: '/assets/products/kimi_home_frame.png', caption: 'Mercedes-AMG #12 Helmet & Car Livery' }
    ],
    gallery: [
      '/assets/products/kimi_home_frame.png',
      '/assets/products/frame_spec.jpg'
    ],
    details: [
      'Black wooden frame with satin finish',
      'A4 printed artwork (210 x 297 mm)',
      'Digitally reproduced official driver signature'
    ],
    dimensions: {
      frame: '22.5 x 32.5 cm',
      print: 'A4 (21 x 29.7 cm)',
      depth: '18 mm',
      glazing: 'Optical grade shatterproof acrylic'
    },
    relatedIds: ['george-russell', 'lewis-hamilton', 'silverstone', 'race-calendar']
  },
  {
    id: 'george-russell',
    slug: 'george-russell-framed-print',
    title: 'GEORGE RUSSELL FRAMED PRINT',
    shortTitle: 'George Russell',
    category: 'drivers',
    categoryLabel: 'DRIVER PRINTS',
    price: 19.99,
    currency: 'GBP',
    formattedPrice: '£19.99 GBP',
    driver: 'George Russell',
    number: '63',
    team: 'Mercedes-AMG Petronas F1 Team',
    description: 'Mr. Saturday. Official Mercedes-AMG #63 blue helmet portrait and car in solid black timber frame.',
    format: 'A4 / BLACK FRAME',
    signature: 'Reproduced digital signature.',
    amazonUrl: AMAZON_STORE_URL,
    homeFrame: '/assets/products/russell_home_frame.png',
    defaultStyle: 'helmet',
    styles: [
      { id: 'helmet', label: 'HELMET & CAR', image: '/assets/products/russell_home_frame.png', caption: 'Mercedes-AMG #63 Helmet & Car Livery' }
    ],
    gallery: [
      '/assets/products/russell_home_frame.png',
      '/assets/products/frame_spec.jpg'
    ],
    details: [
      'Black wooden gallery frame with satin finish',
      'Official #63 driver details and signature'
    ],
    dimensions: {
      frame: '22.5 x 32.5 cm',
      print: 'A4 (21 x 29.7 cm)',
      depth: '18 mm',
      glazing: 'Clear acrylic'
    },
    relatedIds: ['kimi-antonelli', 'lewis-hamilton', 'silverstone', 'lando-norris']
  },
  {
    id: 'hungaroring',
    slug: 'hungaroring-framed-print',
    title: 'HUNGARORING FRAMED PRINT',
    shortTitle: 'Hungaroring',
    category: 'circuits',
    categoryLabel: 'CIRCUIT ART',
    price: 19.99,
    currency: 'GBP',
    formattedPrice: '£19.99 GBP',
    driver: null,
    number: 'HU',
    team: 'Mogyoród, Hungary',
    description: 'The twisting Hungarian jewel. Wet track rain photography and precise technical circuit map with GPS coordinates.',
    format: 'A4 / BLACK FRAME',
    signature: 'Grand Prix Circuit Specification.',
    amazonUrl: AMAZON_STORE_URL,
    homeFrame: '/assets/products/hungaroring_home_frame.png',
    defaultStyle: 'circuit',
    styles: [
      { id: 'circuit', label: 'CIRCUIT', image: '/assets/products/hungaroring_home_frame.png', caption: 'Technical Track Layout on Museum White' }
    ],
    gallery: [
      '/assets/products/hungaroring_home_frame.png',
      '/assets/products/frame_spec.jpg'
    ],
    details: [
      'Archival 250gsm museum paper',
      'Solid wooden timber frame ready to hang'
    ],
    dimensions: {
      frame: '22.5 x 32.5 cm',
      print: 'A4 (21 x 29.7 cm)',
      depth: '18 mm',
      glazing: 'Optical grade acrylic'
    },
    relatedIds: ['silverstone', 'monaco', 'barcelona', 'race-calendar']
  },
  {
    id: 'barcelona',
    slug: 'barcelona-framed-print',
    title: 'BARCELONA FRAMED PRINT',
    shortTitle: 'Barcelona',
    category: 'circuits',
    categoryLabel: 'CIRCUIT ART',
    price: 19.99,
    currency: 'GBP',
    formattedPrice: '£19.99 GBP',
    driver: null,
    number: 'ES',
    team: 'Montmeló, Catalonia, Spain',
    description: 'Circuit de Barcelona-Catalunya. Classic high-speed layout with technical track specifications and sunlit track photo.',
    format: 'A4 / BLACK FRAME',
    signature: 'Grand Prix Circuit Specification.',
    amazonUrl: AMAZON_STORE_URL,
    homeFrame: '/assets/products/barcelona_home_frame.png',
    defaultStyle: 'circuit',
    styles: [
      { id: 'circuit', label: 'CIRCUIT', image: '/assets/products/barcelona_home_frame.png', caption: 'Technical Track Layout on Museum White' }
    ],
    gallery: [
      '/assets/products/barcelona_home_frame.png',
      '/assets/products/frame_spec.jpg'
    ],
    details: [
      'High-clarity print with official sector turns',
      'Black wooden gallery frame ready to display'
    ],
    dimensions: {
      frame: '22.5 x 32.5 cm',
      print: 'A4 (21 x 29.7 cm)',
      depth: '18 mm',
      glazing: 'Optical grade acrylic'
    },
    relatedIds: ['silverstone', 'monaco', 'hungaroring', 'race-calendar']
  },
  {
    id: 'all-helmets',
    slug: 'all-helmets-framed-print',
    title: 'F1 DRIVERS HELMETS GRID FRAMED PRINT',
    shortTitle: 'Helmets Grid',
    category: 'drivers',
    categoryLabel: 'DRIVER PRINTS',
    price: 19.99,
    currency: 'GBP',
    formattedPrice: '£19.99 GBP',
    driver: null,
    number: 'GRID',
    team: 'Formula 1 World Championship',
    description: 'The complete Formula 1 drivers grid helmets showcase. All 20 championship driver helmets meticulously rendered in vibrant color and detail on pitch black.',
    format: 'A4 / BLACK FRAME',
    signature: 'Championship Grid Edition.',
    amazonUrl: AMAZON_STORE_URL,
    homeFrame: '/assets/products/helmets_home_frame.png',
    defaultStyle: 'grid',
    styles: [
      { id: 'grid', label: 'ALL HELMETS', image: '/assets/products/helmets_home_frame.png', caption: 'Formula 1 Drivers Grid Helmets' }
    ],
    gallery: [
      '/assets/products/helmets_home_frame.png',
      '/assets/products/frame_spec.jpg'
    ],
    details: [
      'All 20 F1 driver helmets in official team liveries',
      'Solid wooden frame with protective front',
      'Ready to display on wall or tabletop'
    ],
    dimensions: {
      frame: '22.5 x 32.5 cm',
      print: 'A4 (21 x 29.7 cm)',
      depth: '18 mm',
      glazing: 'Shatterproof acrylic'
    },
    relatedIds: ['race-calendar', 'lando-norris', 'lewis-hamilton', 'silverstone']
  }
];

export function getProductById(id) {
  return PRODUCTS.find(p => p.id === id || p.slug === id) || null;
}

export function getProductsByCategory(category) {
  if (!category || category === 'all') return PRODUCTS;
  return PRODUCTS.filter(p => p.category === category);
}

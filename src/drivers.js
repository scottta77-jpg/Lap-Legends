/**
 * Lap Legends - Drivers & Configuration Data Structure
 * Contains all 4 driver-and-helmet pairs, metadata, and fine-tuned alignment settings.
 */

export const CONFIG = {
  // Configurable storefront destination as requested
  storeUrl: 'https://www.amazon.co.uk/stores/LapLegends/page/4F106B9E-4F21-44E2-866C-C6AA25125C89',
  cycleDurationMs: 7000,          // ~7 seconds per driver
  transitionDurationMs: 800,       // ~0.8 seconds crossfade
  inactivityResumeDelayMs: 2200,   // Resume auto-cycle after 2.2s inactivity
  defaultDriverIndex: 0,
};

export const DRIVERS = [
  {
    id: 'lando-norris',
    index: 0,
    number: '04',
    name: 'Lando Norris',
    shortName: 'NORRIS',
    team: 'McLaren F1 Team',
    accentColor: '#D2FF00', // Electric lime
    helmetLivery: 'Neon Yellow & Carbon Fiber',
    portrait: '/assets/drivers/lando_portrait.png',
    helmet: '/assets/drivers/lando_helmet.png',
    thumbnail: '/assets/drivers/thumb_lando.png',
    alignment: {
      scale: 1.0,
      offsetX: 0.0,
      offsetY: 0.0,
      helmetScale: 0.985,
      helmetOffsetX: 0.0,
      helmetOffsetY: 0.012,
      visorCenter: { x: 0.5, y: 0.435 },
      headRadius: 0.32,
    }
  },
  {
    id: 'lewis-hamilton',
    index: 1,
    number: '44',
    name: 'Lewis Hamilton',
    shortName: 'HAMILTON',
    team: 'Mercedes-AMG Petronas F1 Team',
    accentColor: '#B65DFF', // Royal purple / electric yellow
    helmetLivery: 'Royal Purple & Electric Yellow',
    portrait: '/assets/drivers/lewis_portrait.png',
    helmet: '/assets/drivers/lewis_helmet.png',
    thumbnail: '/assets/drivers/thumb_lewis.png',
    alignment: {
      scale: 1.0,
      offsetX: 0.0,
      offsetY: 0.0,
      helmetScale: 0.99,
      helmetOffsetX: 0.0,
      helmetOffsetY: 0.006,
      visorCenter: { x: 0.5, y: 0.432 },
      headRadius: 0.32,
    }
  },
  {
    id: 'charles-leclerc',
    index: 2,
    number: '16',
    name: 'Charles Leclerc',
    shortName: 'LECLERC',
    team: 'Scuderia Ferrari',
    accentColor: '#FF2800', // Ferrari Red
    helmetLivery: 'Rosso Corsa Scarlet & White',
    portrait: '/assets/drivers/charles_portrait.png',
    helmet: '/assets/drivers/charles_helmet.png',
    thumbnail: '/assets/drivers/thumb_charles.png',
    alignment: {
      scale: 1.0,
      offsetX: 0.0,
      offsetY: 0.0,
      helmetScale: 0.992,
      helmetOffsetX: 0.0,
      helmetOffsetY: 0.008,
      visorCenter: { x: 0.5, y: 0.430 },
      headRadius: 0.32,
    }
  },
  {
    id: 'oscar-piastri',
    index: 3,
    number: '81',
    name: 'Oscar Piastri',
    shortName: 'PIASTRI',
    team: 'McLaren F1 Team',
    accentColor: '#FF8700', // Papaya orange
    helmetLivery: 'Papaya Orange & Electric Yellow',
    portrait: '/assets/drivers/oscar_portrait.png',
    helmet: '/assets/drivers/oscar_helmet.png',
    thumbnail: '/assets/drivers/thumb_oscar.png',
    alignment: {
      scale: 1.0,
      offsetX: 0.0,
      offsetY: 0.0,
      helmetScale: 0.99,
      helmetOffsetX: 0.0,
      helmetOffsetY: 0.010,
      visorCenter: { x: 0.5, y: 0.432 },
      headRadius: 0.32,
    }
  }
];

import { DataSource } from 'typeorm';
import { FarmItem } from '../../modules/farm/entities/farm-item.entity';
import { FarmZone } from '../../modules/zones/entities/farm-zone.entity';

export async function seedFarmItems(dataSource: DataSource): Promise<void> {
  const itemRepository = dataSource.getRepository(FarmItem);
  const zoneRepository = dataSource.getRepository(FarmZone);

  // Check if items already exist
  const existingItems = await itemRepository.count();
  if (existingItems > 0) {
    console.log('Farm items already seeded, skipping...');
    return;
  }

  // Get zones for reference
  const biologyZone = await zoneRepository.findOne({ where: { zoneType: 'biology' } });
  const chemistryZone = await zoneRepository.findOne({ where: { zoneType: 'chemistry' } });
  const physicsZone = await zoneRepository.findOne({ where: { zoneType: 'physics' } });
  const mathZone = await zoneRepository.findOne({ where: { zoneType: 'mathematics' } });
  const itZone = await zoneRepository.findOne({ where: { zoneType: 'it' } });

  const items = [
    // Biology Zone Items
    {
      name: 'Tomato Seeds',
      description: 'Plant and grow tomatoes to learn about plant biology',
      category: 'seed' as const,
      iconEmoji: '🍅',
      zoneId: biologyZone?.id,
      productionTime: 300, // 5 minutes
      sellPriceNpc: 10,
      unlockTasksRequired: 0,
    },
    {
      name: 'Tomato',
      description: 'Fresh ripe tomato',
      category: 'crop' as const,
      iconEmoji: '🍅',
      zoneId: biologyZone?.id,
      productionTime: 0,
      sellPriceNpc: 25,
      unlockTasksRequired: 0,
    },
    {
      name: 'Wheat Seeds',
      description: 'Grow wheat to understand photosynthesis',
      category: 'seed' as const,
      iconEmoji: '🌾',
      zoneId: biologyZone?.id,
      productionTime: 600, // 10 minutes
      sellPriceNpc: 15,
      unlockTasksRequired: 1,
    },
    {
      name: 'Wheat',
      description: 'Golden wheat ready for processing',
      category: 'crop' as const,
      iconEmoji: '🌾',
      zoneId: biologyZone?.id,
      productionTime: 0,
      sellPriceNpc: 35,
      unlockTasksRequired: 1,
    },
    {
      name: 'Milk',
      description: 'Fresh milk from happy cows',
      category: 'animal_product' as const,
      iconEmoji: '🥛',
      zoneId: biologyZone?.id,
      productionTime: 0,
      sellPriceNpc: 40,
      unlockTasksRequired: 2,
    },
    {
      name: 'Eggs',
      description: 'Farm fresh eggs',
      category: 'animal_product' as const,
      iconEmoji: '🥚',
      zoneId: biologyZone?.id,
      productionTime: 0,
      sellPriceNpc: 30,
      unlockTasksRequired: 2,
    },

    // Chemistry Zone Items
    {
      name: 'Fertilizer',
      description: 'Chemical compound to boost plant growth',
      category: 'processed' as const,
      iconEmoji: '🧪',
      zoneId: chemistryZone?.id,
      productionTime: 180, // 3 minutes
      sellPriceNpc: 50,
      unlockTasksRequired: 0,
    },
    {
      name: 'Bio-Fuel',
      description: 'Eco-friendly fuel from organic compounds',
      category: 'processed' as const,
      iconEmoji: '⚗️',
      zoneId: chemistryZone?.id,
      productionTime: 420, // 7 minutes
      sellPriceNpc: 75,
      unlockTasksRequired: 2,
    },
    {
      name: 'pH Solution',
      description: 'Chemical solution for soil optimization',
      category: 'processed' as const,
      iconEmoji: '🧫',
      zoneId: chemistryZone?.id,
      productionTime: 240, // 4 minutes
      sellPriceNpc: 60,
      unlockTasksRequired: 3,
    },

    // Physics Zone Items
    {
      name: 'Solar Panel',
      description: 'Harness energy from the sun',
      category: 'processed' as const,
      iconEmoji: '☀️',
      zoneId: physicsZone?.id,
      productionTime: 900, // 15 minutes
      sellPriceNpc: 120,
      unlockTasksRequired: 5,
    },
    {
      name: 'Water Pump',
      description: 'Use physics principles to move water',
      category: 'processed' as const,
      iconEmoji: '💧',
      zoneId: physicsZone?.id,
      productionTime: 540, // 9 minutes
      sellPriceNpc: 90,
      unlockTasksRequired: 4,
    },

    // Math Zone Items
    {
      name: 'Calculator Chip',
      description: 'Mathematical computing component',
      category: 'processed' as const,
      iconEmoji: '🔢',
      zoneId: mathZone?.id,
      productionTime: 360, // 6 minutes
      sellPriceNpc: 85,
      unlockTasksRequired: 0,
    },
    {
      name: 'Geometry Tool',
      description: 'Precision tool for optimal farm layouts',
      category: 'processed' as const,
      iconEmoji: '📐',
      zoneId: mathZone?.id,
      productionTime: 300, // 5 minutes
      sellPriceNpc: 70,
      unlockTasksRequired: 3,
    },

    // IT Zone Items
    {
      name: 'Automation Script',
      description: 'Code to automate farm processes',
      category: 'processed' as const,
      iconEmoji: '💻',
      zoneId: itZone?.id,
      productionTime: 720, // 12 minutes
      sellPriceNpc: 150,
      unlockTasksRequired: 8,
    },
    {
      name: 'AI Module',
      description: 'Artificial intelligence for farm optimization',
      category: 'processed' as const,
      iconEmoji: '🤖',
      zoneId: itZone?.id,
      productionTime: 1200, // 20 minutes
      sellPriceNpc: 200,
      unlockTasksRequired: 10,
    },
  ];

  const createdItems = itemRepository.create(items);
  await itemRepository.save(createdItems);

  console.log(`✅ Seeded ${items.length} farm items successfully!`);
}

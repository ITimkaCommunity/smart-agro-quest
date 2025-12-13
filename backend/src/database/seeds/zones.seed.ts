import { DataSource } from 'typeorm';
import { FarmZone } from '../../modules/zones/entities/farm-zone.entity';

export async function seedZones(dataSource: DataSource): Promise<void> {
  const zoneRepository = dataSource.getRepository(FarmZone);

  // Check if zones already exist
  const existingZones = await zoneRepository.count();
  if (existingZones > 0) {
    console.log('Zones already seeded, skipping...');
    return;
  }

  const zones = [
    {
      name: 'Biology Zone',
      zoneType: 'biology' as const,
      description: 'Study living organisms, cells, and ecosystems. Grow plants and learn about photosynthesis, genetics, and biodiversity.',
      iconUrl: '/assets/zone-biology.png',
      unlockLevel: 1,
      allowedSlotTypes: ['plants', 'animals', 'production'],
    },
    {
      name: 'Chemistry Zone',
      zoneType: 'chemistry' as const,
      description: 'Explore chemical reactions, elements, and compounds. Mix ingredients and discover the periodic table through experiments.',
      iconUrl: '/assets/zone-chemistry.png',
      unlockLevel: 1,
      allowedSlotTypes: ['plants', 'animals', 'production'],
    },
    {
      name: 'Physics Zone',
      zoneType: 'physics' as const,
      description: 'Master the laws of motion, energy, and forces. Build machines and understand mechanics, electricity, and thermodynamics.',
      iconUrl: '/assets/zone-physics.png',
      unlockLevel: 3,
      allowedSlotTypes: ['plants', 'animals', 'production'],
    },
    {
      name: 'Mathematics Zone',
      zoneType: 'mathematics' as const,
      description: 'Solve problems with numbers, geometry, and algebra. Calculate optimal farm layouts and resource distributions.',
      iconUrl: '/assets/zone-math.png',
      unlockLevel: 1,
      allowedSlotTypes: ['plants', 'animals', 'production'],
    },
    {
      name: 'IT Zone',
      zoneType: 'it' as const,
      description: 'Learn programming, algorithms, and computer science. Automate your farm with code and build digital systems.',
      iconUrl: '/assets/zone-it.png',
      unlockLevel: 5,
      allowedSlotTypes: ['plants', 'animals', 'production'],
    },
  ];

  const createdZones = zoneRepository.create(zones);
  await zoneRepository.save(createdZones);

  console.log(`✅ Seeded ${zones.length} zones successfully!`);
}

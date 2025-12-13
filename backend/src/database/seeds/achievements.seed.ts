import { DataSource } from 'typeorm';
import { Achievement } from '../../modules/achievements/entities/achievement.entity';

export async function seedAchievements(dataSource: DataSource): Promise<void> {
  const achievementRepository = dataSource.getRepository(Achievement);

  // Check if achievements already exist
  const existingAchievements = await achievementRepository.count();
  if (existingAchievements > 0) {
    console.log('Achievements already seeded, skipping...');
    return;
  }

  const achievements = [
    // Level Achievements
    {
      title: 'Getting Started',
      description: 'Reach level 5 in any zone',
      icon: '🌱',
      rarity: 'common' as const,
      conditionType: 'level_reached',
      conditionValue: 5,
    },
    {
      title: 'Rising Scholar',
      description: 'Reach level 10 in any zone',
      icon: '📚',
      rarity: 'common' as const,
      conditionType: 'level_reached',
      conditionValue: 10,
    },
    {
      title: 'Expert Learner',
      description: 'Reach level 20 in any zone',
      icon: '🎓',
      rarity: 'rare' as const,
      conditionType: 'level_reached',
      conditionValue: 20,
    },
    {
      title: 'Master of Science',
      description: 'Reach level 50 in any zone',
      icon: '🔬',
      rarity: 'epic' as const,
      conditionType: 'level_reached',
      conditionValue: 50,
    },
    {
      title: 'Legendary Genius',
      description: 'Reach level 100 in any zone',
      icon: '👑',
      rarity: 'legendary' as const,
      conditionType: 'level_reached',
      conditionValue: 100,
    },

    // XP Achievements
    {
      title: 'First Steps',
      description: 'Earn your first 100 XP',
      icon: '⭐',
      rarity: 'common' as const,
      conditionType: 'xp_earned',
      conditionValue: 100,
    },
    {
      title: 'Knowledge Seeker',
      description: 'Earn 1,000 total XP',
      icon: '✨',
      rarity: 'common' as const,
      conditionType: 'xp_earned',
      conditionValue: 1000,
    },
    {
      title: 'Experience Master',
      description: 'Earn 10,000 total XP',
      icon: '💫',
      rarity: 'rare' as const,
      conditionType: 'xp_earned',
      conditionValue: 10000,
    },
    {
      title: 'XP Collector',
      description: 'Earn 50,000 total XP',
      icon: '🌟',
      rarity: 'epic' as const,
      conditionType: 'xp_earned',
      conditionValue: 50000,
    },

    // Task Achievements
    {
      title: 'Task Beginner',
      description: 'Complete 5 tasks',
      icon: '📝',
      rarity: 'common' as const,
      conditionType: 'tasks_completed',
      conditionValue: 5,
    },
    {
      title: 'Dedicated Student',
      description: 'Complete 25 tasks',
      icon: '📖',
      rarity: 'common' as const,
      conditionType: 'tasks_completed',
      conditionValue: 25,
    },
    {
      title: 'Task Master',
      description: 'Complete 50 tasks',
      icon: '📋',
      rarity: 'rare' as const,
      conditionType: 'tasks_completed',
      conditionValue: 50,
    },
    {
      title: 'Assignment Hero',
      description: 'Complete 100 tasks',
      icon: '🏆',
      rarity: 'epic' as const,
      conditionType: 'tasks_completed',
      conditionValue: 100,
    },
    {
      title: 'Perfect Score',
      description: 'Get a perfect grade (100%) on any task',
      icon: '💯',
      rarity: 'rare' as const,
      conditionType: 'perfect_grade',
      conditionValue: 1,
    },
    {
      title: 'Perfectionist',
      description: 'Get perfect grades on 10 tasks',
      icon: '🌟',
      rarity: 'epic' as const,
      conditionType: 'perfect_grade',
      conditionValue: 10,
    },

    // Farm Achievements
    {
      title: 'First Harvest',
      description: 'Harvest your first plant',
      icon: '🌾',
      rarity: 'common' as const,
      conditionType: 'plants_harvested',
      conditionValue: 1,
    },
    {
      title: 'Green Thumb',
      description: 'Harvest 25 plants',
      icon: '🌿',
      rarity: 'common' as const,
      conditionType: 'plants_harvested',
      conditionValue: 25,
    },
    {
      title: 'Master Farmer',
      description: 'Harvest 100 plants',
      icon: '👨‍🌾',
      rarity: 'rare' as const,
      conditionType: 'plants_harvested',
      conditionValue: 100,
    },
    {
      title: 'Animal Caretaker',
      description: 'Collect resources from animals 20 times',
      icon: '🐄',
      rarity: 'common' as const,
      conditionType: 'animals_collected',
      conditionValue: 20,
    },
    {
      title: 'Production Expert',
      description: 'Complete 50 production chains',
      icon: '⚙️',
      rarity: 'rare' as const,
      conditionType: 'productions_completed',
      conditionValue: 50,
    },

    // Pet Achievements
    {
      title: 'Pet Lover',
      description: 'Create your first pet',
      icon: '🐾',
      rarity: 'common' as const,
      conditionType: 'pets_created',
      conditionValue: 1,
    },
    {
      title: 'Caring Owner',
      description: 'Feed your pet 50 times',
      icon: '🍖',
      rarity: 'common' as const,
      conditionType: 'pet_fed',
      conditionValue: 50,
    },
    {
      title: 'Best Friend',
      description: 'Reach max happiness with a pet',
      icon: '💖',
      rarity: 'rare' as const,
      conditionType: 'pet_max_happiness',
      conditionValue: 1,
    },

    // Multi-Zone Achievements
    {
      title: 'Renaissance Student',
      description: 'Reach level 10 in 3 different zones',
      icon: '🎨',
      rarity: 'epic' as const,
      conditionType: 'multi_zone_level',
      conditionValue: 3,
    },
    {
      title: 'Polymath',
      description: 'Reach level 20 in all 5 zones',
      icon: '🧠',
      rarity: 'legendary' as const,
      conditionType: 'all_zones_level',
      conditionValue: 5,
    },
  ];

  const createdAchievements = achievementRepository.create(achievements);
  await achievementRepository.save(createdAchievements);

  console.log(`✅ Seeded ${achievements.length} achievements successfully!`);
}

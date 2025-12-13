import { DataSource } from 'typeorm';
import { Task } from '../../modules/tasks/entities/task.entity';
import { FarmZone } from '../../modules/zones/entities/farm-zone.entity';

export async function seedTasks(dataSource: DataSource): Promise<void> {
  const taskRepository = dataSource.getRepository(Task);
  const zoneRepository = dataSource.getRepository(FarmZone);

  // Check if tasks already exist
  const existingTasks = await taskRepository.count();
  if (existingTasks > 0) {
    console.log('Tasks already seeded, skipping...');
    return;
  }

  // Get zones for reference
  const biologyZone = await zoneRepository.findOne({ where: { zoneType: 'biology' } });
  const chemistryZone = await zoneRepository.findOne({ where: { zoneType: 'chemistry' } });
  const physicsZone = await zoneRepository.findOne({ where: { zoneType: 'physics' } });
  const mathZone = await zoneRepository.findOne({ where: { zoneType: 'mathematics' } });
  const itZone = await zoneRepository.findOne({ where: { zoneType: 'it' } });

  const tasks = [
    // Biology Zone Tasks
    {
      title: 'Introduction to Cells',
      description: 'Learn about the basic structure and function of cells',
      instructions: 'Study the provided materials about cell organelles and their functions. Answer the quiz questions about mitochondria, nucleus, and cell membrane.',
      zoneId: biologyZone?.id,
      difficulty: 1,
      experienceReward: 100,
      requiredLevel: 1,
      targetGrades: [80, 90, 100],
      attachmentUrls: [],
    },
    {
      title: 'Photosynthesis Process',
      description: 'Understand how plants convert light energy to chemical energy',
      instructions: 'Read about photosynthesis and complete the diagram labeling exercise. Explain the role of chlorophyll and the importance of sunlight.',
      zoneId: biologyZone?.id,
      difficulty: 2,
      experienceReward: 150,
      requiredLevel: 3,
      targetGrades: [80, 90, 100],
      attachmentUrls: [],
    },
    {
      title: 'Genetics and DNA',
      description: 'Explore the basics of heredity and genetic information',
      instructions: 'Complete the Punnett square exercises and answer questions about dominant and recessive traits.',
      zoneId: biologyZone?.id,
      difficulty: 3,
      experienceReward: 200,
      requiredLevel: 5,
      targetGrades: [75, 85, 95],
      attachmentUrls: [],
    },

    // Chemistry Zone Tasks
    {
      title: 'Periodic Table Basics',
      description: 'Learn about elements and their organization',
      instructions: 'Memorize the first 20 elements of the periodic table. Complete the quiz about atomic numbers and element symbols.',
      zoneId: chemistryZone?.id,
      difficulty: 1,
      experienceReward: 100,
      requiredLevel: 1,
      targetGrades: [80, 90, 100],
      attachmentUrls: [],
    },
    {
      title: 'Chemical Reactions',
      description: 'Understand how substances interact and transform',
      instructions: 'Balance chemical equations and identify reaction types (synthesis, decomposition, replacement).',
      zoneId: chemistryZone?.id,
      difficulty: 2,
      experienceReward: 150,
      requiredLevel: 3,
      targetGrades: [80, 90, 100],
      attachmentUrls: [],
    },
    {
      title: 'Acids and Bases',
      description: 'Learn about pH and chemical properties',
      instructions: 'Conduct virtual experiments with pH indicators and solve problems about acid-base neutralization.',
      zoneId: chemistryZone?.id,
      difficulty: 3,
      experienceReward: 200,
      requiredLevel: 5,
      targetGrades: [75, 85, 95],
      attachmentUrls: [],
    },

    // Physics Zone Tasks
    {
      title: 'Newton\'s Laws of Motion',
      description: 'Master the fundamental laws of physics',
      instructions: 'Solve problems involving force, mass, and acceleration. Apply Newton\'s three laws to real-world scenarios.',
      zoneId: physicsZone?.id,
      difficulty: 2,
      experienceReward: 150,
      requiredLevel: 3,
      targetGrades: [80, 90, 100],
      attachmentUrls: [],
    },
    {
      title: 'Energy and Work',
      description: 'Understand energy transformations and work calculations',
      instructions: 'Calculate kinetic and potential energy in various situations. Solve work and power problems.',
      zoneId: physicsZone?.id,
      difficulty: 3,
      experienceReward: 200,
      requiredLevel: 5,
      targetGrades: [75, 85, 95],
      attachmentUrls: [],
    },
    {
      title: 'Electricity Basics',
      description: 'Learn about electric current, voltage, and resistance',
      instructions: 'Apply Ohm\'s Law to circuit problems. Calculate series and parallel circuit properties.',
      zoneId: physicsZone?.id,
      difficulty: 4,
      experienceReward: 250,
      requiredLevel: 8,
      targetGrades: [70, 80, 90],
      attachmentUrls: [],
    },

    // Mathematics Zone Tasks
    {
      title: 'Algebraic Expressions',
      description: 'Simplify and solve algebraic equations',
      instructions: 'Solve linear equations and simplify algebraic expressions. Practice combining like terms.',
      zoneId: mathZone?.id,
      difficulty: 1,
      experienceReward: 100,
      requiredLevel: 1,
      targetGrades: [80, 90, 100],
      attachmentUrls: [],
    },
    {
      title: 'Geometry Fundamentals',
      description: 'Calculate areas, perimeters, and volumes',
      instructions: 'Solve geometry problems involving triangles, circles, and rectangles. Apply formulas for area and volume.',
      zoneId: mathZone?.id,
      difficulty: 2,
      experienceReward: 150,
      requiredLevel: 3,
      targetGrades: [80, 90, 100],
      attachmentUrls: [],
    },
    {
      title: 'Functions and Graphs',
      description: 'Understand mathematical functions and their graphs',
      instructions: 'Plot linear and quadratic functions. Identify function properties like slope and intercepts.',
      zoneId: mathZone?.id,
      difficulty: 3,
      experienceReward: 200,
      requiredLevel: 5,
      targetGrades: [75, 85, 95],
      attachmentUrls: [],
    },
    {
      title: 'Probability and Statistics',
      description: 'Learn to analyze data and calculate probabilities',
      instructions: 'Calculate mean, median, and mode. Solve probability problems with combinations and permutations.',
      zoneId: mathZone?.id,
      difficulty: 4,
      experienceReward: 250,
      requiredLevel: 7,
      targetGrades: [70, 80, 90],
      attachmentUrls: [],
    },

    // IT Zone Tasks
    {
      title: 'Introduction to Programming',
      description: 'Learn basic programming concepts',
      instructions: 'Write simple programs using variables, loops, and conditions. Complete coding exercises in Python or JavaScript.',
      zoneId: itZone?.id,
      difficulty: 2,
      experienceReward: 150,
      requiredLevel: 5,
      targetGrades: [80, 90, 100],
      attachmentUrls: [],
    },
    {
      title: 'Data Structures Basics',
      description: 'Understand arrays, lists, and basic data structures',
      instructions: 'Implement and manipulate arrays and lists. Solve problems involving data structure operations.',
      zoneId: itZone?.id,
      difficulty: 3,
      experienceReward: 200,
      requiredLevel: 8,
      targetGrades: [75, 85, 95],
      attachmentUrls: [],
    },
    {
      title: 'Algorithms and Problem Solving',
      description: 'Learn algorithmic thinking and problem-solving strategies',
      instructions: 'Implement sorting and searching algorithms. Analyze time complexity and optimize solutions.',
      zoneId: itZone?.id,
      difficulty: 4,
      experienceReward: 250,
      requiredLevel: 10,
      targetGrades: [70, 80, 90],
      attachmentUrls: [],
    },
    {
      title: 'Web Development Fundamentals',
      description: 'Create basic web pages with HTML and CSS',
      instructions: 'Build a responsive web page using HTML5 and CSS3. Apply styling and layout techniques.',
      zoneId: itZone?.id,
      difficulty: 3,
      experienceReward: 200,
      requiredLevel: 7,
      targetGrades: [75, 85, 95],
      attachmentUrls: [],
    },
  ];

  const createdTasks = taskRepository.create(tasks);
  await taskRepository.save(createdTasks);

  console.log(`✅ Seeded ${tasks.length} tasks successfully!`);
}

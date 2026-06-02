/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Course, CalendarEvent, Task, Folder, Note, HabitCategory, HabitLog, JournalEntry, VisionItem, DashboardVisionPin } from './types';

export const INITIAL_HABIT_CATEGORIES: HabitCategory[] = [
  {
    id: 'cat-morning',
    name: 'Morning Routine',
    habits: [
      { id: 'h-meditate', name: 'Meditate (10 min)' },
      { id: 'h-stretch', name: 'Stretching & Mobility' },
      { id: 'h-water-morning', name: 'Hydrate (500ml)' }
    ]
  },
  {
    id: 'cat-study',
    name: 'Core Study Block',
    habits: [
      { id: 'h-code', name: 'Code Projects Review' },
      { id: 'h-read-text', name: 'Read Syllabus Lecture Notes' },
      { id: 'h-practice', name: 'Solve Lab Exercises' }
    ]
  },
  {
    id: 'cat-wellness',
    name: 'Active Wellness',
    habits: [
      { id: 'h-water-day', name: 'Hydrate (2L total)' },
      { id: 'h-walk', name: 'Outdoor Walk (30 min)' }
    ]
  },
  {
    id: 'cat-evening',
    name: 'Evening Calm',
    habits: [
      { id: 'h-read-book', name: 'Screen-free Reading' },
      { id: 'h-plan', name: 'Review & Plan Tomorrow' }
    ]
  }
];

export const INITIAL_HABIT_LOGS: HabitLog[] = [
  {
    id: 'log-2026-06-02',
    date: '2026-06-02',
    completedHabits: {
      'h-meditate': true, 'h-stretch': true, 'h-water-morning': true,
      'h-code': true, 'h-read-text': false, 'h-practice': true,
      'h-water-day': true, 'h-walk': false,
      'h-read-book': false, 'h-plan': true
    }
  },
  {
    id: 'log-2026-06-01',
    date: '2026-06-01',
    completedHabits: {
      'h-meditate': true, 'h-stretch': true, 'h-water-morning': true,
      'h-code': true, 'h-read-text': true, 'h-practice': true,
      'h-water-day': true, 'h-walk': true,
      'h-read-book': true, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-31',
    date: '2026-05-31',
    completedHabits: {
      'h-meditate': true, 'h-stretch': false, 'h-water-morning': true,
      'h-code': true, 'h-read-text': false, 'h-practice': false,
      'h-water-day': true, 'h-walk': true,
      'h-read-book': false, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-30',
    date: '2026-05-30',
    completedHabits: {
      'h-meditate': true, 'h-stretch': true, 'h-water-morning': true,
      'h-code': true, 'h-read-text': true, 'h-practice': true,
      'h-water-day': true, 'h-walk': true,
      'h-read-book': true, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-29',
    date: '2026-05-29',
    completedHabits: {
      'h-meditate': true, 'h-stretch': true, 'h-water-morning': true,
      'h-code': true, 'h-read-text': false, 'h-practice': true,
      'h-water-day': true, 'h-walk': false,
      'h-read-book': false, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-28',
    date: '2026-05-28',
    completedHabits: {
      'h-meditate': true, 'h-stretch': false, 'h-water-morning': true,
      'h-code': false, 'h-read-text': false, 'h-practice': false,
      'h-water-day': true, 'h-walk': true,
      'h-read-book': true, 'h-plan': false
    }
  },
  {
    id: 'log-2026-05-27',
    date: '2026-05-27',
    completedHabits: {
      'h-meditate': true, 'h-stretch': true, 'h-water-morning': true,
      'h-code': true, 'h-read-text': true, 'h-practice': false,
      'h-water-day': true, 'h-walk': true,
      'h-read-book': true, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-26',
    date: '2026-05-26',
    completedHabits: {
      'h-meditate': false, 'h-stretch': false, 'h-water-morning': true,
      'h-code': true, 'h-read-text': false, 'h-practice': true,
      'h-water-day': false, 'h-walk': true,
      'h-read-book': false, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-25',
    date: '2026-05-25',
    completedHabits: {
      'h-meditate': true, 'h-stretch': true, 'h-water-morning': true,
      'h-code': true, 'h-read-text': true, 'h-practice': true,
      'h-water-day': true, 'h-walk': true,
      'h-read-book': true, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-24',
    date: '2026-05-24',
    completedHabits: {
      'h-meditate': true, 'h-stretch': true, 'h-water-morning': true,
      'h-code': false, 'h-read-text': false, 'h-practice': false,
      'h-water-day': true, 'h-walk': false,
      'h-read-book': true, 'h-plan': false
    }
  },
  {
    id: 'log-2026-05-23',
    date: '2026-05-23',
    completedHabits: {
      'h-meditate': false, 'h-stretch': true, 'h-water-morning': true,
      'h-code': true, 'h-read-text': true, 'h-practice': true,
      'h-water-day': true, 'h-walk': true,
      'h-read-book': false, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-22',
    date: '2026-05-22',
    completedHabits: {
      'h-meditate': true, 'h-stretch': true, 'h-water-morning': true,
      'h-code': true, 'h-read-text': true, 'h-practice': true,
      'h-water-day': true, 'h-walk': true,
      'h-read-book': true, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-21',
    date: '2026-05-21',
    completedHabits: {
      'h-meditate': true, 'h-stretch': false, 'h-water-morning': true,
      'h-code': true, 'h-read-text': false, 'h-practice': false,
      'h-water-day': true, 'h-walk': true,
      'h-read-book': false, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-20',
    date: '2026-05-20',
    completedHabits: {
      'h-meditate': true, 'h-stretch': true, 'h-water-morning': true,
      'h-code': true, 'h-read-text': true, 'h-practice': true,
      'h-water-day': true, 'h-walk': true,
      'h-read-book': true, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-19',
    date: '2026-05-19',
    completedHabits: {
      'h-meditate': true, 'h-stretch': true, 'h-water-morning': true,
      'h-code': true, 'h-read-text': false, 'h-practice': true,
      'h-water-day': true, 'h-walk': false,
      'h-read-book': false, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-18',
    date: '2026-05-18',
    completedHabits: {
      'h-meditate': true, 'h-stretch': false, 'h-water-morning': true,
      'h-code': false, 'h-read-text': false, 'h-practice': false,
      'h-water-day': true, 'h-walk': true,
      'h-read-book': true, 'h-plan': false
    }
  },
  {
    id: 'log-2026-05-17',
    date: '2026-05-17',
    completedHabits: {
      'h-meditate': true, 'h-stretch': true, 'h-water-morning': true,
      'h-code': true, 'h-read-text': true, 'h-practice': false,
      'h-water-day': true, 'h-walk': true,
      'h-read-book': true, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-16',
    date: '2026-05-16',
    completedHabits: {
      'h-meditate': false, 'h-stretch': false, 'h-water-morning': true,
      'h-code': true, 'h-read-text': false, 'h-practice': true,
      'h-water-day': false, 'h-walk': true,
      'h-read-book': false, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-15',
    date: '2026-05-15',
    completedHabits: {
      'h-meditate': true, 'h-stretch': true, 'h-water-morning': true,
      'h-code': true, 'h-read-text': true, 'h-practice': true,
      'h-water-day': true, 'h-walk': true,
      'h-read-book': true, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-14',
    date: '2026-05-14',
    completedHabits: {
      'h-meditate': true, 'h-stretch': true, 'h-water-morning': true,
      'h-code': false, 'h-read-text': false, 'h-practice': false,
      'h-water-day': true, 'h-walk': false,
      'h-read-book': true, 'h-plan': false
    }
  },
  {
    id: 'log-2026-05-13',
    date: '2026-05-13',
    completedHabits: {
      'h-meditate': false, 'h-stretch': true, 'h-water-morning': true,
      'h-code': true, 'h-read-text': true, 'h-practice': true,
      'h-water-day': true, 'h-walk': true,
      'h-read-book': false, 'h-plan': true
    }
  },
  {
    id: 'log-2026-05-12',
    date: '2026-05-12',
    completedHabits: {
      'h-meditate': true, 'h-stretch': true, 'h-water-morning': true,
      'h-code': true, 'h-read-text': true, 'h-practice': true,
      'h-water-day': true, 'h-walk': true,
      'h-read-book': true, 'h-plan': true
    }
  }
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-2026-06-02',
    userId: 'student-1',
    dateCreated: '2026-06-02',
    timeCreated: '19:45',
    lastModified: new Date('2026-06-02T19:45:00Z').toISOString(),
    type: 'daily',
    title: 'Midterm Preparation Kickoff',
    content: '<p>Successfully resolved operating system memory leaks today. Feeling confident. Hydration habits are completely green for the third day straight. Spent some extra time setting up the Discrete Maths study plan. Grateful for clear documentation and peer code reviews.</p>',
    mood: {
      score: 8,
      type: 'happy',
      energyLevel: 7,
      stressLevel: 4,
      motivationLevel: 8,
      sleepQuality: 8
    },
    wellness: {
      anxietyLevel: 3,
      focusLevel: 8,
      exerciseCompleted: true,
      workloadPressure: 5,
      assignmentConfidence: 8,
      productivityRating: 8
    },
    gratitudeItems: [
      'Finding the memory leak in the C OS simulation project.',
      'A great cup of matcha latte in the campus library cafe.',
      'Warm weather and a short stroll through the park.'
    ],
    tags: ['Academics', 'Success', 'Productivity'],
    images: [],
    isLocked: false
  },
  {
    id: 'entry-2026-05-30',
    userId: 'student-1',
    dateCreated: '2026-05-30',
    timeCreated: '21:30',
    lastModified: new Date('2026-05-30T21:30:00Z').toISOString(),
    type: 'daily',
    title: 'Operating Systems Lab Breakthrough',
    content: '<p>Today was an intensely productive but physically exhausting day. I spent over 4 hours debugging the multithreading process scheduling logic in C for the OS Lab assignment. Finally got the mutex locks and semaphores working without causing deadlocks! I felt stressed in the afternoon, but coding projects always bring a sense of resolution.</p>',
    mood: {
      score: 8,
      type: 'happy',
      energyLevel: 6,
      stressLevel: 5,
      motivationLevel: 9,
      sleepQuality: 7
    },
    wellness: {
      anxietyLevel: 3,
      focusLevel: 9,
      exerciseCompleted: false,
      workloadPressure: 7,
      assignmentConfidence: 9,
      productivityRating: 9
    },
    gratitudeItems: [
      'The clean, error-free compile of the scheduler simulation code.',
      'Hot peppermint tea during the long evening coding session.',
      'Friendly peer advice on threads from my classmate Alice.'
    ],
    tags: ['Success', 'Goals', 'Stress'],
    images: [],
    isLocked: false
  },
  {
    id: 'entry-2026-05-29',
    userId: 'student-1',
    dateCreated: '2026-05-29',
    timeCreated: '22:15',
    lastModified: new Date('2026-05-29T22:15:00Z').toISOString(),
    type: 'gratitude',
    title: 'End of Week Reflections & Gratitude Log',
    content: '<p>Enrolled in a new class and started mapping the semester revision phase. The workload is picking up, but I am keeping up with my habit check-ins. Daily stretches and hydration are helping me stay grounded.</p>',
    mood: {
      score: 9,
      type: 'very_happy',
      energyLevel: 8,
      stressLevel: 2,
      motivationLevel: 9,
      sleepQuality: 8
    },
    wellness: {
      anxietyLevel: 2,
      focusLevel: 8,
      exerciseCompleted: true,
      workloadPressure: 4,
      assignmentConfidence: 8,
      productivityRating: 8
    },
    gratitudeItems: [
      'Getting a full 8 hours of high-quality sleep.',
      'Finding a quiet study desk in the main library auditorium.',
      'A simple, clear plan for tomorrow\'s homework sheets.'
    ],
    tags: ['Health', 'Goals'],
    images: [],
    isLocked: false
  },
  {
    id: 'entry-2026-05-25',
    userId: 'student-1',
    dateCreated: '2026-05-25',
    timeCreated: '20:10',
    lastModified: new Date('2026-05-25T20:10:00Z').toISOString(),
    type: 'reflection',
    title: 'Mid-Semester Goal Checkin',
    content: '<p>Reflecting on my vision board. I am making steady progress toward graduation and internship applications. I need to boost my stamina for the upcoming half marathon training. Focus has been slightly inconsistent, but standard frameworks practice is paying off.</p>',
    mood: {
      score: 6,
      type: 'neutral',
      energyLevel: 5,
      stressLevel: 6,
      motivationLevel: 7,
      sleepQuality: 6
    },
    wellness: {
      anxietyLevel: 5,
      focusLevel: 6,
      exerciseCompleted: true,
      workloadPressure: 6,
      assignmentConfidence: 7,
      productivityRating: 6
    },
    gratitudeItems: [
      'Fresh fruit for breakfast.',
      'Finishing my database reading chapter.',
      'Friendly chat with my advisor.'
    ],
    tags: ['Reflections', 'Goals'],
    images: [],
    isLocked: false
  },
  {
    id: 'entry-2026-05-20',
    userId: 'student-1',
    dateCreated: '2026-05-20',
    timeCreated: '23:05',
    lastModified: new Date('2026-05-20T23:05:00Z').toISOString(),
    type: 'reflection',
    title: 'Dealing with Midterm Exam Stress',
    content: '<p>Tough day preparing for Discrete Mathematics proofs. Felt a bit overwhelmed by induction logic. However, taking a 30-minute walk outside helped clear my head. Tomorrow is a new day to reset.</p>',
    mood: {
      score: 4,
      type: 'stressed',
      energyLevel: 4,
      stressLevel: 8,
      motivationLevel: 5,
      sleepQuality: 5
    },
    wellness: {
      anxietyLevel: 7,
      focusLevel: 5,
      exerciseCompleted: true,
      workloadPressure: 8,
      assignmentConfidence: 4,
      productivityRating: 4
    },
    gratitudeItems: [
      'Supportive study group calls.',
      'Hot shower after a long study block.',
      'A quiet library environment.'
    ],
    tags: ['Stress', 'Exams'],
    images: [],
    isLocked: false
  }
];

export const INITIAL_VISION_ITEMS: VisionItem[] = [
  {
    id: 'vision-1',
    title: 'Graduate First Class Honours',
    description: 'Maintain high GPA across all computer science subjects to secure academic excellence.',
    motivationStatement: 'Knowledge is power. Success comes from consistent day-to-day study.',
    imageDataUrl: '/images/graduation.png',
    category: 'academic',
    status: 'in_progress',
    priority: 'high',
    progress: 72,
    targetDate: '2027-06-15',
    tags: ['GPA', 'Exams', 'Degree'],
    milestones: [
      { id: 'm-1', visionId: 'vision-1', title: 'Complete Semester 1 exams', isCompleted: true },
      { id: 'm-2', visionId: 'vision-1', title: 'Maintain GPA > 3.7', isCompleted: true },
      { id: 'm-3', visionId: 'vision-1', title: 'Finish Capstone Relational Prototype', isCompleted: false }
    ],
    isPinned: true,
    isArchived: false,
    linkedTaskIds: ['task-1', 'task-2'],
    linkedJournalIds: ['entry-2026-06-02'],
    createdAt: new Date('2026-05-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-06-02T19:00:00Z').toISOString()
  },
  {
    id: 'vision-2',
    title: 'Securing Tech Internship',
    description: 'Apply to top software engineering firms and prepare data structure proofs.',
    motivationStatement: 'Practice daily Leetcode/HackerRank challenges. Keep compiling ideas.',
    imageDataUrl: '/images/internship.png',
    category: 'career',
    status: 'planning',
    priority: 'high',
    progress: 45,
    targetDate: '2026-09-01',
    tags: ['Internship', 'Leetcode', 'Resume'],
    milestones: [
      { id: 'm-4', visionId: 'vision-2', title: 'Build portfolio website', isCompleted: true },
      { id: 'm-5', visionId: 'vision-2', title: 'Complete 50 coding problems', isCompleted: false },
      { id: 'm-6', visionId: 'vision-2', title: 'Submit 5 applications', isCompleted: false }
    ],
    isPinned: true,
    isArchived: false,
    linkedTaskIds: ['task-2'],
    linkedJournalIds: [],
    createdAt: new Date('2026-05-02T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-06-01T15:00:00Z').toISOString()
  },
  {
    id: 'vision-3',
    title: 'Run a Half Marathon',
    description: 'Build cardiovascular endurance to complete the local marathon event.',
    imageDataUrl: '/images/marathon.png',
    category: 'health_wellness',
    status: 'in_progress',
    priority: 'medium',
    progress: 30,
    targetDate: '2026-11-15',
    tags: ['Run', 'Endurance', 'Fitness'],
    milestones: [
      { id: 'm-7', visionId: 'vision-3', title: 'Complete 5k run', isCompleted: true },
      { id: 'm-8', visionId: 'vision-3', title: 'Complete 10k run', isCompleted: false },
      { id: 'm-9', visionId: 'vision-3', title: 'Run 15k test route', isCompleted: false }
    ],
    isPinned: false,
    isArchived: false,
    linkedTaskIds: [],
    linkedJournalIds: ['entry-2026-05-20'],
    createdAt: new Date('2026-05-05T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-05-25T18:00:00Z').toISOString()
  },
  {
    id: 'vision-4',
    title: 'Release Habiticon App v1.0',
    description: 'Design and deploy the industrial Neo-Brutalist habit command tracker.',
    imageDataUrl: '/images/habiticon.png',
    category: 'creativity',
    status: 'in_progress',
    priority: 'high',
    progress: 85,
    targetDate: '2026-06-10',
    tags: ['Coding', 'Design', 'Deploy'],
    milestones: [
      { id: 'm-10', visionId: 'vision-4', title: 'Wireframe core layouts', isCompleted: true },
      { id: 'm-11', visionId: 'vision-4', title: 'Implement local state DB', isCompleted: true },
      { id: 'm-12', visionId: 'vision-4', title: 'Connect Aura AI copilot', isCompleted: true },
      { id: 'm-13', visionId: 'vision-4', title: 'Deploy production build', isCompleted: false }
    ],
    isPinned: true,
    isArchived: false,
    linkedTaskIds: ['task-1'],
    linkedJournalIds: ['entry-2026-06-02'],
    createdAt: new Date('2026-05-10T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-06-02T19:30:00Z').toISOString()
  }
];

export const INITIAL_DASHBOARD_PINS: DashboardVisionPin[] = [
  { visionId: 'vision-1', displayOrder: 0 },
  { visionId: 'vision-2', displayOrder: 1 },
  { visionId: 'vision-4', displayOrder: 2 }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    code: 'WIX1003',
    name: 'Software Developer Frameworks',
    lecturer: 'Dr. Alan Turing',
    semester: 'Semester 1',
    credits: 4,
    location: 'DK-B Auditorium',
    color: 'emerald'
  },
  {
    id: 'course-2',
    code: 'CS2001',
    name: 'Advanced Data Structures',
    lecturer: 'Dr. Donald Knuth',
    semester: 'Semester 1',
    credits: 3,
    location: 'Block C Lab 5',
    color: 'indigo'
  },
  {
    id: 'course-3',
    code: 'MTH3002',
    name: 'Discrete Mathematical Structures',
    lecturer: 'Dr. Ada Lovelace',
    semester: 'Semester 1',
    credits: 3,
    location: 'Main Seminar Hall',
    color: 'rose'
  },
  {
    id: 'course-4',
    code: 'ITS4001',
    name: 'Mobile Systems Engineering',
    lecturer: 'Dr. Grace Hopper',
    semester: 'Semester 1',
    credits: 4,
    location: 'Annex Room 12',
    color: 'indigo'
  }
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'event-0',
    title: 'ITS4001 Regular Lecture',
    courseId: 'course-4',
    date: '2026-06-01',
    startTime: '11:00',
    endTime: '13:00',
    location: 'Annex Room 12',
    description: 'Weekly lecture covering mobile network routing efficiencies and constraint layouts.',
    recurring: 'weekly',
    category: 'class',
    reminderMinutes: 30
  },
  {
    id: 'event-1',
    title: 'WIX1003 Regular Lecture',
    courseId: 'course-1',
    date: '2026-06-04',
    startTime: '09:00',
    endTime: '11:00',
    location: 'DK-B Auditorium',
    description: 'Introduction to standard system architecture frameworks and class specs.',
    recurring: 'weekly',
    category: 'class',
    reminderMinutes: 15
  },
  {
    id: 'event-2',
    title: 'CS2001 Heap & Red-Black Lab',
    courseId: 'course-2',
    date: '2026-06-02',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Block C Lab 5',
    description: 'Algorithm optimization review of binary and complex heap structures.',
    recurring: 'weekly',
    category: 'class',
    reminderMinutes: 30
  },
  {
    id: 'event-3',
    title: 'MTH3002 Graph Theory Seminar',
    courseId: 'course-3',
    date: '2026-06-03',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Main Seminar Hall',
    description: 'Discussion of Euler paths, Hamilton circuits, and planar representations.',
    recurring: 'weekly',
    category: 'class',
    reminderMinutes: 60
  },
  {
    id: 'event-4',
    title: 'DBMS Project Group Sync',
    courseId: 'course-1',
    date: '2026-06-05',
    startTime: '16:00',
    endTime: '18:00',
    location: 'Main Library Annex',
    description: 'Drafting project timelines and setting up database migration schemas.',
    recurring: 'none',
    category: 'meeting',
    reminderMinutes: 15
  },
  {
    id: 'event-5',
    title: 'ITS4001 Mobile midterm exam',
    courseId: 'course-4',
    date: '2026-06-08',
    startTime: '09:30',
    endTime: '11:30',
    location: 'Exam Hall 2',
    description: 'Covers Lectures 1-8. High Stakes. No calculators permitted.',
    recurring: 'none',
    category: 'exam',
    reminderMinutes: 1440
  },
  {
    id: 'event-6',
    title: 'WIX1003 Tutorial Session',
    courseId: 'course-1',
    date: '2026-06-05',
    startTime: '14:00',
    endTime: '15:30',
    location: 'DK-B Auditorium',
    description: 'Practical exercise walkthrough on custom layouts and styling variables.',
    recurring: 'weekly',
    category: 'class',
    reminderMinutes: 15
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Design Database ER Diagrams',
    courseId: 'course-1',
    priority: 'high',
    deadline: '2026-06-03',
    estimatedHours: 6,
    progress: 80,
    status: 'in_progress',
    description: 'Create normalized relational schema matching DBMS constraints.',
    projectName: 'DBMS Project'
  },
  {
    id: 'task-2',
    title: 'Complexity proofs Homework',
    courseId: 'course-2',
    priority: 'medium',
    deadline: '2026-06-05',
    estimatedHours: 4,
    progress: 25,
    status: 'in_progress',
    description: 'Verify mathematical bound algorithms for search tree depth metrics.',
    projectName: 'Labs Core'
  },
  {
    id: 'task-3',
    title: 'Discrete Sets Problem Sheet',
    courseId: 'course-3',
    priority: 'low',
    deadline: '2026-05-28',
    estimatedHours: 2,
    progress: 100,
    status: 'completed',
    description: 'Submission verified on online portal system.',
    projectName: 'Assignments'
  },
  {
    id: 'task-4',
    title: 'Review Lecture 8 Recording',
    courseId: 'course-4',
    priority: 'high',
    deadline: '2026-05-29',
    estimatedHours: 3,
    progress: 100,
    status: 'completed',
    description: 'Analyze Android layout hierarchies and view structures.',
    projectName: 'Exams Review'
  },
  {
    id: 'task-5',
    title: 'Implement OS Mutex Simulator',
    courseId: 'course-2',
    priority: 'high',
    deadline: '2026-06-04',
    estimatedHours: 8,
    progress: 50,
    status: 'in_progress',
    description: 'Build thread-safe scheduler script using semaphores in C.',
    projectName: 'Operating Systems'
  },
  {
    id: 'task-6',
    title: 'Wireframe Vision Board UI',
    courseId: 'course-1',
    priority: 'low',
    deadline: '2026-06-09',
    estimatedHours: 3,
    progress: 0,
    status: 'not_started',
    description: 'Draft the frontend layout cards and modal components.',
    projectName: 'Assignments'
  },
  {
    id: 'task-7',
    title: 'Submit Mobile systems report',
    courseId: 'course-4',
    priority: 'medium',
    deadline: '2026-06-12',
    estimatedHours: 5,
    progress: 0,
    status: 'not_started',
    description: 'Submit report covering mobile network routing efficiencies.',
    projectName: 'Exams Review'
  }
];

export const INITIAL_FOLDERS: Folder[] = [
  { id: 'folder-1', name: 'Frameworks Lectures', courseId: 'course-1' },
  { id: 'folder-2', name: 'Lab Outlines', courseId: 'course-2' },
  { id: 'folder-3', name: 'Mathematics Proofs', courseId: 'course-3' },
  { id: 'folder-4', name: 'Aura AI logs', courseId: 'course-1' }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Software Developer DBMS Checklist',
    content: `# Software Developer DBMS Checklist\n\n1. Target third normal form (3NF) boundary rules.\n2. Add indexes on heavy foreign key structures.\n3. Implement optimistic concurrency checks.\n4. Avoid raw query execution where ORM framework can optimize compilation indexes.`,
    courseId: 'course-1',
    folderId: 'folder-1',
    tags: ['dbms', 'index', 'sql'],
    isFavorite: true,
    updatedAt: new Date('2026-05-28T14:30:00Z').toISOString()
  },
  {
    id: 'note-2',
    title: 'Heap structures & Complex space notes',
    content: `# Heap structures notes\n\n- Binary Heap heights always evaluate to log(n).\n- Insertion triggers bubble-up swaps at average log(n) complexity.\n- Deletion extracts root and sinks elements. Heapify is O(n).\n- Red-Black Trees guarantee O(log n) worst-case bounds for searches.`,
    courseId: 'course-2',
    folderId: 'folder-2',
    tags: ['algorithms', 'heaps', 'trees'],
    isFavorite: false,
    updatedAt: new Date('2026-05-29T16:20:00Z').toISOString()
  },
  {
    id: 'note-3',
    title: 'Graph Theory Planar Proofs',
    content: `# Graph Theory Planar Proofs\n\n- Euler Formula: V - E + F = 2.\n- Handshaking lemma: sum of degrees equals 2 * |E|.\n- In planar graphs, E <= 3V - 6 for V >= 3.\n- Kuratowski Theorem: a graph is planar iff it contains no subgraph homeomorphic to K5 or K3,3.`,
    courseId: 'course-3',
    folderId: 'folder-3',
    tags: ['math', 'graphs', 'proofs'],
    isFavorite: true,
    updatedAt: new Date('2026-06-01T11:15:00Z').toISOString()
  },
  {
    id: 'note-4',
    title: 'Android Layout Constraints Guidelines',
    content: `# Android Layout Constraints Guidelines\n\n- Prefer ConstraintLayout to flatten deep nested view hierarchies.\n- Use guideline markers to scale controls proportionally.\n- Set layout_width/height to 0dp (match_constraint) to let constraints evaluate dimensions correctly.\n- Set contentDescription on all ImageViews to support assistive screens.`,
    courseId: 'course-4',
    folderId: 'folder-2',
    tags: ['android', 'layouts', 'ui'],
    isFavorite: false,
    updatedAt: new Date('2026-06-02T10:00:00Z').toISOString()
  }
];

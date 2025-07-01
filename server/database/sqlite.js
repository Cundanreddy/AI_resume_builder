import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database connection
const db = new Database(path.join(__dirname, '../data/resume_builder.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
const initDatabase = () => {
  // Users table
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE,
      mobile TEXT UNIQUE,
      password TEXT NOT NULL,
      photo TEXT,
      language TEXT NOT NULL DEFAULT 'en',
      isEmailVerified BOOLEAN DEFAULT 0,
      isMobileVerified BOOLEAN DEFAULT 0,
      otpCode TEXT,
      otpExpires DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT email_or_mobile CHECK (email IS NOT NULL OR mobile IS NOT NULL)
    )
  `;

  // Resumes table
  const createResumesTable = `
    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      personalInfo TEXT NOT NULL,
      summary TEXT NOT NULL,
      education TEXT,
      experience TEXT,
      skills TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(userId)
    )
  `;

  db.exec(createUsersTable);
  db.exec(createResumesTable);

  console.log('SQLite database initialized successfully');
};

// User operations
export const userOperations = {
  create: (userData) => {
    const stmt = db.prepare(`
      INSERT INTO users (fullName, email, mobile, password, photo, language)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      userData.fullName,
      userData.email || null,
      userData.mobile || null,
      userData.password,
      userData.photo || null,
      userData.language
    );
  },

  findByEmailOrMobile: (identifier) => {
    const stmt = db.prepare(`
      SELECT * FROM users 
      WHERE email = ? OR mobile = ?
    `);
    return stmt.get(identifier, identifier);
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  updateOTP: (userId, otpCode, otpExpires) => {
    const stmt = db.prepare(`
      UPDATE users 
      SET otpCode = ?, otpExpires = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(otpCode, otpExpires, userId);
  },

  verifyMobile: (userId) => {
    const stmt = db.prepare(`
      UPDATE users 
      SET isMobileVerified = 1, otpCode = NULL, otpExpires = NULL, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(userId);
  }
};

// Resume operations
export const resumeOperations = {
  create: (resumeData) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO resumes (userId, personalInfo, summary, education, experience, skills, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    return stmt.run(
      resumeData.userId,
      JSON.stringify(resumeData.personalInfo),
      resumeData.summary,
      JSON.stringify(resumeData.education || []),
      JSON.stringify(resumeData.experience || []),
      JSON.stringify(resumeData.skills || [])
    );
  },

  findByUserId: (userId) => {
    const stmt = db.prepare('SELECT * FROM resumes WHERE userId = ?');
    const result = stmt.get(userId);
    
    if (result) {
      return {
        ...result,
        personalInfo: JSON.parse(result.personalInfo),
        education: JSON.parse(result.education || '[]'),
        experience: JSON.parse(result.experience || '[]'),
        skills: JSON.parse(result.skills || '[]')
      };
    }
    return null;
  },

  delete: (userId) => {
    const stmt = db.prepare('DELETE FROM resumes WHERE userId = ?');
    return stmt.run(userId);
  }
};

// Seed test data
export const seedTestData = async () => {
  try {
    // Check if test user exists
    const existingUser = userOperations.findByEmailOrMobile('test@example.com');
    if (existingUser) {
      console.log('Test data already exists, skipping seed...');
      return;
    }

    // Create test users
    const testUsers = [
      {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 12),
        language: 'en'
      },
      {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        mobile: '+1234567890',
        password: await bcrypt.hash('password123', 12),
        language: 'en'
      },
      {
        fullName: 'Demo User',
        mobile: '+9876543210',
        password: await bcrypt.hash('demo123', 12),
        language: 'en'
      }
    ];

    const createdUsers = [];
    for (const userData of testUsers) {
      const result = userOperations.create(userData);
      const user = userOperations.findById(result.lastInsertRowid);
      createdUsers.push(user);
      console.log(`Created test user: ${user.fullName} (${user.email || user.mobile})`);
    }

    // Create sample resume for first user
    const sampleResume = {
      userId: createdUsers[0].id,
      personalInfo: {
        fullName: 'John Doe',
        email: 'test@example.com',
        phone: '+1-555-0123',
        address: '123 Main Street, New York, NY 10001'
      },
      summary: 'Experienced software developer with 5+ years of expertise in full-stack web development.',
      education: [
        {
          institution: 'University of Technology',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startYear: '2016',
          endYear: '2020',
          gpa: '3.8'
        }
      ],
      experience: [
        {
          company: 'Tech Solutions Inc.',
          position: 'Senior Software Developer',
          startDate: '2021-01-15',
          endDate: '2024-12-31',
          description: 'Led development of web applications using React, Node.js, and SQLite.'
        }
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'SQLite', 'Express.js', 'TypeScript']
    };

    resumeOperations.create(sampleResume);
    console.log(`Created sample resume for ${createdUsers[0].fullName}`);

    console.log('\n389 Test data seeded successfully!');
    console.log('\n4cb Test Login Credentials:');
    console.log('1. Email: test@example.com | Password: password123');
    console.log('2. Email: jane@example.com | Password: password123');
    console.log('3. Mobile: +9876543210 | Password: demo123');

  } catch (error) {
    console.error('Error seeding test data:', error);
  }
};

// Initialize database on import
initDatabase();

export default db; 
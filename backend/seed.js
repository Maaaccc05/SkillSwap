const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const SkillOffer = require('./models/skill');

require('dotenv').config();

const dummyUsers = [
  {
    name: "Sarah Chen",
    email: "sarah@example.com",
    password: "password123",
    avatar: "https://randomuser.me/api/portraits/women/40.jpg",
    location: "San Francisco, CA",
    bio: "Full-stack developer passionate about teaching React and Node.js",
    skillsOffered: [
      {
        name: "JavaScript",
        category: "Programming",
        level: "advanced",
        description: "Expert in modern JavaScript frameworks"
      },
      {
        name: "React",
        category: "Programming",
        level: "advanced",
        description: "React hooks, context, and state management"
      }
    ],
    skillsWanted: [
      {
        name: "UI Design",
        category: "Design",
        level: "beginner",
        description: "Want to learn basic UI design principles"
      }
    ],
    availability: ["weekends", "evenings"],
    rating: 4.8,
    totalReviews: 12
  },
  {
    name: "Marcus Johnson",
    email: "marcus@example.com",
    password: "password123",
    avatar: "https://randomuser.me/api/portraits/men/83.jpg",
    location: "New York, NY",
    bio: "Creative designer and photographer",
    skillsOffered: [
      {
        name: "Photoshop",
        category: "Design",
        level: "expert",
        description: "Professional photo editing and manipulation"
      },
      {
        name: "Illustrator",
        category: "Design",
        level: "advanced",
        description: "Vector graphics and logo design"
      }
    ],
    skillsWanted: [
      {
        name: "Python",
        category: "Programming",
        level: "intermediate",
        description: "Data analysis and automation"
      }
    ],
    availability: ["weekdays", "evenings"],
    rating: 4.6,
    totalReviews: 8
  },
  {
    name: "Emily Rodriguez",
    email: "emily@example.com",
    password: "password123",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    location: "Miami, FL",
    bio: "Spanish teacher and content creator",
    skillsOffered: [
      {
        name: "Spanish",
        category: "Language",
        level: "expert",
        description: "Native Spanish speaker, conversational and business Spanish"
      },
      {
        name: "Content Writing",
        category: "Writing",
        level: "advanced",
        description: "Blog writing, SEO content, and copywriting"
      }
    ],
    skillsWanted: [
      {
        name: "Video Editing",
        category: "Media",
        level: "beginner",
        description: "Basic video editing for social media"
      }
    ],
    availability: ["weekends"],
    rating: 4.9,
    totalReviews: 15
  },
  {
    name: "David Kim",
    email: "david@example.com",
    password: "password123",
    avatar: "https://randomuser.me/api/portraits/men/52.jpg",
    location: "Seattle, WA",
    bio: "Backend developer and DevOps engineer",
    skillsOffered: [
      {
        name: "Node.js",
        category: "Programming",
        level: "advanced",
        description: "Server-side JavaScript and API development"
      },
      {
        name: "MongoDB",
        category: "Programming",
        level: "advanced",
        description: "Database design and optimization"
      }
    ],
    skillsWanted: [
      {
        name: "DevOps",
        category: "Programming",
        level: "intermediate",
        description: "Docker, Kubernetes, and CI/CD"
      }
    ],
    availability: ["weekdays"],
    rating: 4.7,
    totalReviews: 10
  },
  {
    name: "Lisa Thompson",
    email: "lisa@example.com",
    password: "password123",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    location: "Austin, TX",
    bio: "Digital marketing specialist",
    skillsOffered: [
      {
        name: "Marketing",
        category: "Business",
        level: "advanced",
        description: "Digital marketing strategies and campaigns"
      },
      {
        name: "SEO",
        category: "Business",
        level: "advanced",
        description: "Search engine optimization and analytics"
      }
    ],
    skillsWanted: [
      {
        name: "Data Analysis",
        category: "Programming",
        level: "beginner",
        description: "Excel and basic data visualization"
      }
    ],
    availability: ["weekdays", "evenings"],
    rating: 4.5,
    totalReviews: 6
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await SkillOffer.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of dummyUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.name}`);
    }

    // Create skill offers for each user
    for (const user of createdUsers) {
      for (const skill of user.skillsOffered) {
        const skillOffer = new SkillOffer({
          user: user._id,
          skill: skill,
          description: `I can teach you ${skill.name} at ${skill.level} level. ${skill.description}`,
          availability: user.availability,
          isActive: true
        });
        await skillOffer.save();
        console.log(`Created skill offer: ${skill.name} by ${user.name}`);
      }
    }

    console.log('Database seeded successfully!');
    console.log('\nTest accounts:');
    dummyUsers.forEach(user => {
      console.log(`Email: ${user.email}, Password: password123`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 
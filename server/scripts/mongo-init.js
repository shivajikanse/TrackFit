// MongoDB initialization script
db = db.getSiblingDB('fitness_tracker');

db.createCollection('users');
db.createCollection('workoutplans');
db.createCollection('dietplans');
db.createCollection('progresses');
db.createCollection('notes');
db.createCollection('broadcasts');

// Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ trainer: 1 });
db.users.createIndex({ role: 1 });
db.workoutplans.createIndex({ member: 1, isActive: 1 });
db.dietplans.createIndex({ member: 1, isActive: 1 });
db.progresses.createIndex({ member: 1, date: -1 });
db.notes.createIndex({ member: 1, createdAt: -1 });

print('✅ MongoDB initialized for fitness_tracker');

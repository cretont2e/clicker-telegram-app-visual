# T2E CRETON Development Memo

## Project Overview
**T2E CRETON** is a Telegram-based clicker game (Tap-to-Earn) built with Next.js that integrates with the TON blockchain. The application allows users to earn points through clicking, complete tasks, refer friends, and participate in on-chain activities.

**Last Updated:** June 17, 2025

---

## Database Architecture

### **Database Provider: MongoDB with Prisma ORM**

The application uses **MongoDB** as the primary database with **Prisma** as the ORM layer. This combination provides:
- Document-based storage perfect for complex game data
- Type-safe database operations
- Automatic query optimization
- Built-in connection pooling

### **Database Configuration**

**Connection Setup** (`utils/prisma.ts`):
```typescript
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
}

const prisma = globalThis.prisma ?? prismaClientSingleton();
export default prisma;
```

**Environment Variables Required:**
- `DATABASE_URL` - MongoDB connection string

### **Data Models**

#### **1. User Model** (Primary Entity)
```prisma
model User {
  id                        String   @id @default(auto()) @map("_id") @db.ObjectId
  telegramId                String   @unique
  name                      String?
  isPremium                 Boolean  @default(false)
  
  // Game Progress
  points                    Float    @default(0)
  pointsBalance             Float    @default(0)
  multitapLevelIndex        Int      @default(0)
  energy                    Int      @default(100)
  energyRefillsLeft         Int      @default(6)
  energyLimitLevelIndex     Int      @default(0)
  mineLevelIndex            Int      @default(0)
  
  // Timestamps
  lastPointsUpdateTimestamp DateTime @default(now())
  lastEnergyUpdateTimestamp DateTime @default(now())
  lastEnergyRefillsTimestamp DateTime @default(now())
  
  // Blockchain Integration
  tonWalletAddress          String?
  
  // Earnings Tracking
  referralPointsEarned      Float    @default(0)
  offlinePointsEarned       Float    @default(0)

  // Relationships
  referrals                 User[]   @relation("Referrals")
  referredBy                User?    @relation("Referrals", fields: [referredById], references: [id])
  referredById              String?  @db.ObjectId
  completedTasks            UserTask[]
}
```

**Key Features:**
- **Telegram Integration**: `telegramId` links users to their Telegram accounts
- **Game Progression**: Tracks clicking levels, energy, and mining progress
- **Referral System**: Self-referencing relationship for user referrals
- **Blockchain Ready**: TON wallet address storage
- **Temporal Tracking**: Timestamps for energy regeneration and point calculations

#### **2. Task System**
```prisma
model Task {
  id           String     @id @default(auto()) @map("_id") @db.ObjectId
  title        String
  description  String
  points       Int
  type         TaskType   // VISIT, TELEGRAM, REFERRAL
  category     String
  image        String
  callToAction String
  taskData     Json?      // Flexible data storage
  isActive     Boolean    @default(true)
  userTasks    UserTask[]
}

model UserTask {
  id                 String   @id @default(auto()) @map("_id") @db.ObjectId
  user               User     @relation(fields: [userId], references: [id])
  userId             String   @db.ObjectId
  task               Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  taskId             String   @db.ObjectId
  taskStartTimestamp DateTime @default(now())
  isCompleted        Boolean  @default(false)
  updatedAt          DateTime @updatedAt

  @@unique([userId, taskId]) // Prevents duplicate task completions
}
```

**Task System Features:**
- **Flexible Task Types**: Visit websites, join Telegram channels, referrals
- **JSON Storage**: `taskData` field for custom task parameters
- **Completion Tracking**: Many-to-many relationship with completion status
- **Duplicate Prevention**: Unique constraint on user-task pairs

#### **3. On-Chain Task System**
```prisma
model OnchainTask {
  id                    String   @id @default(auto()) @map("_id") @db.ObjectId
  smartContractAddress  String
  price                 String
  collectionMetadata    Json
  itemMetadata          Json
  points                Float
  isActive              Boolean  @default(true)
  completions           OnchainTaskCompletion[]
}

model OnchainTaskCompletion {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  onchainTask       OnchainTask @relation(fields: [onchainTaskId], references: [id])
  onchainTaskId     String   @db.ObjectId
  userId            String   @db.ObjectId
  userWalletAddress String
  completionTime    DateTime @default(now())
}
```

**Blockchain Integration:**
- **Smart Contract Tasks**: Users interact with TON blockchain contracts
- **NFT Metadata**: Stores collection and item metadata
- **Completion Verification**: Tracks when users complete on-chain tasks

---

## Database Operations & API Layer

### **Critical Database Patterns**

#### **1. Transaction Safety**
The application uses Prisma transactions for critical operations:

```typescript
// Example from sync API
const result = await prisma.$transaction(async (prisma) => {
  const dbUser = await prisma.user.findUnique({
    where: { telegramId },
  });
  
  // Update user data atomically
  const updatedUser = await prisma.user.update({
    where: { telegramId },
    data: {
      points: newPoints,
      energy: newEnergy,
      lastPointsUpdateTimestamp: new Date(syncTimestamp),
    },
  });
  
  return updatedUser;
});
```

#### **2. Retry Logic & Error Handling**
```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY = 100;

let retries = 0;
while (retries < MAX_RETRIES) {
  try {
    // Database operation
    break;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      retries++;
      if (retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    } else {
      throw error;
    }
  }
}
```

#### **3. User Authentication & Validation**
```typescript
// Telegram WebApp data validation
const { validatedData, user } = validateTelegramWebAppData(telegramInitData);
if (!validatedData) {
  return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 403 });
}

const telegramId = user.id?.toString();
```

### **API Endpoints Overview**

#### **Core User Operations:**
- `POST /api/user` - User registration/login with referral handling
- `POST /api/sync` - Synchronize client state with server
- `POST /api/refill-energy` - Energy refill system

#### **Game Mechanics:**
- `POST /api/upgrade/*` - Handle multitap, energy, mine upgrades
- `GET/POST /api/tasks/*` - Task management and completion
- `GET/POST /api/onchain-tasks/*` - Blockchain task handling

#### **Social Features:**
- Referral system built into User model
- Friend invitation tracking

#### **Admin Operations:**
- `GET /api/admin/*` - Administrative endpoints for game management

---

## Game Mechanics & Database Integration

### **Point Synchronization System**
The game implements a sophisticated point synchronization system to handle:

1. **Client-Side Calculations**: Points earned through clicking
2. **Server-Side Validation**: Prevents cheating and validates point earnings
3. **Offline Point Mining**: Calculates points earned while offline
4. **Energy Regeneration**: Time-based energy restoration

### **Energy System**
- **Base Energy**: 100 points
- **Regeneration**: 1 point per second
- **Daily Refills**: 6 refills per day (tracked via `energyRefillsLeft`)
- **Upgrades**: Energy limit can be increased through upgrades

### **Upgrade System**
Three main upgrade paths:
1. **Multitap**: Increases points per click
2. **Energy Limit**: Increases maximum energy
3. **Mine**: Increases passive point generation

---

## Development Environment Setup

### **Database Setup**
1. **MongoDB Atlas** or local MongoDB instance
2. **Environment Variables**:
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database"
   NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH="true" # For development
   ```

3. **Prisma Commands**:
   ```bash
   npx prisma generate    # Generate Prisma client
   npx prisma db push     # Push schema to database
   npx prisma studio      # Database GUI
   ```

### **Seeding Data**
The project includes a seed script (`prisma/seed.ts`) for populating initial data:
```bash
npm run seed
```

---

## Security Considerations

### **Telegram Authentication**
- **WebApp Data Validation**: All requests validate Telegram WebApp init data
- **User ID Verification**: Ensures requests come from authenticated Telegram users
- **Development Bypass**: Can be disabled in production

### **Anti-Cheat Measures**
- **Server-Side Validation**: All point calculations verified on server
- **Time Sync Validation**: Prevents timestamp manipulation
- **Energy Validation**: Ensures energy constraints are respected
- **Transaction Limits**: Prevents excessive point claiming

### **Data Protection**
- **Telegram ID Hashing**: Consider hashing sensitive user data
- **Wallet Address Validation**: TON wallet addresses validated before storage
- **Rate Limiting**: Implement request rate limiting for API endpoints

---

## Performance Optimization

### **Database Indexing**
- **Telegram ID**: Unique index for fast user lookups
- **Task Completion**: Compound index on `userId` and `taskId`
- **Timestamps**: Indexes on timestamp fields for time-based queries

### **Connection Management**
- **Prisma Client Singleton**: Prevents connection pool exhaustion
- **Connection Pooling**: MongoDB connection pooling enabled
- **Query Optimization**: Use `select` to fetch only needed fields

---

## Monitoring & Maintenance

### **Logging Strategy**
- **API Request Logging**: All endpoints log requests and responses
- **Error Tracking**: Comprehensive error logging with context
- **Performance Metrics**: Track database query performance

### **Data Backup**
- **MongoDB Atlas**: Automated backups if using cloud service
- **Migration Strategy**: Prisma migrations for schema changes
- **Point-in-Time Recovery**: Ensure database can be restored to specific timestamps

---

## Future Considerations

### **Scalability**
- **Read Replicas**: Consider read replicas for high traffic
- **Caching Layer**: Redis for frequently accessed data
- **Database Sharding**: If user base grows significantly

### **Feature Expansions**
- **Achievement System**: New model for tracking user achievements
- **Leaderboards**: Efficient ranking system
- **Seasonal Events**: Time-based event system
- **NFT Integration**: Enhanced on-chain asset management

---

## Tech Stack Summary

**Database Layer:**
- MongoDB (Document Database)
- Prisma ORM (Type-safe database access)
- Connection pooling and optimization

**API Layer:**
- Next.js API Routes
- TypeScript for type safety
- Telegram WebApp validation

**Integration:**
- TON Blockchain connectivity
- Telegram Bot API
- Real-time synchronization

**Development Tools:**
- Prisma Studio (Database GUI)
- ESLint & TypeScript
- Git version control

---

*This memo should be updated as the project evolves and new features are added.*

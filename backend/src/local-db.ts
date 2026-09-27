import { MongoMemoryServer } from 'mongodb-memory-server';

async function start() {
  console.log('⏳ Starting local MongoDB server on port 27017...');
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'nearstyle',
    },
  });

  console.log(`✅ [Local MongoDB Ready]: ${mongod.getUri()}`);
  console.log('📡 Ready to accept connections from backend, seeder, and test suite.');

  const shutdown = async () => {
    console.log('\n🛑 Stopping local MongoDB server...');
    await mongod.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('❌ Failed to start local MongoDB:', err.message);
  process.exit(1);
});

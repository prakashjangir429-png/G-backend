// cron/emailBroadcastCron.js
import cron from 'node-cron';
import { processScheduledBroadcasts } from '../controllers/broadcastController.js';

// Run every minute to check for scheduled broadcasts
cron.schedule('* * * * *', async () => {
    
  console.log('Checking for scheduled email broadcasts...');
  try {
    await processScheduledBroadcasts();
  } catch (error) {
    console.error('Error processing scheduled broadcasts:', error);
  }
});

export default cron;
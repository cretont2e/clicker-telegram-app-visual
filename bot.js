/**
 * CRETON Telegram Bot Handler
 * 
 * This bot handles the /start command and provides a Web App button
 * to launch the CRETON clicker game.
 * 
 * Author: Cascade AI
 * Created: 2025-06-23
 * Telegram: https://t.me/nikandr_s
 * Telegram channel for news/updates: https://t.me/clicker_game_news
 */

const { Telegraf } = require('telegraf');
require('dotenv').config();

// Load environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-app-domain.vercel.app';

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is required in .env file');
  process.exit(1);
}

// Create bot instance
const bot = new Telegraf(BOT_TOKEN);

// Welcome message text
const WELCOME_MESSAGE = `🎮 Welcome to CRETON!

The ultimate Telegram clicker game where you can:
• 🖱️ Tap to earn CRETON points
• ⚡ Upgrade your clicking power
• 🎯 Complete exciting tasks
• 👥 Invite friends for bonuses
• 💎 Connect your TON wallet for rewards

Ready to start your CRETON journey? Click the button below to play!`;

// Handle /start command
bot.start(async (ctx) => {
  try {
    const user = ctx.from;
    
    console.log(`🚀 User started the bot: ${user?.first_name} (@${user?.username}, ID: ${user?.id})`);
    
    // Send welcome message with Web App button
    await ctx.reply(WELCOME_MESSAGE, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🎮 Open CRETON Game',
              web_app: {
                url: WEB_APP_URL
              }
            }
          ],
          [
            {
              text: '📱 Share with Friends',
              switch_inline_query: 'Join me in CRETON! 🎮 Tap, earn, and upgrade together!'
            }
          ]
        ]
      }
    });
    
    // Optional: Send additional helpful message
    setTimeout(async () => {
      await ctx.reply(
        '💡 Pro tip: The game works best when you tap rapidly and strategically upgrade your abilities!',
        {
          reply_markup: {
            remove_keyboard: true
          }
        }
      );
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error in /start command:', error);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
});

// Handle /help command
bot.help(async (ctx) => {
  const helpMessage = `🎮 CRETON Bot Commands:

/start - Start the game and get the play button
/help - Show this help message
/stats - View your game statistics (coming soon)

📱 How to play:
1. Click "Open CRETON Game" to launch the app
2. Tap the main button to earn points
3. Use your points to buy upgrades
4. Complete tasks for bonus rewards
5. Invite friends to earn referral bonuses

Need support? Contact @nikandr_s`;

  await ctx.reply(helpMessage);
});

// Handle /stats command (placeholder for future implementation)
bot.command('stats', async (ctx) => {
  await ctx.reply('📊 Statistics feature coming soon! For now, check your stats in the game app.');
});

// Handle unknown commands
bot.on('text', async (ctx) => {
  if (ctx.message && 'text' in ctx.message) {
    const text = ctx.message.text;
    
    if (text.startsWith('/')) {
      await ctx.reply('❓ Unknown command. Use /help to see available commands.');
    } else {
      await ctx.reply('👋 Hi! Use /start to play CRETON or /help for more information.');
    }
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error('❌ Bot error:', err);
  console.error('❌ Context:', ctx);
});

// Start the bot
async function startBot() {
  try {
    console.log('🤖 Starting CRETON Telegram Bot...');
    
    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
    
    await bot.launch();
    console.log('✅ CRETON Bot is running!');
    console.log(`🌐 Web App URL: ${WEB_APP_URL}`);
    console.log('💡 Users can now type /start to get the game button');
    
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

startBot();

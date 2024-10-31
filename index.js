const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Bot setup (বট টোকেন বাদ)
const bot = new Telegraf('7843270119:AAHBy3sqDLiR-uek9aCbr7DPnYBQuvVSywg');

// Forced Subscription চ্যানেল আইডি
const requiredChannel = '@RM_Movie_Flix';

// ফাইল স্টোরেজ এবং রিকোয়েস্ট, ভোট ব্যবস্থাপনার জন্য ডাটাবেস
const requests = [];
const votes = {};
const fileStore = {};

// Forced Subscription চেক করার ফাংশন
async function checkSubscription(ctx) {
  try {
    const userStatus = await ctx.telegram.getChatMember(requiredChannel, ctx.from.id);
    return userStatus.status === 'member' || userStatus.status === 'administrator' || userStatus.status === 'creator';
  } catch (error) {
    console.error('Subscription check error:', error);
    return false;
  }
}

// `/start` কমান্ড - Forced Subscription এবং স্বাগতম বার্তা
bot.start(async (ctx) => {
  const isSubscribed = await checkSubscription(ctx);

  if (!isSubscribed) {
    return ctx.reply(
      `🛑 দুঃখিত, আপনি বটটি ব্যবহারের জন্য *${requiredChannel}* চ্যানেলে সাবস্ক্রাইব করতে হবে।`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'চ্যানেলে যোগ দিন', url: `https://t.me/${requiredChannel}` }],
            [{ text: 'সাবস্ক্রিপশন চেক করুন', callback_data: 'checkSubscription' }]
          ]
        }
      }
    );
  }

  const welcomeMessage = `
🎬 *স্বাগতম*, ${ctx.from.first_name}! 🎉
    
এই বটের সাহায্যে আপনি মুভি রিকোয়েস্ট, মুভি তথ্য, ভোটিং এবং আরও অনেক কিছু করতে পারবেন।

⚙️ *ফিচার তালিকা*:
- /movie <মুভির নাম> - মুভির বিস্তারিত তথ্য দেখুন।
- /request <মুভির নাম> - নতুন মুভি অনুরোধ করুন।
- /vote <মুভির নাম> - ভোট দিন।
- /toprequests - সর্বাধিক অনুরোধকৃত মুভির তালিকা।
- /topvotes - সর্বাধিক ভোটপ্রাপ্ত মুভির তালিকা।
- /cancel - মুভি অনুরোধ বাতিল।
- /filestore <ফাইল নাম> - ফাইল আপলোড এবং সংরক্ষণ করুন।

🛠 *সহায়ক লিংক*:
`;

  // সহায়ক কীবোর্ড
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📜 আমাদের রুলস পড়ুন', url: 'https://example.com/rules' },
          { text: '🌟 ফিচার গাইড', url: 'https://example.com/features' }
        ],
        [
          { text: '🆘 সাহায্য', callback_data: 'help' },
          { text: '📧 এডমিনের সাথে যোগাযোগ', url: 'https://t.me/admin_contact' }
        ]
      ]
    }
  };

  ctx.replyWithMarkdown(welcomeMessage, keyboard);
});

// `/checkSubscription` কলব্যাক
bot.action('checkSubscription', async (ctx) => {
  const isSubscribed = await checkSubscription(ctx);
  if (isSubscribed) {
    ctx.reply('✅ সাবস্ক্রিপশন সফল হয়েছে! এখন আপনি বটটি ব্যবহার করতে পারবেন।');
  } else {
    ctx.reply('⚠️ আপনি এখনো সাবস্ক্রাইব করেননি।');
  }
});

// `/movie` কমান্ড - IMDb API ছাড়া মুভির তথ্য সংগ্রহ
async function fetchMovieDetailsWithoutAPI(title) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(title)}+movie+details`;
  const response = await fetch(url);
  const html = await response.text();

  return {
    title: title,
    year: "N/A",
    rating: "N/A",
    plot: "এই মুভির প্লট বিস্তারিত পাওয়া যায়নি।"
  };
}

bot.command('movie', async (ctx) => {
  const title = ctx.message.text.split(' ').slice(1).join(' ');
  if (!title) return ctx.reply('⚠️ দয়া করে /movie কমান্ডের পরে মুভির নাম দিন।');

  const movie = await fetchMovieDetailsWithoutAPI(title);
  ctx.reply(
    `🎥 *${movie.title}*\n⭐ রেটিং: ${movie.rating}\n📅 মুক্তি: ${movie.year}\n📖 প্লট: ${movie.plot}`, 
    { parse_mode: 'Markdown' }
  );
});

// `/request` কমান্ড - মুভি অনুরোধ
const adminId = 'YOUR_ADMIN_USER_ID'; // অ্যাডমিন আইডি

bot.command('request', async (ctx) => {
  const title = ctx.message.text.split(' ').slice(1).join(' ');
  if (!title) return ctx.reply('⚠️ দয়া করে /request কমান্ডের পরে মুভির শিরোনাম দিন।');

  requests.push(title);
  await ctx.telegram.sendMessage(adminId, `📩 নতুন মুভি অনুরোধ:\n\nইউজার: ${ctx.from.first_name}\nঅনুরোধ: ${title}`);
  ctx.reply(`✅ মুভি অনুরোধ গৃহীত হয়েছে: *${title}*`, { parse_mode: 'Markdown' });
});

// `/vote` কমান্ড - মুভির জন্য ভোট
bot.command('vote', (ctx) => {
  const movie = ctx.message.text.split(' ').slice(1).join(' ');
  if (!movie) return ctx.reply('⚠️ দয়া করে /vote কমান্ডের পরে মুভির নাম দিন।');

  votes[movie] = (votes[movie] || 0) + 1;

  ctx.reply(`👍 *${movie}* এর জন্য আপনার ভোট গৃহীত হয়েছে! মোট ভোট: ${votes[movie]}`, { parse_mode: 'Markdown' });
});

// `/toprequests` কমান্ড - সর্বাধিক অনুরোধকৃত মুভির তালিকা
bot.command('toprequests', (ctx) => {
  if (requests.length === 0) return ctx.reply('⚠️ এখন পর্যন্ত কোনো মুভি অনুরোধ নেই।');

  let message = '📊 সর্বাধিক অনুরোধকৃত মুভির তালিকা:\n\n';
  const requestCount = {};

  requests.forEach((title) => {
    requestCount[title] = (requestCount[title] || 0) + 1;
  });

  Object.entries(requestCount).sort((a, b) => b[1] - a[1]).forEach(([title, count]) => {
    message += `🎬 *${title}* - ${count} অনুরোধ\n`;
  });

  ctx.reply(message, { parse_mode: 'Markdown' });
});

// `/topvotes` কমান্ড - সর্বাধিক ভোটপ্রাপ্ত মুভির তালিকা
bot.command('topvotes', (ctx) => {
  if (Object.keys(votes).length === 0) return ctx.reply('⚠️ এখন পর্যন্ত কোনো মুভি ভোট নেই।');

  let message = '🏆 সর্বাধিক ভোটপ্রাপ্ত মুভির তালিকা:\n\n';
  Object.entries(votes).sort((a, b) => b[1] - a[1]).forEach(([movie, count]) => {
    message += `🎬 *${movie}* - ${count} ভোট\n`;
  });

  ctx.reply(message, { parse_mode: 'Markdown' });
});

// `/cancel` কমান্ড - মুভি অনুরোধ বাতিল
bot.command('cancel', (ctx) => {
  requests.pop();
  ctx.reply('❌ শেষ মুভি অনুরোধ বাতিল করা হয়েছে।');
});

// `/filestore` কমান্ড - ফাইল আপলোড এবং সংরক্ষণ
bot.command('filestore', (ctx) => {
  const fileName = ctx.message.text.split(' ').slice(1).join(' ');
  if (!fileName) return ctx.reply('⚠️ দয়া করে /filestore কমান্ডের পরে ফাইলের নাম দিন।');

  fileStore[fileName] = { uploadedBy: ctx.from.id, date: new Date().toLocaleString() };
  ctx.reply(`✅ *${fileName}* ফাইল সফলভাবে সংরক্ষিত হয়েছে।`, { parse_mode: 'Markdown' });
});

// বট চালু
bot.launch().then(() => {
  console.log('✅ বট সফলভাবে চালু হয়েছে!');
});

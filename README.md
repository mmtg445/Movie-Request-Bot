# Telegram Movie Request Bot

এই বটটি আপনার জন্য একটি উন্নত Movie Request Bot হিসাবে কাজ করবে, যেখানে ইউজাররা বিভিন্ন সিনেমার জন্য রিকোয়েস্ট করতে পারবেন। এটি Forced Subscription, Custom Command, FileStore ইত্যাদি ফিচার সহ উন্নত ফাংশনালিটি নিয়ে এসেছে।

## ফিচারসমূহ
- **ফোর্সড সাবস্ক্রিপশন**: ইউজারকে একটি নির্দিষ্ট চ্যানেল সাবস্ক্রাইব করতে বাধ্য করা।
- **কাস্টম কমান্ডস**: বিভিন্ন সিনেমার রিকোয়েস্ট, ভোটিং, ইত্যাদি।
- **ইনলাইন IMDb সার্চ**: IMDb API ছাড়াও অন্যান্য উৎস থেকে ডেটা সংগ্রহ।
- **FileStore**: সিনেমা/ফাইল সংরক্ষণের জন্য আলাদা ফাইল সিস্টেম।
- **অটো-রান**: সার্ভারে ২৪/৭ সচল রাখতে UptimeRobot এর ইন্টিগ্রেশন।
  
## প্রয়োজনীয়তা
- Node.js 14+ (Node.js ইন্সটল করুন: [Node.js](https://nodejs.org/))
- একটি টেলিগ্রাম বট টোকেন ([BotFather](https://t.me/botfather) থেকে তৈরি করুন)
- কিছু অতিরিক্ত প্যাকেজ (উদাহরণ: dotenv, telegraf)

## ইনস্টলেশন
1. এই প্রোজেক্টটি ক্লোন করুন:
   ```bash
   git clone https://github.com/username/telegram-movie-request-bot.git
   cd telegram-movie-request-bot

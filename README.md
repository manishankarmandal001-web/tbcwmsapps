# WMS Cashback & Rewards Portal (Vercel Ready)

একটি সম্পূর্ণ ক্যাশব্যাক এবং প্রুফ ভেরিফিকেশন পোর্টাল যা গ্রাহক এবং অ্যাডমিন ড্যাশবোর্ড সহ যেকোনো প্ল্যাটফর্মে, বিশেষ করে **Vercel**-এ ১-ক্লিকে ডেপ্লয় করার জন্য তৈরি করা হয়েছে।

---

## 🚀 Vercel-এ ডেপ্লয় করার সহজ ধাপ (How to Deploy to Vercel)

### পদ্ধতি ১: GitHub + Vercel Dashboard (সবচেয়ে সহজ)

1. এই প্রজেক্টের কোড আপনার GitHub অ্যাকাউন্টে একটি রিপোজিটরিতে পুশ করুন:
   ```bash
   git init
   git add .
   git commit -m "Deploy WMS Portal to Vercel"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. [Vercel](https://vercel.com)-এ যান এবং লগইন করুন।
3. **"Add New..." → "Project"** ক্লিক করুন।
4. আপনার গিটহাব রিপোজিটরিটি সিলেক্ট করে **"Import"** চাপুন।
5. Vercel বিল্ড সেটিংস স্বয়ংক্রিয়ভাবে শনাক্ত করবে:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. **"Deploy"** বাটনে ক্লিক করুন! ২ মিনিটের মধ্যে আপনার ওয়েবসাইট লাইভ হয়ে যাবে।

---

### পদ্ধতি ২: Vercel CLI দিয়ে সরাসরি ডেপ্লয়

টার্মিনালে সরাসরি রান করুন:
```bash
npx vercel --prod
```

### Shared Database Setup (আলাদা device-এ একই data দেখানোর জন্য)

এই project এখন Vercel-compatible Neon/Postgres database ব্যবহার করতে পারে। শুধু
localStorage থাকলে admin-এর product delete/add অন্য device-এ দেখা যায় না; database
যুক্ত করলে products এবং cashback claims সব device-এ shared থাকবে।

1. Vercel project-এ যান এবং **Storage / Marketplace → Neon Postgres** থেকে একটি
   database তৈরি করুন।
2. Database-টি এই Vercel project-এর সঙ্গে connect করুন। Vercel সাধারণত
   `DATABASE_URL` environment variable নিজে থেকে যোগ করে।
3. না হলে Project Settings → Environment Variables-এ এই variable যোগ করুন:
   `DATABASE_URL` = আপনার Neon/Postgres connection string
4. `DATABASE_URL`-টি **Production**, **Preview**, এবং **Development**—যে
   environment-এ deploy করবেন সেখানে enable করুন।
5. নতুন deploy দিন। প্রথম API request-এ tables নিজে তৈরি হবে এবং starter products
   একবার seed হবে।

Database variable না থাকলেও project build হবে এবং local fallback চালু থাকবে, কিন্তু
সে অবস্থায় data শুধু সেই browser/device-এ থাকবে। Database যুক্ত করার পরে admin panel
থেকে delete/add করা customer panel-এ অন্য device থেকেও sync হবে।

---

## ✨ প্রধান ফিচারসমূহ (Key Features)

### ১. কাস্টমার পোর্টাল (Customer Portal):
- **সহজ লগইন**: নাম, মোবাইল নম্বর, ইমেইল এবং পাসওয়ার্ড (কোনো OTP ঝামেলা নেই)।
- **ক্যাশব্যাক অফার পণ্য তালিকা**: Amazon, Flipkart, Blinkit-এর পণ্য।
- **স্পেশাল ভেরিফিকেশন কোড**: কার্ডে প্রদর্শিত বিশেষ কোড দিয়ে যাচাইকরণ।
- **৩টি স্ক্রিনশট প্রুফ সরাসরি আপলোড**:
  1. অর্ডার স্ক্রিনশট (Order Screenshot)
  2. পেমেন্ট রসিদ স্ক্রিনশট (Payment Receipt Screenshot)
  3. ডেলিভারির পর রেটিং স্ক্রিনশট (Rating Review Screenshot)
- **UPI আইডি ইনপুট**: রিফান্ড ক্যাশব্যাক পাওয়ার জন্য।
- **মাই ক্লেইমস ট্র্যাকার**: রিয়েল-টাইম স্ট্যাটাস (Pending, Approved, Rejected) ও অ্যাডমিন রিমার্কস দেখা।

### ২. অ্যাডমিন কনসোল (Admin Dashboard):
- **অ্যাডমিন লগইন**: ID: `admin` | Password: `admin123`
- **লাইভ কেপিআই মেট্রিক্স**: Total Claims, Pending Review, Approved Claims, Rejected Claims, Total Payout।
- **প্ল্যাটফর্ম ব্রেকডাউন**: Amazon, Flipkart, Blinkit শতাংশ হিসাব।
- **স্ক্রিনশট প্রুফ ইন্সপেকশন (Lightbox Modal)**: ক্লিক করে ফুল স্ক্রিন জুম ও রোটেট করে ৩টি ইমেজ ভেরিফাই করা।
- **স্পেশাল কোড ম্যাচ চেকার**: কোড মিলেছে কিনা স্বয়ংক্রিয়ভাবে গ্রিন/রেড ইন্ডিকেটর।
- **অ্যাপ্রুভ ও রিজেক্ট অ্যাকশন**: কারণ সহ ক্লেইম অনুমোদন বা বাতিল করা।
- **নতুন অফার পণ্য যুক্ত করা**: প্ল্যাটফর্ম, বিশেষ কোড ও ক্যাশব্যাক পরিমাণ নির্ধারণ করে।
- **CSV রিপোর্ট এক্সপোর্ট**: সমস্ত ক্লেইম ১-ক্লিকে এক্সেল বা সিএসভি ডাউনলোড।
- **লোকাল স্টোরেজ পারসিস্টেন্স**: রিলোড দিলেও ডাটা হারায় না।

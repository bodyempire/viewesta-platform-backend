# Viewesta Phase1 Requirements

> Converted from PDF

# Page 1

1   VIEWESTA  — Phase  1: Detailed  Features  & Requirements  Document  
 
 
1. Project  Vision  
 
Viewesta  is a African -based  digital  platform  dedicated  to promoting  African  movies  to a global  audience. 
Its mission  is to empower  individual  filmmakers,  helping  them  grow into the next generation  of storytellers 
while developing  and elevating  African  cinema  to world -class standards.  Through  accessible  technology  and 
fair exposure, Viewesta bridges the gap between local creators and international viewers, showcasing 
Africa’s  diverse  stories,  talent,  and culture.  
 
 
2. Detailed  Core Features 
for viewers  
 Browse and Watch African Movies: - Users can explore a large catalog of African films by genre, 
country, director,  or trending  titles.  - Advanced  search  filters:  release  year, rating,  popularity,  language,  
and country.  - Preview trailers before deciding to watch.  
 
 Flexible Access Models:  
- TVOD (Transactional Video on Demand): Buy individual movies and keep access for 7 days. Price varies 
depending on quality (480p, 720p, 1080p, 4K).  
- Subscription Model: Pay monthly or yearly for unlimited access. Subscribers can watch any movie in 
any quality without extra charges.  
- Spend - Per-Deposit System: Users  deposit  an amount  into their wallet.  Each movie  watched  
deducts  a fee depending  on selected  quality.  When  balance  finishes,  premium  access  locks until top-up. 
 
 User Accounts & Profiles: - Account creation using email, phone number, or social login (Google/ 
Facebook). - Personalized watchlists, favorites, and viewing history. - Option to follow favorite 
filmmakers or genres.  
 
 Movie Interaction: - Rate movies on a scale of 1 –5 stars. - Write and read reviews. - Share movies on 
social media.  
 
 Recommendations: - Personalized recommendations based on viewing history, ratings, and preferences. 
- Trending and popular movies highlighted on the homepage.  
 
 Secure  Payments:  - Supports multiple payment methods: mobile money (MTN, Airtel), credit/debit 
card, wallet deposits. - Instant confirmation of purchases and wallet top -ups. 
 
For Filmmakers  
 
 Upload  & Manage  Movies:  - Upload  video  files in multiple  resolutions  (480p  → 4K) and assign  pricing  
per quality. - Add title, description, genre, poster, trailer, cast & crew information.  
 

---

# Page 2

2   Filmmaker Dashboard: - Track movie views, earnings, ratings, and user feedback. - Generate  
weekly/ monthly reports for revenue and audience engagement. - Receive and manage payout requests

---

# Page 3

3  For Admins  
 
 Movie  Moderation:  - Approve  or reject  uploads  based  on quality,  copyright,  and compliance.  - 
Edit metadata, manage categories, and remove inappropriate content.  
 
 User & Filmmaker Management: - Monitor  user accounts,  activity,  and complaints.  - Approve  
filmmaker registrations and manage access.  
 
 Payment  Management:  - Track  all transactions:  TVOD  purchases,  subscriptions,  and wallet  
usage.  - Manage payouts to filmmakers.  
 
 Content Promotion & Analytics: - Highlight featured movies or genres on the homepage. - View 
platform analytics  for engagement,  revenue,  and growth.  
 
 
3. User Workflows  (Step -by-Step) 
➢  Viewer  Workflow  - Account  signup/login  via website  or mobile  app. - Browse  movies  by 
categories, trending,  or personalized  recommendations.  - Select  movie  → choose  access  model  
(TVOD,  subscription, wallet).  - Select  desired  video  quality.  - Make payment  via mobile  money,  card, 
or wallet.  - Stream/download  movie  immediately.  - Rate,  review,  or share  the movie.  
 
➢  Filmmaker Workflow - Sign up as filmmaker. - Upload movies with metadata and select 
resolutions/ pricing.  - Wait for admin  approval.  - Once  approved,  movie  is published.  - Track  
performance  and revenue via  dashboard.  - Request  payouts  securely.  
 
➢  Admin Workflow - Log in to admin dashboard. - Approve filmmaker accounts and movie uploads. - 
Manage movies, categories, and metadata. - Track users, transactions, and analytics. - Moderate 
content  and enforce compliance. - Highlight featured content.  
 
 
4. Technical  Requirements  
→ Frontend  (Web):  React.js  for responsive,  fast, and modern  user interface.  
 
→ Mobile  App: React  Native  (shared  codebase,  iOS & Android),  optional  Expo for testing.  
 
→ Backend:  Node.js  (Express.js  or NestJS)  for API, auth, payments,  and data management.  
 
→ Database:  MongoDB  or PostgreSQL  to store users,  movies,  transactions,  subscriptions,  analytics.  
 
→ Cloud  & Hosting:  AWS services — S3 for storage, EC2/Lambda for backend, CloudFront CDN, Cognito 
for auth.  
 
→ Payments  & Wallet:  Flutterwave  and Stripe.  

---

# Page 4

4  → Integrations: Analytics (AWS QuickSight), notifications (Firebase / Web Push), adaptive video  
streaming (HLS) for multiple resolutions.  
 
 
5. Non-Functional  Requirements  
 
• Security:  Encrypted  payments,  secure  auth,  GDPR/copyright  compliance.  
 
• Scalability:  Cloud  infrastructure  to handle  thousands  of concurrent  users.  
• Performance:  Smooth  video  streaming  at all qualities.  
• UX/UI:  Responsive  design,  easy navigation,  accessible  features.  
• Reliability:  Minimal  downtime,  backup  & recovery  processes.  
• Compliance:  Copyright,  privacy,  and financial  regulations  adhered.  
 
 
✓ Deliverables  & Timeline  (1 Week  Phase  1) 
✓ Detailed  Requirements  Document  (this document)  
✓ Confirmed  tech stack and cloud setup  
✓ User workflows  and interaction  diagrams  
 
 
End of Detailed  Features  & Requirements  Document  

---


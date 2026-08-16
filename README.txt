FIREBASE SETUP FILES - FLASHCARD APP

Các file:
1. firestore.rules
   - Rule bảo vệ users, decks, cards, studyStates, studySessions, reviewLogs, userSettings.
   - Mặc định chặn collection chưa khai báo.

2. firebase.js
   - File khởi tạo Firebase cho web HTML/JavaScript thuần.
   - Thay các giá trị YOUR_* bằng cấu hình Web App trong Firebase Console.
   - Export: app, auth, db, googleProvider, onAuthStateChanged.

3. firebase.json
   - Cấu hình Firebase CLI để deploy Firestore Rules/Indexes.

4. firestore.indexes.json
   - Chưa khai báo composite index. Firebase sẽ báo link tạo index khi query nào đó cần.

LƯU Ý:
- Không dùng rule: allow read, write: if true;
- Firebase Web apiKey không phải secret server-side.
- Mọi document cá nhân trong decks/cards/studyStates/studySessions/reviewLogs phải có:
  ownerId: auth.currentUser.uid

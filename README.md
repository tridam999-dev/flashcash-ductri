# NihonCards

Web flashcard tiếng Nhật mobile-first chạy hoàn toàn bằng HTML/CSS/JavaScript, không cần cài thư viện.

## Chạy nhanh

Cách 1: mở `index.html` trực tiếp trong trình duyệt.

Cách 2 (khuyến nghị để PWA/service worker hoạt động):

```bash
python -m http.server 8080
```

Sau đó mở `http://localhost:8080`.

## Chức năng đã có

- Dashboard mobile-first.
- Quản lý bộ thẻ và thẻ.
- Tạo thẻ thủ công.
- Import text/CSV/TSV với preview và chỉnh sửa trước khi nhập.
- Smart parser cho dạng `Kanji | Kana | nghĩa | JLPT` và các dấu phân cách phổ biến.
- Flashcard lật thẻ, phát âm tiếng Nhật bằng SpeechSynthesis, đánh dấu yêu thích.
- SRS theo 4 mức Again / Hard / Good / Easy, lưu lịch ôn riêng từng thẻ.
- Learn mode: trắc nghiệm và gõ đáp án.
- Test mode có điểm, độ chính xác, xem lại câu sai.
- Tìm kiếm theo Kanji/Kana/Romaji/nghĩa/tag.
- Smart deck: đến hạn, từ khó, yêu thích, từ mới.
- Thống kê: số thẻ, mastery, accuracy, thời gian học, streak và heatmap 28 ngày.
- Cài đặt: dark/light/system, furigana, romaji, mục tiêu ngày, autoplay audio.
- Backup/restore JSON và export CSV.
- PWA/offline cache cơ bản.
- Dữ liệu lưu bằng localStorage, không mất khi reload.

## Phần chưa nối backend thật

Bản này là local-first functional build. Các chức năng cần dịch vụ bên ngoài như Firebase Auth/Cloud Sync/Community, AI generate, OCR ảnh/PDF và đồng bộ đa thiết bị chưa được giả lập để tránh tạo chức năng giả. Có thể nối tiếp bằng backend sau.

/* Sinh tự động bởi tools/gen-big.js + tools/build-big.js — công thức 4×4 / 5×5, đã kiểm chứng bằng mô phỏng (js/bigcube.js). */
window.BigData = {
 "4": [
  {
   "group": "Ký hiệu lớp rộng & lớp trong",
   "title": "Ký hiệu Rw",
   "alg": "Rw",
   "desc": "Lớp ngoài cùng + lớp thứ 2 bên phải xoay cùng lúc (2 lớp). Viết thường: <code>r</code>.",
   "tags": [
    "Ký hiệu"
   ],
   "kind": "notation",
   "demo": true,
   "id": "b4-1"
  },
  {
   "group": "Ký hiệu lớp rộng & lớp trong",
   "title": "Ký hiệu 2R",
   "alg": "2R",
   "desc": "CHỈ lớp thứ 2 tính từ mặt phải (lớp trong), mặt R không xoay. Còn gọi lớp \"slice\".",
   "tags": [
    "Ký hiệu"
   ],
   "kind": "notation",
   "demo": true,
   "id": "b4-2"
  },
  {
   "group": "Ký hiệu lớp rộng & lớp trong",
   "title": "Ký hiệu Uw'",
   "alg": "Uw'",
   "desc": "2 lớp trên cùng xoay ngược chiều kim đồng hồ. Viết thường: <code>u'</code>.",
   "tags": [
    "Ký hiệu"
   ],
   "kind": "notation",
   "demo": true,
   "id": "b4-3"
  },
  {
   "group": "Ký hiệu lớp rộng & lớp trong",
   "title": "Ký hiệu 2F2",
   "alg": "2F2",
   "desc": "Lớp thứ 2 tính từ mặt trước xoay 180°.",
   "tags": [
    "Ký hiệu"
   ],
   "kind": "notation",
   "demo": true,
   "id": "b4-4"
  },
  {
   "group": "Ký hiệu lớp rộng & lớp trong",
   "title": "Wide = ngoài + trong",
   "alg": "Lw' 2L",
   "desc": "Ghép: <code>Lw'</code> (2 lớp trái) rồi <code>2L</code> (lớp 2 bên trái) — 2 lớp này triệt tiêu một phần nhau, chỉ còn mặt L xoay: dùng để hiểu \"wide = ngoài + trong\".",
   "tags": [
    "Ký hiệu"
   ],
   "kind": "notation",
   "demo": true,
   "id": "b4-5"
  },
  {
   "group": "Bước 1 · Tâm",
   "alg": "R 2U R' 2D R 2U' R' 2D'",
   "title": "Tâm 1",
   "desc": "Chuyển ô tâm: Trước (trái-dưới) → Sau (phải-trên); Sau (phải-trên) → Phải (dưới-trước); Phải (dưới-trước) → Trước (trái-dưới). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm",
    "Trước",
    "Sau",
    "Phải"
   ],
   "kind": "xcenter",
   "special": false,
   "id": "b4-6"
  },
  {
   "group": "Bước 1 · Tâm",
   "alg": "R 2U R' 2D2 R 2U' R' 2D2",
   "title": "Tâm 2",
   "desc": "Chuyển ô tâm: Trái (dưới-sau) → Sau (phải-trên); Sau (phải-trên) → Phải (dưới-trước); Phải (dưới-trước) → Trái (dưới-sau). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm",
    "Trái",
    "Sau",
    "Phải"
   ],
   "kind": "xcenter",
   "special": false,
   "id": "b4-7"
  },
  {
   "group": "Bước 1 · Tâm",
   "alg": "R 2U R' 2B R 2U' R' 2B'",
   "title": "Tâm 3",
   "desc": "Chuyển ô tâm: Trái (trên-sau) → Trên (phải-sau); Trên (phải-sau) → Trước (trái-trên); Trước (trái-trên) → Trái (trên-sau). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm",
    "Trái",
    "Trên",
    "Trước"
   ],
   "kind": "xcenter",
   "special": false,
   "id": "b4-8"
  },
  {
   "group": "Bước 1 · Tâm",
   "alg": "L 2U L' 2D L 2U' L' 2D'",
   "title": "Tâm 4",
   "desc": "Chuyển ô tâm: Trái (dưới-sau) → Sau (phải-dưới); Sau (phải-dưới) → Trước (trái-trên); Trước (trái-trên) → Trái (dưới-sau). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm",
    "Trái",
    "Sau",
    "Trước"
   ],
   "kind": "xcenter",
   "special": false,
   "id": "b4-9"
  },
  {
   "group": "Bước 1 · Tâm",
   "alg": "L 2U L' 2D2 L 2U' L' 2D2",
   "title": "Tâm 5",
   "desc": "Chuyển ô tâm: Trái (dưới-sau) → Phải (dưới-trước); Phải (dưới-trước) → Trước (trái-trên); Trước (trái-trên) → Trái (dưới-sau). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm",
    "Trái",
    "Phải",
    "Trước"
   ],
   "kind": "xcenter",
   "special": false,
   "id": "b4-10"
  },
  {
   "group": "Bước 1 · Tâm",
   "alg": "L 2U L' 2F L 2U' L' 2F'",
   "title": "Tâm 6",
   "desc": "Chuyển ô tâm: Trên (trái-trước) → Sau (phải-trên); Sau (phải-trên) → Phải (trên-trước); Phải (trên-trước) → Trên (trái-trước). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm",
    "Trên",
    "Sau",
    "Phải"
   ],
   "kind": "xcenter",
   "special": false,
   "id": "b4-11"
  },
  {
   "group": "Bước 1 · Tâm",
   "alg": "U 2R U' 2L U 2R' U' 2L'",
   "title": "Tâm 7",
   "desc": "Chuyển ô tâm: Sau (trái-dưới) → Trước (phải-trên); Trước (phải-trên) → Trên (trái-sau); Trên (trái-sau) → Sau (trái-dưới). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm",
    "Sau",
    "Trước",
    "Trên"
   ],
   "kind": "xcenter",
   "special": false,
   "id": "b4-12"
  },
  {
   "group": "Bước 1 · Tâm",
   "alg": "U 2R U' 2L2 U 2R' U' 2L2",
   "title": "Tâm 8",
   "desc": "Chuyển ô tâm: Dưới (trái-trước) → Trước (phải-trên); Trước (phải-trên) → Trên (trái-sau); Trên (trái-sau) → Dưới (trái-trước). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm",
    "Dưới",
    "Trước",
    "Trên"
   ],
   "kind": "xcenter",
   "special": false,
   "id": "b4-13"
  },
  {
   "group": "Bước 2 · Cạnh",
   "alg": "R U R' 2U R U' R' 2U'",
   "title": "Cạnh 1",
   "desc": "Hoán vị vòng 3 cánh cạnh: UB (trái) → FR (trên); FR (trên) → BR (trên); BR (trên) → UB (trái). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh",
    "UB",
    "FR",
    "BR"
   ],
   "kind": "wing",
   "special": false,
   "id": "b4-14"
  },
  {
   "group": "Bước 2 · Cạnh",
   "alg": "R U R' 2U' R U' R' 2U",
   "title": "Cạnh 2",
   "desc": "Hoán vị vòng 3 cánh cạnh: FL (trên) → UB (trái); UB (trái) → FR (trên); FR (trên) → FL (trên). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh",
    "FL",
    "UB",
    "FR"
   ],
   "kind": "wing",
   "special": false,
   "id": "b4-15"
  },
  {
   "group": "Bước 2 · Cạnh",
   "alg": "R U R' 2U2 R U' R' 2U2",
   "title": "Cạnh 3",
   "desc": "Hoán vị vòng 3 cánh cạnh: BL (trên) → UB (trái); UB (trái) → FR (trên); FR (trên) → BL (trên). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh",
    "BL",
    "UB",
    "FR"
   ],
   "kind": "wing",
   "special": false,
   "id": "b4-16"
  },
  {
   "group": "Bước 2 · Cạnh",
   "alg": "L U L' 2U L U' L' 2U'",
   "title": "Cạnh 4",
   "desc": "Hoán vị vòng 3 cánh cạnh: BL (trên) → FL (trên); FL (trên) → UF (phải); UF (phải) → BL (trên). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh",
    "BL",
    "FL",
    "UF"
   ],
   "kind": "wing",
   "special": false,
   "id": "b4-17"
  },
  {
   "group": "Bước 2 · Cạnh",
   "alg": "L U L' 2U' L U' L' 2U",
   "title": "Cạnh 5",
   "desc": "Hoán vị vòng 3 cánh cạnh: BL (trên) → BR (trên); BR (trên) → UF (phải); UF (phải) → BL (trên). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh",
    "BL",
    "BR",
    "UF"
   ],
   "kind": "wing",
   "special": false,
   "id": "b4-18"
  },
  {
   "group": "Bước 2 · Cạnh",
   "alg": "L U L' 2U2 L U' L' 2U2",
   "title": "Cạnh 6",
   "desc": "Hoán vị vòng 3 cánh cạnh: BL (trên) → FR (trên); FR (trên) → UF (phải); UF (phải) → BL (trên). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh",
    "BL",
    "FR",
    "UF"
   ],
   "kind": "wing",
   "special": false,
   "id": "b4-19"
  },
  {
   "group": "Bước 2 · Cạnh",
   "alg": "U R U' 2R U R' U' 2R'",
   "title": "Cạnh 7",
   "desc": "Hoán vị vòng 3 cánh cạnh: UB (phải) → UF (phải); UF (phải) → FR (dưới); FR (dưới) → UB (phải). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh",
    "UB",
    "UF",
    "FR"
   ],
   "kind": "wing",
   "special": false,
   "id": "b4-20"
  },
  {
   "group": "Bước 2 · Cạnh",
   "alg": "U R U' 2R' U R' U' 2R",
   "title": "Cạnh 8",
   "desc": "Hoán vị vòng 3 cánh cạnh: DB (phải) → FR (dưới); FR (dưới) → UB (phải); UB (phải) → DB (phải). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh",
    "DB",
    "FR",
    "UB"
   ],
   "kind": "wing",
   "special": false,
   "id": "b4-21"
  },
  {
   "group": "SPECIAL",
   "alg": "R 2U R' 2D' R 2U' R' 2D",
   "title": "Tâm — ca đặc biệt 1",
   "desc": "Chuyển ô tâm: Sau (phải-dưới) → Sau (phải-trên); Sau (phải-trên) → Phải (dưới-trước); Phải (dưới-trước) → Sau (phải-dưới). Góc, cạnh và các ô tâm khác giữ nguyên. Hai trong ba ô tâm nằm trên cùng một mặt.",
   "tags": [
    "Tâm",
    "Đặc biệt"
   ],
   "kind": "xcenter",
   "special": true,
   "id": "b4-22"
  },
  {
   "group": "SPECIAL",
   "alg": "R 2U' R' 2D R 2U R' 2D'",
   "title": "Tâm — ca đặc biệt 2",
   "desc": "Chuyển ô tâm: Trước (trái-dưới) → Trước (trái-trên); Trước (trái-trên) → Phải (dưới-trước); Phải (dưới-trước) → Trước (trái-dưới). Góc, cạnh và các ô tâm khác giữ nguyên. Hai trong ba ô tâm nằm trên cùng một mặt.",
   "tags": [
    "Tâm",
    "Đặc biệt"
   ],
   "kind": "xcenter",
   "special": true,
   "id": "b4-23"
  },
  {
   "group": "SPECIAL",
   "alg": "L 2U L' 2D' L 2U' L' 2D",
   "title": "Tâm — ca đặc biệt 3",
   "desc": "Chuyển ô tâm: Trái (dưới-sau) → Trước (trái-dưới); Trước (trái-dưới) → Trước (trái-trên); Trước (trái-trên) → Trái (dưới-sau). Góc, cạnh và các ô tâm khác giữ nguyên. Hai trong ba ô tâm nằm trên cùng một mặt.",
   "tags": [
    "Tâm",
    "Đặc biệt"
   ],
   "kind": "xcenter",
   "special": true,
   "id": "b4-24"
  },
  {
   "group": "SPECIAL",
   "special": true,
   "title": "Parity OLL — 1 cạnh bị lật",
   "alg": "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw'",
   "kind": "parity",
   "stage": "oll",
   "start": {
    "flip": "UF"
   },
   "desc": "Khi ghép cạnh xong và giải như 3×3 mà tầng trên có ĐÚNG 1 cạnh bị lật (số cạnh vàng lẻ) — không có trên 3×3. Công thức lật cặp cạnh UF, đồng thời đổi chỗ 2 góc và 2 cạnh bên cạnh, nên sau đó tầng trên đã có chữ thập vàng nhưng các góc cần làm lại: bạn sẽ gặp OLL 23 (xoay U cho đúng thế rồi giải OLL + PLL như bình thường).",
   "tags": [
    "Parity",
    "Chỉ có trên 4×4"
   ],
   "after": "OLL 23",
   "id": "b4-25"
  },
  {
   "group": "SPECIAL",
   "special": true,
   "title": "Parity OLL — bản rút gọn",
   "alg": "Rw2 B2 U2 Lw U2 Rw' U2 Rw U2 F2 Rw F2 Lw' B2 Rw2",
   "kind": "parity",
   "stage": "oll",
   "start": {
    "flip": "UF"
   },
   "desc": "Công thức khác cho cùng tình huống (đã kiểm chứng cho kết quả giống hệt bản dài). Ngắn hơn khi đã quen các nước r2, l, B2, F2.",
   "tags": [
    "Parity",
    "Chỉ có trên 4×4"
   ],
   "after": "OLL 23",
   "id": "b4-26"
  },
  {
   "group": "SPECIAL",
   "special": true,
   "title": "Parity PLL — 2 cạnh đối diện đổi chỗ",
   "alg": "2R2 U2 2R2 Uw2 2R2 Uw2",
   "kind": "parity",
   "stage": "pll",
   "desc": "Tầng trên đã vàng nhưng chỉ có 2 cạnh (đối diện) bị đổi chỗ, các góc đúng — PLL 3×3 nào cũng không tạo ra được hình này. Chạy công thức rồi giải PLL như bình thường (nếu cần).",
   "tags": [
    "Parity",
    "Chỉ có trên 4×4"
   ],
   "after": "Góc: đã đúng chỗ · Cạnh: hoán đổi 2 cạnh đối diện",
   "id": "b4-27"
  }
 ],
 "5": [
  {
   "group": "Ký hiệu lớp rộng & lớp trong",
   "title": "Ký hiệu Rw",
   "alg": "Rw",
   "desc": "2 lớp ngoài bên phải xoay cùng lúc (lớp 1 + lớp 2). Viết thường: <code>r</code>.",
   "tags": [
    "Ký hiệu"
   ],
   "kind": "notation",
   "demo": true,
   "id": "b5-1"
  },
  {
   "group": "Ký hiệu lớp rộng & lớp trong",
   "title": "Ký hiệu 3Rw",
   "alg": "3Rw",
   "desc": "3 lớp ngoài bên phải xoay cùng lúc (lớp 1, 2, 3).",
   "tags": [
    "Ký hiệu"
   ],
   "kind": "notation",
   "demo": true,
   "id": "b5-2"
  },
  {
   "group": "Ký hiệu lớp rộng & lớp trong",
   "title": "Ký hiệu 2R",
   "alg": "2R",
   "desc": "CHỈ lớp thứ 2 tính từ mặt phải.",
   "tags": [
    "Ký hiệu"
   ],
   "kind": "notation",
   "demo": true,
   "id": "b5-3"
  },
  {
   "group": "Ký hiệu lớp rộng & lớp trong",
   "title": "Ký hiệu 3R",
   "alg": "3R",
   "desc": "CHỈ lớp giữa (lớp thứ 3 — cũng chính là lớp giữa của khối 5×5; còn gọi là <code>M</code> khi tính theo mặt trái).",
   "tags": [
    "Ký hiệu"
   ],
   "kind": "notation",
   "demo": true,
   "id": "b5-4"
  },
  {
   "group": "Ký hiệu lớp rộng & lớp trong",
   "title": "Ký hiệu 2-3R",
   "alg": "2-3R",
   "desc": "Lớp 2 và lớp 3 xoay cùng lúc (không có mặt R ngoài cùng).",
   "tags": [
    "Ký hiệu"
   ],
   "kind": "notation",
   "demo": true,
   "id": "b5-5"
  },
  {
   "group": "Bước 1a · Tâm chéo (X-center)",
   "alg": "R 2U R' 2B' R 2U' R' 2B",
   "title": "X-center 1",
   "desc": "Chuyển ô tâm: Trái (trên-sau) → Dưới (trái-sau); Dưới (trái-sau) → Trước (trái-trên); Trước (trái-trên) → Trái (trên-sau). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm chéo",
    "Trái",
    "Dưới",
    "Trước"
   ],
   "kind": "xcenter",
   "special": false,
   "id": "b5-6"
  },
  {
   "group": "Bước 1a · Tâm chéo (X-center)",
   "alg": "R 2U R' 2B2 R 2U' R' 2B2",
   "title": "X-center 2",
   "desc": "Chuyển ô tâm: Trái (trên-sau) → Phải (dưới-sau); Phải (dưới-sau) → Trước (trái-trên); Trước (trái-trên) → Trái (trên-sau). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm chéo",
    "Trái",
    "Phải",
    "Trước"
   ],
   "kind": "xcenter",
   "special": false,
   "id": "b5-7"
  },
  {
   "group": "Bước 1a · Tâm chéo (X-center)",
   "alg": "R 2U' R' 2D' R 2U R' 2D",
   "title": "X-center 3",
   "desc": "Chuyển ô tâm: Trước (trái-trên) → Phải (dưới-trước); Phải (dưới-trước) → Sau (phải-dưới); Sau (phải-dưới) → Trước (trái-trên). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm chéo",
    "Trước",
    "Phải",
    "Sau"
   ],
   "kind": "xcenter",
   "special": false,
   "id": "b5-8"
  },
  {
   "group": "Bước 1a · Tâm chéo (X-center)",
   "alg": "L 2U L' 2F' L 2U' L' 2F",
   "title": "X-center 4",
   "desc": "Chuyển ô tâm: Dưới (phải-trước) → Sau (phải-trên); Sau (phải-trên) → Phải (trên-trước); Phải (trên-trước) → Dưới (phải-trước). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm chéo",
    "Dưới",
    "Sau",
    "Phải"
   ],
   "kind": "xcenter",
   "special": false,
   "id": "b5-9"
  },
  {
   "group": "Bước 1a · Tâm chéo (X-center)",
   "alg": "L 2U L' 2F2 L 2U' L' 2F2",
   "title": "X-center 5",
   "desc": "Chuyển ô tâm: Trái (dưới-trước) → Sau (phải-trên); Sau (phải-trên) → Phải (trên-trước); Phải (trên-trước) → Trái (dưới-trước). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm chéo",
    "Trái",
    "Sau",
    "Phải"
   ],
   "kind": "xcenter",
   "special": false,
   "id": "b5-10"
  },
  {
   "group": "Bước 1a · Tâm chéo (X-center)",
   "alg": "L 2U' L' 2D' L 2U L' 2D",
   "title": "X-center 6",
   "desc": "Chuyển ô tâm: Trái (dưới-sau) → Trước (trái-dưới); Trước (trái-dưới) → Sau (phải-trên); Sau (phải-trên) → Trái (dưới-sau). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm chéo",
    "Trái",
    "Trước",
    "Sau"
   ],
   "kind": "xcenter",
   "special": false,
   "id": "b5-11"
  },
  {
   "group": "Bước 1b · Tâm chữ thập (T-center)",
   "alg": "R 2U R' 3U' R 2U' R' 3U",
   "title": "T-center 1",
   "desc": "Chuyển ô tâm: Trước (trái) → Sau (trên); Sau (trên) → Phải (trước); Phải (trước) → Trước (trái). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm chữ thập",
    "Trước",
    "Sau",
    "Phải"
   ],
   "kind": "tcenter",
   "special": false,
   "id": "b5-12"
  },
  {
   "group": "Bước 1b · Tâm chữ thập (T-center)",
   "alg": "R 2U R' 3U2 R 2U' R' 3U2",
   "title": "T-center 2",
   "desc": "Chuyển ô tâm: Trái (sau) → Sau (trên); Sau (trên) → Phải (trước); Phải (trước) → Trái (sau). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm chữ thập",
    "Trái",
    "Sau",
    "Phải"
   ],
   "kind": "tcenter",
   "special": false,
   "id": "b5-13"
  },
  {
   "group": "Bước 1b · Tâm chữ thập (T-center)",
   "alg": "R 2U R' 3F R 2U' R' 3F'",
   "title": "T-center 3",
   "desc": "Chuyển ô tâm: Trái (trên) → Dưới (trái); Dưới (trái) → Trước (trên); Trước (trên) → Trái (trên). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm chữ thập",
    "Trái",
    "Dưới",
    "Trước"
   ],
   "kind": "tcenter",
   "special": false,
   "id": "b5-14"
  },
  {
   "group": "Bước 1b · Tâm chữ thập (T-center)",
   "alg": "L 2U L' 3U' L 2U' L' 3U",
   "title": "T-center 4",
   "desc": "Chuyển ô tâm: Trái (sau) → Sau (phải); Sau (phải) → Trước (trên); Trước (trên) → Trái (sau). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm chữ thập",
    "Trái",
    "Sau",
    "Trước"
   ],
   "kind": "tcenter",
   "special": false,
   "id": "b5-15"
  },
  {
   "group": "Bước 1b · Tâm chữ thập (T-center)",
   "alg": "L 2U L' 3U2 L 2U' L' 3U2",
   "title": "T-center 5",
   "desc": "Chuyển ô tâm: Trái (sau) → Phải (trước); Phải (trước) → Trước (trên); Trước (trên) → Trái (sau). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm chữ thập",
    "Trái",
    "Phải",
    "Trước"
   ],
   "kind": "tcenter",
   "special": false,
   "id": "b5-16"
  },
  {
   "group": "Bước 1b · Tâm chữ thập (T-center)",
   "alg": "L 2U L' 3F L 2U' L' 3F'",
   "title": "T-center 6",
   "desc": "Chuyển ô tâm: Trên (trái) → Sau (trên); Sau (trên) → Phải (trên); Phải (trên) → Trên (trái). Góc, cạnh và các ô tâm khác giữ nguyên.",
   "tags": [
    "Tâm chữ thập",
    "Trên",
    "Sau",
    "Phải"
   ],
   "kind": "tcenter",
   "special": false,
   "id": "b5-17"
  },
  {
   "group": "Bước 2a · Cạnh ngoài (wing)",
   "alg": "R U R' 2D R U' R' 2D'",
   "title": "Wing 1",
   "desc": "Hoán vị vòng 3 cánh cạnh: FL (dưới) → UB (phải); UB (phải) → FR (dưới); FR (dưới) → FL (dưới). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh ngoài",
    "FL",
    "UB",
    "FR"
   ],
   "kind": "wing",
   "special": false,
   "id": "b5-18"
  },
  {
   "group": "Bước 2a · Cạnh ngoài (wing)",
   "alg": "R U R' 2D' R U' R' 2D",
   "title": "Wing 2",
   "desc": "Hoán vị vòng 3 cánh cạnh: UB (phải) → FR (dưới); FR (dưới) → BR (dưới); BR (dưới) → UB (phải). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh ngoài",
    "UB",
    "FR",
    "BR"
   ],
   "kind": "wing",
   "special": false,
   "id": "b5-19"
  },
  {
   "group": "Bước 2a · Cạnh ngoài (wing)",
   "alg": "R U R' 2D2 R U' R' 2D2",
   "title": "Wing 3",
   "desc": "Hoán vị vòng 3 cánh cạnh: BL (dưới) → UB (phải); UB (phải) → FR (dưới); FR (dưới) → BL (dưới). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh ngoài",
    "BL",
    "UB",
    "FR"
   ],
   "kind": "wing",
   "special": false,
   "id": "b5-20"
  },
  {
   "group": "Bước 2a · Cạnh ngoài (wing)",
   "alg": "L U L' 2D L U' L' 2D'",
   "title": "Wing 4",
   "desc": "Hoán vị vòng 3 cánh cạnh: BL (dưới) → BR (dưới); BR (dưới) → UF (trái); UF (trái) → BL (dưới). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh ngoài",
    "BL",
    "BR",
    "UF"
   ],
   "kind": "wing",
   "special": false,
   "id": "b5-21"
  },
  {
   "group": "Bước 2a · Cạnh ngoài (wing)",
   "alg": "L U L' 2D' L U' L' 2D",
   "title": "Wing 5",
   "desc": "Hoán vị vòng 3 cánh cạnh: BL (dưới) → FL (dưới); FL (dưới) → UF (trái); UF (trái) → BL (dưới). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh ngoài",
    "BL",
    "FL",
    "UF"
   ],
   "kind": "wing",
   "special": false,
   "id": "b5-22"
  },
  {
   "group": "Bước 2a · Cạnh ngoài (wing)",
   "alg": "L U L' 2D2 L U' L' 2D2",
   "title": "Wing 6",
   "desc": "Hoán vị vòng 3 cánh cạnh: BL (dưới) → FR (dưới); FR (dưới) → UF (trái); UF (trái) → BL (dưới). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh ngoài",
    "BL",
    "FR",
    "UF"
   ],
   "kind": "wing",
   "special": false,
   "id": "b5-23"
  },
  {
   "group": "Bước 2b · Cạnh giữa",
   "alg": "R U R' 3U R U' R' 3U'",
   "title": "Cạnh giữa 1",
   "desc": "Hoán vị vòng 3 cánh cạnh: UB (giữa) → FR (giữa); FR (giữa) → BR (giữa); BR (giữa) → UB (giữa). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh giữa",
    "UB",
    "FR",
    "BR"
   ],
   "kind": "mid-edge",
   "special": false,
   "id": "b5-24"
  },
  {
   "group": "Bước 2b · Cạnh giữa",
   "alg": "R U R' 3U' R U' R' 3U",
   "title": "Cạnh giữa 2",
   "desc": "Hoán vị vòng 3 cánh cạnh: FL (giữa) → UB (giữa); UB (giữa) → FR (giữa); FR (giữa) → FL (giữa). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh giữa",
    "FL",
    "UB",
    "FR"
   ],
   "kind": "mid-edge",
   "special": false,
   "id": "b5-25"
  },
  {
   "group": "Bước 2b · Cạnh giữa",
   "alg": "R U R' 3U2 R U' R' 3U2",
   "title": "Cạnh giữa 3",
   "desc": "Hoán vị vòng 3 cánh cạnh: BL (giữa) → UB (giữa); UB (giữa) → FR (giữa); FR (giữa) → BL (giữa). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh giữa",
    "BL",
    "UB",
    "FR"
   ],
   "kind": "mid-edge",
   "special": false,
   "id": "b5-26"
  },
  {
   "group": "Bước 2b · Cạnh giữa",
   "alg": "R U' R' 3U R U R' 3U'",
   "title": "Cạnh giữa 4",
   "desc": "Hoán vị vòng 3 cánh cạnh: UF (giữa) → FR (giữa); FR (giữa) → BR (giữa); BR (giữa) → UF (giữa). Góc, tâm và các cạnh khác giữ nguyên.",
   "tags": [
    "Cạnh giữa",
    "UF",
    "FR",
    "BR"
   ],
   "kind": "mid-edge",
   "special": false,
   "id": "b5-27"
  },
  {
   "group": "SPECIAL",
   "alg": "R 2U2 R' 2D2 R 2U2 R' 2D2",
   "title": "X-center — ca đặc biệt 1",
   "desc": "Chuyển ô tâm: Trái (dưới-sau) → Trái (trên-sau); Trái (trên-sau) → Phải (dưới-trước); Phải (dưới-trước) → Trái (dưới-sau). Góc, cạnh và các ô tâm khác giữ nguyên. Hai trong ba ô tâm nằm trên cùng một mặt.",
   "tags": [
    "Tâm chéo",
    "Đặc biệt"
   ],
   "kind": "xcenter",
   "special": true,
   "id": "b5-28"
  },
  {
   "group": "SPECIAL",
   "alg": "R 2U2 R' 2B2 R 2U2 R' 2B2",
   "title": "X-center — ca đặc biệt 2",
   "desc": "Chuyển ô tâm: Trái (trên-sau) → Phải (dưới-sau); Phải (dưới-sau) → Phải (dưới-trước); Phải (dưới-trước) → Trái (trên-sau). Góc, cạnh và các ô tâm khác giữ nguyên. Hai trong ba ô tâm nằm trên cùng một mặt.",
   "tags": [
    "Tâm chéo",
    "Đặc biệt"
   ],
   "kind": "xcenter",
   "special": true,
   "id": "b5-29"
  },
  {
   "group": "SPECIAL",
   "alg": "R 2U R' 3U R 2U' R' 3U'",
   "title": "T-center — ca đặc biệt 1",
   "desc": "Chuyển ô tâm: Sau (trên) → Phải (trước); Phải (trước) → Sau (phải); Sau (phải) → Sau (trên). Góc, cạnh và các ô tâm khác giữ nguyên. Hai trong ba ô tâm nằm trên cùng một mặt.",
   "tags": [
    "Tâm chữ thập",
    "Đặc biệt"
   ],
   "kind": "tcenter",
   "special": true,
   "id": "b5-30"
  },
  {
   "group": "SPECIAL",
   "alg": "R 2U' R' 3U' R 2U R' 3U",
   "title": "T-center — ca đặc biệt 2",
   "desc": "Chuyển ô tâm: Trước (trái) → Trước (trên); Trước (trên) → Phải (trước); Phải (trước) → Trước (trái). Góc, cạnh và các ô tâm khác giữ nguyên. Hai trong ba ô tâm nằm trên cùng một mặt.",
   "tags": [
    "Tâm chữ thập",
    "Đặc biệt"
   ],
   "kind": "tcenter",
   "special": true,
   "id": "b5-31"
  }
 ]
};

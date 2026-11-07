/* Giáo trình cho người mới: phương pháp từng tầng (Layer-by-Layer).
   Tư thế cầm khối: mặt VÀNG ở trên, mặt TRẮNG ở dưới, tâm XANH LÁ hướng về phía bạn (khớp với hình trong app).
   Mọi công thức được kiểm chứng bằng mô phỏng (xem tools/probe*.js). */
(function (root) {
  const LESSONS = [
    {
      id: 1, icon: '🧊', title: 'Làm quen với khối Rubik', time: '5 phút',
      goal: 'Biết khối gồm những mảnh nào và vì sao tâm là "kim chỉ nam".',
      special: 'anatomy',
      html: `
        <p>Khối 3×3 có <b>26 mảnh nhìn thấy</b>, chia làm 3 loại:</p>
        <ul>
          <li><b>6 tâm</b> (1 màu) — <u>không bao giờ đổi chỗ</u> so với nhau. Tâm quyết định màu của cả mặt đó.</li>
          <li><b>12 cạnh</b> (2 màu) — nằm giữa hai tâm.</li>
          <li><b>8 góc</b> (3 màu) — nằm ở đỉnh khối.</li>
        </ul>
        <p>Các cặp màu đối diện (sơ đồ chuẩn): <b>vàng ↔ trắng</b>, <b>xanh lá ↔ xanh dương</b>, <b>cam ↔ đỏ</b>. Trong app, khi cầm khối: vàng trên, trắng dưới, xanh lá trước, cam bên phải, đỏ bên trái.</p>
        <div class="note">Quy tắc vàng: <b>chỉ cần quan tâm tương quan giữa các mảnh và tâm</b>. Giải khối = đưa từng mảnh về đúng cạnh tâm cùng màu với nó.</div>`,
      tips: ['Cầm cố định một tư thế (vàng trên, xanh lá trước) để khớp với ký hiệu trong các bài sau.', 'Kéo thả khối ở trên để xem mọi phía; cuộn chuột để phóng to.']
    },
    {
      id: 2, icon: '📖', title: 'Đọc ký hiệu xoay', time: '5 phút',
      goal: 'Hiểu R, U, F, dấu nháy (\') và số 2 — ngôn ngữ của mọi công thức.',
      link: ['#/notation', 'Mở trang Ký hiệu để thử từng nước đi'],
      html: `
        <p>Mỗi chữ cái là một mặt: <b>U</b> (trên), <b>D</b> (dưới), <b>L</b> (trái), <b>R</b> (phải), <b>F</b> (trước), <b>B</b> (sau).</p>
        <ul>
          <li>Chỉ có chữ cái: quay mặt đó <b>90° theo chiều kim đồng hồ</b> khi bạn nhìn thẳng vào mặt đó.</li>
          <li>Có dấu nháy <code>'</code>: quay <b>ngược</b> chiều kim đồng hồ.</li>
          <li>Có số <code>2</code>: quay <b>180°</b>.</li>
        </ul>
        <p>Công thức chỉ là chuỗi các nước đi đọc từ trái sang phải, ví dụ <code>R U R' U'</code>.</p>`,
      demos: [{ title: 'Thử ngay: R U R\' U\'', alg: "R U R' U'", scramble: '', note: 'Khối đã giải — xem từng mặt xoay theo ký hiệu. Công thức này gọi là "sexy move", sẽ dùng rất nhiều.' }],
      tips: ['Thuộc 6 mặt và dấu nháy là đủ cho toàn bộ giáo trình này.']
    },
    {
      id: 3, icon: '➕', title: 'Bước 1 — Chữ thập trắng', time: '15 phút',
      goal: 'Có 4 cạnh trắng ở mặt dưới, màu bên của mỗi cạnh khớp với tâm cạnh bên.',
      html: `
        <p>Đây là bước <b>dựa vào quan sát</b>, không cần học thuộc. Cách dễ nhất cho người mới là <b>"bông cúc"</b>:</p>
        <ol>
          <li><b>Bông cúc:</b> cầm mặt <b>vàng ở trên</b>. Đưa 4 cạnh trắng lên quanh tâm vàng sao cho <u>ô trắng hướng lên</u>.</li>
          <li><b>Khớp màu:</b> xoay mặt trên (U) cho đến khi <u>màu bên</u> của một cạnh trắng trùng màu tâm của mặt bên đó.</li>
          <li><b>Hạ xuống:</b> xoay mặt bên đó <b>180°</b> (ví dụ F2) — cạnh trắng chui xuống tầng dưới, đúng chỗ.</li>
          <li>Lặp cho cả 4 cạnh → chữ thập trắng hoàn chỉnh ở dưới.</li>
        </ol>
        <div class="note">Mẹo: nếu cạnh trắng đang nằm ở tầng giữa hay tầng dưới sai hướng, hãy xoay nó lên tầng trên bằng 1–2 nước, miễn <b>không phá các cạnh trắng đã làm</b>.</div>`,
      demos: [{
        title: 'Từ "bông cúc" xuống chữ thập', scramble: 'F2 R2 B2 L2 U', alg: "U' F2 R2 B2 L2",
        note: '4 cạnh trắng đã nằm quanh tâm vàng. Xoay U cho màu bên khớp tâm, rồi xoay từng mặt bên 180° để hạ cạnh trắng xuống thành chữ thập.'
      }],
      tips: ['Giữ nguyên tư thế cầm: vàng trên, trắng dưới — chữ thập trắng nằm ở mặt dưới.', 'Đừng vội: luyện bước này đến khi làm không cần suy nghĩ lâu.']
    },
    {
      id: 4, icon: '🔲', title: 'Bước 2 — Góc trắng (xong tầng 1)', time: '20 phút',
      goal: 'Đặt 4 góc trắng vào đúng chỗ để hoàn thành trọn tầng dưới.',
      html: `
        <p>Tìm một góc có ô trắng (ở tầng trên). Xoay <b>U</b> để đưa nó lên <b>ngay trên vị trí cần vào</b> (góc dưới-phải-trước), sao cho hai màu bên khớp với hai tâm bên dưới nó.</p>
        <p>Rồi lặp công thức <code>R U R' U'</code> cho đến khi góc vào đúng. Số lần lặp tuỳ ô trắng đang hướng về đâu:</p>
        <ul>
          <li>Ô trắng hướng <b>sang phải</b> → lặp <b>1 lần</b></li>
          <li>Ô trắng hướng <b>lên trên</b> → lặp <b>3 lần</b></li>
          <li>Ô trắng hướng <b>ra trước</b> → lặp <b>5 lần</b></li>
        </ul>
        <div class="note">Nếu góc trắng đang kẹt ở tầng dưới sai chỗ: chạy <code>R U R' U'</code> một lần để đưa nó lên tầng trên rồi làm lại như trên. Với góc cần vào rãnh khác, xoay cả khối (y) cho góc đó về vị trí trước-phải.</div>`,
      demos: [
        { title: 'Ô trắng hướng sang phải → 1 lần', alg: "R U R' U'", note: 'Góc đang ở trên rãnh, ô trắng hướng sang phải. Chạy công thức 1 lần.' },
        { title: 'Ô trắng hướng lên trên → 3 lần', alg: "R U R' U' R U R' U' R U R' U'", note: 'Ô trắng hướng lên. Lặp công thức 3 lần liên tiếp (xem 12 nước đi).' },
        { title: 'Ô trắng hướng ra trước → 5 lần', alg: "R U R' U' R U R' U' R U R' U' R U R' U' R U R' U'", note: 'Ô trắng hướng ra trước. Lặp công thức 5 lần liên tiếp.' }
      ],
      tips: ['Giữ vững nhịp: R U R\' U\' là một "khối" ngón tay, luyện cho trơn.', 'Sau bước này cả tầng dưới đã đúng và các mặt bên có dải màu thẳng hàng với tâm.']
    },
    {
      id: 5, icon: '↔️', title: 'Bước 3 — Tầng giữa', time: '20 phút',
      goal: 'Đưa 4 cạnh tầng giữa vào đúng chỗ (hoàn thành 2 tầng đầu).',
      html: `
        <p>Tìm một cạnh ở tầng trên <b>không có màu vàng</b>. Xoay U để màu <b>mặt trước</b> của cạnh đó khớp tâm trước (xanh lá). Nhìn màu còn lại ở mặt trên:</p>
        <ul>
          <li>Nếu cạnh cần đi sang <b>phải</b> → công thức phải: <code>U R U' R' U' F' U F</code></li>
          <li>Nếu cạnh cần đi sang <b>trái</b> → công thức trái: <code>U' L' U L U F U' F'</code></li>
        </ul>
        <div class="note">Nếu cạnh đang kẹt ở tầng giữa nhưng sai chỗ/sai hướng: dùng công thức đưa một cạnh bất kỳ vào chỗ đó để đẩy nó ra tầng trên, rồi làm lại.</div>`,
      demos: [
        { title: 'Cạnh sang phải', alg: "U R U' R' U' F' U F", note: 'Cạnh xanh lá–cam đang ở trên: mặt trước xanh lá khớp tâm trước, ô cam ở mặt trên → đi sang phải.' },
        { title: 'Cạnh sang trái', alg: "U' L' U L U F U' F'", note: 'Cạnh xanh lá–đỏ: mặt trước xanh lá khớp tâm trước, ô đỏ ở mặt trên → đi sang trái.' }
      ],
      tips: ['Hai công thức đối xứng gương nhau: phải dùng R/F, trái dùng L/F.', 'Hoàn thành 2 tầng đầu xong, bạn đã đi được 2/3 chặng đường.']
    },
    {
      id: 6, icon: '✚', title: 'Bước 4 — Chữ thập vàng', time: '10 phút',
      goal: 'Làm 4 cạnh vàng trên mặt trên thành hình chữ thập (chưa cần đúng vị trí).',
      html: `
        <p>Nhìn các ô <b>vàng</b> trên mặt trên, bạn sẽ gặp 1 trong 3 hình: <b>chấm</b> (chỉ có tâm), <b>chữ L</b>, hoặc <b>đường thẳng</b>. Cùng một công thức giải quyết tất cả:</p>
        <p><code>F R U R' U' F'</code></p>
        <ul>
          <li><b>Đường thẳng</b> nằm <b>ngang</b> (trái–phải): chạy công thức 1 lần → chữ thập.</li>
          <li><b>Chữ L</b>: xoay U sao cho L hướng về <b>phía sau-trái</b> (2 cạnh vàng ở mặt sau và bên trái), chạy công thức 1–2 lần.</li>
          <li><b>Chấm</b>: chạy công thức 1 lần (ra chữ L), xoay U cho đúng thế, chạy tiếp.</li>
        </ul>
        <div class="note">Cứ lặp "xoay U cho đúng thế → chạy công thức" tối đa 3 lần là ra chữ thập vàng.</div>`,
      demos: [
        { title: 'Đường thẳng', alg: "F R U R' U' F'", note: 'Đường thẳng ngang → chạy công thức 1 lần ra chữ thập.' },
        { title: 'Chữ L (xoay U để L ở sau-trái)', alg: "F U R U' R' F'", note: 'Chữ L ở phía sau-trái → công thức biến L thành chữ thập.' },
        { title: 'Chấm', alg: "F R U R' U' F' f R U R' U' f'", note: 'Chỉ có tâm vàng: chạy công thức F R U R\' U\' F\' rồi tiếp f R U R\' U\' f\'.' }
      ],
      tips: ['Nếu quên tư thế: đường thẳng thì để ngang, chữ L thì để ở góc sau-trái.']
    },
    {
      id: 7, icon: '🟨', title: 'Bước 5 — Hoàn thành mặt vàng', time: '15 phút',
      goal: 'Làm cả 4 góc có ô vàng hướng lên → toàn bộ mặt trên là màu vàng.',
      html: `
        <p>Dùng công thức <b>Sune</b>: <code>R U R' U R U2 R'</code>. Quy tắc:</p>
        <ul>
          <li>Đếm số góc có ô vàng hướng lên. Nếu có <b>đúng 1 góc vàng</b>: xoay U để góc đó ở <b>phía trước-trái</b> rồi chạy Sune.</li>
          <li>Nếu <b>chưa có góc nào</b> hoặc có 2 góc: đặt tuỳ ý, chạy Sune một lần, xoay U rồi lặp lại cho đến khi đủ 4 góc.</li>
          <li>Nếu đúng 1 góc vàng nhưng nằm ở <b>phía sau-phải</b>: dùng <b>Anti-Sune</b> (đối xứng): <code>R U2 R' U' R U' R'</code>.</li>
        </ul>
        <div class="note">Khi chạy xong, các góc có thể chưa đúng vị trí so với các màu bên — đó là việc của bước 6.</div>`,
      demos: [
        { title: 'Sune', alg: "R U R' U R U2 R'", note: 'Mặt vàng còn thiếu góc: Sune giúp đưa thêm góc vàng lên.' },
        { title: 'Anti-Sune', alg: "R U2 R' U' R U' R'", note: 'Trường hợp gương của Sune.' }
      ],
      tips: ['Số góc vàng: 0, 1 hay 2 — luôn chạy Sune đến khi đủ 4.']
    },
    {
      id: 8, icon: '🔁', title: 'Bước 6 — Đặt đúng vị trí góc', time: '10 phút',
      goal: 'Hoán đổi 3 góc tầng trên để mỗi góc nằm đúng giữa 2 tâm cùng màu với nó.',
      html: `
        <p>Xoay U cho đến khi tìm được <b>2 góc kề nhau cùng màu bên</b> ("đèn pha"). Đặt cặp đèn pha đó <b>ở mặt sau</b>, rồi chạy:</p>
        <p><code>R' F R' B2 R F' R' B2 R2</code></p>
        <p>(đây là <b>A-perm</b> — hoán vị vòng 3 góc.) Sau đó xoay U cho 4 góc khớp. Nếu <b>không</b> có đèn pha, chạy công thức một lần ở bất kỳ phía nào rồi tìm lại.</p>`,
      demos: [{ title: 'A-perm — hoán vị 3 góc', alg: "R' F R' B2 R F' R' B2 R2", note: 'Đèn pha ở mặt sau (2 góc cùng màu cạnh nhau), công thức xoay vòng 3 góc còn lại.' }],
      tips: ['Mặt có đèn pha chính là điểm tựa — luôn đặt nó ra phía sau.']
    },
    {
      id: 9, icon: '🏁', title: 'Bước 7 — Đặt đúng vị trí cạnh (xong khối!)', time: '10 phút',
      goal: 'Hoán vị 3 cạnh tầng trên để hoàn thành khối.',
      html: `
        <p>Nhìn 4 mặt bên: nếu có một mặt đã <b>thanh 3 ô cùng màu</b>, đặt mặt đó <b>ở phía sau</b> rồi chạy:</p>
        <p><code>R U' R U R U R U' R' U' R2</code></p>
        <p>(đây là <b>Ua-perm</b>, xoay vòng 3 cạnh.) Xoay U cho khối khớp. Nếu 3 cạnh vẫn chưa đúng, chạy lại. Nếu không có thanh nào, chạy công thức 1 lần ở bất kỳ phía nào để tạo ra một thanh rồi làm lại.</p>
        <div class="note">🎉 Xong! Nếu mọi mặt đều đúng màu là bạn đã tự giải được khối Rubik. Nếu thấy một cặp cạnh đối diện cần đổi chỗ, tra thêm công thức <b>H, Z</b> trong mục PLL.</div>`,
      demos: [
        { title: 'Ua-perm — xoay vòng 3 cạnh', alg: "R U' R U R U R U' R' U' R2", note: 'Thanh 3 ô cùng màu ở mặt sau; công thức xoay vòng 3 cạnh còn lại.' },
        { title: 'Ub-perm — chiều ngược lại', alg: "R2 U R U R' U' R' U' R' U R'", note: 'Nếu 3 cạnh cần xoay theo chiều ngược, dùng Ub (hoặc chạy Ua hai lần).' }
      ],
      tips: ['Gặp tình huống lạ ở bước này nhiều khả năng cần H hoặc Z — xem mục PLL.']
    },
    {
      id: 10, icon: '🚀', title: 'Sau khi giải được: nâng cấp lên CFOP', time: 'Lâu dài',
      goal: 'Biết cách nối từ phương pháp cơ bản sang các công thức nâng cao trong app.',
      html: `
        <p>Phương pháp bạn vừa học là nền cho <b>CFOP</b> — phương pháp của hầu hết người giải tốc độ:</p>
        <ol>
          <li><b>Cross</b> ← bước 1 (làm cạnh trắng)</li>
          <li><b>F2L</b> ← gộp bước 2 + 3: ghép góc với cạnh rồi đưa vào <b>cùng lúc</b> (<a href="#/f2l">41 trường hợp</a>)</li>
          <li><b>OLL</b> ← gộp bước 4 + 5: làm cả mặt vàng trong một công thức (<a href="#/oll">57 trường hợp</a>, bắt đầu bằng 2-look ⭐)</li>
          <li><b>PLL</b> ← gộp bước 6 + 7: hoán vị cả tầng trên (<a href="#/pll">21 trường hợp</a>, bắt đầu bằng 2-look ⭐)</li>
        </ol>
        <p>Lộ trình gợi ý: luyện bước cơ bản đến khi <b>thuộc nhịp tay</b> → học F2L bằng trực giác → 2-look OLL → 2-look PLL → học dần phần đầy đủ. Dùng mục <a href="#/practice">Luyện tập</a> để ôn.</p>`,
      tips: ['Tốc độ đến từ nhận dạng nhanh và ngón tay mượt, không phải từ việc học thật nhiều công thức một lúc.']
    }
  ].map(l => ({ ...l, key: 'lesson-' + l.id, demos: l.demos || [] }));
  const data = { LESSONS };
  if (typeof module !== 'undefined' && module.exports) module.exports = data; else root.BasicsData = data;
})(typeof window !== 'undefined' ? window : globalThis);

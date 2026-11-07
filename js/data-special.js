/* Sinh tự động bởi tools/gen-special.js — các trường hợp đặc biệt, đã kiểm chứng bằng mô phỏng. */
window.SpecialData = {
 "basic": {
  "3": [
   {
    "title": "Cạnh trắng đúng chỗ nhưng bị lật",
    "alg": "F' D R' D'",
    "note": "Cạnh trắng-xanh lá nằm đúng chỗ ở dưới nhưng ô trắng lại quay ra trước. Công thức lật nó lại mà không phá 3 cạnh trắng còn lại."
   }
  ],
  "4": [
   {
    "title": "Góc đúng chỗ nhưng bị xoắn (trắng hướng sang phải) → 2 lần",
    "alg": "R U R' U' R U R' U'",
    "note": "Góc trắng đã nằm trong rãnh nhưng ô trắng hướng sang phải. Vẫn lặp R U R' U' — 2 lần thì góc xoay đúng."
   },
   {
    "title": "Góc đúng chỗ nhưng bị xoắn (trắng hướng ra trước) → 4 lần",
    "alg": "R U R' U' R U R' U' R U R' U' R U R' U'",
    "note": "Góc trắng đã nằm trong rãnh nhưng ô trắng hướng ra trước. Vẫn lặp R U R' U' — 4 lần thì góc xoay đúng."
   },
   {
    "title": "Góc trắng kẹt ở tầng dưới, sai chỗ",
    "alg": "R' U R U2 R U' R'",
    "note": "Góc trắng-xanh lá-cam lại nằm ở góc dưới phía sau-phải. Phải lôi nó lên tầng trên (bằng R'… R), xoay U cho nó nằm trên đúng chỗ, rồi chèn xuống như thường."
   }
  ],
  "5": [
   {
    "title": "Cạnh đúng rãnh nhưng bị lật",
    "alg": "U R U' R' U' F' U F U' R U' R' U' F' U F",
    "note": "Cạnh xanh lá-cam nằm đúng rãnh nhưng màu bị ngược. Chạy công thức phải để đẩy nó lên tầng trên, xoay U, rồi chạy công thức phải lần nữa để chèn lại đúng hướng."
   },
   {
    "title": "Cạnh nằm nhầm rãnh khác",
    "alg": "U' L' U L U F U' F' U' R U' R' U' F' U F",
    "note": "Cạnh xanh lá-cam (thuộc rãnh phải) lại nằm ở rãnh trái. Dùng công thức trái để đẩy nó ra tầng trên, xoay U cho khớp màu rồi chèn sang phải bằng công thức phải."
   }
  ],
  "7": [
   {
    "title": "H — 0 góc vàng, 2 cặp đèn pha",
    "alg": "U' R U R' U R U2 R' R U R' U R U2 R'",
    "note": "Khi chưa có đúng 1 góc vàng vẫn chỉ cần Sune: xoay U như trong công thức rồi chạy Sune, tổng cộng 2 lần. (Cách nhanh hơn: học OLL 21 trong mục OLL.)",
    "startFrom": "R U2 R' U' R U R' U' R U' R'"
   },
   {
    "title": "Pi — 0 góc vàng",
    "alg": "U R U R' U R U2 R' U R U R' U R U2 R'",
    "note": "Khi chưa có đúng 1 góc vàng vẫn chỉ cần Sune: xoay U như trong công thức rồi chạy Sune, tổng cộng 2 lần. (Cách nhanh hơn: học OLL 22 trong mục OLL.)",
    "startFrom": "R U2 R2 U' R2 U' R2 U2 R"
   },
   {
    "title": "U (đèn pha) — 2 góc vàng kề",
    "alg": "U R U R' U R U2 R' U2 R U R' U R U2 R' U R U R' U R U2 R'",
    "note": "Khi chưa có đúng 1 góc vàng vẫn chỉ cần Sune: xoay U như trong công thức rồi chạy Sune, tổng cộng 3 lần. (Cách nhanh hơn: học OLL 23 trong mục OLL.)",
    "startFrom": "R2 D R' U2 R D' R' U2 R'"
   },
   {
    "title": "T — 2 góc vàng kề",
    "alg": "U' R U R' U R U2 R' U' R U R' U R U2 R' U R U R' U R U2 R'",
    "note": "Khi chưa có đúng 1 góc vàng vẫn chỉ cần Sune: xoay U như trong công thức rồi chạy Sune, tổng cộng 3 lần. (Cách nhanh hơn: học OLL 24 trong mục OLL.)",
    "startFrom": "r U R' U' r' F R F'"
   },
   {
    "title": "L (nơ) — 2 góc vàng chéo",
    "alg": "U' R U R' U R U2 R' R U R' U R U2 R' U2 R U R' U R U2 R'",
    "note": "Khi chưa có đúng 1 góc vàng vẫn chỉ cần Sune: xoay U như trong công thức rồi chạy Sune, tổng cộng 3 lần. (Cách nhanh hơn: học OLL 25 trong mục OLL.)",
    "startFrom": "F' r U R' U' r' F R"
   }
  ],
  "8": [
   {
    "title": "Không có đèn pha (đổi chéo góc)",
    "alg": "R' F R' B2 R F' R' B2 R2 U R' F R' B2 R F' R' B2 R2",
    "note": "Không mặt nào có đèn pha: chạy A-perm 1 lần ở bất kỳ phía nào → xuất hiện đèn pha, đặt nó ra sau rồi chạy A-perm lần nữa."
   }
  ],
  "9": [
   {
    "title": "Không có thanh — đổi 2 cặp cạnh đối diện (H-perm)",
    "alg": "M2 U M2 U2 M2 U M2",
    "note": "Cả 4 mặt đều có đèn pha nhưng không mặt nào đủ thanh, các cạnh đối diện cần đổi chỗ: dùng H-perm."
   },
   {
    "title": "Không có thanh — đổi 2 cặp cạnh kề nhau (Z-perm)",
    "alg": "M' U M2 U M2 U M' U2 M2",
    "note": "Các cạnh kề nhau cần đổi chỗ từng cặp: dùng Z-perm. (Cách chậm: chạy Ua-perm 1 lần rồi làm lại bước 7.)"
   }
  ]
 },
 "f2l": [
  {
   "title": "Chèn vào rãnh trước-trái (FL)",
   "alg": "L' U' L",
   "slot": "FL",
   "note": "Không cần xoay cả khối: công thức chèn trực tiếp vào rãnh trước-trái. Các rãnh khác không bị ảnh hưởng."
  },
  {
   "title": "Chèn vào rãnh trước-trái (FL)",
   "alg": "U' L' U L",
   "slot": "FL",
   "note": "Không cần xoay cả khối: công thức chèn trực tiếp vào rãnh trước-trái. Các rãnh khác không bị ảnh hưởng."
  },
  {
   "title": "Chèn vào rãnh sau-phải (BR)",
   "alg": "R' U R",
   "slot": "BR",
   "note": "Không cần xoay cả khối: công thức chèn trực tiếp vào rãnh sau-phải. Các rãnh khác không bị ảnh hưởng."
  },
  {
   "title": "Chèn vào rãnh sau-phải (BR)",
   "alg": "U R' U' R",
   "slot": "BR",
   "note": "Không cần xoay cả khối: công thức chèn trực tiếp vào rãnh sau-phải. Các rãnh khác không bị ảnh hưởng."
  },
  {
   "title": "Chèn vào rãnh sau-trái (BL)",
   "alg": "L U L'",
   "slot": "BL",
   "note": "Không cần xoay cả khối: công thức chèn trực tiếp vào rãnh sau-trái. Các rãnh khác không bị ảnh hưởng."
  },
  {
   "title": "Chèn vào rãnh sau-trái (BL)",
   "alg": "U' L U' L'",
   "slot": "BL",
   "note": "Không cần xoay cả khối: công thức chèn trực tiếp vào rãnh sau-trái. Các rãnh khác không bị ảnh hưởng."
  },
  {
   "title": "Góc kẹt ở rãnh sau-phải",
   "alg": "U R' U R U2 R U' R'",
   "slot": "FR",
   "note": "Góc kẹt ở rãnh sau-phải: trước hết phải lôi nó ra khỏi rãnh đó, rồi ghép cặp và chèn vào rãnh trước-phải. Rãnh sau-phải chưa giải nên được phép làm xáo trộn."
  },
  {
   "title": "Cạnh kẹt ở rãnh sau-phải",
   "alg": "B' R2 B R2",
   "slot": "FR",
   "note": "Cạnh kẹt ở rãnh sau-phải: trước hết phải lôi nó ra khỏi rãnh đó, rồi ghép cặp và chèn vào rãnh trước-phải. Rãnh sau-phải chưa giải nên được phép làm xáo trộn."
  },
  {
   "title": "Góc kẹt ở rãnh trước-trái",
   "alg": "U L' U L R U' R'",
   "slot": "FR",
   "note": "Góc kẹt ở rãnh trước-trái: trước hết phải lôi nó ra khỏi rãnh đó, rồi ghép cặp và chèn vào rãnh trước-phải. Rãnh trước-trái chưa giải nên được phép làm xáo trộn."
  },
  {
   "title": "Cạnh kẹt ở rãnh trước-trái",
   "alg": "U' L' U' L R U' R'",
   "slot": "FR",
   "note": "Cạnh kẹt ở rãnh trước-trái: trước hết phải lôi nó ra khỏi rãnh đó, rồi ghép cặp và chèn vào rãnh trước-phải. Rãnh trước-trái chưa giải nên được phép làm xáo trộn."
  }
 ],
 "oll": [
  {
   "title": "Chỉ 1 cạnh bị lật — do cạnh F2L bị lật",
   "alg": "R2 U2 F R2 F' U2 R' U R'",
   "tamper": [
    [
     "flip",
     [
      1,
      0,
      1
     ]
    ],
    [
     "flip",
     [
      0,
      1,
      1
     ]
    ]
   ],
   "setup": "U2 x' D R U R' D' R U' R' D R U' R' D' R U R' x R' F R U R' U' F' U R R U' R U2 F R2 F' U2 R2",
   "after": "OLL 31 rồi PLL E",
   "note": "Mặt trên có số cạnh vàng LẺ (1 hoặc 3) — không giống OLL nào. Nhìn lại 4 rãnh F2L: sẽ có 1 cạnh ở tầng giữa bị lật ngược màu (ở hình là rãnh trước-phải: cam nằm phía trước, xanh lá nằm bên phải). Công thức dưới lấy cạnh đó ra và chèn lại đúng chiều."
  },
  {
   "title": "Chỉ 1 góc bị xoắn — do góc F2L bị xoắn",
   "alg": "R2 U2 R' U' R U' R' U2 R'",
   "tamper": [
    [
     "twist",
     [
      1,
      -1,
      1
     ],
     1
    ],
    [
     "twist",
     [
      1,
      1,
      1
     ],
     1
    ]
   ],
   "setup": "R U2 R' U' R U' R' U2 R U2 R U R' U R U2 R2",
   "after": "OLL 27",
   "note": "Mặt trên gần như vàng hết nhưng có đúng 1 góc bị xoắn — không giống OLL nào. Nhìn xuống các góc dưới: sẽ có 1 góc F2L có màu trắng không nằm ở mặt dưới (ở hình là góc dưới-trước-phải). Lấy cặp đó ra và chèn lại."
  },
  {
   "title": "Chỉ 1 cạnh bị lật, F2L đúng hết — khối bị lắp sai",
   "alg": "",
   "tamper": [
    [
     "flip",
     [
      0,
      1,
      1
     ]
    ]
   ],
   "impossible": true,
   "note": "F2L đã đúng hoàn toàn mà mặt trên vẫn chỉ có 1 cạnh (hoặc 3 cạnh) bị lật: KHÔNG có công thức nào giải được. Nguyên nhân: một cạnh từng bị bung ra và được lắp lại ngược chiều.",
   "fixText": "Dùng ngón tay/ngón cái nạy cạnh bị lật ra (xoay mặt trên 45° cho dễ nạy), lật ngược lại rồi ấn vào. Sau đó mặt trên sẽ thành 1 trường hợp OLL bình thường."
  },
  {
   "title": "Chỉ 1 góc bị xoắn, F2L đúng hết — góc bị vặn",
   "alg": "",
   "tamper": [
    [
     "twist",
     [
      1,
      1,
      1
     ],
     1
    ]
   ],
   "impossible": true,
   "note": "F2L đúng hoàn toàn, mặt trên vàng hết trừ đúng 1 góc bị xoắn (hoặc 2 góc xoắn cùng chiều): KHÔNG có công thức nào giải được. Nguyên nhân: góc đã bị vặn khi xoay mạnh hoặc bị ai đó \"đùa\".",
   "fixText": "Dùng tay vặn góc đó cho mặt vàng quay lên trên (khối tốt thường vặn được; nếu cứng thì xoay mặt trên 45° rồi nạy góc ra lắp lại). Xong là khối chỉ còn bước PLL."
  }
 ],
 "pll": [
  {
   "title": "Chỉ 2 cạnh đổi chỗ — do 2 cạnh F2L nằm nhầm rãnh",
   "alg": "F' R' F R U R' F2 R U F",
   "tamper": [
    [
     "swap",
     [
      1,
      0,
      1
     ],
     [
      -1,
      0,
      1
     ]
    ],
    [
     "swap",
     [
      0,
      1,
      1
     ],
     [
      1,
      1,
      0
     ]
    ]
   ],
   "setup": "U' x' D R U R' D' R U' R' D R U' R' D' R U R' x U' R' F R U R' U' F' U R F' U' R' F2 R U' R' F' R F",
   "after": "OLL 31 rồi PLL E",
   "note": "Mặt trên đã vàng, các góc đúng chỗ nhưng chỉ có 2 cạnh đổi chỗ cho nhau — không giống PLL nào. Nhìn tầng giữa: sẽ có 2 cạnh F2L nằm nhầm rãnh của nhau (ở hình: rãnh trước-phải và trước-trái). Công thức dưới đổi chúng về đúng rãnh."
  },
  {
   "title": "Chỉ 2 góc đổi chỗ — do 2 góc F2L nằm nhầm rãnh",
   "alg": "R2 U2 F2 U F2 U R2 F2 U2 F2",
   "tamper": [
    [
     "swap",
     [
      1,
      -1,
      1
     ],
     [
      -1,
      -1,
      1
     ]
    ],
    [
     "swap",
     [
      1,
      1,
      1
     ],
     [
      -1,
      1,
      1
     ]
    ]
   ],
   "setup": "D' R U R' D U' R2 U' R U' R' U R' U R2 U' F2 U2 F2 R2 U' F2 U' F2 U2 R2",
   "after": "PLL Gc",
   "note": "Mặt trên đã vàng, các cạnh đúng chỗ nhưng chỉ có 2 góc đổi chỗ — không giống PLL nào. Nhìn các góc dưới: mặt dưới vẫn trắng nhưng màu bên cạnh của 2 góc không khớp tâm (ở hình: 2 góc dưới phía trước). Công thức dưới đổi chúng lại."
  },
  {
   "title": "Chỉ 2 cạnh đổi chỗ, F2L đúng hết — khối bị lắp sai",
   "alg": "",
   "tamper": [
    [
     "swap",
     [
      0,
      1,
      1
     ],
     [
      1,
      1,
      0
     ]
    ]
   ],
   "impossible": true,
   "note": "F2L đúng hoàn toàn mà tầng trên chỉ có 2 cạnh đổi chỗ (góc đều đúng): KHÔNG có công thức nào giải được — đây là \"parity\" của khối 3×3 bị lắp sai.",
   "fixText": "Xoay mặt trên 45°, nạy 2 cạnh đó ra và đổi chỗ cho nhau (giữ mặt vàng hướng lên). Khối sẽ được giải xong."
  },
  {
   "title": "Chỉ 2 góc đổi chỗ, F2L đúng hết — khối bị lắp sai",
   "alg": "",
   "tamper": [
    [
     "swap",
     [
      1,
      1,
      1
     ],
     [
      -1,
      1,
      1
     ]
    ]
   ],
   "impossible": true,
   "note": "F2L đúng hoàn toàn mà tầng trên chỉ có 2 góc đổi chỗ (cạnh đều đúng): KHÔNG có công thức nào giải được — khối từng bị tháo ra và lắp sai.",
   "fixText": "Nạy 2 góc đó ra (xoay mặt trên 45° rồi nạy 1 cạnh trước cho dễ) và đổi chỗ cho nhau, giữ mặt vàng hướng lên."
  }
 ]
};

import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";



  const STORAGE_KEY = 'nihoncards_state_v1';
  const DEVICE_KEY = 'nihoncards_device_id';
  const DAY = 86400000;

  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem(DEVICE_KEY, deviceId);
  }



  const now = () => Date.now();

  const uid = (p = 'id') =>
    `${p}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;

  const esc = (v = '') =>
    String(v).replace(
      /[&<>'"]/g,
      c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[c])
    );

  const clamp = (n, a, b) =>
    Math.max(a, Math.min(b, n));

  const formatDate = ts =>
    new Intl.DateTimeFormat(
      'vi-VN',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    ).format(new Date(ts));

  const formatShortDate = ts =>
    new Intl.DateTimeFormat(
      'vi-VN',
      {
        day: '2-digit',
        month: '2-digit'
      }
    ).format(new Date(ts));

  const fmtMinutes = ms =>
    `${Math.max(1, Math.round(ms / 60000))} phút`;

  const todayKey = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const sampleCards = [
    [
      '食べる',
      'たべる',
      'taberu',
      'ăn',
      'động từ',
      'N5',
      '私は毎朝パンを食べます。',
      'Tôi ăn bánh mì mỗi sáng.',
      'food,verb'
    ],
    [
      '飲む',
      'のむ',
      'nomu',
      'uống',
      'động từ',
      'N5',
      '水を飲みます。',
      'Tôi uống nước.',
      'food,verb'
    ],
    [
      '見る',
      'みる',
      'miru',
      'xem; nhìn',
      'động từ',
      'N5',
      'テレビを見ます。',
      'Tôi xem TV.',
      'verb'
    ],
    [
      '聞く',
      'きく',
      'kiku',
      'nghe; hỏi',
      'động từ',
      'N5',
      '音楽を聞きます。',
      'Tôi nghe nhạc.',
      'verb'
    ],
    [
      '行く',
      'いく',
      'iku',
      'đi',
      'động từ',
      'N5',
      '学校へ行きます。',
      'Tôi đi đến trường.',
      'verb'
    ],
    [
      '来る',
      'くる',
      'kuru',
      'đến',
      'động từ',
      'N5',
      '友達が家に来ます。',
      'Bạn tôi đến nhà.',
      'verb'
    ],
    [
      '学校',
      'がっこう',
      'gakkou',
      'trường học',
      'danh từ',
      'N5',
      '毎日学校へ行きます。',
      'Mỗi ngày tôi đi học.',
      'school,noun'
    ],
    [
      '先生',
      'せんせい',
      'sensei',
      'giáo viên',
      'danh từ',
      'N5',
      '田中先生は日本人です。',
      'Thầy Tanaka là người Nhật.',
      'school,noun'
    ],
    [
      '学生',
      'がくせい',
      'gakusei',
      'học sinh; sinh viên',
      'danh từ',
      'N5',
      '私は学生です。',
      'Tôi là sinh viên.',
      'school,noun'
    ],
    [
      '友達',
      'ともだち',
      'tomodachi',
      'bạn bè',
      'danh từ',
      'N5',
      '友達と映画を見ます。',
      'Tôi xem phim với bạn.',
      'people,noun'
    ],
    [
      '今日',
      'きょう',
      'kyou',
      'hôm nay',
      'danh từ',
      'N5',
      '今日は暑いです。',
      'Hôm nay trời nóng.',
      'time'
    ],
    [
      '明日',
      'あした',
      'ashita',
      'ngày mai',
      'danh từ',
      'N5',
      '明日東京へ行きます。',
      'Ngày mai tôi đi Tokyo.',
      'time'
    ],
    [
      '昨日',
      'きのう',
      'kinou',
      'hôm qua',
      'danh từ',
      'N5',
      '昨日勉強しました。',
      'Hôm qua tôi đã học.',
      'time'
    ],
    [
      '大きい',
      'おおきい',
      'ookii',
      'to; lớn',
      'tính từ i',
      'N5',
      '大きい家です。',
      'Đó là một ngôi nhà lớn.',
      'adjective'
    ],
    [
      '小さい',
      'ちいさい',
      'chiisai',
      'nhỏ',
      'tính từ i',
      'N5',
      '小さい猫がいます。',
      'Có một con mèo nhỏ.',
      'adjective'
    ],
    [
      '新しい',
      'あたらしい',
      'atarashii',
      'mới',
      'tính từ i',
      'N5',
      '新しい本を買いました。',
      'Tôi đã mua một quyển sách mới.',
      'adjective'
    ],
    [
      '古い',
      'ふるい',
      'furui',
      'cũ',
      'tính từ i',
      'N5',
      'これは古い写真です。',
      'Đây là một tấm ảnh cũ.',
      'adjective'
    ],
    [
      '高い',
      'たかい',
      'takai',
      'cao; đắt',
      'tính từ i',
      'N5',
      'この山は高いです。',
      'Ngọn núi này cao.',
      'adjective'
    ],
    [
      '安い',
      'やすい',
      'yasui',
      'rẻ',
      'tính từ i',
      'N5',
      'この店は安いです。',
      'Cửa hàng này rẻ.',
      'adjective'
    ],
    [
      '勉強',
      'べんきょう',
      'benkyou',
      'học tập',
      'danh từ/suru',
      'N5',
      '日本語を勉強します。',
      'Tôi học tiếng Nhật.',
      'school'
    ]
  ];

  function makeCard(arr, deckId) {
    const [
      word,
      reading,
      romaji,
      meaning,
      pos,
      jlpt,
      example,
      exampleVi,
      tags
    ] = arr;

    return {
      id: uid('card'),
      deckId,
      word,
      reading,
      romaji,
      meaning,
      pos,
      jlpt,
      example,
      exampleVi,

      tags: tags
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),

      favorite: false,
      notes: '',

      createdAt: now(),
      updatedAt: now(),

      srs: {
        status: 'new',
        dueAt: 0,
        intervalDays: 0,
        repetitions: 0,
        lapses: 0,
        ease: 2.5,
        difficulty: 5,
        stability: 0
      },

      stats: {
        seen: 0,
        correct: 0,
        wrong: 0,
        totalMs: 0,
        lastAnswer: ''
      }
    };
  }

  function initialState() {
    const deckId = uid('deck');

    return {
      version: 1,

      settings: {
        theme: 'system',
        furigana: 'answer',
        romaji: false,
        dailyGoal: 20,
        newPerDay: 20,
        audioAutoplay: false,
        swipe: true
      },

      decks: [
        {
          id: deckId,
          title: 'JLPT N5 - Từ vựng cơ bản',
          description: 'Bộ mẫu để bắt đầu học ngay.',
          jlpt: 'N5',
          visibility: 'private',
          createdAt: now(),
          updatedAt: now()
        }
      ],

      cards: sampleCards.map(
        x => makeCard(x, deckId)
      ),

      logs: [],
      sessions: [],

      ui: {
        lastDeckId: deckId
      }
    };
  }

  function loadState() {
    try {

      const raw =
        localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return initialState();
      }

      const parsed =
        JSON.parse(raw);

      if (
        !parsed.decks ||
        !parsed.cards
      ) {
        return initialState();
      }

      parsed.settings = {
        ...initialState().settings,
        ...parsed.settings
      };

      parsed.logs ||= [];
      parsed.sessions ||= [];
      parsed.ui ||= {};

      return parsed;

    } catch (e) {

      console.error(e);

      return initialState();
    }
  }

  let state = loadState();

  let view = 'home';

  let routeData = {};

  let modal = null;

  let toastTimer = null;

  let session = null;

  let learn = null;

  let testState = null;

  let importRows = [];

  let editingComposition = false;

  let syncTimer = null;

  function syncToFirebase() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(async () => {
      try {
        await setDoc(
          doc(db, "users", deviceId),
          {
            deviceId,
            cardCount: state.cards ? state.cards.length : 0,
            deckCount: state.decks ? state.decks.length : 0,
            appState: state,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
        console.log("☁️ Auto-synced data to Firebase Firestore: users/" + deviceId);
      } catch (err) {
        console.warn("Firebase Firestore sync:", err);
      }
    }, 300);
  }

  function save() {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

    syncToFirebase();
  }




  function applyTheme() {

    const t =
      state.settings.theme;

    const dark =
      t === 'dark' ||
      (
        t === 'system' &&
        window.matchMedia &&
        window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches
      );

    document.body
      .classList
      .toggle(
        'dark',
        dark
      );
  }

  function deckCards(deckId) {

    return state.cards
      .filter(
        c => c.deckId === deckId
      );
  }

  function dueCards(deckId) {

    return deckCards(deckId)
      .filter(
        c =>
          c.srs.status === 'new' ||
          (c.srs.dueAt || 0) <= now()
      );
  }

  function mastered(c) {

    return (
      c.srs.status === 'review' &&
      c.srs.intervalDays >= 21
    );
  }

  function deckProgress(deckId) {

    const cards =
      deckCards(deckId);

    return cards.length
      ? Math.round(
        cards
          .filter(mastered)
          .length /
        cards.length *
        100
      )
      : 0;
  }

  function cardSearchText(c) {

    return normalizeJapanese(
      [
        c.word,
        c.reading,
        c.romaji,
        c.meaning,
        c.pos,
        c.jlpt,
        ...(c.tags || [])
      ].join(' ')
    );
  }

  function normalizeJapanese(s = '') {

    return String(s)
      .toLowerCase()
      .normalize('NFKC')
      .replace(
        /[ァ-ヶ]/g,
        ch =>
          String.fromCharCode(
            ch.charCodeAt(0) -
            0x60
          )
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();
  }

  function escapeCsv(v = '') {

    const s =
      String(v)
        .replace(
          /"/g,
          '""'
        );

    return /[",\n]/.test(s)
      ? `"${s}"`
      : s;
  }

  function navItem(
    id,
    icon,
    label
  ) {

    return `
      <button
        class="nav-btn ${view === id ? 'active' : ''}"
        data-nav="${id}"
      >
        <span class="ico">${icon}</span>
        <span>${label}</span>
      </button>
    `;
  }

  function sideItem(
    id,
    icon,
    label
  ) {

    return `
      <button
        class="side-btn ${view === id ? 'active' : ''}"
        data-nav="${id}"
      >
        ${icon} &nbsp; ${label}
      </button>
    `;
  }

  function shell(
    content,
    opts = {}
  ) {

    const hideNav = opts.hideNav;
    let headerTitle = 'Bộ thẻ của tôi';
    if (view === 'deck' && routeData.deckId) {
      const d = state.decks.find(x => x.id === routeData.deckId);
      headerTitle = d ? esc(d.title) : 'Chi tiết bộ thẻ';
    } else if (view === 'stats') {
      headerTitle = 'Thống kê & Thư viện';
    } else if (view === 'import') {
      headerTitle = 'Import từ vựng';
    }

    return `
      <div class="app-shell">

        <header class="topbar">

          <div class="topbar-inner">

            ${view === 'deck'
              ? `<button class="round-btn" data-nav="decks" aria-label="Quay lại">✕</button>`
              : `<div class="brand" data-nav="home" style="cursor:pointer">
                   <img class="brand-avatar" src="avatar.jpg" alt="Đức Trí" />
                   <span>Đức Trí</span>
                 </div>`
            }

            <div class="topbar-title">${headerTitle}</div>

            <button
              class="icon-btn"
              data-action="open-settings"
              aria-label="Cài đặt"
            >
              ⚙
            </button>

          </div>

        </header>

        <main>
          ${content}
        </main>

        ${!hideNav && (view === 'home' || view === 'decks')
          ? `<button class="fab-btn" data-action="open-create-sheet" title="Tạo mới / Import">+</button>`
          : ''
        }

        ${hideNav
          ? ''
          : `
              <nav class="bottom-nav">

                <div class="bottom-nav-inner">

                  ${navItem('home', '🗂️', 'Bộ thẻ')}
                  ${navItem('import', '📖', 'Thư viện')}
                  ${navItem('stats', '👤', 'Hồ sơ')}

                </div>

              </nav>
            `
        }

        ${renderModal()}

      </div>
    `;
  }

  function render() {

    applyTheme();

    let html = '';

    if (view === 'home') {
      html = renderHome();
    }

    else if (view === 'decks') {
      html = renderDecks();
    }

    else if (view === 'deck') {
      html = renderDeckDetail(
        routeData.deckId
      );
    }

    else if (view === 'study') {
      html = renderStudy();
    }

    else if (view === 'learn') {
      html = renderLearnHub();
    }

    else if (view === 'learn-session') {
      html = renderLearnSession();
    }

    else if (view === 'test') {
      html = renderTest();
    }

    else if (view === 'import') {
      html = renderImport();
    }

    else if (view === 'stats') {
      html = renderStats();
    }

    document
      .getElementById('app')
      .innerHTML =
      shell(
        html,
        {
          hideNav: [
            'study',
            'learn-session',
            'test'
          ].includes(view)
        }
      );

    // Remove any stale cached login button if rendered
    document.querySelectorAll('button[data-action="open-auth"], button[title="Đăng nhập"]').forEach(btn => btn.remove());

    bindAfterRender();
  }

  function todayStats() {

    const key =
      todayKey();

    const logs =
      state.logs.filter(
        l =>
          todayKey(
            new Date(l.at)
          ) === key
      );

    const correct =
      logs.filter(
        l => l.correct
      ).length;

    const total =
      logs.length;

    return {
      count: total,

      correct,

      accuracy:
        total
          ? Math.round(
            correct /
            total *
            100
          )
          : 0,

      ms:
        logs.reduce(
          (a, b) =>
            a + (b.ms || 0),
          0
        )
    };
  }

  function streak() {

    const days =
      new Set(
        state.logs.map(
          l =>
            todayKey(
              new Date(l.at)
            )
        )
      );

    let count = 0;

    const d =
      new Date();

    while (
      days.has(
        todayKey(d)
      )
    ) {
      count++;

      d.setDate(
        d.getDate() - 1
      );
    }

    return count;
  }

  function renderHome() {
    const sCount = streak() || 3;
    const allDue = state.cards.filter(c => c.srs.status === 'new' || (c.srs.dueAt || 0) <= now()).length;

    return `
      <div class="page">

        <div class="streak-card">
          <div class="streak-left">
            <div class="fire-badge">🔥</div>
            <div>
              <span class="streak-num">${sCount}</span>
              <span class="streak-text">ngày liên tiếp</span>
            </div>
          </div>
          <div class="streak-days">
            <div class="streak-days-labels">
              <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
            </div>
            <div class="streak-days-dots">
              <div class="day-dot"></div>
              <div class="day-dot"></div>
              <div class="day-dot"></div>
              <div class="day-dot"></div>
              <div class="day-dot active">🔥</div>
              <div class="day-dot active">🔥</div>
              <div class="day-dot active">🔥</div>
            </div>
          </div>
        </div>

        <div class="deck-list-container">
          ${state.decks.map(deckCard).join('') || emptyDeck()}
        </div>

      </div>
    `;
  }

  function emptyDeck() {
    return `
      <div class="card empty" style="border-radius:20px;margin-top:20px;">
        <div class="emoji">📚</div>
        <h3>Chưa có bộ thẻ nào</h3>
        <p>Bấm nút (+) ở góc dưới để tạo bộ thẻ mới hoặc import.</p>
        <button class="btn btn-primary" data-action="create-deck" style="margin-top:10px;">＋ Tạo bộ thẻ</button>
      </div>
    `;
  }

  function deckCard(d) {
    const cards = deckCards(d.id);
    const due = dueCards(d.id).length;

    return `
      <div class="deck-card-minimal" data-action="open-deck" data-deck="${d.id}">
        <div class="deck-min-info">
          <div class="deck-min-title">${esc(d.title)}</div>
          <div class="deck-min-meta">
            <span>⬡ ${cards.length}</span>
            <span class="deck-min-chip">🕒 ${due > 0 ? due + ' đến hạn' : 'Đã thuộc'}</span>
          </div>
        </div>
        <div class="deck-min-actions">
          <button class="action-icon-btn" data-action="edit-deck" data-deck="${d.id}" title="Sửa">✏</button>
          <button class="action-icon-btn danger" data-action="delete-deck" data-deck="${d.id}" title="Xóa">🗑</button>
        </div>
      </div>
    `;
  }

  function renderDecks() {
    return renderHome();
  }

  function renderDeckDetail(deckId) {
    const d = state.decks.find(x => x.id === deckId);
    if (!d) {
      view = 'home';
      return renderHome();
    }

    state.ui.lastDeckId = d.id;
    save();

    const cards = deckCards(deckId);
    const due = dueCards(deckId).length;
    const learning = cards.filter(c => c.srs.status === 'learning').length;
    const newCards = cards.filter(c => c.srs.status === 'new').length;
    const reviewCards = cards.filter(c => c.srs.status === 'review').length;

    return `
      <div class="page">

        <div class="segmented-control">
          <button class="segmented-btn" data-action="study-deck" data-deck="${d.id}">
            <span>∞ Vuốt không giới hạn</span>
            <small>xem mọi thẻ</small>
          </button>
          <button class="segmented-btn active" data-action="study-deck" data-deck="${d.id}">
            <span>⚙ Ôn tập ngắt quãng</span>
            <small>lịch thông minh</small>
          </button>
        </div>

        <div class="big-stat-card">
          <div class="big-stat-num">${cards.length}</div>
          <div class="big-stat-label">Tổng số từ</div>
          <div class="ready-badge">⚡ sẵn sàng</div>

          <div class="stat-cols">
            <div>
              <div class="stat-col-num blue">${newCards}</div>
              <div class="stat-col-label">Chưa học</div>
            </div>
            <div>
              <div class="stat-col-num orange">${learning || due}</div>
              <div class="stat-col-label">Đang học</div>
            </div>
            <div>
              <div class="stat-col-num green">${reviewCards}</div>
              <div class="stat-col-label">Hôm nay</div>
            </div>
          </div>
        </div>

        <div class="study-options-card">
          <div class="study-option-item" data-action="study-deck" data-deck="${d.id}">
            <div class="option-icon-box yellow">🎴</div>
            <div class="option-text">Học thẻ</div>
            <div class="option-arrow">›</div>
          </div>
          <div class="study-option-item" data-action="start-learn" data-deck="${d.id}">
            <div class="option-icon-box teal">📝</div>
            <div class="option-text">Trắc nghiệm 4 đáp án</div>
            <div class="option-arrow">›</div>
          </div>
        </div>

        <div class="word-list-section">
          <div class="word-list-head">
            <input type="checkbox" id="selectAllWords" />
            <label for="selectAllWords">Chọn từ trên trang này</label>
          </div>

          <div class="word-list-container">
            ${cards.map(c => `
              <div class="word-card-item">
                <div>
                  <div class="word-card-main">${esc(c.word)}</div>
                  <div class="word-card-sub">${c.reading ? esc(c.reading) + ' | ' : ''}${esc(c.meaning)}</div>
                </div>
                <input type="checkbox" class="word-checkbox" data-card="${c.id}" />
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }


  function cardRow(c) {

    return `
      <div class="list-row">

        <div class="list-main">

          <div class="list-title">

            ${esc(c.word)}

            <span
              class="muted"
              style="font-weight:600"
            >
              ${esc(c.reading || '')}
            </span>

          </div>

          <div class="list-sub">

            ${esc(c.meaning)} ·
            ${esc(c.jlpt || '')} ·

            ${(c.tags || [])
        .map(esc)
        .join(', ')
      }

          </div>

        </div>

        <span
          class="badge ${mastered(c)
        ? 'good'
        : c.srs.status === 'new'
          ? ''
          : 'warn'
      }"
        >

          ${mastered(c)
        ? 'Mastered'
        : c.srs.status === 'new'
          ? 'New'
          : 'Review'
      }

        </span>

        <button
          class="tiny-btn"
          data-action="toggle-fav"
          data-card="${c.id}"
          title="Yêu thích"
        >
          ${c.favorite ? '★' : '☆'}
        </button>

        <button
          class="tiny-btn"
          data-action="edit-card"
          data-card="${c.id}"
        >
          ✎
        </button>

      </div>
    `;
  }

  function startStudy(
    cards,
    deckId = null
  ) {

    if (!cards.length) {

      showToast(
        'Không có thẻ phù hợp để học.'
      );

      return;
    }

    const ordered =
      [...cards].sort(
        (a, b) =>
          (
            (a.srs.dueAt || 0) -
            (b.srs.dueAt || 0)
          )
          ||
          (
            (b.stats?.wrong || 0) -
            (a.stats?.wrong || 0)
          )
      );

    session = {
      id: uid('session'),
      cards: ordered,
      index: 0,
      flipped: false,
      startedAt: now(),
      cardStartedAt: now(),
      deckId,
      ratings: [],
      mode: 'study'
    };

    view = 'study';

    render();
  }

  function currentStudyCard() {

    return session?.cards[
      session.index
    ];
  }

  function renderStudy() {

    if (
      !session ||
      !session.cards.length
    ) {

      view = 'home';

      return renderHome();
    }

    const c =
      currentStudyCard();

    const total =
      session.cards.length;

    const pct =
      Math.round(
        session.index /
        total *
        100
      );

    return `
      <div class="page page-study">

        <div class="study-head">

          <button
            class="round-btn"
            data-action="exit-study"
          >
            ←
          </button>

          <div class="study-head-title">
            Flashcard
          </div>

          <button
            class="round-btn"
            data-action="shuffle-study"
          >
            ⤨
          </button>

        </div>

        <div class="study-progress">

          <div class="progress">
            <span
              style="width:${pct}%"
            ></span>
          </div>

          <span>
            ${session.index + 1}/${total}
          </span>

        </div>

        <div class="flashcard-wrap">

          <div
            id="flashcard"
            class="flashcard ${session.flipped ? 'flipped' : ''}"
            data-action="flip-card"
          >

            <div class="face front">

              <div class="card-top-bar">

                <div class="srs-badge ${c.srs.status}" title="Ôn lại: ${previewInterval(c,'good')}">
                  <span class="srs-status-dot"></span>
                  ${c.srs.status === 'new' ? 'Thẻ mới' : c.srs.status === 'learning' ? 'Đang học' : 'Đã học'}
                </div>

                <div class="study-tools">

                  <button
                    data-action="speak"
                    data-card="${c.id}"
                    title="Phát âm"
                  >
                    🔊
                  </button>

                  <button
                    data-action="toggle-fav"
                    data-card="${c.id}"
                    title="Yêu thích"
                  >
                    ${c.favorite ? '★' : '☆'}
                  </button>

                </div>

              </div>

              <div class="card-main-content">

                <div class="study-word-single">
                  ${esc(c.word)}
                </div>

                ${state.settings.furigana === 'always' && c.reading
          ? `<div class="study-reading">${esc(c.reading)}</div>`
          : ''
        }

                ${state.settings.romaji && c.romaji
          ? `<div class="study-romaji">${esc(c.romaji)}</div>`
          : ''
        }

              </div>

              <div class="flip-hint">
                <span>🔄</span> Chạm vào thẻ hoặc ấn <strong>[Space]</strong> để lật
              </div>

            </div>

            <div class="face back">

              <div class="card-top-bar">

                <div class="card-tags-inline">
                  ${c.jlpt ? `<span class="badge primary">${esc(c.jlpt)}</span>` : ''}
                  ${c.pos ? `<span class="badge">${esc(c.pos)}</span>` : ''}
                </div>

                <div class="study-tools">

                  <button
                    data-action="speak"
                    data-card="${c.id}"
                    title="Phát âm"
                  >
                    🔊
                  </button>

                  <button
                    data-action="toggle-fav"
                    data-card="${c.id}"
                    title="Yêu thích"
                  >
                    ${c.favorite ? '★' : '☆'}
                  </button>

                </div>

              </div>

              <div class="card-main-content back-content">

                <div class="back-word-row">
                  <span class="study-word-single small-word">${esc(c.word)}</span>
                  ${c.reading ? `<span class="study-reading-inline">【${esc(c.reading)}】</span>` : ''}
                </div>

                <div class="study-meaning">
                  ${esc(c.meaning)}
                </div>

                ${c.example
          ? `
                      <div class="study-example-box">
                        <div class="ex-ja">${esc(c.example)}</div>
                        ${c.exampleVi ? `<div class="ex-vi">${esc(c.exampleVi)}</div>` : ''}
                      </div>
                    `
          : ''
        }

              </div>

              <div class="flip-hint">
                <span>🔄</span> Chạm để xem mặt trước
              </div>

            </div>

          </div>

        </div>

        <div class="rating-grid">

          ${rateButton(
            'again',
            'Quên',
            previewInterval(c, 'again')
          )}

          ${rateButton(
            'hard',
            'Khó',
            previewInterval(c, 'hard')
          )}

          ${rateButton(
            'good',
            'Tốt',
            previewInterval(c, 'good')
          )}

          ${rateButton(
            'easy',
            'Dễ',
            previewInterval(c, 'easy')
          )}

        </div>

        ${!session.flipped
          ? `<button class="btn btn-soft" style="width:100%;margin-top:10px;font-weight:700" data-action="flip-card">👁 Lật thẻ xem đáp án</button>`
          : ''
        }

      </div>
    `;
  }

  function rateButton(
    r,
    label,
    time
  ) {

    return `
      <button
        class="rate ${r}"
        data-action="rate"
        data-rating="${r}"
        title="Phím ${{'again':1,'hard':2,'good':3,'easy':4}[r]}"
      >
        ${label}
        <small>${time}</small>
        <span class="rate-kbd">${{'again':1,'hard':2,'good':3,'easy':4}[r]}</span>
      </button>
    `;
  }

  function previewInterval(
    c,
    r
  ) {

    const i =
      c.srs.intervalDays || 0;

    if (r === 'again') {

      return i < 1
        ? '1 phút'
        : '10 phút';
    }

    if (r === 'hard') {

      return i < 1
        ? '8 giờ'
        : `${Math.max(
          1,
          Math.round(i * 1.25)
        )
        } ngày`;
    }

    if (r === 'good') {

      return `${Math.max(
        1,
        Math.round(
          i
            ? i * 2.2
            : 1
        )
      )
        } ngày`;
    }

    return `${Math.max(
      3,
      Math.round(
        i
          ? i * 3.4
          : 4
      )
    )
      } ngày`;
  }

  function applySrs(
    c,
    rating
  ) {

    const s =
      c.srs;

    const oldI =
      s.intervalDays || 0;

    let nextDays = 0;

    const lapses =
      s.lapses || 0;

    if (rating === 'again') {

      s.lapses =
        lapses + 1;

      s.repetitions = 0;

      const penalty =
        lapses >= 3 ? 0.25 : 0.2;

      s.ease =
        clamp(
          (s.ease || 2.5) - penalty,
          1.2,
          3.2
        );

      s.difficulty =
        clamp(
          (s.difficulty || 5) + (lapses >= 3 ? 1.2 : 0.8),
          1,
          10
        );

      s.stability =
        Math.max(
          .1,
          (s.stability || 1) * .5
        );

      nextDays =
        1 / 1440;

      s.status =
        'learning';
    }

    else if (rating === 'hard') {

      s.repetitions =
        (s.repetitions || 0) + 1;

      s.ease =
        clamp(
          (s.ease || 2.5) - .05,
          1.2,
          3.2
        );

      s.difficulty =
        clamp(
          (s.difficulty || 5) + .25,
          1,
          10
        );

      s.stability =
        Math.max(
          .35,
          (s.stability || .5) * 1.35
        );

      const lapseDiscount =
        Math.max(0.7, 1 - lapses * 0.08);

      nextDays =
        oldI < 1
          ? 1 / 3
          : Math.max(
            1,
            oldI * 1.25 * lapseDiscount
          );

      s.status =
        'review';
    }

    else if (rating === 'good') {

      s.repetitions =
        (s.repetitions || 0) + 1;

      s.ease =
        clamp(
          (s.ease || 2.5) + .03,
          1.2,
          3.2
        );

      s.difficulty =
        clamp(
          (s.difficulty || 5) - .2,
          1,
          10
        );

      s.stability =
        Math.max(
          1,
          (s.stability || .5) * 2.1
        );

      const lapseDiscount =
        Math.max(0.75, 1 - lapses * 0.06);

      const mult =
        (s.ease || 2.5) * lapseDiscount;

      nextDays =
        oldI < 1
          ? 1
          : Math.max(
            1,
            oldI * mult
          );

      s.status =
        'review';
    }

    else {

      s.repetitions =
        (s.repetitions || 0) + 1;

      s.ease =
        clamp(
          (s.ease || 2.5) + .1,
          1.2,
          3.2
        );

      s.difficulty =
        clamp(
          (s.difficulty || 5) - .5,
          1,
          10
        );

      s.stability =
        Math.max(
          2,
          (s.stability || .5) * 3
        );

      const lapseDiscount =
        Math.max(0.8, 1 - lapses * 0.05);

      const mult =
        (s.ease || 2.5) * 1.35 * lapseDiscount;

      nextDays =
        oldI < 1
          ? 4
          : Math.max(
            3,
            oldI * mult
          );

      s.status =
        'review';
    }

    s.intervalDays =
      nextDays;

    s.dueAt =
      now() +
      nextDays *
      DAY;

    c.updatedAt =
      now();
  }

  function processRating(c, rating) {

    if (!session || !c) return;

    const ms =
      now() -
      session.cardStartedAt;

    applySrs(c, rating);

    c.stats.seen =
      (c.stats.seen || 0) + 1;

    c.stats.totalMs =
      (c.stats.totalMs || 0) + ms;

    if (rating === 'again') {

      c.stats.wrong =
        (c.stats.wrong || 0) + 1;

      c.stats.lastAnswer =
        'wrong';

      const offset =
        (c.srs.lapses >= 3) ? 3 : 5;

      const targetIndex =
        Math.min(
          session.cards.length,
          session.index + offset
        );

      session.cards.splice(
        targetIndex,
        0,
        c
      );

      showToast(
        'Thẻ lặp lại trong phiên này để ôn!'
      );

    } else {

      c.stats.correct =
        (c.stats.correct || 0) + 1;

      c.stats.lastAnswer =
        'correct';
    }

    state.logs.push({
      id: uid('log'),
      cardId: c.id,
      deckId: c.deckId,
      at: now(),
      rating,
      correct:
        rating !== 'again',
      ms
    });

    session.ratings.push(rating);

    save();

    session.index++;

    session.flipped = false;

    session.cardStartedAt =
      now();

    if (
      session.index >=
      session.cards.length
    ) {

      completeStudy();

    } else {

      render();
    }
  }

  function completeStudy() {

    const ended =
      now();

    const ratings =
      session.ratings;

    state.sessions.push({
      id: session.id,
      mode: 'study',
      deckId: session.deckId,
      startedAt: session.startedAt,
      endedAt: ended,
      count: ratings.length,
      correct:
        ratings.filter(
          x => x !== 'again'
        ).length
    });

    save();

    const summary = {
      count:
        ratings.length,

      accuracy:
        ratings.length
          ? Math.round(
            ratings.filter(
              x => x !== 'again'
            ).length /
            ratings.length *
            100
          )
          : 0,

      ms:
        ended -
        session.startedAt
    };

    session = null;

    view = 'home';

    confetti();

    render();

    showToast(
      `Hoàn thành ${summary.count} thẻ · ${summary.accuracy}% · ${fmtMinutes(summary.ms)}`
    );
  }

  function renderLearnHub() {

    const lastDeck =
      state.decks.find(
        d =>
          d.id ===
          state.ui.lastDeckId
      ) ||
      state.decks[0];

    return `
      <div class="page page-narrow">

        <div class="section-head">

          <div>

            <h2>
              Học & Kiểm tra
            </h2>

            <p>
              Active Recall, trắc nghiệm và gõ đáp án.
            </p>

          </div>

        </div>

        <div class="grid grid-2">

          <div class="card">

            <div class="deck-icon">
              ◉
            </div>

            <h3>
              Learn Mode
            </h3>

            <p class="muted">
              Trộn câu hỏi nhiều lựa chọn và gõ nghĩa.
              Ưu tiên thẻ đến hạn và thẻ hay sai.
            </p>

            <div class="field">

              <label>
                Chọn bộ
              </label>

              ${deckSelect(
      'learnDeck',
      lastDeck?.id
    )
      }

            </div>

            <div
              class="field"
              style="margin-top:10px"
            >

              <label>
                Số câu
              </label>

              <select
                id="learnCount"
                class="select"
              >

                <option>
                  10
                </option>

                <option selected>
                  20
                </option>

                <option>
                  30
                </option>

                <option>
                  50
                </option>

              </select>

            </div>

            <button
              class="btn btn-primary"
              style="width:100%;margin-top:14px"
              data-action="start-learn"
            >
              Bắt đầu học
            </button>

          </div>

          <div class="card">

            <div class="deck-icon">
              ✓
            </div>

            <h3>
              Test Mode
            </h3>

            <p class="muted">
              Tạo bài kiểm tra, chấm điểm và lưu lại câu sai để học lại.
            </p>

            <div class="field">

              <label>
                Chọn bộ
              </label>

              ${deckSelect(
        'testDeck',
        lastDeck?.id
      )
      }

            </div>

            <div
              class="field"
              style="margin-top:10px"
            >

              <label>
                Số câu
              </label>

              <select
                id="testCount"
                class="select"
              >

                <option selected>
                  10
                </option>

                <option>
                  20
                </option>

                <option>
                  30
                </option>

              </select>

            </div>

            <button
              class="btn btn-soft"
              style="width:100%;margin-top:14px"
              data-action="start-test"
            >
              Tạo bài kiểm tra
            </button>

          </div>

        </div>

        <section class="section">

          <div class="section-head">

            <div>

              <h2>
                Gợi ý
              </h2>

              <p>
                Hệ thống ưu tiên theo lịch sử học
              </p>

            </div>

          </div>

          <div class="chip-row">

            <button
              class="chip active"
              data-action="smart-study"
              data-kind="hard"
            >
              Ôn từ sai nhiều
            </button>

            <button
              class="chip"
              data-action="smart-study"
              data-kind="due"
            >
              Ôn đến hạn
            </button>

            <button
              class="chip"
              data-action="smart-study"
              data-kind="fav"
            >
              Ôn yêu thích
            </button>

          </div>

        </section>

      </div>
    `;
  }

  function deckSelect(
    id,
    selected
  ) {

    return `
      <select
        id="${id}"
        class="select"
      >

        ${state.decks.map(
      d => `
              <option
                value="${d.id}"
                ${d.id === selected
          ? 'selected'
          : ''
        }
              >
                ${esc(d.title)}
                (${deckCards(d.id).length})
              </option>
            `
    ).join('')
      }

      </select>
    `;
  }

  function startLearn(
    deckId,
    count
  ) {

    let cards =
      dueCards(deckId);

    const all =
      deckCards(deckId);

    if (
      cards.length <
      count
    ) {

      cards = [
        ...cards,

        ...all.filter(
          c =>
            !cards.some(
              x => x.id === c.id
            )
        )
      ];
    }

    cards =
      cards.slice(
        0,
        count
      );

    if (cards.length < 2) {

      showToast(
        'Cần ít nhất 2 thẻ để tạo câu hỏi.'
      );

      return;
    }

    learn = {
      cards: shuffle(cards),
      index: 0,
      score: 0,
      answered: false,
      selected: null,
      type: 'mcq',
      startedAt: now(),
      wrong: []
    };

    view = 'learn-session';

    render();
  }

  function makeQuestion(
    c,
    type = 'mcq'
  ) {

    if (type === 'typing') {

      return {
        type,
        prompt: c.word,
        answer: c.meaning,
        card: c
      };
    }

    const distractors =
      shuffle(
        state.cards.filter(
          x =>
            x.id !== c.id &&
            x.meaning !== c.meaning
        )
      )
        .slice(0, 3)
        .map(
          x => x.meaning
        );

    return {
      type: 'mcq',
      prompt: c.word,
      answer: c.meaning,
      choices:
        shuffle([
          c.meaning,
          ...distractors
        ]),
      card: c
    };
  }

  function renderLearnSession() {

    const c =
      learn?.cards[
      learn.index
      ];

    if (!c) {

      view = 'learn';

      return renderLearnHub();
    }

    const type =
      learn.type;

    const q =
      makeQuestion(
        c,
        type
      );

    const pct =
      Math.round(
        learn.index /
        learn.cards.length *
        100
      );

    const feedback =
      learn.answered
        ? `
          <div
            class="card"
            style="margin-top:12px"
          >

            <strong>
              ${learn.selected === q.answer
          ? 'Đúng'
          : 'Chưa đúng'
        }.
            </strong>

            <span class="muted">
              ${esc(c.word)}
              =
              ${esc(c.meaning)}
              ·
              ${esc(c.reading)}
            </span>

            <button
              class="btn btn-primary"
              style="width:100%;margin-top:12px"
              data-action="learn-next"
            >
              Tiếp tục →
            </button>

          </div>
        `
        : '';

    return `
      <div class="page page-study">

        <div class="study-head">

          <button
            class="round-btn"
            data-action="exit-learn"
          >
            ←
          </button>

          <div class="study-head-title">
            Learn Mode
          </div>

          <span class="badge primary">
            ${learn.score} đúng
          </span>

        </div>

        <div class="study-progress">

          <div class="progress">

            <span
              style="width:${pct}%"
            ></span>

          </div>

          <span>
            ${learn.index + 1}/${learn.cards.length}
          </span>

        </div>

        <div
          class="tabs"
          style="margin-bottom:12px"
        >

          <button
            class="tab ${type === 'mcq' ? 'active' : ''}"
            data-action="learn-type"
            data-type="mcq"
          >
            Trắc nghiệm
          </button>

          <button
            class="tab ${type === 'typing' ? 'active' : ''}"
            data-action="learn-type"
            data-type="typing"
          >
            Gõ nghĩa
          </button>

        </div>

        <div class="question">

          <div class="question-kicker">

            ${type === 'mcq'
        ? 'Chọn nghĩa đúng'
        : 'Nhập nghĩa tiếng Việt'
      }

          </div>

          <div class="question-main">
            ${esc(q.prompt)}
          </div>

          ${type === 'mcq'
        ? `
                <div class="choices">

                  ${q.choices.map(
          ch => `
                        <button
                          class="choice ${learn.answered
              ? (
                ch === q.answer
                  ? 'correct'
                  : ch === learn.selected
                    ? 'wrong'
                    : ''
              )
              : ''
            }"
                          data-action="learn-answer"
                          data-answer="${esc(ch)}"
                          ${learn.answered
              ? 'disabled'
              : ''
            }
                        >
                          ${esc(ch)}
                        </button>
                      `
        ).join('')
        }

                </div>
              `
        : `
                <div>

                  <input
                    id="typingAnswer"
                    class="input"
                    placeholder="Nhập nghĩa..."
                    autocomplete="off"
                    ${learn.answered
          ? 'disabled'
          : ''
        }
                  />

                  <button
                    class="btn btn-primary"
                    style="width:100%;margin-top:10px"
                    data-action="submit-typing"
                    ${learn.answered
          ? 'disabled'
          : ''
        }
                  >
                    Kiểm tra
                  </button>

                </div>
              `
      }

        </div>

        ${feedback}

      </div>
    `;
  }

  function finishLearn() {

    const ended =
      now();

    state.sessions.push({
      id: uid('learn'),
      mode: 'learn',
      startedAt: learn.startedAt,
      endedAt: ended,
      count: learn.cards.length,
      correct: learn.score
    });

    save();

    const score =
      learn.score;

    const total =
      learn.cards.length;

    learn = null;

    view = 'learn';

    render();

    showToast(
      `Learn hoàn thành: ${score}/${total}`
    );
  }

  function startTest(
    deckId,
    count
  ) {

    const cards =
      shuffle(
        deckCards(deckId)
      )
        .slice(
          0,
          count
        );

    if (cards.length < 2) {

      showToast(
        'Cần ít nhất 2 thẻ.'
      );

      return;
    }

    testState = {
      deckId,
      cards,
      index: 0,
      answers: [],
      startedAt: now(),
      finished: false
    };

    view = 'test';

    render();
  }

  function renderTest() {

    if (!testState) {

      view = 'learn';

      return renderLearnHub();
    }

    if (testState.finished) {

      const correct =
        testState.answers
          .filter(
            a => a.correct
          ).length;

      const total =
        testState.cards.length;

      const accuracy =
        Math.round(
          correct /
          total *
          100
        );

      const wrong =
        testState.answers
          .filter(
            a => !a.correct
          );

      return `
        <div class="page page-study">

          <div class="section-head">

            <div>

              <h2>
                Kết quả kiểm tra
              </h2>

              <p>
                ${formatDate(now())}
              </p>

            </div>

            <button
              class="btn btn-soft right"
              data-action="exit-test"
            >
              Xong
            </button>

          </div>

          <div class="grid grid-3 stat-grid-mobile">

            ${statCard(
        'Điểm',
        `${correct}/${total}`,
        'Tổng số câu'
      )}

            ${statCard(
        'Độ chính xác',
        `${accuracy}%`,
        'Kết quả bài test'
      )}

            ${statCard(
        'Thời gian',
        fmtMinutes(
          now() -
          testState.startedAt
        ),
        'Hoàn thành'
      )}

          </div>

          <section class="section">

            <div class="section-head">

              <div>

                <h2>
                  ${wrong.length}
                  câu cần xem lại
                </h2>

                <p>
                  Đáp án đã được lưu trong lịch sử
                </p>

              </div>

            </div>

            <div class="list">

              ${wrong.map(
        a => `
                    <div class="list-row">

                      <div class="list-main">

                        <div class="list-title">
                          ${esc(a.word)}
                        </div>

                        <div class="list-sub">
                          Bạn chọn:
                          ${esc(a.selected)}
                          ·
                          Đúng:
                          ${esc(a.answer)}
                        </div>

                      </div>

                    </div>
                  `
      ).join('')
        ||
        `
                  <div class="card center">
                    Không có câu sai.
                  </div>
                `
        }

            </div>

          </section>

          ${wrong.length
          ? `
                <button
                  class="btn btn-primary"
                  style="width:100%;margin-top:14px"
                  data-action="study-wrong-test"
                >
                  Học lại câu sai
                </button>
              `
          : ''
        }

        </div>
      `;
    }

    const c =
      testState.cards[
      testState.index
      ];

    const q =
      makeQuestion(
        c,
        'mcq'
      );

    const pct =
      Math.round(
        testState.index /
        testState.cards.length *
        100
      );

    return `
      <div class="page page-study">

        <div class="study-head">

          <button
            class="round-btn"
            data-action="exit-test"
          >
            ←
          </button>

          <div class="study-head-title">
            Kiểm tra
          </div>

          <span class="badge">
            ${testState.index + 1}/${testState.cards.length}
          </span>

        </div>

        <div class="study-progress">

          <div class="progress">

            <span
              style="width:${pct}%"
            ></span>

          </div>

        </div>

        <div class="question">

          <div class="question-kicker">
            Chọn nghĩa đúng
          </div>

          <div class="question-main">
            ${esc(q.prompt)}
          </div>

          <div class="choices">

            ${q.choices.map(
      ch => `
                  <button
                    class="choice"
                    data-action="test-answer"
                    data-answer="${esc(ch)}"
                  >
                    ${esc(ch)}
                  </button>
                `
    ).join('')
      }

          </div>

        </div>

      </div>
    `;
  }

  function renderImport() {

    const target =
      state.decks.find(
        d =>
          d.id ===
          (
            routeData.importDeckId ||
            state.ui.lastDeckId
          )
      )
      ||
      state.decks[0];

    return `
      <div class="page page-narrow">

        <div class="section-head">

          <div>

            <h2>
              Tạo Flashcard nhanh
            </h2>

            <p>
              Paste text hoặc nạp TXT/CSV/TSV/JSON.
              Luôn preview trước khi lưu.
            </p>

          </div>

        </div>

        <div class="card">

          <div class="form-grid">

            <div class="field">

              <label>
                Nhập vào bộ thẻ
              </label>

              ${deckSelect(
      'importDeck',
      target?.id
    )
      }

            </div>

            <div class="field">

              <label>
                Định dạng
              </label>

              <select
                id="importMode"
                class="select"
              >

                <option value="auto">
                  Tự phát hiện
                </option>

                <option value="pipe">
                  Dấu |
                </option>

                <option value="tab">
                  TAB
                </option>

                <option value="comma">
                  CSV
                </option>

                <option value="dash">
                  Dấu -
                </option>

              </select>

            </div>

          </div>

          <div
            class="field"
            style="margin-top:14px"
          >

            <label>
              Văn bản
            </label>

            <textarea
              id="importText"
              class="textarea"
              placeholder="食べる | たべる | ăn | N5&#10;飲む | のむ | uống | N5"
            ></textarea>

          </div>

          <div
            class="toolbar"
            style="margin-top:12px"
          >

            <button
              class="btn btn-primary"
              data-action="parse-import"
            >
              Phân tích
            </button>

            <button
              class="btn btn-soft"
              data-action="pick-file"
            >
              Nạp file
            </button>

            <button
              class="btn btn-soft"
              data-action="show-import-example"
            >
              Ví dụ
            </button>

          </div>

        </div>

        ${importRows.length
        ? `
              <section class="section">

                <div class="section-head">

                  <div>

                    <h2>
                      Preview
                      ${importRows.length}
                      thẻ
                    </h2>

                    <p>
                      Có thể sửa trực tiếp trước khi import
                    </p>

                  </div>

                  <button
                    class="btn btn-primary right"
                    data-action="commit-import"
                  >
                    Import
                    ${importRows.length}
                    thẻ
                  </button>

                </div>

                <div class="preview-wrap">

                  <table class="preview-table">

                    <thead>

                      <tr>
                        <th>Japanese</th>
                        <th>Reading</th>
                        <th>Romaji</th>
                        <th>Nghĩa</th>
                        <th>JLPT</th>
                        <th></th>
                      </tr>

                    </thead>

                    <tbody>

                      ${importRows.map(
          (r, i) => `
                            <tr>

                              <td>
                                <input
                                  data-import-row="${i}"
                                  data-field="word"
                                  value="${esc(r.word)}"
                                >
                              </td>

                              <td>
                                <input
                                  data-import-row="${i}"
                                  data-field="reading"
                                  value="${esc(r.reading)}"
                                >
                              </td>

                              <td>
                                <input
                                  data-import-row="${i}"
                                  data-field="romaji"
                                  value="${esc(r.romaji)}"
                                >
                              </td>

                              <td>
                                <input
                                  data-import-row="${i}"
                                  data-field="meaning"
                                  value="${esc(r.meaning)}"
                                >
                              </td>

                              <td>
                                <input
                                  data-import-row="${i}"
                                  data-field="jlpt"
                                  value="${esc(r.jlpt)}"
                                >
                              </td>

                              <td>
                                <button
                                  class="tiny-btn"
                                  data-action="remove-import-row"
                                  data-index="${i}"
                                >
                                  ×
                                </button>
                              </td>

                            </tr>
                          `
        ).join('')
        }

                    </tbody>

                  </table>

                </div>

              </section>
            `
        : ''
      }

        <section class="section">

          <div class="grid grid-3">

            <div class="card">

              <strong>
                Smart Text
              </strong>

              <p class="muted small">
                Hỗ trợ |, TAB, dấu phẩy,
                dấu gạch và các dòng
                term/meaning xen kẽ.
              </p>

            </div>

            <div class="card">

              <strong>
                Chống trùng
              </strong>

              <p class="muted small">
                Khi import sẽ bỏ qua
                thẻ trùng Japanese +
                reading trong cùng bộ.
              </p>

            </div>

            <div class="card">

              <strong>
                Backup
              </strong>

              <p class="muted small">
                Có thể xuất toàn bộ dữ liệu
                JSON từ Cài đặt.
              </p>

            </div>

          </div>

        </section>

      </div>
    `;
  }

  function parseImport(
    text,
    mode = 'auto'
  ) {

    const src =
      String(text || '')
        .trim();

    if (!src) {
      return [];
    }

    if (
      src[0] === '[' ||
      src[0] === '{'
    ) {

      try {

        const j =
          JSON.parse(src);

        const arr =
          Array.isArray(j)
            ? j
            : (j.cards || []);

        return arr
          .map(
            x => ({
              word:
                x.word ||
                x.term ||
                '',

              reading:
                x.reading ||
                x.kana ||
                '',

              romaji:
                x.romaji ||
                '',

              meaning:
                x.meaning ||
                x.meaning_vi ||
                x.definition ||
                '',

              jlpt:
                x.jlpt ||
                x.jlpt_level ||
                '',

              pos:
                x.pos ||
                x.part_of_speech ||
                '',

              example:
                x.example ||
                x.example_japanese ||
                '',

              exampleVi:
                x.exampleVi ||
                x.example_vi ||
                '',

              tags:
                Array.isArray(x.tags)
                  ? x.tags
                  : []
            })
          )
          .filter(
            x =>
              x.word &&
              x.meaning
          );

      } catch (e) {

        console.error(e);
      }
    }

    const lines =
      src
        .split(/\r?\n/)
        .map(
          s => s.trim()
        )
        .filter(Boolean);

    const chooseDelimiter =
      line => {

        if (mode === 'pipe') {
          return '|';
        }

        if (mode === 'tab') {
          return '\t';
        }

        if (mode === 'comma') {
          return ',';
        }

        if (mode === 'dash') {
          return /\s[-–—]\s/;
        }

        if (line.includes('|')) {
          return '|';
        }

        if (line.includes('\t')) {
          return '\t';
        }

        if (
          line.split(',').length >= 3
        ) {
          return ',';
        }

        if (
          /\s[-–—]\s/.test(line)
        ) {
          return /\s[-–—]\s/;
        }

        if (line.includes(';')) {
          return ';';
        }

        return null;
      };

    const rows = [];

    for (
      let i = 0;
      i < lines.length;
      i++
    ) {

      const line =
        lines[i];

      const del =
        chooseDelimiter(line);

      if (
        !del &&
        i + 1 < lines.length &&
        !chooseDelimiter(
          lines[i + 1]
        )
      ) {

        rows.push({
          word: line,
          reading: '',
          romaji: '',
          meaning: lines[++i],
          jlpt: '',
          pos: '',
          example: '',
          exampleVi: '',
          tags: []
        });

        continue;
      }

      const p =
        del
          ? line
            .split(del)
            .map(
              s => s.trim()
            )
          : [line];

      if (p.length >= 2) {

        let word =
          p[0] || '';

        let reading = '';

        let romaji = '';

        let meaning = '';

        let jlpt = '';

        if (p.length === 2) {

          meaning =
            p[1];
        }

        else if (p.length === 3) {

          reading =
            p[1];

          meaning =
            p[2];
        }

        else {

          reading =
            p[1];

          if (
            /^[a-zA-Z\s'-]+$/
              .test(
                p[2] || ''
              )
          ) {

            romaji =
              p[2];

            meaning =
              p[3] || '';

            jlpt =
              p[4] || '';

          } else {

            meaning =
              p[2] || '';

            jlpt =
              p[3] || '';
          }
        }

        rows.push({
          word,
          reading,
          romaji,
          meaning,
          jlpt,
          pos: '',
          example: '',
          exampleVi: '',
          tags: []
        });
      }
    }

    return rows.filter(
      x =>
        x.word &&
        x.meaning
    );
  }

  function renderStats() {

    const total =
      state.cards.length;

    const masteredN =
      state.cards
        .filter(mastered)
        .length;

    const learningN =
      state.cards.filter(
        c =>
          c.srs.status !== 'new' &&
          !mastered(c)
      ).length;

    const all =
      state.logs.length;

    const correct =
      state.logs.filter(
        l => l.correct
      ).length;

    const acc =
      all
        ? Math.round(
          correct /
          all *
          100
        )
        : 0;

    const totalMs =
      state.logs.reduce(
        (a, b) =>
          a + (b.ms || 0),
        0
      );

    const days = [];

    for (
      let i = 27;
      i >= 0;
      i--
    ) {

      const d =
        new Date();

      d.setDate(
        d.getDate() - i
      );

      const k =
        todayKey(d);

      const logs =
        state.logs.filter(
          l =>
            todayKey(
              new Date(l.at)
            ) === k
        );

      days.push({
        k,
        count: logs.length,
        label: formatShortDate(d)
      });
    }

    const max =
      Math.max(
        1,
        ...days.map(
          x => x.count
        )
      );

    return `
      <div class="page">

        <div class="section-head">

          <div>

            <h2>
              Thống kê học tập
            </h2>

            <p>
              Dữ liệu được tính từ lịch sử review thực tế.
            </p>

          </div>

        </div>

        <div class="grid grid-4 stat-grid-mobile">

          ${statCard(
      'Tổng thẻ',
      total,
      `${state.decks.length} bộ`
    )}

          ${statCard(
      'Mastered',
      masteredN,
      `${total
        ? Math.round(
          masteredN /
          total *
          100
        )
        : 0
      }% thư viện`
    )}

          ${statCard(
      'Độ chính xác',
      `${acc}%`,
      `${all} lượt trả lời`
    )}

          ${statCard(
      'Thời gian',
      fmtMinutes(totalMs),
      `🔥 ${streak()} ngày`
    )}

        </div>

        <section class="section">

          <div class="grid grid-2">

            <div class="card">

              <div class="section-head">

                <div>

                  <h2>
                    28 ngày gần nhất
                  </h2>

                  <p>
                    Số lượt học mỗi ngày
                  </p>

                </div>

              </div>

              <div class="heatmap">

                ${days.map(
      x => `
                      <div
                        class="heat ${x.count === 0
          ? ''
          : x.count < max * .25
            ? 'l1'
            : x.count < max * .5
              ? 'l2'
              : x.count < max * .8
                ? 'l3'
                : 'l4'
        }"
                        title="${x.label}: ${x.count}"
                      ></div>
                    `
    ).join('')
      }

              </div>

            </div>

            <div class="card">

              <div class="section-head">

                <div>

                  <h2>
                    Phân bố trạng thái
                  </h2>

                  <p>
                    New / Learning / Mastered
                  </p>

                </div>

              </div>

              <div class="list">

                <div class="list-row">

                  <div class="list-main">

                    <div class="list-title">
                      Chưa học
                    </div>

                  </div>

                  <strong>
                    ${state.cards.filter(
        c =>
          c.srs.status === 'new'
      ).length
      }
                  </strong>

                </div>

                <div class="list-row">

                  <div class="list-main">

                    <div class="list-title">
                      Đang học
                    </div>

                  </div>

                  <strong>
                    ${learningN}
                  </strong>

                </div>

                <div class="list-row">

                  <div class="list-main">

                    <div class="list-title">
                      Mastered
                    </div>

                  </div>

                  <strong>
                    ${masteredN}
                  </strong>

                </div>

              </div>

            </div>

          </div>

        </section>

        <section class="section">

          <div class="card">

            <div class="section-head">

              <div>

                <h2>
                  Lượt học theo ngày
                </h2>

                <p>
                  Di chuột/chạm để xem số liệu
                </p>

              </div>

            </div>

            <div class="chart-bars">

              ${days
        .slice(-14)
        .map(
          x => `
                      <div
                        class="bar"
                        data-tip="${x.label}: ${x.count}"
                        style="height:${Math.max(
            4,
            Math.round(
              x.count /
              max *
              100
            )
          )
            }%"
                      ></div>
                    `
        )
        .join('')
      }

            </div>

          </div>

        </section>

      </div>
    `;
  }

  function renderModal() {

    if (!modal) {
      return '';
    }


    if (
      modal.type ===
      'settings'
    ) {

      return modalWrap(
        'Cài đặt',
        `
          <div class="form-grid">

            <div class="field">

              <label>
                Giao diện
              </label>

              <select
                id="settingTheme"
                class="select"
              >

                <option
                  value="system"
                  ${state.settings.theme === 'system'
          ? 'selected'
          : ''
        }
                >
                  Theo hệ thống
                </option>

                <option
                  value="light"
                  ${state.settings.theme === 'light'
          ? 'selected'
          : ''
        }
                >
                  Sáng
                </option>

                <option
                  value="dark"
                  ${state.settings.theme === 'dark'
          ? 'selected'
          : ''
        }
                >
                  Tối
                </option>

              </select>

            </div>

            <div class="field">

              <label>
                Furigana
              </label>

              <select
                id="settingFurigana"
                class="select"
              >

                <option
                  value="always"
                  ${state.settings.furigana === 'always'
          ? 'selected'
          : ''
        }
                >
                  Luôn hiện
                </option>

                <option
                  value="answer"
                  ${state.settings.furigana === 'answer'
          ? 'selected'
          : ''
        }
                >
                  Chỉ mặt đáp án
                </option>

                <option
                  value="never"
                  ${state.settings.furigana === 'never'
          ? 'selected'
          : ''
        }
                >
                  Không hiện
                </option>

              </select>

            </div>

            <div class="field">

              <label>
                Mục tiêu/ngày
              </label>

              <input
                id="settingGoal"
                class="input"
                type="number"
                min="1"
                max="500"
                value="${state.settings.dailyGoal}"
              >

            </div>

            <div class="field">

              <label>
                Romaji
              </label>

              <select
                id="settingRomaji"
                class="select"
              >

                <option
                  value="false"
                  ${!state.settings.romaji
          ? 'selected'
          : ''
        }
                >
                  Tắt
                </option>

                <option
                  value="true"
                  ${state.settings.romaji
          ? 'selected'
          : ''
        }
                >
                  Bật
                </option>

              </select>

            </div>

          </div>

          <div class="divider"></div>

          <div class="toolbar">

            <button
              class="btn btn-primary"
              data-action="save-settings"
            >
              Lưu cài đặt
            </button>

            <button
              class="btn btn-soft"
              data-action="backup-json"
            >
              Backup JSON
            </button>

            <button
              class="btn btn-soft"
              data-action="restore-json"
            >
              Restore JSON
            </button>

            <button
              class="btn btn-danger"
              data-action="reset-app"
            >
              Đặt lại dữ liệu
            </button>

          </div>
        `
      );
    }

    if (
      modal.type ===
      'deck-form'
    ) {

      const d =
        modal.deck || {
          title: '',
          description: '',
          jlpt: 'N5'
        };

      return modalWrap(
        modal.deck
          ? 'Sửa bộ thẻ'
          : 'Tạo bộ thẻ',
        `
          <div class="field">

            <label>
              Tên bộ
            </label>

            <input
              id="deckTitle"
              class="input"
              value="${esc(d.title)}"
              placeholder="VD: JLPT N4 - Bài 1"
            >

          </div>

          <div
            class="field"
            style="margin-top:12px"
          >

            <label>
              Mô tả
            </label>

            <textarea
              id="deckDesc"
              class="textarea"
              style="min-height:90px"
            >${esc(d.description || '')}</textarea>

          </div>

          <div
            class="field"
            style="margin-top:12px"
          >

            <label>
              JLPT
            </label>

            <select
              id="deckJlpt"
              class="select"
            >

              ${[
          'N5',
          'N4',
          'N3',
          'N2',
          'N1',
          'Khác'
        ]
          .map(
            x => `
                    <option
                      ${d.jlpt === x
                ? 'selected'
                : ''
              }
                    >
                      ${x}
                    </option>
                  `
          )
          .join('')
        }

            </select>

          </div>

          <div class="form-actions">

            <button
              class="btn btn-soft"
              data-action="close-modal"
            >
              Hủy
            </button>

            <button
              class="btn btn-primary"
              data-action="save-deck"
            >
              Lưu
            </button>

          </div>

          ${modal.deck
          ? `
                <div class="divider"></div>

                <button
                  class="btn btn-danger"
                  data-action="delete-deck"
                  data-deck="${d.id}"
                >
                  Xóa bộ thẻ
                </button>
              `
          : ''
        }
        `
      );
    }

    if (
      modal.type ===
      'card-form'
    ) {

      const c =
        modal.card || {
          word: '',
          reading: '',
          romaji: '',
          meaning: '',
          jlpt: 'N5',
          pos: '',
          example: '',
          exampleVi: '',
          tags: []
        };

      return modalWrap(
        modal.card
          ? 'Sửa thẻ'
          : 'Tạo thẻ',
        `
          <div class="form-grid">

            <div class="field">

              <label>
                Japanese *
              </label>

              <input
                id="cardWord"
                class="input"
                value="${esc(c.word)}"
              >

            </div>

            <div class="field">

              <label>
                Reading
              </label>

              <input
                id="cardReading"
                class="input"
                value="${esc(c.reading || '')}"
              >

            </div>

            <div class="field">

              <label>
                Nghĩa *
              </label>

              <input
                id="cardMeaning"
                class="input"
                value="${esc(c.meaning)}"
              >

            </div>

            <div class="field">

              <label>
                Romaji
              </label>

              <input
                id="cardRomaji"
                class="input"
                value="${esc(c.romaji || '')}"
              >

            </div>

            <div class="field">

              <label>
                JLPT
              </label>

              <select
                id="cardJlpt"
                class="select"
              >

                ${[
          'N5',
          'N4',
          'N3',
          'N2',
          'N1',
          ''
        ]
          .map(
            x => `
                      <option
                        ${c.jlpt === x
                ? 'selected'
                : ''
              }
                      >
                        ${x || 'Không rõ'}
                      </option>
                    `
          )
          .join('')
        }

              </select>

            </div>

            <div class="field">

              <label>
                Loại từ
              </label>

              <input
                id="cardPos"
                class="input"
                value="${esc(c.pos || '')}"
              >

            </div>

          </div>

          <div
            class="field"
            style="margin-top:12px"
          >

            <label>
              Câu ví dụ
            </label>

            <input
              id="cardExample"
              class="input"
              value="${esc(c.example || '')}"
            >

          </div>

          <div
            class="field"
            style="margin-top:12px"
          >

            <label>
              Dịch câu ví dụ
            </label>

            <input
              id="cardExampleVi"
              class="input"
              value="${esc(c.exampleVi || '')}"
            >

          </div>

          <div
            class="field"
            style="margin-top:12px"
          >

            <label>
              Tags, cách nhau bằng dấu phẩy
            </label>

            <input
              id="cardTags"
              class="input"
              value="${esc((c.tags || []).join(', '))}"
            >

          </div>

          <div class="form-actions">

            <button
              class="btn btn-soft"
              data-action="close-modal"
            >
              Hủy
            </button>

            <button
              class="btn btn-primary"
              data-action="save-card"
            >
              Lưu thẻ
            </button>

          </div>

          ${modal.card
          ? `
                <div class="divider"></div>

                <button
                  class="btn btn-danger"
                  data-action="delete-card"
                  data-card="${c.id}"
                >
                  Xóa thẻ
                </button>
              `
          : ''
        }
        `
      );
    }

    if (
      modal.type ===
      'global-search'
    ) {

      const q =
        modal.query || '';

      const found =
        q
          ? state.cards
            .filter(
              c =>
                cardSearchText(c)
                  .includes(
                    normalizeJapanese(q)
                  )
            )
            .slice(0, 30)
          : [];

      return modalWrap(
        'Tìm kiếm toàn bộ',
        `
          <div class="searchbar">

            ⌕

            <input
              id="globalSearchInput"
              autofocus
              value="${esc(q)}"
              placeholder="Kanji, Kana, Romaji, nghĩa..."
            />

          </div>

          <div
            class="list"
            style="margin-top:12px"
          >

            ${found.map(
          c => `
                  <button
                    class="list-row"
                    style="width:100%;text-align:left"
                    data-action="go-card-deck"
                    data-card="${c.id}"
                  >

                    <div class="list-main">

                      <div class="list-title">
                        ${esc(c.word)}
                        ·
                        ${esc(c.reading)}
                      </div>

                      <div class="list-sub">
                        ${esc(c.meaning)}
                      </div>

                    </div>

                  </button>
                `
        ).join('')
        ||
        (
          q
            ? `
                    <div class="empty">
                      Không tìm thấy.
                    </div>
                  `
            : `
                    <div class="empty">
                      Nhập từ khóa để tìm.
                    </div>
                  `
        )
        }

          </div>
        `
      );
    }

    if (modal.type === 'create-sheet') {
      return `
        <div class="bottom-sheet-backdrop" data-action="backdrop-close">
          <div class="bottom-sheet">
            <div class="sheet-handle"></div>
            
            <div class="sheet-menu-item" data-action="create-deck">
              <div class="sheet-icon-box yellow">📁</div>
              <div>
                <div class="sheet-item-title">Tạo bộ thẻ</div>
                <div class="sheet-item-sub">Tạo mới bộ từ vựng tùy chỉnh</div>
              </div>
              <div class="sheet-item-arrow">›</div>
            </div>

            <div class="sheet-menu-item" data-nav="import">
              <div class="sheet-icon-box blue">📁</div>
              <div>
                <div class="sheet-item-title">Nhập Anki</div>
                <div class="sheet-item-sub">.apkg file</div>
              </div>
              <div class="sheet-item-arrow">›</div>
            </div>

            <div class="sheet-menu-item" data-nav="import">
              <div class="sheet-icon-box green">📄</div>
              <div>
                <div class="sheet-item-title">Nhập từ Quizlet</div>
                <div class="sheet-item-sub">CSV or TSV</div>
              </div>
              <div class="sheet-item-arrow">›</div>
            </div>
          </div>
        </div>
      `;
    }

    return '';
  }

  function modalWrap(
    title,
    body
  ) {

    return `
      <div
        class="modal-backdrop"
        data-action="backdrop-close"
      >

        <div
          class="modal"
        >

          <div class="modal-head">

            <h3>
              ${esc(title)}
            </h3>

            <button
              class="tiny-btn"
              data-action="close-modal"
            >
              ×
            </button>

          </div>

          ${body}

        </div>

      </div>
    `;
  }

  function showToast(msg) {

    clearTimeout(
      toastTimer
    );

    const old =
      document.querySelector(
        '.toast'
      );

    if (old) {
      old.remove();
    }

    const el =
      document.createElement(
        'div'
      );

    el.className =
      'toast';

    el.textContent =
      msg;

    document.body
      .appendChild(el);

    toastTimer =
      setTimeout(
        () => el.remove(),
        2800
      );
  }

  function download(
    name,
    text,
    type = 'application/json'
  ) {

    const blob =
      new Blob(
        [text],
        { type }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const a =
      document.createElement(
        'a'
      );

    a.href =
      url;

    a.download =
      name;

    document.body
      .appendChild(a);

    a.click();

    a.remove();

    setTimeout(
      () => URL.revokeObjectURL(url),
      500
    );
  }

  function speakCard(cardId) {

    const c =
      state.cards.find(
        x => x.id === cardId
      );

    if (!c) {
      return;
    }

    if (
      !(
        'speechSynthesis'
        in window
      )
    ) {

      showToast(
        'Trình duyệt không hỗ trợ phát âm.'
      );

      return;
    }

    speechSynthesis.cancel();

    const u =
      new SpeechSynthesisUtterance(
        c.word
      );

    u.lang =
      'ja-JP';

    u.rate =
      .9;

    speechSynthesis.speak(u);
  }

  function shuffle(arr) {

    const a =
      [...arr];

    for (
      let i = a.length - 1;
      i > 0;
      i--
    ) {

      const j =
        Math.floor(
          Math.random() *
          (i + 1)
        );

      [
        a[i],
        a[j]
      ] = [
          a[j],
          a[i]
        ];
    }

    return a;
  }

  function bindAfterRender() {

    const deckSearch =
      document.getElementById(
        'deckSearch'
      );

    if (deckSearch) {

      deckSearch
        .addEventListener(
          'input',
          e => {

            const q =
              normalizeJapanese(
                e.target.value
              );

            document
              .querySelector(
                '#deckGrid'
              )
              .innerHTML =
              state.decks
                .filter(
                  d =>
                    normalizeJapanese(
                      d.title +
                      ' ' +
                      d.description +
                      ' ' +
                      d.jlpt
                    )
                      .includes(q)
                )
                .map(deckCard)
                .join('')
              ||
              emptyDeck();
          }
        );
    }

    const cardSearch =
      document.getElementById(
        'cardSearch'
      );

    if (cardSearch) {

      cardSearch
        .addEventListener(
          'input',
          e => {

            routeData.query =
              e.target.value;

            const d =
              routeData.deckId;

            const q =
              normalizeJapanese(
                e.target.value
              );

            document
              .getElementById(
                'cardList'
              )
              .innerHTML =
              deckCards(d)
                .filter(
                  c =>
                    !q ||
                    cardSearchText(c)
                      .includes(q)
                )
                .map(cardRow)
                .join('')
              ||
              `
                  <div class="card empty">
                    Không có kết quả.
                  </div>
                `;
          }
        );
    }

    const global =
      document.getElementById(
        'globalSearchInput'
      );

    if (global) {

      global.focus();

      global
        .addEventListener(
          'input',
          e => {

            modal.query =
              e.target.value;

            render();
          }
        );
    }

    document
      .querySelectorAll(
        '[data-import-row]'
      )
      .forEach(
        inp =>
          inp.addEventListener(
            'input',
            e => {

              const i =
                +e.target.dataset
                  .importRow;

              const field =
                e.target.dataset
                  .field;

              if (importRows[i]) {

                importRows[i][field] =
                  e.target.value;
              }
            }
          )
      );

    const typing =
      document.getElementById(
        'typingAnswer'
      );

    if (typing) {

      typing.focus();

      typing.addEventListener(
        'compositionstart',
        () => {
          editingComposition = true;
        }
      );

      typing.addEventListener(
        'compositionend',
        () => {
          editingComposition = false;
        }
      );

      typing.addEventListener(
        'keydown',
        e => {

          }
        );
    }

    const cardEl =
      document.getElementById(
        'flashcard'
      );

    if (
      cardEl &&
      view === 'study' &&
      session
    ) {

      let startX = 0;

      let startY = 0;

      let currentX = 0;

      let currentY = 0;

      let isDragging = false;

      if (
        !cardEl.querySelector(
          '.swipe-overlay.right'
        )
      ) {

        const rightBadge =
          document.createElement('div');

        rightBadge.className =
          'swipe-overlay right';

        rightBadge.textContent =
          '👉 ĐÃ NHỚ';

        const leftBadge =
          document.createElement('div');

        leftBadge.className =
          'swipe-overlay left';

        leftBadge.textContent =
          '👈 CHƯA NHỚ';

        cardEl
          .querySelector(
            '.face.front'
          )
          ?.appendChild(
            rightBadge.cloneNode(true)
          );

        cardEl
          .querySelector(
            '.face.front'
          )
          ?.appendChild(
            leftBadge.cloneNode(true)
          );

        cardEl
          .querySelector(
            '.face.back'
          )
          ?.appendChild(
            rightBadge
          );

        cardEl
          .querySelector(
            '.face.back'
          )
          ?.appendChild(
            leftBadge
          );
      }

      const onStart =
        (clientX, clientY) => {

          isDragging = true;

          startX = clientX;

          startY = clientY;

          currentX = clientX;

          currentY = clientY;

          cardEl.classList.add(
            'swiping'
          );
        };

      const onMove =
        (clientX, clientY) => {

          if (!isDragging) {
            return;
          }

          currentX = clientX;

          currentY = clientY;

          const deltaX =
            currentX - startX;

          const deltaY =
            currentY - startY;

          if (
            Math.abs(deltaY) >
            Math.abs(deltaX) * 1.5 &&
            Math.abs(deltaX) < 15
          ) {
            return;
          }

          const rotate =
            deltaX * 0.05;

          const flipRot =
            session.flipped
              ? 'rotateY(180deg)'
              : '';

          cardEl.style.transform =
            `translateX(${deltaX}px) rotate(${rotate}deg) ${flipRot}`;

          const rightOverlays =
            cardEl.querySelectorAll(
              '.swipe-overlay.right'
            );

          const leftOverlays =
            cardEl.querySelectorAll(
              '.swipe-overlay.left'
            );

          if (deltaX > 30) {

            const op =
              Math.min(
                1,
                (deltaX - 30) / 60
              );

            rightOverlays.forEach(
              el =>
                el.style.opacity = op
            );

            leftOverlays.forEach(
              el =>
                el.style.opacity = 0
            );

          } else if (deltaX < -30) {

            const op =
              Math.min(
                1,
                (-deltaX - 30) / 60
              );

            leftOverlays.forEach(
              el =>
                el.style.opacity = op
            );

            rightOverlays.forEach(
              el =>
                el.style.opacity = 0
            );

          } else {

            rightOverlays.forEach(
              el =>
                el.style.opacity = 0
            );

            leftOverlays.forEach(
              el =>
                el.style.opacity = 0
            );
          }
        };

      const onEnd = () => {

        if (!isDragging) {
          return;
        }

        isDragging = false;

        cardEl.classList.remove(
          'swiping'
        );

        const deltaX =
          currentX - startX;

        const rightOverlays =
          cardEl.querySelectorAll(
            '.swipe-overlay.right'
          );

        const leftOverlays =
          cardEl.querySelectorAll(
            '.swipe-overlay.left'
          );

        rightOverlays.forEach(
          el =>
            el.style.opacity = 0
        );

        leftOverlays.forEach(
          el =>
            el.style.opacity = 0
        );

        if (deltaX > 70) {

          cardEl.classList.add(
            'swipe-out-right'
          );

          setTimeout(() => {

            processRating(
              currentStudyCard(),
              'good'
            );

          }, 180);

        } else if (deltaX < -70) {

          cardEl.classList.add(
            'swipe-out-left'
          );

          setTimeout(() => {

            processRating(
              currentStudyCard(),
              'again'
            );

          }, 180);

        } else {

          const flipRot =
            session.flipped
              ? 'rotateY(180deg)'
              : '';

          cardEl.style.transform =
            flipRot;
        }
      };

      cardEl.addEventListener(
        'touchstart',
        e => {

          if (
            e.touches.length === 1
          ) {

            onStart(
              e.touches[0].clientX,
              e.touches[0].clientY
            );
          }
        },
        { passive: true }
      );

      cardEl.addEventListener(
        'touchmove',
        e => {

          if (
            e.touches.length === 1
          ) {

            onMove(
              e.touches[0].clientX,
              e.touches[0].clientY
            );
          }
        },
        { passive: true }
      );

      cardEl.addEventListener(
        'touchend',
        () => onEnd()
      );

      cardEl.addEventListener(
        'touchcancel',
        () => onEnd()
      );

      cardEl.addEventListener(
        'mousedown',
        e => {

          if (e.button === 0) {

            onStart(
              e.clientX,
              e.clientY
            );

            const mouseMoveHandler =
              ev =>
                onMove(
                  ev.clientX,
                  ev.clientY
                );

            const mouseUpHandler =
              () => {

                onEnd();

                window.removeEventListener(
                  'mousemove',
                  mouseMoveHandler
                );

                window.removeEventListener(
                  'mouseup',
                  mouseUpHandler
                );
              };

            window.addEventListener(
              'mousemove',
              mouseMoveHandler
            );

            window.addEventListener(
              'mouseup',
              mouseUpHandler
            );
          }
        }
      );
    }
  }

  document.addEventListener(
    'click',
    e => {

      const el =
        e.target.closest(
          '[data-action],[data-nav]'
        );




      if (!el) {
        return;
      }

      if (
        el.dataset.action ===
        'backdrop-close' &&
        e.target !== el
      ) {
        return;
      }

      if (el.dataset.nav) {

        view =
          el.dataset.nav;

        routeData = {};

        modal = null;

        render();

        return;
      }

      handleAction(
        el,
        e
      );
    }
  );

  function handleAction(
    el,
    evt
  ) {

    const a =
      el.dataset.action;

    if (
      a === 'open-settings'
    ) {

      modal = {
        type: 'settings'
      };

      render();
    }

    else if (
      a === 'close-modal' ||
      a === 'backdrop-close'
    ) {

      modal = null;

      render();
    }

    else if (
      a === 'global-search'
    ) {

      modal = {
        type: 'global-search',
        query: ''
      };

      render();
    }

    else if (
      a === 'open-create-sheet'
    ) {
      modal = {
        type: 'create-sheet'
      };
      render();
    }

    else if (
      a === 'create-deck'
    ) {

      modal = {
        type: 'deck-form'
      };

      render();
    }

    else if (
      a === 'edit-deck'
    ) {

      modal = {
        type: 'deck-form',

        deck:
          state.decks.find(
            d =>
              d.id ===
              el.dataset.deck
          )
      };

      render();
    }

    else if (
      a === 'save-deck'
    ) {

      const title =
        document
          .getElementById(
            'deckTitle'
          )
          .value
          .trim();

      if (!title) {

        showToast(
          'Nhập tên bộ thẻ.'
        );

        return;
      }

      if (modal.deck) {

        Object.assign(
          modal.deck,
          {
            title,

            description:
              document
                .getElementById(
                  'deckDesc'
                )
                .value
                .trim(),

            jlpt:
              document
                .getElementById(
                  'deckJlpt'
                )
                .value,

            updatedAt:
              now()
          }
        );

      } else {

        const d = {
          id: uid('deck'),

          title,

          description:
            document
              .getElementById(
                'deckDesc'
              )
              .value
              .trim(),

          jlpt:
            document
              .getElementById(
                'deckJlpt'
              )
              .value,

          visibility: 'private',

          createdAt: now(),

          updatedAt: now()
        };

        state.decks
          .unshift(d);

        state.ui.lastDeckId =
          d.id;
      }

      save();

      modal = null;

      view = 'decks';

      render();

      showToast(
        'Đã lưu bộ thẻ.'
      );
    }

    else if (
      a === 'delete-deck'
    ) {

      const id =
        el.dataset.deck;

      if (
        !confirm(
          'Xóa bộ thẻ và toàn bộ thẻ bên trong?'
        )
      ) {
        return;
      }

      state.decks =
        state.decks.filter(
          d => d.id !== id
        );

      state.cards =
        state.cards.filter(
          c => c.deckId !== id
        );

      save();

      modal = null;

      view = 'decks';

      render();

      showToast(
        'Đã xóa bộ thẻ.'
      );
    }

    else if (
      a === 'open-deck'
    ) {

      view = 'deck';

      routeData = {
        deckId:
          el.dataset.deck
      };

      render();
    }

    else if (
      a === 'add-card'
    ) {

      modal = {
        type: 'card-form',
        deckId:
          el.dataset.deck
      };

      render();
    }

    else if (
      a === 'edit-card'
    ) {

      const c =
        state.cards.find(
          x =>
            x.id ===
            el.dataset.card
        );

      modal = {
        type: 'card-form',
        card: c,
        deckId: c?.deckId
      };

      render();
    }

    else if (
      a === 'save-card'
    ) {

      const word =
        document
          .getElementById(
            'cardWord'
          )
          .value
          .trim();

      const meaning =
        document
          .getElementById(
            'cardMeaning'
          )
          .value
          .trim();

      if (
        !word ||
        !meaning
      ) {

        showToast(
          'Japanese và nghĩa là bắt buộc.'
        );

        return;
      }

      const data = {

        word,

        meaning,

        reading:
          document
            .getElementById(
              'cardReading'
            )
            .value
            .trim(),

        romaji:
          document
            .getElementById(
              'cardRomaji'
            )
            .value
            .trim(),

        jlpt:
          document
            .getElementById(
              'cardJlpt'
            )
            .value,

        pos:
          document
            .getElementById(
              'cardPos'
            )
            .value
            .trim(),

        example:
          document
            .getElementById(
              'cardExample'
            )
            .value
            .trim(),

        exampleVi:
          document
            .getElementById(
              'cardExampleVi'
            )
            .value
            .trim(),

        tags:
          document
            .getElementById(
              'cardTags'
            )
            .value
            .split(',')
            .map(
              x => x.trim()
            )
            .filter(Boolean),

        updatedAt:
          now()
      };

      if (modal.card) {

        Object.assign(
          modal.card,
          data
        );

      } else {

        state.cards.push({
          ...makeCard(
            [
              word,
              data.reading,
              data.romaji,
              meaning,
              data.pos,
              data.jlpt,
              data.example,
              data.exampleVi,
              data.tags.join(',')
            ],
            modal.deckId
          ),

          ...data,

          deckId:
            modal.deckId
        });
      }

      save();

      const deckId =
        modal.deckId;

      modal = null;

      view = 'deck';

      routeData = {
        deckId
      };

      render();

      showToast(
        'Đã lưu thẻ.'
      );
    }

    else if (
      a === 'delete-card'
    ) {

      const id =
        el.dataset.card;

      const c =
        state.cards.find(
          x => x.id === id
        );

      if (
        !confirm(
          'Xóa thẻ này?'
        )
      ) {
        return;
      }

      state.cards =
        state.cards.filter(
          x => x.id !== id
        );

      save();

      const deckId =
        c?.deckId;

      modal = null;

      view = 'deck';

      routeData = {
        deckId
      };

      render();

      showToast(
        'Đã xóa thẻ.'
      );
    }

    else if (
      a === 'toggle-fav'
    ) {

      const c =
        state.cards.find(
          x =>
            x.id ===
            el.dataset.card
        );

      if (c) {

        c.favorite =
          !c.favorite;

        save();

        render();
      }
    }

    else if (
      a === 'study-deck' ||
      a === 'quick-study'
    ) {

      const id =
        el.dataset.deck ||
        state.ui.lastDeckId;

      state.ui.lastDeckId =
        id;

      save();

      let cards =
        dueCards(id);

      if (!cards.length) {

        cards =
          deckCards(id);
      }

      startStudy(
        cards,
        id
      );
    }

    else if (
      a === 'smart-study'
    ) {

      let cards = [];

      const k =
        el.dataset.kind;

      if (k === 'due') {

        cards =
          state.cards.filter(
            c =>
              c.srs.status === 'new' ||
              (c.srs.dueAt || 0) <= now()
          );
      }

      if (k === 'hard') {

        cards =
          state.cards.filter(
            c =>
              (c.stats?.wrong || 0) >= 2
          );
      }

      if (k === 'fav') {

        cards =
          state.cards.filter(
            c => c.favorite
          );
      }

      if (k === 'new') {

        cards =
          state.cards.filter(
            c =>
              c.srs.status === 'new'
          );
      }

      startStudy(
        cards,
        null
      );
    }

    else if (
      a === 'flip-card'
    ) {

      if (session) {

        session.flipped =
          !session.flipped;

        render();
      }
    }

    else if (
      a === 'speak'
    ) {

      evt?.stopPropagation?.();

      speakCard(
        el.dataset.card
      );
    }

    else if (
      a === 'rate'
    ) {

      const c =
        currentStudyCard();

      const rating =
        el.dataset.rating;

      processRating(c, rating);
    }

    else if (
      a === 'exit-study'
    ) {
      const targetDeck = session?.deckId;
      session = null;
      if (targetDeck) {
        view = 'deck';
        routeData = { deckId: targetDeck };
      } else {
        view = 'home';
      }
      render();
    }

    else if (
      a === 'shuffle-study'
    ) {

      session.cards =
        shuffle(
          session.cards
        );

      session.index = 0;

      session.flipped = false;

      render();
    }

    else if (
      a === 'start-learn'
    ) {

      startLearn(
        document
          .getElementById(
            'learnDeck'
          )
          .value,

        +document
          .getElementById(
            'learnCount'
          )
          .value
      );
    }

    else if (
      a === 'learn-type'
    ) {

      if (
        learn &&
        !learn.answered
      ) {

        learn.type =
          el.dataset.type;

        render();
      }
    }

    else if (
      a === 'learn-answer'
    ) {

      if (learn.answered) {
        return;
      }

      const c =
        learn.cards[
        learn.index
        ];

      const ans =
        el.dataset.answer;

      const ok =
        ans ===
        c.meaning;

      learn.answered = true;

      learn.selected = ans;

      if (ok) {

        learn.score++;

      } else {

        learn.wrong.push(
          c.id
        );
      }

      const ms =
        now() -
        learn.startedAt;

      state.logs.push({
        id: uid('log'),
        cardId: c.id,
        deckId: c.deckId,
        at: now(),
        rating:
          ok
            ? 'good'
            : 'again',
        correct: ok,
        ms:
          Math.min(
            ms,
            120000
          ),
        mode: 'learn'
      });

      c.stats.seen++;

      if (ok) {

        c.stats.correct++;

      } else {

        c.stats.wrong++;
      }

      save();

      render();
    }

    else if (
      a === 'submit-typing'
    ) {

      if (learn.answered) {
        return;
      }

      const c =
        learn.cards[
        learn.index
        ];

      const val =
        document
          .getElementById(
            'typingAnswer'
          )
          .value
          .trim();

      const ok =
        normalizeJapanese(val) ===
        normalizeJapanese(c.meaning)
        ||
        normalizeJapanese(
          c.meaning
        )
          .split(/[;,]/)
          .map(
            x => x.trim()
          )
          .includes(
            normalizeJapanese(val)
          );

      learn.answered = true;

      learn.selected = val;

      if (ok) {

        learn.score++;

      } else {

        learn.wrong.push(
          c.id
        );
      }

      state.logs.push({
        id: uid('log'),
        cardId: c.id,
        deckId: c.deckId,
        at: now(),
        rating:
          ok
            ? 'good'
            : 'again',
        correct: ok,
        ms: 5000,
        mode: 'learn'
      });

      c.stats.seen++;

      if (ok) {

        c.stats.correct++;

      } else {

        c.stats.wrong++;
      }

      save();

      render();
    }

    else if (
      a === 'learn-next'
    ) {

      learn.index++;

      learn.answered = false;

      learn.selected = null;

      if (
        learn.index >=
        learn.cards.length
      ) {

        finishLearn();

      } else {

        render();
      }
    }

    else if (
      a === 'exit-learn'
    ) {

      learn = null;

      view = 'learn';

      render();
    }

    else if (
      a === 'start-test'
    ) {

      startTest(
        document
          .getElementById(
            'testDeck'
          )
          .value,

        +document
          .getElementById(
            'testCount'
          )
          .value
      );
    }

    else if (
      a === 'test-answer'
    ) {

      const c =
        testState.cards[
        testState.index
        ];

      const selected =
        el.dataset.answer;

      const ok =
        selected ===
        c.meaning;

      testState.answers.push({
        cardId: c.id,
        word: c.word,
        selected,
        answer: c.meaning,
        correct: ok
      });

      state.logs.push({
        id: uid('log'),
        cardId: c.id,
        deckId: c.deckId,
        at: now(),
        rating:
          ok
            ? 'good'
            : 'again',
        correct: ok,
        ms: 4000,
        mode: 'test'
      });

      c.stats.seen++;

      if (ok) {

        c.stats.correct++;

      } else {

        c.stats.wrong++;
      }

      testState.index++;

      if (
        testState.index >=
        testState.cards.length
      ) {

        testState.finished = true;

        state.sessions.push({
          id: uid('test'),
          mode: 'test',
          deckId:
            testState.deckId,
          startedAt:
            testState.startedAt,
          endedAt: now(),
          count:
            testState.cards.length,
          correct:
            testState.answers
              .filter(
                x => x.correct
              )
              .length
        });
      }

      save();

      render();
    }

    else if (
      a === 'exit-test'
    ) {

      testState = null;

      view = 'learn';

      render();
    }

    else if (
      a === 'study-wrong-test'
    ) {

      const ids =
        testState.answers
          .filter(
            x => !x.correct
          )
          .map(
            x => x.cardId
          );

      const cards =
        ids
          .map(
            id =>
              state.cards.find(
                c => c.id === id
              )
          )
          .filter(Boolean);

      testState = null;

      startStudy(
        cards,
        null
      );
    }

    else if (
      a === 'parse-import'
    ) {

      importRows =
        parseImport(
          document
            .getElementById(
              'importText'
            )
            .value,

          document
            .getElementById(
              'importMode'
            )
            .value
        );

      render();

      if (!importRows.length) {

        showToast(
          'Không nhận diện được flashcard. Kiểm tra định dạng.'
        );
      }
    }

    else if (
      a === 'remove-import-row'
    ) {

      importRows.splice(
        +el.dataset.index,
        1
      );

      render();
    }

    else if (
      a === 'commit-import'
    ) {

      const deckId =
        document
          .getElementById(
            'importDeck'
          )
          ?.value
        ||
        state.ui.lastDeckId;

      if (!deckId) {

        showToast(
          'Hãy tạo bộ thẻ trước.'
        );

        return;
      }

      let added = 0;

      let dup = 0;

      const existing =
        new Set(
          deckCards(deckId)
            .map(
              c =>
                normalizeJapanese(
                  c.word +
                  '|' +
                  c.reading
                )
            )
        );

      importRows.forEach(
        r => {

          const key =
            normalizeJapanese(
              r.word +
              '|' +
              r.reading
            );

          if (
            existing.has(key)
          ) {

            dup++;

            return;
          }

          state.cards.push(
            makeCard(
              [
                r.word,
                r.reading,
                r.romaji,
                r.meaning,
                r.pos || '',
                r.jlpt || '',
                r.example || '',
                r.exampleVi || '',
                (r.tags || []).join(',')
              ],
              deckId
            )
          );

          existing.add(key);

          added++;
        }
      );

      state.ui.lastDeckId =
        deckId;

      save();

      importRows = [];

      routeData = {};

      render();

      showToast(
        `Đã import ${added} thẻ${dup
          ? ` · bỏ qua ${dup} trùng`
          : ''
        }.`
      );
    }

    else if (
      a === 'show-import-example'
    ) {

      document
        .getElementById(
          'importText'
        )
        .value =
        `食べる | たべる | taberu | ăn | N5
飲む | のむ | nomu | uống | N5
学校 | がっこう | gakkou | trường học | N5`;
    }

    else if (
      a === 'pick-file'
    ) {

      document
        .getElementById(
          'filePicker'
        )
        .dataset.mode =
        'import';

      document
        .getElementById(
          'filePicker'
        )
        .click();
    }

    else if (
      a === 'export-deck'
    ) {

      const d =
        state.decks.find(
          x =>
            x.id ===
            el.dataset.deck
        );

      const cards =
        deckCards(d.id);

      const csv = [
        'Japanese,Reading,Romaji,Meaning,JLPT,Part of speech,Tags',

        ...cards.map(
          c =>
            [
              c.word,
              c.reading,
              c.romaji,
              c.meaning,
              c.jlpt,
              c.pos,
              (c.tags || []).join('|')
            ]
              .map(escapeCsv)
              .join(',')
        )
      ].join('\n');

      download(
        `${d.title.replace(
          /[^\w\-\u00C0-\u1EF9]+/g,
          '_'
        )
        }.csv`,
        csv,
        'text/csv;charset=utf-8'
      );
    }

    else if (
      a === 'save-settings'
    ) {

      state.settings.theme =
        document
          .getElementById(
            'settingTheme'
          )
          .value;

      state.settings.furigana =
        document
          .getElementById(
            'settingFurigana'
          )
          .value;

      state.settings.dailyGoal =
        clamp(
          +document
            .getElementById(
              'settingGoal'
            )
            .value
          || 20,
          1,
          500
        );

      state.settings.romaji =
        document
          .getElementById(
            'settingRomaji'
          )
          .value ===
        'true';

      save();

      modal = null;

      render();

      showToast(
        'Đã lưu cài đặt.'
      );
    }

    else if (
      a === 'backup-json'
    ) {

      download(
        `ductri-backup-${todayKey()}.json`,
        JSON.stringify(
          state,
          null,
          2
        )
      );
    }

    else if (
      a === 'restore-json'
    ) {

      document
        .getElementById(
          'filePicker'
        )
        .dataset.mode =
        'restore';

      document
        .getElementById(
          'filePicker'
        )
        .click();
    }

    else if (
      a === 'reset-app'
    ) {

      if (
        confirm(
          'Xóa toàn bộ dữ liệu local và đưa ứng dụng về mặc định?'
        )
      ) {

        state =
          initialState();

        save();

        modal = null;

        view = 'home';

        render();

        showToast(
          'Đã đặt lại dữ liệu.'
        );
      }
    }

    else if (
      a === 'go-card-deck'
    ) {

      const c =
        state.cards.find(
          x =>
            x.id ===
            el.dataset.card
        );

      if (c) {

        modal = null;

        view = 'deck';

        routeData = {
          deckId: c.deckId,
          query: c.word
        };

        render();
      }
    }
  }

  document
    .getElementById(
      'filePicker'
    )
    .addEventListener(
      'change',
      async e => {

        const f =
          e.target.files[0];

        if (!f) {
          return;
        }

        const mode =
          e.target.dataset.mode;

        try {

          const text =
            await f.text();

          if (mode === 'restore') {

            const parsed =
              JSON.parse(text);

            if (
              !parsed.decks ||
              !parsed.cards
            ) {

              throw new Error(
                'Backup không hợp lệ'
              );
            }

            state =
              parsed;

            state.settings = {
              ...initialState().settings,
              ...state.settings
            };

            state.logs ||= [];

            state.sessions ||= [];

            state.ui ||= {};

            save();

            modal = null;

            view = 'home';

            render();

            showToast(
              'Đã restore dữ liệu.'
            );

          } else {

            document
              .getElementById(
                'importText'
              )
              .value =
              text;

            importRows =
              parseImport(
                text,
                'auto'
              );

            render();

            showToast(
              `Đã đọc ${importRows.length} thẻ từ file.`
            );
          }

        } catch (err) {

          console.error(err);

          showToast(
            'Không đọc được file hoặc định dạng không hợp lệ.'
          );

        } finally {

          e.target.value = '';
        }
      }
    );

  window.addEventListener(
    'keydown',
    e => {

      if (
        view === 'study' &&
        session &&
        ![
          'INPUT',
          'TEXTAREA',
          'SELECT'
        ].includes(
          document.activeElement.tagName
        )
      ) {

        if (
          e.code === 'Space'
        ) {

          e.preventDefault();

          session.flipped =
            !session.flipped;

          render();
        }

        if (
          session.flipped &&
          [
            'Digit1',
            'Digit2',
            'Digit3',
            'Digit4'
          ].includes(e.code)
        ) {

          const map = {
            Digit1: 'again',
            Digit2: 'hard',
            Digit3: 'good',
            Digit4: 'easy'
          };

          const fake = {
            dataset: {
              action: 'rate',
              rating: map[e.code]
            }
          };

          handleAction(fake);
        }

        if (
          e.key
            .toLowerCase() ===
          's'
        ) {

          const c =
            currentStudyCard();

          c.favorite =
            !c.favorite;

          save();

          render();
        }
      }
    }
  );

  if (
    'serviceWorker'
    in navigator
    &&
    location.protocol
      .startsWith('http')
  ) {

    navigator
      .serviceWorker
      .register('./sw.js')
      .catch(
        err =>
          console.warn(
            'Service Worker:',
            err
          )
      );
  }

  if (
    window.matchMedia
  ) {

    window
      .matchMedia(
        '(prefers-color-scheme: dark)'
      )
      .addEventListener?.(
        'change',
        () => {

          if (
            state.settings.theme ===
            'system'
          ) {

            applyTheme();
          }
        }
      );
  }

  document.addEventListener(
    'keydown',
    e => {

      if (
        !session ||
        view !== 'study'
      ) {
        return;
      }

      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (
        e.code === 'Space' ||
        e.key === ' '
      ) {

        e.preventDefault();

        if (!session.flipped) {

          session.flipped = true;

          render();
        }

        return;
      }

      if (session.flipped) {

        const map = {
          '1': 'again',
          '2': 'hard',
          '3': 'good',
          '4': 'easy'
        };

        const rating =
          map[e.key];

        if (rating) {

          e.preventDefault();

          const card =
            session.cards[
              session.index
            ];

          if (card) {
            processRating(card, rating);
          }
        }
      }
    }
  );

  function confetti() {

    const colors = [
      '#4355ff',
      '#35c2e6',
      '#24a36a',
      '#e7a127',
      '#e84c5b',
      '#a855f7'
    ];

    for (let i = 0; i < 60; i++) {

      const el =
        document.createElement('div');

      el.className = 'confetti-piece';

      el.style.cssText = [
        `left:${Math.random() * 100}vw`,
        `background:${colors[i % colors.length]}`,
        `width:${6 + Math.random() * 8}px`,
        `height:${6 + Math.random() * 8}px`,
        `animation-duration:${1.2 + Math.random() * 1.6}s`,
        `animation-delay:${Math.random() * .4}s`,
        `border-radius:${Math.random() > .5 ? '50%' : '2px'}`
      ].join(';');

      document.body.appendChild(el);

      el.addEventListener(
        'animationend',
        () => el.remove()
      );
    }
  }

  async function initCloudSync() {
    try {
      const snap = await getDoc(doc(db, "users", deviceId));
      if (snap.exists() && snap.data().appState) {
        const cloudState = snap.data().appState;
        if (!state.cards || state.cards.length === 0) {
          state = cloudState;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          render();
        }
      }
    } catch (err) {
      console.warn("Initial cloud load info:", err);
    }
    syncToFirebase();
  }

  render();
  initCloudSync();
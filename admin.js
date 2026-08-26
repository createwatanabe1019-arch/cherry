/* ==================================================================
   CHERRY SPA - admin.js
   管理画面のロジック本体。
   目次:
   1. フィールド定義（テキスト・画像・表示設定・共通リンク）
   2. パスコード認証（簡易・クライアント側のみ）
   3. 状態管理（state）とプレビュー反映（localStorage経由）
   4. UI構築（テキストタブ／画像タブ／表示設定タブ）
   5. 画像ドラッグ＆ドロップ処理
   6. 保存（ダウンロード）／読み込み（ファイル選択）
   ================================================================== */

/* ---------- 1. フィールド定義 ---------- */
// type: 'text'（1行）/ 'textarea'（複数行）
const TEXT_GROUPS = [
  {
    group: '共通設定（電話番号・LINE・WEB予約リンク）',
    special: 'links',
    fields: [
      { key: 'phone_number', label: '電話番号（サイト内の電話ボタンに一括反映）', type: 'text' },
      { key: 'line_url', label: 'LINE公式アカウントのURL（サイト内のLINEボタンに一括反映）', type: 'text' },
      { key: 'web_reservation_url', label: 'WEB予約のリンク先URL（外部予約システム等／空欄なら予約セクションへ移動）', type: 'text' },
      { key: 'therapist_page_url', label: 'セラピストページのリンク先URL（外部ページ等に変更可／空欄なら通常のtherapist.htmlへ）', type: 'text' },
      { key: 'instagram_url', label: 'InstagramのURL', type: 'text' },
      { key: 'google_map_url', label: 'GoogleマップのURL（フッターアイコン用）', type: 'text' },
      { key: 'x_username', label: 'X（旧Twitter）のユーザー名（@なしで入力／フッターアイコンのリンク先に使用）', type: 'text' },
    ],
  },
  {
    group: 'ヘッダー',
    fields: [
      { key: 'header_logo_en', label: 'ロゴ（英字）', type: 'text' },
      { key: 'header_logo_ja', label: 'ロゴ下の説明文', type: 'text' },
      { key: 'nav_reasons_label', label: 'ナビ「選ばれる理由」の表示名', type: 'text' },
      { key: 'nav_menu_label', label: 'ナビ「メニュー」の表示名', type: 'text' },
      { key: 'nav_therapist_label', label: 'ナビ「セラピスト」の表示名', type: 'text' },
      { key: 'nav_voice_label', label: 'ナビ「お客様の声」の表示名', type: 'text' },
      { key: 'nav_access_label', label: 'ナビ「アクセス」の表示名', type: 'text' },
      { key: 'nav_tel_label', label: '電話ボタンの表示名', type: 'text' },
      { key: 'nav_web_label', label: 'WEB予約ボタンの表示名', type: 'text' },
      { key: 'hero_web_label', label: 'ファーストビューのWEB予約ボタンの表示名', type: 'text' },
    ],
  },
  {
    group: '① ファーストビュー',
    fields: [
      { key: 'hero_eyebrow', label: '英字キャッチ（小見出し）', type: 'text' },
      { key: 'hero_title_pre', label: 'メインコピー（前半）', type: 'text' },
      { key: 'hero_title_gold', label: 'メインコピー（ゴールド強調部分）', type: 'text' },
      { key: 'hero_title_post', label: 'メインコピー（後半）', type: 'text' },
      { key: 'hero_sub', label: 'サブコピー（<br>タグ使用可）', type: 'textarea' },
      { key: 'hero_badge1_label', label: 'バッジ1 テキスト', type: 'text' },
      { key: 'hero_badge2_label', label: 'バッジ2 テキスト', type: 'text' },
      { key: 'hero_badge3_label', label: 'バッジ3 テキスト', type: 'text' },
      { key: 'hero_badge4_label', label: 'バッジ4 テキスト', type: 'text' },
    ],
  },
  {
    group: '② 選ばれる理由',
    sectionKey: 'reasons',
    fields: [
      { key: 'reasons_lead', label: 'リード文', type: 'textarea' },
      { key: 'reason1_title', label: '理由1 タイトル', type: 'text' },
      { key: 'reason1_desc', label: '理由1 説明文', type: 'textarea' },
      { key: 'reason2_title', label: '理由2 タイトル', type: 'text' },
      { key: 'reason2_desc', label: '理由2 説明文', type: 'textarea' },
      { key: 'reason3_title', label: '理由3 タイトル', type: 'text' },
      { key: 'reason3_desc', label: '理由3 説明文', type: 'textarea' },
      { key: 'reason4_title', label: '理由4 タイトル', type: 'text' },
      { key: 'reason4_desc', label: '理由4 説明文', type: 'textarea' },
      { key: 'reason5_title', label: '理由5 タイトル', type: 'text' },
      { key: 'reason5_desc', label: '理由5 説明文', type: 'textarea' },
      { key: 'reason6_title', label: '理由6 タイトル', type: 'text' },
      { key: 'reason6_desc', label: '理由6 説明文', type: 'textarea' },
    ],
  },
  {
    group: '③ 施術メニュー',
    sectionKey: 'menu',
    fields: [
      { key: 'menu_lead', label: 'リード文', type: 'textarea' },
      { key: 'menu_item1_name', label: 'メニュー1 名称', type: 'text' },
      { key: 'menu_item1_time', label: 'メニュー1 時間', type: 'text' },
      { key: 'menu_item1_price', label: 'メニュー1 料金', type: 'text' },
      { key: 'menu_item1_desc', label: 'メニュー1 特徴', type: 'text' },
      { key: 'menu_item2_name', label: 'メニュー2 名称', type: 'text' },
      { key: 'menu_item2_time', label: 'メニュー2 時間', type: 'text' },
      { key: 'menu_item2_price', label: 'メニュー2 料金', type: 'text' },
      { key: 'menu_item2_desc', label: 'メニュー2 特徴', type: 'text' },
      { key: 'menu_note', label: '注記（指名料など）', type: 'text' },
      { key: 'menu_cancel_policy', label: 'キャンセルポリシー', type: 'textarea' },
    ],
  },
  {
    group: '④ おすすめコース',
    sectionKey: 'course',
    fields: [
      { key: 'course1_badge', label: 'コース1 バッジ文言', type: 'text' },
      { key: 'course1_title', label: 'コース1 タイトル', type: 'text' },
      { key: 'course1_desc', label: 'コース1 説明文', type: 'textarea' },
      { key: 'course1_price', label: 'コース1 料金', type: 'text' },
      { key: 'course1_pricenote', label: 'コース1 料金注記', type: 'text' },
      { key: 'course2_badge', label: 'コース2 バッジ文言', type: 'text' },
      { key: 'course2_title', label: 'コース2 タイトル', type: 'text' },
      { key: 'course2_desc', label: 'コース2 説明文', type: 'textarea' },
      { key: 'course2_pricebefore', label: 'コース2 割引前価格', type: 'text' },
      { key: 'course2_pricenow', label: 'コース2 割引後価格', type: 'text' },
      { key: 'course2_pricenote', label: 'コース2 料金注記', type: 'text' },
      { key: 'course2_limit', label: 'コース2 限定枠文言（<strong>タグ使用可）', type: 'text' },
      { key: 'course3_badge', label: 'コース3 バッジ文言', type: 'text' },
      { key: 'course3_title', label: 'コース3 タイトル', type: 'text' },
      { key: 'course3_desc', label: 'コース3 説明文', type: 'textarea' },
      { key: 'course3_price', label: 'コース3 料金', type: 'text' },
      { key: 'course3_pricenote', label: 'コース3 料金注記', type: 'text' },
    ],
  },
  {
    group: '⑥ 店内紹介',
    sectionKey: 'gallery',
    fields: [
      { key: 'gallery_lead', label: 'リード文', type: 'textarea' },
    ],
  },
  {
    group: '⑦ お客様の声',
    sectionKey: 'voice',
    fields: [
      { key: 'voice_rating_score', label: '評価スコア', type: 'text' },
      { key: 'voice_rating_text', label: 'クチコミ件数などの文言', type: 'text' },
      { key: 'voice1_text', label: '口コミ1 本文', type: 'textarea' },
      { key: 'voice1_author', label: '口コミ1 投稿者', type: 'text' },
      { key: 'voice2_text', label: '口コミ2 本文', type: 'textarea' },
      { key: 'voice2_author', label: '口コミ2 投稿者', type: 'text' },
      { key: 'voice3_text', label: '口コミ3 本文', type: 'textarea' },
      { key: 'voice3_author', label: '口コミ3 投稿者', type: 'text' },
      { key: 'voice4_text', label: '口コミ4 本文', type: 'textarea' },
      { key: 'voice4_author', label: '口コミ4 投稿者', type: 'text' },
    ],
  },
  {
    group: '⑧ 施術の流れ',
    sectionKey: 'flow',
    fields: [
      { key: 'flow1_title', label: 'STEP1 タイトル', type: 'text' },
      { key: 'flow1_desc', label: 'STEP1 説明文', type: 'textarea' },
      { key: 'flow2_title', label: 'STEP2 タイトル', type: 'text' },
      { key: 'flow2_desc', label: 'STEP2 説明文', type: 'textarea' },
      { key: 'flow3_title', label: 'STEP3 タイトル', type: 'text' },
      { key: 'flow3_desc', label: 'STEP3 説明文', type: 'textarea' },
      { key: 'flow4_title', label: 'STEP4 タイトル', type: 'text' },
      { key: 'flow4_desc', label: 'STEP4 説明文', type: 'textarea' },
      { key: 'flow5_title', label: 'STEP5 タイトル', type: 'text' },
      { key: 'flow5_desc', label: 'STEP5 説明文', type: 'textarea' },
    ],
  },
  {
    group: '⑨ よくある質問',
    sectionKey: 'faq',
    fields: [
      { key: 'faq1_q', label: 'Q1 質問', type: 'text' },
      { key: 'faq1_a', label: 'Q1 回答', type: 'textarea' },
      { key: 'faq2_q', label: 'Q2 質問', type: 'text' },
      { key: 'faq2_a', label: 'Q2 回答', type: 'textarea' },
      { key: 'faq3_q', label: 'Q3 質問', type: 'text' },
      { key: 'faq3_a', label: 'Q3 回答', type: 'textarea' },
      { key: 'faq4_q', label: 'Q4 質問', type: 'text' },
      { key: 'faq4_a', label: 'Q4 回答', type: 'textarea' },
      { key: 'faq5_q', label: 'Q5 質問', type: 'text' },
      { key: 'faq5_a', label: 'Q5 回答', type: 'textarea' },
      { key: 'faq6_q', label: 'Q6 質問', type: 'text' },
      { key: 'faq6_a', label: 'Q6 回答', type: 'textarea' },
    ],
  },
  {
    group: '⑩ アクセス',
    sectionKey: 'access',
    fields: [
      { key: 'access_address', label: '住所', type: 'text' },
      { key: 'access_station', label: '最寄駅', type: 'text' },
      { key: 'access_hours', label: '営業時間', type: 'text' },
      { key: 'access_parking', label: '駐車場', type: 'text' },
    ],
  },
  {
    group: '⑪ 予約CTAセクション',
    sectionKey: 'cta',
    fields: [
      { key: 'cta_heading', label: '見出し', type: 'text' },
      { key: 'cta_subtext', label: '本文', type: 'textarea' },
      { key: 'cta_note', label: '注記（キャンペーン文言など）', type: 'text' },
    ],
  },
  {
    group: '⑫ フッター',
    fields: [
      { key: 'footer_tagline', label: 'ブランド紹介文（<br>タグ使用可）', type: 'textarea' },
      { key: 'footer_nav_reasons_label', label: 'フッターメニュー「選ばれる理由」表示名', type: 'text' },
      { key: 'footer_nav_menu_label', label: 'フッターメニュー「施術メニュー」表示名', type: 'text' },
      { key: 'footer_nav_therapist_label', label: 'フッターメニュー「セラピスト紹介」表示名', type: 'text' },
      { key: 'footer_nav_access_label', label: 'フッターメニュー「アクセス」表示名', type: 'text' },
      { key: 'footer_nav_company_label', label: '会社情報「会社概要」表示名', type: 'text' },
      { key: 'footer_nav_recruit_label', label: '会社情報「求人情報」表示名', type: 'text' },
      { key: 'footer_nav_sns_label', label: '会社情報「SNS一覧」表示名', type: 'text' },
      { key: 'footer_nav_privacy_label', label: '会社情報「プライバシーポリシー」表示名', type: 'text' },
      { key: 'footer_nav_terms_label', label: '会社情報「利用規約」表示名', type: 'text' },
    ],
  },
  {
    group: '求人情報ページ',
    fields: [
      { key: 'recruit_intro', label: '導入文', type: 'textarea' },
      { key: 'recruit_point1_title', label: '働く理由1 タイトル', type: 'text' },
      { key: 'recruit_point1_desc', label: '働く理由1 説明文', type: 'textarea' },
      { key: 'recruit_point2_title', label: '働く理由2 タイトル', type: 'text' },
      { key: 'recruit_point2_desc', label: '働く理由2 説明文', type: 'textarea' },
      { key: 'recruit_point3_title', label: '働く理由3 タイトル', type: 'text' },
      { key: 'recruit_point3_desc', label: '働く理由3 説明文', type: 'textarea' },
      { key: 'recruit_job_type', label: '職種', type: 'text' },
      { key: 'recruit_salary', label: '給与', type: 'text' },
      { key: 'recruit_hours', label: '勤務時間', type: 'text' },
      { key: 'recruit_benefits', label: '待遇', type: 'text' },
      { key: 'recruit_requirements', label: '応募条件', type: 'text' },
      { key: 'recruit_cta_heading', label: '応募CTA 見出し', type: 'text' },
      { key: 'recruit_cta_note', label: '応募CTA 本文', type: 'text' },
    ],
  },
];

const IMAGE_FIELDS = [
  { key: 'hero_bg', label: 'ファーストビュー背景' },
  { key: 'course1_img', label: 'コース1 画像（人気No.1）' },
  { key: 'course2_img', label: 'コース2 画像（初回限定）' },
  { key: 'course3_img', label: 'コース3 画像（リピーター人気）' },
  { key: 'cta_bg', label: '予約CTAセクション背景' },
  { key: 'recruit_cta_bg', label: '求人ページ CTA背景' },
];

const SECTION_TOGGLES = [
  { key: 'news', label: 'お知らせ' },
  { key: 'reasons', label: '② 選ばれる理由' },
  { key: 'menu', label: '③ 施術メニュー' },
  { key: 'course', label: '④ おすすめコース' },
  { key: 'therapist', label: '⑤ セラピスト紹介' },
  { key: 'gallery', label: '⑥ 店内紹介' },
  { key: 'voice', label: '⑦ お客様の声' },
  { key: 'flow', label: '⑧ 施術の流れ' },
  { key: 'faq', label: '⑨ よくある質問' },
  { key: 'access', label: '⑩ アクセス' },
  { key: 'cta', label: '⑪ 予約CTAセクション' },
];

const HERO_BADGE_TOGGLES = [
  { key: 'hero_badge1', label: 'バッジ1（国家資格セラピスト在籍）' },
  { key: 'hero_badge2', label: 'バッジ2（完全個室）' },
  { key: 'hero_badge3', label: 'バッジ3（深夜5時まで営業）' },
  { key: 'hero_badge4', label: 'バッジ4（Google評価）' },
];

const MISC_TOGGLES = [
  { key: 'reasons_icons', label: '「選ばれる理由」のアイコン（6個まとめて表示/非表示）' },
  { key: 'footer_sns_instagram', label: 'フッター Instagramアイコン' },
  { key: 'footer_sns_line', label: 'フッター LINEアイコン' },
  { key: 'footer_sns_map', label: 'フッター Googleマップアイコン' },
  { key: 'footer_sns_x', label: 'フッター X（旧Twitter）アイコン' },
  { key: 'footer_group_menu', label: 'フッター「メニュー」列（見出し＋リンク一式）' },
  { key: 'footer_group_company', label: 'フッター「会社情報」列（見出し＋リンク一式）' },
];

const HEADER_NAV_TOGGLES = [
  { key: 'nav_reasons', label: '選ばれる理由' },
  { key: 'nav_menu', label: 'メニュー' },
  { key: 'nav_therapist', label: 'セラピスト' },
  { key: 'nav_voice', label: 'お客様の声' },
  { key: 'nav_access', label: 'アクセス' },
];

const FOOTER_NAV_TOGGLES = [
  { key: 'footer_nav_reasons', label: '選ばれる理由' },
  { key: 'footer_nav_menu', label: '施術メニュー' },
  { key: 'footer_nav_therapist', label: 'セラピスト紹介' },
  { key: 'footer_nav_access', label: 'アクセス' },
  { key: 'footer_nav_company', label: '会社概要' },
  { key: 'footer_nav_recruit', label: '求人情報' },
  { key: 'footer_nav_sns', label: 'SNS一覧' },
  { key: 'footer_nav_privacy', label: 'プライバシーポリシー' },
  { key: 'footer_nav_terms', label: '利用規約' },
];

/* ---------- 2. パスコード認証（簡易・クライアント側のみ） ----------
   注意：これはHTML/JSを直接見れば分かる簡易的な入店確認程度のものです。
   本格的なアクセス制限が必要な場合はサーバー側の認証を別途導入してください。 */
const ADMIN_PASSCODE = 'cherryspa2026';

function checkPasscode() {
  const overlay = document.getElementById('authOverlay');
  const input = document.getElementById('authInput');
  const errorMsg = document.getElementById('authError');
  const form = document.getElementById('authForm');

  if (sessionStorage.getItem('cherryspa_admin_ok') === '1') {
    overlay.classList.add('is-hidden');
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value === ADMIN_PASSCODE) {
      sessionStorage.setItem('cherryspa_admin_ok', '1');
      overlay.classList.add('is-hidden');
    } else {
      errorMsg.textContent = 'パスコードが違います。';
      input.value = '';
      input.focus();
    }
  });
}

/* ---------- 3. 状態管理とプレビュー反映 ---------- */
const DRAFT_KEY = 'cherryspa_content_draft';

// state の初期値（content.json の構造と一致させる）
let state = {
  text: {},
  images: {},
  imageSettings: {},
  visibility: {},
  links: { phone_number: '', line_url: '' },
  therapists: [],
  sns: [],
  news: [],
  gallery: [],
};

function pushPreview() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('プレビューの更新に失敗しました', e);
  }
  // 同一タブ内の <iframe> はstorageイベントを受け取れるため、
  // ここで明示的に手動発火は不要（別ブラウジングコンテキストとして検知される）
  const frame = document.getElementById('previewFrame');
  if (frame && frame.contentWindow) {
    try {
      frame.contentWindow.dispatchEvent(new StorageEvent('storage', { key: DRAFT_KEY }));
    } catch (e) {
      /* 一部ブラウザではStorageEventの手動生成に制限があるため、失敗しても致命的ではない */
    }
  }
}

function resetPreview() {
  localStorage.removeItem(DRAFT_KEY);
  const frame = document.getElementById('previewFrame');
  if (frame) frame.src = frame.src; // リロードしてcontent.json本来の内容に戻す
}

/* ---------- 4. UI構築 ---------- */
function buildTextTab() {
  const container = document.getElementById('textTabContent');
  container.innerHTML = '';

  TEXT_GROUPS.forEach((group) => {
    const details = document.createElement('details');
    details.className = 'field-group';
    details.open = true;

    const summary = document.createElement('summary');
    summary.textContent = group.group;
    details.appendChild(summary);

    const body = document.createElement('div');
    body.className = 'field-group-body';

    group.fields.forEach((field) => {
      const row = document.createElement('label');
      row.className = 'field-row';

      const labelText = document.createElement('span');
      labelText.className = 'field-label';
      labelText.textContent = field.label;
      row.appendChild(labelText);

      let input;
      if (field.type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 3;
      } else {
        input = document.createElement('input');
        input.type = 'text';
      }
      input.className = 'field-input';

      if (group.special === 'links') {
        input.value = state.links[field.key] || '';
        input.addEventListener('input', () => {
          state.links[field.key] = input.value;
          pushPreview();
        });
      } else {
        input.value = state.text[field.key] || '';
        input.addEventListener('input', () => {
          state.text[field.key] = input.value;
          pushPreview();
        });
      }

      row.appendChild(input);
      body.appendChild(row);
    });

    details.appendChild(body);
    container.appendChild(details);
  });
}

function buildVisibilityTab() {
  const container = document.getElementById('visibilityTabContent');
  container.innerHTML = '';

  const intro = document.createElement('p');
  intro.className = 'tab-intro';
  intro.textContent = 'OFFにした項目は、サイト上から非表示になります（ヘッダー・フッター本体・ファーストビューは常に表示されます）。';
  container.appendChild(intro);

  const renderGroup = (groupLabel, items) => {
    const heading = document.createElement('p');
    heading.className = 'visibility-group-heading';
    heading.textContent = groupLabel;
    container.appendChild(heading);

    items.forEach((item) => {
      const row = document.createElement('label');
      row.className = 'toggle-row';

      const span = document.createElement('span');
      span.textContent = item.label;

      const switchLabel = document.createElement('span');
      switchLabel.className = 'switch';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = state.visibility[item.key] !== false;
      const slider = document.createElement('span');
      slider.className = 'switch-slider';

      input.addEventListener('change', () => {
        state.visibility[item.key] = input.checked;
        pushPreview();
      });

      switchLabel.appendChild(input);
      switchLabel.appendChild(slider);
      row.appendChild(span);
      row.appendChild(switchLabel);
      container.appendChild(row);
    });
  };

  renderGroup('ページセクション', SECTION_TOGGLES);
  renderGroup('ファーストビューのバッジ', HERO_BADGE_TOGGLES);
  renderGroup('アイコン・SNS・フッター列', MISC_TOGGLES);
  renderGroup('ヘッダーメニュー項目', HEADER_NAV_TOGGLES);
  renderGroup('フッターメニュー項目', FOOTER_NAV_TOGGLES);
}

/* ---------- 4-2. リスト管理（セラピスト／SNS：追加・編集・削除） ---------- */

// 汎用の「追加・削除できるリスト」を1件ずつカード形式で描画する
function buildListManager(container, stateKey, config) {
  container.innerHTML = '';

  if (!Array.isArray(state[stateKey])) state[stateKey] = [];
  const list = state[stateKey];

  const intro = document.createElement('p');
  intro.className = 'tab-intro';
  intro.textContent = config.intro;
  container.appendChild(intro);

  list.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'list-item-card';

    const header = document.createElement('div');
    header.className = 'list-item-header';
    const title = document.createElement('span');
    title.textContent = config.itemLabel(item, index);
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'list-item-delete';
    delBtn.textContent = '削除';
    delBtn.addEventListener('click', () => {
      if (!confirm(`「${config.itemLabel(item, index)}」を削除しますか？`)) return;
      list.splice(index, 1);
      buildListManager(container, stateKey, config);
      pushPreview();
    });
    header.appendChild(title);
    header.appendChild(delBtn);
    card.appendChild(header);

    // 画像ドロップゾーン（設定されている場合のみ）
    if (config.hasImage) {
      const dropzone = document.createElement('div');
      dropzone.className = 'dropzone list-item-dropzone';
      dropzone.tabIndex = 0;

      const img = document.createElement('img');
      img.src = item.image || '';
      img.alt = config.itemLabel(item, index);
      dropzone.appendChild(img);

      const hint = document.createElement('span');
      hint.className = 'dropzone-hint';
      hint.textContent = 'ドラッグ＆ドロップ / クリックして選択';
      dropzone.appendChild(hint);

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.className = 'sr-only-input';

      const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
          item.image = reader.result;
          img.src = reader.result;
          pushPreview();
        };
        reader.readAsDataURL(file);
      };

      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') fileInput.click();
      });
      fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));
      dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('is-dragover'); });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragover'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('is-dragover');
        handleFile(e.dataTransfer.files[0]);
      });

      card.appendChild(dropzone);
      card.appendChild(fileInput);

      const proxySettings = {
        scale: item.imageScale != null ? item.imageScale : 1,
        posX: item.imagePosX != null ? item.imagePosX : 50,
        posY: item.imagePosY != null ? item.imagePosY : 50,
      };
      card.appendChild(buildImageAdjustControls(img, proxySettings, () => {
        item.imageScale = proxySettings.scale;
        item.imagePosX = proxySettings.posX;
        item.imagePosY = proxySettings.posY;
        pushPreview();
      }));
    }

    // テキストフィールド群
    config.fields.forEach((field) => {
      const row = document.createElement('label');
      row.className = 'field-row';
      const labelText = document.createElement('span');
      labelText.className = 'field-label';
      labelText.textContent = field.label;
      row.appendChild(labelText);

      let input;
      if (field.type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 3;
      } else {
        input = document.createElement('input');
        input.type = 'text';
      }
      input.className = 'field-input';
      input.value = item[field.key] || '';
      input.addEventListener('input', () => {
        item[field.key] = input.value;
        title.textContent = config.itemLabel(item, index);
        pushPreview();
      });
      row.appendChild(input);
      card.appendChild(row);
    });

    container.appendChild(card);
  });

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn-secondary list-add-btn';
  addBtn.textContent = config.addLabel;
  addBtn.addEventListener('click', () => {
    list.push(config.emptyItem());
    buildListManager(container, stateKey, config);
    pushPreview();
  });
  container.appendChild(addBtn);
}

const THERAPIST_LIST_CONFIG = {
  intro: 'セラピストの追加・編集・削除ができます。トップページには先頭から最大3名がプレビュー表示され、専用ページ（therapist.html）には全員が表示されます。並び順を変えたい場合は、項目を削除して追加し直すことで順序を調整してください。',
  hasImage: true,
  addLabel: '＋ セラピストを追加',
  itemLabel: (item, index) => item.name || `セラピスト${index + 1}（名前未入力）`,
  emptyItem: () => ({ name: '', role: '', bio: '', comment: '', image: '' }),
  fields: [
    { key: 'name', label: '名前', type: 'text' },
    { key: 'role', label: '役職', type: 'text' },
    { key: 'bio', label: 'プロフィール本文（専用ページ用）', type: 'textarea' },
    { key: 'comment', label: 'コメント', type: 'textarea' },
  ],
};

const SNS_LIST_CONFIG = {
  intro: 'SNS一覧ページ（sns.html）に表示するリンクの追加・編集・削除ができます。',
  hasImage: false,
  addLabel: '＋ SNSリンクを追加',
  itemLabel: (item, index) => item.label || `リンク${index + 1}（未入力）`,
  emptyItem: () => ({ label: '', url: '' }),
  fields: [
    { key: 'label', label: '表示名（例：Instagram）', type: 'text' },
    { key: 'url', label: 'リンクURL', type: 'text' },
  ],
};

const NEWS_LIST_CONFIG = {
  intro: 'トップページの「お知らせ」欄に表示される項目を追加・編集・削除できます。上に追加したものほど下に表示されるため、新しいお知らせほど後で追加してください。',
  hasImage: false,
  addLabel: '＋ お知らせを追加',
  itemLabel: (item, index) => item.title || `お知らせ${index + 1}（未入力）`,
  emptyItem: () => ({ date: '', title: '', body: '' }),
  fields: [
    { key: 'date', label: '日付（例：2026.08.01）', type: 'text' },
    { key: 'title', label: 'タイトル', type: 'text' },
    { key: 'body', label: '本文', type: 'textarea' },
  ],
};

const GALLERY_LIST_CONFIG = {
  intro: '店内紹介（トップページ）に表示する写真の追加・編集・削除ができます。枚数は自由に増減でき、各写真の下にキャプション（説明文）とリンク先を設定できます。',
  hasImage: true,
  addLabel: '＋ 写真を追加',
  itemLabel: (item, index) => item.caption || `写真${index + 1}（キャプション未入力）`,
  emptyItem: () => ({ image: '', caption: '', link: '' }),
  fields: [
    { key: 'caption', label: 'キャプション（写真の下に表示するテキスト）', type: 'text' },
    { key: 'link', label: 'リンク先URL（空欄ならリンクなし）', type: 'text' },
  ],
};

function buildListTab() {
  const staffContainer = document.getElementById('staffListContainer');
  const snsContainer = document.getElementById('snsListContainer');
  const newsContainer = document.getElementById('newsListContainer');
  const galleryContainer = document.getElementById('galleryListContainer');
  if (staffContainer) buildListManager(staffContainer, 'therapists', THERAPIST_LIST_CONFIG);
  if (snsContainer) buildListManager(snsContainer, 'sns', SNS_LIST_CONFIG);
  if (newsContainer) buildListManager(newsContainer, 'news', NEWS_LIST_CONFIG);
  if (galleryContainer) buildListManager(galleryContainer, 'gallery', GALLERY_LIST_CONFIG);
}

// 画像要素にズーム率・表示位置を反映する（管理画面プレビュー用サムネイルにも使う）
function applyImageTransformToEl(imgEl, settings) {
  const posX = settings.posX != null ? settings.posX : 50;
  const posY = settings.posY != null ? settings.posY : 50;
  const scale = settings.scale != null ? settings.scale : 1;
  imgEl.style.objectPosition = `${posX}% ${posY}%`;
  imgEl.style.transformOrigin = `${posX}% ${posY}%`;
  imgEl.style.transform = `scale(${scale})`;
  imgEl.style.objectFit = 'cover';
}

// ズーム／横位置／縦位置の3つのスライダーをまとめて生成する
function buildImageAdjustControls(imgEl, settings, onChange) {
  const wrap = document.createElement('div');
  wrap.className = 'image-adjust';

  const rows = [
    { label: 'ズーム', key: 'scale', min: 1, max: 2.5, step: 0.05 },
    { label: '横位置', key: 'posX', min: 0, max: 100, step: 1 },
    { label: '縦位置', key: 'posY', min: 0, max: 100, step: 1 },
  ];

  rows.forEach((row) => {
    const line = document.createElement('label');
    line.className = 'image-adjust-row';
    const labelSpan = document.createElement('span');
    labelSpan.textContent = row.label;
    const input = document.createElement('input');
    input.type = 'range';
    input.min = row.min;
    input.max = row.max;
    input.step = row.step;
    input.value = settings[row.key] != null ? settings[row.key] : (row.key === 'scale' ? 1 : 50);
    input.addEventListener('input', () => {
      settings[row.key] = parseFloat(input.value);
      applyImageTransformToEl(imgEl, settings);
      onChange();
    });
    line.appendChild(labelSpan);
    line.appendChild(input);
    wrap.appendChild(line);
  });

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'image-adjust-reset';
  resetBtn.textContent = '位置・ズームをリセット';
  resetBtn.addEventListener('click', () => {
    settings.scale = 1;
    settings.posX = 50;
    settings.posY = 50;
    wrap.querySelectorAll('input[type="range"]').forEach((input, i) => {
      input.value = rows[i].key === 'scale' ? 1 : 50;
    });
    applyImageTransformToEl(imgEl, settings);
    onChange();
  });
  wrap.appendChild(resetBtn);

  applyImageTransformToEl(imgEl, settings);
  return wrap;
}

function buildImageTab() {
  const container = document.getElementById('imageTabContent');
  container.innerHTML = '';

  const intro = document.createElement('p');
  intro.className = 'tab-intro';
  intro.innerHTML =
    '既存の写真の上に、新しい画像ファイルをドラッグ＆ドロップすると差し替わります。<br>' +
    '（クリックしてファイルを選ぶこともできます）画像はJPEG等に圧縮してから使うと、保存ファイルが軽くなります。';
  container.appendChild(intro);

  const grid = document.createElement('div');
  grid.className = 'image-grid';

  IMAGE_FIELDS.forEach((field) => {
    const cell = document.createElement('div');
    cell.className = 'image-cell';

    const label = document.createElement('p');
    label.className = 'image-cell-label';
    label.textContent = field.label;

    const dropzone = document.createElement('div');
    dropzone.className = 'dropzone';
    dropzone.tabIndex = 0;

    const img = document.createElement('img');
    img.src = state.images[field.key] || '';
    img.alt = field.label;
    dropzone.appendChild(img);

    const hint = document.createElement('span');
    hint.className = 'dropzone-hint';
    hint.textContent = 'ドラッグ＆ドロップ / クリックして選択';
    dropzone.appendChild(hint);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.className = 'sr-only-input';

    const handleFile = (file) => {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        state.images[field.key] = reader.result;
        img.src = reader.result;
        pushPreview();
      };
      reader.readAsDataURL(file);
    };

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') fileInput.click();
    });
    fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
      handleFile(e.dataTransfer.files[0]);
    });

    // URLを直接指定したい場合の入力欄（base64にしたくない場合の代替手段）
    const urlRow = document.createElement('input');
    urlRow.type = 'text';
    urlRow.className = 'field-input image-url-input';
    urlRow.placeholder = '画像URLを直接入力することもできます';
    urlRow.value = (state.images[field.key] || '').startsWith('data:') ? '' : (state.images[field.key] || '');
    urlRow.addEventListener('change', () => {
      if (urlRow.value.trim()) {
        state.images[field.key] = urlRow.value.trim();
        img.src = urlRow.value.trim();
        pushPreview();
      }
    });

    cell.appendChild(label);
    cell.appendChild(dropzone);
    cell.appendChild(fileInput);
    cell.appendChild(urlRow);

    if (!state.imageSettings[field.key]) {
      state.imageSettings[field.key] = { scale: 1, posX: 50, posY: 50 };
    }
    cell.appendChild(buildImageAdjustControls(img, state.imageSettings[field.key], pushPreview));

    grid.appendChild(cell);
  });

  container.appendChild(grid);
}

function switchTab(tabName) {
  document.querySelectorAll('.admin-tab').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('is-active', panel.id === `${tabName}TabContent`);
  });
}

/* ---------- 5. 保存（ダウンロード）／読み込み ---------- */
function downloadContentJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'content.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function loadContentJsonFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      state = {
        text: data.text || {},
        images: data.images || {},
        imageSettings: data.imageSettings || {},
        visibility: data.visibility || {},
        links: data.links || { phone_number: '', line_url: '' },
        therapists: data.therapists || [],
        sns: data.sns || [],
        news: data.news || [],
        gallery: data.gallery || [],
      };
      buildTextTab();
      buildImageTab();
      buildVisibilityTab();
      buildListTab();
      pushPreview();
      alert('content.json を読み込みました。');
    } catch (e) {
      alert('ファイルの読み込みに失敗しました。正しい content.json を選択してください。');
    }
  };
  reader.readAsText(file);
}

function tryAutoLoadContentJson() {
  fetch('content.json', { cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .then((data) => {
      state = {
        text: data.text || {},
        images: data.images || {},
        imageSettings: data.imageSettings || {},
        visibility: data.visibility || {},
        links: data.links || { phone_number: '', line_url: '' },
        therapists: data.therapists || [],
        sns: data.sns || [],
        news: data.news || [],
        gallery: data.gallery || [],
      };
      buildTextTab();
      buildImageTab();
      buildVisibilityTab();
      buildListTab();
      pushPreview();
    })
    .catch(() => {
      // 自動読み込みできない場合は空の状態のまま。手動で「content.jsonを読み込む」を使う。
      buildTextTab();
      buildImageTab();
      buildVisibilityTab();
      buildListTab();
    });
}

/* ---------- 5-2. GitHub連携（頻繁な編集を手軽にするための自動公開） ---------- */
const GH_CONFIG_KEY = 'cherryspa_github_config';

function loadGithubConfig() {
  try {
    const raw = localStorage.getItem(GH_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* 破損時はデフォルトへフォールバック */ }
  return { repo: '', branch: 'main', path: 'content.json', token: '' };
}

function saveGithubConfigFromForm() {
  const cfg = {
    repo: document.getElementById('ghRepoInput').value.trim(),
    branch: document.getElementById('ghBranchInput').value.trim() || 'main',
    path: document.getElementById('ghPathInput').value.trim() || 'content.json',
    token: document.getElementById('ghTokenInput').value.trim(),
  };
  localStorage.setItem(GH_CONFIG_KEY, JSON.stringify(cfg));
  const statusEl = document.getElementById('githubStatus');
  statusEl.textContent = 'GitHub設定を保存しました。';
  statusEl.className = 'github-status is-success';
}

function fillGithubConfigForm() {
  const cfg = loadGithubConfig();
  document.getElementById('ghRepoInput').value = cfg.repo || '';
  document.getElementById('ghBranchInput').value = cfg.branch || 'main';
  document.getElementById('ghPathInput').value = cfg.path || 'content.json';
  document.getElementById('ghTokenInput').value = cfg.token || '';
}

// UTF-8文字列をbase64へ変換（日本語を含むJSONを安全にエンコードするため）
function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

async function publishToGitHub() {
  const cfg = loadGithubConfig();
  const statusEl = document.getElementById('githubStatus');

  if (!cfg.repo || !cfg.token) {
    statusEl.textContent = '先に「GitHub連携設定」でリポジトリ名とトークンを入力し、保存してください。';
    statusEl.className = 'github-status is-error';
    return;
  }

  statusEl.textContent = '公開中…';
  statusEl.className = 'github-status';

  const apiBase = `https://api.github.com/repos/${cfg.repo}/contents/${cfg.path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

  try {
    // 1. 現在のファイルのsha（存在する場合）を取得
    let sha;
    const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(cfg.branch)}`, {
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: 'application/vnd.github+json',
      },
    });
    if (getRes.ok) {
      const getData = await getRes.json();
      sha = getData.sha;
    } else if (getRes.status !== 404) {
      const errData = await getRes.json().catch(() => ({}));
      throw new Error(errData.message || `ファイル取得に失敗しました（HTTP ${getRes.status}）`);
    }

    // 2. 新しい内容をコミット
    const contentStr = JSON.stringify(state, null, 2);
    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `管理画面から更新 (${new Date().toLocaleString('ja-JP')})`,
        content: utf8ToBase64(contentStr),
        branch: cfg.branch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      throw new Error(errData.message || `保存に失敗しました（HTTP ${putRes.status}）`);
    }

    statusEl.textContent = '公開しました。Netlifyが自動的に再デプロイします（30秒〜1分程度お待ちください）。';
    statusEl.className = 'github-status is-success';
  } catch (e) {
    statusEl.textContent = `エラー: ${e.message}`;
    statusEl.className = 'github-status is-error';
  }
}

/* ---------- 初期化 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  checkPasscode();

  tryAutoLoadContentJson();
  fillGithubConfigForm();

  document.querySelectorAll('.admin-tab').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('saveBtn').addEventListener('click', downloadContentJson);
  document.getElementById('resetPreviewBtn').addEventListener('click', resetPreview);
  document.getElementById('saveGhConfigBtn').addEventListener('click', saveGithubConfigFromForm);
  document.getElementById('publishGhBtn').addEventListener('click', publishToGitHub);

  const loadInput = document.getElementById('loadFileInput');
  document.getElementById('loadBtn').addEventListener('click', () => loadInput.click());
  loadInput.addEventListener('change', () => {
    if (loadInput.files[0]) loadContentJsonFile(loadInput.files[0]);
  });
});

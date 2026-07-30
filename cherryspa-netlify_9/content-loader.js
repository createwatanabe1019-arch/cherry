/* ==================================================================
   CHERRY SPA - content-loader.js
   管理画面（admin.html）で編集した内容をサイトに反映するための読み込みスクリプト。

   仕組み：
   1. 通常の閲覧時：同じフォルダの content.json を読み込み、
      テキスト・画像・表示/非表示・電話番号/LINEリンクを書き換える。
      content.json が無い/読み込めない場合は、HTMLに書かれている
      初期値がそのまま表示される（安全なフォールバック）。
   2. 管理画面プレビュー時：admin.html で編集中の内容は
      localStorage の "cherryspa_content_draft" に一時保存されており、
      これが存在する場合はそちらを優先して反映する（content.jsonへの
      保存前でも、リアルタイムに見た目を確認できるようにするため）。
   ================================================================== */

(function () {
  var DRAFT_KEY = 'cherryspa_content_draft';

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
  }

  // ---- セラピスト一覧の動的レンダリング（トップページのプレビュー／専用ページの全件） ----
  function renderTherapists(list) {
    list = list || [];
    var previewEl = document.querySelector('[data-therapist-container="preview"]');
    var fullEl = document.querySelector('[data-therapist-container="full"]');
    if (!previewEl && !fullEl) return;

    function cardHtml(t, full) {
      var img = t.image || 'https://picsum.photos/seed/therapist-placeholder/500/560';
      var bioHtml = full ? '<p class="therapist-bio">' + escapeHtml(t.bio || '') + '</p>' : '';
      return (
        '<article class="therapist-card reveal in-view">' +
          '<img src="' + escapeHtml(img) + '" alt="セラピスト ' + escapeHtml(t.name || '') + '" loading="lazy" width="500" height="560">' +
          '<div class="therapist-body">' +
            '<h3>' + escapeHtml(t.name || '') + '</h3>' +
            '<p class="therapist-role">' + escapeHtml(t.role || '') + '</p>' +
            bioHtml +
            '<p class="therapist-comment">' + escapeHtml(t.comment || '') + '</p>' +
          '</div>' +
        '</article>'
      );
    }

    if (previewEl) {
      previewEl.innerHTML = list.slice(0, 3).map(function (t) { return cardHtml(t, false); }).join('');
    }
    if (fullEl) {
      fullEl.innerHTML = list.map(function (t) { return cardHtml(t, true); }).join('');
    }
  }

  // ---- SNS一覧の動的レンダリング（sns.html） ----
  function renderSns(list) {
    list = list || [];
    var el = document.querySelector('[data-sns-container]');
    if (!el) return;
    el.innerHTML = list.map(function (s) {
      return (
        '<a class="sns-list-item reveal in-view" href="' + escapeHtml(s.url || '#') + '" target="_blank" rel="noopener">' +
          '<span>' + escapeHtml(s.label || '') + '</span>' +
          '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
        '</a>'
      );
    }).join('');
  }

  function applyContent(data) {
    if (!data) return;

    // ---- セラピスト一覧・SNS一覧（動的リスト） ----
    renderTherapists(data.therapists);
    renderSns(data.sns);

    // ---- テキスト ----
    if (data.text) {
      document.querySelectorAll('[data-key]').forEach(function (el) {
        var key = el.dataset.key;
        if (Object.prototype.hasOwnProperty.call(data.text, key)) {
          if (el.dataset.html === 'true') {
            el.innerHTML = data.text[key];
          } else {
            el.textContent = data.text[key];
          }
        }
      });
    }

    // ---- 画像 ----
    if (data.images) {
      document.querySelectorAll('[data-img-key]').forEach(function (el) {
        var key = el.dataset.imgKey;
        if (data.images[key]) {
          el.src = data.images[key];
        }
      });
    }

    // ---- セクション表示/非表示 ----
    if (data.visibility) {
      document.querySelectorAll('[data-section-key]').forEach(function (el) {
        var key = el.dataset.sectionKey;
        el.style.display = (data.visibility[key] === false) ? 'none' : '';
      });
      // ヘッダー／フッターのナビ項目（同じvisibilityオブジェクトを共有）
      document.querySelectorAll('[data-nav-key]').forEach(function (el) {
        var key = el.dataset.navKey;
        if (Object.prototype.hasOwnProperty.call(data.visibility, key)) {
          el.style.display = (data.visibility[key] === false) ? 'none' : '';
        }
      });
    }

    // ---- 電話番号・LINE URL・WEB予約リンク（サイト内の該当リンクへ一括反映） ----
    if (data.links) {
      if (data.links.phone_number) {
        var digits = data.links.phone_number.replace(/[^0-9+]/g, '');
        document.querySelectorAll('[data-tel-link]').forEach(function (a) {
          a.href = 'tel:' + digits;
        });
        // 電話番号を文字として表示している箇所（アクセス欄など）も同時に更新
        document.querySelectorAll('[data-key="phone_display"]').forEach(function (el) {
          el.textContent = data.links.phone_number;
        });
      }
      if (data.links.line_url) {
        document.querySelectorAll('[data-line-link]').forEach(function (a) {
          a.href = data.links.line_url;
        });
      }
      if (data.links.web_reservation_url) {
        document.querySelectorAll('[data-web-link]').forEach(function (a) {
          a.href = data.links.web_reservation_url;
        });
      }
      if (data.links.therapist_page_url) {
        document.querySelectorAll('[data-therapist-link]').forEach(function (a) {
          a.href = data.links.therapist_page_url;
        });
      }
      if (data.links.instagram_url) {
        document.querySelectorAll('[data-instagram-link]').forEach(function (a) {
          a.href = data.links.instagram_url;
        });
      }
      if (data.links.google_map_url) {
        document.querySelectorAll('[data-map-link]').forEach(function (a) {
          a.href = data.links.google_map_url;
        });
      }
      // ギャラリー画像の個別リンク（gallery1_link 〜 gallery6_link）
      document.querySelectorAll('[data-gallery-link]').forEach(function (a) {
        var linkKey = a.dataset.galleryLink + '_link';
        if (data.links[linkKey]) {
          a.href = data.links[linkKey];
        }
      });
      // X（旧Twitter）プロフィールへのリンク
      if (data.links.x_username) {
        var xUsername = data.links.x_username.replace(/^@/, '').trim();
        if (xUsername) {
          document.querySelectorAll('[data-x-link]').forEach(function (a) {
            a.href = 'https://x.com/' + encodeURIComponent(xUsername);
          });
        }
      }
    }
  }

  function loadDraftFromStorage() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        applyContent(JSON.parse(raw));
        return true;
      }
    } catch (e) {
      /* JSON破損時などは無視してcontent.jsonにフォールバック */
    }
    return false;
  }

  document.addEventListener('DOMContentLoaded', function () {
    // 管理画面プレビュー中（下書きあり）はそちらを優先し、content.jsonの取得は行わない
    var usedDraft = loadDraftFromStorage();

    if (!usedDraft) {
      fetch('content.json', { cache: 'no-store' })
        .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
        .then(applyContent)
        .catch(function () {
          /* content.json が無い場合はHTMLの初期値のまま表示（正常動作） */
        });
    }

    // 管理画面で編集中は、同一ブラウザの別ウィンドウ/iframeにも
    // storageイベントで即座に変更が伝わる
    window.addEventListener('storage', function (e) {
      if (e.key === DRAFT_KEY) {
        loadDraftFromStorage();
      }
    });
  });
})();

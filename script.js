/* ==================================================================
   CIEL SPA - script.js
   すべて vanilla JS。外部ライブラリ非依存で表示速度を優先。
   目次:
   1. ローディング画面の制御
   2. ヘッダーのスクロール挙動 & ハンバーガーメニュー
   3. スクロール連動フェードイン（IntersectionObserver）
   4. パララックス（ヒーロー / CTA背景）
   5. 施術メニュー：タブ切り替え
   6. FAQ：アコーディオン
   7. スムーススクロール時のモバイルメニュー自動クローズ
   ================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. ローディング画面の制御 ---------- */
  const loader = document.getElementById('loader');
  const hideLoader = () => {
    if (!loader) return;
    loader.classList.add('is-hidden');
    // アニメーション終了後にDOMから外し、操作の邪魔にならないようにする
    setTimeout(() => loader.remove(), 700);
  };

  // content.json の読み込み・画像差し替え（content-loader.js）が完了してから
  // ローディング画面を消すことで、「デフォルト画像→最新画像」の一瞬の切り替わりを見せない。
  // ただし通信が遅い場合に画面が固まって見えないよう、最大2.5秒で必ず消すセーフティを設ける。
  let windowLoaded = false;
  let contentReady = false;
  const maybeHideLoader = () => {
    if (windowLoaded && contentReady) hideLoader();
  };
  window.addEventListener('load', () => { windowLoaded = true; maybeHideLoader(); });
  window.addEventListener('cherryspa:contentready', () => { contentReady = true; maybeHideLoader(); });
  setTimeout(hideLoader, 2500); // セーフティネット（最大待機時間）


  /* ---------- 2. ヘッダーのスクロール挙動 & ハンバーガーメニュー ---------- */
  const header = document.getElementById('siteHeader');
  const gnav = document.getElementById('gnav');
  const hamburger = document.getElementById('hamburger');

  const onScrollHeader = () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  const toggleMenu = (forceClose = false) => {
    const willOpen = forceClose ? false : !gnav.classList.contains('is-open');
    gnav.classList.toggle('is-open', willOpen);
    hamburger.classList.toggle('is-open', willOpen);
    hamburger.setAttribute('aria-expanded', String(willOpen));
    document.body.style.overflow = willOpen ? 'hidden' : '';
  };

  if (hamburger) {
    hamburger.addEventListener('click', () => toggleMenu());
  }
  // ナビゲーションリンクをタップしたら自動でメニューを閉じる（スマホの導線を短くする）
  gnav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(true));
  });


  /* ---------- 3. スクロール連動フェードイン ---------- */
  const revealTargets = document.querySelectorAll('.reveal, .section-title');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    revealTargets.forEach(el => el.classList.add('in-view'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 要素ごとにわずかな遅延をつけ、セクション内で順番に浮かび上がる演出にする
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add('in-view'), delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach((el, i) => {
      // 同一セクション内カードに軽いスタガー（ずらし）を付与
      el.dataset.delay = (i % 3) * 90;
      io.observe(el);
    });
  }


  /* ---------- 4. パララックス（ヒーロー / CTA背景） ---------- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (!prefersReducedMotion && parallaxEls.length) {
    let ticking = false;
    const updateParallax = () => {
      parallaxEls.forEach(el => {
        const rect = el.parentElement.getBoundingClientRect();
        // 画面内にある要素のみ計算し、負荷を抑える
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const offset = rect.top * 0.18;
          el.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }


  /* ---------- 5. FAQ：アコーディオン ---------- */
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    const panel = btn.nextElementSibling;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // 他の項目は開いたままにする仕様（複数閲覧しやすくするため意図的にアコーディオン単独開閉）
      btn.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = isOpen ? '0px' : panel.scrollHeight + 'px';
    });
  });


  /* ---------- 7. アンカーリンクのヘッダー分オフセット調整は CSS の scroll-padding-top で対応済み ---------- */

});

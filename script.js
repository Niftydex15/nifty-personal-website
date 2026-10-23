    /* =============================================================
       JAVASCRIPT — photo preview, typing, colors, tabs, game & progress
       Everything works without Wi-Fi or external libraries.
       ============================================================= */
    'use strict';
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => Array.from(document.querySelectorAll(selector));
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('#year').textContent = new Date().getFullYear();

    // PROFILE PHOTO: Save images/profile.jpg in your project folder.
    // The preview button only changes the photo temporarily; to keep it, save the file.
    // Visitors can also preview a photo using the visible button.
    const portrait = $('#portrait');
    const fallback = $('#portraitFallback');
    const updatePortrait = () => { portrait.style.display = 'block'; fallback.style.display = 'none'; };
    portrait.addEventListener('load', updatePortrait);
    portrait.addEventListener('error', () => { portrait.style.display = 'none'; fallback.style.display = 'flex'; });
    if (portrait.complete && portrait.naturalWidth > 0) updatePortrait();
    // Optional photo-preview button. Safe even if removed from index.html.
    const photoInput = $('#photoInput');
    const uploadLabel = $('.photo-upload');
    if (photoInput) {
      photoInput.addEventListener('change', (event) => {
        const photo = event.target.files && event.target.files[0];
        if (photo && photo.type.startsWith('image/')) {
          portrait.src = URL.createObjectURL(photo);
          if (uploadLabel) uploadLabel.textContent = '✓ Photo selected';
        }
      });
    }
    if (photoInput && uploadLabel) {
      uploadLabel.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          photoInput.click();
        }
      });
    }

    // Accessible little typewriter. Static text is already present in HTML.
    const roles = ['a creative soul.', 'a working scholar.', 'an R&B enthusiast.', 'a casual photographer.', 'a Marvel superfan.', 'still learning every day.']; // EDIT MY ROTATING INTRO HERE
    if (!reduceMotion) {
      const el = $('#typedRole');
      let roleIndex = 0, charIndex = 0, deleting = false;
      function typeStep() {
        const phrase = roles[roleIndex];
        el.textContent = phrase.slice(0, charIndex);
        if (!deleting && charIndex < phrase.length) { charIndex++; setTimeout(typeStep, 75); }
        else if (!deleting) { deleting = true; setTimeout(typeStep, 1650); }
        else if (charIndex > 0) { charIndex--; setTimeout(typeStep, 35); }
        else { deleting = false; roleIndex = (roleIndex + 1) % roles.length; setTimeout(typeStep, 220); }
      }
      setTimeout(typeStep, 900);
    }

    // Accent-color toggle, saved in browser when possible.
    try { if (localStorage.getItem('niftyTheme') === 'gold') document.body.classList.add('alt-theme'); } catch (_) {}
    $('#themeButton').addEventListener('click', () => {
      document.body.classList.toggle('alt-theme');
      try { localStorage.setItem('niftyTheme', document.body.classList.contains('alt-theme') ? 'gold' : 'maroon'); } catch (_) {}
    });

    // Live scroll-position bar.
    let scrollScheduled = false;
    function updateScroll() {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      $('#scrollProgress').style.width = Math.min(100, (scrollY / max) * 100) + '%';
      scrollScheduled = false;
    }
    addEventListener('scroll', () => { if (!scrollScheduled) { requestAnimationFrame(updateScroll); scrollScheduled = true; } }, {passive: true});
    updateScroll();

    // Small, optional mission encourages exploration without blocking navigation.
    const done = new Set();
    function progress(step) {
      done.add(step);
      const n = done.size;
      $('#questFill').style.width = (n / 3 * 100) + '%';
      $('#questProgress').setAttribute('aria-valuenow', String(n));
      $('#questCount').textContent = n === 3 ? '🏆 MISSION COMPLETE!' : `${n} / 3 DISCOVERIES`;
      if (n === 3) $('#questMessage').textContent = 'Achievement unlocked: You met the person behind the code!';
    }
    $('#questClose').addEventListener('click', () => { $('#quest').hidden = true; });
    // Tracker can be dismissed any time. The navigation stays fully usable.
    if ('IntersectionObserver' in window) {
      const aboutObserver = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) { progress('about'); aboutObserver.disconnect(); }
      }, {threshold: .25});
      aboutObserver.observe($('#about'));
    } else { progress('about'); }
    $$('.skill').forEach((card) => card.addEventListener('toggle', () => { if (card.open) progress('skill'); }));

    // Interest tabs, with keyboard arrow navigation.
    // EDIT INTEREST DESCRIPTIONS HERE — these are the clickable tabs.
    const interests = {
      marvel: {emoji: '🦸', label: 'Marvel mode: ON', heading: 'My brain lives in the multiverse.', text: "I probably know more about the Marvel universe than I know about myself. Ask me about my favorite heroes and I'll have a lot to say."},
      music: {emoji: '🎧', label: 'R&B mode: ON', heading: 'Music is always playing in my head.', text: 'I love R&B, especially Daniel Caesar and Rex Orange County. Singing is one of my hobbies. I even wrote an unreleased song once!'},
      games: {emoji: '🎮', label: 'Gaming mode: ON', heading: 'Just one more game...', text: "Video games help me relax, have fun, and sometimes forget what time it is. It's one of my favorite ways to unwind."},
      create: {emoji: '🎨', label: 'Creative mode: ON', heading: 'Give me an idea and I’ll edit it.', text: 'I enjoy making illustrations, digital layouts, and photo and video edits, including artwork for our association.'},
      camera: {emoji: '📸', label: 'Camera mode: ON', heading: 'I see memories through a lens.', text: "I'm a hobbyist photographer. I love capturing little moments and making everyday scenes feel special."}
    };
    function selectInterest(button, focus = false) {
      $$('.interest-tab').forEach((tab) => { const selected = tab === button; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; });
      const data = interests[button.dataset.interest];
      $('#interestEmoji').textContent = data.emoji;
      $('#interestLabel').textContent = data.label;
      $('#interestHeading').textContent = data.heading;
      $('#interestDescription').textContent = data.text;
      $('#interestPanel').setAttribute('aria-labelledby', button.id);
      if (focus) button.focus();
    }
    const tabs = $$('.interest-tab');
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectInterest(tab));
      tab.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); selectInterest(tabs[(index + 1) % tabs.length], true); }
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); selectInterest(tabs[(index + tabs.length - 1) % tabs.length], true); }
        if (event.key === 'Home') { event.preventDefault(); selectInterest(tabs[0], true); }
        if (event.key === 'End') { event.preventDefault(); selectInterest(tabs[tabs.length - 1], true); }
      });
    });

    // ============================================================
    // MINI QUIZ — Edit questions, options, and the correct answer.
    // You can add more questions here. Correct answer is zero-based.
    // ============================================================
    const quizQuestions = [
      { question: "What's my nickname?", options: ['Nix', 'Dex', 'Joshua Garcia'], answer: 1, fun: "That's me! Dex is what my friends can call me. 💗" },
      { question: 'What kind of music do I love?', options: ['R&B', 'Heavy metal', 'Classical'], answer: 0, fun: 'Daniel Caesar and Rex Orange County are on my playlist! 🎧' },
      { question: 'Which topic can I talk about for hours?', options: ['The stock market', 'Marvel', 'Cooking shows'], answer: 1, fun: 'Marvel lore lives rent-free in my head. 🦸' }
    ];
    let quizIndex = 0;
    let score = 0;
    let answered = false;
    const quizOptions = $('#quizOptions');
    function showQuestion() {
      answered = false;
      const q = quizQuestions[quizIndex];
      $('#questionCounter').textContent = `QUESTION ${quizIndex + 1} / ${quizQuestions.length}`;
      $('#quizScore').textContent = `${score} POINT${score === 1 ? '' : 'S'}`;
      $('#quizQuestion').textContent = q.question;
      $('#quizResult').textContent = 'Choose an answer ↑';
      $('#quizNext').hidden = true;
      $('#quizRestart').hidden = true;
      quizOptions.replaceChildren();
      q.options.forEach((answerText, i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'option';
        button.textContent = `${String.fromCharCode(65+i)}. ${answerText}`;
        button.addEventListener('click', () => answerQuiz(i, button));
        quizOptions.appendChild(button);
      });
    }
    function answerQuiz(index, button) {
      if (answered) return;
      answered = true;
      const q = quizQuestions[quizIndex];
      const correct = index === q.answer;
      // Easter egg: Joshua Garcia gives 100 funny bonus points. 😂
      if (quizIndex === 0 && index === 2) {
        score += 100;
      } else if (correct) {
        score++;
      }
      Array.from(quizOptions.children).forEach((option, i) => {
        option.disabled = true;
        if (i === q.answer) option.classList.add('correct');
        if (i === index && !correct) option.classList.add('wrong');
      });
      if (quizIndex === 0 && index === 2) {
        $('#quizResult').textContent =
          '😂 PLOT TWIST! Joshua Garcia?! Are you trying to flatter me? HAHAHA! You deserve 100 bonus points for that! 💗 But the real answer is Dex.';
      } else {
        $('#quizResult').textContent = correct ? `✓ ${q.fun}` : `Almost! ${q.fun}`;
      }
      $('#quizScore').textContent = `${score} POINT${score === 1 ? '' : 'S'}`;
      if (quizIndex < quizQuestions.length - 1) {
        $('#quizNext').hidden = false;
      } else {
        progress('quiz');
        $('#questionCounter').textContent = 'QUIZ COMPLETE 🎉';
        $('#quizQuestion').textContent = score > quizQuestions.length
          ? `You earned ${score} points! 😂`
          : `You got ${score} out of ${quizQuestions.length}!`;
        $('#quizResult').textContent = score === quizQuestions.length ? 'Perfect score! You know me already. 💗' : 'Now you know a little more about Fyne! Thanks for playing. 💗';
        $('#quizRestart').hidden = false;
        if (!reduceMotion) burstConfetti(button);
      }
    }
    $('#quizNext').addEventListener('click', () => { quizIndex++; showQuestion(); });
    $('#quizRestart').addEventListener('click', () => { quizIndex = 0; score = 0; showQuestion(); });
    showQuestion();

    // =============================================================
    // PHOTO GALLERY — ALL PHOTOS AT ONCE + CLICK TO ENLARGE
    // Edit the file paths below to match your images folders.
    // =============================================================
    const galleryAlbums = {
      'gallery-1.jpg': [
        'images/gallery-1.jpg',
        'images/personal/photo1.jpg',
        'images/personal/photo2.jpg',
        'images/personal/photo3.jpg'
      ],
      'gallery-2.jpg': [
        'images/gallery-2.jpg',
        'images/campus/photo1.jpg',
        'images/campus/photo2.jpg',
        'images/campus/photo3.jpg'
      ],
      'gallery-3.jpg': [
        'images/gallery-3.jpg',
        'images/photography/photo1.jpg',
        'images/photography/photo2.jpg',
        'images/photography/photo3.jpg'
      ],
      'gallery-4.jpg': [
        'images/gallery-4.jpg',
        'images/drawings/photo1.jpg',
        'images/drawings/photo2.jpg',
        'images/drawings/photo3.jpg'
      ]
    };

    const photoDialog = $('#photoDialog');
    if (!photoDialog) {
      console.warn('Missing #photoDialog in index.html.');
    } else {
      // Works with either your old gallery HTML or the newer album HTML.
      let galleryPhotoGrid = $('#galleryPhotoGrid');
      if (!galleryPhotoGrid) {
        galleryPhotoGrid = document.createElement('div');
        galleryPhotoGrid.id = 'galleryPhotoGrid';
        galleryPhotoGrid.className = 'album-grid';
        photoDialog.appendChild(galleryPhotoGrid);
      }
      galleryPhotoGrid.classList.add('album-grid');

      // Hide old single-photo elements, if they still exist.
      const oldDialogPhoto = $('#dialogPhoto');
      const oldDialogPlaceholder = $('#dialogPlaceholder');
      if (oldDialogPhoto) oldDialogPhoto.style.display = 'none';
      if (oldDialogPlaceholder) oldDialogPlaceholder.style.display = 'none';

      // Make the large-photo popup automatically if you have not
      // added its HTML yet. You don't need to edit index.html.
      let imagePreviewDialog = $('#imagePreviewDialog');
      if (!imagePreviewDialog) {
        imagePreviewDialog = document.createElement('dialog');
        imagePreviewDialog.id = 'imagePreviewDialog';
        imagePreviewDialog.setAttribute('aria-label', 'Large photo preview');
        imagePreviewDialog.innerHTML = `
          <button type="button" class="dialog-close" id="closeImagePreview"
            aria-label="Close large photo">×</button>
          <img id="expandedGalleryImage" alt="Selected gallery photo">
        `;
        document.body.appendChild(imagePreviewDialog);
      }
      const expandedGalleryImage = $('#expandedGalleryImage');
      const closeImagePreview = $('#closeImagePreview');

      function openLargePhoto(path, altText) {
        if (!expandedGalleryImage) return;
        expandedGalleryImage.src = path;
        expandedGalleryImage.alt = altText;
        if (!imagePreviewDialog.open) imagePreviewDialog.showModal();
      }

      // Closing the large image returns to the still-open album.
      if (closeImagePreview) {
        closeImagePreview.addEventListener('click', () => imagePreviewDialog.close());
      }
      imagePreviewDialog.addEventListener('click', (event) => {
        if (event.target === imagePreviewDialog) imagePreviewDialog.close();
      });

      // Build the album grid on each click.
      $$('.gallery-card').forEach((card) => {
        const thumbnail = card.querySelector('img');
        if (thumbnail) {
          const imageReady = () => card.classList.add('has-photo');
          const imageMissing = () => card.classList.remove('has-photo');
          thumbnail.addEventListener('load', imageReady);
          thumbnail.addEventListener('error', imageMissing);
          if (thumbnail.complete && thumbnail.naturalWidth > 0) imageReady();
        }

        card.addEventListener('click', () => {
          const filename = (card.dataset.image || '').split('/').pop();
          const photos = galleryAlbums[filename] || [card.dataset.image];
          $('#dialogTitle').textContent = card.dataset.title || 'My photos';
          $('#dialogCaption').textContent = card.dataset.caption || '';
          galleryPhotoGrid.replaceChildren();

          photos.filter(Boolean).forEach((photoPath, index) => {
            const photoButton = document.createElement('button');
            photoButton.type = 'button';
            photoButton.className = 'album-photo-button';
            photoButton.setAttribute('aria-label', `Enlarge photo ${index + 1}`);

            const image = document.createElement('img');
            image.className = 'album-photo';
            image.alt = `${card.dataset.title || 'Album'} — Photo ${index + 1}`;
            image.loading = 'eager';

            // Skip files that are not present in images/.
            image.addEventListener('error', () => {
              photoButton.remove();
              if (!galleryPhotoGrid.querySelector('.album-photo-button')) {
                galleryPhotoGrid.textContent =
                  'No photos found. Check your image paths and file extensions.';
              }
            });
            photoButton.addEventListener('click', () => {
              openLargePhoto(photoPath, image.alt);
            });
            photoButton.appendChild(image);
            galleryPhotoGrid.appendChild(photoButton);
            image.src = photoPath;
          });

          if (!photoDialog.open) photoDialog.showModal();
            photoDialog.scrollTop = 0;
        });
      });

      const dialogClose = $('#dialogClose');
      if (dialogClose) dialogClose.addEventListener('click', () => photoDialog.close());
      photoDialog.addEventListener('click', (event) => {
        if (event.target === photoDialog) photoDialog.close();
      });
    }

    function burstConfetti(target) {
      const rect = target.getBoundingClientRect();
      const symbols = ['✳', '★', '✦', '●', '◆', '⚡'];
      for (let i = 0; i < 22; i++) {
        const piece = document.createElement('span');
        piece.className = 'confetti';
        piece.textContent = symbols[i % symbols.length];
        piece.style.color = ['#ffa0b8','#e1b6ff','#ffcf85','#d7b3ff'][i % 4];
        piece.style.left = (rect.left + rect.width * (.2 + Math.random() * .6)) + 'px';
        piece.style.top = (rect.top + 10) + 'px';
        piece.style.setProperty('--tx', (Math.random() * 360 - 180) + 'px');
        piece.style.setProperty('--ty', (Math.random() * -280 - 30) + 'px');
        piece.style.setProperty('--rot', (Math.random() * 600 - 300) + 'deg');
        document.body.appendChild(piece);
        piece.addEventListener('animationend', () => piece.remove(), {once: true});
      }
    }

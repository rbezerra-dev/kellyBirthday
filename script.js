document.addEventListener('DOMContentLoaded', () => {
    const giftWrapper = document.getElementById('gift-wrapper');
    const giftBow = document.getElementById('gift-bow'); // O Bilhete
    const appContainer = document.getElementById('app-container');
    const btnStart = document.getElementById('btn-start');
    const muteBtn = document.getElementById('mute-btn');
    const screens = document.querySelectorAll('.screen');
    const dynamicTicker = document.getElementById('dynamic-ticker');
    
    let isMuted = false;
    let hasStarted = false; 

    // Variáveis do Sistema Ping-Pong (Resolve limite de áudio)
    let activePlayer = document.getElementById('player-a');
    let inactivePlayer = document.getElementById('player-b');
    let currentSrc = null;
    let crossfadeInterval = null;

    /* =========================================
       1. ABRIR O PRESENTE
       ========================================= */
    giftBow.addEventListener('click', () => {
        if(hasStarted) return;
        hasStarted = true; 
        
        giftWrapper.classList.add('open');
        muteBtn.classList.remove('hidden'); 
        
        // Pega a música da primeira tela (Screen 0) e dá play
        playTrack(screens[0].getAttribute('data-track-src'));
        
        setTimeout(() => { giftWrapper.style.display = 'none'; }, 800); 
    });

    /* =========================================
       2. GERENCIADOR DE ÁUDIO PING-PONG
       ========================================= */
    function playTrack(newSrc) {
        if (!hasStarted || isMuted || !newSrc) return;
        if (currentSrc === newSrc) return; 
        
        currentSrc = newSrc;
        
        let fadeOutPlayer = activePlayer;
        let fadeInPlayer = inactivePlayer;
        
        clearInterval(crossfadeInterval);

        // Prepara e carrega a NOVA música
        fadeInPlayer.src = newSrc;
        fadeInPlayer.volume = 0;
        fadeInPlayer.load(); 
        
        let playPromise = fadeInPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Crossfade
                let volIn = 0;
                crossfadeInterval = setInterval(() => {
                    volIn += 0.05;
                    if (volIn >= 1) volIn = 1;
                    fadeInPlayer.volume = volIn;
                    
                    if (!fadeOutPlayer.paused && fadeOutPlayer.src) {
                        let volOut = fadeOutPlayer.volume - 0.1;
                        if (volOut <= 0) {
                            fadeOutPlayer.volume = 0;
                            fadeOutPlayer.pause();
                        } else {
                            fadeOutPlayer.volume = volOut;
                        }
                    }
                    
                    if (volIn >= 1) {
                        clearInterval(crossfadeInterval);
                        activePlayer = fadeInPlayer;
                        inactivePlayer = fadeOutPlayer;
                    }
                }, 50);
            }).catch(err => console.log("Áudio bloqueado:", err));
        }
    }

    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
        document.getElementById('player-a').muted = isMuted;
        document.getElementById('player-b').muted = isMuted;
    });

    /* =========================================
       3. AVANÇAR TELA INICIAL
       ========================================= */
    btnStart.addEventListener('click', () => {
        appContainer.classList.remove('locked');
        btnStart.classList.add('hidden'); 
        setTimeout(() => screens[1].scrollIntoView({ behavior: 'smooth' }), 200);
    });

    /* =========================================
       4. INTERSECTION OBSERVER (ANIMAÇÕES E ÁUDIO NO SCROLL)
       ========================================= */
    const observerOptions = { root: appContainer, threshold: 0.5 };

    const screenObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Ativa animações
                const anims = entry.target.querySelectorAll('.fade-up');
                anims.forEach(el => el.classList.add('visible'));

                // Atualiza Texto Fundo
                const newTickerText = entry.target.getAttribute('data-ticker');
                if (newTickerText) {
                    const fullText = newTickerText.repeat(6);
                    dynamicTicker.innerHTML = `<span>${fullText}</span><span>${fullText}</span>`;
                }

                // Troca a Música
                const trackSrc = entry.target.getAttribute('data-track-src');
                playTrack(trackSrc);

            } else {
                // Reseta animações
                const anims = entry.target.querySelectorAll('.fade-up');
                anims.forEach(el => el.classList.remove('visible'));
            }
        });
    }, observerOptions);

    screens.forEach(screen => screenObserver.observe(screen));

    /* =========================================
       5. EFEITO RIPPLE (CLIQUE NO BOTÃO)
       ========================================= */
    document.querySelectorAll('.btn-spotify').forEach(btn => {
        btn.addEventListener('click', function(e) {
            let x = e.clientX - e.target.getBoundingClientRect().left;
            let y = e.clientY - e.target.getBoundingClientRect().top;
            
            let ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
});



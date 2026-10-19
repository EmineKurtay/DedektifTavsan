
/* Minik Dedektif - bağımsız (framework kullanmayan) Vanilla JavaScript */
(() => {
    "use strict";

    const app = document.getElementById("app");
    const scoreEl = document.getElementById("score");
    const progressEl = document.getElementById("progress");
    const liveEl = document.getElementById("live");
    const assets = window.GAME_ASSETS;

    const state = {
        level: 0,
        points: 0,
        completed: new Set(),
        locked: false,
        transitionTimer: null,

        // Süre ve bölüm sonuçları
        levelStartedAt: null,
        levelStartPoints: 0,
        timerInterval: null,
        levelResults: []
    };

    const clues = [
        "Sandık SARI renkte.",
        "Üzerinde YILDIZ işareti var.",
        "Sandığın yanında MANTAR var.",
        "Kilidi ALTIN renginde."
    ];

    // Her bölüm için süre sınırı ve maksimum hız bonusu.
    const levelScoring = {
        1: { timeLimit: 60, maxSpeedBonus: 100 },
        2: { timeLimit: 90, maxSpeedBonus: 100 },
        3: { timeLimit: 90, maxSpeedBonus: 100 },
        4: { timeLimit: 90, maxSpeedBonus: 100 },
        5: { timeLimit: 45, maxSpeedBonus: 100 }
    };

    const levelTitles = {
        1: "Gizemli Ayak İzleri",
        2: "Kayıp Eşyaları Bul",
        3: "Hafıza Dedektifi",
        4: "Orman Labirenti",
        5: "Büyük Gizemi Çöz!"
    };

    // Süreyi dakika:saniye.salise değil, dakika:saniye ve onda
    // bir saniye hassasiyetinde gösterir.
    function formatDuration(seconds) {
        const totalTenths = Math.floor(seconds * 10);
        const minutes = Math.floor(totalTenths / 600);
        const remainingTenths = totalTenths % 600;
        const wholeSeconds = Math.floor(remainingTenths / 10);
        const tenths = remainingTenths % 10;

        return (
            String(minutes).padStart(2, "0") + ":" +
            String(wholeSeconds).padStart(2, "0") + "." +
            tenths
        );
    }

    function getElapsedSeconds() {
        if (state.levelStartedAt === null) return 0;

        return Math.max(
            0,
            (Date.now() - state.levelStartedAt) / 1000
        );
    }

    // Bölüm kronometresini başlatır.
    function startLevelTimer(levelNumber) {
        stopLevelTimer();

        state.levelStartedAt = Date.now();
        state.levelStartPoints = state.points;

        const timerEl = document.getElementById("levelTimer");

        function updateTimer() {
            const elapsed = getElapsedSeconds();
            const settings = levelScoring[levelNumber];

            if (timerEl) {
                timerEl.textContent =
                    "Süre: " + formatDuration(elapsed);

                if (elapsed >= settings.timeLimit) {
                    timerEl.classList.add("time-expired");
                } else {
                    timerEl.classList.remove("time-expired");
                }
            }
        }

        updateTimer();

        state.timerInterval = setInterval(updateTimer, 100);
    }

    // Kronometreyi durdurur.
    function stopLevelTimer() {
        if (state.timerInterval !== null) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }
    }

    // Hız bonusunu hesaplar.
    function calculateSpeedBonus(levelNumber, elapsedSeconds) {
        const settings = levelScoring[levelNumber];

        if (!settings || elapsedSeconds >= settings.timeLimit) {
            return 0;
        }

        const remainingRatio =
            1 - elapsedSeconds / settings.timeLimit;

        return Math.round(
            settings.maxSpeedBonus * remainingRatio
        );
    }

    // Görseller yalnızca img olarak hazırlanır.
    // Boyutlar assets.js üzerinden okunur.
    function asset(key, extraClass = "", context = "") {
        const item = assets[key];

        if (!item || !item.image) return "";

        const size =
            (context && item.sizes && item.sizes[context]) || {};

        const width = size.width ?? item.width ?? 60;
        const height = size.height ?? item.height ?? 60;
        const fit = size.objectFit ?? item.objectFit ?? "contain";

        const img = document.createElement("img");

        img.src = item.image;
        img.alt = item.label || "";
        img.className = `game-image ${extraClass}`.trim();

        img.style.width =
            typeof width === "number" ? `${width}px` : width;

        img.style.height =
            typeof height === "number" ? `${height}px` : height;

        img.style.objectFit = fit;
        img.style.maxWidth = "100%";
        img.draggable = false;
        img.dataset.gameAsset = key;

        return img.outerHTML;
    }

    // Orman arka planını uygular.
    function applyBackground() {
        const forest = assets.forest;

        if (!forest?.image) return;

        document.documentElement.style.setProperty(
            "--scene-background",
            `url("${forest.image}")`
        );

        document.documentElement.style.setProperty(
            "--scene-size",
            forest.size || "cover"
        );

        document.documentElement.style.setProperty(
            "--scene-position",
            forest.position || "center"
        );
    }

    applyBackground();

    const headerFox = document.getElementById("brandDetective");
    const headerSettings = assets.detective;

    if (headerFox && headerSettings) {
        const s = headerSettings.sizes?.header || {};

        headerFox.src = headerSettings.image;
        headerFox.style.width =
            `${s.width ?? headerSettings.width}px`;
        headerFox.style.height =
            `${s.height ?? headerSettings.height}px`;

        headerFox.style.objectFit =
            headerSettings.objectFit || "contain";

        headerFox.onerror = () => {
            headerFox.style.display = "none";
        };
    }

    document.addEventListener("error", event => {
        const el = event.target;

        if (
            el instanceof HTMLImageElement &&
            el.dataset.gameAsset
        ) {
            el.style.display = "none";
            console.warn("Görsel bulunamadı:", el.src);
        }
    }, true);

    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, ch => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[ch]);
    }

    function notice(message) {
        liveEl.textContent = message;

        const noticeEl = document.getElementById("notice");

        if (noticeEl) {
            noticeEl.textContent = message;
        }
    }

    function updateHeader() {
        scoreEl.textContent = `Puan: ${state.points}`;

        progressEl.innerHTML = Array.from(
            { length: 5 },
            (_, i) => {
                const number = i + 1;

                const css = state.completed.has(number)
                    ? "done"
                    : state.level === number
                        ? "active"
                        : "";

                return `<div class="step ${css}"></div>`;
            }
        ).join("");
    }

    function render(html) {
        app.innerHTML = html;
        updateHeader();
    }

    function renderLevel(number, title, description, content) {
        render(`
            <div class="status">
                <span class="pill">GÖREV ${number} / 5</span>
                <span>Tamamlanan: ${state.completed.size} / 5</span>
            </div>

            <div class="level-timer" id="levelTimer"
                 role="timer" aria-live="off">
                Süre: 00:00.0
            </div>

            <h2>${escapeHtml(title)}</h2>

            <p class="muted">
                ${escapeHtml(description)}
            </p>

            ${content}

            <div id="notice" class="notice">
                Hazırsan başlayalım!
            </div>
        `);

        startLevelTimer(number);
    }

    function addPoints(amount) {
        state.points += amount;
        updateHeader();
    }

    // Bölümü tamamlar, süreyi kaydeder ve hız bonusunu ekler.
    function finishLevel(bonus = 100) {
        if (state.locked) return;

        state.locked = true;

        // Önce süreyi durdur ve geçen zamanı hesapla.
        const elapsedSeconds = getElapsedSeconds();
        stopLevelTimer();

        // Normal bölüm puanları ve tamamlama bonusu.
        const basePoints =
            state.points - state.levelStartPoints + bonus;

        // Hız bonusu.
        const speedBonus = calculateSpeedBonus(
            state.level,
            elapsedSeconds
        );

        // Mevcut görev tamamlama puanını ekle.
        addPoints(bonus);

        // Hız bonusunu ekle.
        addPoints(speedBonus);

        // Bölüm sonuçlarını kaydet.
        const result = {
            level: state.level,
            title: levelTitles[state.level],
            durationSeconds: elapsedSeconds,
            basePoints: basePoints,
            speedBonus: speedBonus,
            totalPoints: basePoints + speedBonus,
            timeLimit: levelScoring[state.level].timeLimit
        };

        state.levelResults.push(result);
        state.completed.add(state.level);

        console.log(
            `Görev ${state.level} tamamlandı.`,
            `Süre: ${formatDuration(elapsedSeconds)}`,
            `Görev puanı: ${basePoints}`,
            `Hız bonusu: ${speedBonus}`,
            `Bölüm toplamı: ${result.totalPoints}`,
            `Genel toplam: ${state.points}`
        );

        updateHeader();

        notice(
            `Görev tamamlandı! ` +
            `Süre: ${formatDuration(elapsedSeconds)} | ` +
            `Görev puanı: ${basePoints} | ` +
            `Hız bonusu: +${speedBonus}`
        );

        state.transitionTimer = setTimeout(() => {
            state.transitionTimer = null;
            state.locked = false;
            state.level++;
            route();
        }, 1800);
    }

    function route() {
        // Önceki göreve ait klavye denetimi diğer görevleri etkilemesin.
        window.onkeydown = null;

        switch (state.level) {
            case 0:
                return showHome();
            case 1:
                return showFootprints();
            case 2:
                return showObjects();
            case 3:
                return showMemory();
            case 4:
                return showMaze();
            case 5:
                return showFinalPuzzle();
            default:
                return showVictory();
        }
    }

    // GİRİŞ EKRANI
    function showHome() {
        render(`
            <div class="intro">
                ${asset("detective", "character", "home")}

                <div>
                    <span class="pill">Ormanda bir gizem var!</span>

                    <h1>Kayıp Orman Hazinesi</h1>

                    <p>
                        Merhaba küçük dedektif! Ormanın gizli hazinesi
                        kayboldu. 5 görevi çöz, ipuçlarını topla ve
                        doğru sandığı bul!
                    </p>

                    <p>
                        Eşleştir • Nesne bul • Hatırla • Yolunu bul
                    </p>

                    <button type="button" class="btn" id="start">
                        Maceraya Başla ➜
                    </button>
                </div>
            </div>
        `);

        document.getElementById("start").addEventListener(
            "click",
            () => {
                state.level = 1;
                route();
            }
        );
    }

    // 1. GÖREV: HAYVAN / AYAK İZİ EŞLEŞTİRME
    function showFootprints() {
        const pairs = [
            { animal: "rabbit", print: "rabbitPrint" },
            { animal: "duck", print: "duckPrint" },
            { animal: "horse", print: "horsePrint" }
        ];

        const printOrder = [2, 0, 1];
        const matched = new Set();

        let selectedAnimal = null;

        renderLevel(
            1,
            "Gizemli Ayak İzleri",
            "Önce bir hayvana, sonra ona ait ayak izi görseline dokun.",
            `
                <div class="choices" id="animals">
                    ${pairs.map((p, i) => `
                        <button
                            type="button"
                            class="tile"
                            data-animal="${i}">
                            ${asset(p.animal, "", "tile")}
                            <small>${escapeHtml(assets[p.animal].label)}</small>
                        </button>
                    `).join("")}
                </div>

                <div class="choices footprints" id="prints">
                    ${printOrder.map(i => `
                        <button
                            type="button"
                            class="tile"
                            data-print="${i}">
                            ${asset(pairs[i].print, "", "tile")}
                            <small>${escapeHtml(assets[pairs[i].print].label)}</small>
                        </button>
                    `).join("")}
                </div>
            `
        );

        app.querySelectorAll("[data-animal]").forEach(button => {
            button.addEventListener("click", () => {
                if (state.locked) return;

                const index = Number(button.dataset.animal);

                if (matched.has(index)) return;

                selectedAnimal = index;

                app.querySelectorAll("[data-animal]").forEach(el => {
                    el.classList.remove("selected");
                });

                button.classList.add("selected");

                notice("Şimdi bu hayvanın izini seç!");
            });
        });

        app.querySelectorAll("[data-print]").forEach(button => {
            button.addEventListener("click", () => {
                if (state.locked) return;

                if (selectedAnimal === null) {
                    return notice("Önce bir hayvan seç.");
                }

                const index = Number(button.dataset.print);

                if (index !== selectedAnimal) {
                    button.classList.add("wrong");

                    setTimeout(() => {
                        button.classList.remove("wrong");
                    }, 350);

                    return notice("Bir daha dene!");
                }

                matched.add(index);

                button.classList.add("matched");

                app.querySelector(
                    `[data-animal="${index}"]`
                ).classList.add("matched");

                selectedAnimal = null;

                addPoints(20);

                notice("Doğru eşleşme! +20 puan");

                if (matched.size === pairs.length) {
                    finishLevel(40);
                }
            });
        });
    }

    // 2. GÖREV: SAHNEDE NESNE BULMA
    function showObjects() {
        const correctObjects = [
            "key",
            "apple",
            "hat",
            "bag",
            "star"
        ];

        const wrongObjects = [
            "lock",
            "flower",
            "basketball",
            "bartlett",
            "moon"
        ];

        const objects = [
            ...correctObjects.map(key => ({
                key,
                correct: true,
                x: assets[key].x,
                y: assets[key].y
            })),

            ...wrongObjects.map(key => ({
                key,
                correct: false,
                x: assets[key].x,
                y: assets[key].y
            }))
        ];

        const found = new Set();

        renderLevel(
            2,
            "Kayıp Eşyaları Bul",
            "Ormanda saklanan 5 doğru eşyayı bul! Dikkat et, bazı eşyalar yanıltıcı.",
            `
                <div class="items">
                    ${correctObjects.map(key => `
                        <span class="item" data-list="${key}">
                            ${asset(key, "", "list")}
                            ${escapeHtml(assets[key].label)}
                        </span>
                    `).join("")}
                </div>

                <div class="scene" aria-label="Nesne bulma sahnesi">
                    ${objects.map((obj, index) => `
                        <button
                            type="button"
                            class="hidden-object"
                            data-object="${index}"
                            style="left:${obj.x}%;top:${obj.y}%"
                            aria-label="${escapeHtml(assets[obj.key].label)}">
                            ${asset(obj.key, "", "hidden")}
                        </button>
                    `).join("")}
                </div>
            `
        );

        app.querySelectorAll("[data-object]").forEach(button => {
            button.addEventListener("click", () => {
                if (state.locked) return;

                const index = Number(button.dataset.object);
                const selectedObject = objects[index];

                if (!selectedObject) return;

                const key = selectedObject.key;

                if (found.has(key)) return;

                // Yanlış eşya.
                if (!selectedObject.correct) {
                    button.classList.add("wrong");

                    notice(
                        `${assets[key].label} aradığımız eşyalardan biri değil! Tekrar dene.`
                    );

                    setTimeout(() => {
                        button.classList.remove("wrong");
                    }, 350);

                    return;
                }

                // Doğru eşya.
                found.add(key);
                button.classList.add("found");

                const listItem = app.querySelector(
                    `[data-list="${key}"]`
                );

                if (listItem) {
                    listItem.classList.add("got");
                }

                addPoints(20);

                notice(
                    `${assets[key].label} bulundu! ` +
                    `(${found.size}/5) +20 puan`
                );

                if (found.size === correctObjects.length) {
                    finishLevel(40);
                }
            });
        });
    }

    // 3. GÖREV: HAFIZA KARTLARI
    function showMemory() {
        const keys = ["cat", "frog", "owl", "panda"];
        const deck = [...keys, ...keys];

        // Fisher-Yates karıştırma.
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        let opened = [];
        let busy = false;

        const matched = new Set();

        renderLevel(
            3,
            "Hafıza Dedektifi",
            "İki kart aç. Aynı hayvanları bulunca kartlar açık kalacak.",
            `
                <div class="memory">
                    ${deck.map((_, i) => `
                        <button
                            type="button"
                            class="mem"
                            data-card="${i}"
                            aria-label="Kapalı kart">
                            ${asset("cardBack")}
                        </button>
                    `).join("")}
                </div>
            `
        );

        app.querySelectorAll("[data-card]").forEach(button => {
            button.addEventListener("click", () => {
                if (busy || state.locked) return;

                const index = Number(button.dataset.card);

                if (matched.has(index) || opened.includes(index)) {
                    return;
                }

                button.classList.add("flipped");
                button.innerHTML = asset(deck[index], "", "memory");

                button.setAttribute(
                    "aria-label",
                    assets[deck[index]].label
                );

                opened.push(index);

                if (opened.length < 2) return;

                const [first, second] = opened;

                if (deck[first] === deck[second]) {
                    matched.add(first);
                    matched.add(second);

                    app.querySelectorAll(
                        `[data-card="${first}"], [data-card="${second}"]`
                    ).forEach(el => {
                        el.classList.add("matched");
                    });

                    opened = [];

                    addPoints(25);

                    notice("Harika bir çift! +25 puan");

                    if (matched.size === deck.length) {
                        finishLevel(40);
                    }

                    return;
                }

                busy = true;

                notice("Farklı hayvanlar, tekrar dene.");

                setTimeout(() => {
                    [first, second].forEach(i => {
                        const el = app.querySelector(
                            `[data-card="${i}"]`
                        );

                        if (!el) return;

                        el.innerHTML = asset("cardBack");
                        el.setAttribute("aria-label", "Kapalı kart");
                        el.classList.remove("flipped");
                    });

                    opened = [];
                    busy = false;
                }, 750);
            });
        });
    }

    // 4. GÖREV: LABİRENT
    function showMaze() {
        const map = [
            "#######",
            "#.....#",
            "#.###.#",
            "#...#.#",
            "###.#.#",
            "#.....#",
            "#######"
        ];

        let player = { row: 1, col: 1 };

        const goal = { row: 5, col: 5 };

        const directions = {
            up: [-1, 0],
            down: [1, 0],
            left: [0, -1],
            right: [0, 1]
        };

        renderLevel(
            4,
            "Orman Labirenti",
            "Tilkiyi tavşana ulaştır! Ok tuşlarını veya ekrandaki yönleri kullan.",
            `
                <div class="maze" id="maze"></div>

                <div class="controls">
                    <span></span>
                    <button type="button" class="arrow" data-dir="up">
                        ${asset("up")}
                    </button>
                    <span></span>

                    <button type="button" class="arrow" data-dir="left">
                        ${asset("left")}
                    </button>

                    <button type="button" class="arrow" data-dir="down">
                        ${asset("down")}
                    </button>

                    <button type="button" class="arrow" data-dir="right">
                        ${asset("right")}
                    </button>
                </div>
            `
        );

        function draw() {
            const mazeEl = document.getElementById("maze");

            if (!mazeEl) return;

            mazeEl.innerHTML = map.map((row, rowIndex) =>
                [...row].map((tile, colIndex) => {
                    const isPlayer =
                        rowIndex === player.row &&
                        colIndex === player.col;

                    const isGoal =
                        rowIndex === goal.row &&
                        colIndex === goal.col;

                    return `
                        <div class="cell ${tile === "#" ? "wall" : ""} ${isGoal ? "goal" : ""} ${isPlayer ? "player" : ""}">
                            ${
                                isPlayer
                                    ? asset("detective", "", "maze")
                                    : isGoal
                                        ? asset("rabbit", "", "maze")
                                        : ""
                            }
                        </div>
                    `;
                }).join("")
            ).join("");
        }

        function move(direction) {
            if (
                state.locked ||
                state.level !== 4 ||
                !directions[direction]
            ) {
                return;
            }

            const [dRow, dCol] = directions[direction];

            const nextRow = player.row + dRow;
            const nextCol = player.col + dCol;

            if (map[nextRow]?.[nextCol] !== ".") {
                notice("Burada yol yok. Başka yön dene!");
                return;
            }

            player = {
                row: nextRow,
                col: nextCol
            };

            draw();

            if (
                player.row === goal.row &&
                player.col === goal.col
            ) {
                finishLevel(100);
            }
        }

        app.querySelectorAll("[data-dir]").forEach(button => {
            button.addEventListener("click", () => {
                move(button.dataset.dir);
            });
        });

        window.onkeydown = event => {
            const keys = {
                ArrowUp: "up",
                ArrowDown: "down",
                ArrowLeft: "left",
                ArrowRight: "right"
            };

            if (state.level === 4 && keys[event.key]) {
                event.preventDefault();
                move(keys[event.key]);
            }
        };

        draw();
    }

    // 5. GÖREV: DOĞRU SANDIĞI BULMA
    function showFinalPuzzle() {
        const chests = [
            {
                key: "chestGreen",
                description: "Yeşil • Yıldız • Gümüş kilit",
                correct: false
            },
            {
                key: "chestCorrect",
                description: "Sarı • Yıldız • Altın kilit • Mantar",
                correct: true
            },
            {
                key: "chestHeart",
                description: "Sarı • Kalp • Altın kilit",
                correct: false
            }
        ];

        renderLevel(
            5,
            "Büyük Gizemi Çöz!",
            "Dedektif notlarına göre doğru sandığı seç.",
            `
                <div class="clues">
                    <b>Dedektif notları:</b>
                    <ul>
                        ${clues.map(clue => `
                            <li>${escapeHtml(clue)}</li>
                        `).join("")}
                    </ul>
                </div>

                <div class="chests">
                    ${chests.map((chest, i) => `
                        <button
                            type="button"
                            class="chest"
                            data-chest="${i}">
                            ${asset(chest.key)}
                            <span class="label">
                                ${escapeHtml(chest.description)}
                            </span>
                        </button>
                    `).join("")}
                </div>
            `
        );

        app.querySelectorAll("[data-chest]").forEach(button => {
            button.addEventListener("click", () => {
                if (state.locked) return;

                if (chests[Number(button.dataset.chest)].correct) {
                    finishLevel(150);
                } else {
                    button.classList.add("wrong");

                    setTimeout(() => {
                        button.classList.remove("wrong");
                    }, 350);

                    notice(
                        "Bu sandık bütün ipuçlarına uymuyor. Tekrar bak!"
                    );
                }
            });
        });
    }

    // OYUN SONU: BÖLÜM SÜRELERİ VE SKOR TABLOSU
    function showVictory() {
        stopLevelTimer();

        const totalDuration = state.levelResults.reduce(
            (total, result) => total + result.durationSeconds,
            0
        );

        const totalBasePoints = state.levelResults.reduce(
            (total, result) => total + result.basePoints,
            0
        );

        const totalSpeedBonus = state.levelResults.reduce(
            (total, result) => total + result.speedBonus,
            0
        );

        const rows = state.levelResults.map(result => `
            <tr>
                <td style="padding:10px 6px;text-align:left;">
                    ${result.level}. ${escapeHtml(result.title)}
                </td>

                <td style="padding:10px 6px;text-align:center;white-space:nowrap;">
                    ${formatDuration(result.durationSeconds)}
                </td>

                <td style="padding:10px 6px;text-align:center;">
                    ${result.basePoints}
                </td>

                <td style="padding:10px 6px;text-align:center;">
                    +${result.speedBonus}
                </td>

                <td style="padding:10px 6px;text-align:center;font-weight:bold;">
                    ${result.totalPoints}
                </td>
            </tr>
        `).join("");

        render(`
            <div class="win">
                <div class="award">${asset("award")}</div>

                <h1>TEBRİKLER, MİNİK DEDEKTİF!</h1>

                ${asset("detective", "character", "victory")}

                <p>
                    Orman hazinesini buldun!
                    Tüm 5 görevi tamamladın.
                </p>

                <div class="results-wrap"
                     style="width:100%;max-width:850px;margin:24px auto;text-align:left;">

                    <h2 style="text-align:center;">
                        Görev Sonuçları
                    </h2>

                    <div style="overflow-x:auto;">
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr>
                                    <th style="padding:10px 6px;text-align:left;">
                                        Bölüm
                                    </th>
                                    <th style="padding:10px 6px;text-align:center;">
                                        Süre
                                    </th>
                                    <th style="padding:10px 6px;text-align:center;">
                                        Görev puanı
                                    </th>
                                    <th style="padding:10px 6px;text-align:center;">
                                        Hız bonusu
                                    </th>
                                    <th style="padding:10px 6px;text-align:center;">
                                        Toplam
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                ${rows}
                            </tbody>
                        </table>
                    </div>

                    <div style="margin-top:20px;padding:16px;border-radius:12px;background:rgba(255,255,255,0.75);">

                        <p>
                            <strong>Toplam çözme süresi:</strong>
                            ${formatDuration(totalDuration)}
                        </p>

                        <p>
                            <strong>Görevlerden kazanılan puan:</strong>
                            ${totalBasePoints}
                        </p>

                        <p>
                            <strong>Toplam hız bonusu:</strong>
                            +${totalSpeedBonus}
                        </p>

                        <div style="margin-top:14px;padding-top:14px;border-top:2px solid #ddd;text-align:center;">
                            <div style="font-size:18px;font-weight:bold;">
                                GENEL TOPLAM SKOR
                            </div>

                            <div style="font-size:38px;font-weight:bold;margin-top:8px;">
                                ${state.points} PUAN
                            </div>
                        </div>
                    </div>
                </div>

                <p>
                    <button type="button" class="btn" id="again">
                        Yeniden Oyna ↻
                    </button>
                </p>
            </div>
        `);

        document.getElementById("again").addEventListener(
            "click",
            resetGame
        );
    }

    function resetGame() {
        if (state.transitionTimer !== null) {
            clearTimeout(state.transitionTimer);
        }

        stopLevelTimer();

        state.transitionTimer = null;
        state.levelStartedAt = null;
        state.levelStartPoints = 0;
        state.levelResults = [];
        state.level = 0;
        state.points = 0;
        state.completed.clear();
        state.locked = false;

        window.onkeydown = null;

        route();
    }

    const restartButton = document.getElementById("restart");

    if (restartButton) {
        restartButton.addEventListener("click", resetGame);
    }

    route();
})();

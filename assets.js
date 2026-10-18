/**
 * GÖRSEL AYARLARI - TÜMÜ BURADAN
 * image: dosya yolu, width/height: px, objectFit: contain/cover/fill
 * Aynı görsel farklı yerlerde farklı ölçüdeyse: sizes alanını düzenle.
 * İsteğe bağlı x/y: nesne bulma ekranındaki konum (yüzde).
 */
window.GAME_ASSETS = {
    detective: { image: "assets/tilki.png", label: "Tilki dedektif", width: 350, height: 450, objectFit: "contain", sizes: { home: { width: 350, height: 450 }, header: { width: 46, height: 46 }, maze: { width: 45, height: 45 }, victory: { width: 230, height: 270 } } },
    rabbit: { image: "assets/tavsan.png", label: "Tavşan", width: 90, height: 90, objectFit: "contain", sizes: { tile: { width: 100, height: 95 } } },
    duck: { image: "assets/ordek.png", label: "Ördek", width: 90, height: 90, objectFit: "contain", sizes: { tile: { width: 100, height: 95 } } },
    horse: { image: "assets/at.png", label: "At", width: 90, height: 90, objectFit: "contain", sizes: { tile: { width: 100, height: 95 } } },
    rabbitPrint: { image: "assets/tavsan_ayak.png", label: "Tavşan izi", width: 90, height: 90, objectFit: "contain", sizes: { tile: { width: 100, height: 95 } } },
    duckPrint: { image: "assets/ordek_ayak.png", label: "Ördek izi", width: 90, height: 90, objectFit: "contain", sizes: { tile: { width: 100, height: 95 } } },
    horsePrint: { image: "assets/at_nal.png", label: "At izi", width: 90, height: 90, objectFit: "contain", sizes: { tile: { width: 100, height: 95 } } },
    
    // BULUNMASI GEREKEN 5 EŞYA
    key: {
        image: "assets/key.svg",
        label: "Anahtar",
        width: 50,
        height: 50,
        objectFit: "contain",
        x: 17,
        y: 61,
        sizes: {
            list: { width: 36, height: 36 },
            hidden: { width: 55, height: 55 }
        }
    },

    apple: {
        image: "assets/apple.svg",
        label: "Elma",
        width: 50,
        height: 50,
        objectFit: "contain",
        x: 72,
        y: 53,
        sizes: {
            list: { width: 36, height: 36 },
            hidden: { width: 55, height: 55 }
        }
    },

    hat: {
        image: "assets/hat.svg",
        label: "Şapka",
        width: 50,
        height: 50,
        objectFit: "contain",
        x: 45,
        y: 73,
        sizes: {
            list: { width: 36, height: 36 },
            hidden: { width: 55, height: 55 }
        }
    },

    bag: {
        image: "assets/bag.svg",
        label: "Çanta",
        width: 50,
        height: 50,
        objectFit: "contain",
        x: 79,
        y: 20,
        sizes: {
            list: { width: 36, height: 36 },
            hidden: { width: 55, height: 55 }
        }
    },

    star: {
        image: "assets/star.svg",
        label: "Yıldız",
        width: 50,
        height: 50,
        objectFit: "contain",
        x: 28,
        y: 26,
        sizes: {
            list: { width: 36, height: 36 },
            hidden: { width: 55, height: 55 }
        }
    },

    // YANILTICI 5 EŞYA
    lock: {
        image: "assets/lock.png",
        label: "Kilit",
        width: 50,
        height: 50,
        objectFit: "contain",
        x: 8,
        y: 35,
        sizes: {
            hidden: { width: 55, height: 55 }
        }
    },

    flower: {
        image: "assets/flower.png",
        label: "Çiçek",
        width: 50,
        height: 50,
        objectFit: "contain",
        x: 60,
        y: 75,
        sizes: {
            hidden: { width: 55, height: 55 }
        }
    },

    basketball: {
        image: "assets/basketball.png",
        label: "Basketbol Topu",
        width: 50,
        height: 50,
        objectFit: "contain",
        x: 38,
        y: 48,
        sizes: {
            hidden: { width: 55, height: 55 }
        }
    },

    bartlett: {
        image: "assets/bartlett.png",
        label: "Armut",
        width: 50,
        height: 50,
        objectFit: "contain",
        x: 85,
        y: 65,
        sizes: {
            hidden: { width: 55, height: 55 }
        }
    },

    moon: {
        image: "assets/moon.png",
        label: "Ay",
        width: 50,
        height: 50,
        objectFit: "contain",
        x: 50,
        y: 12,
        sizes: {
            hidden: { width: 55, height: 55 }
        }
    },


    cat: { image: "assets/cat.svg", label: "Kedi", width: 80, height: 80, objectFit: "contain", sizes: { memory: { width: 80, height: 80 } } },
    frog: { image: "assets/frog.svg", label: "Kurbağa", width: 80, height: 80, objectFit: "contain", sizes: { memory: { width: 80, height: 80 } } },
    owl: { image: "assets/owl.svg", label: "Baykuş", width: 80, height: 80, objectFit: "contain", sizes: { memory: { width: 80, height: 80 } } },
    panda: { image: "assets/panda.svg", label: "Panda", width: 80, height: 80, objectFit: "contain", sizes: { memory: { width: 80, height: 80 } } },
    chestGreen: { image: "assets/sandik1.png", label: "Yeşil sandık", width: 140, height: 110, objectFit: "contain" },
    chestCorrect: { image: "assets/sandik2.png", label: "Sarı sandık", width: 140, height: 110, objectFit: "contain" },
    chestHeart: { image: "assets/sandik3.png", label: "Kalpli sandık", width: 140, height: 110, objectFit: "contain" },
    mushroom: { image: "assets/mushroom.svg", label: "Mantar", width: 50, height: 50, objectFit: "contain" },
    cardBack: { image: "assets/card-back.svg", label: "Kapalı kart", width: 80, height: 80, objectFit: "contain" },
    award: { image: "assets/award.svg", label: "Dedektif rozeti", width: 115, height: 115, objectFit: "contain" },
    up: { image: "assets/up.svg", label: "Yukarı", width: 30, height: 30, objectFit: "contain" },
    down: { image: "assets/down.svg", label: "Aşağı", width: 30, height: 30, objectFit: "contain" },
    left: { image: "assets/left.svg", label: "Sol", width: 30, height: 30, objectFit: "contain" },
    right: { image: "assets/right.svg", label: "Sağ", width: 30, height: 30, objectFit: "contain" },
    forest: { image: "assets/forest.svg", label: "Orman arka planı", size: "cover", position: "center" }
};

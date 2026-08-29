console.log("client.js betöltve");

// ==================================================
// SZERENCSEKERÉK 1.1 - CLIENT.JS
// ==================================================

const $ = (id) => document.getElementById(id);

const uzenet = $("uzenet");
const jatekosNev = $("jatekosNev");
const szobaNev = $("szobaNev");
const mindenkiSzobaGomb = $("mindenkiSzobaGomb");
const csatlakozasGomb = $("csatlakozasGomb");
const belepes = $("belepes");
const jatekTer = $("jatekTer");
const jatekCim = $("jatekCim");
const jatekInfo = $("jatekInfo");
const szobaCim = $("szobaCim");
const szobaKijelzes = $("szobaKijelzes");
const jatekosLetszam = $("jatekosLetszam");
const jatekosLista = $("jatekosLista");
const jatekInditasGomb = $("jatekInditasGomb");
const szobaUzenet = $("szobaUzenet");
const zeneGomb = $("zeneGomb");

const chatPanel = $("chatPanel");
const chatLista = $("chatLista");
const chatMezo = $("chatMezo");
const chatKuldesGomb = $("chatKuldesGomb");
const chatUzenet = $("chatUzenet");

// A chat mindig a játéktér legaljára kerül.
if (chatPanel && jatekTer) {
    jatekTer.appendChild(chatPanel);
}

const kategoriavalasztasPanel =
    $("kategoriavalasztasPanel");

const kategoriavalasztasCim =
    $("kategoriavalasztasCim");

const kategoriavalasztasInfo =
    $("kategoriavalasztasInfo");

const kategoriaValaszto =
    $("kategoriaValaszto");

const kategoriaValasztasGomb =
    $("kategoriaValasztasGomb");

const kategoriaUzenet =
    $("kategoriaUzenet");

const kategoriaMegerositesPanel =
    $("kategoriaMegerositesPanel");

const kategoriaMegerositesCim =
    $("kategoriaMegerositesCim");

const kategoriaMegerositesSzoveg =
    $("kategoriaMegerositesSzoveg");

const kategoriaVeglegesitesGomb =
    $("kategoriaVeglegesitesGomb");

const kategoriaMasikGomb =
    $("kategoriaMasikGomb");

const kategoriaMegerositesUzenet =
    $("kategoriaMegerositesUzenet");

if (kategoriaMegerositesPanel) {
    kategoriaMegerositesPanel.hidden = true;
}

const szabadFeladvanyPanel =
    $("szabadFeladvanyPanel");

const szabadKategoriaMezo =
    $("szabadKategoriaMezo");

const szabadFeladvanyMezo =
    $("szabadFeladvanyMezo");

const szabadFeladvanyGomb =
    $("szabadFeladvanyGomb");

const szabadKategoriaVisszaGomb =
    $("szabadKategoriaVisszaGomb");

const szabadFeladvanyUzenet =
    $("szabadFeladvanyUzenet");

const soronLevoKijelzes =
    $("soronLevoKijelzes");

const jatekPontLista =
    $("jatekPontLista");

const tavolletGomb =
    $("tavolletGomb");

const visszateresGomb =
    $("visszateresGomb");

const ujKorGomb =
    $("ujKorGomb");

const kategoriaKijelzes =
    $("kategoriaKijelzes");

const betuSzamKijelzes =
    $("betuSzamKijelzes");

const feladvanyKijelzes =
    $("feladvanyKijelzes");

const kerekGrafika =
    $("kerekGrafika");

const kerekFeliratok =
    $("kerekFeliratok");

const porgetesGomb =
    $("porgetesGomb");

const kerekEredmeny =
    $("kerekEredmeny");

const betuMezo =
    $("betuMezo");

const betuGomb =
    $("betuGomb");

const betuUzenet =
    $("betuUzenet");

const hasznaltBetuk =
    $("hasznaltBetuk");

const hibasBetuk =
    $("hibasBetuk");

const megfejtesMezo =
    $("megfejtesMezo");

const megfejtesGomb =
    $("megfejtesGomb");

const megfejtesUzenet =
    $("megfejtesUzenet");

const hibasMegfejtesek =
    $("hibasMegfejtesek");

// ==================================================
// KERÉK ÉS SZABÁLYOK
// ==================================================

const KEREK_MEZOK = [
    1000,
    1500,
    2000,
    2500,
    3000,
    3500,
    4000,
    5000,
    6000,
    7500,
    10000,
    20000,
    "CSŐD",
    "KIMARADSZ"
];

const MAGANHANGZO_AR =
    1000;

const MAGANHANGZOK =
    new Set([
        "A",
        "Á",
        "E",
        "É",
        "I",
        "Í",
        "O",
        "Ó",
        "Ö",
        "Ő",
        "U",
        "Ú",
        "Ü",
        "Ű"
    ]);

// ==================================================
// ÁLLAPOT
// ==================================================

let socket =
    null;

let sajatJatekosId =
    null;

let sajatJatekosNev =
    "";

let aktualisJatekosId =
    null;

let aktualisJatekosNev =
    "";

let kategoriatValasztoId =
    null;

let kategoriaraVar =
    false;

let kategoriaMegerositesreVar =
    false;

let kategoriaJelolt =
    "";

let szabadFeladvanyraVar =
    false;

let korLezart =
    false;

let aktualisKerekErtek =
    null;

let varBeture =
    false;

let maganhangzoVasarlasMod =
    false;

let porgetesFolyamatban =
    false;

let megfejtesAnimacioFolyamatban =
    false;

let kerekForgas =
    0;

let sajatTavol =
    false;

let sajatVisszaterKovetkezoKorban =
    false;

let jatekMarElindult =
    false;

let utolsoJatekosLista =
    [];

let utolsoHibasBetuk =
    [];

let gyorsBemondo =
    null;

let sugoGomb =
    null;

let sugoAblak =
    null;

let sugoCim =
    null;

// ==================================================
// SEGÉDFÜGGVÉNYEK
// ==================================================

function magyarPontszam(
    ertek
) {
    return Number(
        ertek || 0
    ).toLocaleString(
        "hu-HU"
    );
}

function maganhangzoE(
    betu
) {
    return MAGANHANGZOK.has(
        String(
            betu || ""
        )
            .trim()
            .toLocaleUpperCase(
                "hu-HU"
            )
    );
}

function vanSzamosKerekErtek() {
    return (
        typeof aktualisKerekErtek ===
            "number" &&
        Number.isFinite(
            aktualisKerekErtek
        )
    );
}


// ==================================================
// MEGFEJTÉS LÁTVÁNYOS FELFEDÉSE
// ==================================================

function megfejtesFelfedesAnimacio(megfejtes) {
    const szoveg = String(megfejtes || "");

    if (!feladvanyKijelzes || !szoveg) {
        return;
    }

    megfejtesAnimacioFolyamatban = true;

    feladvanyKijelzes.innerHTML = "";
    feladvanyKijelzes.setAttribute("aria-busy", "true");
    feladvanyKijelzes.setAttribute("aria-label", "Megfejtés: " + szoveg);

    const karakterek = Array.from(szoveg);
    let betuIndex = 0;

    karakterek.forEach(function (karakter) {
        if (karakter === " ") {
            feladvanyKijelzes.appendChild(document.createTextNode(" "));
            return;
        }

        const span = document.createElement("span");
        span.setAttribute("aria-hidden", "true");
        span.style.display = "inline-block";
        span.style.minWidth = "0.65em";
        span.style.textAlign = "center";
        span.style.transform = "rotateY(90deg)";
        span.style.transition = "transform 0.35s ease";
        span.textContent = "_";
        feladvanyKijelzes.appendChild(span);

        const kesleltetes = 110 * betuIndex;
        betuIndex += 1;

        window.setTimeout(function () {
            span.textContent = karakter;
            span.style.transform = "rotateY(0deg)";
        }, kesleltetes);
    });

    window.setTimeout(function () {
        feladvanyKijelzes.textContent = szoveg;
        feladvanyKijelzes.removeAttribute("aria-busy");
        feladvanyKijelzes.removeAttribute("aria-label");
        megfejtesAnimacioFolyamatban = false;
    }, Math.max(500, betuIndex * 110 + 450));
}

// ==================================================
// KÉPERNYŐOLVASÓ BEMONDÁS
// ==================================================

function bemondas(
    szoveg
) {
    if (
        !gyorsBemondo
    ) {
        gyorsBemondo =
            document.createElement(
                "div"
            );

        gyorsBemondo.setAttribute(
            "role",
            "status"
        );

        gyorsBemondo.setAttribute(
            "aria-live",
            "assertive"
        );

        gyorsBemondo.setAttribute(
            "aria-atomic",
            "true"
        );

        gyorsBemondo.style.position =
            "absolute";

        gyorsBemondo.style.width =
            "1px";

        gyorsBemondo.style.height =
            "1px";

        gyorsBemondo.style.padding =
            "0";

        gyorsBemondo.style.margin =
            "-1px";

        gyorsBemondo.style.overflow =
            "hidden";

        gyorsBemondo.style.clip =
            "rect(0, 0, 0, 0)";

        gyorsBemondo.style.whiteSpace =
            "nowrap";

        gyorsBemondo.style.border =
            "0";

        document.body.appendChild(
            gyorsBemondo
        );
    }

    gyorsBemondo.textContent =
        "";

    window.setTimeout(
        function () {
            gyorsBemondo.textContent =
                String(
                    szoveg || ""
                );
        },
        25
    );
}

// ==================================================
// HIBÁS BETŰK FELOLVASÁSA
// ==================================================

function hibasBetukFelolvasasa() {
    if (
        utolsoHibasBetuk.length
    ) {
        bemondas(
            "Hibás betűk: " +
            utolsoHibasBetuk.join(
                ", "
            ) +
            "."
        );
    } else {
        bemondas(
            "Még nincs hibás betű."
        );
    }
}

// ==================================================
// PONTSZÁMOK FELOLVASÁSA
// ==================================================

function pontszamokFelolvasasa() {
    if (
        !utolsoJatekosLista.length
    ) {
        bemondas(
            "Még nincs elérhető pontszám."
        );

        return;
    }

    const szoveg =
        utolsoJatekosLista
            .map(
                function (
                    jatekos
                ) {
                    return (
                        jatekos.nev +
                        ": " +
                        magyarPontszam(
                            jatekos.pont
                        ) +
                        " pont"
                    );
                }
            )
            .join(
                ". "
            );

    bemondas(
        "Pontszámok. " +
        szoveg +
        "."
    );
}

// ==================================================
// JÁTÉKSÚGÓ
// ==================================================

function sugoBezasa() {
    if (
        !sugoAblak ||
        sugoAblak.hidden
    ) {
        return;
    }

    sugoAblak.hidden =
        true;

    if (
        sugoGomb
    ) {
        sugoGomb.focus();
    }
}

function sugoMegnyitasa() {
    if (
        !sugoAblak
    ) {
        return;
    }

    sugoAblak.hidden =
        false;

    window.setTimeout(
        function () {
            if (
                sugoCim
            ) {
                sugoCim.focus();
            }
        },
        30
    );
}

function sugoLetrehozasa() {
    if (
        !jatekTer ||
        $("jatekSugoGomb")
    ) {
        return;
    }

    sugoGomb =
        document.createElement(
            "button"
        );

    sugoGomb.type =
        "button";

    sugoGomb.id =
        "jatekSugoGomb";

    sugoGomb.textContent =
        "Játéksúgó és billentyűparancsok (Alt+I)";

    sugoGomb.setAttribute(
        "aria-keyshortcuts",
        "Alt+I"
    );

    sugoAblak =
        document.createElement(
            "section"
        );

    sugoAblak.id =
        "jatekSugoAblak";

    sugoAblak.hidden =
        true;

    sugoAblak.setAttribute(
        "role",
        "dialog"
    );

    sugoAblak.setAttribute(
        "aria-labelledby",
        "jatekSugoCim"
    );

    sugoCim =
        document.createElement(
            "h3"
        );

    sugoCim.id =
        "jatekSugoCim";

    sugoCim.tabIndex =
        -1;

    sugoCim.textContent =
        "Szerencsekerék játéksúgó";

    const bevezeto =
        document.createElement(
            "p"
        );

    bevezeto.textContent =
        "A játék billentyűzettel és képernyőolvasóval is használható. " +
        "A gyorsbillentyűk Alt billentyűvel működnek, ezért JAWS használatakor " +
        "nem kell állandóan Insert+Z billentyűkombinációval módot váltani.";

    const menetCim =
        document.createElement(
            "h4"
        );

    menetCim.textContent =
        "A játék menete";

    const menetLista =
        document.createElement(
            "ol"
        );

    [
        "Csatlakozás után a szobagazda indítja el a játékot.",
        "A kijelölt játékos kategóriát választ, majd elindul a feladvány.",
        "Ha Ön van soron, pörgesse meg a kereket.",
        "Mássalhangzó találat esetén a kipörgetett pontérték minden előfordulás után jár.",
        "Pörgetés után ugyanabban a betűmezőben mássalhangzó vagy magánhangzó is megadható. A magánhangzó ingyenes.",
        "CSŐD esetén az adott játékos teljes addigi pontszáma nullára változik.",
        "KIMARADSZ esetén a következő aktív játékos kerül sorra.",
        "A teljes megfejtést a megfejtés mezőbe lehet beírni és elküldeni."
    ].forEach(
        function (
            szoveg
        ) {
            const li =
                document.createElement(
                    "li"
                );

            li.textContent =
                szoveg;

            menetLista.appendChild(
                li
            );
        }
    );

    const billentyuCim =
        document.createElement(
            "h4"
        );

    billentyuCim.textContent =
        "Gyorsbillentyűk";

    const billentyuLista =
        document.createElement(
            "ul"
        );

    [
        "Alt+P: a kerék megpörgetése.",
        "Alt+H: a hibás betűk felolvasása.",
        "Alt+S: az összes játékos aktuális pontszámának felolvasása.",
        "Alt+I: a játéksúgó megnyitása.",
        "Escape: a játéksúgó bezárása."
    ].forEach(
        function (
            szoveg
        ) {
            const li =
                document.createElement(
                    "li"
                );

            li.textContent =
                szoveg;

            billentyuLista.appendChild(
                li
            );
        }
    );

    const megjegyzes =
        document.createElement(
            "p"
        );

    megjegyzes.textContent =
        "A helyesen választott betűket nem listázzuk külön, " +
        "mert azok azonnal megjelennek a feladványban. " +
        "Külön csak a hibás betűket tartjuk nyilván.";

    const bezarGomb =
        document.createElement(
            "button"
        );

    bezarGomb.type =
        "button";

    bezarGomb.textContent =
        "Súgó bezárása (Escape)";

    sugoAblak.appendChild(
        sugoCim
    );

    sugoAblak.appendChild(
        bevezeto
    );

    sugoAblak.appendChild(
        menetCim
    );

    sugoAblak.appendChild(
        menetLista
    );

    sugoAblak.appendChild(
        billentyuCim
    );

    sugoAblak.appendChild(
        billentyuLista
    );

    sugoAblak.appendChild(
        megjegyzes
    );

    sugoAblak.appendChild(
        bezarGomb
    );

    if (
        jatekCim &&
        jatekCim.parentNode ===
            jatekTer
    ) {
        jatekCim.insertAdjacentElement(
            "afterend",
            sugoGomb
        );

        sugoGomb.insertAdjacentElement(
            "afterend",
            sugoAblak
        );
    } else {
        jatekTer.insertBefore(
            sugoGomb,
            jatekTer.firstChild
        );

        sugoGomb.insertAdjacentElement(
            "afterend",
            sugoAblak
        );
    }

    sugoGomb.addEventListener(
        "click",
        sugoMegnyitasa
    );

    bezarGomb.addEventListener(
        "click",
        sugoBezasa
    );
}

// ==================================================
// MAGÁNHANGZÓ VÁSÁRLÁS
// ==================================================

function maganhangzoVasarlasInditas() {
    const enVagyokSoron =
        aktualisJatekosId ===
            sajatJatekosId &&
        !sajatTavol &&
        !korLezart &&
        !kategoriaraVar &&
        !szabadFeladvanyraVar;

    if (
        !enVagyokSoron
    ) {
        bemondas(
            "Most nem Ön van soron."
        );

        return;
    }

    const sajatJatekos =
        utolsoJatekosLista.find(
            function (
                jatekos
            ) {
                return (
                    jatekos.id ===
                    sajatJatekosId
                );
            }
        );

    const sajatPont =
        sajatJatekos
            ? Number(
                sajatJatekos.pont ||
                0
            )
            : 0;

    if (
        sajatPont <
        MAGANHANGZO_AR
    ) {
        maganhangzoVasarlasMod =
            false;

        varBeture =
            vanSzamosKerekErtek();

        if (
            betuUzenet
        ) {
            betuUzenet.textContent =
                "Nincs elegendő pontja magánhangzó vásárlásához. " +
                "Egy magánhangzó ára 1000 pont.";
        }

        bemondas(
            "Nincs elegendő pontja magánhangzó vásárlásához. " +
            "Egy magánhangzó ára 1000 pont."
        );

        kezelofeluletFrissites();

        if (
            varBeture &&
            betuMezo &&
            !betuMezo.disabled
        ) {
            betuMezo.focus();
        }

        return;
    }

    maganhangzoVasarlasMod =
        true;

    varBeture =
        false;

    kezelofeluletFrissites();

    if (
        betuUzenet
    ) {
        betuUzenet.textContent =
            "Magánhangzó vásárlása. Írjon be egy magánhangzót. Ár: 1000 pont.";
    }

    bemondas(
        "Magánhangzó vásárlása. " +
        "Egy magánhangzó ára 1000 pont. " +
        "Írja be a magánhangzót, majd nyomjon Entert."
    );

    if (
        betuMezo
    ) {
        betuMezo.focus();
    }
}

function maganhangzoGombLetrehozasa() {
    if (
        !betuGomb ||
        $("maganhangzoGomb")
    ) {
        return;
    }

    const gomb =
        document.createElement(
            "button"
        );

    gomb.type =
        "button";

    gomb.id =
        "maganhangzoGomb";

    gomb.textContent =
        "Magánhangzó vásárlása - 1000 pont (Alt+M)";

    gomb.setAttribute(
        "aria-keyshortcuts",
        "Alt+M"
    );

    gomb.addEventListener(
        "click",
        function () {
            klikkHang();

            maganhangzoVasarlasInditas();
        }
    );

    betuGomb.insertAdjacentElement(
        "afterend",
        gomb
    );
}

sugoLetrehozasa();

// Külön magánhangzó gomb nincs: minden betű ugyanabban a mezőben adható meg.

if (
    hasznaltBetuk
) {
    hasznaltBetuk.hidden =
        true;

    hasznaltBetuk.setAttribute(
        "aria-hidden",
        "true"
    );
}

// ==================================================
// HANGRENDSZER
// ==================================================

let audioContext =
    null;

let varakozoZeneSzol =
    false;

const klikkHangFajl =
    new Audio(
        "/click.wav"
    );

const tapsHangFajl =
    new Audio(
        "/mixkit-clapping-indoors-3039.wav"
    );

const varakozoZene =
    new Audio(
        "/Szerencsekerek.m4a"
    );

klikkHangFajl.preload =
    "auto";

tapsHangFajl.preload =
    "auto";

varakozoZene.preload =
    "auto";

varakozoZene.loop =
    false;

varakozoZene.volume =
    0.85;

function audioContextInditas() {
    if (
        !audioContext
    ) {
        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (
            AudioContext
        ) {
            audioContext =
                new AudioContext();
        }
    }

    if (
        audioContext &&
        audioContext.state ===
            "suspended"
    ) {
        audioContext.resume();
    }
}

function klikkHang() {
    try {
        klikkHangFajl.currentTime =
            0;

        klikkHangFajl
            .play()
            .catch(
                function () {}
            );
    } catch (
        hiba
    ) {
        console.log(
            "Klikk hang hiba:",
            hiba
        );
    }
}

function tapsHang() {
    try {
        tapsHangFajl.pause();

        tapsHangFajl.currentTime =
            0;

        tapsHangFajl
            .play()
            .catch(
                function () {}
            );

        window.setTimeout(
            function () {
                tapsHangFajl.pause();

                tapsHangFajl.currentTime =
                    0;
            },
            3500
        );
    } catch (
        hiba
    ) {
        console.log(
            "Taps hang hiba:",
            hiba
        );
    }
}

function hangLejatszas(
    frekvencia,
    hossz,
    hangero,
    tipus
) {
    audioContextInditas();

    if (
        !audioContext
    ) {
        return;
    }

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    const most =
        audioContext.currentTime;

    oscillator.type =
        tipus ||
        "sine";

    oscillator.frequency.value =
        frekvencia;

    gain.gain.setValueAtTime(
        0.0001,
        most
    );

    gain.gain.exponentialRampToValueAtTime(
        hangero ||
        0.08,
        most + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        most + hossz
    );

    oscillator.connect(
        gain
    );

    gain.connect(
        audioContext.destination
    );

    oscillator.start(
        most
    );

    oscillator.stop(
        most + hossz
    );
}

function kattanasHang() {
    hangLejatszas(
        900,
        0.035,
        0.045,
        "square"
    );
}

function megallasHang() {
    hangLejatszas(
        660,
        0.55,
        0.065,
        "sine"
    );
}

function helyesBetuHang() {
    [
        600,
        800,
        1050
    ].forEach(
        function (
            frekvencia,
            index
        ) {
            window.setTimeout(
                function () {
                    hangLejatszas(
                        frekvencia,
                        0.32,
                        0.08,
                        "sine"
                    );
                },
                index * 130
            );
        }
    );
}

function hibasBetuHang() {
    [
        430,
        360,
        290,
        220,
        150
    ].forEach(
        function (
            frekvencia,
            index
        ) {
            window.setTimeout(
                function () {
                    hangLejatszas(
                        frekvencia,
                        0.38,
                        0.08,
                        "triangle"
                    );
                },
                index * 170
            );
        }
    );
}

function csodHang() {
    audioContextInditas();

    if (!audioContext) {
        return;
    }

    const most = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(420, most);
    oscillator.frequency.exponentialRampToValueAtTime(42, most + 2.8);

    gain.gain.setValueAtTime(0.0001, most);
    gain.gain.exponentialRampToValueAtTime(0.22, most + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, most + 2.9);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(most);
    oscillator.stop(most + 3.0);

    window.setTimeout(function () {
        hangLejatszas(95, 1.4, 0.16, "square");
    }, 700);
}

function kimaradszHang() {
    [
        0,
        170,
        340,
        510,
        680
    ].forEach(
        function (
            kesleltetes
        ) {
            window.setTimeout(
                function () {
                    hangLejatszas(
                        620,
                        0.09,
                        0.06,
                        "square"
                    );
                },
                kesleltetes
            );
        }
    );
}

function gyozelmiHang() {
    helyesBetuHang();

    window.setTimeout(
        tapsHang,
        750
    );
}

// ==================================================
// ZENE
// ==================================================

function zeneGombFrissites() {
    if (
        !zeneGomb
    ) {
        return;
    }

    if (
        jatekMarElindult
    ) {
        zeneGomb.textContent =
            "Zene kikapcsolva a játék alatt";

        zeneGomb.disabled =
            true;

        zeneGomb.setAttribute(
            "aria-pressed",
            "false"
        );

        return;
    }

    zeneGomb.disabled =
        false;

    if (
        varakozoZeneSzol
    ) {
        zeneGomb.textContent =
            "Zene ki";

        zeneGomb.setAttribute(
            "aria-pressed",
            "true"
        );
    } else {
        zeneGomb.textContent =
            "Zene lejátszása";

        zeneGomb.setAttribute(
            "aria-pressed",
            "false"
        );
    }
}

function varakozoZeneInditas() {
    if (
        jatekMarElindult
    ) {
        return;
    }

    try {
        varakozoZene.pause();

        varakozoZene.currentTime =
            0;

        varakozoZene
            .play()
            .then(
                function () {
                    varakozoZeneSzol =
                        true;

                    zeneGombFrissites();
                }
            )
            .catch(
                function () {
                    varakozoZeneSzol =
                        false;

                    zeneGombFrissites();
                }
            );
    } catch (
        hiba
    ) {
        varakozoZeneSzol =
            false;

        zeneGombFrissites();
    }
}

function varakozoZeneLeallitas() {
    try {
        varakozoZene.pause();

        varakozoZene.currentTime =
            0;
    } catch (
        hiba
    ) {}

    varakozoZeneSzol =
        false;

    zeneGombFrissites();
}

varakozoZene.addEventListener(
    "ended",
    function () {
        varakozoZeneSzol =
            false;

        zeneGombFrissites();
    }
);

if (
    zeneGomb
) {
    zeneGomb.addEventListener(
        "click",
        function () {
            klikkHang();

            if (
                varakozoZeneSzol
            ) {
                varakozoZeneLeallitas();
            } else {
                varakozoZeneInditas();
            }
        }
    );
}

// ==================================================
// KERÉK FELIRATAI
// ==================================================

function kerekFeliratokLetrehozasa() {
    if (
        !kerekFeliratok
    ) {
        return;
    }

    kerekFeliratok.innerHTML =
        "";

    const darab =
        KEREK_MEZOK.length;

    const szog =
        360 /
        darab;

    KEREK_MEZOK.forEach(
        function (
            ertek,
            index
        ) {
            const felirat =
                document.createElement(
                    "span"
                );

            felirat.className =
                "kerekFelirat";

            if (
                ertek ===
                "KIMARADSZ"
            ) {
                felirat.textContent =
                    "Kimaradsz";
            } else if (
                ertek ===
                "CSŐD"
            ) {
                felirat.textContent =
                    "Csőd";
            } else {
                felirat.textContent =
                    ertek;
            }

            const kozepSzog =
                index *
                szog +
                szog /
                2;

            const radian =
                kozepSzog *
                Math.PI /
                180;

            const sugar =
                37;

            const x =
                50 +
                Math.sin(
                    radian
                ) *
                sugar;

            const y =
                50 -
                Math.cos(
                    radian
                ) *
                sugar;

            felirat.style.left =
                x +
                "%";

            felirat.style.top =
                y +
                "%";

            kerekFeliratok.appendChild(
                felirat
            );
        }
    );
}

function kerekAnimacio(
    eredmeny,
    kesz
) {
    if (
        !kerekGrafika
    ) {
        if (
            typeof kesz ===
            "function"
        ) {
            kesz();
        }

        return;
    }

    const index =
        KEREK_MEZOK.indexOf(
            eredmeny
        );

    if (
        index <
        0
    ) {
        if (
            typeof kesz ===
            "function"
        ) {
            kesz();
        }

        return;
    }

    const mezoszog =
        360 /
        KEREK_MEZOK.length;

    const mezokozep =
        index *
        mezoszog +
        mezoszog /
        2;

    const kivantPozicio =
        (
            360 -
            mezokozep
        ) %
        360;

    const jelenlegiPozicio =
        (
            (
                kerekForgas %
                360
            ) +
            360
        ) %
        360;

    let kulonbseg =
        kivantPozicio -
        jelenlegiPozicio;

    if (
        kulonbseg <=
        0
    ) {
        kulonbseg +=
            360;
    }

    const csokkentettMozgas =
        window.matchMedia &&
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    const teljesKorok =
        csokkentettMozgas
            ? 1
            : 6;

    const ido =
        csokkentettMozgas
            ? 500
            : 3500;

    kerekForgas +=
        teljesKorok *
        360 +
        kulonbseg;

    kerekGrafika.style.transition =
        csokkentettMozgas
            ? "transform 0.5s ease-out"
            : "transform 3.5s cubic-bezier(0.12, 0.65, 0.18, 1)";

    let kattog =
        true;

    let eltelt =
        0;

    function kattogtatas() {
        if (
            !kattog
        ) {
            return;
        }

        kattanasHang();

        const arany =
            Math.min(
                eltelt /
                ido,
                1
            );

        const kesleltetes =
            45 +
            Math.pow(
                arany,
                2.3
            ) *
            240;

        eltelt +=
            kesleltetes;

        if (
            eltelt <
            ido
        ) {
            window.setTimeout(
                kattogtatas,
                kesleltetes
            );
        }
    }

    kattogtatas();

    requestAnimationFrame(
        function () {
            kerekGrafika.style.transform =
                "translateX(-50%) rotate(" +
                kerekForgas +
                "deg)";
        }
    );

    window.setTimeout(
        function () {
            kattog =
                false;

            if (
                eredmeny ===
                "CSŐD"
            ) {
                csodHang();
            } else if (
                eredmeny ===
                "KIMARADSZ"
            ) {
                kimaradszHang();
            } else {
                megallasHang();
            }

            if (
                typeof kesz ===
                "function"
            ) {
                kesz();
            }
        },
        ido +
        100
    );
}

kerekFeliratokLetrehozasa();

// ==================================================
// PONTLISTA
// ==================================================

function pontListaFrissites(
    jatekosok
) {
    if (
        !jatekPontLista ||
        !Array.isArray(
            jatekosok
        )
    ) {
        return;
    }

    jatekPontLista.innerHTML =
        "";

    utolsoJatekosLista =
        jatekosok.map(
            function (
                jatekos
            ) {
                return {
                    id:
                        jatekos.id,

                    nev:
                        jatekos.nev,

                    pont:
                        Number(
                            jatekos.pont ||
                            0
                        )
                };
            }
        );

    jatekosok.forEach(
        function (
            jatekos
        ) {
            const li =
                document.createElement(
                    "li"
                );

            li.textContent =
                jatekos.nev +
                ": " +
                magyarPontszam(
                    jatekos.pont
                ) +
                " pont összesen";

            if (
                jatekos.id ===
                aktualisJatekosId
            ) {
                li.textContent +=
                    " - SORON";

                li.classList.add(
                    "soronLevoJatekos"
                );

                li.setAttribute(
                    "aria-current",
                    "true"
                );
            }

            if (
                jatekos.tavol
            ) {
                li.textContent +=
                    " - TÁVOL";
            }

            jatekPontLista.appendChild(
                li
            );
        }
    );
}

// ==================================================
// KATEGÓRIA FELÜLET
// ==================================================

function kategoriavalasztasFrissites() {
    const enValasztok =
        kategoriaraVar &&
        kategoriatValasztoId ===
        sajatJatekosId;

    if (
        kategoriavalasztasPanel
    ) {
        kategoriavalasztasPanel.hidden =
            !kategoriaraVar;
    }

    if (
        kategoriaValaszto
    ) {
        kategoriaValaszto.disabled =
            !enValasztok;
    }

    if (
        kategoriaValasztasGomb
    ) {
        kategoriaValasztasGomb.disabled =
            !enValasztok;
    }

    if (
        kategoriaraVar &&
        kategoriavalasztasInfo
    ) {
        kategoriavalasztasInfo.textContent =
            enValasztok
                ? "Ön választ kategóriát a következő feladványhoz."
                : "A következő kategóriát egy másik játékos választja.";
    }
}

function kategoriaMegerositesFrissites() {
    kategoriaMegerositesreVar = false;

    if (kategoriaMegerositesPanel) {
        kategoriaMegerositesPanel.hidden = true;
    }
}

function szabadKategoriaFrissites() {
    const enAdomMeg =
        szabadFeladvanyraVar &&
        kategoriatValasztoId ===
        sajatJatekosId;

    if (
        szabadFeladvanyPanel
    ) {
        szabadFeladvanyPanel.hidden =
            !szabadFeladvanyraVar;
    }

    if (
        szabadKategoriaMezo
    ) {
        szabadKategoriaMezo.disabled =
            !enAdomMeg;
    }

    if (
        szabadFeladvanyMezo
    ) {
        szabadFeladvanyMezo.disabled =
            !enAdomMeg;
    }

    if (
        szabadFeladvanyGomb
    ) {
        szabadFeladvanyGomb.disabled =
            !enAdomMeg;
    }

    if (
        szabadKategoriaVisszaGomb
    ) {
        szabadKategoriaVisszaGomb.disabled =
            !enAdomMeg;
    }
}

// ==================================================
// KEZELŐFELÜLET
// ==================================================

function kezelofeluletFrissites() {
    const enVagyokSoron =
        aktualisJatekosId ===
            sajatJatekosId &&
        !sajatTavol &&
        !korLezart &&
        !kategoriaraVar &&
        !szabadFeladvanyraVar;

    if (
        soronLevoKijelzes
    ) {
        if (
            korLezart
        ) {
            soronLevoKijelzes.textContent =
                "A kör véget ért.";
        } else if (
            szabadFeladvanyraVar
        ) {
            soronLevoKijelzes.textContent =
                kategoriatValasztoId ===
                    sajatJatekosId
                    ? "Ön írja be a kategória nevét és a saját feladványt."
                    : "A saját feladvány megadására várunk.";
        } else if (
            kategoriaraVar
        ) {
            soronLevoKijelzes.textContent =
                kategoriatValasztoId ===
                    sajatJatekosId
                    ? "Ön választja a következő kategóriát."
                    : "Kategóriaválasztás következik.";
        } else if (
            enVagyokSoron &&
            varBeture
        ) {
            soronLevoKijelzes.textContent =
                "Ön van soron. Írjon egy betűt.";
        } else if (
            enVagyokSoron
        ) {
            soronLevoKijelzes.textContent =
                "Ön van soron.";
        } else if (
            aktualisJatekosNev
        ) {
            soronLevoKijelzes.textContent =
                "Most " +
                aktualisJatekosNev +
                " van soron.";
        } else {
            soronLevoKijelzes.textContent =
                "";
        }
    }

    if (
        porgetesGomb
    ) {
        porgetesGomb.disabled =
            !enVagyokSoron ||
            porgetesFolyamatban ||
            varBeture ||
            vanSzamosKerekErtek();
    }

    if (
        betuMezo
    ) {
        betuMezo.disabled =
            !enVagyokSoron ||
            !varBeture;
    }

    if (
        betuGomb
    ) {
        betuGomb.disabled =
            !enVagyokSoron ||
            !varBeture;
    }

    const maganhangzoGomb = $("maganhangzoGomb");

    if (maganhangzoGomb) {
        maganhangzoGomb.hidden = true;
        maganhangzoGomb.disabled = true;
    }

    if (
        megfejtesMezo
    ) {
        megfejtesMezo.disabled =
            !enVagyokSoron;
    }

    if (
        megfejtesGomb
    ) {
        megfejtesGomb.disabled =
            !enVagyokSoron;
    }

    if (
        tavolletGomb
    ) {
        tavolletGomb.hidden =
            sajatTavol;

        tavolletGomb.disabled =
            korLezart;
    }

    if (
        visszateresGomb
    ) {
        visszateresGomb.hidden =
            !sajatTavol;

        visszateresGomb.disabled =
            sajatVisszaterKovetkezoKorban;
    }

    if (
        ujKorGomb
    ) {
        ujKorGomb.hidden =
            !korLezart ||
            sajatTavol;

        ujKorGomb.disabled =
            !korLezart ||
            sajatTavol;
    }

    kategoriavalasztasFrissites();

    kategoriaMegerositesFrissites();

    szabadKategoriaFrissites();

    zeneGombFrissites();
}

// ==================================================
// CHAT
// ==================================================

function chatSorHozzaadas(
    adat
) {
    if (
        !chatLista ||
        !adat
    ) {
        return;
    }

    const li =
        document.createElement(
            "li"
        );

    li.textContent =
        String(
            adat.nev ||
            "Játékos"
        ) +
        ": " +
        String(
            adat.uzenet ||
            ""
        );

    chatLista.appendChild(
        li
    );

    while (
        chatLista.children.length >
        50
    ) {
        chatLista.removeChild(
            chatLista.firstChild
        );
    }
}

function chatKuldes() {
    if (
        !socket ||
        !chatMezo
    ) {
        return;
    }

    const szoveg =
        chatMezo.value.trim();

    if (
        !szoveg
    ) {
        if (
            chatUzenet
        ) {
            chatUzenet.textContent =
                "Az üzenet nem lehet üres.";
        }

        chatMezo.focus();

        return;
    }

    socket.emit(
        "chatUzenet",
        szoveg
    );

    chatMezo.value =
        "";

    if (
        chatUzenet
    ) {
        chatUzenet.textContent =
            "";
    }

    chatMezo.focus();
}

if (
    chatKuldesGomb
) {
    chatKuldesGomb.addEventListener(
        "click",
        function () {
            klikkHang();

            chatKuldes();
        }
    );
}

if (
    chatMezo
) {
    chatMezo.addEventListener(
        "keydown",
        function (
            event
        ) {
            if (
                event.key ===
                "Enter"
            ) {
                event.preventDefault();

                chatKuldes();
            }
        }
    );
}

// ==================================================
// SOCKET.IO
// ==================================================

try {
    socket =
        io();
} catch (
    hiba
) {
    if (
        uzenet
    ) {
        uzenet.textContent =
            "A Socket.IO nem indult el.";
    }
}

// ==================================================
// BELÉPÉS
// ==================================================

function csatlakozas() {
    if (
        !socket
    ) {
        return;
    }

    audioContextInditas();

    const nev =
        jatekosNev
            ? jatekosNev.value.trim()
            : "";

    const szoba =
        szobaNev
            ? szobaNev.value.trim()
            : "";

    if (
        !nev
    ) {
        if (
            uzenet
        ) {
            uzenet.textContent =
                "Kérlek, add meg a játékos nevét.";
        }

        if (
            jatekosNev
        ) {
            jatekosNev.focus();
        }

        return;
    }

    if (
        !szoba
    ) {
        if (
            uzenet
        ) {
            uzenet.textContent =
                "Kérlek, add meg a szoba nevét.";
        }

        if (
            szobaNev
        ) {
            szobaNev.focus();
        }

        return;
    }

    if (
        csatlakozasGomb
    ) {
        csatlakozasGomb.disabled =
            true;
    }

    socket.emit(
        "csatlakozas",
        {
            nev:
                nev,

            szoba:
                szoba
        }
    );
}

if (
    mindenkiSzobaGomb
) {
    mindenkiSzobaGomb.addEventListener(
        "click",
        function () {
            klikkHang();

            if (
                szobaNev
            ) {
                szobaNev.value =
                    "Mindenki szobája";

                szobaNev.focus();
            }
        }
    );
}

if (
    csatlakozasGomb
) {
    csatlakozasGomb.addEventListener(
        "click",
        function () {
            klikkHang();

            csatlakozas();
        }
    );
}

if (
    jatekosNev
) {
    jatekosNev.addEventListener(
        "keydown",
        function (
            event
        ) {
            if (
                event.key ===
                "Enter"
            ) {
                event.preventDefault();

                klikkHang();

                if (
                    szobaNev
                ) {
                    szobaNev.focus();
                }
            }
        }
    );
}

if (
    szobaNev
) {
    szobaNev.addEventListener(
        "keydown",
        function (
            event
        ) {
            if (
                event.key ===
                "Enter"
            ) {
                event.preventDefault();

                klikkHang();

                csatlakozas();
            }
        }
    );
}

// ==================================================
// SOCKET ESEMÉNYEK
// ==================================================

if (
    socket
) {
    socket.on(
        "connect",
        function () {
            if (
                uzenet
            ) {
                uzenet.textContent =
                    "Kapcsolat a szerverrel létrejött.";
            }
        }
    );

    socket.on(
        "connect_error",
        function (
            hiba
        ) {
            if (
                uzenet
            ) {
                uzenet.textContent =
                    "Nem sikerült kapcsolódni a szerverhez: " +
                    hiba.message;
            }
        }
    );

    socket.on(
        "chatElozmeny",
        function (
            lista
        ) {
            if (
                !chatLista
            ) {
                return;
            }

            chatLista.innerHTML =
                "";

            if (
                Array.isArray(
                    lista
                )
            ) {
                lista.forEach(
                    chatSorHozzaadas
                );
            }
        }
    );

    socket.on(
        "chatUzenet",
        function (
            adat
        ) {
            chatSorHozzaadas(
                adat
            );

            if (
                chatUzenet
            ) {
                chatUzenet.textContent =
                    String(
                        adat.nev ||
                        "Játékos"
                    ) +
                    " új üzenetet küldött.";
            }
        }
    );

    socket.on(
        "chatHiba",
        function (
            szoveg
        ) {
            if (
                chatUzenet
            ) {
                chatUzenet.textContent =
                    szoveg;
            }
        }
    );

    socket.on(
        "csatlakozasSikeres",
        function (
            adat
        ) {
            sajatJatekosId =
                adat.id;

            sajatJatekosNev =
                adat.nev;

            jatekMarElindult =
                false;

            if (
                belepes
            ) {
                belepes.hidden =
                    true;
            }

            if (
                jatekTer
            ) {
                jatekTer.hidden =
                    false;
            }

            if (
                chatPanel
            ) {
                chatPanel.hidden =
                    false;
            }

            if (
                szobaKijelzes
            ) {
                szobaKijelzes.textContent =
                    adat.szoba;
            }

            if (
                jatekInditasGomb
            ) {
                jatekInditasGomb.hidden =
                    !adat.host;

                jatekInditasGomb.disabled =
                    !adat.host;
            }

            if (
                szobaUzenet
            ) {
                szobaUzenet.textContent =
                    adat.host
                        ? "Ön hozta létre a szobát. Elindíthatja a játékot."
                        : "Várakozás a játék indítására.";
            }

            varakozoZeneInditas();

            if (
                szobaCim
            ) {
                szobaCim.focus();
            }
        }
    );

    socket.on(
        "hiba",
        function (
            szoveg
        ) {
            [
                uzenet,
                szobaUzenet,
                kategoriaUzenet,
                kategoriaMegerositesUzenet,
                szabadFeladvanyUzenet,
                megfejtesUzenet
            ].forEach(
                function (
                    elem
                ) {
                    if (
                        elem
                    ) {
                        elem.textContent =
                            szoveg;
                    }
                }
            );

            if (
                csatlakozasGomb
            ) {
                csatlakozasGomb.disabled =
                    false;
            }

            kezelofeluletFrissites();
        }
    );

    socket.on(
        "jatekosLista",
        function (
            adat
        ) {
            if (
                jatekosLista
            ) {
                jatekosLista.innerHTML =
                    "";

                adat.jatekosok.forEach(
                    function (
                        jatekos
                    ) {
                        const li =
                            document.createElement(
                                "li"
                            );

                        let szoveg =
                            jatekos.nev +
                            " - " +
                            magyarPontszam(
                                jatekos.pont
                            ) +
                            " pont";

                        if (
                            jatekos.host
                        ) {
                            szoveg +=
                                " - szobagazda";
                        }

                        if (
                            jatekos.tavol
                        ) {
                            szoveg +=
                                " - távol";
                        }

                        if (
                            jatekos.visszaterKovetkezoKorban
                        ) {
                            szoveg +=
                                " - a következő körben visszatér";
                        }

                        li.textContent =
                            szoveg;

                        jatekosLista.appendChild(
                            li
                        );

                        if (
                            jatekos.id ===
                            sajatJatekosId
                        ) {
                            sajatTavol =
                                Boolean(
                                    jatekos.tavol
                                );

                            sajatVisszaterKovetkezoKorban =
                                Boolean(
                                    jatekos.visszaterKovetkezoKorban
                                );
                        }
                    }
                );
            }

            if (
                jatekosLetszam
            ) {
                jatekosLetszam.textContent =
                    adat.jatekosok.length +
                    " / " +
                    adat.maxJatekos;
            }

            pontListaFrissites(
                adat.jatekosok
            );

            kezelofeluletFrissites();
        }
    );

    socket.on(
        "jatekElindult",
        function () {
            jatekMarElindult =
                true;

            varakozoZeneLeallitas();

            if (
                jatekInfo
            ) {
                jatekInfo.textContent =
                    "A játék elindult.";
            }

            if (
                jatekInditasGomb
            ) {
                jatekInditasGomb.hidden =
                    true;
            }

            if (
                kerekEredmeny
            ) {
                kerekEredmeny.textContent =
                    "Kategóriaválasztás következik.";
            }

            kezelofeluletFrissites();

            window.setTimeout(
                function () {
                    bemondas(
                        "A játék elindult. " +
                        "A játéksúgó a játéktér elején Tabbal elérhető, " +
                        "vagy megnyitható Alt plusz I billentyűkombinációval."
                    );
                },
                250
            );

            if (
                jatekCim
            ) {
                jatekCim.focus();
            }
        }
    );

    socket.on(
        "kategoriavalasztas",
        function (
            adat
        ) {
            kategoriaraVar =
                true;

            kategoriaMegerositesreVar =
                false;

            kategoriaJelolt =
                "";

            szabadFeladvanyraVar =
                false;

            korLezart =
                false;

            kategoriatValasztoId =
                adat.jatekosId;

            aktualisKerekErtek =
                null;

            varBeture =
                false;

            maganhangzoVasarlasMod =
                false;

            if (
                kategoriaMegerositesPanel
            ) {
                kategoriaMegerositesPanel.hidden =
                    true;
            }

            if (
                szabadFeladvanyPanel
            ) {
                szabadFeladvanyPanel.hidden =
                    true;
            }

            if (
                kategoriaValaszto &&
                Array.isArray(
                    adat.kategoriak
                )
            ) {
                kategoriaValaszto.innerHTML =
                    "";

                adat.kategoriak.forEach(
                    function (
                        kategoria
                    ) {
                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            kategoria;

                        option.textContent =
                            kategoria;

                        kategoriaValaszto.appendChild(
                            option
                        );
                    }
                );
            }

            kezelofeluletFrissites();

            if (
                kategoriatValasztoId ===
                    sajatJatekosId &&
                kategoriavalasztasCim
            ) {
                kategoriavalasztasCim.focus();
            }
        }
    );

    socket.on(
        "szabadFeladvanyKeres",
        function (
            adat
        ) {
            kategoriaraVar =
                false;

            kategoriaMegerositesreVar =
                false;

            szabadFeladvanyraVar =
                true;

            if (
                szabadFeladvanyUzenet
            ) {
                szabadFeladvanyUzenet.textContent =
                    adat &&
                    adat.uzenet
                        ? adat.uzenet
                        : "";
            }

            kezelofeluletFrissites();

            if (
                szabadKategoriaMezo
            ) {
                szabadKategoriaMezo.focus();
            }
        }
    );

    socket.on(
        "ujKor",
        function (
            adat
        ) {
            kategoriaraVar =
                false;

            kategoriaMegerositesreVar =
                false;

            szabadFeladvanyraVar =
                false;

            korLezart =
                false;

            kategoriatValasztoId =
                null;

            aktualisKerekErtek =
                null;

            varBeture =
                false;

            maganhangzoVasarlasMod =
                false;

            porgetesFolyamatban =
                false;

            megfejtesAnimacioFolyamatban =
                false;

            if (megfejtesUzenet) {
                megfejtesUzenet.textContent = "";
            }

            if (megfejtesMezo) {
                megfejtesMezo.value = "";
            }

            if (
                kategoriaKijelzes
            ) {
                kategoriaKijelzes.textContent =
                    adat.kategoria;
            }

            if (
                kerekEredmeny
            ) {
                kerekEredmeny.textContent =
                    "A kerék még nem lett megpörgetve.";
            }

            kezelofeluletFrissites();
        }
    );

    socket.on(
        "korVege",
        function (
            adat
        ) {
            korLezart =
                true;

            aktualisKerekErtek =
                null;

            varBeture =
                false;

            maganhangzoVasarlasMod =
                false;

            porgetesFolyamatban =
                false;

            if (
                kerekEredmeny
            ) {
                kerekEredmeny.textContent =
                    adat &&
                    adat.uzenet
                        ? adat.uzenet
                        : "A kör véget ért.";
            }

            if (adat && adat.megfejtes) {
                if (megfejtesUzenet) {
                    megfejtesUzenet.textContent =
                        "Megfejtés: " + adat.megfejtes;
                }

                megfejtesFelfedesAnimacio(adat.megfejtes);
                bemondas("Megfejtés: " + adat.megfejtes);
            }

            kezelofeluletFrissites();
        }
    );

    socket.on(
        "jatekAllapot",
        function (
            adat
        ) {
            aktualisJatekosId =
                adat.soronLevoId;

            aktualisJatekosNev =
                adat.soronLevoNev;

            kategoriatValasztoId =
                adat.kategoriatValasztoId;

            kategoriaraVar =
                Boolean(
                    adat.kategoriaraVar
                );

            kategoriaMegerositesreVar = false;

            kategoriaJelolt =
                adat.kategoriaJelolt ||
                "";

            korLezart =
                Boolean(
                    adat.korLezart
                );

            szabadFeladvanyraVar =
                Boolean(
                    adat.szabadFeladvanyraVar
                );

            aktualisKerekErtek =
                adat.aktualisKerekErtek;

            if (
                aktualisJatekosId !==
                sajatJatekosId
            ) {
                maganhangzoVasarlasMod =
                    false;
            }

            const szamosKerekErtek =
                vanSzamosKerekErtek();

            if (
                aktualisJatekosId ===
                    sajatJatekosId &&
                szamosKerekErtek &&
                !kategoriaraVar &&
                !kategoriaMegerositesreVar &&
                !szabadFeladvanyraVar &&
                !korLezart
            ) {
                varBeture =
                    true;
            } else if (
                !szamosKerekErtek &&
                !maganhangzoVasarlasMod
            ) {
                varBeture =
                    false;
            }

            if (
                adat.kategoria &&
                kategoriaKijelzes
            ) {
                kategoriaKijelzes.textContent =
                    adat.kategoria;
            }

            if (feladvanyKijelzes) {
                if (
                    korLezart &&
                    adat.teljesMegfejtes &&
                    !megfejtesAnimacioFolyamatban
                ) {
                    feladvanyKijelzes.textContent = adat.teljesMegfejtes;
                } else if (!korLezart) {
                    const maszk =
                        String(
                            adat.feladvany ||
                            ""
                        );

                    feladvanyKijelzes.textContent =
                        Array.from(
                            maszk
                        )
                            .map(
                                function (
                                    karakter
                                ) {
                                    if (
                                        karakter ===
                                        "_"
                                    ) {
                                        return "▁ ";
                                    }

                                    if (
                                        karakter ===
                                        " "
                                    ) {
                                        return "  ";
                                    }

                                    return (
                                        karakter +
                                        " "
                                    );
                                }
                            )
                            .join("")
                            .trimEnd();
                }
            }

            if (
                betuSzamKijelzes
            ) {
                betuSzamKijelzes.textContent =
                    adat.betuSzam
                        ? "Betűk száma: " +
                            adat.betuSzam
                        : "";
            }

            if (
                Array.isArray(
                    adat.jatekosok
                )
            ) {
                pontListaFrissites(
                    adat.jatekosok
                );
            }

            if (
                hasznaltBetuk
            ) {
                hasznaltBetuk.hidden =
                    true;

                hasznaltBetuk.setAttribute(
                    "aria-hidden",
                    "true"
                );
            }

            utolsoHibasBetuk =
                Array.isArray(
                    adat.hibasBetuk
                )
                    ? adat.hibasBetuk.slice()
                    : [];

            if (
                hibasBetuk
            ) {
                hibasBetuk.textContent =
                    utolsoHibasBetuk.length
                        ? "Hibás betűk: " +
                            utolsoHibasBetuk.join(
                                ", "
                            )
                        : "Hibás betűk: még nincs.";
            }

            if (
                hibasMegfejtesek
            ) {
                hibasMegfejtesek.textContent =
                    adat.hibasTippek &&
                    adat.hibasTippek.length
                        ? "Hibás megfejtések: " +
                            adat.hibasTippek.join(
                                " | "
                            )
                        : "Hibás megfejtések: még nincs.";
            }

            kezelofeluletFrissites();

            if (
                (
                    varBeture ||
                    maganhangzoVasarlasMod
                ) &&
                aktualisJatekosId ===
                    sajatJatekosId &&
                betuMezo &&
                !betuMezo.disabled
            ) {
                window.setTimeout(
                    function () {
                        betuMezo.focus();
                    },
                    50
                );
            }
        }
    );

    socket.on(
        "porgetesInditas",
        function (adat) {
            if (!adat || adat.jatekosId === sajatJatekosId) {
                return;
            }

            porgetesFolyamatban = true;
            varBeture = false;
            aktualisKerekErtek = null;

            if (kerekEredmeny) {
                kerekEredmeny.textContent =
                    (adat.jatekosNev ? adat.jatekosNev + " pörget. " : "") +
                    "A kerék pörög...";
            }

            kezelofeluletFrissites();

            kerekAnimacio(adat.ertek, function () {
                porgetesFolyamatban = false;

                if (kerekEredmeny) {
                    if (adat.ertek === "CSŐD") {
                        kerekEredmeny.textContent = "Csőd.";
                    } else if (adat.ertek === "KIMARADSZ") {
                        kerekEredmeny.textContent = "Kimaradsz.";
                    } else {
                        kerekEredmeny.textContent =
                            magyarPontszam(adat.ertek) + " pont.";
                    }
                }

                kezelofeluletFrissites();
            });
        }
    );

    socket.on(
        "porgetesEredmeny",
        function (
            adat
        ) {
            if (
                !adat ||
                adat.jatekosId !==
                    sajatJatekosId
            ) {
                return;
            }

            porgetesFolyamatban =
                false;

            maganhangzoVasarlasMod =
                false;

            if (
                adat.betuJohet
            ) {
                aktualisKerekErtek =
                    adat.ertek;

                varBeture =
                    true;

                if (
                    kerekEredmeny
                ) {
                    kerekEredmeny.textContent =
                        magyarPontszam(
                            adat.ertek
                        ) +
                        " pont. Írjon egy betűt.";
                }
            } else {
                aktualisKerekErtek =
                    null;

                varBeture =
                    false;
            }

            kezelofeluletFrissites();

            if (
                varBeture &&
                betuMezo &&
                !betuMezo.disabled
            ) {
                window.setTimeout(
                    function () {
                        betuMezo.focus();
                    },
                    50
                );
            }
        }
    );

    socket.on(
        "betuEredmeny",
        function (
            adat
        ) {
            if (
                betuUzenet
            ) {
                betuUzenet.textContent =
                    adat.uzenet ||
                    "";
            }

            if (
                !adat.siker
            ) {
                if (
                    betuMezo
                ) {
                    betuMezo.focus();
                }

                return;
            }

            if (
                adat.talalat
            ) {
                if (
                    adat.kesz
                ) {
                    gyozelmiHang();
                } else {
                    helyesBetuHang();
                }
            } else {
                hibasBetuHang();
            }

            varBeture =
                false;

            maganhangzoVasarlasMod =
                false;

            aktualisKerekErtek =
                null;

            if (
                betuMezo
            ) {
                betuMezo.value =
                    "";
            }

            kezelofeluletFrissites();
        }
    );

    socket.on(
        "megfejtesEredmeny",
        function (
            adat
        ) {
            if (
                megfejtesUzenet
            ) {
                megfejtesUzenet.textContent =
                    adat.uzenet ||
                    "";
            }

            if (
                adat.helyes
            ) {
                gyozelmiHang();

                varBeture =
                    false;

                maganhangzoVasarlasMod =
                    false;

                aktualisKerekErtek =
                    null;

                return;
            }

            hibasBetuHang();

            aktualisKerekErtek =
                null;

            varBeture =
                false;

            maganhangzoVasarlasMod =
                false;

            kezelofeluletFrissites();
        }
    );
}

// ==================================================
// JÁTÉK INDÍTÁSA
// ==================================================

if (
    jatekInditasGomb
) {
    jatekInditasGomb.addEventListener(
        "click",
        function () {
            audioContextInditas();

            klikkHang();

            varakozoZeneLeallitas();

            jatekInditasGomb.disabled =
                true;

            if (
                socket
            ) {
                socket.emit(
                    "jatekInditas"
                );
            }
        }
    );
}

// ==================================================
// KATEGÓRIA KÜLDÉSE
// ==================================================

function kategoriaKuldes() {
    if (
        !socket ||
        !kategoriaraVar ||
        kategoriatValasztoId !==
            sajatJatekosId ||
        !kategoriaValaszto ||
        !kategoriaValaszto.value
    ) {
        return;
    }

    socket.emit(
        "kategoriaValasztas",
        kategoriaValaszto.value
    );
}

if (
    kategoriaValasztasGomb
) {
    kategoriaValasztasGomb.addEventListener(
        "click",
        function () {
            klikkHang();

            kategoriaKuldes();
        }
    );
}

if (
    kategoriaVeglegesitesGomb
) {
    kategoriaVeglegesitesGomb.addEventListener(
        "click",
        function () {
            if (
                socket
            ) {
                klikkHang();

                socket.emit(
                    "kategoriaVeglegesites"
                );
            }
        }
    );
}

if (
    kategoriaMasikGomb
) {
    kategoriaMasikGomb.addEventListener(
        "click",
        function () {
            if (
                socket
            ) {
                klikkHang();

                socket.emit(
                    "kategoriaMasikValasztas"
                );
            }
        }
    );
}

// ==================================================
// SZABAD FELADVÁNY
// ==================================================

function szabadFeladvanyKuldes() {
    if (
        !socket ||
        !szabadKategoriaMezo ||
        !szabadFeladvanyMezo
    ) {
        return;
    }

    const kategoria =
        szabadKategoriaMezo.value.trim();

    const feladvany =
        szabadFeladvanyMezo.value.trim();

    if (
        !kategoria ||
        !feladvany
    ) {
        return;
    }

    socket.emit(
        "szabadFeladvanyBekuldes",
        {
            kategoria:
                kategoria,

            feladvany:
                feladvany
        }
    );
}

if (
    szabadFeladvanyGomb
) {
    szabadFeladvanyGomb.addEventListener(
        "click",
        function () {
            klikkHang();

            szabadFeladvanyKuldes();
        }
    );
}

if (
    szabadKategoriaVisszaGomb
) {
    szabadKategoriaVisszaGomb.addEventListener(
        "click",
        function () {
            if (
                socket
            ) {
                klikkHang();

                socket.emit(
                    "szabadKategoriaVissza"
                );
            }
        }
    );
}

// ==================================================
// TÁVOLLÉT ÉS ÚJ KÖR
// ==================================================

if (
    tavolletGomb
) {
    tavolletGomb.addEventListener(
        "click",
        function () {
            if (
                socket
            ) {
                socket.emit(
                    "tavollet"
                );
            }
        }
    );
}

if (
    visszateresGomb
) {
    visszateresGomb.addEventListener(
        "click",
        function () {
            if (
                socket
            ) {
                socket.emit(
                    "visszateres"
                );
            }
        }
    );
}

if (
    ujKorGomb
) {
    ujKorGomb.addEventListener(
        "click",
        function () {
            if (
                socket
            ) {
                socket.emit(
                    "ujKorInditas"
                );
            }
        }
    );
}

// ==================================================
// PÖRGETÉS
// ==================================================

function porgetesInditas() {
    if (
        !socket ||
        !porgetesGomb ||
        porgetesGomb.disabled
    ) {
        return;
    }

    audioContextInditas();

    maganhangzoVasarlasMod =
        false;

    porgetesFolyamatban =
        true;

    varBeture =
        false;

    aktualisKerekErtek =
        null;

    kezelofeluletFrissites();

    if (
        kerekEredmeny
    ) {
        kerekEredmeny.textContent =
            "A kerék pörög...";
    }

    const eredmeny =
        KEREK_MEZOK[
            Math.floor(
                Math.random() *
                KEREK_MEZOK.length
            )
        ];

    socket.emit(
        "porgetesInditas",
        { ertek: eredmeny }
    );

    kerekAnimacio(
        eredmeny,
        function () {
            socket.emit(
                "porgetes",
                eredmeny
            );

            porgetesFolyamatban =
                false;

            if (
                eredmeny ===
                "CSŐD"
            ) {
                varBeture =
                    false;

                aktualisKerekErtek =
                    null;

                if (
                    kerekEredmeny
                ) {
                    kerekEredmeny.textContent =
                        "Csőd. Az összpontszáma lenullázódott.";
                }
            } else if (
                eredmeny ===
                "KIMARADSZ"
            ) {
                varBeture =
                    false;

                aktualisKerekErtek =
                    null;

                if (
                    kerekEredmeny
                ) {
                    kerekEredmeny.textContent =
                        "Kimaradsz.";
                }
            } else {
                aktualisKerekErtek =
                    eredmeny;

                varBeture =
                    true;

                if (
                    kerekEredmeny
                ) {
                    kerekEredmeny.textContent =
                        magyarPontszam(
                            eredmeny
                        ) +
                        " pont. Írjon egy betűt.";
                }
            }

            kezelofeluletFrissites();

            if (
                varBeture &&
                betuMezo &&
                !betuMezo.disabled
            ) {
                window.setTimeout(
                    function () {
                        betuMezo.focus();
                    },
                    50
                );
            }
        }
    );
}

if (
    porgetesGomb
) {
    porgetesGomb.addEventListener(
        "click",
        porgetesInditas
    );

    porgetesGomb.setAttribute(
        "aria-keyshortcuts",
        "Alt+P"
    );

    porgetesGomb.textContent =
        "Pörgetés (Alt+P)";
}

// ==================================================
// BETŰ KÜLDÉSE
// ==================================================

function betuKuldes() {
    if (
        !socket ||
        !betuMezo ||
        betuMezo.disabled ||
        !varBeture
    ) {
        return;
    }

    const betu = betuMezo.value.trim();

    if (!betu) {
        if (betuUzenet) {
            betuUzenet.textContent = "Adj meg egy betűt.";
        }
        betuMezo.focus();
        return;
    }

    const nagyBetu = betu.toLocaleUpperCase("hu-HU");

    if (!/^[A-ZÁÉÍÓÖŐÚÜŰ]$/.test(nagyBetu)) {
        if (betuUzenet) {
            betuUzenet.textContent = "Egyetlen magyar betűt adj meg.";
        }
        bemondas("Egyetlen magyar betűt adj meg.");
        betuMezo.focus();
        return;
    }

    socket.emit("betuValasztas", betu);
}

if (
    betuGomb
) {
    betuGomb.addEventListener(
        "click",
        betuKuldes
    );
}

if (
    betuMezo
) {
    betuMezo.addEventListener(
        "keydown",
        function (
            event
        ) {
            if (
                event.key ===
                "Enter"
            ) {
                event.preventDefault();

                betuKuldes();
            }
        }
    );
}

// ==================================================
// MEGFEJTÉS
// ==================================================

function megfejtesKuldes() {
    if (
        !socket ||
        !megfejtesMezo ||
        megfejtesMezo.disabled
    ) {
        return;
    }

    const megfejtes =
        megfejtesMezo.value.trim();

    if (
        !megfejtes
    ) {
        return;
    }

    socket.emit(
        "megfejtes",
        megfejtes
    );
}

if (
    megfejtesGomb
) {
    megfejtesGomb.addEventListener(
        "click",
        megfejtesKuldes
    );
}

if (
    megfejtesMezo
) {
    megfejtesMezo.addEventListener(
        "keydown",
        function (
            event
        ) {
            if (
                event.key ===
                "Enter"
            ) {
                event.preventDefault();

                megfejtesKuldes();
            }
        }
    );
}

// ==================================================
// JAWS-BARÁT GYORSBILLENTYŰK
// ==================================================

document.addEventListener(
    "keydown",
    function (
        event
    ) {
        if (
            event.key ===
                "Escape" &&
            sugoAblak &&
            !sugoAblak.hidden
        ) {
            event.preventDefault();

            sugoBezasa();

            return;
        }

        if (
            !event.altKey ||
            event.ctrlKey ||
            event.metaKey
        ) {
            return;
        }

        const billentyu =
            String(
                event.key ||
                ""
            ).toLocaleLowerCase(
                "hu-HU"
            );

        if (
            ![
                "p",
                "h",
                "s",
                "i"
            ].includes(
                billentyu
            )
        ) {
            return;
        }

        event.preventDefault();

        event.stopPropagation();

        if (
            billentyu ===
            "i"
        ) {
            sugoMegnyitasa();

            return;
        }

        if (
            billentyu ===
            "h"
        ) {
            hibasBetukFelolvasasa();

            return;
        }

        if (
            billentyu ===
            "s"
        ) {
            pontszamokFelolvasasa();

            return;
        }

        if (
            billentyu ===
            "p"
        ) {
            if (
                porgetesGomb &&
                !porgetesGomb.disabled
            ) {
                porgetesInditas();
            } else {
                bemondas(
                    "Most nem lehet pörgetni."
                );
            }
        }
    },
    true
);

// ==================================================
// BIZTONSÁGI FRISSÍTÉSEK
// ==================================================

window.addEventListener(
    "focus",
    kezelofeluletFrissites
);

window.addEventListener(
    "beforeunload",
    function () {
        varakozoZeneLeallitas();
    }
);

zeneGombFrissites();
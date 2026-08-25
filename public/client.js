console.log("client.js betöltve");

// ==================================================
// SZERENCSEKERÉK 1.0 - CLIENT.JS
// ==================================================

const uzenet = document.getElementById("uzenet");
const jatekosNev = document.getElementById("jatekosNev");
const szobaNev = document.getElementById("szobaNev");
const mindenkiSzobaGomb = document.getElementById("mindenkiSzobaGomb");
const csatlakozasGomb = document.getElementById("csatlakozasGomb");
const belepes = document.getElementById("belepes");

const jatekTer = document.getElementById("jatekTer");
const jatekCim = document.getElementById("jatekCim");
const jatekInfo = document.getElementById("jatekInfo");
const szobaCim = document.getElementById("szobaCim");
const szobaKijelzes = document.getElementById("szobaKijelzes");
const jatekosLetszam = document.getElementById("jatekosLetszam");
const jatekosLista = document.getElementById("jatekosLista");
const jatekInditasGomb = document.getElementById("jatekInditasGomb");
const szobaUzenet = document.getElementById("szobaUzenet");

const zeneGomb = document.getElementById("zeneGomb");

const chatPanel = document.getElementById("chatPanel");
const chatLista = document.getElementById("chatLista");
const chatMezo = document.getElementById("chatMezo");
const chatKuldesGomb = document.getElementById("chatKuldesGomb");
const chatUzenet = document.getElementById("chatUzenet");

const kategoriavalasztasPanel =
    document.getElementById("kategoriavalasztasPanel");

const kategoriavalasztasCim =
    document.getElementById("kategoriavalasztasCim");

const kategoriavalasztasInfo =
    document.getElementById("kategoriavalasztasInfo");

const kategoriaValaszto =
    document.getElementById("kategoriaValaszto");

const kategoriaValasztasGomb =
    document.getElementById("kategoriaValasztasGomb");

const kategoriaUzenet =
    document.getElementById("kategoriaUzenet");

const kategoriaMegerositesPanel =
    document.getElementById("kategoriaMegerositesPanel");

const kategoriaMegerositesCim =
    document.getElementById("kategoriaMegerositesCim");

const kategoriaMegerositesSzoveg =
    document.getElementById("kategoriaMegerositesSzoveg");

const kategoriaVeglegesitesGomb =
    document.getElementById("kategoriaVeglegesitesGomb");

const kategoriaMasikGomb =
    document.getElementById("kategoriaMasikGomb");

const kategoriaMegerositesUzenet =
    document.getElementById("kategoriaMegerositesUzenet");

const szabadFeladvanyPanel =
    document.getElementById("szabadFeladvanyPanel");

const szabadFeladvanyCim =
    document.getElementById("szabadFeladvanyCim");

const szabadKategoriaMezo =
    document.getElementById("szabadKategoriaMezo");

const szabadFeladvanyMezo =
    document.getElementById("szabadFeladvanyMezo");

const szabadFeladvanyGomb =
    document.getElementById("szabadFeladvanyGomb");

const szabadKategoriaVisszaGomb =
    document.getElementById("szabadKategoriaVisszaGomb");

const szabadFeladvanyUzenet =
    document.getElementById("szabadFeladvanyUzenet");

const soronLevoKijelzes =
    document.getElementById("soronLevoKijelzes");

const jatekPontLista =
    document.getElementById("jatekPontLista");

const tavolletGomb =
    document.getElementById("tavolletGomb");

const visszateresGomb =
    document.getElementById("visszateresGomb");

const ujKorGomb =
    document.getElementById("ujKorGomb");

const kategoriaKijelzes =
    document.getElementById("kategoriaKijelzes");

const betuSzamKijelzes =
    document.getElementById("betuSzamKijelzes");

const feladvanyKijelzes =
    document.getElementById("feladvanyKijelzes");

const akadalymentesFeladvanyInfo =
    document.getElementById("akadalymentesFeladvanyInfo");

const kerekGrafika =
    document.getElementById("kerekGrafika");

const kerekFeliratok =
    document.getElementById("kerekFeliratok");

const porgetesGomb =
    document.getElementById("porgetesGomb");

const kerekEredmeny =
    document.getElementById("kerekEredmeny");

const betuMezo =
    document.getElementById("betuMezo");

const betuGomb =
    document.getElementById("betuGomb");

const betuUzenet =
    document.getElementById("betuUzenet");

const hasznaltBetuk =
    document.getElementById("hasznaltBetuk");

const hibasBetuk =
    document.getElementById("hibasBetuk");

const megfejtesMezo =
    document.getElementById("megfejtesMezo");

const megfejtesGomb =
    document.getElementById("megfejtesGomb");

const megfejtesUzenet =
    document.getElementById("megfejtesUzenet");

const hibasMegfejtesek =
    document.getElementById("hibasMegfejtesek");

// ==================================================
// ÁLLAPOT
// ==================================================

const KEREK_MEZOK = [
    100,
    200,
    300,
    400,
    500,
    600,
    700,
    800,
    900,
    1000,
    "CSŐD",
    "KIMARADSZ"
];

let socket = null;

let sajatJatekosId = null;
let sajatJatekosNev = "";

let aktualisJatekosId = null;
let aktualisJatekosNev = "";

let kategoriatValasztoId = null;

let kategoriaraVar = false;
let kategoriaMegerositesreVar = false;
let kategoriaJelolt = "";

let szabadFeladvanyraVar = false;

let korLezart = false;

let aktualisKerekErtek = null;
let varBeture = false;
let porgetesFolyamatban = false;

let kerekForgas = 0;

let sajatTavol = false;
let sajatVisszaterKovetkezoKorban = false;

let jatekMarElindult = false;

// ==================================================
// SEGÉDFÜGGVÉNY
// ==================================================

function vanValodiSzamosKerekErtek() {
    return (
        typeof aktualisKerekErtek === "number" &&
        Number.isFinite(aktualisKerekErtek)
    );
}

// ==================================================
// HANGRENDSZER
// ==================================================

let audioContext = null;

function audioContextInditas() {
    if (!audioContext) {
        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (AudioContext) {
            audioContext =
                new AudioContext();
        }
    }

    if (
        audioContext &&
        audioContext.state === "suspended"
    ) {
        audioContext.resume();
    }
}

const klikkHangFajl =
    new Audio("/click.wav");

klikkHangFajl.preload =
    "auto";

const tapsHangFajl =
    new Audio(
        "/mixkit-clapping-indoors-3039.wav"
    );

tapsHangFajl.preload =
    "auto";

const varakozoZene =
    new Audio(
        "/Szerencsekerek.m4a"
    );

varakozoZene.preload =
    "auto";

varakozoZene.loop =
    false;

varakozoZene.volume =
    0.85;

let varakozoZeneSzol =
    false;

// ==================================================
// HANGOK
// ==================================================

function klikkHang() {
    try {
        klikkHangFajl.currentTime =
            0;

        klikkHangFajl
            .play()
            .catch(function () {});
    } catch (hiba) {
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
            .catch(function () {});

        window.setTimeout(
            function () {
                tapsHangFajl.pause();
                tapsHangFajl.currentTime =
                    0;
            },
            3500
        );
    } catch (hiba) {
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

    if (!audioContext) {
        return;
    }

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    const most =
        audioContext.currentTime;

    oscillator.type =
        tipus || "sine";

    oscillator.frequency.value =
        frekvencia;

    gain.gain.setValueAtTime(
        0.0001,
        most
    );

    gain.gain.exponentialRampToValueAtTime(
        hangero || 0.08,
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

    const most =
        audioContext.currentTime;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type =
        "sawtooth";

    oscillator.frequency.setValueAtTime(
        360,
        most
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        55,
        most + 1.15
    );

    gain.gain.setValueAtTime(
        0.0001,
        most
    );

    gain.gain.exponentialRampToValueAtTime(
        0.11,
        most + 0.025
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        most + 1.18
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
        most + 1.2
    );
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
    if (!zeneGomb) {
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

        const lejatszas =
            varakozoZene.play();

        if (
            lejatszas &&
            typeof lejatszas.then ===
            "function"
        ) {
            lejatszas
                .then(
                    function () {
                        varakozoZeneSzol =
                            true;

                        zeneGombFrissites();
                    }
                )
                .catch(
                    function (
                        hiba
                    ) {
                        console.log(
                            "A várakozó zene nem indult el:",
                            hiba
                        );

                        varakozoZeneSzol =
                            false;

                        zeneGombFrissites();
                    }
                );
        } else {
            varakozoZeneSzol =
                true;

            zeneGombFrissites();
        }
    } catch (hiba) {
        console.log(
            "Várakozó zene hiba:",
            hiba
        );

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
    } catch (hiba) {
        console.log(
            "Várakozó zene leállítási hiba:",
            hiba
        );
    }

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

            felirat.textContent =
                ertek ===
                "KIMARADSZ"
                    ? "Kimaradsz"
                    : ertek ===
                      "CSŐD"
                        ? "Csőd"
                        : ertek;

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
        !jatekPontLista
    ) {
        return;
    }

    jatekPontLista.innerHTML =
        "";

    if (
        !Array.isArray(
            jatekosok
        )
    ) {
        return;
    }

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
                jatekos.pont +
                " pont";

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
    if (
        !kategoriaMegerositesPanel
    ) {
        return;
    }

    kategoriaMegerositesPanel.hidden =
        !kategoriaMegerositesreVar;

    const enValasztok =
        kategoriaMegerositesreVar &&
        kategoriatValasztoId ===
        sajatJatekosId;

    if (
        kategoriaMegerositesSzoveg
    ) {
        kategoriaMegerositesSzoveg.textContent =
            kategoriaJelolt ||
            "";
    }

    if (
        kategoriaVeglegesitesGomb
    ) {
        kategoriaVeglegesitesGomb.disabled =
            !enValasztok;
    }

    if (
        kategoriaMasikGomb
    ) {
        kategoriaMasikGomb.disabled =
            !enValasztok;
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
        !kategoriaMegerositesreVar &&
        !szabadFeladvanyraVar;

    const vanSzamosKerekErtek =
        vanValodiSzamosKerekErtek();

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
            kategoriaMegerositesreVar
        ) {
            soronLevoKijelzes.textContent =
                kategoriatValasztoId ===
                sajatJatekosId
                    ? "Ön erősíti meg a kiválasztott kategóriát."
                    : "A kategória megerősítésére várunk.";
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
            vanSzamosKerekErtek;
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
} catch (hiba) {
    if (
        uzenet
    ) {
        uzenet.textContent =
            "A Socket.IO nem indult el.";
    }
}

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
            nev: nev,
            szoba: szoba
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
// SIKERES BELÉPÉS
// ==================================================

if (
    socket
) {
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
            if (
                uzenet
            ) {
                uzenet.textContent =
                    szoveg;
            }

            if (
                szobaUzenet
            ) {
                szobaUzenet.textContent =
                    szoveg;
            }

            if (
                kategoriaUzenet
            ) {
                kategoriaUzenet.textContent =
                    szoveg;
            }

            if (
                kategoriaMegerositesUzenet
            ) {
                kategoriaMegerositesUzenet.textContent =
                    szoveg;
            }

            if (
                szabadFeladvanyUzenet
            ) {
                szabadFeladvanyUzenet.textContent =
                    szoveg;
            }

            if (
                megfejtesUzenet
            ) {
                megfejtesUzenet.textContent =
                    szoveg;
            }

            if (
                csatlakozasGomb
            ) {
                csatlakozasGomb.disabled =
                    false;
            }

            kezelofeluletFrissites();
        }
    );
}

// ==================================================
// JÁTÉKOSLISTA
// ==================================================

if (
    socket
) {
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
                            jatekos.nev;

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
                            jatekos
                                .visszaterKovetkezoKorban
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
                                    jatekos
                                        .visszaterKovetkezoKorban
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

if (
    socket
) {
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

            if (
                jatekCim
            ) {
                jatekCim.focus();
            }
        }
    );
}

// ==================================================
// KATEGÓRIA
// ==================================================

if (
    socket
) {
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
}

function kategoriaKuldes() {
    if (
        !socket ||
        !kategoriaraVar ||
        kategoriatValasztoId !==
            sajatJatekosId ||
        !kategoriaValaszto
    ) {
        return;
    }

    const kategoria =
        kategoriaValaszto.value;

    if (
        !kategoria
    ) {
        return;
    }

    socket.emit(
        "kategoriaValasztas",
        kategoria
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
    socket
) {
    socket.on(
        "kategoriaMegerosites",
        function (
            adat
        ) {
            kategoriaraVar =
                false;

            kategoriaMegerositesreVar =
                true;

            kategoriaJelolt =
                adat.kategoria ||
                "";

            kezelofeluletFrissites();

            if (
                kategoriaMegerositesCim
            ) {
                kategoriaMegerositesCim.focus();
            }
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
                !socket
            ) {
                return;
            }

            klikkHang();

            socket.emit(
                "kategoriaVeglegesites"
            );
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
                !socket
            ) {
                return;
            }

            klikkHang();

            socket.emit(
                "kategoriaMasikValasztas"
            );
        }
    );
}

// ==================================================
// SZABAD KATEGÓRIA
// ==================================================

if (
    socket
) {
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
}

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
// TÁVOLLÉT
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
// ÚJ KÖR
// ==================================================

if (
    socket
) {
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

            porgetesFolyamatban =
                false;

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

            kezelofeluletFrissites();
        }
    );
}

// ==================================================
// JÁTÉKÁLLAPOT
// ==================================================

if (
    socket
) {
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

            kategoriaMegerositesreVar =
                Boolean(
                    adat.kategoriaMegerositesreVar
                );

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

            const szamosKerekErtek =
                vanValodiSzamosKerekErtek();

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
                !szamosKerekErtek
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

            if (
                feladvanyKijelzes
            ) {
                feladvanyKijelzes.textContent =
                    adat.feladvany ||
                    "";
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
                hasznaltBetuk.textContent =
                    adat.hasznaltBetuk &&
                    adat.hasznaltBetuk.length
                        ? "Választott betűk: " +
                          adat.hasznaltBetuk.join(
                              ", "
                          )
                        : "Választott betűk: még nincs.";
            }

            if (
                hibasBetuk
            ) {
                hibasBetuk.textContent =
                    adat.hibasBetuk &&
                    adat.hibasBetuk.length
                        ? "Hibás betűk: " +
                          adat.hibasBetuk.join(
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
                varBeture &&
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
                        "Csőd.";
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
                        eredmeny +
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
}

document.addEventListener(
    "keydown",
    function (
        event
    ) {
        if (
            event.key.toLowerCase() !==
            "p"
        ) {
            return;
        }

        const aktivElem =
            document.activeElement;

        if (
            aktivElem &&
            [
                "INPUT",
                "TEXTAREA",
                "SELECT"
            ].includes(
                aktivElem.tagName
            )
        ) {
            return;
        }

        if (
            !porgetesGomb ||
            porgetesGomb.disabled
        ) {
            return;
        }

        event.preventDefault();

        porgetesInditas();
    }
);

if (
    socket
) {
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
                        adat.ertek +
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
}

// ==================================================
// BETŰ
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

    const betu =
        betuMezo.value.trim();

    if (
        !betu
    ) {
        if (
            betuUzenet
        ) {
            betuUzenet.textContent =
                "Adj meg egy betűt.";
        }

        betuMezo.focus();

        return;
    }

    socket.emit(
        "betuValasztas",
        betu
    );
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

if (
    socket
) {
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

if (
    socket
) {
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

                aktualisKerekErtek =
                    null;

                if (
                    feladvanyKijelzes &&
                    adat.megfejtes
                ) {
                    feladvanyKijelzes.textContent =
                        adat.megfejtes;
                }

                return;
            }

            hibasBetuHang();

            aktualisKerekErtek =
                null;

            varBeture =
                false;

            kezelofeluletFrissites();
        }
    );
}

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
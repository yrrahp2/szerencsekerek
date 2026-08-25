// ==================================================
// SZERENCSEKERÉK 1.0
// SERVER.JS
// ==================================================

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const {
    KATEGORIAK,
    feladvanyValasztas
} = require("./feladványok");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;
const MAX_JATEKOS = 10;
const MAX_CHAT_UZENET = 50;
const MAX_CHAT_HOSSZ = 500;

const KEREK_ERTEKEK = [
    100, 200, 300, 400, 500, 600,
    700, 800, 900, 1000,
    "CSŐD", "KIMARADSZ"
];

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

const szobak = {};


// ==================================================
// SEGÉDFÜGGVÉNYEK
// ==================================================

function normalizalSzoveg(szoveg) {
    return String(szoveg || "")
        .trim()
        .toLocaleUpperCase("hu-HU")
        .replace(/\s+/g, " ");
}


function ujFeladvanyAllapot(kategoria, megfejtes) {
    return {
        kategoria,
        megfejtes,
        felfedettBetuk: [],
        hasznaltBetuk: [],
        hibasBetuk: [],
        hibasTippek: []
    };
}


function feladvanyMaszk(megfejtes, felfedettBetuk) {
    const felfedett = new Set(felfedettBetuk);

    return Array.from(megfejtes)
        .map(function (karakter) {

            if (karakter === " ") {
                return " ";
            }

            if (/[A-ZÁÉÍÓÖŐÚÜŰ]/i.test(karakter)) {

                const nagybetu =
                    karakter.toLocaleUpperCase("hu-HU");

                return felfedett.has(nagybetu)
                    ? karakter
                    : "_";
            }

            return karakter;
        })
        .join("");
}


function betukSzama(megfejtes) {
    return Array.from(megfejtes)
        .filter(function (karakter) {
            return /[A-ZÁÉÍÓÖŐÚÜŰ]/i.test(karakter);
        })
        .length;
}


function feladvanyKesz(feladvany) {

    if (!feladvany) {
        return false;
    }

    return !feladvanyMaszk(
        feladvany.megfejtes,
        feladvany.felfedettBetuk
    ).includes("_");
}


function engedelyezettKategoria(kategoria) {
    return (
        KATEGORIAK.includes(kategoria) ||
        kategoria === "Véletlenszerű kategória" ||
        kategoria === "Szabad kategória"
    );
}


function szobaAktivJatekos(szoba, socketId) {

    if (!szoba) {
        return null;
    }

    return szoba.jatekosok.find(
        function (jatekos) {
            return jatekos.id === socketId;
        }
    ) || null;
}


// ==================================================
// JÁTÉKOSLISTA
// ==================================================

function jatekosListaKuldes(szobaNev) {

    const szoba = szobak[szobaNev];

    if (!szoba) {
        return;
    }

    const lista =
        szoba.jatekosok.map(
            function (jatekos) {

                return {
                    id: jatekos.id,
                    nev: jatekos.nev,
                    pont: jatekos.pont,

                    host:
                        jatekos.id ===
                        szoba.hostId,

                    tavol:
                        Boolean(
                            jatekos.tavol
                        ),

                    visszaterKovetkezoKorban:
                        Boolean(
                            jatekos
                                .visszaterKovetkezoKorban
                        )
                };
            }
        );

    io.to(szobaNev).emit(
        "jatekosLista",
        {
            jatekosok: lista,
            hostId: szoba.hostId,
            maxJatekos: MAX_JATEKOS
        }
    );
}


// ==================================================
// AKTUÁLIS JÁTÉKOS
// ==================================================

function aktualisJatekos(szoba) {

    if (
        !szoba ||
        szoba.jatekosok.length === 0
    ) {
        return null;
    }

    const jatekos =
        szoba.jatekosok[
            szoba.soronLevoIndex
        ] || null;

    if (
        jatekos &&
        jatekos.tavol
    ) {
        return null;
    }

    return jatekos;
}


// ==================================================
// JÁTÉKÁLLAPOT
// ==================================================

function jatekAllapotKuldes(szobaNev) {

    const szoba =
        szobak[szobaNev];

    if (
        !szoba ||
        !szoba.jatekElindult
    ) {
        return;
    }

    const soronLevo =
        aktualisJatekos(szoba);

    const feladvany =
        szoba.feladvany;

    io.to(szobaNev).emit(
        "jatekAllapot",
        {
            kategoria:
                feladvany
                    ? feladvany.kategoria
                    : "",

            feladvany:
                feladvany
                    ? feladvanyMaszk(
                        feladvany.megfejtes,
                        feladvany.felfedettBetuk
                    )
                    : "",

            betuSzam:
                feladvany
                    ? betukSzama(
                        feladvany.megfejtes
                    )
                    : 0,

            hasznaltBetuk:
                feladvany
                    ? feladvany.hasznaltBetuk
                    : [],

            hibasBetuk:
                feladvany
                    ? feladvany.hibasBetuk
                    : [],

            hibasTippek:
                feladvany
                    ? feladvany.hibasTippek
                    : [],

            soronLevoId:
                soronLevo
                    ? soronLevo.id
                    : null,

            soronLevoNev:
                soronLevo
                    ? soronLevo.nev
                    : "",

            kategoriatValasztoId:
                szoba.kategoriatValasztoId,

            kategoriaraVar:
                Boolean(
                    szoba.kategoriaraVar
                ),

            kategoriaMegerositesreVar:
                Boolean(
                    szoba.kategoriaMegerositesreVar
                ),

            kategoriaJelolt:
                szoba.kategoriaJelolt || "",

            korLezart:
                Boolean(
                    szoba.korLezart
                ),

            szabadFeladvanyraVar:
                Boolean(
                    szoba.szabadFeladvanyraVar
                ),

            aktualisKerekErtek:
                szoba.aktualisKerekErtek,

            jatekosok:
                szoba.jatekosok.map(
                    function (jatekos) {
                        return {
                            id: jatekos.id,
                            nev: jatekos.nev,
                            pont: jatekos.pont,
                            tavol:
                                Boolean(
                                    jatekos.tavol
                                )
                        };
                    }
                )
        }
    );
}


// ==================================================
// ÚJ KÖR
// ==================================================

function ujKorInditas(
    szobaNev,
    kertKategoria
) {

    const szoba =
        szobak[szobaNev];

    if (!szoba) {
        return false;
    }

    szoba.jatekosok.forEach(
        function (jatekos) {

            if (
                jatekos
                    .visszaterKovetkezoKorban
            ) {
                jatekos.tavol =
                    false;

                jatekos
                    .visszaterKovetkezoKorban =
                    false;
            }
        }
    );

    const valasztott =
        feladvanyValasztas(
            kertKategoria
        );

    if (
        !valasztott ||
        !valasztott.megfejtes
    ) {
        return false;
    }

    szoba.feladvany =
        ujFeladvanyAllapot(
            valasztott.kategoria,
            valasztott.megfejtes
        );

    szoba.kategoriaraVar =
        false;

    szoba.kategoriaMegerositesreVar =
        false;

    szoba.kategoriaJelolt =
        null;

    szoba.kategoriatValasztoId =
        null;

    szoba.aktualisKerekErtek =
        null;

    szoba.korLezart =
        false;

    szoba.szabadFeladvanyraVar =
        false;

    jatekAllapotKuldes(
        szobaNev
    );

    io.to(szobaNev).emit(
        "ujKor",
        {
            kategoria:
                valasztott.kategoria
        }
    );

    return true;
}


// ==================================================
// KATEGÓRIAVÁLASZTÁS INDÍTÁSA
// ==================================================

function kategoriavalasztasInditas(
    szobaNev,
    jatekosId
) {

    const szoba =
        szobak[szobaNev];

    if (!szoba) {
        return;
    }

    szoba.kategoriaraVar =
        true;

    szoba.kategoriaMegerositesreVar =
        false;

    szoba.kategoriaJelolt =
        null;

    szoba.szabadFeladvanyraVar =
        false;

    szoba.kategoriatValasztoId =
        jatekosId;

    szoba.feladvany =
        null;

    szoba.aktualisKerekErtek =
        null;

    jatekAllapotKuldes(
        szobaNev
    );

    io.to(szobaNev).emit(
        "kategoriavalasztas",
        {
            jatekosId:
                jatekosId,

            kategoriak: [
                ...KATEGORIAK,
                "Véletlenszerű kategória",
                "Szabad kategória"
            ]
        }
    );
}


// ==================================================
// KÖVETKEZŐ JÁTÉKOS
// ==================================================

function kovetkezoJatekos(szoba) {

    if (
        !szoba ||
        szoba.jatekosok.length === 0
    ) {
        return;
    }

    const indulasiIndex =
        szoba.soronLevoIndex;

    let probalkozas =
        0;

    do {

        szoba.soronLevoIndex =
            (
                szoba.soronLevoIndex +
                1
            ) %
            szoba.jatekosok.length;

        probalkozas +=
            1;

        const jelolt =
            szoba.jatekosok[
                szoba.soronLevoIndex
            ];

        if (
            jelolt &&
            !jelolt.tavol
        ) {

            szoba.aktualisKerekErtek =
                null;

            return;
        }

    } while (
        probalkozas <
        szoba.jatekosok.length
    );

    szoba.soronLevoIndex =
        indulasiIndex;

    szoba.aktualisKerekErtek =
        null;
}


// ==================================================
// SOCKET.IO
// ==================================================

io.on(
    "connection",
    function (socket) {

        console.log(
            "Kapcsolódott:",
            socket.id
        );


        // ==========================================
        // CSATLAKOZÁS
        // ==========================================

        socket.on(
            "csatlakozas",
            function (adat) {

                const nev =
                    String(
                        adat &&
                        adat.nev
                            ? adat.nev
                            : ""
                    ).trim();

                const szobaNev =
                    String(
                        adat &&
                        adat.szoba
                            ? adat.szoba
                            : ""
                    ).trim();

                if (
                    !nev ||
                    !szobaNev
                ) {

                    socket.emit(
                        "hiba",
                        "A játékos nevét és a szoba nevét is meg kell adni."
                    );

                    return;
                }

                if (!szobak[szobaNev]) {

                    szobak[szobaNev] = {
                        hostId:
                            socket.id,

                        jatekosok:
                            [],

                        jatekElindult:
                            false,

                        soronLevoIndex:
                            0,

                        feladvany:
                            null,

                        aktualisKerekErtek:
                            null,

                        kategoriaraVar:
                            false,

                        kategoriaMegerositesreVar:
                            false,

                        kategoriaJelolt:
                            null,

                        kategoriatValasztoId:
                            null,

                        korLezart:
                            false,

                        szabadFeladvanyraVar:
                            false,

                        chatUzenetek:
                            []
                    };
                }

                const szoba =
                    szobak[szobaNev];

                if (
                    szoba.jatekElindult
                ) {

                    socket.emit(
                        "hiba",
                        "Ebben a szobában már elindult a játék."
                    );

                    return;
                }

                if (
                    szoba.jatekosok.length >=
                    MAX_JATEKOS
                ) {

                    socket.emit(
                        "hiba",
                        "A szoba megtelt."
                    );

                    return;
                }

                const nevFoglalt =
                    szoba.jatekosok.some(
                        function (jatekos) {

                            return (
                                jatekos.nev
                                    .toLocaleLowerCase(
                                        "hu-HU"
                                    ) ===
                                nev
                                    .toLocaleLowerCase(
                                        "hu-HU"
                                    )
                            );
                        }
                    );

                if (
                    nevFoglalt
                ) {

                    socket.emit(
                        "hiba",
                        "Ez a játékosnév már foglalt ebben a szobában."
                    );

                    return;
                }

                socket.join(
                    szobaNev
                );

                socket.data.szobaNev =
                    szobaNev;

                socket.data.jatekosNev =
                    nev;

                szoba.jatekosok.push(
                    {
                        id:
                            socket.id,

                        nev:
                            nev,

                        pont:
                            0,

                        tavol:
                            false,

                        visszaterKovetkezoKorban:
                            false
                    }
                );

                socket.emit(
                    "csatlakozasSikeres",
                    {
                        id:
                            socket.id,

                        nev:
                            nev,

                        szoba:
                            szobaNev,

                        host:
                            socket.id ===
                            szoba.hostId
                    }
                );

                jatekosListaKuldes(
                    szobaNev
                );

                socket.emit(
                    "chatElozmeny",
                    Array.isArray(
                        szoba.chatUzenetek
                    )
                        ? szoba.chatUzenetek
                        : []
                );
            }
        );


        // ==========================================
        // CHAT
        // ==========================================

        socket.on(
            "chatUzenet",
            function (uzenetSzoveg) {

                const szobaNev =
                    socket.data.szobaNev;

                const szoba =
                    szobak[szobaNev];

                if (!szoba) {
                    return;
                }

                const jatekos =
                    szobaAktivJatekos(
                        szoba,
                        socket.id
                    );

                if (!jatekos) {
                    return;
                }

                const tisztaUzenet =
                    String(
                        uzenetSzoveg || ""
                    ).trim();

                if (!tisztaUzenet) {

                    socket.emit(
                        "chatHiba",
                        "Az üzenet nem lehet üres."
                    );

                    return;
                }

                if (
                    tisztaUzenet.length >
                    MAX_CHAT_HOSSZ
                ) {

                    socket.emit(
                        "chatHiba",
                        "Egy chatüzenet legfeljebb 500 karakter lehet."
                    );

                    return;
                }

                const chatAdat = {
                    nev:
                        jatekos.nev,

                    uzenet:
                        tisztaUzenet,

                    ido:
                        new Date()
                            .toISOString()
                };

                if (
                    !Array.isArray(
                        szoba.chatUzenetek
                    )
                ) {

                    szoba.chatUzenetek =
                        [];
                }

                szoba.chatUzenetek.push(
                    chatAdat
                );

                if (
                    szoba.chatUzenetek.length >
                    MAX_CHAT_UZENET
                ) {

                    szoba.chatUzenetek =
                        szoba.chatUzenetek.slice(
                            -MAX_CHAT_UZENET
                        );
                }

                io.to(szobaNev).emit(
                    "chatUzenet",
                    chatAdat
                );
            }
        );


        // ==========================================
        // JÁTÉK INDÍTÁSA
        // ==========================================

        socket.on(
            "jatekInditas",
            function () {

                const szobaNev =
                    socket.data.szobaNev;

                const szoba =
                    szobak[szobaNev];

                if (!szoba) {
                    return;
                }

                if (
                    socket.id !==
                    szoba.hostId
                ) {

                    socket.emit(
                        "hiba",
                        "Csak a szoba létrehozója indíthatja el a játékot."
                    );

                    return;
                }

                const elsoAktivIndex =
                    szoba.jatekosok.findIndex(
                        function (jatekos) {
                            return (
                                !jatekos.tavol
                            );
                        }
                    );

                if (
                    elsoAktivIndex ===
                    -1
                ) {

                    socket.emit(
                        "hiba",
                        "Jelenleg minden játékos távol van."
                    );

                    return;
                }

                szoba.jatekElindult =
                    true;

                szoba.soronLevoIndex =
                    elsoAktivIndex;

                szoba.korLezart =
                    false;

                io.to(szobaNev).emit(
                    "jatekElindult"
                );

                kategoriavalasztasInditas(
                    szobaNev,
                    szoba.hostId
                );
            }
        );


        // ==========================================
        // KATEGÓRIA KIVÁLASZTÁSA
        // MÉG NEM VÉGLEGES
        // ==========================================

        socket.on(
            "kategoriaValasztas",
            function (kategoria) {

                const szobaNev =
                    socket.data.szobaNev;

                const szoba =
                    szobak[szobaNev];

                if (
                    !szoba ||
                    !szoba.kategoriaraVar
                ) {
                    return;
                }

                if (
                    socket.id !==
                    szoba.kategoriatValasztoId
                ) {

                    socket.emit(
                        "hiba",
                        "Most nem Ön választ kategóriát."
                    );

                    return;
                }

                if (
                    !engedelyezettKategoria(
                        kategoria
                    )
                ) {

                    socket.emit(
                        "hiba",
                        "Ismeretlen kategória."
                    );

                    return;
                }

                szoba.kategoriaJelolt =
                    kategoria;

                szoba.kategoriaraVar =
                    false;

                szoba.kategoriaMegerositesreVar =
                    true;

                socket.emit(
                    "kategoriaMegerosites",
                    {
                        kategoria:
                            kategoria,

                        uzenet:
                            "Ezt a kategóriát választotta. Véglegesítheti, vagy választhat másikat."
                    }
                );

                jatekAllapotKuldes(
                    szobaNev
                );
            }
        );


        // ==========================================
        // MÁSik KATEGÓRIA VÁLASZTÁSA
        // ==========================================

        socket.on(
            "kategoriaMasikValasztas",
            function () {

                const szobaNev =
                    socket.data.szobaNev;

                const szoba =
                    szobak[szobaNev];

                if (!szoba) {
                    return;
                }

                if (
                    socket.id !==
                    szoba.kategoriatValasztoId
                ) {

                    socket.emit(
                        "hiba",
                        "Most nem Ön választ kategóriát."
                    );

                    return;
                }

                if (
                    !szoba.kategoriaMegerositesreVar
                ) {
                    return;
                }

                szoba.kategoriaJelolt =
                    null;

                szoba.kategoriaMegerositesreVar =
                    false;

                szoba.kategoriaraVar =
                    true;

                socket.emit(
                    "kategoriavalasztas",
                    {
                        jatekosId:
                            socket.id,

                        kategoriak: [
                            ...KATEGORIAK,
                            "Véletlenszerű kategória",
                            "Szabad kategória"
                        ]
                    }
                );

                jatekAllapotKuldes(
                    szobaNev
                );
            }
        );


        // ==========================================
        // KATEGÓRIA VÉGLEGESÍTÉSE
        // ==========================================

        socket.on(
            "kategoriaVeglegesites",
            function () {

                const szobaNev =
                    socket.data.szobaNev;

                const szoba =
                    szobak[szobaNev];

                if (!szoba) {
                    return;
                }

                if (
                    socket.id !==
                    szoba.kategoriatValasztoId
                ) {

                    socket.emit(
                        "hiba",
                        "Most nem Ön véglegesíti a kategóriát."
                    );

                    return;
                }

                if (
                    !szoba.kategoriaMegerositesreVar ||
                    !szoba.kategoriaJelolt
                ) {

                    socket.emit(
                        "hiba",
                        "Nincs véglegesíthető kategória."
                    );

                    return;
                }

                const kategoria =
                    szoba.kategoriaJelolt;

                if (
                    kategoria ===
                    "Szabad kategória"
                ) {

                    szoba.kategoriaMegerositesreVar =
                        false;

                    szoba.kategoriaJelolt =
                        null;

                    szoba.szabadFeladvanyraVar =
                        true;

                    szoba.feladvany =
                        null;

                    socket.emit(
                        "szabadFeladvanyKeres",
                        {
                            uzenet:
                                "Írja be a kategória megnevezését és a saját feladványt."
                        }
                    );

                    jatekAllapotKuldes(
                        szobaNev
                    );

                    return;
                }

                ujKorInditas(
                    szobaNev,
                    kategoria
                );
            }
        );


        // ==========================================
        // SZABAD KATEGÓRIÁBÓL VISSZA
        // ==========================================

        socket.on(
            "szabadKategoriaVissza",
            function () {

                const szobaNev =
                    socket.data.szobaNev;

                const szoba =
                    szobak[szobaNev];

                if (!szoba) {
                    return;
                }

                if (
                    socket.id !==
                        szoba.kategoriatValasztoId ||
                    !szoba.szabadFeladvanyraVar
                ) {
                    return;
                }

                szoba.szabadFeladvanyraVar =
                    false;

                szoba.kategoriaraVar =
                    true;

                szoba.kategoriaMegerositesreVar =
                    false;

                szoba.kategoriaJelolt =
                    null;

                socket.emit(
                    "kategoriavalasztas",
                    {
                        jatekosId:
                            socket.id,

                        kategoriak: [
                            ...KATEGORIAK,
                            "Véletlenszerű kategória",
                            "Szabad kategória"
                        ]
                    }
                );

                jatekAllapotKuldes(
                    szobaNev
                );
            }
        );


        // ==========================================
        // SZABAD FELADVÁNY
        // ==========================================

        socket.on(
            "szabadFeladvanyBekuldes",
            function (adat) {

                const szobaNev =
                    socket.data.szobaNev;

                const szoba =
                    szobak[szobaNev];

                if (
                    !szoba ||
                    !szoba.szabadFeladvanyraVar ||
                    socket.id !==
                        szoba.kategoriatValasztoId
                ) {
                    return;
                }

                const sajatKategoria =
                    String(
                        adat &&
                        typeof adat === "object"
                            ? adat.kategoria
                            : ""
                    ).trim();

                const sajatFeladvany =
                    normalizalSzoveg(
                        adat &&
                        typeof adat === "object"
                            ? adat.feladvany
                            : ""
                    );

                if (
                    !sajatKategoria
                ) {

                    socket.emit(
                        "hiba",
                        "A kategória megnevezése nem lehet üres."
                    );

                    return;
                }

                if (
                    sajatKategoria.length >
                    100
                ) {

                    socket.emit(
                        "hiba",
                        "A kategória megnevezése legfeljebb 100 karakter lehet."
                    );

                    return;
                }

                if (
                    !sajatFeladvany
                ) {

                    socket.emit(
                        "hiba",
                        "A szabad feladvány nem lehet üres."
                    );

                    return;
                }

                szoba.feladvany =
                    ujFeladvanyAllapot(
                        sajatKategoria,
                        sajatFeladvany
                    );

                szoba.szabadFeladvanyraVar =
                    false;

                szoba.kategoriatValasztoId =
                    null;

                szoba.kategoriaMegerositesreVar =
                    false;

                szoba.kategoriaJelolt =
                    null;

                szoba.aktualisKerekErtek =
                    null;

                szoba.korLezart =
                    false;

                jatekAllapotKuldes(
                    szobaNev
                );

                io.to(szobaNev).emit(
                    "ujKor",
                    {
                        kategoria:
                            sajatKategoria
                    }
                );
            }
        );


        // ==========================================
        // TÁVOLLÉT
        // ==========================================

        socket.on(
            "tavollet",
            function () {

                const szobaNev =
                    socket.data.szobaNev;

                const szoba =
                    szobak[szobaNev];

                if (!szoba) {
                    return;
                }

                const index =
                    szoba.jatekosok.findIndex(
                        function (jatekos) {
                            return (
                                jatekos.id ===
                                socket.id
                            );
                        }
                    );

                if (
                    index === -1
                ) {
                    return;
                }

                szoba.jatekosok[index]
                    .tavol =
                    true;

                szoba.jatekosok[index]
                    .visszaterKovetkezoKorban =
                    false;

                if (
                    szoba.jatekElindult &&
                    szoba.soronLevoIndex ===
                    index
                ) {

                    kovetkezoJatekos(
                        szoba
                    );
                }

                jatekosListaKuldes(
                    szobaNev
                );

                if (
                    szoba.jatekElindult
                ) {

                    jatekAllapotKuldes(
                        szobaNev
                    );
                }
            }
        );


        // ==========================================
        // VISSZATÉRÉS
        // ==========================================

        socket.on(
            "visszateres",
            function () {

                const szobaNev =
                    socket.data.szobaNev;

                const szoba =
                    szobak[szobaNev];

                if (!szoba) {
                    return;
                }

                const jatekos =
                    szobaAktivJatekos(
                        szoba,
                        socket.id
                    );

                if (!jatekos) {
                    return;
                }

                if (
                    szoba.jatekElindult &&
                    !szoba.korLezart
                ) {

                    jatekos
                        .visszaterKovetkezoKorban =
                        true;

                } else {

                    jatekos.tavol =
                        false;

                    jatekos
                        .visszaterKovetkezoKorban =
                        false;
                }

                jatekosListaKuldes(
                    szobaNev
                );
            }
        );


        // ==========================================
        // ÚJ KÖR
        // ==========================================

        socket.on(
            "ujKorInditas",
            function () {

                const szobaNev =
                    socket.data.szobaNev;

                const szoba =
                    szobak[szobaNev];

                if (
                    !szoba ||
                    !szoba.jatekElindult ||
                    !szoba.korLezart
                ) {
                    return;
                }

                const jatekos =
                    szobaAktivJatekos(
                        szoba,
                        socket.id
                    );

                if (
                    !jatekos ||
                    jatekos.tavol
                ) {

                    socket.emit(
                        "hiba",
                        "Távol lévő játékos nem indíthat új kört."
                    );

                    return;
                }

                szoba.jatekosok.forEach(
                    function (elem) {

                        if (
                            elem
                                .visszaterKovetkezoKorban
                        ) {

                            elem.tavol =
                                false;

                            elem
                                .visszaterKovetkezoKorban =
                                false;
                        }
                    }
                );

                szoba.korLezart =
                    false;

                kategoriavalasztasInditas(
                    szobaNev,
                    socket.id
                );

                jatekosListaKuldes(
                    szobaNev
                );
            }
        );


        // ==========================================
        // PÖRGETÉS
        // ==========================================

        socket.on(
            "porgetes",
            function (ertek) {

                const szobaNev =
                    socket.data.szobaNev;

                const szoba =
                    szobak[szobaNev];

                if (
                    !szoba ||
                    !szoba.feladvany ||
                    szoba.kategoriaraVar ||
                    szoba.kategoriaMegerositesreVar ||
                    szoba.szabadFeladvanyraVar ||
                    szoba.korLezart
                ) {
                    return;
                }

                const soronLevo =
                    aktualisJatekos(
                        szoba
                    );

                if (
                    !soronLevo ||
                    soronLevo.id !==
                    socket.id
                ) {
                    return;
                }

                if (
                    !KEREK_ERTEKEK.includes(
                        ertek
                    )
                ) {

                    socket.emit(
                        "hiba",
                        "Érvénytelen kerékérték."
                    );

                    return;
                }

                szoba.aktualisKerekErtek =
                    ertek;

                if (
                    ertek ===
                    "CSŐD"
                ) {

                    soronLevo.pont =
                        0;

                    kovetkezoJatekos(
                        szoba
                    );

                    io.to(szobaNev).emit(
                        "porgetesEredmeny",
                        {
                            jatekosId:
                                socket.id,

                            ertek:
                                ertek,

                            betuJohet:
                                false
                        }
                    );

                    jatekosListaKuldes(
                        szobaNev
                    );

                    jatekAllapotKuldes(
                        szobaNev
                    );

                    return;
                }

                if (
                    ertek ===
                    "KIMARADSZ"
                ) {

                    kovetkezoJatekos(
                        szoba
                    );

                    io.to(szobaNev).emit(
                        "porgetesEredmeny",
                        {
                            jatekosId:
                                socket.id,

                            ertek:
                                ertek,

                            betuJohet:
                                false
                        }
                    );

                    jatekAllapotKuldes(
                        szobaNev
                    );

                    return;
                }

                socket.emit(
                    "porgetesEredmeny",
                    {
                        jatekosId:
                            socket.id,

                        ertek:
                            ertek,

                        betuJohet:
                            true
                    }
                );

                jatekAllapotKuldes(
                    szobaNev
                );
            }
        );


        // ==========================================
        // BETŰ
        // ==========================================

        socket.on(
            "betuValasztas",
            function (betu) {

                const szobaNev =
                    socket.data.szobaNev;

                const szoba =
                    szobak[szobaNev];

                if (
                    !szoba ||
                    !szoba.feladvany ||
                    szoba.kategoriaraVar ||
                    szoba.kategoriaMegerositesreVar ||
                    szoba.szabadFeladvanyraVar ||
                    szoba.korLezart
                ) {
                    return;
                }

                const soronLevo =
                    aktualisJatekos(
                        szoba
                    );

                if (
                    !soronLevo ||
                    soronLevo.id !==
                    socket.id
                ) {
                    return;
                }

                const kerekErtek =
                    Number(
                        szoba
                            .aktualisKerekErtek
                    );

                if (
                    !Number.isFinite(
                        kerekErtek
                    )
                ) {

                    socket.emit(
                        "betuEredmeny",
                        {
                            siker:
                                false,

                            uzenet:
                                "Előbb pörgesse meg a kereket."
                        }
                    );

                    return;
                }

                const tisztaBetu =
                    normalizalSzoveg(
                        betu
                    );

                if (
                    !/^[A-ZÁÉÍÓÖŐÚÜŰ]$/
                        .test(
                            tisztaBetu
                        )
                ) {

                    socket.emit(
                        "betuEredmeny",
                        {
                            siker:
                                false,

                            uzenet:
                                "Egyetlen magyar betűt adjon meg."
                        }
                    );

                    return;
                }

                if (
                    szoba.feladvany
                        .hasznaltBetuk
                        .includes(
                            tisztaBetu
                        )
                ) {

                    socket.emit(
                        "betuEredmeny",
                        {
                            siker:
                                false,

                            uzenet:
                                "Ezt a betűt már választották."
                        }
                    );

                    return;
                }

                szoba.feladvany
                    .hasznaltBetuk
                    .push(
                        tisztaBetu
                    );

                const darab =
                    Array.from(
                        szoba.feladvany
                            .megfejtes
                    )
                        .map(
                            function (karakter) {
                                return karakter
                                    .toLocaleUpperCase(
                                        "hu-HU"
                                    );
                            }
                        )
                        .filter(
                            function (karakter) {
                                return (
                                    karakter ===
                                    tisztaBetu
                                );
                            }
                        )
                        .length;

                if (
                    darab >
                    0
                ) {

                    szoba.feladvany
                        .felfedettBetuk
                        .push(
                            tisztaBetu
                        );

                    soronLevo.pont +=
                        kerekErtek *
                        darab;

                    const kesz =
                        feladvanyKesz(
                            szoba.feladvany
                        );

                    const teljesMegfejtes =
                        szoba.feladvany
                            .megfejtes;

                    socket.emit(
                        "betuEredmeny",
                        {
                            siker:
                                true,

                            talalat:
                                true,

                            betu:
                                tisztaBetu,

                            darab:
                                darab,

                            kesz:
                                kesz,

                            megfejtes:
                                kesz
                                    ? teljesMegfejtes
                                    : null,

                            uzenet:
                                kesz
                                    ? "A feladvány teljesen elkészült."
                                    : "A betű szerepel a feladványban."
                        }
                    );

                    szoba.aktualisKerekErtek =
                        null;

                    jatekosListaKuldes(
                        szobaNev
                    );

                    jatekAllapotKuldes(
                        szobaNev
                    );

                    if (
                        kesz
                    ) {

                        szoba.korLezart =
                            true;

                        io.to(szobaNev).emit(
                            "korVege",
                            {
                                uzenet:
                                    "A kör véget ért. Bármelyik aktív játékos indíthat új kört."
                            }
                        );

                        jatekAllapotKuldes(
                            szobaNev
                        );
                    }

                    return;
                }

                if (
                    !szoba.feladvany
                        .hibasBetuk
                        .includes(
                            tisztaBetu
                        )
                ) {

                    szoba.feladvany
                        .hibasBetuk
                        .push(
                            tisztaBetu
                        );
                }

                socket.emit(
                    "betuEredmeny",
                    {
                        siker:
                            true,

                        talalat:
                            false,

                        betu:
                            tisztaBetu,

                        darab:
                            0,

                        kesz:
                            false,

                        uzenet:
                            "A betű nem szerepel a feladványban."
                    }
                );

                szoba.aktualisKerekErtek =
                    null;

                kovetkezoJatekos(
                    szoba
                );

                jatekAllapotKuldes(
                    szobaNev
                );
            }
        );


        // ==========================================
        // TELJES MEGFEJTÉS
        // ==========================================

        socket.on(
            "megfejtes",
            function (tipp) {

                const szobaNev =
                    socket.data.szobaNev;

                const szoba =
                    szobak[szobaNev];

                if (
                    !szoba ||
                    !szoba.feladvany ||
                    szoba.kategoriaraVar ||
                    szoba.kategoriaMegerositesreVar ||
                    szoba.szabadFeladvanyraVar ||
                    szoba.korLezart
                ) {
                    return;
                }

                const soronLevo =
                    aktualisJatekos(
                        szoba
                    );

                if (
                    !soronLevo ||
                    soronLevo.id !==
                    socket.id
                ) {

                    socket.emit(
                        "megfejtesEredmeny",
                        {
                            helyes:
                                false,

                            uzenet:
                                "Most nem Ön van soron."
                        }
                    );

                    return;
                }

                const tisztaTipp =
                    normalizalSzoveg(
                        tipp
                    );

                const helyesMegfejtes =
                    normalizalSzoveg(
                        szoba.feladvany
                            .megfejtes
                    );

                if (
                    !tisztaTipp
                ) {

                    socket.emit(
                        "megfejtesEredmeny",
                        {
                            helyes:
                                false,

                            uzenet:
                                "Írja be a megfejtést."
                        }
                    );

                    return;
                }

                if (
                    tisztaTipp ===
                    helyesMegfejtes
                ) {

                    const teljesMegfejtes =
                        szoba.feladvany
                            .megfejtes;

                    io.to(szobaNev).emit(
                        "megfejtesEredmeny",
                        {
                            helyes:
                                true,

                            jatekosId:
                                socket.id,

                            jatekosNev:
                                soronLevo.nev,

                            megfejtes:
                                teljesMegfejtes,

                            uzenet:
                                soronLevo.nev +
                                " megfejtette a feladványt!"
                        }
                    );

                    szoba.korLezart =
                        true;

                    io.to(szobaNev).emit(
                        "korVege",
                        {
                            uzenet:
                                "A kör véget ért. Bármelyik aktív játékos indíthat új kört."
                        }
                    );

                    jatekAllapotKuldes(
                        szobaNev
                    );

                    return;
                }

                if (
                    !szoba.feladvany
                        .hibasTippek
                        .includes(
                            tisztaTipp
                        )
                ) {

                    szoba.feladvany
                        .hibasTippek
                        .push(
                            tisztaTipp
                        );
                }

                socket.emit(
                    "megfejtesEredmeny",
                    {
                        helyes:
                            false,

                        uzenet:
                            "A megfejtés nem helyes."
                    }
                );

                kovetkezoJatekos(
                    szoba
                );

                jatekAllapotKuldes(
                    szobaNev
                );
            }
        );


        // ==========================================
        // KAPCSOLAT BONTÁSA
        // ==========================================

        socket.on(
            "disconnect",
            function () {

                const szobaNev =
                    socket.data.szobaNev;

                if (
                    !szobaNev ||
                    !szobak[szobaNev]
                ) {
                    return;
                }

                const szoba =
                    szobak[szobaNev];

                const tavozottIndex =
                    szoba.jatekosok
                        .findIndex(
                            function (jatekos) {
                                return (
                                    jatekos.id ===
                                    socket.id
                                );
                            }
                        );

                if (
                    tavozottIndex !==
                    -1
                ) {

                    szoba.jatekosok.splice(
                        tavozottIndex,
                        1
                    );
                }

                if (
                    szoba.jatekosok.length ===
                    0
                ) {

                    delete szobak[
                        szobaNev
                    ];

                    return;
                }

                if (
                    socket.id ===
                    szoba.hostId
                ) {

                    szoba.hostId =
                        szoba.jatekosok[
                            0
                        ].id;
                }

                if (
                    szoba.soronLevoIndex >=
                    szoba.jatekosok.length
                ) {

                    szoba.soronLevoIndex =
                        0;
                }

                if (
                    szoba.kategoriatValasztoId ===
                    socket.id
                ) {

                    szoba.kategoriatValasztoId =
                        szoba.hostId;

                    szoba.kategoriaJelolt =
                        null;

                    szoba.kategoriaMegerositesreVar =
                        false;

                    szoba.szabadFeladvanyraVar =
                        false;

                    szoba.kategoriaraVar =
                        true;
                }

                jatekosListaKuldes(
                    szobaNev
                );

                if (
                    szoba.jatekElindult
                ) {

                    jatekAllapotKuldes(
                        szobaNev
                    );
                }
            }
        );
    }
);


// ==================================================
// SZERVER INDÍTÁSA
// ==================================================

server.listen(
    PORT,
    function () {

        console.log(
            "Szerencsekerék szerver fut:"
        );

        console.log(
            "http://localhost:" +
            PORT
        );
    }
);
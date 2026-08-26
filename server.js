// ==================================================
// SZERENCSEKERÉK 1.1
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

// ==================================================
// BEÁLLÍTÁSOK
// ==================================================

const PORT =
    process.env.PORT || 3000;

const MAX_JATEKOS =
    10;

const MAX_CHAT_UZENET =
    50;

const MAX_CHAT_HOSSZ =
    500;

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

const KEREK_ERTEKEK = [
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

// ==================================================
// PUBLIC MAPPA
// ==================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);

// ==================================================
// SZOBÁK
// ==================================================

const szobak = {};

// ==================================================
// SEGÉDFÜGGVÉNYEK
// ==================================================

function normalizalSzoveg(
    szoveg
) {
    return String(
        szoveg || ""
    )
        .trim()
        .toLocaleUpperCase(
            "hu-HU"
        )
        .replace(
            /\s+/g,
            " "
        );
}

function maganhangzoE(
    betu
) {
    return MAGANHANGZOK.has(
        normalizalSzoveg(
            betu
        )
    );
}

function ujFeladvanyAllapot(
    kategoria,
    megfejtes
) {
    return {
        kategoria:
            kategoria,

        megfejtes:
            megfejtes,

        felfedettBetuk:
            [],

        hasznaltBetuk:
            [],

        hibasBetuk:
            [],

        hibasTippek:
            []
    };
}

function feladvanyMaszk(
    megfejtes,
    felfedettBetuk
) {
    const felfedett =
        new Set(
            felfedettBetuk
        );

    return Array.from(
        megfejtes
    )
        .map(
            function (
                karakter
            ) {
                if (
                    karakter ===
                    " "
                ) {
                    return " ";
                }

                if (
                    /[A-ZÁÉÍÓÖŐÚÜŰ]/i.test(
                        karakter
                    )
                ) {
                    const nagybetu =
                        karakter
                            .toLocaleUpperCase(
                                "hu-HU"
                            );

                    return felfedett.has(
                        nagybetu
                    )
                        ? karakter
                        : "_";
                }

                return karakter;
            }
        )
        .join("");
}

function betukSzama(
    megfejtes
) {
    return Array.from(
        megfejtes
    )
        .filter(
            function (
                karakter
            ) {
                return (
                    /[A-ZÁÉÍÓÖŐÚÜŰ]/i.test(
                        karakter
                    )
                );
            }
        )
        .length;
}

function feladvanyKesz(
    feladvany
) {
    if (
        !feladvany
    ) {
        return false;
    }

    return !feladvanyMaszk(
        feladvany.megfejtes,
        feladvany.felfedettBetuk
    ).includes(
        "_"
    );
}

function engedelyezettKategoria(
    kategoria
) {
    return (
        KATEGORIAK.includes(
            kategoria
        ) ||
        kategoria ===
            "Véletlenszerű kategória" ||
        kategoria ===
            "Szabad kategória"
    );
}

function szobaAktivJatekos(
    szoba,
    socketId
) {
    if (
        !szoba
    ) {
        return null;
    }

    return (
        szoba.jatekosok.find(
            function (
                jatekos
            ) {
                return (
                    jatekos.id ===
                    socketId
                );
            }
        ) ||
        null
    );
}

function aktualisJatekos(
    szoba
) {
    if (
        !szoba ||
        szoba.jatekosok.length ===
            0
    ) {
        return null;
    }

    const jatekos =
        szoba.jatekosok[
            szoba.soronLevoIndex
        ] ||
        null;

    if (
        jatekos &&
        jatekos.tavol
    ) {
        return null;
    }

    return jatekos;
}

function betuDarab(
    megfejtes,
    keresettBetu
) {
    return Array.from(
        megfejtes
    )
        .map(
            function (
                karakter
            ) {
                return karakter
                    .toLocaleUpperCase(
                        "hu-HU"
                    );
            }
        )
        .filter(
            function (
                karakter
            ) {
                return (
                    karakter ===
                    keresettBetu
                );
            }
        )
        .length;
}

// ==================================================
// JÁTÉKOSLISTA
// ==================================================

function jatekosListaKuldes(
    szobaNev
) {
    const szoba =
        szobak[
            szobaNev
        ];

    if (
        !szoba
    ) {
        return;
    }

    const lista =
        szoba.jatekosok.map(
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
                        ),

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

    io.to(
        szobaNev
    ).emit(
        "jatekosLista",
        {
            jatekosok:
                lista,

            hostId:
                szoba.hostId,

            maxJatekos:
                MAX_JATEKOS
        }
    );
}

// ==================================================
// JÁTÉKÁLLAPOT
// ==================================================

function jatekAllapotKuldes(
    szobaNev
) {
    const szoba =
        szobak[
            szobaNev
        ];

    if (
        !szoba ||
        !szoba.jatekElindult
    ) {
        return;
    }

    const soronLevo =
        aktualisJatekos(
            szoba
        );

    const feladvany =
        szoba.feladvany;

    io.to(
        szobaNev
    ).emit(
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
                szoba
                    .kategoriatValasztoId,

            kategoriaraVar:
                Boolean(
                    szoba
                        .kategoriaraVar
                ),

            kategoriaMegerositesreVar:
                Boolean(
                    szoba
                        .kategoriaMegerositesreVar
                ),

            kategoriaJelolt:
                szoba
                    .kategoriaJelolt ||
                "",

            korLezart:
                Boolean(
                    szoba
                        .korLezart
                ),

            szabadFeladvanyraVar:
                Boolean(
                    szoba
                        .szabadFeladvanyraVar
                ),

            aktualisKerekErtek:
                szoba
                    .aktualisKerekErtek,

            jatekosok:
                szoba.jatekosok.map(
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
                                ),

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
// KÖVETKEZŐ JÁTÉKOS
// ==================================================

function kovetkezoJatekos(
    szoba
) {
    if (
        !szoba ||
        szoba.jatekosok.length ===
            0
    ) {
        return;
    }

    const indulasiIndex =
        szoba
            .soronLevoIndex;

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
// ÚJ KÖR
// ==================================================

function ujKorInditas(
    szobaNev,
    kertKategoria
) {
    const szoba =
        szobak[
            szobaNev
        ];

    if (
        !szoba
    ) {
        return false;
    }

    szoba.jatekosok.forEach(
        function (
            jatekos
        ) {
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

    io.to(
        szobaNev
    ).emit(
        "ujKor",
        {
            kategoria:
                valasztott
                    .kategoria
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
        szobak[
            szobaNev
        ];

    if (
        !szoba
    ) {
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

    io.to(
        szobaNev
    ).emit(
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
// SOCKET.IO
// ==================================================

io.on(
    "connection",
    function (
        socket
    ) {
        console.log(
            "Kapcsolódott:",
            socket.id
        );

        // ==========================================
        // CSATLAKOZÁS
        // ==========================================

        socket.on(
            "csatlakozas",
            function (
                adat
            ) {
                const nev =
                    String(
                        adat &&
                        adat.nev
                            ? adat.nev
                            : ""
                    )
                        .trim();

                const szobaNev =
                    String(
                        adat &&
                        adat.szoba
                            ? adat.szoba
                            : ""
                    )
                        .trim();

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

                if (
                    !szobak[
                        szobaNev
                    ]
                ) {
                    szobak[
                        szobaNev
                    ] = {
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
                    szobak[
                        szobaNev
                    ];

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
                        function (
                            jatekos
                        ) {
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
            function (
                uzenetSzoveg
            ) {
                const szobaNev =
                    socket.data
                        .szobaNev;

                const szoba =
                    szobak[
                        szobaNev
                    ];

                if (
                    !szoba
                ) {
                    return;
                }

                const jatekos =
                    szobaAktivJatekos(
                        szoba,
                        socket.id
                    );

                if (
                    !jatekos
                ) {
                    return;
                }

                const tisztaUzenet =
                    String(
                        uzenetSzoveg ||
                        ""
                    )
                        .trim();

                if (
                    !tisztaUzenet
                ) {
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

                io.to(
                    szobaNev
                ).emit(
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
                    socket.data
                        .szobaNev;

                const szoba =
                    szobak[
                        szobaNev
                    ];

                if (
                    !szoba
                ) {
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
                        function (
                            jatekos
                        ) {
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

                io.to(
                    szobaNev
                ).emit(
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
        // ==========================================

        socket.on(
            "kategoriaValasztas",
            function (
                kategoria
            ) {
                const szobaNev =
                    socket.data
                        .szobaNev;

                const szoba =
                    szobak[
                        szobaNev
                    ];

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
        // MÁS KATEGÓRIA VÁLASZTÁSA
        // ==========================================

        socket.on(
            "kategoriaMasikValasztas",
            function () {
                const szobaNev =
                    socket.data
                        .szobaNev;

                const szoba =
                    szobak[
                        szobaNev
                    ];

                if (
                    !szoba
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
                    socket.data
                        .szobaNev;

                const szoba =
                    szobak[
                        szobaNev
                    ];

                if (
                    !szoba
                ) {
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

                const siker =
                    ujKorInditas(
                        szobaNev,
                        kategoria
                    );

                if (
                    !siker
                ) {
                    socket.emit(
                        "hiba",
                        "Nem sikerült feladványt választani ebből a kategóriából."
                    );
                }
            }
        );

        // ==========================================
        // SZABAD KATEGÓRIÁBÓL VISSZA
        // ==========================================

        socket.on(
            "szabadKategoriaVissza",
            function () {
                const szobaNev =
                    socket.data
                        .szobaNev;

                const szoba =
                    szobak[
                        szobaNev
                    ];

                if (
                    !szoba
                ) {
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
            function (
                adat
            ) {
                const szobaNev =
                    socket.data
                        .szobaNev;

                const szoba =
                    szobak[
                        szobaNev
                    ];

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
                        typeof adat ===
                            "object"
                            ? adat.kategoria
                            : ""
                    )
                        .trim();

                const sajatFeladvany =
                    normalizalSzoveg(
                        adat &&
                        typeof adat ===
                            "object"
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

                io.to(
                    szobaNev
                ).emit(
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
                    socket.data
                        .szobaNev;

                const szoba =
                    szobak[
                        szobaNev
                    ];

                if (
                    !szoba
                ) {
                    return;
                }

                const index =
                    szoba.jatekosok.findIndex(
                        function (
                            jatekos
                        ) {
                            return (
                                jatekos.id ===
                                socket.id
                            );
                        }
                    );

                if (
                    index ===
                    -1
                ) {
                    return;
                }

                szoba.jatekosok[
                    index
                ].tavol =
                    true;

                szoba.jatekosok[
                    index
                ].visszaterKovetkezoKorban =
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
                    socket.data
                        .szobaNev;

                const szoba =
                    szobak[
                        szobaNev
                    ];

                if (
                    !szoba
                ) {
                    return;
                }

                const jatekos =
                    szobaAktivJatekos(
                        szoba,
                        socket.id
                    );

                if (
                    !jatekos
                ) {
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
                    socket.data
                        .szobaNev;

                const szoba =
                    szobak[
                        szobaNev
                    ];

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
                    function (
                        elem
                    ) {
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

                szoba.aktualisKerekErtek =
                    null;

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
            function (
                ertek
            ) {
                const szobaNev =
                    socket.data
                        .szobaNev;

                const szoba =
                    szobak[
                        szobaNev
                    ];

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

                // ==================================
                // CSŐD
                // ==================================

                if (
                    ertek ===
                    "CSŐD"
                ) {
                    soronLevo.pont =
                        0;

                    szoba.aktualisKerekErtek =
                        null;

                    kovetkezoJatekos(
                        szoba
                    );

                    io.to(
                        szobaNev
                    ).emit(
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

                // ==================================
                // KIMARADSZ
                // ==================================

                if (
                    ertek ===
                    "KIMARADSZ"
                ) {
                    szoba.aktualisKerekErtek =
                        null;

                    kovetkezoJatekos(
                        szoba
                    );

                    io.to(
                        szobaNev
                    ).emit(
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

                // ==================================
                // SZÁMOS MEZŐ
                // ==================================

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
        // BETŰ VÁLASZTÁSA
        // ==========================================

        socket.on(
            "betuValasztas",
            function (
                betu
            ) {
                const szobaNev =
                    socket.data
                        .szobaNev;

                const szoba =
                    szobak[
                        szobaNev
                    ];

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
                        "betuEredmeny",
                        {
                            siker:
                                false,

                            uzenet:
                                "Most nem Ön van soron."
                        }
                    );

                    return;
                }

                const tisztaBetu =
                    normalizalSzoveg(
                        betu
                    );

                if (
                    !/^[A-ZÁÉÍÓÖŐÚÜŰ]$/.test(
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

                // ==================================
                // MÁR HASZNÁLT BETŰ
                // ==================================

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

                const ezMaganhangzo =
                    maganhangzoE(
                        tisztaBetu
                    );

                // ==================================
                // MAGÁNHANGZÓ VÁSÁRLÁSA
                // ==================================

                if (
                    ezMaganhangzo
                ) {
                    if (
                        soronLevo.pont <
                        MAGANHANGZO_AR
                    ) {
                        socket.emit(
                            "betuEredmeny",
                            {
                                siker:
                                    false,

                                vasarlas:
                                    true,

                                uzenet:
                                    "Nincs elegendő pontja magánhangzó vásárlásához. " +
                                    MAGANHANGZO_AR +
                                    " pont szükséges."
                            }
                        );

                        return;
                    }

                    soronLevo.pont -=
                        MAGANHANGZO_AR;

                    szoba.feladvany
                        .hasznaltBetuk
                        .push(
                            tisztaBetu
                        );

                    const darab =
                        betuDarab(
                            szoba.feladvany
                                .megfejtes,
                            tisztaBetu
                        );

                    // ==============================
                    // TALÁLT MAGÁNHANGZÓ
                    // ==============================

                    if (
                        darab >
                        0
                    ) {
                        szoba.feladvany
                            .felfedettBetuk
                            .push(
                                tisztaBetu
                            );

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

                                vasarlas:
                                    true,

                                betu:
                                    tisztaBetu,

                                darab:
                                    darab,

                                ar:
                                    MAGANHANGZO_AR,

                                kesz:
                                    kesz,

                                megfejtes:
                                    kesz
                                        ? teljesMegfejtes
                                        : null,

                                uzenet:
                                    kesz
                                        ? "A magánhangzó megvásárlása sikeres. " +
                                          darab +
                                          " találat. A feladvány teljesen elkészült."
                                        : "A magánhangzó megvásárlása sikeres. " +
                                          darab +
                                          " találat. 1000 pont levonva."
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

                            io.to(
                                szobaNev
                            ).emit(
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

                    // ==============================
                    // NINCS BENNE A MAGÁNHANGZÓ
                    // ==============================

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

                            vasarlas:
                                true,

                            betu:
                                tisztaBetu,

                            darab:
                                0,

                            ar:
                                MAGANHANGZO_AR,

                            kesz:
                                false,

                            uzenet:
                                "A megvásárolt magánhangzó nem szerepel a feladványban. 1000 pont levonva."
                        }
                    );

                    szoba.aktualisKerekErtek =
                        null;

                    kovetkezoJatekos(
                        szoba
                    );

                    jatekosListaKuldes(
                        szobaNev
                    );

                    jatekAllapotKuldes(
                        szobaNev
                    );

                    return;
                }

                // ==================================
                // MÁSSALHANGZÓ
                // ==================================

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
                                "Mássalhangzó választása előtt pörgesse meg a kereket."
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
                    betuDarab(
                        szoba.feladvany
                            .megfejtes,
                        tisztaBetu
                    );

                // ==================================
                // TALÁLT MÁSSALHANGZÓ
                // ==================================

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

                            vasarlas:
                                false,

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
                                    : "A betű szerepel a feladványban. " +
                                      darab +
                                      " találat."
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

                        io.to(
                            szobaNev
                        ).emit(
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

                // ==================================
                // HIBÁS MÁSSALHANGZÓ
                // ==================================

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

                        vasarlas:
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
            function (
                tipp
            ) {
                const szobaNev =
                    socket.data
                        .szobaNev;

                const szoba =
                    szobak[
                        szobaNev
                    ];

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

                // ==================================
                // HELYES MEGFEJTÉS
                // ==================================

                if (
                    tisztaTipp ===
                    helyesMegfejtes
                ) {
                    const teljesMegfejtes =
                        szoba.feladvany
                            .megfejtes;

                    io.to(
                        szobaNev
                    ).emit(
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

                    szoba.aktualisKerekErtek =
                        null;

                    io.to(
                        szobaNev
                    ).emit(
                        "korVege",
                        {
                            uzenet:
                                "A kör véget ért. Bármelyik aktív játékos indíthat új kört."
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

                // ==================================
                // HIBÁS MEGFEJTÉS
                // ==================================

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
        // KAPCSOLAT BONTÁSA
        // ==========================================

        socket.on(
            "disconnect",
            function () {
                const szobaNev =
                    socket.data
                        .szobaNev;

                if (
                    !szobaNev ||
                    !szobak[
                        szobaNev
                    ]
                ) {
                    return;
                }

                const szoba =
                    szobak[
                        szobaNev
                    ];

                const tavozottIndex =
                    szoba.jatekosok
                        .findIndex(
                            function (
                                jatekos
                            ) {
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

                // ==================================
                // ÚJ SZOBAGAZDA
                // ==================================

                if (
                    socket.id ===
                    szoba.hostId
                ) {
                    szoba.hostId =
                        szoba.jatekosok[
                            0
                        ].id;
                }

                // ==================================
                // SORON LÉVŐ INDEX JAVÍTÁSA
                // ==================================

                if (
                    tavozottIndex >=
                    0 &&
                    tavozottIndex <
                    szoba.soronLevoIndex
                ) {
                    szoba.soronLevoIndex -=
                        1;
                }

                if (
                    szoba.soronLevoIndex >=
                    szoba.jatekosok.length
                ) {
                    szoba.soronLevoIndex =
                        0;
                }

                // ==================================
                // KATEGÓRIAVÁLASZTÓ TÁVOZOTT
                // ==================================

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

                    io.to(
                        szobaNev
                    ).emit(
                        "kategoriavalasztas",
                        {
                            jatekosId:
                                szoba.hostId,

                            kategoriak: [
                                ...KATEGORIAK,
                                "Véletlenszerű kategória",
                                "Szabad kategória"
                            ]
                        }
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
    }
);

// ==================================================
// SZERVER INDÍTÁSA
// ==================================================

server.listen(
    PORT,
    function () {
        console.log(
            "Szerencsekerék 1.1 szerver fut:"
        );

        console.log(
            "Port: " +
            PORT
        );

        console.log(
            "Helyi cím: http://localhost:" +
            PORT
        );
    }
);
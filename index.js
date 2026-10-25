// ==================================================
// SZERENCSEKERÉK 1.1
// FELADVÁNYOK KÖZPONTI BETÖLTŐ
// ==================================================

const kategoriak = {
    "Állat": require("./allat"),
    "Étel és ital": require("./etel-es-ital"),
    "Film vagy sorozat": require("./film-vagy-sorozat"),
    "Foglalkozás": require("./foglalkozas"),
    "Fogalom": require("./fogalom"),
    "Földrajz": require("./foldrajz"),
    "Használati tárgy": require("./hasznalati-targy"),
    "Közmondás vagy szólás": require("./kozmondas-vagy-szolas"),
    "Külföldi város vagy ország": require("./kulfoldi-varos-vagy-orszag"),
    "Magyar költő vagy író": require("./magyar-kolto-vagy-iro"),
    "Magyar település": require("./magyar-telepules"),
    "Növény": require("./noveny"),
    "Nyelvtörő": require("./nyelvtoro"),
    "Sport": require("./sport"),
    "Történelmi esemény": require("./tortenelmi-esemeny"),
    "Tudomány és technika": require("./tudomany-es-technika"),
    "Zene": require("./zene")
};

const KATEGORIAK = Object.keys(kategoriak);

function veletlenElem(lista) {
    if (!Array.isArray(lista) || lista.length === 0) {
        return null;
    }

    return lista[
        Math.floor(Math.random() * lista.length)
    ];
}

function feladvanyValasztas(kertKategoria) {
    let kategoria = kertKategoria;

    if (
        !kategoria ||
        kategoria === "Véletlenszerű kategória"
    ) {
        kategoria = veletlenElem(KATEGORIAK);
    }

    const lista = kategoriak[kategoria];

    if (!Array.isArray(lista) || lista.length === 0) {
        return null;
    }

    const megfejtes = veletlenElem(lista);

    if (!megfejtes) {
        return null;
    }

    return {
        kategoria,
        megfejtes
    };
}

module.exports = {
    KATEGORIAK,
    feladvanyValasztas
};
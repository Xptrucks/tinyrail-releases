// Essais manuels TinyRail : le moteur du sommaire et des protocoles.
//
// Une page ne porte que ses textes, dans les deux langues. Tout le reste vit
// ici : le rendu, les verdicts, le rapport, et le choix de la langue.
//
// ⚠️ **Les identifiants d'essai ne dépendent pas de la langue.** Les réponses
// sont rangées sous ces identifiants : changer de langue en cours de session ne
// doit rien perdre, et un testeur qui commence en anglais peut rendre son
// rapport en français.

(function (global) {
  "use strict";

  // ── La langue ────────────────────────────────────────────────────────────
  //
  // Devinée du téléphone au premier passage, puis mémorisée : quelqu'un qui a
  // choisi l'anglais sur un téléphone français ne veut pas le rechoisir à
  // chaque protocole.

  const CLE_LANGUE = "tinyrail-essais-langue";

  function langueInitiale() {
    try {
      const gardee = localStorage.getItem(CLE_LANGUE);
      if (gardee === "fr" || gardee === "en") return gardee;
    } catch (e) { /* stockage indisponible : on devine à chaque fois */ }
    const nav = (navigator.language || "en").toLowerCase();
    return nav.startsWith("fr") ? "fr" : "en";
  }

  let langue = langueInitiale();

  function poserLangue(valeur) {
    langue = valeur;
    try { localStorage.setItem(CLE_LANGUE, valeur); } catch (e) {}
    document.documentElement.lang = valeur;
  }

  function selecteur(surChangement) {
    const box = document.createElement("div");
    box.className = "langue";
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", langue === "fr" ? "Langue" : "Language");
    for (const code of ["fr", "en"]) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = code.toUpperCase();
      b.setAttribute("aria-pressed", String(code === langue));
      b.addEventListener("click", () => {
        if (code === langue) return;
        poserLangue(code);
        surChangement();
      });
      box.append(b);
    }
    return box;
  }

  // ── Les mots de l'ossature ───────────────────────────────────────────────
  //
  // Tout ce que le moteur écrit lui-même. Les pages n'ont à traduire que leur
  // propre contenu.

  const MOTS = {
    fr: {
      retour: "Essais",
      faits: (n, t) => `<b>${n}</b>/${t} faits`,
      echecs: n => `<b>${n}</b> en échec`,
      pourquoi: "Pourquoi cet essai",
      faire: "Ce que vous faites",
      attendu: "Ce qui doit se passer",
      conforme: "Conforme",
      echec: "En échec",
      nonFait: "Non fait",
      verdictDe: n => `Verdict de l'essai ${n}`,
      note: "Ce que vous avez vu, mesuré, ou trouvé étrange",
      telecharger: "Télécharger",
      rapport: "Rapport",
      rapportAide: "Le bouton met tout le compte rendu dans le presse-papiers, prêt à coller dans un message : verdicts, notes, et ce que vous avez renseigné en haut de page.",
      copier: "Copier le rapport",
      copie: "Copié",
      voir: "Voir le texte",
      effacer: "Tout effacer",
      garde: "Tout est gardé dans ce navigateur au fur et à mesure : vous pouvez fermer l'onglet et reprendre plus tard, au même endroit. Rien ne quitte votre appareil, et rien ne suit sur un autre.",
      effacerTitre: "Tout effacer ?",
      effacerAvis: "Cela ne s'annule pas. Copiez le rapport d'abord si vous voulez en garder une trace.",
      annuler: "Annuler",
      perte: liste => `Vous perdez ${liste}.`,
      verdicts: n => (n > 1 ? `${n} verdicts` : "1 verdict"),
      notes: n => (n > 1 ? `${n} notes` : "1 note"),
      champs: n => (n > 1 ? `${n} champs remplis` : "1 champ rempli"),
      et: "et",
      motOk: "CONFORME",
      motKo: "EN ECHEC",
      motNa: "NON FAIT",
      motRien: "SANS REPONSE",
      bilan: (faits, total, echecs) =>
        `${faits}/${total} essais renseignés, ${echecs} en échec.`,
      sep: " : ",
      inconnu: "?",
      exemple: "Par exemple",
      filtrer: "Chercher une fonction…",
      aucune: "Aucune fonction ne correspond à cette recherche.",
      compte: (n, t) => (n === t ? `${t} fonctions` : `${n} sur ${t} fonctions`)
    },
    en: {
      retour: "Trials",
      faits: (n, t) => `<b>${n}</b>/${t} done`,
      echecs: n => `<b>${n}</b> failed`,
      pourquoi: "Why this trial",
      faire: "What you do",
      attendu: "What should happen",
      conforme: "Pass",
      echec: "Fail",
      nonFait: "Not done",
      verdictDe: n => `Verdict for trial ${n}`,
      note: "What you saw, measured, or found odd",
      telecharger: "Download",
      rapport: "Report",
      rapportAide: "The button puts the whole report on the clipboard, ready to paste into a message: verdicts, notes, and whatever you filled in at the top of the page.",
      copier: "Copy the report",
      copie: "Copied",
      voir: "Show the text",
      effacer: "Erase everything",
      garde: "Everything is kept in this browser as you go: you can close the tab and pick up later, at the same place. Nothing leaves your device, and nothing follows you to another one.",
      effacerTitre: "Erase everything?",
      effacerAvis: "This cannot be undone. Copy the report first if you want to keep a trace.",
      annuler: "Cancel",
      perte: liste => `You lose ${liste}.`,
      verdicts: n => (n > 1 ? `${n} verdicts` : "1 verdict"),
      notes: n => (n > 1 ? `${n} notes` : "1 note"),
      champs: n => (n > 1 ? `${n} filled fields` : "1 filled field"),
      et: "and",
      motOk: "PASS",
      motKo: "FAIL",
      motNa: "NOT DONE",
      motRien: "NO ANSWER",
      bilan: (faits, total, echecs) =>
        `${faits}/${total} trials answered, ${echecs} failed.`,
      sep: ": ",
      inconnu: "?",
      exemple: "For example",
      filtrer: "Search a feature…",
      aucune: "No feature matches that search.",
      compte: (n, t) => (n === t ? `${t} features` : `${n} of ${t} features`)
    }
  };

  // ── Petits outils de rendu ───────────────────────────────────────────────

  function el(tag, classe, html) {
    const n = document.createElement(tag);
    if (classe) n.className = classe;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function vider(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  // ── Le sommaire ──────────────────────────────────────────────────────────

  function sommaire(data) {
    document.body.className = "sommaire";
    const hote = document.getElementById("app");

    function dessine() {
      const t = data[langue];
      document.title = t.titre + " · TinyRail";
      document.documentElement.lang = langue;
      vider(hote);

      const wrap = el("div", "wrap");

      const entete = el("div", "entete");
      const gauche = el("div");
      gauche.append(el("h1", null, t.titre));
      entete.append(gauche, selecteur(dessine));
      wrap.append(entete);

      wrap.append(el("p", "lede", t.lede));

      if (t.repere) {
        const r = el("div", "repere");
        r.append(el("h3", null, t.repere.titre));
        t.repere.texte.forEach(p => r.append(el("p", null, p)));
        wrap.append(r);
      }

      t.sections.forEach(sec => {
        wrap.append(el("h2", null, sec.titre));
        sec.cartes.forEach(c => {
          const carte = el(c.href ? "a" : "div", "card" + (c.href ? "" : " futur"));
          if (c.href) carte.href = c.href;
          const tag = c.tag
            ? ` <span class="tag ${c.href ? "pret" : "attente"}">${c.tag}</span>`
            : "";
          carte.append(el("h3", null, c.titre + tag));
          carte.append(el("p", null, c.texte));
          if (c.meta) {
            carte.append(el("div", "meta",
              c.meta.map(m => `<span>${m}</span>`).join("")));
          }
          wrap.append(carte);
        });
      });

      if (t.note) {
        wrap.append(el("p", "note", `<b>${t.note.titre}</b> ${t.note.texte}`));
      }
      wrap.append(el("footer", null, t.pied));

      hote.append(wrap);
    }

    dessine();
  }

  // ── Un protocole ─────────────────────────────────────────────────────────

  function protocole(data) {
    document.body.className = "protocole";
    const hote = document.getElementById("app");
    const CLE = "tinyrail-essais-" + data.cle + "-v1";

    let etat = { fields: {}, marks: {}, notes: {} };
    try {
      const garde = localStorage.getItem(CLE);
      if (garde) etat = Object.assign(etat, JSON.parse(garde));
    } catch (e) { /* stockage indisponible : la page reste utilisable, sans mémoire */ }

    function garder() {
      try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) {}
    }

    let peindre = () => {};

    function dessine() {
      const m = MOTS[langue];
      const t = data[langue];
      const essais = t.essais;
      document.title = t.nom + " · TinyRail";
      document.documentElement.lang = langue;
      vider(hote);

      // Bandeau, compteur, jauge.
      const bandeau = el("div", "masthead");
      const inner = el("div", "masthead-inner");
      inner.append(el("h1", null,
        `<a class="retour" href="../">${m.retour}</a> · ${t.nom}`));
      const tally = el("div", "tally");
      const faits = el("span", null, m.faits(0, essais.length));
      const echecs = el("span", "bad", m.echecs(0));
      echecs.hidden = true;
      tally.append(faits, echecs, selecteur(dessine));
      inner.append(tally);
      const jauge = el("div", "gauge");
      const barre = el("span");
      jauge.append(barre);
      bandeau.append(inner, jauge);
      hote.append(bandeau);

      const wrap = el("div", "wrap");

      // Introduction.
      const intro = el("header", "intro");
      intro.append(el("p", "eyebrow", t.eyebrow));
      intro.append(el("h2", null, t.titre));
      t.intro.forEach(p => intro.append(el("p", null, p)));
      wrap.append(intro);

      // Identification de la session.
      const ident = el("section", "ident");
      ident.setAttribute("aria-label", t.identLabel);
      t.champs.forEach(c => {
        const f = el("div", "field");
        const lab = el("label", null, c.label);
        lab.htmlFor = "f-" + c.cle;
        const inp = document.createElement("input");
        inp.type = "text";
        inp.id = "f-" + c.cle;
        inp.placeholder = c.exemple || "";
        inp.value = etat.fields[c.cle] || "";
        inp.addEventListener("input", () => {
          etat.fields[c.cle] = inp.value;
          garder();
        });
        f.append(lab, inp);
        ident.append(f);
      });
      wrap.append(ident);

      // Ce qu'il faut avoir sous la main.
      if (t.besoin) {
        const sec = el("section", "phase");
        sec.append(el("h3", null, t.besoin.titre));
        if (t.besoin.lede) sec.append(el("p", "lede", t.besoin.lede));
        if (t.besoin.points) {
          sec.append(el("ol", "steps",
            t.besoin.points.map(p => `<li>${p}</li>`).join("")));
        }
        if (t.besoin.avis) {
          sec.append(el("div", "warn", `<p>${t.besoin.avis}</p>`));
        }
        wrap.append(sec);
      }

      // Les fichiers à télécharger, quand le protocole en a.
      if (t.fichiers) {
        const sec = el("section", "phase");
        sec.append(el("h3", null, t.fichiers.titre));
        sec.append(el("p", "lede", t.fichiers.lede));
        const liste = el("div", "files");
        t.fichiers.liste.forEach(f => {
          liste.append(el("div", "file",
            `<span class="name">${f.nom}<small>${f.quoi}</small></span>
             <span class="size">${f.taille}</span>
             <a class="dl" href="fixtures/${f.nom}" download>${m.telecharger}</a>`));
        });
        sec.append(liste);
        wrap.append(sec);
      }

      // Les essais.
      const cartes = {};
      const main = el("main");
      essais.forEach((e, i) => {
        if (e.phase) {
          const sec = el("section", "phase");
          sec.append(el("h3", null, e.phase));
          if (e.lede) sec.append(el("p", "lede", e.lede));
          main.append(sec);
        }

        const carte = el("article", "trial");
        carte.dataset.status = etat.marks[e.id] || "";

        const tete = el("div", "trial-head");
        tete.append(el("span", "num", String(i + 1).padStart(2, "0")));
        tete.append(el("h4", null, e.titre));

        const corps = el("div", "body");
        if (e.pourquoi) {
          corps.append(el("p", "label", m.pourquoi));
          corps.append(el("p", "hunt", e.pourquoi));
        }
        corps.append(el("p", "label", m.faire));
        corps.append(el("ol", "steps", e.faire.map(s => `<li>${s}</li>`).join("")));
        corps.append(el("p", "label", m.attendu));
        corps.append(el("div", "expect", e.attendu.map(s => `<p>${s}</p>`).join("")));
        if (e.avis) corps.append(el("div", "warn", `<p>${e.avis}</p>`));

        const verdict = el("div", "verdict");
        const set = el("div", "set");
        set.setAttribute("role", "group");
        set.setAttribute("aria-label", m.verdictDe(i + 1));
        [["ok", m.conforme], ["ko", m.echec], ["na", m.nonFait]].forEach(([v, mot]) => {
          const b = el("button", "mark", mot);
          b.type = "button";
          b.dataset.mark = v;
          b.dataset.id = e.id;
          b.setAttribute("aria-pressed", String(etat.marks[e.id] === v));
          b.addEventListener("click", () => {
            etat.marks[e.id] = etat.marks[e.id] === v ? "" : v;
            garder();
            peindre();
          });
          set.append(b);
        });
        const zone = document.createElement("textarea");
        zone.placeholder = m.note;
        zone.value = etat.notes[e.id] || "";
        zone.addEventListener("input", () => {
          etat.notes[e.id] = zone.value;
          garder();
        });
        verdict.append(set, zone);

        carte.append(tete, corps, verdict);
        cartes[e.id] = carte;
        main.append(carte);
      });
      wrap.append(main);

      // Le rapport.
      const rap = el("section", "report");
      rap.append(el("h3", null, m.rapport));
      rap.append(el("p", null, m.rapportAide));
      const actions = el("div", "actions");
      const bCopier = el("button", "primary", m.copier);
      const dit = el("span", "said", m.copie);
      const bVoir = el("button", "ghost", m.voir);
      const bEffacer = el("button", "ghost", m.effacer);
      [bCopier, bVoir, bEffacer].forEach(b => (b.type = "button"));
      actions.append(bCopier, dit, bVoir, bEffacer);
      const texte = document.createElement("textarea");
      texte.readOnly = true;
      texte.id = "dump";
      rap.append(actions, texte, el("p", "garde", m.garde));
      wrap.append(rap);

      // Le dialogue d'effacement.
      const dlg = document.createElement("dialog");
      const quoi = el("p");
      dlg.append(el("h3", null, m.effacerTitre), quoi,
        el("p", "cw-avis", m.effacerAvis));
      const cwActions = el("div", "cw-actions");
      const bNon = el("button", "ghost", m.annuler);
      const bOui = el("button", "danger", m.effacer);
      [bNon, bOui].forEach(b => (b.type = "button"));
      cwActions.append(bNon, bOui);
      dlg.append(cwActions);
      wrap.append(dlg);

      wrap.append(el("footer", null, t.pied));
      hote.append(wrap);

      // ── Peinture de l'état ────────────────────────────────────────────────

      peindre = function () {
        let n = 0, ko = 0;
        essais.forEach(e => {
          const v = etat.marks[e.id];
          if (v) n++;
          if (v === "ko") ko++;
          const carte = cartes[e.id];
          carte.dataset.status = v || "";
          carte.querySelectorAll("[data-mark]").forEach(b => {
            b.setAttribute("aria-pressed", String(b.dataset.mark === v));
          });
        });
        faits.innerHTML = m.faits(n, essais.length);
        echecs.innerHTML = m.echecs(ko);
        echecs.hidden = ko === 0;
        barre.style.width = (n / essais.length * 100) + "%";
      };

      function rapport() {
        const f = etat.fields;
        const lignes = ["# " + t.rapportTitre, ""];
        t.champs.forEach(c => {
          lignes.push(c.label + m.sep + (f[c.cle] || m.inconnu));
        });
        lignes.push("");
        let n = 0, ko = 0;
        essais.forEach((e, i) => {
          const v = etat.marks[e.id];
          if (v) n++;
          if (v === "ko") ko++;
          const mot = v === "ok" ? m.motOk : v === "ko" ? m.motKo
            : v === "na" ? m.motNa : m.motRien;
          lignes.push(`${String(i + 1).padStart(2, "0")}. [${mot}] ${e.titre}`);
          const note = (etat.notes[e.id] || "").trim();
          if (note) lignes.push(`    ${note.replace(/\n/g, "\n    ")}`);
        });
        lignes.push("", m.bilan(n, essais.length, ko));
        return lignes.join("\n");
      }

      bCopier.addEventListener("click", async () => {
        const brut = rapport();
        texte.value = brut;
        try {
          await navigator.clipboard.writeText(brut);
          dit.classList.add("shown");
          setTimeout(() => dit.classList.remove("shown"), 1600);
        } catch (e) {
          // Presse-papiers refusé : on montre le texte, à sélectionner à la main.
          texte.classList.add("shown");
          texte.select();
        }
      });

      bVoir.addEventListener("click", () => {
        texte.value = rapport();
        texte.classList.toggle("shown");
      });

      // ⚠️ **Effacer demande confirmation.** Ce bouton voisine avec « Copier le
      // rapport » au bas d'une session d'une heure et demie, et le dialogue dit
      // ce qui va disparaître, compté : « êtes-vous sûr » ne fait réfléchir
      // personne.
      function efface() {
        etat = { fields: {}, marks: {}, notes: {} };
        garder();
        dessine();
      }

      bEffacer.addEventListener("click", () => {
        const nb = Object.values(etat.marks).filter(Boolean).length;
        const nn = Object.values(etat.notes).filter(v => v && v.trim()).length;
        const nc = Object.values(etat.fields).filter(v => v && v.trim()).length;
        if (nb + nn + nc === 0) { efface(); return; }

        const bouts = [];
        if (nb) bouts.push(m.verdicts(nb));
        if (nn) bouts.push(m.notes(nn));
        if (nc) bouts.push(m.champs(nc));
        const liste = bouts.length > 1
          ? bouts.slice(0, -1).join(", ") + " " + m.et + " " + bouts[bouts.length - 1]
          : bouts[0];
        quoi.textContent = m.perte(liste);

        if (typeof dlg.showModal === "function") dlg.showModal();
        else if (confirm(m.perte(liste) + " " + m.effacerTitre)) efface();
      });

      bNon.addEventListener("click", () => dlg.close());
      bOui.addEventListener("click", () => { dlg.close(); efface(); });

      peindre();
    }

    dessine();
  }

  // ── Le catalogue des fonctions ───────────────────────────────────────────
  //
  // Une fiche par fonction : une silhouette, un titre, ce que c'est, et un
  // exemple d'usage.
  //
  // ⚠️ **L'exemple n'est pas un ornement.** Le catalogue existe parce que la
  // liste des fonctions est devenue trop longue pour tenir en tête ; une
  // fonction décrite sans cas d'usage se relit dix fois sans qu'on sache à quoi
  // elle sert, et on la réinvente ailleurs.
  //
  // ⚠️ **Les silhouettes sont DESSINÉES ICI**, pas chargées. Une police
  // d'icônes ou un CDN ajouterait une dépendance réseau à une page qu'on
  // consulte parfois depuis un van.

  const DESSINS = {
    eclair: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    gradation: '<path d="M4 8h16M4 16h16"/><circle cx="9" cy="8" r="2.2"/><circle cx="15" cy="16" r="2.2"/>',
    etiquette: '<path d="M4 4h7l9 9-7 7-9-9z"/><circle cx="8" cy="8" r="1.3"/>',
    plafond: '<path d="M4 5h16"/><path d="M12 20V9"/><path d="m8 13 4-4 4 4"/>',
    bouton: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="12" cy="12" r="3.4"/>',
    maintien: '<path d="M9 11V5.5a1.5 1.5 0 1 1 3 0V11"/><path d="M12 11V4.5a1.5 1.5 0 1 1 3 0V11"/><path d="M15 11V6.5a1.5 1.5 0 1 1 3 0V14a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6v-1.5a1.5 1.5 0 1 1 3 0V13"/>',
    eteindre: '<path d="M12 3v9"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/>',
    groupe: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 17.5h7M17.5 14v7"/>',
    exclusif: '<circle cx="7" cy="12" r="3"/><circle cx="17" cy="12" r="3"/><path d="M10 12h4"/><path d="m4 20 16-16"/>',
    inclusif: '<circle cx="7" cy="12" r="3"/><circle cx="17" cy="12" r="3"/><path d="M10.2 10.5h3.6M10.2 13.5h3.6"/>',
    chrono: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2"/><path d="M9.5 2h5"/>',
    demarrage: '<path d="M12 4v7"/><path d="M7 7.5a7 7 0 1 0 10 0"/><path d="M20 4v3.5h-3.5"/>',
    nom: '<path d="M4 7V5h16v2"/><path d="M12 5v14"/><path d="M9 19h6"/>',
    carteNom: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h10M7 14h6"/>',
    led: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>',
    ampere: '<path d="M3 18a9 9 0 0 1 18 0"/><path d="M12 18 16 9"/><circle cx="12" cy="18" r="1.1"/>',
    somme: '<path d="M17 5H7l6 7-6 7h10"/>',
    tension: '<path d="m6 4 6 14 6-14"/><path d="M3 21h18"/>',
    thermometre: '<path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4.5 4.5 0 1 0 4 0z"/><path d="M12 9v6"/>',
    filet: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M5 20h9" stroke-width="2.6"/>',
    archive: '<rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/>',
    barres: '<path d="M3 20h18"/><path d="M6 20v-6M11 20V8M16 20v-9"/>',
    jalon: '<path d="M5 21V4"/><path d="M5 5h11l-2 3 2 3H5"/>',
    filigrane: '<path d="M3 18h18"/><path d="M5 18v-3M8 18v-6M11 18v-2M14 18v-5M17 18v-3M20 18v-7"/>',
    hachure: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12 12 4M4 18 18 4M10 20l10-10M16 20l4-4"/>',
    effacer: '<path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
    horlogeSync: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/><path d="M20 5v4h-4"/>',
    bouclierEclair: '<path d="M12 3 5 6v6c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6z"/><path d="m12.6 8.5-2.6 4h3l-.6 3.6 2.6-4h-3z"/>',
    thermoCoupe: '<path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4.5 4.5 0 1 0 4 0z"/><path d="m4 4 16 16"/>',
    batterie: '<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2"/><path d="M6 11v2M10 11v2"/>',
    cascade: '<path d="M3 20h4v-4h4v-4h4V8h6"/>',
    rearmer: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4h-4"/><circle cx="12" cy="12" r="1.2"/>',
    verrou: '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>',
    fusible: '<path d="M2 12h4M18 12h4"/><rect x="6" y="8" width="12" height="8" rx="1.5"/><path d="M8.5 12h7"/>',
    bouclierOk: '<path d="M12 3 5 6v6c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    bouee: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="m5.6 5.6 3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9"/>',
    clePlate: '<path d="M17 3a5 5 0 0 0-4.6 7L4 18.4 5.6 20l8.4-8.4A5 5 0 1 0 17 3z"/><circle cx="17" cy="8" r="1.3"/>',
    redemarrer: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4h-4"/>',
    usine: '<path d="M3 20V10l5 3V10l5 3V10l5 3v7z"/><path d="M3 20h18"/>',
    prise: '<path d="M9 2v6M15 2v6"/><rect x="6" y="8" width="12" height="6" rx="2"/><path d="M12 14v4a3 3 0 0 0 3 3h3"/>',
    goutte: '<path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3z"/>',
    courbe: '<path d="M3 20h18"/><path d="M3 18c5 0 5-12 10-12s5 8 8 8"/>',
    rampe: '<path d="M3 20h18"/><path d="m4 19 7-7 3 3 6-9"/>',
    contact: '<circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 12h4l5-4"/>',
    liaison: '<path d="M3 8h6a4 4 0 0 1 4 4 4 4 0 0 0 4 4h4"/><path d="m18 13 3 3-3 3"/>',
    listeNum: '<path d="M4 6h.01M4 12h.01M4 18h.01"/><path d="M8 6h12M8 12h12M8 18h12"/>',
    cloche: '<path d="M18 16V11a6 6 0 1 0-12 0v5l-2 3h16z"/><path d="M10 21h4"/>',
    bluetooth: '<path d="m7 7 10 10-5 4V3l5 4L7 17"/>',
    couches: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    pages: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/>',
    redimensionner: '<path d="M3 9V3h6"/><path d="M21 15v6h-6"/><path d="m3 3 7 7M21 21l-7-7"/>',
    van: '<path d="M2 16V8h11l5 4h4v4z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    etoile: '<path d="m12 3 2.6 5.6 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6L3.4 9.3l6-.7z"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-1.5 1.2-2.2 2.4-2.2H18a3 3 0 0 0 3-3 9 9 0 0 0-9-9z"/><circle cx="8" cy="10" r="1.1"/><circle cx="12" cy="7.5" r="1.1"/><circle cx="16" cy="10" r="1.1"/>',
    vibration: '<rect x="8" y="3" width="8" height="18" rx="2"/><path d="M4 9v6M2 11v2M20 9v6M22 11v2"/>',
    journal: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    arrierePlan: '<rect x="3" y="7" width="12" height="12" rx="2"/><path d="M8 4h10a2 2 0 0 1 2 2v10"/>',
    exporter: '<path d="M12 16V4"/><path d="m8 8 4-4 4 4"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
    insecte: '<rect x="8" y="7" width="8" height="12" rx="4"/><path d="M9.2 4.8 10.5 7M14.8 4.8 13.5 7"/><path d="M4 10h4M16 10h4M4 15h4M16 15h4"/>',
    megaphone: '<path d="M4 10v4h3l7 4V6l-7 4z"/><path d="M17 9.5a4 4 0 0 1 0 5"/>',
    lecture: '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 6 3.5-6 3.5z"/>',
    etabli: '<path d="M9 3v6L4 19a2 2 0 0 0 1.8 3h12.4A2 2 0 0 0 20 19l-5-10V3"/><path d="M8 3h8"/><path d="M7.5 15h9"/>',
    oeil: '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/>',
    serpent: '<rect x="3" y="6" width="18" height="12" rx="3" stroke-dasharray="5 4"/>',
    reglages: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>',
    ecrire: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>',
    sablier: '<path d="M7 3h10M7 21h10"/><path d="M7 3c0 4 5 5 5 9s-5 5-5 9M17 3c0 4-5 5-5 9s5 5 5 9"/>',
    listeEchec: '<path d="M4 7h10M4 12h8M4 17h6"/><path d="m16 13 5 5M21 13l-5 5"/>',
    fichier: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M12 11v5M9.5 14 12 16.5 14.5 14"/>',
    plan: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/><path d="M13 13h4"/>',
    echange: '<path d="M4 8h13l-3-3"/><path d="M20 16H7l3 3"/>',
    photo: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7l1.5-3h3L15 7"/><circle cx="12" cy="13.5" r="3.2"/>',
    sauvegarde: '<path d="M12 3 5 6v6c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6z"/><path d="M12 8v6M9.5 11.5 12 14l2.5-2.5"/>',
    partager: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
    annuler: '<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/>',
    cle: '<circle cx="7.5" cy="12" r="3.5"/><path d="M11 12h10"/><path d="M17 12v3M20 12v2"/>',
    empreinte: '<path d="M12 4a8 8 0 0 0-8 8v3"/><path d="M20 12a8 8 0 0 0-4-6.9"/><path d="M8 20a12 12 0 0 0 1-5 3 3 0 0 1 6 0 12 12 0 0 1-.6 4"/>',
    reconnexion: '<path d="M20 12a8 8 0 0 1-8 8"/><path d="M4 12a8 8 0 0 1 8-8"/><path d="M4 8v4h4M20 16v-4h-4"/>',
    wifi: '<path d="M2.5 9a15 15 0 0 1 19 0"/><path d="M6 12.5a10 10 0 0 1 12 0"/><path d="M9.5 16a5 5 0 0 1 5 0"/><circle cx="12" cy="19.5" r="1"/>',
    nuageCadenas: '<path d="M6.5 18a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.5 1.2A3.5 3.5 0 0 1 17 18z"/><path d="M10.6 14v-1.4a1.4 1.4 0 0 1 2.8 0V14"/><rect x="9.8" y="14" width="4.4" height="3.6" rx=".8"/>',
    badgeCompte: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.5 16.5a4 4 0 0 1 7 0"/><path d="M15 10h4M15 13.5h4"/>',
    deuxInter: '<rect x="3" y="5" width="18" height="6" rx="3"/><circle cx="7" cy="8" r="1.8"/><rect x="3" y="13" width="18" height="6" rx="3"/><circle cx="17" cy="16" r="1.8"/>',
    itineraire: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M6 8.5V14a4 4 0 0 0 4 4h5.5"/>',
    pastille: '<rect x="3" y="5" width="14" height="14" rx="3"/><circle cx="19" cy="5" r="3" fill="currentColor" stroke="none"/>',
    interdit: '<circle cx="12" cy="12" r="9"/><path d="m6 6 12 12"/>',
    navigateur: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><circle cx="6.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/><circle cx="9.2" cy="6.5" r=".8" fill="currentColor" stroke="none"/>',
    maison: '<path d="M4 11 12 4l8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-6h4v6"/>',
    boites: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
    domaine: '<rect x="3" y="4" width="7" height="7" rx="1.5"/><path d="M12 7.5h8M17.5 5l2.5 2.5-2.5 2.5"/><rect x="3" y="14" width="7" height="6" rx="1.5"/><path d="M12 17h8"/>',
    ecran: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>',
    nuageMaj: '<path d="M6.5 18a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.5 1.2A3.5 3.5 0 0 1 17 18z"/><path d="M12 21v-8M9.5 15.5 12 13l2.5 2.5"/>',
    usb: '<path d="M12 21V4"/><path d="m9 7 3-3 3 3"/><path d="M12 15.5 16 13v-2.5"/><circle cx="16" cy="9.2" r="1.3"/><path d="M12 12.5 8 10V8.2"/><rect x="6.7" y="6" width="2.6" height="2.4" rx=".5"/>',
    insigne: '<circle cx="12" cy="10" r="6"/><path d="m8.5 15-1 6 4.5-2.5L16.5 21l-1-6"/>',
    doubleCheck: '<path d="m3 13 4 4 6.5-7.5"/><path d="m12 17 2 2 7-8"/>',
    puce: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
    alim: '<path d="M9 2v6M15 2v6"/><rect x="6" y="8" width="12" height="6" rx="2"/><path d="M12 14v4a3 3 0 0 0 3 3h3"/>',
    bus: '<path d="M3 8h18M3 16h18"/><circle cx="8" cy="8" r="1.6"/><circle cx="16" cy="16" r="1.6"/><path d="M8 9.6v4.8M16 14.4V9.6"/>',
    bornier: '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8v8M11 8v8M15 8v8M19 8v8"/>'
  };

  function icone(nom) {
    const d = DESSINS[nom] || DESSINS.puce;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" '
      + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  // Le filtre compare des textes sans accents ni casse : « délestage » se
  // trouve en tapant « delestage », ce que fait tout le monde sur un clavier
  // de téléphone.
  function aplat(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function fonctions(data) {
    document.body.className = "fonctions";
    const hote = document.getElementById("app");
    let recherche = "";

    function dessine() {
      const m = MOTS[langue];
      const t = data[langue];
      document.title = t.titre + " · TinyRail";
      document.documentElement.lang = langue;
      vider(hote);

      const wrap = el("div", "wrap");

      const retour = el("a", "retour", "← " + m.retour);
      retour.href = "../";
      wrap.append(retour);

      const entete = el("div", "entete");
      const gauche = el("div");
      gauche.append(el("h1", null, t.titre));
      entete.append(gauche, selecteur(dessine));
      wrap.append(entete);

      wrap.append(el("p", "lede", t.lede));

      if (t.repere) {
        const r = el("div", "repere");
        r.append(el("h3", null, t.repere.titre));
        t.repere.texte.forEach(p => r.append(el("p", null, p)));
        wrap.append(r);
      }

      // ── La barre : chercher, ou sauter à un thème ──────────────────────
      const barre = el("div", "barre");
      const champ = document.createElement("input");
      champ.type = "search";
      champ.placeholder = m.filtrer;
      champ.setAttribute("aria-label", m.filtrer);
      champ.value = recherche;
      barre.append(champ);

      const sauts = el("div", "sauts");
      t.themes.forEach((th, i) => {
        const a = el("a", null, th.titre);
        a.href = "#t" + i;
        sauts.append(a);
      });
      barre.append(sauts);
      wrap.append(barre);

      const total = t.themes.reduce((n, th) => n + th.fiches.length, 0);
      const compte = el("p", "compte", m.compte(total, total));
      wrap.append(compte);

      const blocs = [];
      t.themes.forEach((th, i) => {
        const sec = el("section", "theme");
        sec.id = "t" + i;
        sec.append(el("h2", null, th.titre));
        if (th.chapeau) sec.append(el("p", "chapeau", th.chapeau));

        const grille = el("div", "grille");
        const cartes = [];
        th.fiches.forEach(f => {
          const carte = el("article", "fiche");

          const tete = el("div", "tete");
          tete.append(el("div", "ico", icone(f.ico)));
          tete.append(el("h3", null, f.titre));
          carte.append(tete);

          carte.append(el("p", null, f.texte));

          if (f.exemple) {
            carte.append(el("div", "exemple",
              "<b>" + m.exemple + "</b>" + f.exemple));
          }

          if (f.ou && f.ou.length) {
            carte.append(el("div", "ou", f.ou.map(o => {
              const neuf = typeof o === "object" && o.neuf;
              const mot = typeof o === "object" ? o.mot : o;
              return '<span class="' + (neuf ? "neuf" : "") + '">' + mot + "</span>";
            }).join("")));
          }

          grille.append(carte);
          cartes.push({ n: carte, cle: aplat([f.titre, f.texte, f.exemple || "", th.titre].join(" ")) });
        });

        sec.append(grille);
        wrap.append(sec);
        blocs.push({ n: sec, cartes: cartes });
      });

      const rien = el("p", "vide", m.aucune);
      rien.hidden = true;
      wrap.append(rien);

      if (t.note) wrap.append(el("p", "note", "<b>" + t.note.titre + "</b> " + t.note.texte));
      wrap.append(el("footer", null, t.pied));

      hote.append(wrap);

      function filtrer() {
        const q = aplat(recherche).trim();
        let vus = 0;
        blocs.forEach(b => {
          let visibles = 0;
          b.cartes.forEach(c => {
            const ok = !q || c.cle.includes(q);
            c.n.hidden = !ok;
            if (ok) visibles++;
          });
          b.n.hidden = visibles === 0;
          vus += visibles;
        });
        rien.hidden = vus > 0;
        compte.textContent = m.compte(vus, total);
      }

      champ.addEventListener("input", () => { recherche = champ.value; filtrer(); });
      if (recherche) filtrer();
    }

    dessine();
  }

  global.Essais = { sommaire, protocole, fonctions };

})(window);

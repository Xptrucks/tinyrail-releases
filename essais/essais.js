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
      rapportAide: "Tout est gardé dans ce navigateur au fur et à mesure : vous pouvez fermer l'onglet et reprendre plus tard. Le bouton met le compte rendu dans le presse-papiers, prêt à coller dans un message.",
      copier: "Copier le rapport",
      copie: "Copié",
      voir: "Voir le texte",
      effacer: "Tout effacer",
      garde: "Vos réponses restent dans ce navigateur : elles ne quittent pas votre appareil, et ne suivent pas sur un autre.",
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
      inconnu: "?"
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
      rapportAide: "Everything is kept in this browser as you go: you can close the tab and pick up later. The button puts the report on the clipboard, ready to paste into a message.",
      copier: "Copy the report",
      copie: "Copied",
      voir: "Show the text",
      effacer: "Erase everything",
      garde: "Your answers stay in this browser: they never leave your device, and do not follow you to another one.",
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
      inconnu: "?"
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

  global.Essais = { sommaire, protocole };

})(window);

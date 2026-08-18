# tinyrail-releases

> ⚠️ **Miroir historique.** L'adresse du produit est **https://flash.tinyrail.xptrucks.fr**.
> Ce dépôt sert les mêmes fichiers, à l'octet près, et continue d'être alimenté par la CI
> **sans date de fin** — mais c'est le second exemplaire, pas la référence. Ne pas le citer
> comme adresse officielle.

Binaires publics, manifests et pages web de la carte **TinyRail ESP32 v2**, la carte de
commutation de puissance 8 canaux DC pour camping-cars et vans aménagés.

| | Adresse du produit | Miroir (ce dépôt) |
|---|---|---|
| Installer la carte | https://flash.tinyrail.xptrucks.fr/ | https://chpeps.github.io/tinyrail-releases/ |
| Console Bluetooth | https://flash.tinyrail.xptrucks.fr/console/ | …/console/ |
| Manifest OTA | https://ota.tinyrail.xptrucks.fr/manifest.json | …/manifest.json |
| Démonstration de l'app | https://demo.tinyrail.xptrucks.fr/ | …/app/ |

## Pourquoi ce miroir ne s'éteint pas

Chaque carte porte l'adresse de son manifest **gravée à la compilation**, et interroge
cette adresse toutes les 6 heures. Les cartes flashées avant la bascule cherchent leur
mise à jour ici, et n'en changeront qu'en s'étant mises à jour. Rien ne permet de savoir
quand la dernière l'aura fait.

⚠️ **Ce dépôt ne doit jamais être remplacé par une redirection.** Le client HTTP embarqué
ne suit pas de façon fiable une redirection vers un autre domaine : une redirection ferait
**voir** la mise à jour aux cartes et **échouer** son installation, ce qui est pire que de
ne rien changer.

## Écrit par la CI, jamais à la main

Le workflow `Release Firmware` du dépôt source y pousse `firmware.bin`,
`firmware.factory.bin`, `manifest.json`, `install-manifest.json`, `index.html` et
`console/index.html` à chaque tag `vX.Y.Z`, et déploie le **même répertoire** sur
Cloudflare dans la foulée. Deux origines ne peuvent diverger que si elles partent de deux
sources ; ici il n'y en a qu'une.

Une modification faite ici est écrasée à la release suivante. La source vit dans
`jcl73/TinyRail_firmware`, dépôt privé. `app/` est déposé séparément par le dépôt de
l'application mobile.

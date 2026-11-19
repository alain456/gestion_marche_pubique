#!/usr/bin/env python3
"""Génère le diagramme de classes UML (module marché) en SVG puis PNG."""

from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent
SVG_PATH = OUT_DIR / "diagramme_de_classe.svg"
HTML_PATH = OUT_DIR / "diagramme_de_classe.html"

LINE_H = 17
PAD_X = 14
HEADER_H = 28
SEP = 1
FONT = "Liberation Sans, Arial, sans-serif"
FONT_SIZE = 13
ATTR_SIZE = 12.5


def box_height(n_attr, n_meth):
    return HEADER_H + SEP + n_attr * LINE_H + 8 + SEP + n_meth * LINE_H + 10


def esc(text):
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def class_box(x, y, w, name, attrs, methods):
    h_attr = 8 + len(attrs) * LINE_H
    h_meth = 8 + len(methods) * LINE_H
    h = HEADER_H + SEP + h_attr + SEP + h_meth
    y_sep1 = y + HEADER_H
    y_sep2 = y_sep1 + SEP + h_attr

    attr_text = []
    for i, a in enumerate(attrs):
        attr_text.append(
            f'<text x="{x + PAD_X}" y="{y_sep1 + 6 + (i + 1) * LINE_H - 3}" '
            f'font-family="{FONT}" font-size="{ATTR_SIZE}" fill="#111">{esc(a)}</text>'
        )

    meth_text = []
    for i, m in enumerate(methods):
        meth_text.append(
            f'<text x="{x + PAD_X}" y="{y_sep2 + 6 + (i + 1) * LINE_H - 3}" '
            f'font-family="{FONT}" font-size="{ATTR_SIZE}" fill="#111">{esc(m)}</text>'
        )

    return h, f'''
  <rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#ffffff" stroke="#111111" stroke-width="1.4"/>
  <text x="{x + w / 2}" y="{y + 19}" text-anchor="middle" font-family="{FONT}"
        font-size="14.5" font-weight="700" fill="#111">{esc(name)}</text>
  <line x1="{x}" y1="{y_sep1}" x2="{x + w}" y2="{y_sep1}" stroke="#111" stroke-width="1.2"/>
  {"".join(attr_text)}
  <line x1="{x}" y1="{y_sep2}" x2="{x + w}" y2="{y_sep2}" stroke="#111" stroke-width="1.2"/>
  {"".join(meth_text)}
'''


def multiplicity(x, y, text, anchor="middle"):
    return (
        f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="{FONT}" '
        f'font-size="12" font-weight="600" fill="#111">{esc(text)}</text>'
    )


def assoc_label(x, y, text):
    return (
        f'<text x="{x}" y="{y}" text-anchor="middle" font-family="{FONT}" '
        f'font-size="12" font-style="italic" fill="#111">{esc(text)}</text>'
    )


def main():
    utilisateur_attrs = [
        "- idUser : int",
        "- idRole : int",
        "- idService : int",
        "- nom : char",
        "- prenom : char",
        "- email : char",
        "- password : char",
        "- tel : int",
        "- dateCreation : date",
    ]
    utilisateur_meth = [
        "+ sAuthentifier(email, password) : boolean",
        "+ seDeconnecter() : void",
        "+ creerMarche() : Marche",
        "+ publierMarche() : void",
        "+ cloturerMarche() : void",
        "+ attribuerMarche(idOffre) : void",
        "+ consulterMarches() : List",
    ]

    marche_attrs = [
        "- idMarche : int",
        "- montantEstime : int",
        "- modePassation : char",
        "- justificationChoix : char",
        "- seuilReglementaireApplique : char",
        "- dateSelection : char",
        "- validateur : char",
        "- statut : char",
        "- dateCloture : date",
        "- cloturePar : char",
        "- commentaire : char",
    ]
    marche_meth = [
        "+ creer() : void",
        "+ modifier() : void",
        "+ publier() : void",
        "+ appliquerSeuil() : void",
        "+ definirCriteres() : void",
        "+ classerOffres() : Soumissionnaire",
        "+ attribuer(idOffre) : void",
        "+ relancer() : Marche",
        "+ cloturer() : void",
        "+ supprimer() : void",
    ]

    soum_attrs = [
        "- idOffre : int",
        "- nomSoumissionnaire : char",
        "- adresse : char",
        "- telephone : int",
        "- email : char",
        "- referenceAppelOffre : int",
        "- dateSoumission : date",
        "- montantPropose : int",
    ]
    soum_meth = [
        "+ deposerOffre() : void",
        "+ modifierOffre() : void",
        "+ demanderModification() : void",
        "+ evaluerOffre() : void",
        "+ consulterOffres() : List",
        "+ supprimerOffre() : void",
    ]

    notif_attrs = [
        "- idNotification : int",
        "- idMarche : int",
        "- message : char",
        "- dateEnvoi : date",
        "- modeNotification : char",
    ]
    notif_meth = [
        "+ envoyer() : void",
        "+ consulter() : void",
        "+ notifierDepotOffre() : void",
        "+ notifierAttribution() : void",
    ]

    # Positions
    ux, uy, uw = 70, 90, 360
    mx, my, mw = 580, 70, 390
    sx, sy, sw = 110, 590, 350
    nx, ny, nw = 1020, 610, 310

    uh, u_svg = class_box(ux, uy, uw, "Utilisateur", utilisateur_attrs, utilisateur_meth)
    mh, m_svg = class_box(mx, my, mw, "Marche", marche_attrs, marche_meth)
    sh, s_svg = class_box(sx, sy, sw, "Soumissionnaire", soum_attrs, soum_meth)
    nh, n_svg = class_box(nx, ny, nw, "Notification", notif_attrs, notif_meth)

    # Association endpoints
    # Utilisateur right-center -> Marche left, slightly above middle
    u_r_x, u_r_y = ux + uw, uy + uh * 0.42
    m_l_x, m_l_y = mx, my + 210

    # Marche bottom-left -> Soumissionnaire top-center
    m_bl_x, m_bl_y = mx + mw * 0.28, my + mh
    s_t_x, s_t_y = sx + sw * 0.55, sy

    # Marche bottom-right -> Notification top-left
    m_br_x, m_br_y = mx + mw * 0.78, my + mh
    n_t_x, n_t_y = nx + nw * 0.35, ny

    W, H = 1420, 1020
    pkg_x, pkg_y, pkg_w, pkg_h = 28, 18, 1364, 984
    tab_w = 318

    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <rect width="100%" height="100%" fill="#ffffff"/>

  <!-- Package UML -->
  <rect x="{pkg_x}" y="{pkg_y + 22}" width="{pkg_w}" height="{pkg_h - 22}"
        fill="#ffffff" stroke="#111111" stroke-width="1.6"/>
  <rect x="{pkg_x}" y="{pkg_y}" width="{tab_w}" height="22" fill="#ffffff" stroke="#111111" stroke-width="1.6"/>
  <text x="{pkg_x + 10}" y="{pkg_y + 16}" font-family="{FONT}" font-size="13" fill="#111">pkg</text>
  <text x="{pkg_x + 42}" y="{pkg_y + 16}" font-family="{FONT}" font-size="12.5" font-weight="700" fill="#111">MODULE DE GESTION D'UN MARCHÉ</text>

  <!-- Associations (behind boxes) -->
  <line x1="{u_r_x}" y1="{u_r_y}" x2="{m_l_x}" y2="{m_l_y}" stroke="#111" stroke-width="1.3"/>
  {multiplicity(u_r_x + 10, u_r_y - 10, "1", "start")}
  {multiplicity(m_l_x - 26, m_l_y - 10, "0..*", "end")}
  {assoc_label((u_r_x + m_l_x) / 2 - 6, min(u_r_y, m_l_y) - 14, "créer / publier")}

  <line x1="{m_bl_x}" y1="{m_bl_y}" x2="{s_t_x}" y2="{s_t_y}" stroke="#111" stroke-width="1.3"/>
  {multiplicity(m_bl_x - 16, m_bl_y + 22, "1", "end")}
  {multiplicity(s_t_x - 22, s_t_y - 8, "0..*", "end")}
  {assoc_label((m_bl_x + s_t_x) / 2 + 36, (m_bl_y + s_t_y) / 2 + 4, "publier / postuler")}

  <line x1="{m_br_x}" y1="{m_br_y}" x2="{n_t_x}" y2="{n_t_y}" stroke="#111" stroke-width="1.3"/>
  {multiplicity(m_br_x + 18, m_br_y + 22, "1", "start")}
  {multiplicity(n_t_x + 22, n_t_y - 8, "0..*", "start")}
  {assoc_label((m_br_x + n_t_x) / 2 + 22, (m_br_y + n_t_y) / 2, "avoir")}

  {u_svg}
  {m_svg}
  {s_svg}
  {n_svg}
</svg>
'''

    SVG_PATH.write_text(svg, encoding="utf-8")
    HTML_PATH.write_text(
        f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Diagramme de classes — Module marché</title>
  <style>
    html, body {{ margin: 0; padding: 0; background: #fff; }}
  </style>
</head>
<body>
{svg}
</body>
</html>
""",
        encoding="utf-8",
    )
    print(f"SVG: {SVG_PATH}")
    print(f"HTML: {HTML_PATH}")
    print(f"heights U={uh} M={mh} S={sh} N={nh}")


if __name__ == "__main__":
    main()

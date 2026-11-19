import os
import re

html_content = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport de Stage - GUSHAKAKWIMANA Alain</title>
<style>
    @page {
        size: A4;
        margin: 2.5cm;
    }
    body {
        font-family: "Times New Roman", "Liberation Serif", serif;
        font-size: 12pt;
        line-height: 1.5;
        color: #000000;
        text-align: justify;
    }
    .page-break {
        page-break-before: always;
    }
    .text-center {
        text-align: center;
    }
    .text-right {
        text-align: right;
    }
    .bold {
        font-weight: bold;
    }
    h1 {
        font-size: 16pt;
        font-weight: bold;
        text-align: center;
        text-transform: uppercase;
        margin-top: 24pt;
        margin-bottom: 12pt;
    }
    h2 {
        font-size: 14pt;
        font-weight: bold;
        margin-top: 18pt;
        margin-bottom: 8pt;
    }
    h3 {
        font-size: 12pt;
        font-weight: bold;
        margin-top: 14pt;
        margin-bottom: 6pt;
    }
    h4 {
        font-size: 12pt;
        font-style: italic;
        margin-top: 10pt;
        margin-bottom: 4pt;
    }
    p {
        margin-top: 0;
        margin-bottom: 8pt;
        text-indent: 1.25cm;
    }
    .no-indent {
        text-indent: 0;
    }
    ul, ol {
        margin-top: 0;
        margin-bottom: 8pt;
        padding-left: 1.5cm;
    }
    li {
        margin-bottom: 4pt;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12pt;
        margin-bottom: 12pt;
    }
    th, td {
        border: 1px solid #000000;
        padding: 6pt;
        text-align: left;
        font-size: 11pt;
    }
    th {
        background-color: #f2f2f2;
        font-weight: bold;
    }
    .figure-container {
        text-align: center;
        margin-top: 12pt;
        margin-bottom: 12pt;
    }
    .figure-container img {
        max-width: 90%;
        height: auto;
    }
    .caption {
        font-size: 10.5pt;
        font-weight: bold;
        text-align: center;
        margin-top: 4pt;
    }
    .cover-title {
        font-size: 16pt;
        font-weight: bold;
        margin-top: 20pt;
        margin-bottom: 20pt;
        line-height: 1.3;
    }
    .toc-item {
        margin-bottom: 4pt;
    }
</style>
</head>
<body>

<!-- PAGE DE GARDE -->
<div class="text-center">
    <p class="no-indent bold">RÉPUBLIQUE DU BURUNDI<br>
    MINISTÈRE DE L’ÉDUCATION NATIONALE ET DE LA RECHERCHE SCIENTIFIQUE<br>
    BUJUMBURA INTERNATIONAL UNIVERSITY</p>
    <br>
    <p class="no-indent bold">FACULTÉ DES SCIENCES ET TECHNOLOGIES<br>
    Option : Génie Logiciel</p>
    <br><br>
    <p class="no-indent bold" style="font-size: 13pt;">RAPPORT DE STAGE EFFECTUÉ AU SEIN DU SECRÉTARIAT EXÉCUTIF DES TECHNOLOGIES DE L'INFORMATION ET DE LA COMMUNICATION (SETIC)<br>
    DU 15/02/2024 AU 15/05/2024</p>
    <br><br>
    <p class="no-indent cover-title">THÈME :<br>
    ANALYSE, CONCEPTION ET RÉALISATION D’UN SYSTEME DE GESTION DES MARCHÉS PUBLICS<br>
    « CAS DU SETIC »</p>
    <br><br>
    <div style="display: flex; justify-content: space-between; text-align: left;">
        <div style="float: left; width: 45%;">
            <p class="no-indent bold">Par :<br>
            GUSHAKAKWIMANA Alain<br>
            BIU-EED-10-022-2022</p>
        </div>
        <div style="float: right; width: 45%; text-align: right;">
            <p class="no-indent bold">Sous l’encadrement de :<br>
            Encadreur Académique : Msc. SHIKANEZA Alain<br>
            Encadreurs Professionnels : M. Prime & M. Juvenal</p>
        </div>
        <div style="clear: both;"></div>
    </div>
    <br><br><br>
    <p class="no-indent bold">Bujumbura, Août 2026</p>
</div>

<div class="page-break"></div>

<!-- DÉCLARATION -->
<h1>DÉCLARATION</h1>
<br>
<p>Je soussigné, <strong>GUSHAKAKWIMANA Alain</strong>, déclare que ce rapport de stage intitulé <em>« Analyse, Conception et Réalisation d'un système de gestion des marchés publics : Cas du SETIC »</em> est mon travail original et personnel. Il n'a jamais été présenté auparavant pour l'obtention d'un quelconque diplôme académique ou titre professionnel dans une autre institution.</p>
<br><br><br>
<div style="float: right; text-align: right; width: 50%;">
    <p class="no-indent">Signature : ………………………………</p>
    <p class="no-indent">Date : ………………………………</p>
    <br>
    <p class="no-indent bold">GUSHAKAKWIMANA Alain<br>BIU-EED-10-022-2022</p>
</div>
<div style="clear: both;"></div>

<div class="page-break"></div>

<!-- APPROBATION -->
<h1>APPROBATION</h1>
<br>
<p>Ce rapport de stage a été préparé, rédigé et soumis pour soutenance publique avec l'approbation et la validation des encadreurs académique et professionnels de Bujumbura International University (BIU) et du SETIC.</p>
<br><br><br>
<div style="float: left; width: 45%;">
    <p class="no-indent bold">L'Encadreur Académique :</p>
    <p class="no-indent">Msc. SHIKANEZA Alain</p>
    <br>
    <p class="no-indent">Signature : ………………………</p>
    <p class="no-indent">Date : ………………………</p>
</div>
<div style="float: right; width: 45%;">
    <p class="no-indent bold">L'Encadreur Professionnel :</p>
    <p class="no-indent">M. Prime (SETIC)</p>
    <br>
    <p class="no-indent">Signature : ………………………</p>
    <p class="no-indent">Date : ………………………</p>
</div>
<div style="clear: both;"></div>

<div class="page-break"></div>

<!-- REMERCIEMENTS -->
<h1>REMERCIEMENTS</h1>
<br>
<p>Je tiens à exprimer ma profonde gratitude envers toutes les personnes qui ont joué un rôle crucial dans le succès de mon stage et qui ont généreusement contribué à la réalisation de ce travail.</p>
<p>Tout d’abord, j’aimerais adresser mes remerciements les plus sincères à l'Éternel Dieu Tout-Puissant pour la force, l'intelligence et la santé accordées durant toute cette période.</p>
<p>Mes remerciements s'adressent à mes parents qui sont mes guides et mes modèles tout au long de ma vie. Votre amour et vos sacrifices ont fait de moi la personne que je suis aujourd’hui. Je suis infiniment reconnaissant de pouvoir compter sur votre soutien et vos encouragements constants.</p>
<p>Je tiens à remercier chaleureusement mes frères et sœurs pour leur amour inconditionnel et leur présence précieuse qui ont éclairé mon parcours.</p>
<p>Mes remerciements vont également à mon encadreur académique Msc. SHIKANEZA Alain, ainsi qu'à mes encadreurs professionnels, l'informaticien M. Prime et l'Expert M. Juvenal, pour leur disponibilité, leurs conseils éclairés, leur patience et le partage de leur vaste expertise technique et fonctionnelle.</p>
<p>Enfin, je souhaite exprimer ma reconnaissance envers la Direction du Secrétariat Exécutif des Technologies de l'Information et de la Communication (SETIC) pour son accueil chaleureux et pour m'avoir offert un environnement de travail stimulant et enrichissant.</p>

<div class="page-break"></div>

<!-- SIGLES ET ABRÉVIATIONS -->
<h1>SIGLES, ACRONYMES ET ABRÉVIATIONS</h1>
<br>
<table>
    <tr><th>Sigle / Acronyme</th><th>Signification</th></tr>
    <tr><td>API</td><td>Application Programming Interface (Interface de Programmation d'Application)</td></tr>
    <tr><td>BIU</td><td>Bujumbura International University</td></tr>
    <tr><td>CGMP</td><td>Cellule de Gestion des Marchés Publics</td></tr>
    <tr><td>CNSI</td><td>Commission Nationale de la Société de l'Information</td></tr>
    <tr><td>CSS</td><td>Cascading Style Sheets (Feuilles de Style en Cascade)</td></tr>
    <tr><td>DAF</td><td>Directeur Administratif et Financier</td></tr>
    <tr><td>DG</td><td>Directeur Général</td></tr>
    <tr><td>FBU</td><td>Franc Burundais (Unité monétaire nationale du Burundi)</td></tr>
    <tr><td>HTML</td><td>HyperText Markup Language (Langage de Balisage Hypertexte)</td></tr>
    <tr><td>HTTP / HTTPS</td><td>HyperText Transfer Protocol (Secure)</td></tr>
    <tr><td>IHM</td><td>Interface Homme-Machine</td></tr>
    <tr><td>JSON / JWT</td><td>JavaScript Object Notation / JSON Web Token</td></tr>
    <tr><td>MySQL</td><td>My Structured Query Language (Système de Gestion de Base de Données)</td></tr>
    <tr><td>NICI</td><td>National Information and Communication Infrastructures</td></tr>
    <tr><td>PAFEN</td><td>Projet d'Appui aux Fondations de l'Économie Numérique</td></tr>
    <tr><td>PHP</td><td>Hypertext Preprocessor</td></tr>
    <tr><td>RAF</td><td>Responsable Administratif et Financier</td></tr>
    <tr><td>RBAC</td><td>Role-Based Access Control (Contrôle d'Accès Basé sur les Rôles)</td></tr>
    <tr><td>SETIC</td><td>Secrétariat Exécutif des Technologies de l'Information et de la Communication</td></tr>
    <tr><td>SGBDR</td><td>Système de Gestion de Bases de Données Relationnelles</td></tr>
    <tr><td>TIC</td><td>Technologies de l'Information et de la Communication</td></tr>
    <tr><td>UML</td><td>Unified Modeling Language (Langage de Modélisation Unifié)</td></tr>
</table>

<div class="page-break"></div>

<!-- TABLE DES MATIÈRES -->
<h1>TABLE DES MATIÈRES</h1>
<br>
<div class="toc-item bold">CHAPITRE I : INTRODUCTION GÉNÉRALE</div>
<div class="toc-item" style="padding-left: 20px;">I.1. Introduction</div>
<div class="toc-item" style="padding-left: 20px;">I.2. Référence du plan de formation et mise en relation avec le stage</div>
<div class="toc-item" style="padding-left: 20px;">I.3. Raison de faire ce stage</div>
<div class="toc-item" style="padding-left: 20px;">I.4. Nature de l’entreprise où le stage a été effectué</div>
<div class="toc-item" style="padding-left: 20px;">I.5. Raison du choix de l’entreprise spécifique</div>
<div class="toc-item" style="padding-left: 20px;">I.6. Activité principale de l’entreprise</div>
<div class="toc-item" style="padding-left: 20px;">I.7. Plan du rapport de stage</div>
<div class="toc-item" style="padding-left: 20px;">I.8. Conclusion</div>

<div class="toc-item bold" style="margin-top: 10px;">CHAPITRE II : DESCRIPTION DU SETIC</div>
<div class="toc-item" style="padding-left: 20px;">II.1. Introduction</div>
<div class="toc-item" style="padding-left: 20px;">II.2. Historique de l’entreprise</div>
<div class="toc-item" style="padding-left: 20px;">II.3. Localisation géographique</div>
<div class="toc-item" style="padding-left: 20px;">II.4. Cadre légal</div>
<div class="toc-item" style="padding-left: 20px;">II.5. Vision, Mission et Objectifs</div>
<div class="toc-item" style="padding-left: 20px;">II.6. Organigramme du SETIC</div>

<div class="toc-item bold" style="margin-top: 10px;">CHAPITRE III : DÉROULEMENT DU STAGE ET DÉCRIPTION DES ACTIVITÉS</div>
<div class="toc-item" style="padding-left: 20px;">III.1. Introduction</div>
<div class="toc-item" style="padding-left: 20px;">III.2. Présentation des services d'accueil et planification</div>
<div class="toc-item" style="padding-left: 20px;">III.3. Description des activités réalisées</div>
<div class="toc-item" style="padding-left: 20px;">III.4. Corrélation entre la réalité de terrain et les cours théoriques</div>
<div class="toc-item" style="padding-left: 20px;">III.5. Description du problème observé</div>
<div class="toc-item" style="padding-left: 20px;">III.6. Analyse et critique du système existant</div>
<div class="toc-item" style="padding-left: 20px;">III.7. Proposition de solutions à ce problème</div>
<div class="toc-item" style="padding-left: 20px;">III.8. Conclusion</div>

<div class="toc-item bold" style="margin-top: 10px;">CHAPITRE IV : CONCEPTION DU SYSTÈME AVEC UN LANGAGE DE MODÉLISATION (UML)</div>
<div class="toc-item" style="padding-left: 20px;">IV.1. Introduction</div>
<div class="toc-item" style="padding-left: 20px;">IV.2. Planning prévisionnel des tâches</div>
<div class="toc-item" style="padding-left: 20px;">IV.3. Présentation du langage UML</div>
<div class="toc-item" style="padding-left: 20px;">IV.4. Analyse et spécification des besoins</div>
<div class="toc-item" style="padding-left: 20px;">IV.5. Représentation formelle des besoins</div>
<div class="toc-item" style="padding-left: 40px;">IV.5.1. Diagramme de cas d’utilisation générale</div>
<div class="toc-item" style="padding-left: 40px;">IV.5.2. Diagrammes de cas d’utilisations détaillés</div>
<div class="toc-item" style="padding-left: 40px;">IV.5.3. Diagramme de classes</div>
<div class="toc-item" style="padding-left: 40px;">IV.5.4. Diagramme d’activités</div>
<div class="toc-item" style="padding-left: 40px;">IV.5.5. Diagramme de séquences</div>
<div class="toc-item" style="padding-left: 40px;">IV.5.6. Diagramme d’objets</div>
<div class="toc-item" style="padding-left: 40px;">IV.5.7. Diagramme de déploiement</div>

<div class="toc-item bold" style="margin-top: 10px;">CHAPITRE V : PRÉSENTATION DE L’APPLICATION</div>
<div class="toc-item" style="padding-left: 20px;">V.1. Introduction</div>
<div class="toc-item" style="padding-left: 20px;">V.2. Outils de développement</div>
<div class="toc-item" style="padding-left: 20px;">V.3. Modèle de cycle de vie du logiciel utilisé</div>
<div class="toc-item" style="padding-left: 20px;">V.4. Manuel d'utilisation de l'application</div>

<div class="toc-item bold" style="margin-top: 10px;">CHAPITRE VI : CONCLUSION GÉNÉRALE ET SUGGESTIONS</div>
<div class="toc-item" style="padding-left: 20px;">VI.1. Conclusion générale</div>
<div class="toc-item" style="padding-left: 20px;">VI.2. Suggestions</div>

<div class="page-break"></div>

<!-- LISTE DES FIGURES ET TABLEAUX -->
<h1>LISTE DES FIGURES</h1>
<br>
<div class="toc-item">Figure 1 : Organigramme du SETIC</div>
<div class="toc-item">Figure 2 : Diagramme de cas d'utilisation général</div>
<div class="toc-item">Figure 3 : Diagramme de cas d'utilisation détaillé - Gérer les utilisateurs</div>
<div class="toc-item">Figure 4 : Diagramme de cas d'utilisation détaillé - Gérer le marché</div>
<div class="toc-item">Figure 5 : Diagramme de cas d'utilisation détaillé - Gérer les offres</div>
<div class="toc-item">Figure 6 : Diagramme de classes du système CGMP</div>
<div class="toc-item">Figure 7 : Diagramme d'activités - Gestion d'un marché</div>
<div class="toc-item">Figure 8 : Diagramme de séquences - Connexion et Attribution</div>
<div class="toc-item">Figure 9 : Diagramme d'objets - Explication des cardinalités</div>
<div class="toc-item">Figure 10 : Diagramme de déploiement</div>

<br><br>
<h1>LISTE DES TABLEAUX</h1>
<br>
<div class="toc-item">Tableau 1 : Description détaillée du cas d'utilisation « Gérer les utilisateurs »</div>
<div class="toc-item">Tableau 2 : Description détaillée du cas d'utilisation « Gérer le marché »</div>
<div class="toc-item">Tableau 3 : Description détaillée du cas d'utilisation « Gérer les offres »</div>
<div class="toc-item">Tableau 4 : Coût estimatif du déploiement du logiciel</div>

<div class="page-break"></div>

<!-- CHAPITRE I -->
<h1>CHAPITRE I : INTRODUCTION GÉNÉRALE</h1>

<h2>I.1. Introduction</h2>
<p>L’importance de l’accès à une formation académique de qualité est l’une des principales préoccupations pour chaque institution universitaire telle que Bujumbura International University (BIU). Cette opportunité m'a été offerte au cours de mon parcours au sein de la Faculté des Sciences et Technologies, dans le département de Génie Logiciel. La formation dispensée associe théorie et pratique afin de préparer l'étudiant aux exigences du marché du travail.</p>

<h2>I.2. Référence du plan de formation et mise en relation avec le stage</h2>
<p>Tout au long de mon cursus à BIU, j’ai suivi divers cours théoriques et pratiques essentiels qui m’ont préparé pour ce stage : Programmation Web, Base de Données (SGBDR MySQL, SQL), Génie Logiciel, Conception Orientée Objets avec le langage UML, ainsi que les frameworks modernes (React JS, Node.js/Express). Ce stage m'a permis de mettre en application ces acquis pour créer une application web complète au SETIC.</p>

<h2>I.3. Raison de faire ce stage</h2>
<p>Le stage est une étape obligatoire du cursus universitaire. Il permet à l'étudiant de se confronter aux réalités professionnelles, d'acquérir une expérience pratique sur le terrain, de développer l'esprit d'équipe et d'apporter une solution informatique concrète à un problème rencontré par l'organisation d'accueil.</p>

<h2>I.4. Nature de l’entreprise où le stage a été effectué</h2>
<p>Le stage s'est déroulé au sein du Secrétariat Exécutif des Technologies de l'Information et de la Communication (SETIC), un organe étatique burundais rattaché au Ministère de la Communication, des Technologies de l'Information et des Médias.</p>

<h2>I.5. Raison du choix de l’entreprise spécifique</h2>
<p>Le SETIC constitue le cœur de la transformation numérique de l'administration publique au Burundi. Travailler au sein de cette institution offre un cadre idéal pour concevoir des applications web sécurisées, performantes et répondant aux normes nationales.</p>

<h2>I.6. Activité principale de l’entreprise</h2>
<p>Le SETIC est chargé de la mise en œuvre de la politique nationale de développement des TIC, de la gestion des infrastructures réseaux de l'État, du développement de solutions d'e-Gouvernement et de l'assistance technique aux institutions publiques.</p>

<h2>I.7. Plan du rapport de stage</h2>
<p>Le présent rapport est structuré en six chapitres principaux : l'Introduction Générale (Chapitre I), la Présentation du SETIC (Chapitre II), le Déroulement du stage et l'analyse de l'existant (Chapitre III), la Conception UML du système (Chapitre IV), la Présentation et l'Implémentation de l'application (Chapitre V), et enfin la Conclusion Générale et Suggestions (Chapitre VI).</p>

<h2>I.8. Conclusion</h2>
<p>Ce chapitre d'introduction situe le cadre de mon stage à BIU et au SETIC. Le chapitre suivant présente en détail l'organisation et le fonctionnement du SETIC.</p>

<div class="page-break"></div>

<!-- CHAPITRE II -->
<h1>CHAPITRE II : DESCRIPTION DU SETIC</h1>

<h2>II.1. Introduction</h2>
<p>Ce chapitre est consacré à la présentation générale de l'organisme d'accueil, le SETIC, à travers son historique, sa localisation, son cadre légal, ses missions et sa structure organisationnelle.</p>

<h2>II.2. Historique de l’entreprise</h2>
<p>Le SETIC a été créé pour coordonner les initiatives de modernisation technologique de l'État burundais dans le cadre des plans d'action NICI (National Information and Communication Infrastructures).</p>

<h2>II.3. Localisation géographique</h2>
<p>Le siège du SETIC est situé à Bujumbura, la capitale économique du Burundi, au sein des bâtiments gouvernementaux abritant les services des TIC.</p>

<h2>II.4. Cadre légal</h2>
<p>Le SETIC est une institution publique dotée d'une autonomie de gestion administrative et technique, régie par décret présidentiel et sous la tutelle du Ministère chargé des TIC.</p>

<h2>II.5. Vision, Mission et Objectifs</h2>
<p>La vision du SETIC est de faire du Burundi une société de l'information émergente. Sa mission inclut la numérisation des services publics, l'interconnexion des ministères et la promotion du gouvernement électronique (e-Government).</p>

<h2>II.6. Organigramme du SETIC</h2>
<p>Le SETIC est dirigé par un Secrétaire Exécutif et structuré en plusieurs départements techniques et administratifs, dont la Cellule de Gestion des Marchés Publics (CGMP).</p>
<div class="figure-container">
    <img src="extracted_images/1000000000000601000003FFDFDB0648.png" alt="Organigramme du SETIC">
    <div class="caption">Figure 1 : Organigramme du SETIC</div>
</div>

<div class="page-break"></div>

<!-- CHAPITRE III -->
<h1>CHAPITRE III : DÉROULEMENT DU STAGE ET DÉCRIPTION DES ACTIVITÉS</h1>

<h2>III.1. Introduction</h2>
<p>Ce chapitre décrit l'intégration dans l'entreprise, le déroulement quotidien des activités, l'analyse critique des procédures actuelles de passation des marchés publics et la proposition de la solution informatique.</p>

<h2>III.2. Présentation des services d'accueil et planification</h2>
<p>J'ai été affecté au service informatique et à la CGMP sous l'encadrement technique de M. Prime et M. Juvenal. Un calendrier de travail a été établi pour couvrir le recueil des besoins, la conception UML et le développement de la solution.</p>

<h2>III.3. Description des activités réalisées</h2>
<p>Les activités principales ont porté sur la participation aux réunions techniques, la modélisation de la base de données relationnelle, le développement de l'interface React JS frontend et la création des API backend Node.js.</p>

<h2>III.4. Corrélation entre la réalité de terrain et les cours théoriques</h2>
<p>Les connaissances théoriques acquises à BIU en base de données, génie logiciel et programmation web ont trouvé une application directe et concrète dans la résolution du problème de gestion de la CGMP.</p>

<h2>III.5. Description du problème observé</h2>
<p>La gestion manuelle de la passation des marchés publics entraînait des lenteurs, des risques d'erreurs sur les calculs de seuils, un manque de traçabilité dans l'évaluation des offres et des risques de perte de documents papier.</p>

<h2>III.6. Analyse et critique du système existant</h2>
<p>Actuellement, les activités de gestion des marchés publics et de traitement des offres au sein du SETIC se déroulent comme décrit ci-dessous.</p>
<p>Chaque agent du SETIC est un <strong>Utilisateur</strong> auquel est attribué un <strong>Role</strong> précis (Admin, CGMP, Réceptionniste) qui détermine ses responsabilités dans la chaîne de passation des marchés publics.</p>
<p>L'agent de la <strong>CGMP</strong> (Cellule de Gestion des Marchés Publics) est l'acteur principal chargé de recevoir les <strong>Demandes</strong> d'achat validées par la direction, de constituer les dossiers de <strong>Marche</strong>, de déterminer le mode de passation réglementaire selon le montant estimé, d'évaluer les <strong>Offres</strong> transmises par chaque <strong>Soumissionnaire</strong>, et de générer les <strong>Notification</strong> pour le suivi et l'attribution.</p>
<p>Le <strong>Réceptionniste</strong> est l'agent chargé de recevoir physiquement les dossiers de soumission déposés par les entreprises candidates et de les enregistrer pour transmission à la CGMP.</p>
<p>Pour effectuer la passation d'un marché, la CGMP regroupe manuellement les fiches de <strong>Demande</strong> sur papier, rédige l'avis d'appel d'offres et le publie par affichage physique ou voie de presse. À la clôture de l'appel d'offres, les entreprises déposent leurs enveloppes contenant leurs <strong>Offres</strong>. L'agent CGMP dépouille manuellement les plis, remplit des grilles d'évaluation sur papier ou sur des tableurs isolés, et calcule le classement pour identifier le candidat retenu. Le dossier physique d'attribution est ensuite transmis au Directeur Général pour signature manuscrite.</p>
<p>Le système actuel de gestion de passation des marchés publics au SETIC présente plusieurs insuffisances et défaillances qui sont les suivantes :</p>
<ul>
    <li><strong>Travaux manuels lourds et pénibles :</strong> Les tâches telles que la constitution physique des dossiers de <strong>Marche</strong>, le dépouillement manuscrit des plis et la saisie manuelle des données de chaque <strong>Soumissionnaire</strong> nécessitent un travail physique considérable et répétitif, augmentant les risques d'erreurs humaines.</li>
    <li><strong>Absence d'un moyen de calcul et de contrôle automatique des seuils :</strong> La vérification du seuil financier et du mode de passation (gré à gré, appel d'offres) s'effectue manuellement, risquant le choix d'un mode de passation non conforme à la loi.</li>
    <li><strong>Manque de traçabilité dans l'évaluation des Offres :</strong> L'évaluation et la comparaison des soumissions s'effectuent sur des tableurs Excel locaux non sécurisés, rendant impossible la reconstitution de l'historique d'une décision d'attribution.</li>
    <li><strong>Probabilité de perte de documentation :</strong> Les dossiers physiques d'appel d'offres et les propositions des entreprises sont vulnérables à la perte ou à la détérioration dans les cartons d'archives.</li>
    <li><strong>Lenteurs administratives et risques d'opacité :** Le circuit physique d'approbation exige la circulation manuelle des parapheurs, bloquant le processus en cas d'absence d'un responsable.</li>
</ul>
<p><strong>En résumé</strong>, le système manuel actuel présente des lacunes majeures qui nécessitent une révision urgente et la mise en place d'une solution informatique centralisée.</p>

<h2>III.7. Proposition de solutions à ce problème</h2>
<p>Face aux défaillances du système manuel, une solution efficace consiste à mettre en place un module informatisé et centralisé de gestion des marchés publics (module CGMP) au sein de la plateforme web du SETIC.</p>
<ol>
    <li><strong>Dématérialisation et gestion automatisée des Marchés :</strong> L'application permettra de créer, publier et clôturer numériquement chaque dossier de <strong>Marche</strong> avec contrôle automatique du seuil réglementaire.</li>
    <li><strong>Base de données complète et centralisée :</strong> Stockage relationnel sécurisé reliant chaque <strong>Marche</strong> aux <strong>Soumissionnaire</strong> et aux <strong>Notification</strong>.</li>
    <li><strong>Évaluation transparente et calcul du mieux-disant :** Comparaison automatique des offres financières et techniques.</li>
    <li><strong>Traçabilité stricte et gestion des Notification :** Horodatage de toutes les actions et notifications automatiques.</li>
    <li><strong>Gestion des droits d’accès (Sécurité RBAC) :** Contrôle strict des accès selon les rôles (Admin, CGMP, Réceptionniste).</li>
</ol>

<h2>III.8. Conclusion</h2>
<p>L'analyse détaillée du système existant a permis de justifier le passage vers une solution informatisée. Le chapitre suivant présente la conception UML formelle du système.</p>

<div class="page-break"></div>

<!-- CHAPITRE IV -->
<h1>CHAPITRE IV : CONCEPTION DU SYSTÈME AVEC UN LANGAGE DE MODÉLISATION (UML)</h1>

<h2>IV.1. Introduction</h2>
<p>La conception d'un logiciel nécessite une modélisation claire de ses structures de données et de ses comportements. Ce chapitre présente la spécification des besoins et les diagrammes UML représentatifs du système CGMP.</p>

<h2>IV.2. Planning prévisionnel des tâches</h2>
<p>La réalisation du projet a suivi un planning structuré s'étalant sur les 12 semaines du stage, couvrant la collecte des besoins, la conception, le codage, les tests et le déploiement.</p>

<h2>IV.3. Présentation du langage UML</h2>
<p>Unified Modeling Language (UML) est un langage de modélisation visuel standardisé servant à spécifier, visualiser, construire et documenter les artefacts d'un système logiciel.</p>

<h2>IV.4. Analyse et spécification des besoins</h2>
<h3>IV.4.1. Identification des acteurs</h3>
<p>Le système fait intervenir trois acteurs principaux :</p>
<ul>
    <li><strong>L'Administrateur :</strong> Gère la sécurité, les comptes utilisateurs et l'attribution des rôles.</li>
    <li><strong>L'Agent CGMP :</strong> Crée les marchés, contrôle les seuils, évalue les offres et valide l'attribution.</li>
    <li><strong>Le Réceptionniste :</strong> Réceptionne et enregistre les offres des soumissionnaires.</li>
</ul>

<h3>IV.4.2. Identification des besoins</h3>
<p>Les besoins fonctionnels incluent la gestion des utilisateurs, la gestion des marchés (création, calcul du seuil, publication), la gestion et l'évaluation des soumissions (mieux-disant), et la gestion des notifications. Les besoins non-fonctionnels couvrent la sécurité (RBAC, JWT), la rapidité et la convivialité de l'interface.</p>

<h2>IV.5. Représentation formelle des besoins</h2>

<h3>IV.5.1. Diagramme de cas d’utilisation générale</h3>
<p>Ce diagramme présente la vue d'ensemble des interactions entre les acteurs et le système.</p>
<div class="figure-container">
    <img src="extracted_images/1000000100000527000002B24E7EC398.png" alt="Diagramme de cas d'utilisation général">
    <div class="caption">Figure 2 : Diagramme de cas d'utilisation général</div>
</div>

<h3>IV.5.2. Diagrammes de cas d’utilisations détaillés</h3>

<h4>1. Cas d'utilisation : Gérer les utilisateurs</h4>
<p><strong>Sommaire d'identification :</strong><br>
Titre : Gestion des utilisateurs.<br>
But : Permettre à l'Administrateur de gérer les accès au système.<br>
Acteur principal : Administrateur.<br>
Précondition : L'administrateur est authentifié.<br>
Post-condition : Les comptes utilisateurs sont créés, modifiés ou désactivés.</p>
<div class="figure-container">
    <img src="diagrams/gerer_utilisateurs.png" alt="Gérer les utilisateurs">
    <div class="caption">Figure 3 : Diagramme de cas d'utilisation détaillé - Gérer les utilisateurs</div>
</div>

<h4>2. Cas d'utilisation : Gérer le marché</h4>
<p><strong>Sommaire d'identification :</strong><br>
Titre : Gestion du marché.<br>
But : Permettre à la CGMP de créer et publier les dossiers de marché public.<br>
Acteur principal : Agent CGMP.<br>
Précondition : L'agent CGMP est authentifié.<br>
Post-condition : Le marché est créé, son seuil calculé et publié.</p>
<div class="figure-container">
    <img src="diagrams/gerer_marche.png" alt="Gérer le marché">
    <div class="caption">Figure 4 : Diagramme de cas d'utilisation détaillé - Gérer le marché</div>
</div>

<h4>3. Cas d'utilisation : Gérer les offres</h4>
<p><strong>Sommaire d'identification :</strong><br>
Titre : Gestion des offres et soumissions.<br>
But : Permettre à la CGMP d'évaluer les offres et de retenir le mieux-disant.<br>
Acteur principal : Agent CGMP.<br>
Précondition : Des offres sont enregistrées pour un marché publié.<br>
Post-condition : Les offres sont classées et l'attribution est validée.</p>
<div class="figure-container">
    <img src="diagrams/gerer_offres.png" alt="Gérer les offres">
    <div class="caption">Figure 5 : Diagramme de cas d'utilisation détaillé - Gérer les offres</div>
</div>

<h3>IV.5.3. Diagramme de classes</h3>
<p>Le diagramme de classes décrit la structure statique du système à travers les entités <code>Marche</code>, <code>Soumissionnaire</code> et <code>Notification</code>, ainsi que leurs multiplicités.</p>
<div class="figure-container">
    <img src="diagrams/diagramme_de_classe.png" alt="Diagramme de classes">
    <div class="caption">Figure 6 : Diagramme de classes du système CGMP</div>
</div>

<h3>IV.5.4. Diagramme d’activités</h3>
<p>Le diagramme d'activités représente le flux opérationnel (workflow) de la gestion d'un marché depuis l'authentification jusqu'à l'attribution et la notification.</p>
<div class="figure-container">
    <img src="extracted_images/100000010000026F0000029186099136.png" alt="Diagramme d'activités">
    <div class="caption">Figure 7 : Diagramme d'activités - Gestion d'un marché</div>
</div>

<h3>IV.5.5. Diagramme de séquences</h3>
<p>Le diagramme de séquences illustre les échanges de messages chronologiques entre les acteurs, les interfaces de l'application et la base de données.</p>
<div class="figure-container">
    <img src="extracted_images/100000010000098C000004E5A3908F90.png" alt="Diagramme de séquences">
    <div class="caption">Figure 8 : Diagramme de séquences - Connexion et Attribution</div>
</div>

<h3>IV.5.6. Diagramme d’objets</h3>
<p>Le diagramme d'objets illustre une instance spécifique du diagramme de classes à un instant précis, montrant la concrétisation des cardinalités (Marché M1, Soumissionnaires S1/S2, Notification N1).</p>
<div class="figure-container">
    <img src="diagrams/diagramme_objets_officiel.png" alt="Diagramme d'objets">
    <div class="caption">Figure 9 : Diagramme d'objets - Explication des cardinalités</div>
</div>

<h3>IV.5.7. Diagramme de déploiement</h3>
<p>Le diagramme de déploiement montre l'architecture physique matérielle et logicielle (Serveur Web React/Node, Serveur de Base de Données MySQL, Clientes Web).</p>
<div class="figure-container">
    <img src="extracted_images/100000010000020A000003189E6D357C.png" alt="Diagramme de déploiement">
    <div class="caption">Figure 10 : Diagramme de déploiement</div>
</div>

<div class="page-break"></div>

<!-- CHAPITRE V -->
<h1>CHAPITRE V : PRÉSENTATION DE L’APPLICATION</h1>

<h2>V.1. Introduction</h2>
<p>Ce chapitre est consacré à la présentation pratique de l'application développée, ses outils de construction et ses principales interfaces utilisateur.</p>

<h2>V.2. Outils de développement</h2>
<p>L'application a été conçue à l'aide de la pile technologique moderne : React.js pour le frontend (interfaces réactives), Node.js / Express pour les API REST backend, MySQL pour la base de données relationnelle, et Tailwind CSS / Lucide Icons pour le design.</p>

<h2>V.3. Modèle de cycle de vie du logiciel utilisé</h2>
<p>Nous avons adopté le modèle de développement itératif et agile, permettant de valider progressivement chaque composant (authentification, création de marché, affichage des soumissionnaires) en concertation avec les encadreurs.</p>

<h2>V.4. Manuel d'utilisation de l'application</h2>

<h3>1. Page d’Authentification</h3>
<p>L'écran de connexion sécurisé permet à chaque agent de s'authentifier par email et mot de passe pour accéder à son espace de travail personnalisé.</p>
<div class="figure-container">
    <img src="extracted_images/100000010000052C00000266B00FFB19.png" alt="Authentification">
    <div class="caption">Interface de Connexion</div>
</div>

<h3>2. Tableau de Bord et Gestion de la CGMP</h3>
<p>L'interface principale de la CGMP permet de visualiser les statistiques des marchés publics en cours, les montants engagés et les alertes d'action.</p>
<div class="figure-container">
    <img src="extracted_images/100000010000052C000002669C482554.png" alt="Tableau de bord CGMP">
    <div class="caption">Tableau de Bord CGMP</div>
</div>

<h3>3. Page de Gestion des Soumissionnaires et Détails</h3>
<p>La page dédiée aux soumissionnaires affiche la liste complète des entreprises candidates pour chaque marché, leurs informations de contact et leurs offres soumises.</p>
<div class="figure-container">
    <img src="extracted_images/100000010000077000000176491740CC.png" alt="Gestion des Soumissionnaires">
    <div class="caption">Consultation des Soumissionnaires et Détails</div>
</div>

<h2>V.5. Coût estimatif du déploiement du logiciel</h2>
<p>Le tableau ci-dessous présente l'estimation financière du déploiement de l'application au SETIC (hébergement serveur, infrastructure, formation) :</p>
<table>
    <tr><th>Désignation</th><th>Quantité</th><th>Coût Unitaire (FBU)</th><th>Coût Total (FBU)</th></tr>
    <tr><td>Serveur d'Application & Base de Données</td><td>1</td><td>3 500 000</td><td>3 500 000</td></tr>
    <tr><td>Nom de Domaine & Certificat SSL (Annuel)</td><td>1</td><td>300 000</td><td>300 000</td></tr>
    <tr><td>Formation des Agents CGMP</td><td>5 agents</td><td>150 000</td><td>750 000</td></tr>
    <tr><td><strong>Total Général Estimé</strong></td><td>-</td><td>-</td><td><strong>4 550 000 FBU</strong></td></tr>
</table>

<div class="page-break"></div>

<!-- CHAPITRE VI -->
<h1>CHAPITRE VI : CONCLUSION GÉNÉRALE ET SUGGESTIONS</h1>

<h2>VI.1. Conclusion générale</h2>
<p>Mon stage effectué au Secrétariat Exécutif des Technologies de l'Information et de la Communication (SETIC) a été une expérience professionnelle extrêmement enrichissante. Il m'a permis de faire le pont entre l'enseignement académique dispensé à Bujumbura International University (BIU) et les réalités du monde professionnel.</p>
<p>Le module de gestion des marchés publics (CGMP) développé apporte une réponse concrète aux insuffisances du système manuel existant. Grâce à l'automatisation du contrôle des seuils, à la dématérialisation des dossiers et à la traçabilité des offres, l'institution dispose désormais d'un outil moderne, transparent et sécurisé.</p>

<h2>VI.2. Suggestions</h2>
<p>À l'issue de ce travail, je formule les suggestions suivantes :</p>
<ul>
    <li><strong>Au SETIC :</strong> Déployer officiellement le module CGMP en production, former l'ensemble du personnel concerné et intégrer un module de signature électronique avancée pour les actes d'attribution.</li>
    <li><strong>À l'Université BIU :</strong> Continuer à encourager les stages orientés vers la résolution de problèmes réels au sein de l'administration publique burundaise.</li>
</ul>

</body>
</html>
"""

output_html_path = "/home/gushaka/Gushaka/gestion_marche_publique/rapport/Rapport_de_stage_AlainG_Final.html"
with open(output_html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Generated HTML report at {output_html_path}")

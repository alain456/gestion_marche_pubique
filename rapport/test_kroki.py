import urllib.request
import json

uml = """
@startuml
skinparam backgroundColor white
skinparam defaultFontColor black
skinparam defaultFontSize 14

rectangle "Sommaire d'identification" as S1 {
    label "Titre : Créer un marché public"
    label "Acteur principal : Agent CGMP"
    label "Objectif : Regrouper les demandes validées pour créer un marché."
}

actor "Agent CGMP" as CGMP
usecase "Créer un marché" as UC1
usecase "Appliquer seuil réglementaire" as UC2

CGMP --> UC1
UC1 ..> UC2 : <<include>>
@enduml
"""

req = urllib.request.Request(
    'https://kroki.io/plantuml/png',
    data=uml.encode('utf-8'),
    headers={'Content-Type': 'text/plain', 'User-Agent': 'Mozilla/5.0'}
)

try:
    with urllib.request.urlopen(req) as response:
        with open('uc_creer_marche.png', 'wb') as out_file:
            out_file.write(response.read())
    print("Success")
except Exception as e:
    print(e)

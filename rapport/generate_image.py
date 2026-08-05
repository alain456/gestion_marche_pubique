import urllib.request

uml = """
@startuml
skinparam backgroundColor white
skinparam defaultFontColor black
skinparam defaultFontSize 14
skinparam usecase {
    BackgroundColor #E1F5FE
    BorderColor #0277BD
    ArrowColor #0277BD
}
skinparam actor {
    BackgroundColor white
    BorderColor #0277BD
}
skinparam note {
    BackgroundColor #FFF9C4
    BorderColor #FBC02D
}

left to right direction

actor "Agent CGMP" as CGMP

rectangle "Système de Gestion des Marchés" {
    usecase "Créer un marché" as UC1
    usecase "Appliquer le seuil réglementaire\n(et mode de passation)" as UC2
}

note top of UC1
  **SOMMAIRE D'IDENTIFICATION**
  --
  **Cas d'utilisation :** Créer un marché public
  **Acteur principal :** Agent CGMP
  **Objectif :** Regrouper une ou plusieurs
  demandes validées pour former un marché.
  **Description :** Le système calcule
  automatiquement le seuil et le mode
  de passation selon le montant estimé.
end note

CGMP --> UC1 : "Sélectionne les demandes\net valide la création"
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
        with open('UC_Creer_Marche.png', 'wb') as out_file:
            out_file.write(response.read())
    print("Success")
except Exception as e:
    print(e)

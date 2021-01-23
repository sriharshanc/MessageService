# MessageService
MessageService 

Es soll eine .NetCore 3.0 Consolenanwendung entstehen.

Dabei soll ein „MessageHandler/MessageService“ entstehen, der überall, wo er gebraucht wird, aufgerufen werden kann. 
Hier kann eine einfach Beispielklasse den Aufruf ausführen.
Alle Nachrichten sollen in einer Liste gespeichert werden. 

Anforderungen:
    Die Aufrufe müssen Threadsafe sein
    Der Aufruf des Messageservice darf den Mainthread nicht blockieren
    Das Ergebnis des Aufrufs des Messageservice gibt an, ob das sende der Nachricht erfolgreich war.
    Eine Nachricht ist ein „einfacher“ String

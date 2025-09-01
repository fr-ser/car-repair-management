export interface ClientForm {
  vorname: string;
  nachname: string;
  firma: string;
  strasse: string;
  plz: string;
  stadt: string;
  festnetz: string;
  mobil: string;
  email: string;
  geburtstag: Date | null;
  kommentar: string;
}

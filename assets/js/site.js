/* ==========================================================================
   Elkas Dent MKD — page behaviour.
   No dependencies, no scroll listeners (IntersectionObserver only).
   Macedonian lives in the HTML; English replaces it by key.
   ========================================================================== */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const pad = (n) => String(n).padStart(2, '0');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* --------------------------------------------------------------- facts */
  const TEL_MAIN  = '+38978438106';
  const TEL_HUMAN = '078 438 106';
  const OPEN_FROM = 9 * 60;          // 09:00
  const OPEN_TO   = 17 * 60;         // 17:00
  const SLOT_MIN  = 30;
  const LEAD_MIN  = 90;              // no booking less than 1.5h from now
  const DAYS_SHOWN = 14;             // open days offered
  const OPEN_DOW  = [1, 2, 3, 4, 5, 6];   // Mon–Sat; Sunday (0) closed

  /* ----------------------------------------------------------------- i18n */
  // Chrome's Intl has no Macedonian data — it silently falls back to English.
  // Every Macedonian date part is therefore spelled out by hand.
  const MONTHS = {
    mk: ['јануари', 'февруари', 'март', 'април', 'мај', 'јуни', 'јули', 'август', 'септември', 'октомври', 'ноември', 'декември'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    el: ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'],
  };
  const MONTHS_SHORT = {
    mk: ['јан', 'фев', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'ное', 'дек'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    el: ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαΐ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'],
  };
  const DOW = {
    mk: ['недела', 'понеделник', 'вторник', 'среда', 'четврток', 'петок', 'сабота'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    el: ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'],
  };
  const DOW_SHORT = {
    mk: ['нед', 'пон', 'вто', 'сре', 'чет', 'пет', 'саб'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    el: ['Κυρ', 'Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ'],
  };

  const EN = {
    'skip': 'Go to content',
    'brand.name': 'Elkas Dent',
    'brand.sub': 'Dentistry · Bitola',

    'cta.book': 'Book an appointment',
    'cta.bookShort': 'Book now',
    'cta.call': 'Call: 078 438 106',
    'cta.callShort': 'Or call us',
    'cta.callNow': 'Call us',

    'hero.t1': 'Your dentist',
    'hero.t2': 'in Bitola',
    'hero.lead': 'A private dental practice at 33 Sv. Kliment Ohridski Street. Open Monday to Saturday, 09:00 to 17:00.',
    'hero.note': 'Booking takes one minute — there is nothing to register for.',

    'band.h': 'Enough time for every patient',
    'band.l1': 'Open on Saturdays too',
    'band.l2': 'In the centre of Bitola, by Pelagonka 2',
    'band.l3': 'You are told the price up front',
    'band.p': 'At Elkas Dent we examine you first and explain in plain words what needs doing, what it costs and how many visits it will take. Nothing is done until you agree to it.',

    'svc.eyebrow': 'Services',
    'svc.h': 'What we do',
    'svc.lead': 'Choose whatever brings you in and book an appointment straight away.',
    'svc.1t': 'Check-up and advice', 'svc.1d': 'We examine you and tell you clearly what needs doing.',
    'svc.len': '30 minutes',
    'svc.2t': 'Scale and polish',    'svc.2d': 'Removing tartar and polishing the teeth.',
    'svc.3t': 'Fillings',            'svc.3d': 'A white filling for a decayed tooth, in the colour of the tooth.',
    'svc.4t': 'Crowns and bridges',  'svc.4d': 'A crown for a damaged tooth, a bridge where a tooth is missing.',
    'svc.5t': 'Dentures',            'svc.5d': 'Full and partial dentures.',
    'svc.6t': 'Extractions',         'svc.6d': 'Under local anaesthetic.',
    'svc.7t': 'Whitening and veneers', 'svc.7d': 'Cosmetic work for a brighter, more even smile.',
    'svc.8t': 'I have toothache',    'svc.8d': 'If you are in pain, it is best to call us straight away.',

    'case.eyebrow': 'Our work',
    'case.h': 'Before and after',
    'case.lead': 'Real patients of Elkas Dent. The top picture shows how things were before the work, the bottom one after it.',
    'case.1': 'Rebuilding the front teeth',
    'case.2': 'Cleaning and restoring the upper and lower jaw',
    'case.note': 'Every mouth is different. What exactly can be done in your case we will know after the examination.',

    'ab.eyebrow': 'About the practice',
    'ab.h': 'A little about Elkas Dent',
    'ab.p1': 'Elkas Dent is a private dental practice in Bitola, at 33 Sv. Kliment Ohridski Street in the Pelagonka 2 neighbourhood. We are open six days a week, Monday to Saturday, from 09:00 to 17:00.',
    'ab.p2': 'Children and adults both come to us — for routine check-ups and cleaning, for fillings and crowns, for dentures and for cosmetic work on the smile. If you have not seen a dentist in a long while, do say so when you book; we will set aside more time for the first visit.',
    'ab.score': '5.0 ★',
    'ab.google': 'on Google (1 review)',
    'ab.fb': 'recommend on Facebook (9 reviews)',
    'ab.fol': 'followers on Facebook',

    'hr.h': 'Opening hours',
    'hr.closed': 'Closed',
    'd.mon': 'Monday', 'd.tue': 'Tuesday', 'd.wed': 'Wednesday', 'd.thu': 'Thursday',
    'd.fri': 'Friday', 'd.sat': 'Saturday', 'd.sun': 'Sunday',

    'st.h': 'Book your appointment now',
    'st.p': 'Two questions: which day suits you and how to reach you. Nothing more.',

    'ct.eyebrow': 'Contact',
    'ct.h': 'Where we are and how to reach us',
    'ct.addr': 'Address',
    'ct.dir': 'Get directions',
    'ct.tel': 'Telephone',
    'ct.hours': 'Opening hours',
    'ct.hours1': 'Monday – Saturday: 09:00 – 17:00',
    'ct.hours2': 'Sunday: closed',

    'ft.addr': '33 Sv. Kliment Ohridski St, Pelagonka 2, 7000 Bitola · 078 438 106',
    'ft.note': 'The information on this page is general and does not replace a dental examination.',

    'bk.pickDay': 'Choose a day:',
    'bk.name': 'Full name',
    'bk.tel': 'Phone number',
    'bk.telHint': 'We will call you on this number to confirm the appointment.',
    'bk.mail': 'Email',
    'bk.optional': 'optional',
    'bk.note': 'Anything you want to tell us?',
    'bk.first': 'This is my first visit',
    'bk.doneH': 'Your appointment is written down',
    'bk.doneP': 'We will call you to confirm the appointment. If anything changes, do call us on 078 438 106.',
    'bk.ics': 'Add to calendar',
    'bk.viber': 'Send on Viber',
    'bk.sms': 'Send by SMS',
    'bk.print': 'Print',
    'bk.back': 'Back',
    'bk.next': 'Continue',
    'sv.hint': 'This is only a reminder on this phone. To cancel, call 078 438 106.',
    'bk.close': 'Close',
    'sv.clear': 'Hide',

    /* script-only strings */
    'status.open': 'Open now · until 17:00',
    'status.closedSoon': 'Closed · opens tomorrow at 09:00',
    'status.closedMon': 'Closed · opens Monday at 09:00',
    'status.closedToday': 'Closed · opens today at 09:00',
    'bk.step': 'Step {n} of 2',
    'bk.stepDone': 'All done',
    'bk.t1': 'When suits you?',
    'bk.t2': 'How can we reach you?',
    'bk.min': 'minutes',
    'bk.tDone': 'Thank you',
    'bk.chooseTime': 'Choose a time on {d}:',
    'bk.noTimes': 'No free times left on this day. Please pick another day.',
    'bk.tapDay': 'Tap one of the days above and the free times will appear here.',
    'bk.pickFirst': 'Please choose a day and a time.',
    'bk.errName': 'Please write your name.',
    'bk.errPhone': 'Please write a phone number we can reach you on.',
    'bk.sReason': 'Service', 'bk.sWhen': 'When', 'bk.sName': 'Name',
    'bk.sPhone': 'Phone', 'bk.sMail': 'Email', 'bk.sNote': 'Note',
    'bk.sFirst': 'First visit', 'bk.yes': 'Yes',
    'bk.msgTitle': 'Appointment request — Elkas Dent',
    'bk.icsTitle': 'Dentist — Elkas Dent',
    'bk.icsPlace': 'Elkas Dent, 33 Sv. Kliment Ohridski St, Pelagonka 2, Bitola',
    'bk.icsNote': 'Appointment requested through the Elkas Dent website. The practice will call to confirm.',
    'copy.done': 'The text has been copied.',
    'sv.text': 'You have an appointment: {x}',
  };

  /* Greek. Bitola sits 15 km from the Greek border and patients cross for dental
     work, so the third language is theirs. Onest carries no Greek glyphs, so the
     family is swapped under html[lang="el"] — see loadGreekFont(). */
  const EL = {
    'skip': 'Στο περιεχόμενο',
    'brand.name': 'Elkas Dent',
    'brand.sub': 'Οδοντιατρείο · Μπίτολα',

    'cta.book': 'Κλείστε ραντεβού',
    'cta.bookShort': 'Κλείστε ραντεβού',
    'cta.call': 'Καλέστε: 078 438 106',
    'cta.callShort': 'Ή καλέστε μας',
    'cta.callNow': 'Καλέστε',

    'hero.t1': 'Ο οδοντίατρός σας',
    'hero.t2': 'στη Μπίτολα',
    'hero.lead': 'Ιδιωτικό οδοντιατρείο στην οδό Σβ. Κλίμεντ Οχρίντσκι 33. Ανοιχτά από Δευτέρα έως Σάββατο, 09:00 με 17:00.',
    'hero.note': 'Το κλείσιμο ραντεβού παίρνει ένα λεπτό. Δεν χρειάζεται εγγραφή.',

    'band.h': 'Αρκετός χρόνος για κάθε ασθενή',
    'band.p': 'Στο Elkas Dent πρώτα σας εξετάζουμε και σας εξηγούμε με απλά λόγια τι χρειάζεται να γίνει, πόσο κοστίζει και πόσες επισκέψεις θα χρειαστούν. Τίποτα δεν γίνεται πριν συμφωνήσετε.',
    'band.l1': 'Εργαζόμαστε και το Σάββατο',
    'band.l2': 'Στο κέντρο της Μπίτολα, στην Πελαγκόνκα 2',
    'band.l3': 'Σας λέμε την τιμή εκ των προτέρων',

    'svc.eyebrow': 'Υπηρεσίες',
    'svc.h': 'Τι κάνουμε',
    'svc.lead': 'Online κλείνετε οδοντιατρικό έλεγχο. Όλα τα υπόλοιπα συμφωνούνται στον ίδιο τον έλεγχο.',
    'svc.1t': 'Οδοντιατρικός έλεγχος',
    'svc.1d': 'Σας εξετάζουμε και σας λέμε καθαρά τι χρειάζεται να γίνει.',
    'svc.len': '30 λεπτά',

    'case.eyebrow': 'Η δουλειά μας',
    'case.h': 'Πριν και μετά',
    'case.lead': 'Πραγματικοί ασθενείς του Elkas Dent. Στην επάνω φωτογραφία είναι η κατάσταση πριν από τη δουλειά, στην κάτω μετά από αυτήν.',
    'case.1': 'Αποκατάσταση των μπροστινών δοντιών',
    'case.2': 'Καθαρισμός και αποκατάσταση άνω και κάτω γνάθου',
    'case.note': 'Κάθε στόμα είναι διαφορετικό. Τι ακριβώς μπορεί να γίνει στη δική σας περίπτωση θα το ξέρουμε μετά την εξέταση.',

    'ab.eyebrow': 'Για το ιατρείο',
    'ab.h': 'Λίγα λόγια για το Elkas Dent',
    'ab.p1': 'Το Elkas Dent είναι ιδιωτικό οδοντιατρείο στη Μπίτολα, στην οδό Σβ. Κλίμεντ Οχρίντσκι 33, στη συνοικία Πελαγκόνκα 2. Εργαζόμαστε έξι ημέρες την εβδομάδα, από Δευτέρα έως Σάββατο, από τις 09:00 έως τις 17:00.',
    'ab.p2': 'Μας επισκέπτονται παιδιά και ενήλικες — για τακτικό έλεγχο και καθαρισμό, για σφραγίσματα και θήκες, για οδοντοστοιχίες και για αισθητική αποκατάσταση του χαμόγελου. Αν δεν έχετε πάει σε οδοντίατρο για μεγάλο διάστημα, πείτε μας το όταν κλείνετε ραντεβού· θα αφιερώσουμε περισσότερο χρόνο στην πρώτη επίσκεψη.',
    'ab.score': '5.0 ★',
    'ab.google': 'στο Google (1 κριτική)',
    'ab.fb': 'συνιστούν στο Facebook (9 κριτικές)',
    'ab.fol': 'ακόλουθοι στο Facebook',

    'hr.h': 'Ωράριο',
    'hr.closed': 'Κλειστά',
    'd.mon': 'Δευτέρα', 'd.tue': 'Τρίτη', 'd.wed': 'Τετάρτη', 'd.thu': 'Πέμπτη',
    'd.fri': 'Παρασκευή', 'd.sat': 'Σάββατο', 'd.sun': 'Κυριακή',

    'st.h': 'Κλείστε ραντεβού τώρα',
    'st.p': 'Δύο ερωτήσεις: ποια μέρα σας βολεύει και πώς θα σας βρούμε. Τίποτα άλλο.',

    'ct.eyebrow': 'Επικοινωνία',
    'ct.h': 'Πού βρισκόμαστε και πώς θα μας βρείτε',
    'ct.addr': 'Διεύθυνση',
    'ct.dir': 'Οδηγίες πρόσβασης',
    'ct.tel': 'Τηλέφωνο',
    'ct.hours': 'Ωράριο',
    'ct.hours1': 'Δευτέρα – Σάββατο: 09:00 – 17:00',
    'ct.hours2': 'Κυριακή: κλειστά',

    'ft.addr': 'Οδός Σβ. Κλίμεντ Οχρίντσκι 33, Πελαγκόνκα 2, 7000 Μπίτολα · 078 438 106',
    'ft.note': 'Οι πληροφορίες της σελίδας είναι γενικές και δεν αντικαθιστούν την οδοντιατρική εξέταση.',

    'bk.pickDay': 'Επιλέξτε ημέρα:',
    'bk.name': 'Ονοματεπώνυμο',
    'bk.tel': 'Τηλέφωνο',
    'bk.telHint': 'Σε αυτόν τον αριθμό θα σας καλέσουμε για να επιβεβαιώσουμε το ραντεβού.',
    'bk.mail': 'Email',
    'bk.optional': 'προαιρετικό',
    'bk.note': 'Θέλετε να μας πείτε κάτι;',
    'bk.first': 'Έρχομαι για πρώτη φορά',
    'bk.doneH': 'Το ραντεβού σας καταγράφηκε',
    'bk.doneP': 'Θα σας καλέσουμε για να επιβεβαιώσουμε το ραντεβού. Αν κάτι αλλάξει, καλέστε μας στο 078 438 106.',
    'bk.ics': 'Προσθήκη στο ημερολόγιο',
    'bk.viber': 'Αποστολή με Viber',
    'bk.sms': 'Αποστολή SMS',
    'bk.print': 'Εκτύπωση',
    'bk.back': 'Πίσω',
    'bk.next': 'Συνέχεια',
    'bk.close': 'Κλείσιμο',
    'sv.clear': 'Απόκρυψη',
    'sv.hint': 'Αυτό είναι μόνο υπενθύμιση σε αυτό το τηλέφωνο. Για ακύρωση καλέστε στο 078 438 106.',

    /* script-only strings */
    'status.open': 'Ανοιχτά τώρα · έως τις 17:00',
    'status.closedSoon': 'Κλειστά · ανοίγουμε αύριο στις 09:00',
    'status.closedMon': 'Κλειστά · ανοίγουμε τη Δευτέρα στις 09:00',
    'status.closedToday': 'Κλειστά · ανοίγουμε σήμερα στις 09:00',
    'bk.step': 'Βήμα {n} από 2',
    'bk.stepDone': 'Ολοκληρώθηκε',
    'bk.t1': 'Πότε σας βολεύει;',
    'bk.t2': 'Πώς θα σας βρούμε;',
    'bk.tDone': 'Σας ευχαριστούμε',
    'bk.min': 'λεπτά',
    'bk.chooseTime': 'Επιλέξτε ώρα για {d}:',
    'bk.noTimes': 'Δεν υπάρχουν ελεύθερες ώρες εκείνη την ημέρα. Επιλέξτε άλλη ημέρα.',
    'bk.tapDay': 'Πατήστε μία από τις ημέρες παραπάνω και θα εμφανιστούν οι ελεύθερες ώρες.',
    'bk.pickFirst': 'Επιλέξτε ημέρα και ώρα.',
    'bk.errName': 'Παρακαλούμε γράψτε το όνομά σας.',
    'bk.errPhone': 'Παρακαλούμε γράψτε ένα τηλέφωνο για να σας βρούμε.',
    'bk.sReason': 'Υπηρεσία', 'bk.sWhen': 'Πότε', 'bk.sName': 'Όνομα',
    'bk.sPhone': 'Τηλέφωνο', 'bk.sMail': 'Email', 'bk.sNote': 'Σημείωση',
    'bk.sFirst': 'Πρώτη επίσκεψη', 'bk.yes': 'Ναι',
    'bk.msgTitle': 'Αίτημα ραντεβού — Elkas Dent',
    'bk.icsTitle': 'Οδοντίατρος — Elkas Dent',
    'bk.icsPlace': 'Elkas Dent, οδός Σβ. Κλίμεντ Οχρίντσκι 33, Πελαγκόνκα 2, Μπίτολα',
    'bk.icsNote': 'Το ραντεβού ζητήθηκε μέσω της ιστοσελίδας του Elkas Dent. Το ιατρείο θα καλέσει για επιβεβαίωση.',
    'copy.done': 'Το κείμενο αντιγράφηκε.',
    'sv.text': 'Έχετε ραντεβού: {x}',
  };

  const DICTS = { en: EN, el: EL };

  // One bookable service. Everything else is agreed at the check-up itself.
  const SERVICE = { mk: 'Преглед', en: 'Check-up', el: 'Οδοντιατρικός έλεγχος' };
  const SERVICE_MIN = 30;


  /* ------------------------------------------------------- language swap */
  let lang = 'mk';
  const originals = new Map();

  const t = (key) => (lang === 'mk'
    ? (originals.get(key) ?? key)
    : (DICTS[lang]?.[key] ?? originals.get(key) ?? key));

  function captureOriginals() {
    $$('[data-i18n]').forEach((node) => {
      if (!originals.has(node.dataset.i18n)) originals.set(node.dataset.i18n, node.textContent.trim());
    });
    // Macedonian strings that only the script ever prints
    Object.entries({
      'status.open': 'Отворено сега · до 17:00',
      'status.closedSoon': 'Затворено · отвора утре во 09:00',
      'status.closedMon': 'Затворено · отвора во понеделник во 09:00',
      'status.closedToday': 'Затворено · отвора денес во 09:00',
      'bk.step': 'Чекор {n} од 2',
      'bk.stepDone': 'Завршено',
      'bk.t1': 'Кога ви одговара?',
      'bk.t2': 'Како да ве добиеме?',
      'bk.min': 'минути',
      'bk.tDone': 'Ви благодариме',
      'bk.chooseTime': 'Изберете час за {d}:',
      'bk.noTimes': 'Нема слободни часови тој ден. Изберете друг ден.',
      'bk.tapDay': 'Допрете еден од деновите горе и слободните часови ќе се појават овде.',
      'bk.pickFirst': 'Изберете ден и час.',
      'bk.errName': 'Ве молиме напишете го вашето име.',
      'bk.errPhone': 'Ве молиме напишете телефон на кој ќе ве добиеме.',
      'bk.sReason': 'Услуга', 'bk.sWhen': 'Кога', 'bk.sName': 'Име',
      'bk.sPhone': 'Телефон', 'bk.sMail': 'Е-пошта', 'bk.sNote': 'Белешка',
      'bk.sFirst': 'Прва посета', 'bk.yes': 'Да',
      'bk.msgTitle': 'Барање за термин — Елкас Дент',
      'bk.icsTitle': 'Заболекар — Елкас Дент',
      'bk.icsPlace': 'Елкас Дент, ул. Св. Климент Охридски 33, Пелагонка 2, Битола',
      'bk.icsNote': 'Терминот е побаран преку страницата на Елкас Дент. Ординацијата ќе се јави за потврда.',
      'copy.done': 'Текстот е копиран.',
      'sv.text': 'Имате закажано: {x}',
      'bk.close': 'Затвори',
    }).forEach(([k, v]) => { if (!originals.has(k)) originals.set(k, v); });
  }

  // Onest ships no Greek glyphs. Rather than make every visitor pay for a second
  // family, the Greek face is fetched the first time somebody actually asks for it.
  let greekFontAsked = false;
  function loadGreekFont() {
    if (greekFontAsked) return;
    greekFontAsked = true;
    const link = el('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap';
    document.head.append(link);
  }

  function applyLang(next) {
    lang = next;
    document.documentElement.lang = next;
    if (next === 'el') loadGreekFont();
    document.title = {
      en: 'Elkas Dent MKD — Dental practice in Bitola',
      el: 'Elkas Dent MKD — Οδοντιατρείο στη Μπίτολα',
    }[next] || 'Elkas Dent MKD — Стоматолошка ординација во Битола';
    $$('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
    $$('img[data-alt-en]').forEach((img) => {
      if (!img.dataset.altMk) img.dataset.altMk = img.alt;
      img.alt = (next === 'en' && img.dataset.altEn)
        || (next === 'el' && img.dataset.altEl)
        || img.dataset.altMk;
    });
    $$('[data-aria]').forEach((node) => { node.setAttribute('aria-label', t(node.dataset.aria)); });
    $$('[data-lang]').forEach((b) => {
      const on = b.dataset.lang === next;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    try { localStorage.setItem('elkas.lang', next); } catch (_) { /* private mode */ }
    paintStatus();
    renderSaved();
    if (dialog && dialog.open) renderAll();
  }

  /* --------------------------------------------------------- date helpers */
  const keyOf  = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const clock  = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

  /* "понеделник, 20 октомври" / "Monday, 20 October".
     Macedonian weekday names are lowercase inside a sentence and capitalised only
     when the date stands on its own, so the caller says which one it needs. */
  function longDate(key, capital = true) {
    const d = fromKey(key);
    const day = DOW[lang][d.getDay()];
    const name = capital || lang !== 'mk' ? `${day.charAt(0).toUpperCase()}${day.slice(1)}` : day;
    return `${name}, ${d.getDate()} ${MONTHS[lang][d.getMonth()]}`;
  }

  const isOpenDay = (d) => OPEN_DOW.includes(d.getDay());

  /* Free 30-minute starts on a given day key, honouring the lead time. */
  function slotsFor(key) {
    const d = fromKey(key);
    if (!isOpenDay(d)) return [];
    const now = new Date();
    const isToday = keyOf(now) === key;
    const earliest = isToday ? now.getHours() * 60 + now.getMinutes() + LEAD_MIN : 0;
    const out = [];
    for (let m = OPEN_FROM; m + SLOT_MIN <= OPEN_TO; m += SLOT_MIN) {
      if (m >= earliest) out.push(m);
    }
    return out;
  }

  /* The next open days that still have a free slot. */
  function openDays() {
    const out = [];
    const cur = new Date();
    cur.setHours(0, 0, 0, 0);
    for (let i = 0; i < 40 && out.length < DAYS_SHOWN; i += 1) {
      const key = keyOf(cur);
      if (isOpenDay(cur) && slotsFor(key).length) out.push(key);
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }

  /* ------------------------------------------------------- open / closed */
  function paintStatus() {
    const box = $('[data-status]');
    if (!box) return;
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const open = isOpenDay(now) && mins >= OPEN_FROM && mins < OPEN_TO;

    let key;
    if (open) key = 'status.open';
    else if (isOpenDay(now) && mins < OPEN_FROM) key = 'status.closedToday';
    else key = now.getDay() === 6 || now.getDay() === 0 ? 'status.closedMon' : 'status.closedSoon';

    box.classList.toggle('is-open', open);
    $('[data-status-text]', box).textContent = t(key);
  }

  function markToday() {
    const rows = $$('[data-hours-body] tr');
    if (!rows.length) return;
    // table starts at Monday, JS week starts at Sunday
    const i = (new Date().getDay() + 6) % 7;
    rows.forEach((r, n) => r.classList.toggle('is-today', n === i));
  }

  /* ---------------------------------------------------------- page chrome */
  function chrome() {
    // header shadow without a scroll listener
    const head = $('[data-head]');
    const probe = el('div');
    probe.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
    document.body.prepend(probe);
    new IntersectionObserver(
      ([e]) => head.classList.toggle('is-stuck', !e.isIntersecting),
      { threshold: 0 },
    ).observe(probe);

    // gentle one-off reveal
    const rise = $$('.sec__head, .svc li, .case, .band__card, .band__fig, .hours, .ct__i, .ct__map');
    rise.forEach((n) => n.setAttribute('data-rise', ''));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = `${Math.min(i * 55, 220)}ms`;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    rise.forEach((n) => io.observe(n));

    // a photo whose file has not been dropped in yet shows a marked empty slot
    $$('figure[data-photo] img').forEach((img) => {
      const fail = () => {
        const fig = img.closest('figure');
        if (fig.classList.contains('is-missing')) return;
        fig.classList.add('is-missing');
        const box = el('div', 'ph');
        box.append(el('strong', '', img.src.split('/').pop()));
        box.append(el('span', '', img.alt));
        const code = el('code', '', 'assets/img/');
        box.append(code);
        fig.append(box);
      };
      if (img.complete && img.naturalWidth === 0) fail();
      img.addEventListener('error', fail);
    });

    $$('[data-lang]').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));
  }

  /* ============================================================== booking */
  const dialog = $('[data-bk]');
  const bkForm = $('form[data-pane="2"]', dialog);
  const footer = $('[data-bk-foot]', dialog);
  const nextBtn = $('[data-bk-next]', dialog);
  const backBtn = $('[data-bk-back]', dialog);

  const state = { step: 1, date: null, time: null, opener: null };

  const serviceName = () => `${SERVICE[lang]} · ${SERVICE_MIN} ${t('bk.min')}`;

  /* step 2 ---------------------------------------------------------------- */
  function renderDays() {
    const list = $('[data-bk-days]', dialog);
    list.replaceChildren(...openDays().map((key) => {
      const d = fromKey(key);
      const li = el('li');
      const b = el('button', 'day');
      b.type = 'button';
      b.setAttribute('aria-label', longDate(key));
      b.append(
        el('span', 'day__dow', DOW_SHORT[lang][d.getDay()]),
        el('span', 'day__num', String(d.getDate())),
        el('span', 'day__mon', MONTHS_SHORT[lang][d.getMonth()]),
      );
      if (state.date === key) {
        b.classList.add('is-on');
        b.setAttribute('aria-current', 'date');
      }
      b.addEventListener('click', () => {
        if (state.date !== key) state.time = null;
        state.date = key;
        renderDays();
        renderTimes();
        updateFoot();
        // the times appear below a tall day grid — bring them into view, or
        // picking a day looks like it did nothing
        $('[data-bk-times]', dialog).scrollIntoView({
          block: 'start',
          behavior: reducedMotion.matches ? 'auto' : 'smooth',
        });
      });
      li.append(b);
      return li;
    }));
  }

  function renderTimes() {
    const box = $('[data-bk-times]', dialog);
    if (!state.date) {
      box.replaceChildren(el('p', 'times__empty', t('bk.tapDay')));
      return;
    }

    const free = slotsFor(state.date);
    const title = el('p', 'times__t', t('bk.chooseTime').replace('{d}', longDate(state.date, false)));

    if (!free.length) {
      box.replaceChildren(title, el('p', 'times__empty', t('bk.noTimes')));
      return;
    }

    const grid = el('div', 'times__grid');
    free.forEach((m) => {
      const b = el('button', 'slot', clock(m));
      b.type = 'button';
      if (state.time === clock(m)) {
        b.classList.add('is-on');
        b.setAttribute('aria-pressed', 'true');
      }
      b.addEventListener('click', () => {
        state.time = clock(m);
        renderTimes();
        updateFoot();
      });
      grid.append(b);
    });
    box.replaceChildren(title, grid);
  }

  /* step 3 ---------------------------------------------------------------- */
  const details = () => ({
    name:  bkForm.elements.fullname.value.trim(),
    phone: bkForm.elements.phone.value.trim(),
    email: bkForm.elements.email.value.trim(),
    note:  bkForm.elements.note.value.trim(),
    first: bkForm.elements.first.checked,
  });

  function validateDetails() {
    const { name, phone } = details();
    const okName = name.length >= 2;
    const okPhone = phone.replace(/\D/g, '').length >= 6;
    bkForm.elements.fullname.setAttribute('aria-invalid', String(!okName));
    bkForm.elements.phone.setAttribute('aria-invalid', String(!okPhone));

    const err = $('[data-bk-error]', dialog);
    if (okName && okPhone) { err.hidden = true; return true; }
    err.textContent = t(okName ? 'bk.errPhone' : 'bk.errName');
    err.hidden = false;
    (okName ? bkForm.elements.phone : bkForm.elements.fullname).focus();
    return false;
  }

  function summaryRows() {
    const { name, phone, email, note, first } = details();
    const rows = [
      [t('bk.sReason'), serviceName()],
      [t('bk.sWhen'), `${longDate(state.date)}, ${state.time}`],
      [t('bk.sName'), name],
      [t('bk.sPhone'), phone],
    ];
    if (email) rows.push([t('bk.sMail'), email]);
    if (first) rows.push([t('bk.sFirst'), t('bk.yes')]);
    if (note) rows.push([t('bk.sNote'), note]);
    return rows;
  }

  function renderSummary() {
    const dl = $('[data-bk-summary]', dialog);
    dl.replaceChildren(...summaryRows().flatMap(([k, v]) => [el('dt', '', k), el('dd', '', v)]));
  }

  const messageText = () => [t('bk.msgTitle'), ...summaryRows().map(([k, v]) => `${k}: ${v}`)].join('\n');

  function copyQuietly(text) {
    try {
      navigator.clipboard?.writeText(text).then(() => toast(t('copy.done')), () => {});
    } catch (_) { /* no clipboard permission */ }
  }

  /* ---------------------------------------------------------- navigation */
  const TITLES = { 1: 'bk.t1', 2: 'bk.t2', done: 'bk.tDone' };

  function renderAll() {
    renderDays();
    renderTimes();
    if (state.step === 'done') renderSummary();
    paintHead();
    updateFoot();
  }

  function paintHead() {
    const n = state.step === 'done' ? 2 : state.step;
    $('[data-bk-stepline]', dialog).textContent =
      state.step === 'done' ? t('bk.stepDone') : t('bk.step').replace('{n}', String(n));
    $('[data-bk-title]', dialog).textContent = t(TITLES[state.step]);
    $('[data-bk-bar]', dialog).style.width = `${(state.step === 'done' ? 2 : state.step) / 2 * 100}%`;
    $('[data-bk-live]', dialog).textContent = t(TITLES[state.step]);
  }

  function updateFoot() {
    if (state.step === 'done') { footer.hidden = true; return; }
    footer.hidden = false;
    backBtn.hidden = state.step === 1;        // nothing before picking a day
    nextBtn.hidden = false;
    nextBtn.disabled = state.step === 1 && !(state.date && state.time);
  }

  function go(step) {
    state.step = step;
    $$('[data-pane]', dialog).forEach((p) => { p.hidden = p.dataset.pane !== String(step); });
    if (step === 1) { renderDays(); renderTimes(); }
    if (step === 'done') renderSummary();
    paintHead();
    updateFoot();
    $('[data-bk-body]', dialog).scrollTop = 0;

    focusFirst();
  }

  // a keyboard visitor should land on the first choice, not on the close button
  function focusFirst() {
    const first = $('[data-pane]:not([hidden]) button, [data-pane]:not([hidden]) input', dialog);
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 60);
  }

  nextBtn.addEventListener('click', () => {
    if (state.step === 1) {
      if (!(state.date && state.time)) return;
      go(2);
      return;
    }
    if (state.step === 2 && validateDetails()) {
      saveAppointment();
      go('done');
    }
  });

  backBtn.addEventListener('click', () => {
    if (state.step === 2) go(1);
  });

  function openBooking() {
    state.opener = document.activeElement;
    renderAll();
    go(1);
    if (!dialog.open) dialog.showModal();
    focusFirst();
  }

  function closeBooking() {
    if (dialog.open) dialog.close();
  }

  dialog.addEventListener('close', () => {
    if (state.step === 'done') {
      // start clean next time, keeping the saved appointment on the page
      state.step = 1; state.date = null; state.time = null;
      bkForm.reset();
      $('[data-bk-error]', dialog).hidden = true;
      go(1);
    }
    state.opener?.focus?.();
  });

  $('[data-bk-close]', dialog).addEventListener('click', closeBooking);
  $$('[data-open-book], [data-book]').forEach((b) => b.addEventListener('click', () => openBooking()));

  /* ------------------------------------------------------- done actions */
  $$('[data-bk-send]', dialog).forEach((btn) => btn.addEventListener('click', () => {
    const text = messageText();
    copyQuietly(text);
    const body = encodeURIComponent(text);
    // "?&body=" is understood by both iOS and Android messaging apps
    const href = btn.dataset.bkSend === 'viber'
      ? `viber://forward?text=${body}`
      : `sms:${TEL_MAIN}?&body=${body}`;
    window.location.href = href;
  }));

  $('[data-bk-print]', dialog).addEventListener('click', () => window.print());

  $('[data-bk-ics]', dialog).addEventListener('click', () => {
    const d = fromKey(state.date);
    const [hh, mm] = state.time.split(':').map(Number);
    const end = hh * 60 + mm + SLOT_MIN;
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const esc = (s) => String(s).replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
    const day = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Elkas Dent//Booking//MK', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@elkas-dent`, `DTSTAMP:${stamp}`,
      `DTSTART:${day}T${pad(hh)}${pad(mm)}00`,
      `DTEND:${day}T${pad(Math.floor(end / 60))}${pad(end % 60)}00`,
      `SUMMARY:${esc(`${t('bk.icsTitle')}: ${serviceName()}`)}`,
      `LOCATION:${esc(t('bk.icsPlace'))}`,
      `DESCRIPTION:${esc(t('bk.icsNote'))}`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');

    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = el('a');
    a.href = url;
    a.download = 'elkas-dent-termin.ics';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });

  /* --------------------------------------------- the appointment we keep */
  function saveAppointment() {
    const { name, phone } = details();
    try {
      localStorage.setItem('elkas.booking', JSON.stringify({
        date: state.date, time: state.time, name, phone,
      }));
    } catch (_) { /* private mode — the confirmation on screen still stands */ }
    renderSaved();
  }

  function readAppointment() {
    try {
      const raw = localStorage.getItem('elkas.booking');
      if (!raw) return null;
      const b = JSON.parse(raw);
      if (!b || !b.date || !b.time) return null;
      const when = fromKey(b.date);
      when.setHours(...b.time.split(':').map(Number));
      if (when.getTime() < Date.now()) return null;        // already been and gone
      return b;
    } catch (_) { return null; }
  }

  function renderSaved() {
    const box = $('[data-saved]');
    if (!box) return;
    const b = readAppointment();
    if (!b) { box.hidden = true; return; }
    const what = `${serviceName()} · ${longDate(b.date)}, ${b.time}`;
    $('[data-saved-text]', box).textContent = t('sv.text').replace('{x}', what);
    box.hidden = false;
  }

  $('[data-saved-clear]')?.addEventListener('click', () => {
    try { localStorage.removeItem('elkas.booking'); } catch (_) { /* ignore */ }
    renderSaved();
  });

  /* ---------------------------------------------------------------- toast */
  let toastNode = null;
  function toast(text) {
    toastNode?.remove();
    toastNode = el('p', 'saved', text);
    toastNode.style.cssText = 'justify-content:center;text-align:center';
    document.body.append(toastNode);
    setTimeout(() => { toastNode?.remove(); toastNode = null; }, 2600);
  }

  /* ------------------------------------------------------------------ go */
  captureOriginals();
  let saved = null;
  try { saved = localStorage.getItem('elkas.lang'); } catch (_) { /* ignore */ }
  chrome();
  markToday();
  applyLang(['en', 'el'].includes(saved) ? saved : 'mk');
  renderAll();
  setInterval(paintStatus, 60_000);
})();

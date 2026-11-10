import type { L10n } from "@/lib/i18n";

/** Fixed interface wording. Khmer is a draft; have a native speaker proofread it. */
export const ui = {
  cover: {
    invites: { km: "សូមគោរពអញ្ជើញ", en: "Cordially Invites" },
    open: { km: "បើក", en: "Open" },
  },
  info: {
    title: { km: "ព័ត៌មានពិធី", en: "Ceremony Info" },
    mrMrs: { km: "លោក និង លោកស្រី", en: "Mr. & Mrs." },
    together: {
      km: "ឪពុកម្តាយទាំងសងខាងសូមគោរពអញ្ជើញ\nលោកអ្នកចូលរួមក្នុងពិធីអាពាហ៍ពិពាហ៍",
      en: "Together with our families\nwe invite you to our wedding",
    },
    at: { km: "", en: "At" },
  },
  gallery: { title: { km: "កម្រងរូបភាព", en: "Photo Gallery" } },
  reception: {
    title: { km: "ព័ត៌មានពិធីជប់លៀង", en: "Reception Info" },
    takePlace: { km: "ពិធីជប់លៀងប្រព្រឹត្តទៅនៅម៉ោង៖", en: "The reception will take place at:" },
    welcome: { km: "ទទួលភ្ញៀវ", en: "Welcome" },
    start: { km: "ចាប់ផ្តើមពិធី", en: "Reception" },
    countdown: { km: "រាប់ថយក្រោយ", en: "Countdown" },
    days: { km: "ថ្ងៃ", en: "days" },
    hours: { km: "ម៉ោង", en: "hours" },
    minutes: { km: "នាទី", en: "min" },
    seconds: { km: "វិនាទី", en: "sec" },
    today: { km: "ថ្ងៃមង្គលការបានមកដល់ហើយ!", en: "The big day is here!" },
    addToCalendar: { km: "បន្ថែមទៅប្រតិទិន", en: "Add to Calendar" },
    confirm: { km: "បញ្ជាក់ការចូលរួម", en: "Confirm Attendance" },
  },
  rsvp: {
    title: { km: "បញ្ជាក់ការចូលរួមរបស់អ្នក", en: "Confirm your attendance" },
    intro: {
      km: "ការមកចូលរួមរបស់លោកអ្នកគឺជាកិត្តិយសដ៏ធំសម្រាប់យើងខ្ញុំ",
      en: "Your presence would be an honor. Please RSVP so we can prepare the warmest welcome for you.",
    },
    name: { km: "ឈ្មោះរបស់អ្នក", en: "Your name" },
    namePh: { km: "បញ្ចូលឈ្មោះរបស់អ្នក", en: "Enter your name" },
    question: { km: "តើអ្នកនឹងចូលរួមដែរឬទេ?", en: "Will you attend?" },
    yes: { km: "ខ្ញុំនឹងចូលរួម", en: "I will attend" },
    no: { km: "សុំទោស ខ្ញុំមិនអាចចូលរួមបានទេ", en: "Sorry, I can't make it" },
    guests: { km: "ចំនួនភ្ញៀវ", en: "Number of guests" },
    submit: { km: "បញ្ជាក់", en: "Confirm" },
    sending: { km: "កំពុងផ្ញើ...", en: "Sending..." },
    thanksYes: {
      km: "សូមអរគុណ! យើងខ្ញុំរង់ចាំជួបលោកអ្នកនៅថ្ងៃមង្គលការ",
      en: "Thank you! We can't wait to celebrate with you.",
    },
    thanksNo: {
      km: "សូមអរគុណដែលបានប្រាប់យើងខ្ញុំ យើងនឹងនឹករលឹកលោកអ្នក",
      en: "Thank you for letting us know. You will be missed.",
    },
    close: { km: "បិទ", en: "Close" },
    error: { km: "មានបញ្ហា សូមព្យាយាមម្តងទៀត", en: "Something went wrong. Please try again." },
  },
  venue: {
    title: { km: "ទីតាំងពិធីជប់លៀង", en: "Wedding Reception Venue" },
    directions: { km: "ចង្អុលផ្លូវ", en: "Get directions" },
  },
  schedule: { title: { km: "កម្មវិធីថ្ងៃមង្គលការ", en: "Wedding Day Schedule" } },
  guestbook: {
    title: { km: "សៀវភៅជូនពរ", en: "Guestbook" },
    name: { km: "បញ្ចូលឈ្មោះរបស់អ្នក*", en: "Enter your name*" },
    message: { km: "សរសេរពាក្យជូនពរ*", en: "Enter your wishes*" },
    send: { km: "ផ្ញើពាក្យជូនពរ", en: "Send Wishes" },
    sending: { km: "កំពុងផ្ញើ...", en: "Sending..." },
    sent: { km: "សូមអរគុណសម្រាប់ពាក្យជូនពរ!", en: "Thank you for your wishes!" },
    error: { km: "មានបញ្ហា សូមព្យាយាមម្តងទៀត", en: "Something went wrong. Please try again." },
    required: { km: "សូមបំពេញឈ្មោះ និងពាក្យជូនពរ", en: "Please add your name and wishes" },
  },
  gift: {
    title: { km: "ចំណងដៃ", en: "Gift Box" },
    open: { km: "បើកប្រអប់អំណោយ", en: "Open gift box" },
    tap: { km: "ចុចដើម្បីបើក", en: "Tap to open" },
    note: {
      km: "ការមកចូលរួមរបស់លោកអ្នក គឺជាអំណោយដ៏មានតម្លៃបំផុតសម្រាប់យើងខ្ញុំ!",
      en: "Your presence would be the greatest gift we could receive!",
    },
    copy: { km: "ចម្លង", en: "Copy" },
    copied: { km: "បានចម្លង", en: "Copied" },
    saveQr: { km: "រក្សាទុក QR", en: "Save QR" },
    close: { km: "បិទ", en: "Close" },
  },
  lightbox: {
    close: { km: "បិទ", en: "Close lightbox" },
    prev: { km: "រូបមុន", en: "Previous image" },
    next: { km: "រូបបន្ទាប់", en: "Next image" },
  },
  music: { on: { km: "បិទតន្ត្រី", en: "Pause music" }, off: { km: "បើកតន្ត្រី", en: "Play music" } },
} satisfies Record<string, Record<string, L10n>>;

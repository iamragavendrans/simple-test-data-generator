/**
 * datasets.js
 * All static lookup tables ported from main.py.
 * Pure data — no logic here.
 */

export const COUNTRIES = {
  US: { name: "United States",   code: "+1"   },
  GB: { name: "United Kingdom",  code: "+44"  },
  IN: { name: "India",           code: "+91"  },
  DE: { name: "Germany",         code: "+49"  },
  FR: { name: "France",          code: "+33"  },
  CA: { name: "Canada",          code: "+1"   },
  AU: { name: "Australia",       code: "+61"  },
  JP: { name: "Japan",           code: "+81"  },
  BR: { name: "Brazil",          code: "+55"  },
  IT: { name: "Italy",           code: "+39"  },
  ES: { name: "Spain",           code: "+34"  },
  MX: { name: "Mexico",          code: "+52"  },
  KR: { name: "South Korea",     code: "+82"  },
  CN: { name: "China",           code: "+86"  },
  RU: { name: "Russia",          code: "+7"   },
  NL: { name: "Netherlands",     code: "+31"  },
  SE: { name: "Sweden",          code: "+46"  },
  NO: { name: "Norway",          code: "+47"  },
  DK: { name: "Denmark",         code: "+45"  },
  FI: { name: "Finland",         code: "+358" },
  CH: { name: "Switzerland",     code: "+41"  },
  AT: { name: "Austria",         code: "+43"  },
  BE: { name: "Belgium",         code: "+32"  },
  PT: { name: "Portugal",        code: "+351" },
  PL: { name: "Poland",          code: "+48"  },
  CZ: { name: "Czech Republic",  code: "+420" },
  HU: { name: "Hungary",         code: "+36"  },
  GR: { name: "Greece",          code: "+30"  },
  TR: { name: "Turkey",          code: "+90"  },
  ZA: { name: "South Africa",    code: "+27"  },
  NZ: { name: "New Zealand",     code: "+64"  },
  SG: { name: "Singapore",       code: "+65"  },
  HK: { name: "Hong Kong",       code: "+852" },
  AE: { name: "UAE",             code: "+971" },
  SA: { name: "Saudi Arabia",    code: "+966" },
  IL: { name: "Israel",          code: "+972" },
  TH: { name: "Thailand",        code: "+66"  },
  VN: { name: "Vietnam",         code: "+84"  },
  PH: { name: "Philippines",     code: "+63"  },
  ID: { name: "Indonesia",       code: "+62"  },
  MY: { name: "Malaysia",        code: "+60"  },
  AR: { name: "Argentina",       code: "+54"  },
  CL: { name: "Chile",           code: "+56"  },
  CO: { name: "Colombia",        code: "+57"  },
  PE: { name: "Peru",            code: "+51"  },
  EG: { name: "Egypt",           code: "+20"  },
  NG: { name: "Nigeria",         code: "+234" },
  KE: { name: "Kenya",           code: "+254" },
  MA: { name: "Morocco",         code: "+212" },
};

export const IMEI_BRANDS = {
  Apple: "35", Samsung: "49", Google: "49", Huawei: "86",
  Xiaomi: "86", OnePlus: "86", Sony: "35", LG: "35",
  Motorola: "35", Nokia: "35",
};

export const CREDIT_CARD_TYPES = {
  Visa:             { prefix: "4",    length: 16 },
  Mastercard:       { prefix: "51",   length: 16 },
  "American Express": { prefix: "37", length: 15 },
  Discover:         { prefix: "6011", length: 16 },
  JCB:              { prefix: "3528", length: 16 },
  "Diners Club":    { prefix: "36",   length: 14 },
  UnionPay:         { prefix: "62",   length: 16 },
};

export const URL_DOMAINS = [
  "google","facebook","amazon","apple","microsoft","twitter","linkedin",
  "github","stackoverflow","youtube","netflix","instagram","pinterest",
  "reddit","tumblr","whatsapp","telegram","discord","slack","zoom",
];
export const URL_TLDS = ["com","org","net","io","co","ai","app","dev","tech","info","biz"];

export const USERNAME_NAMES = [
  "alex","sam","jordan","taylor","morgan","riley","jamie","quinn","casey",
  "dakota","avery","skyler","dylan","tanner","emma","olivia","ava","isabella",
  "sophia","mia","charlotte","amelia","harper","evelyn","liam","noah","oliver",
  "elijah","james","william","benjamin",
];
export const USERNAME_ADJ = [
  "cool","happy","sunny","lucky","smart","swift","bright","wild","funny",
  "nice","epic","super","mega","ultra","hyper","active","chill","fresh",
  "big","small","fast","slow","young","great","prime","pro","max","ace",
];
export const USERNAME_NOUN = [
  "cat","dog","wolf","shark","lion","bear","fox","hawk","eagle","panda",
  "koala","puppy","kitten","bunny","duck","bird","fish","unicorn","dragon",
  "ninja","coder","geek","hero","star","moon","sun","wave","fire","ice",
  "storm","king","queen","prince","lord","lady",
];

export const JOB_TITLES = [
  "Software Engineer","Senior Software Engineer","Staff Engineer","Principal Engineer",
  "Full Stack Developer","Frontend Developer","Backend Developer","Mobile Developer",
  "DevOps Engineer","Site Reliability Engineer","Cloud Engineer","Platform Engineer",
  "Data Engineer","Machine Learning Engineer","AI Engineer","Data Scientist",
  "Cloud Architect","Solutions Architect","Technical Architect",
  "Engineering Manager","Director of Engineering","VP of Engineering","CTO",
  "UI Designer","UX Designer","Product Designer","Visual Designer",
  "Creative Director","Art Director",
  "Product Manager","Senior Product Manager","Director of Product","VP of Product",
  "Project Manager","Senior Project Manager","Program Manager","Scrum Master",
  "Data Analyst","Senior Data Analyst","Analytics Engineer","BI Developer",
  "System Administrator","Network Engineer","Security Engineer",
  "Penetration Tester","SOC Analyst","DevSecOps Engineer",
  "QA Engineer","QA Automation Engineer","Test Engineer",
  "Technical Writer","Documentation Engineer",
  "Customer Success Engineer","Support Engineer","Sales Engineer",
  "Recruiter","Technical Recruiter","HR Manager",
  "Marketing Manager","Digital Marketing Manager","SEO Specialist",
];

export const COMPANY_SUFFIXES = [
  "Inc","Corp","LLC","Ltd","Group","Solutions","Systems","Tech",
  "Labs","Ventures","Holdings","Enterprises","Co","Partners","Associates",
];

export const FIRST_NAMES = [
  "James","Mary","Robert","Patricia","John","Jennifer","Michael","Linda",
  "David","Elizabeth","William","Barbara","Richard","Susan","Joseph","Jessica",
  "Thomas","Sarah","Charles","Karen","Emma","Olivia","Ava","Isabella","Sophia",
  "Mia","Charlotte","Amelia","Harper","Evelyn","Liam","Noah","Oliver","Elijah",
];
export const LAST_NAMES = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis",
  "Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson",
  "Thomas","Taylor","Moore","Jackson","Martin",
];

export const EMAIL_NAMES = [
  "alex","sam","jordan","taylor","morgan","riley","jamie","quinn","casey",
  "dakota","avery","skyler",
];

export const TEXT_WORDS = [
  "the","quick","brown","fox","jumps","over","lazy","dog","hello","world",
  "test","data","generator","sample","text","random","useful","helpful",
  "amazing","awesome","brilliant","fantastic","wonderful","excellent",
  "perfect","beautiful","lovely","nice","good","great",
];

export const COUNTRIES_LIST = [
  "United States","Canada","United Kingdom","Germany","France","Australia",
  "India","Japan","Brazil","Italy","Spain","Mexico","South Korea","Netherlands",
  "Sweden","Norway","Denmark","Finland","Switzerland","Austria","Belgium",
  "Portugal","Poland","Czech Republic","Hungary","Greece","Turkey","Russia",
  "China","Singapore","UAE","Thailand","Vietnam","Philippines","Indonesia",
  "Malaysia","New Zealand","South Africa","Egypt","Nigeria","Kenya",
  "Argentina","Chile","Colombia","Peru",
];

// Sentence building blocks
export const SENTENCE_SUBJECTS = [
  "The quick brown fox","A happy dog","The clever cat","An innovative startup",
  "A dedicated team","The talented developer","An amazing product","A revolutionary idea",
  "The agile squad","A visionary leader","The creative designer","An experienced tester",
];
export const SENTENCE_VERBS = [
  "jumps over","runs through","explores","discovers","builds","creates",
  "transforms","improves","launches","redesigns","tests","validates",
];
export const SENTENCE_OBJECTS = [
  "the lazy bear","the tall building","new horizons","exciting opportunities",
  "powerful solutions","beautiful designs","complex problems","amazing experiences",
  "critical pathways","robust systems","elegant interfaces","hidden bugs",
];

// Address data by country
export const STREETS_BY_COUNTRY = {
  US: ["Main St","Oak Ave","Park Blvd","First St","Elm St","Maple Dr","Cedar Ln","Pine St","Washington St","Lake Dr"],
  UK: ["High Street","Station Road","London Road","Victoria Road","Church Lane","Manor Road","Park Road","Queens Road"],
  DE: ["Hauptstraße","Bahnhofstraße","Schulstraße","Gartenstraße","Dorfstraße","Bergstraße","Waldstraße","Kirchstraße"],
  FR: ["Rue de la Paix","Avenue des Champs-Élysées","Boulevard Saint-Michel","Rue Victor Hugo","Rue du Commerce"],
  IN: ["MG Road","Ring Road","Main Market","Sector Road","College Road","Station Road"],
  AU: ["George St","Queen St","King St","Elizabeth St","Bourke St","Collins St"],
  CA: ["Yonge St","Queen St","King St","Dundas St","Bloor St","Huntington Ave"],
  JP: ["Main Street","Cherry Blossom Ave","Central Blvd","Garden Road","Temple Street"],
  BR: ["Avenida Paulista","Rua das Flores","Avenida Brasil","Rua 25 de Março","Avenida Copacabana"],
  IT: ["Via Roma","Corso Italia","Via Garibaldi","Piazza del Duomo","Via del Corso"],
  ES: ["Gran Vía","Paseo de la Castellana","Avenida de la Constitución","Calle Mayor"],
  MX: ["Paseo de la Reforma","Avenida Insurgentes","Calle Madero","Avenida Chapultepec"],
  CN: ["Nanjing Road","Beijing Road","Shanghai Street","Guangzhou Avenue","Shenzhen Boulevard"],
  RU: ["Tverskaya Street","Arbat Street","Nevsky Prospect","Lenin Street","Gorky Street"],
  NL: ["Damrak","Kalverstraat","Rokin","Leidsestraat","PC Hooftstraat"],
  SE: ["Drottninggatan","Sveavägen","Göta Boulevard","Kungsgatan","Storgatan"],
  SG: ["Orchard Road","Marina Bay","Bugis Street","Clarke Quay","Havelock Road"],
  AE: ["Sheikh Zayed Road","Al Diyafah Street","Jumeirah Beach Road","Deira Corniche","Business Bay"],
  ZA: ["Sandton City","Oxford Street","Main Road","Long Street","Kloof Street"],
};

export const CITIES_BY_COUNTRY = {
  US: ["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","San Jose","Austin","Jacksonville","Fort Worth","Columbus","Charlotte","San Francisco","Indianapolis","Seattle","Denver","Boston"],
  UK: ["London","Manchester","Birmingham","Edinburgh","Glasgow","Liverpool","Bristol","Leeds","Sheffield","Newcastle","Nottingham","Southampton","Brighton","Oxford","Cambridge"],
  DE: ["Berlin","Munich","Hamburg","Frankfurt","Cologne","Stuttgart","Düsseldorf","Dortmund","Leipzig","Essen","Dresden","Hanover"],
  FR: ["Paris","Lyon","Marseille","Toulouse","Nice","Nantes","Strasbourg","Bordeaux","Lille","Rennes"],
  IN: ["Mumbai","Delhi","Bangalore","Chennai","Kolkata","Hyderabad","Pune","Ahmedabad","Surat","Jaipur","Lucknow","Kanpur"],
  AU: ["Sydney","Melbourne","Brisbane","Perth","Adelaide","Canberra","Hobart","Darwin","Newcastle","Geelong"],
  CA: ["Toronto","Vancouver","Montreal","Calgary","Ottawa","Edmonton","Winnipeg","Halifax","Victoria","Brampton"],
  JP: ["Tokyo","Osaka","Kyoto","Yokohama","Nagoya","Sapporo","Fukuoka","Kobe","Kawasaki","Saitama"],
  BR: ["São Paulo","Rio de Janeiro","Brasília","Salvador","Fortaleza","Belo Horizonte","Manaus","Curitiba"],
  IT: ["Rome","Milan","Naples","Turin","Florence","Venice","Bologna","Genoa","Bari","Palermo"],
  ES: ["Madrid","Barcelona","Valencia","Seville","Bilbao","Málaga","Murcia","Palma"],
  MX: ["Mexico City","Guadalajara","Monterrey","Cancún","Puebla","Tijuana","Veracruz"],
  KR: ["Seoul","Busan","Incheon","Daegu","Daejeon","Gwangju","Suwon"],
  CN: ["Beijing","Shanghai","Guangzhou","Shenzhen","Chengdu","Hangzhou","Wuhan","Nanjing","Xi'an","Chongqing"],
  RU: ["Moscow","Saint Petersburg","Novosibirsk","Yekaterinburg","Nizhny Novgorod","Kazan","Chelyabinsk"],
  NL: ["Amsterdam","Rotterdam","The Hague","Utrecht","Eindhoven","Groningen","Tilburg","Almere"],
  SE: ["Stockholm","Gothenburg","Malmö","Uppsala","Västerås","Örebro","Linköping"],
  SG: ["Singapore"],
  AE: ["Dubai","Abu Dhabi","Sharjah","Al Ain","Ajman","Ras Al Khaimah"],
  ZA: ["Johannesburg","Cape Town","Durban","Pretoria","Port Elizabeth","Bloemfontein"],
  TH: ["Bangkok","Chiang Mai","Phuket","Pattaya","Krabi","Ayutthaya","Khon Kaen"],
  VN: ["Hanoi","Ho Chi Minh City","Da Nang","Hai Phong","Can Tho","Hue","Nha Trang"],
  PH: ["Manila","Quezon City","Cebu City","Davao City","Makati","Taguig","Iloilo City"],
  ID: ["Jakarta","Surabaya","Bandung","Medan","Semarang","Tangerang","Palembang","Makassar"],
  MY: ["Kuala Lumpur","George Town","Johor Bahru","Ipoh","Shah Alam","Kota Kinabalu","Kuching"],
  NZ: ["Auckland","Wellington","Christchurch","Hamilton","Tauranga","Dunedin"],
  EG: ["Cairo","Alexandria","Giza","Luxor","Aswan","Mansoura","Port Said","Suez"],
  NG: ["Lagos","Abuja","Ibadan","Kano","Port Harcourt","Benin City"],
  KE: ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika"],
  GR: ["Athens","Thessaloniki","Patras","Heraklion","Larissa","Volos"],
  TR: ["Istanbul","Ankara","Izmir","Bursa","Antalya","Adana","Gaziantep"],
  MA: ["Casablanca","Rabat","Marrakech","Fes","Tangier","Agadir"],
  AR: ["Buenos Aires","Córdoba","Rosario","Mendoza","La Plata","Tucumán"],
  CL: ["Santiago","Valparaíso","Concepción","La Serena","Antofagasta"],
  CO: ["Bogotá","Medellín","Cali","Barranquilla","Cartagena","Cúcuta"],
  PE: ["Lima","Arequipa","Cusco","Trujillo","Chiclayo","Iquitos"],
};

export const CITIES_ALL = Object.values(CITIES_BY_COUNTRY).flat();

export const FUN_MESSAGES = [
  "✨ Poof! All done!","🎉 Boom! Data incoming!","🚀 Ready for liftoff!",
  "🎯 Bullseye!","🪄 Magic happens here!","⚡ ZAP! Done!",
  "🔥 Hot fresh data!","🌟 Shining bright!","💥 Pow!","🎊 Party time!",
];

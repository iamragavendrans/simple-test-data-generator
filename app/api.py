"""
api.py — Pure Python (stdlib only) REST API for Test Data Generator v3.

Endpoints:
  GET  /api/categories            → list all categories + types
  GET  /api/types                 → flat list of all types with options schema
  POST /api/generate              → body: {"type":"uuid","count":10,"options":{}}
  GET  /api/generate?type=uuid&count=10&[option=value]

All generators match the JS implementations 1-for-1.
CORS is open so any client can call this from any origin.
"""

import calendar
import json
import random
import string
import uuid
import re
from urllib.parse import urlparse, parse_qs

# ── Shared datasets ────────────────────────────────────────────────────────────

COUNTRIES = {"US":{"name":"United States","code":"+1"},"GB":{"name":"United Kingdom","code":"+44"},"IN":{"name":"India","code":"+91"},"DE":{"name":"Germany","code":"+49"},"FR":{"name":"France","code":"+33"},"CA":{"name":"Canada","code":"+1"},"AU":{"name":"Australia","code":"+61"},"JP":{"name":"Japan","code":"+81"},"BR":{"name":"Brazil","code":"+55"},"IT":{"name":"Italy","code":"+39"},"ES":{"name":"Spain","code":"+34"},"MX":{"name":"Mexico","code":"+52"},"KR":{"name":"South Korea","code":"+82"},"CN":{"name":"China","code":"+86"},"RU":{"name":"Russia","code":"+7"},"NL":{"name":"Netherlands","code":"+31"},"SE":{"name":"Sweden","code":"+46"},"NO":{"name":"Norway","code":"+47"},"DK":{"name":"Denmark","code":"+45"},"FI":{"name":"Finland","code":"+358"},"CH":{"name":"Switzerland","code":"+41"},"AT":{"name":"Austria","code":"+43"},"BE":{"name":"Belgium","code":"+32"},"PT":{"name":"Portugal","code":"+351"},"PL":{"name":"Poland","code":"+48"},"CZ":{"name":"Czech Republic","code":"+420"},"HU":{"name":"Hungary","code":"+36"},"GR":{"name":"Greece","code":"+30"},"TR":{"name":"Turkey","code":"+90"},"ZA":{"name":"South Africa","code":"+27"},"NZ":{"name":"New Zealand","code":"+64"},"SG":{"name":"Singapore","code":"+65"},"HK":{"name":"Hong Kong","code":"+852"},"AE":{"name":"UAE","code":"+971"},"SA":{"name":"Saudi Arabia","code":"+966"},"IL":{"name":"Israel","code":"+972"},"TH":{"name":"Thailand","code":"+66"},"VN":{"name":"Vietnam","code":"+84"},"PH":{"name":"Philippines","code":"+63"},"ID":{"name":"Indonesia","code":"+62"},"MY":{"name":"Malaysia","code":"+60"},"AR":{"name":"Argentina","code":"+54"},"CL":{"name":"Chile","code":"+56"},"CO":{"name":"Colombia","code":"+57"},"PE":{"name":"Peru","code":"+51"},"EG":{"name":"Egypt","code":"+20"},"NG":{"name":"Nigeria","code":"+234"},"KE":{"name":"Kenya","code":"+254"},"MA":{"name":"Morocco","code":"+212"}}
CITIES_BY_COUNTRY = {"US":["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","San Jose","Austin","Jacksonville","Fort Worth","Columbus","Charlotte","San Francisco","Indianapolis","Seattle","Denver","Boston"],"UK":["London","Manchester","Birmingham","Edinburgh","Glasgow","Liverpool","Bristol","Leeds","Sheffield","Newcastle","Nottingham","Southampton","Brighton","Oxford","Cambridge"],"DE":["Berlin","Munich","Hamburg","Frankfurt","Cologne","Stuttgart","Düsseldorf","Dortmund","Leipzig","Essen","Dresden","Hanover"],"FR":["Paris","Lyon","Marseille","Toulouse","Nice","Nantes","Strasbourg","Bordeaux","Lille","Rennes"],"IN":["Mumbai","Delhi","Bangalore","Chennai","Kolkata","Hyderabad","Pune","Ahmedabad","Surat","Jaipur","Lucknow","Kanpur"],"AU":["Sydney","Melbourne","Brisbane","Perth","Adelaide","Canberra","Hobart","Darwin","Newcastle","Geelong"],"CA":["Toronto","Vancouver","Montreal","Calgary","Ottawa","Edmonton","Winnipeg","Halifax","Victoria","Brampton"],"JP":["Tokyo","Osaka","Kyoto","Yokohama","Nagoya","Sapporo","Fukuoka","Kobe","Kawasaki","Saitama"],"BR":["São Paulo","Rio de Janeiro","Brasília","Salvador","Fortaleza","Belo Horizonte","Manaus","Curitiba"],"IT":["Rome","Milan","Naples","Turin","Florence","Venice","Bologna","Genoa","Bari","Palermo"],"ES":["Madrid","Barcelona","Valencia","Seville","Bilbao","Málaga","Murcia","Palma"],"MX":["Mexico City","Guadalajara","Monterrey","Cancún","Puebla","Tijuana","Veracruz"],"KR":["Seoul","Busan","Incheon","Daegu","Daejeon","Gwangju","Suwon"],"CN":["Beijing","Shanghai","Guangzhou","Shenzhen","Chengdu","Hangzhou","Wuhan","Nanjing","Xi'an","Chongqing"],"RU":["Moscow","Saint Petersburg","Novosibirsk","Yekaterinburg","Nizhny Novgorod","Kazan","Chelyabinsk"],"NL":["Amsterdam","Rotterdam","The Hague","Utrecht","Eindhoven","Groningen","Tilburg","Almere"],"SE":["Stockholm","Gothenburg","Malmö","Uppsala","Västerås","Örebro","Linköping"],"SG":["Singapore"],"AE":["Dubai","Abu Dhabi","Sharjah","Al Ain","Ajman","Ras Al Khaimah"],"ZA":["Johannesburg","Cape Town","Durban","Pretoria","Port Elizabeth","Bloemfontein"],"TH":["Bangkok","Chiang Mai","Phuket","Pattaya","Krabi","Ayutthaya","Khon Kaen"],"VN":["Hanoi","Ho Chi Minh City","Da Nang","Hai Phong","Can Tho","Hue","Nha Trang"],"PH":["Manila","Quezon City","Cebu City","Davao City","Makati","Taguig","Iloilo City"],"ID":["Jakarta","Surabaya","Bandung","Medan","Semarang","Tangerang","Palembang","Makassar"],"MY":["Kuala Lumpur","George Town","Johor Bahru","Ipoh","Shah Alam","Kota Kinabalu","Kuching"],"NZ":["Auckland","Wellington","Christchurch","Hamilton","Tauranga","Dunedin"],"EG":["Cairo","Alexandria","Giza","Luxor","Aswan","Mansoura","Port Said","Suez"],"NG":["Lagos","Abuja","Ibadan","Kano","Port Harcourt","Benin City"],"KE":["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika"],"GR":["Athens","Thessaloniki","Patras","Heraklion","Larissa","Volos"],"TR":["Istanbul","Ankara","Izmir","Bursa","Antalya","Adana","Gaziantep"],"MA":["Casablanca","Rabat","Marrakech","Fes","Tangier","Agadir"],"AR":["Buenos Aires","Córdoba","Rosario","Mendoza","La Plata","Tucumán"],"CL":["Santiago","Valparaíso","Concepción","La Serena","Antofagasta"],"CO":["Bogotá","Medellín","Cali","Barranquilla","Cartagena","Cúcuta"],"PE":["Lima","Arequipa","Cusco","Trujillo","Chiclayo","Iquitos"]}
CITIES_ALL = [c for cl in CITIES_BY_COUNTRY.values() for c in cl]
STREETS_BY_COUNTRY = {"US":["Main St","Oak Ave","Park Blvd","First St","Elm St","Maple Dr","Cedar Ln","Pine St","Washington St","Lake Dr"],"UK":["High Street","Station Road","London Road","Victoria Road","Church Lane","Manor Road","Park Road","Queens Road"],"DE":["Hauptstraße","Bahnhofstraße","Schulstraße","Gartenstraße","Dorfstraße","Bergstraße","Waldstraße","Kirchstraße"],"FR":["Rue de la Paix","Avenue des Champs-Élysées","Boulevard Saint-Michel","Rue Victor Hugo","Rue du Commerce"],"IN":["MG Road","Ring Road","Main Market","Sector Road","College Road","Station Road"],"AU":["George St","Queen St","King St","Elizabeth St","Bourke St","Collins St"],"CA":["Yonge St","Queen St","King St","Dundas St","Bloor St","Huntington Ave"],"JP":["Main Street","Cherry Blossom Ave","Central Blvd","Garden Road","Temple Street"],"BR":["Avenida Paulista","Rua das Flores","Avenida Brasil","Rua 25 de Março","Avenida Copacabana"],"IT":["Via Roma","Corso Italia","Via Garibaldi","Piazza del Duomo","Via del Corso"],"ES":["Gran Vía","Paseo de la Castellana","Avenida de la Constitución","Calle Mayor"],"MX":["Paseo de la Reforma","Avenida Insurgentes","Calle Madero","Avenida Chapultepec"],"CN":["Nanjing Road","Beijing Road","Shanghai Street","Guangzhou Avenue","Shenzhen Boulevard"],"RU":["Tverskaya Street","Arbat Street","Nevsky Prospect","Lenin Street","Gorky Street"],"NL":["Damrak","Kalverstraat","Rokin","Leidsestraat","PC Hooftstraat"],"SE":["Drottninggatan","Sveavägen","Göta Boulevard","Kungsgatan","Storgatan"],"SG":["Orchard Road","Marina Bay","Bugis Street","Clarke Quay","Havelock Road"],"AE":["Sheikh Zayed Road","Al Diyafah Street","Jumeirah Beach Road","Deira Corniche","Business Bay"],"ZA":["Sandton City","Oxford Street","Main Road","Long Street","Kloof Street"]}
CREDIT_CARD_TYPES = {"Visa":{"prefix":"4","length":16},"Mastercard":{"prefix":"51","length":16},"American Express":{"prefix":"37","length":15},"Discover":{"prefix":"6011","length":16},"JCB":{"prefix":"3528","length":16},"Diners Club":{"prefix":"36","length":14},"UnionPay":{"prefix":"62","length":16}}
IMEI_BRANDS = {"Apple":"35","Samsung":"49","Google":"49","Huawei":"86","Xiaomi":"86","OnePlus":"86","Sony":"35","LG":"35","Motorola":"35","Nokia":"35"}
FIRST_NAMES = ["James","Mary","Robert","Patricia","John","Jennifer","Michael","Linda","David","Elizabeth","William","Barbara","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Charles","Karen","Emma","Olivia","Ava","Isabella","Sophia","Mia","Charlotte","Amelia","Harper","Evelyn","Liam","Noah","Oliver","Elijah"]
LAST_NAMES = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin"]
EMAIL_NAMES = ["alex","sam","jordan","taylor","morgan","riley","jamie","quinn","casey","dakota","avery","skyler"]
USERNAME_ADJ = ["cool","happy","sunny","lucky","smart","swift","bright","wild","funny","nice","epic","super","mega","ultra","hyper","active","chill","fresh","big","small","fast","slow","young","great","prime","pro","max","ace"]
USERNAME_NAMES = ["alex","sam","jordan","taylor","morgan","riley","jamie","quinn","casey","dakota","avery","skyler","dylan","tanner","emma","olivia","ava","isabella","sophia","mia","charlotte","amelia","harper","evelyn","liam","noah","oliver","elijah","james","william","benjamin"]
USERNAME_NOUN = ["cat","dog","wolf","shark","lion","bear","fox","hawk","eagle","panda","koala","puppy","kitten","bunny","duck","bird","fish","unicorn","dragon","ninja","coder","geek","hero","star","moon","sun","wave","fire","ice","storm","king","queen","prince","lord","lady"]
COMPANY_SUFFIXES = ["Inc","Corp","LLC","Ltd","Group","Solutions","Systems","Tech","Labs","Ventures","Holdings","Enterprises","Co","Partners","Associates"]
JOB_TITLES = ["Software Engineer","Senior Software Engineer","Staff Engineer","Principal Engineer","Full Stack Developer","Frontend Developer","Backend Developer","Mobile Developer","DevOps Engineer","Site Reliability Engineer","Cloud Engineer","Platform Engineer","Data Engineer","Machine Learning Engineer","AI Engineer","Data Scientist","Cloud Architect","Solutions Architect","Technical Architect","Engineering Manager","Director of Engineering","VP of Engineering","CTO","UI Designer","UX Designer","Product Designer","Visual Designer","Creative Director","Art Director","Product Manager","Senior Product Manager","Director of Product","VP of Product","Project Manager","Senior Project Manager","Program Manager","Scrum Master","Data Analyst","Senior Data Analyst","Analytics Engineer","BI Developer","System Administrator","Network Engineer","Security Engineer","Penetration Tester","SOC Analyst","DevSecOps Engineer","QA Engineer","QA Automation Engineer","Test Engineer","Technical Writer","Documentation Engineer","Customer Success Engineer","Support Engineer","Sales Engineer","Recruiter","Technical Recruiter","HR Manager","Marketing Manager","Digital Marketing Manager","SEO Specialist"]
SENTENCE_SUBJECTS = ["The quick brown fox","A happy dog","The clever cat","An innovative startup","A dedicated team","The talented developer","An amazing product","A revolutionary idea","The agile squad","A visionary leader","The creative designer","An experienced tester"]
SENTENCE_VERBS = ["jumps over","runs through","explores","discovers","builds","creates","transforms","improves","launches","redesigns","tests","validates"]
SENTENCE_OBJECTS = ["the lazy bear","the tall building","new horizons","exciting opportunities","powerful solutions","beautiful designs","complex problems","amazing experiences","critical pathways","robust systems","elegant interfaces","hidden bugs"]
TEXT_WORDS = ["the","quick","brown","fox","jumps","over","lazy","dog","hello","world","test","data","generator","sample","text","random","useful","helpful","amazing","awesome","brilliant","fantastic","wonderful","excellent","perfect","beautiful","lovely","nice","good","great"]
URL_DOMAINS = ["google","facebook","amazon","apple","microsoft","twitter","linkedin","github","stackoverflow","youtube","netflix","instagram","pinterest","reddit","tumblr","whatsapp","telegram","discord","slack","zoom"]

# ── Helpers ────────────────────────────────────────────────────────────────────

def ch(lst):
    return random.choice(lst)

def ri(lo, hi):
    return random.randint(lo, hi)

def luhn_check(partial: str) -> int:
    total, doubled = 0, True
    for c in reversed(partial):
        d = int(c) * (2 if doubled else 1)
        if d > 9: d -= 9
        total += d
        doubled = not doubled
    return (10 - (total % 10)) % 10

# ── Generators — one function per type ────────────────────────────────────────

def gen_uuid(opts):
    raw = str(uuid.uuid4())
    p = (opts.get("prefix") or "")[:8]
    s = (opts.get("suffix") or "")[:12]
    if not p and not s:
        return raw
    hex32 = raw.replace("-", "")
    if p: hex32 = p + hex32[len(p):]
    if s: hex32 = hex32[:32 - len(s)] + s
    hex32 = hex32.ljust(32, "0")[:32]
    return f"{hex32[:8]}-{hex32[8:12]}-{hex32[12:16]}-{hex32[16:20]}-{hex32[20:]}"

def gen_hash(opts):
    algo = opts.get("algorithm", "sha256")
    sizes = {"md5": 16, "sha1": 20, "sha256": 32}
    n = sizes.get(algo, 32)
    return "".join(f"{ri(0,255):02x}" for _ in range(n))

def gen_password(opts):
    pool = ""
    if opts.get("uppercase", True):  pool += string.ascii_uppercase
    if opts.get("lowercase", True):  pool += string.ascii_lowercase
    if opts.get("numbers",   True):  pool += string.digits
    if opts.get("special",  False):  pool += "!@#$%^&*()_+-=[]{}|;:,.<>?"
    if not pool: pool = string.ascii_lowercase
    length = int(opts.get("length", 16))
    return "".join(random.choice(pool) for _ in range(length))

def gen_username(opts):
    style  = opts.get("style", "name_year")
    prefix = opts.get("prefix", "")
    name   = ch(USERNAME_NAMES)
    if   style == "adj_noun":    result = f"{ch(USERNAME_ADJ)}_{ch(USERNAME_NOUN)}"
    elif style == "name_random": result = f"{name}.{ri(100,999)}"
    elif style == "mrx":         result = f"mrx_{name}"
    else:                        result = f"{name}{ri(1,99)}"
    return (prefix or "") + result

def gen_name(opts):
    sw = (opts.get("starts_with") or "").strip().upper()
    ew = (opts.get("ends_with")   or "").strip().upper()
    candidates = []
    if sw:
        for f in FIRST_NAMES:
            if f.upper().startswith(sw): candidates.append(f"{f} {ch(LAST_NAMES)}")
        for l in LAST_NAMES:
            if l.upper().startswith(sw): candidates.append(f"{ch(FIRST_NAMES)} {l}")
    if ew:
        for f in FIRST_NAMES:
            if f.upper().endswith(ew): candidates.append(f"{f} {ch(LAST_NAMES)}")
        for l in LAST_NAMES:
            if l.upper().endswith(ew): candidates.append(f"{ch(FIRST_NAMES)} {l}")
    if candidates:
        return ch(candidates)
    return f"{ch(FIRST_NAMES)} {ch(LAST_NAMES)}"

def gen_email(opts):
    domain = opts.get("domain") or ch(URL_DOMAINS)
    ext    = opts.get("extension", "com")
    name   = ch(EMAIL_NAMES)
    n      = ri(1, 999)
    return f"{name}{n}@{domain}.{ext}"

def gen_phone(opts):
    country      = opts.get("country", "US")
    include_code = str(opts.get("include_code", True)).lower() not in ("false", "0")
    info         = COUNTRIES.get(country, COUNTRIES["US"])
    code         = info["code"]
    number       = f"{ri(200,999)}-{ri(100,999)}-{ri(1000,9999)}"
    return f"{code} {number}" if include_code else number

def _norm_country(c):
    # COUNTRIES uses 'GB', street/city tables use 'UK' — normalize so lookups match.
    return "UK" if c == "GB" else c

def gen_address(opts):
    country = _norm_country(opts.get("country", "US"))
    streets = STREETS_BY_COUNTRY.get(country, STREETS_BY_COUNTRY["US"])
    cities  = CITIES_BY_COUNTRY.get(country, CITIES_ALL)
    number  = ri(1, 9999)
    return f"{number} {ch(streets)}, {ch(cities)}"

def gen_country(opts):
    sw = (opts.get("starts_with") or "").strip().upper()
    names = [v["name"] for v in COUNTRIES.values()]
    if sw:
        filtered = [n for n in names if n.upper().startswith(sw)]
        return ch(filtered) if filtered else ch(names)
    return ch(names)

def gen_city(opts):
    country = _norm_country(opts.get("country") or "")
    if country and country in CITIES_BY_COUNTRY:
        return ch(CITIES_BY_COUNTRY[country])
    return ch(CITIES_ALL)

def gen_zipcode(opts):
    country = _norm_country(opts.get("country", "US"))
    lo = int(opts.get("from", 10000))
    hi = int(opts.get("to",   99999))
    n  = ri(lo, hi)
    if country == "UK":
        letters = string.ascii_uppercase
        return f"{ch(letters)}{ch(letters)}{ri(1,9)} {ri(1,9)}{ch(letters)}{ch(letters)}"
    if country == "CA":
        lts = string.ascii_uppercase
        return f"{ch(lts)}{ri(0,9)}{ch(lts)} {ri(0,9)}{ch(lts)}{ri(0,9)}"
    return str(n).zfill(5)

def gen_coordinates(opts):
    p   = max(1, min(8, int(opts.get("precision", 6))))
    lat = round(random.uniform(-90,   90),   p)
    lng = round(random.uniform(-180, 180),   p)
    return f"{lat:.{p}f}, {lng:.{p}f}"

def gen_credit_card(opts):
    card_type = opts.get("card_type", "Random")
    valid     = opts.get("valid", "valid") == "valid"
    if card_type == "Random":
        card_type = ch(["Visa","Mastercard","American Express"])
    cfg     = CREDIT_CARD_TYPES.get(card_type, CREDIT_CARD_TYPES["Visa"])
    partial = cfg["prefix"]
    while len(partial) < cfg["length"] - 1:
        partial += str(ri(0, 9))
    check = luhn_check(partial)
    cc    = partial + str(check)
    if not valid:
        cc = cc[:-1] + str((int(cc[-1]) + 1) % 10)
    if card_type == "American Express":
        return f"{cc[:4]}-{cc[4:10]}-{cc[10:]}"
    return "-".join(cc[i:i+4] for i in range(0, len(cc), 4))

def gen_ssn(opts):
    country = opts.get("country", "US")
    if country == "Random": country = ch(["US","UK"])
    if country == "UK":
        return f"{ri(10,99)} {ri(100000,999999)} {ri(100000,999999)}"
    return f"{ri(100,999)}-{ri(10,99)}-{ri(1000,9999)}"

def gen_barcode(opts):
    numeric_only = str(opts.get("numeric_only", True)).lower() not in ("false","0")
    length       = max(8, min(20, int(opts.get("length", 13))))
    if numeric_only:
        return "".join(str(ri(0,9)) for _ in range(length))
    chars = string.digits + string.ascii_uppercase
    return "".join(random.choice(chars) for _ in range(length))

def gen_isbn(opts):
    fmt = opts.get("format", "isbn13")
    if fmt == "isbn10":
        digits = [str(ri(0,9)) for _ in range(9)]
        total  = sum((10 - i) * int(d) for i, d in enumerate(digits))
        check  = (11 - (total % 11)) % 11
        check_char = "X" if check == 10 else str(check)
        d = "".join(digits)
        return f"{d[0]}-{d[1:6]}-{d[6:]}-{check_char}"
    nine    = [str(ri(0,9)) for _ in range(9)]
    partial = "978" + "".join(nine)
    total   = sum((1 if i % 2 == 0 else 3) * int(partial[i]) for i in range(12))
    check   = (10 - (total % 10)) % 10
    p = partial
    return f"{p[:3]}-{p[3:5]}-{p[5:10]}-{p[10:12]}-{check}"

def gen_ip(opts):
    version = opts.get("version", "ipv4")
    if version == "ipv6":
        return ":".join(f"{ri(0,65535):04x}" for _ in range(8))
    return ".".join(str(ri(0,255)) for _ in range(4))

def gen_url(opts):
    protocol  = opts.get("protocol", "https")
    domain    = opts.get("domain") or ch(URL_DOMAINS)
    extension = opts.get("extension", "com")
    paths     = ["","api","v1","v2","docs","users","products","blog","about","contact"]
    path      = ch(paths)
    url       = f"{protocol}://{domain}.{extension}"
    if path: url += f"/{path}"
    return url

def gen_mac(opts):
    upper = str(opts.get("uppercase", True)).lower() not in ("false","0")
    sep   = opts.get("separator", ":")
    parts = [f"{ri(0,255):02x}" for _ in range(6)]
    joined = sep.join(parts)
    return joined.upper() if upper else joined

def gen_imei(opts):
    brand          = opts.get("brand", "Generic")
    valid_checksum = str(opts.get("valid_checksum", True)).lower() not in ("false","0")
    tac  = IMEI_BRANDS.get(brand, str(ri(35,86))) if brand != "Generic" else str(ri(35,86))
    base = tac + "".join(str(ri(0,9)) for _ in range(12))
    d14  = base[:14]
    if not valid_checksum:
        return d14 + str((int(d14[-1]) + 1) % 10)
    return d14 + str(luhn_check(d14))

def gen_date(opts):
    from_year = int(opts.get("from_year", 2000))
    to_year   = int(opts.get("to_year",   2030))
    fmt       = opts.get("format", "iso")
    y, m = ri(from_year, to_year), ri(1, 12)
    d = ri(1, calendar.monthrange(y, m)[1])
    if fmt == "us": return f"{m:02d}/{d:02d}/{y}"
    if fmt == "eu": return f"{d:02d}/{m:02d}/{y}"
    return f"{y}-{m:02d}-{d:02d}"

def gen_datetime(opts):
    inc_date = str(opts.get("include_date", True)).lower()  not in ("false","0")
    inc_time = str(opts.get("include_time", True)).lower()  not in ("false","0")
    inc_tz   = str(opts.get("include_timezone", False)).lower() not in ("false","0")
    y, mo = ri(2020, 2025), ri(1, 12)
    d = ri(1, calendar.monthrange(y, mo)[1])
    h, mi, s = ri(0,23), ri(0,59), ri(0,59)
    ms       = ri(0,999)
    date_s   = f"{y}-{mo:02d}-{d:02d}"
    time_s   = f"{h:02d}:{mi:02d}:{s:02d}.{ms:03d}"
    if   inc_date and inc_time: result = f"{date_s}T{time_s}"
    elif inc_date:               result = date_s
    elif inc_time:               result = time_s
    else:                        result = date_s
    return result + ("Z" if inc_tz else "")

def gen_sentence(opts):
    grammatical = str(opts.get("grammatically_valid", True)).lower() not in ("false","0")
    if grammatical:
        return f"{ch(SENTENCE_SUBJECTS)} {ch(SENTENCE_VERBS)} {ch(SENTENCE_OBJECTS)}."
    words = " ".join(ch(TEXT_WORDS) for _ in range(ri(5,12)))
    return words.capitalize() + "."

def gen_paragraph(opts):
    lo = max(1, int(opts.get("min_sentences", 3)))
    hi = max(lo, int(opts.get("max_sentences", 6)))
    n  = ri(lo, hi)
    return " ".join(gen_sentence({}) for _ in range(n))

def gen_hex_color(opts):
    upper = str(opts.get("uppercase", True)).lower() not in ("false","0")
    h = f"#{ri(0,255):02x}{ri(0,255):02x}{ri(0,255):02x}"
    return h.upper() if upper else h

def gen_rgb_color(opts):
    lo = max(0, min(255, int(opts.get("min_value", 0))))
    hi = max(lo, min(255, int(opts.get("max_value", 255))))
    return f"rgb({ri(lo,hi)},{ri(lo,hi)},{ri(lo,hi)})"

def gen_company(opts):
    sw   = (opts.get("starts_with") or "").strip()
    name = ch(USERNAME_ADJ).capitalize() + " " + ch(COMPANY_SUFFIXES)
    return (sw + name) if sw and not name.upper().startswith(sw.upper()) else name

def gen_job(opts):
    seniority = opts.get("seniority", "any")
    if seniority == "any":
        return ch(JOB_TITLES)
    filtered = [j for j in JOB_TITLES if seniority.lower() in j.lower()]
    return ch(filtered) if filtered else ch(JOB_TITLES)

# ── Dispatch map ───────────────────────────────────────────────────────────────

GENERATORS = {
    "uuid":        gen_uuid,
    "hash":        gen_hash,
    "password":    gen_password,
    "username":    gen_username,
    "name":        gen_name,
    "email":       gen_email,
    "phone":       gen_phone,
    "address":     gen_address,
    "country":     gen_country,
    "city":        gen_city,
    "zipcode":     gen_zipcode,
    "coordinates": gen_coordinates,
    "credit_card": gen_credit_card,
    "ssn":         gen_ssn,
    "barcode":     gen_barcode,
    "isbn":        gen_isbn,
    "ip":          gen_ip,
    "url":         gen_url,
    "mac_address": gen_mac,
    "imei":        gen_imei,
    "date":        gen_date,
    "datetime":    gen_datetime,
    "sentence":    gen_sentence,
    "paragraph":   gen_paragraph,
    "hex_color":   gen_hex_color,
    "rgb_color":   gen_rgb_color,
    "company":     gen_company,
    "job":         gen_job,
}

# ── Categories (mirrors categories.js) ────────────────────────────────────────

CATEGORIES_META = [
    {"id":"identifiers","name":"Identifiers & Security","icon":"🔑","types":["uuid","hash","password","username"]},
    {"id":"contact",    "name":"Contact & Identity",    "icon":"👤","types":["name","email","phone","address","country","city","zipcode","coordinates"]},
    {"id":"financial",  "name":"Financial & Sensitive", "icon":"💳","types":["credit_card","ssn","barcode","isbn"]},
    {"id":"network",    "name":"Network & Web",         "icon":"🌐","types":["ip","url","mac_address","imei"]},
    {"id":"time_text",  "name":"Time & Text",           "icon":"🕐","types":["date","datetime","sentence","paragraph"]},
    {"id":"colors",     "name":"Colors",                "icon":"🎨","types":["hex_color","rgb_color"]},
    {"id":"work",       "name":"Work & Organization",   "icon":"🏢","types":["company","job"]},
]

def get_categories_response():
    return CATEGORIES_META

def generate(type_id: str, options: dict, count: int = 10):
    fn = GENERATORS.get(type_id)
    if not fn:
        return None, f"Unknown type: {type_id}"
    count = max(1, min(1000, int(count)))
    opts  = {k: v for k, v in options.items() if v is not None and v != ""}
    data  = [fn(opts) for _ in range(count)]
    return data, None

# ── HTTP handler (called from server.py) ──────────────────────────────────────

CORS_HEADERS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
}

def _send_json(handler, status: int, body: dict):
    payload = json.dumps(body, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    for k, v in CORS_HEADERS.items():
        handler.send_header(k, v)
    handler.send_header("Content-Length", str(len(payload)))
    handler.end_headers()
    handler.wfile.write(payload)

def handle_api(handler, method: str, path: str, body: bytes):
    """Entry point called by server.py for any /api/* request."""

    # CORS preflight
    if method == "OPTIONS":
        _send_json(handler, 204, {})
        return

    # GET /api/categories
    if path == "/api/categories":
        _send_json(handler, 200, {"categories": get_categories_response()})
        return

    # GET /api/types
    if path == "/api/types":
        _send_json(handler, 200, {"types": list(GENERATORS.keys())})
        return

    # POST /api/generate   OR   GET /api/generate?type=...
    if path == "/api/generate" or path.startswith("/api/generate?"):
        try:
            if method == "POST":
                payload = json.loads(body or b"{}")
                type_id = payload.get("type", "")
                count   = int(payload.get("count", 10))
                options = payload.get("options", {})
            else:
                # GET — parse query string
                qs     = parse_qs(urlparse(path).query)
                type_id = (qs.get("type") or [""])[0]
                count   = int((qs.get("count") or ["10"])[0])
                # Every remaining key is an option
                options = {k: v[0] for k, v in qs.items() if k not in ("type","count")}

            if not type_id:
                _send_json(handler, 400, {"error": "Missing required field: type"})
                return

            data, error = generate(type_id, options, count)
            if error:
                _send_json(handler, 404, {"error": error, "available_types": list(GENERATORS.keys())})
                return

            _send_json(handler, 200, {
                "type":    type_id,
                "count":   len(data),
                "options": options,
                "data":    data,
            })
        except (json.JSONDecodeError, ValueError) as e:
            _send_json(handler, 400, {"error": str(e)})
        return

    _send_json(handler, 404, {"error": f"Unknown endpoint: {path}"})

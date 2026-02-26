import { Home, Briefcase, GraduationCap, Users, Backpack, Building, Star, Heart, Tent, Plane, Coffee, ShoppingBag, Map } from "lucide-react"

export const CATEGORIES = [
    { name: "Student", icon: GraduationCap, slug: "student" },
    { name: "Family", icon: Users, slug: "family" },
    { name: "Traveller", icon: Plane, slug: "traveller" },
    // { name: "Business", icon: Briefcase, slug: "business" },
    { name: "Backpacker", icon: Backpack, slug: "backpacker" },
    { name: "Long-term", icon: Building, slug: "long-term" },
    { name: "Short-term", icon: Home, slug: "short-term" },
    { name: "Sharing", icon: Heart, slug: "sharing" },
    // { name: "General", icon: Home, slug: "general" },
    // { name: "Luxury", icon: Star, slug: "luxury" },
    // { name: "Camping", icon: Tent, slug: "camping" },
]

export const COUNTRIES = [
    { name: "Afghanistan", code: "AF", flag: "https://flagcdn.com/w40/af.png", phoneCode: "+93", currency: "AFN" },
    { name: "Albania", code: "AL", flag: "https://flagcdn.com/w40/al.png", phoneCode: "+355", currency: "ALL" },
    { name: "Algeria", code: "DZ", flag: "https://flagcdn.com/w40/dz.png", phoneCode: "+213", currency: "DZD" },
    { name: "Andorra", code: "AD", flag: "https://flagcdn.com/w40/ad.png", phoneCode: "+376", currency: "EUR" },
    { name: "Angola", code: "AO", flag: "https://flagcdn.com/w40/ao.png", phoneCode: "+244", currency: "AOA" },
    { name: "Argentina", code: "AR", flag: "https://flagcdn.com/w40/ar.png", phoneCode: "+54", currency: "ARS" },
    { name: "Armenia", code: "AM", flag: "https://flagcdn.com/w40/am.png", phoneCode: "+374", currency: "AMD" },
    { name: "Australia", code: "AU", flag: "https://flagcdn.com/w40/au.png", phoneCode: "+61", currency: "AUD" },
    { name: "Austria", code: "AT", flag: "https://flagcdn.com/w40/at.png", phoneCode: "+43", currency: "EUR" },
    { name: "Azerbaijan", code: "AZ", flag: "https://flagcdn.com/w40/az.png", phoneCode: "+994", currency: "AZN" },
    { name: "Bahrain", code: "BH", flag: "https://flagcdn.com/w40/bh.png", phoneCode: "+973", currency: "BHD" },
    { name: "Bangladesh", code: "BD", flag: "https://flagcdn.com/w40/bd.png", phoneCode: "+880", currency: "BDT" },
    { name: "Belarus", code: "BY", flag: "https://flagcdn.com/w40/by.png", phoneCode: "+375", currency: "BYN" },
    { name: "Belgium", code: "BE", flag: "https://flagcdn.com/w40/be.png", phoneCode: "+32", currency: "EUR" },
    { name: "Belize", code: "BZ", flag: "https://flagcdn.com/w40/bz.png", phoneCode: "+501", currency: "BZD" },
    { name: "Benin", code: "BJ", flag: "https://flagcdn.com/w40/bj.png", phoneCode: "+229", currency: "XOF" },
    { name: "Bhutan", code: "BT", flag: "https://flagcdn.com/w40/bt.png", phoneCode: "+975", currency: "BTN" },
    { name: "Bolivia", code: "BO", flag: "https://flagcdn.com/w40/bo.png", phoneCode: "+591", currency: "BOB" },
    { name: "Bosnia and Herzegovina", code: "BA", flag: "https://flagcdn.com/w40/ba.png", phoneCode: "+387", currency: "BAM" },
    { name: "Botswana", code: "BW", flag: "https://flagcdn.com/w40/bw.png", phoneCode: "+267", currency: "BWP" },
    { name: "Brazil", code: "BR", flag: "https://flagcdn.com/w40/br.png", phoneCode: "+55", currency: "BRL" },
    { name: "Brunei", code: "BN", flag: "https://flagcdn.com/w40/bn.png", phoneCode: "+673", currency: "BND" },
    { name: "Bulgaria", code: "BG", flag: "https://flagcdn.com/w40/bg.png", phoneCode: "+359", currency: "BGN" },
    { name: "Burkina Faso", code: "BF", flag: "https://flagcdn.com/w40/bf.png", phoneCode: "+226", currency: "XOF" },
    { name: "Burundi", code: "BI", flag: "https://flagcdn.com/w40/bi.png", phoneCode: "+257", currency: "BIF" },
    { name: "Cambodia", code: "KH", flag: "https://flagcdn.com/w40/kh.png", phoneCode: "+855", currency: "KHR" },
    { name: "Cameroon", code: "CM", flag: "https://flagcdn.com/w40/cm.png", phoneCode: "+237", currency: "XAF" },
    { name: "Canada", code: "CA", flag: "https://flagcdn.com/w40/ca.png", phoneCode: "+1", currency: "CAD" },
    { name: "Cape Verde", code: "CV", flag: "https://flagcdn.com/w40/cv.png", phoneCode: "+238", currency: "CVE" },
    { name: "Central African Republic", code: "CF", flag: "https://flagcdn.com/w40/cf.png", phoneCode: "+236", currency: "XAF" },
    { name: "Chad", code: "TD", flag: "https://flagcdn.com/w40/td.png", phoneCode: "+235", currency: "XAF" },
    { name: "Chile", code: "CL", flag: "https://flagcdn.com/w40/cl.png", phoneCode: "+56", currency: "CLP" },
    { name: "China", code: "CN", flag: "https://flagcdn.com/w40/cn.png", phoneCode: "+86", currency: "CNY" },
    { name: "Colombia", code: "CO", flag: "https://flagcdn.com/w40/co.png", phoneCode: "+57", currency: "COP" },
    { name: "Comoros", code: "KM", flag: "https://flagcdn.com/w40/km.png", phoneCode: "+269", currency: "KMF" },
    { name: "Costa Rica", code: "CR", flag: "https://flagcdn.com/w40/cr.png", phoneCode: "+506", currency: "CRC" },
    { name: "Croatia", code: "HR", flag: "https://flagcdn.com/w40/hr.png", phoneCode: "+385", currency: "EUR" },
    { name: "Cuba", code: "CU", flag: "https://flagcdn.com/w40/cu.png", phoneCode: "+53", currency: "CUP" },
    { name: "Cyprus", code: "CY", flag: "https://flagcdn.com/w40/cy.png", phoneCode: "+357", currency: "EUR" },
    { name: "Czech Republic", code: "CZ", flag: "https://flagcdn.com/w40/cz.png", phoneCode: "+420", currency: "CZK" },
    { name: "Denmark", code: "DK", flag: "https://flagcdn.com/w40/dk.png", phoneCode: "+45", currency: "DKK" },
    { name: "Djibouti", code: "DJ", flag: "https://flagcdn.com/w40/dj.png", phoneCode: "+253", currency: "DJF" },
    { name: "Ecuador", code: "EC", flag: "https://flagcdn.com/w40/ec.png", phoneCode: "+593", currency: "USD" },
    { name: "Egypt", code: "EG", flag: "https://flagcdn.com/w40/eg.png", phoneCode: "+20", currency: "EGP" },
    { name: "El Salvador", code: "SV", flag: "https://flagcdn.com/w40/sv.png", phoneCode: "+503", currency: "USD" },
    { name: "Equatorial Guinea", code: "GQ", flag: "https://flagcdn.com/w40/gq.png", phoneCode: "+240", currency: "XAF" },
    { name: "Eritrea", code: "ER", flag: "https://flagcdn.com/w40/er.png", phoneCode: "+291", currency: "ERN" },
    { name: "Estonia", code: "EE", flag: "https://flagcdn.com/w40/ee.png", phoneCode: "+372", currency: "EUR" },
    { name: "Ethiopia", code: "ET", flag: "https://flagcdn.com/w40/et.png", phoneCode: "+251", currency: "ETB" },
    { name: "Fiji", code: "FJ", flag: "https://flagcdn.com/w40/fj.png", phoneCode: "+679", currency: "FJD" },
    { name: "Finland", code: "FI", flag: "https://flagcdn.com/w40/fi.png", phoneCode: "+358", currency: "EUR" },
    { name: "France", code: "FR", flag: "https://flagcdn.com/w40/fr.png", phoneCode: "+33", currency: "EUR" },
    { name: "Gabon", code: "GA", flag: "https://flagcdn.com/w40/ga.png", phoneCode: "+241", currency: "XAF" },
    { name: "Gambia", code: "GM", flag: "https://flagcdn.com/w40/gm.png", phoneCode: "+220", currency: "GMD" },
    { name: "Georgia", code: "GE", flag: "https://flagcdn.com/w40/ge.png", phoneCode: "+995", currency: "GEL" },
    { name: "Germany", code: "DE", flag: "https://flagcdn.com/w40/de.png", phoneCode: "+49", currency: "EUR" },
    { name: "Ghana", code: "GH", flag: "https://flagcdn.com/w40/gh.png", phoneCode: "+233", currency: "GHS" },
    { name: "Greece", code: "GR", flag: "https://flagcdn.com/w40/gr.png", phoneCode: "+30", currency: "EUR" },
    { name: "Guatemala", code: "GT", flag: "https://flagcdn.com/w40/gt.png", phoneCode: "+502", currency: "GTQ" },
    { name: "Guinea", code: "GN", flag: "https://flagcdn.com/w40/gn.png", phoneCode: "+224", currency: "GNF" },
    { name: "Guyana", code: "GY", flag: "https://flagcdn.com/w40/gy.png", phoneCode: "+592", currency: "GYD" },
    { name: "Haiti", code: "HT", flag: "https://flagcdn.com/w40/ht.png", phoneCode: "+509", currency: "HTG" },
    { name: "Honduras", code: "HN", flag: "https://flagcdn.com/w40/hn.png", phoneCode: "+504", currency: "HNL" },
    { name: "Hong Kong", code: "HK", flag: "https://flagcdn.com/w40/hk.png", phoneCode: "+852", currency: "HKD" },
    { name: "Hungary", code: "HU", flag: "https://flagcdn.com/w40/hu.png", phoneCode: "+36", currency: "HUF" },
    { name: "Iceland", code: "IS", flag: "https://flagcdn.com/w40/is.png", phoneCode: "+354", currency: "ISK" },
    { name: "India", code: "IN", flag: "https://flagcdn.com/w40/in.png", phoneCode: "+91", currency: "INR" },
    { name: "Indonesia", code: "ID", flag: "https://flagcdn.com/w40/id.png", phoneCode: "+62", currency: "IDR" },
    { name: "Iran", code: "IR", flag: "https://flagcdn.com/w40/ir.png", phoneCode: "+98", currency: "IRR" },
    { name: "Iraq", code: "IQ", flag: "https://flagcdn.com/w40/iq.png", phoneCode: "+964", currency: "IQD" },
    { name: "Ireland", code: "IE", flag: "https://flagcdn.com/w40/ie.png", phoneCode: "+353", currency: "EUR" },
    { name: "Israel", code: "IL", flag: "https://flagcdn.com/w40/il.png", phoneCode: "+972", currency: "ILS" },
    { name: "Italy", code: "IT", flag: "https://flagcdn.com/w40/it.png", phoneCode: "+39", currency: "EUR" },
    { name: "Jamaica", code: "JM", flag: "https://flagcdn.com/w40/jm.png", phoneCode: "+1-876", currency: "JMD" },
    { name: "Japan", code: "JP", flag: "https://flagcdn.com/w40/jp.png", phoneCode: "+81", currency: "JPY" },
    { name: "Jordan", code: "JO", flag: "https://flagcdn.com/w40/jo.png", phoneCode: "+962", currency: "JOD" },
    { name: "Kazakhstan", code: "KZ", flag: "https://flagcdn.com/w40/kz.png", phoneCode: "+7", currency: "KZT" },
    { name: "Kenya", code: "KE", flag: "https://flagcdn.com/w40/ke.png", phoneCode: "+254", currency: "KES" },
    { name: "Kuwait", code: "KW", flag: "https://flagcdn.com/w40/kw.png", phoneCode: "+965", currency: "KWD" },
    { name: "Kyrgyzstan", code: "KG", flag: "https://flagcdn.com/w40/kg.png", phoneCode: "+996", currency: "KGS" },
    { name: "Laos", code: "LA", flag: "https://flagcdn.com/w40/la.png", phoneCode: "+856", currency: "LAK" },
    { name: "Latvia", code: "LV", flag: "https://flagcdn.com/w40/lv.png", phoneCode: "+371", currency: "EUR" },
    { name: "Lebanon", code: "LB", flag: "https://flagcdn.com/w40/lb.png", phoneCode: "+961", currency: "LBP" },
    { name: "Lesotho", code: "LS", flag: "https://flagcdn.com/w40/ls.png", phoneCode: "+266", currency: "LSL" },
    { name: "Liberia", code: "LR", flag: "https://flagcdn.com/w40/lr.png", phoneCode: "+231", currency: "LRD" },
    { name: "Libya", code: "LY", flag: "https://flagcdn.com/w40/ly.png", phoneCode: "+218", currency: "LYD" },
    { name: "Liechtenstein", code: "LI", flag: "https://flagcdn.com/w40/li.png", phoneCode: "+423", currency: "CHF" },
    { name: "Lithuania", code: "LT", flag: "https://flagcdn.com/w40/lt.png", phoneCode: "+370", currency: "EUR" },
    { name: "Luxembourg", code: "LU", flag: "https://flagcdn.com/w40/lu.png", phoneCode: "+352", currency: "EUR" },
    { name: "Macau", code: "MO", flag: "https://flagcdn.com/w40/mo.png", phoneCode: "+853", currency: "MOP" },
    { name: "Macedonia", code: "MK", flag: "https://flagcdn.com/w40/mk.png", phoneCode: "+389", currency: "MKD" },
    { name: "Madagascar", code: "MG", flag: "https://flagcdn.com/w40/mg.png", phoneCode: "+261", currency: "MGA" },
    { name: "Malawi", code: "MW", flag: "https://flagcdn.com/w40/mw.png", phoneCode: "+265", currency: "MWK" },
    { name: "Malaysia", code: "MY", flag: "https://flagcdn.com/w40/my.png", phoneCode: "+60", currency: "MYR" },
    { name: "Maldives", code: "MV", flag: "https://flagcdn.com/w40/mv.png", phoneCode: "+960", currency: "MVR" },
    { name: "Mali", code: "ML", flag: "https://flagcdn.com/w40/ml.png", phoneCode: "+223", currency: "XOF" },
    { name: "Malta", code: "MT", flag: "https://flagcdn.com/w40/mt.png", phoneCode: "+356", currency: "EUR" },
    { name: "Mexico", code: "MX", flag: "https://flagcdn.com/w40/mx.png", phoneCode: "+52", currency: "MXN" },
    { name: "Moldova", code: "MD", flag: "https://flagcdn.com/w40/md.png", phoneCode: "+373", currency: "MDL" },
    { name: "Monaco", code: "MC", flag: "https://flagcdn.com/w40/mc.png", phoneCode: "+377", currency: "EUR" },
    { name: "Mongolia", code: "MN", flag: "https://flagcdn.com/w40/mn.png", phoneCode: "+976", currency: "MNT" },
    { name: "Montenegro", code: "ME", flag: "https://flagcdn.com/w40/me.png", phoneCode: "+382", currency: "EUR" },
    { name: "Morocco", code: "MA", flag: "https://flagcdn.com/w40/ma.png", phoneCode: "+212", currency: "MAD" },
    { name: "Mozambique", code: "MZ", flag: "https://flagcdn.com/w40/mz.png", phoneCode: "+258", currency: "MZN" },
    { name: "Myanmar", code: "MM", flag: "https://flagcdn.com/w40/mm.png", phoneCode: "+95", currency: "MMK" },
    { name: "Namibia", code: "NA", flag: "https://flagcdn.com/w40/na.png", phoneCode: "+264", currency: "NAD" },
    { name: "Nepal", code: "NP", flag: "https://flagcdn.com/w40/np.png", phoneCode: "+977", currency: "NPR" },
    { name: "Netherlands", code: "NL", flag: "https://flagcdn.com/w40/nl.png", phoneCode: "+31", currency: "EUR" },
    { name: "New Zealand", code: "NZ", flag: "https://flagcdn.com/w40/nz.png", phoneCode: "+64", currency: "NZD" },
    { name: "Nicaragua", code: "NI", flag: "https://flagcdn.com/w40/ni.png", phoneCode: "+505", currency: "NIO" },
    { name: "Niger", code: "NE", flag: "https://flagcdn.com/w40/ne.png", phoneCode: "+227", currency: "XOF" },
    { name: "Nigeria", code: "NG", flag: "https://flagcdn.com/w40/ng.png", phoneCode: "+234", currency: "NGN" },
    { name: "North Korea", code: "KP", flag: "https://flagcdn.com/w40/kp.png", phoneCode: "+850", currency: "KPW" },
    { name: "Norway", code: "NO", flag: "https://flagcdn.com/w40/no.png", phoneCode: "+47", currency: "NOK" },
    { name: "Oman", code: "OM", flag: "https://flagcdn.com/w40/om.png", phoneCode: "+968", currency: "OMR" },
    { name: "Pakistan", code: "PK", flag: "https://flagcdn.com/w40/pk.png", phoneCode: "+92", currency: "PKR" },
    { name: "Palestine", code: "PS", flag: "https://flagcdn.com/w40/ps.png", phoneCode: "+970", currency: "ILS" },
    { name: "Panama", code: "PA", flag: "https://flagcdn.com/w40/pa.png", phoneCode: "+507", currency: "PAB" },
    { name: "Papua New Guinea", code: "PG", flag: "https://flagcdn.com/w40/pg.png", phoneCode: "+675", currency: "PGK" },
    { name: "Paraguay", code: "PY", flag: "https://flagcdn.com/w40/py.png", phoneCode: "+595", currency: "PYG" },
    { name: "Peru", code: "PE", flag: "https://flagcdn.com/w40/pe.png", phoneCode: "+51", currency: "PEN" },
    { name: "Philippines", code: "PH", flag: "https://flagcdn.com/w40/ph.png", phoneCode: "+63", currency: "PHP" },
    { name: "Poland", code: "PL", flag: "https://flagcdn.com/w40/pl.png", phoneCode: "+48", currency: "PLN" },
    { name: "Portugal", code: "PT", flag: "https://flagcdn.com/w40/pt.png", phoneCode: "+351", currency: "EUR" },
    { name: "Qatar", code: "QA", flag: "https://flagcdn.com/w40/qa.png", phoneCode: "+974", currency: "QAR" },
    { name: "Romania", code: "RO", flag: "https://flagcdn.com/w40/ro.png", phoneCode: "+40", currency: "RON" },
    { name: "Russia", code: "RU", flag: "https://flagcdn.com/w40/ru.png", phoneCode: "+7", currency: "RUB" },
    { name: "Rwanda", code: "RW", flag: "https://flagcdn.com/w40/rw.png", phoneCode: "+250", currency: "RWF" },
    { name: "Saudi Arabia", code: "SA", flag: "https://flagcdn.com/w40/sa.png", phoneCode: "+966", currency: "SAR" },
    { name: "Senegal", code: "SN", flag: "https://flagcdn.com/w40/sn.png", phoneCode: "+221", currency: "XOF" },
    { name: "Serbia", code: "RS", flag: "https://flagcdn.com/w40/rs.png", phoneCode: "+381", currency: "RSD" },
    { name: "Singapore", code: "SG", flag: "https://flagcdn.com/w40/sg.png", phoneCode: "+65", currency: "SGD" },
    { name: "Slovakia", code: "SK", flag: "https://flagcdn.com/w40/sk.png", phoneCode: "+421", currency: "EUR" },
    { name: "Slovenia", code: "SI", flag: "https://flagcdn.com/w40/si.png", phoneCode: "+386", currency: "EUR" },
    { name: "Somalia", code: "SO", flag: "https://flagcdn.com/w40/so.png", phoneCode: "+252", currency: "SOS" },
    { name: "South Africa", code: "ZA", flag: "https://flagcdn.com/w40/za.png", phoneCode: "+27", currency: "ZAR" },
    { name: "South Korea", code: "KR", flag: "https://flagcdn.com/w40/kr.png", phoneCode: "+82", currency: "KRW" },
    { name: "Spain", code: "ES", flag: "https://flagcdn.com/w40/es.png", phoneCode: "+34", currency: "EUR" },
    { name: "Sri Lanka", code: "LK", flag: "https://flagcdn.com/w40/lk.png", phoneCode: "+94", currency: "LKR" },
    { name: "Sudan", code: "SD", flag: "https://flagcdn.com/w40/sd.png", phoneCode: "+249", currency: "SDG" },
    { name: "Sweden", code: "SE", flag: "https://flagcdn.com/w40/se.png", phoneCode: "+46", currency: "SEK" },
    { name: "Switzerland", code: "CH", flag: "https://flagcdn.com/w40/ch.png", phoneCode: "+41", currency: "CHF" },
    { name: "Syria", code: "SY", flag: "https://flagcdn.com/w40/sy.png", phoneCode: "+963", currency: "SYP" },
    { name: "Taiwan", code: "TW", flag: "https://flagcdn.com/w40/tw.png", phoneCode: "+886", currency: "TWD" },
    { name: "Tajikistan", code: "TJ", flag: "https://flagcdn.com/w40/tj.png", phoneCode: "+992", currency: "TJS" },
    { name: "Tanzania", code: "TZ", flag: "https://flagcdn.com/w40/tz.png", phoneCode: "+255", currency: "TZS" },
    { name: "Thailand", code: "TH", flag: "https://flagcdn.com/w40/th.png", phoneCode: "+66", currency: "THB" },
    { name: "Tunisia", code: "TN", flag: "https://flagcdn.com/w40/tn.png", phoneCode: "+216", currency: "TND" },
    { name: "Turkey", code: "TR", flag: "https://flagcdn.com/w40/tr.png", phoneCode: "+90", currency: "TRY" },
    { name: "Turkmenistan", code: "TM", flag: "https://flagcdn.com/w40/tm.png", phoneCode: "+993", currency: "TMT" },
    { name: "Uganda", code: "UG", flag: "https://flagcdn.com/w40/ug.png", phoneCode: "+256", currency: "UGX" },
    { name: "Ukraine", code: "UA", flag: "https://flagcdn.com/w40/ua.png", phoneCode: "+380", currency: "UAH" },
    { name: "United Arab Emirates", code: "AE", flag: "https://flagcdn.com/w40/ae.png", phoneCode: "+971", currency: "AED" },
    { name: "United Kingdom", code: "UK", flag: "https://flagcdn.com/w40/gb.png", phoneCode: "+44", currency: "GBP" },
    { name: "United States of America", code: "US", flag: "https://flagcdn.com/w40/us.png", phoneCode: "+1", currency: "USD" },
    { name: "Uruguay", code: "UY", flag: "https://flagcdn.com/w40/uy.png", phoneCode: "+598", currency: "UYU" },
    { name: "Uzbekistan", code: "UZ", flag: "https://flagcdn.com/w40/uz.png", phoneCode: "+998", currency: "UZS" },
    { name: "Venezuela", code: "VE", flag: "https://flagcdn.com/w40/ve.png", phoneCode: "+58", currency: "VES" },
    { name: "Vietnam", code: "VN", flag: "https://flagcdn.com/w40/vn.png", phoneCode: "+84", currency: "VND" },
    { name: "Yemen", code: "YE", flag: "https://flagcdn.com/w40/ye.png", phoneCode: "+967", currency: "YER" },
    { name: "Zambia", code: "ZM", flag: "https://flagcdn.com/w40/zm.png", phoneCode: "+260", currency: "ZMW" },
    { name: "Zimbabwe", code: "ZW", flag: "https://flagcdn.com/w40/zw.png", phoneCode: "+263", currency: "ZWL" },
]

export const LISTINGS = [
    {
        id: 1,
        title: "Modern Loft in Downtown",
        location: "New York, United States of America",
        price: 150,
        rating: 4.8,
        reviews: 128,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop",
        category: "Luxury",
        type: "Entire Loft",
        area: "1200 sq ft",
        hostName: "Sarah Jenkins",
        hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop",
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
        images: [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1505693416388-b0346efee535?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=2076&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?q=80&w=2071&auto=format&fit=crop",
        ],
        purpose: "Working Professional",
        badges: ["Near Metro", "Indian Roommates"],
        communityFeatures: ["Vegetarian Friendly", "Quiet Area"]
    },
    {
        id: 2,
        title: "Cozy Mountain Cabin",
        location: "Aspen, United States of America",
        price: 250,
        rating: 4.9,
        reviews: 85,
        image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1965&auto=format&fit=crop",
        category: "Family",
        type: "Entire Cabin",
        area: "1500 sq ft",
        hostName: "Michael Chen",
        hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
        images: [
            "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1965&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1449156493391-d2cfa28e468b?q=80&w=2074&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop",
        ],
        purpose: "Family",
        badges: ["Family Friendly", "Safe Area"],
        communityFeatures: ["Near Park", "Indian Grocery Nearby"]
    },
    {
        id: 3,
        title: "Beachfront Villa",
        location: "Bali, Indonesia",
        price: 350,
        rating: 4.95,
        reviews: 210,
        image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop",
        category: "Luxury",
        type: "Entire Villa",
        area: "3000 sq ft",
        hostName: "Ayu Kartini",
        hostAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop",
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
        images: [
            "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1974&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop",
        ],
        purpose: "Traveller",
        badges: ["Ocean View", "Private Pool"],
        communityFeatures: ["Tourist Friendly"]
    },
    {
        id: 4,
        title: "Historic Canal House",
        location: "Amsterdam, Netherlands",
        price: 180,
        rating: 4.7,
        reviews: 92,
        image: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=2084&auto=format&fit=crop",
        category: "Traveller",
        type: "Entire House",
        area: "900 sq ft",
        hostName: "Lars Van Der Berg",
        hostAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop",
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
        images: [
            "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=2084&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1585543805890-6051f7829f98?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?q=80&w=1974&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1522771753035-1a5b6562f3ba?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=2070&auto=format&fit=crop",
        ],
        purpose: "Traveller",
        badges: ["Central Location", "Historic"],
        communityFeatures: ["Near Public Transport"]
    },
    {
        id: 5,
        title: "Minimalist Studio",
        location: "Tokyo, Japan",
        price: 120,
        rating: 4.6,
        reviews: 156,
        image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070&auto=format&fit=crop",
        category: "Business",
        type: "Studio Apartment",
        area: "400 sq ft",
        hostName: "Kenji Tanaka",
        hostAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop",
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
        images: [
            "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1593696140826-c58b0958b8ba?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?q=80&w=2071&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=2076&auto=format&fit=crop",
        ],
        purpose: "Student",
        badges: ["Students", "Budget Friendly"],
        communityFeatures: ["Near University", "Quiet Area"]
    },
    {
        id: 6,
        title: "Secluded Treehouse",
        location: "Costa Rica",
        price: 200,
        rating: 4.9,
        reviews: 340,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop",
        category: "Backpacker",
        type: "Treehouse",
        area: "600 sq ft",
        hostName: "Elena Rodriguez",
        hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
        images: [
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1974&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=1974&auto=format&fit=crop",
        ],
        purpose: "Traveller",
        badges: ["Nature", "Unique Stay"],
        communityFeatures: ["Eco Friendly"]
    },
    {
        id: 7,
        title: "Luxury Penthouse",
        location: "Dubai, UAE",
        price: 500,
        rating: 5.0,
        reviews: 50,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
        category: "Luxury",
        type: "Penthouse",
        area: "4500 sq ft",
        hostName: "Omar Al-Fayed",
        hostAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop",
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
        images: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?q=80&w=2073&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?q=80&w=2071&auto=format&fit=crop",
        ],
        purpose: "Business",
        badges: ["Premium", "City Views"],
        communityFeatures: ["Near Business District", "Indian Community Nearby"]
    },
    {
        id: 8,
        title: "Charming Cottage",
        location: "Cotswolds, UK",
        price: 160,
        rating: 4.8,
        reviews: 112,
        image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=2074&auto=format&fit=crop",
        category: "Family",
        type: "Entire Cottage",
        area: "1100 sq ft",
        hostName: "Eleanor Rigby",
        hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop",
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
        images: [
            "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=2074&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1974&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=1974&auto=format&fit=crop",
        ],
        purpose: "Family",
        badges: ["Countryside", "Peaceful"],
        communityFeatures: ["Family Friendly"]
    },
]



export const EVENTS = {
    popular: [
        {
            id: 1,
            title: "Diwali Night 2025",
            date: "Nov 12",
            location: "City Square",
            price: "Free Entry",
            image: "https://images.unsplash.com/photo-1576487248805-cf45f6bcc67f?q=80&w=2070&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "New Student Arrival Meetup",
            date: "Aug 25",
            location: "University Hall",
            price: "Free",
            image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "Bollywood Music Festival",
            date: "Dec 15",
            location: "Grand Arena",
            price: "From $50",
            image: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1974&auto=format&fit=crop"
        },
        {
            id: 4,
            title: "Indian Food Carnival",
            date: "Sep 10",
            location: "Riverfront Park",
            price: "$10 Entry",
            image: "https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=2088&auto=format&fit=crop"
        }
    ],
    restaurants: [
        {
            id: 5,
            title: "Spice Route",
            type: "North Indian",
            rating: 4.9,
            price: "$$$",
            image: "https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=2070&auto=format&fit=crop"
        },
        {
            id: 6,
            title: "Dosa Plaza",
            type: "South Indian",
            rating: 4.8,
            price: "$$",
            image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=2070&auto=format&fit=crop"
        },
        {
            id: 7,
            title: "Chaat Corner",
            type: "Street Food",
            rating: 4.7,
            price: "$",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2070&auto=format&fit=crop"
        },
        {
            id: 8,
            title: "Biryani House",
            type: "Hyderabadi",
            rating: 4.6,
            price: "$$",
            image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=2070&auto=format&fit=crop"
        }
    ],
    streetFood: [
        {
            id: 9,
            title: "Desi Night Market",
            location: "Little India",
            open: "6 PM - 12 AM",
            image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop"
        },
        {
            id: 10,
            title: "Momo Station",
            location: "Downtown Corner",
            open: "11 AM - 9 PM",
            image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?q=80&w=2070&auto=format&fit=crop"
        },
        {
            id: 11,
            title: "Chai Point",
            location: "University Ave",
            open: "7 AM - 10 PM",
            image: "https://images.unsplash.com/photo-1576398289164-c4816db6e74e?q=80&w=2070&auto=format&fit=crop"
        },
        {
            id: 12,
            title: "Sweet Treats",
            location: "Market Street",
            open: "10 AM - 8 PM",
            image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=2157&auto=format&fit=crop"
        }
    ]
}

export const TESTIMONIALS = [
    {
        id: 1,
        name: "Sarah Jenkins",
        role: "Senior Engineer",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop",
        quote: "The autonomy and trust here is unlike anywhere else. I get to solve complex problems every day.",
        video: "https://www.w3schools.com/html/mov_bbb.mp4"
    },
    {
        id: 2,
        name: "Michael Chen",
        role: "Product Manager",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
        quote: "Seeing our work directly impact the lives of travelers and hosts is incredibly rewarding.",
        video: "https://www.w3schools.com/html/mov_bbb.mp4"
    },
    {
        id: 3,
        name: "Elena Rodriguez",
        role: "Designer",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
        quote: "We're not just building a product; we're crafting an experience. Design has a seat at the table.",
        video: "https://www.w3schools.com/html/mov_bbb.mp4"
    }
]

export const FAQS = [
    {
        question: "What is the interview process like?",
        answer: "Our process typically involves an initial recruiter screen, a hiring manager interview, a technical or practical assessment, and a final culture fit round. We aim to complete the process within 2-3 weeks."
    },
    {
        question: "Do you offer remote work?",
        answer: "Yes! We are a remote-first company. You can work from anywhere in the world, as long as you have a reliable internet connection and can overlap with your team's core hours."
    },
    {
        question: "What benefits do you offer?",
        answer: "We offer comprehensive health insurance, a generous wellness stipend, an annual learning budget, unlimited PTO, and equity in the company."
    },
    {
        question: "How do you support career growth?",
        answer: "We have a structured career ladder, regular performance reviews, and a mentorship program. We also provide a budget for conferences and courses."
    }
]

export const JOBS = [
    {
        id: 1,
        title: "Senior Frontend Engineer",
        location: "Remote (US)",
        type: "Full-time",
        department: "Engineering",
        description: "We are looking for an experienced Frontend Engineer to lead our web platform development.",
        postedAt: "2025-12-01",
        salary: "$140k - $180k",
        applicants: 45,
        tags: ["React", "Next.js", "Tailwind"],
        experienceLevel: "Senior",
        responsibilities: [
            "Architect and build scalable frontend applications",
            "Mentor junior developers and conduct code reviews",
            "Collaborate with design and product teams"
        ],
        skills: ["React", "TypeScript", "Performance Optimization"],
        benefits: ["Health Insurance", "Stock Options", "Remote Work"]
    },
    {
        id: 2,
        title: "Product Designer",
        location: "New York, NY",
        type: "Full-time",
        department: "Design",
        description: "Join our design team to craft beautiful and intuitive experiences for our users.",
        postedAt: "2025-11-28",
        salary: "$110k - $150k",
        applicants: 32,
        tags: ["Figma", "UI/UX", "Prototyping"],
        experienceLevel: "Mid-Level",
        responsibilities: [
            "Create user flows, wireframes, and high-fidelity prototypes",
            "Conduct user research and usability testing",
            "Maintain and evolve our design system"
        ],
        skills: ["Figma", "Prototyping", "User Research"],
        benefits: ["Wellness Stipend", "Learning Budget", "Flexible Hours"]
    },
    {
        id: 3,
        title: "Customer Success Manager",
        location: "San Francisco, CA",
        type: "Full-time",
        department: "Operations",
        description: "Help our hosts and guests have the best possible experience on Haven.",
        postedAt: "2025-11-25",
        salary: "$80k - $110k",
        applicants: 128,
        tags: ["Support", "Communication", "CRM"],
        experienceLevel: "Mid-Level",
        responsibilities: [
            "Onboard new hosts and ensure their success",
            "Resolve complex customer issues",
            "Gather feedback to improve our product"
        ],
        skills: ["Communication", "Problem Solving", "CRM Tools"],
        benefits: ["Health Insurance", "Team Retreats", "Commuter Benefits"]
    },
    {
        id: 4,
        title: "Marketing Specialist",
        location: "Remote (US)",
        type: "Contract",
        department: "Marketing",
        description: "Drive growth and brand awareness through creative marketing campaigns.",
        postedAt: "2025-12-02",
        salary: "$60k - $90k",
        applicants: 18,
        tags: ["Social Media", "SEO", "Content"],
        experienceLevel: "Junior",
        responsibilities: [
            "Manage social media channels",
            "Create engaging content for our blog and newsletter",
            "Assist with SEO optimization"
        ],
        skills: ["Social Media Marketing", "Copywriting", "SEO"],
        benefits: ["Flexible Schedule", "Remote Work", "Networking"]
    },
    {
        id: 5,
        title: "Backend Developer",
        location: "Remote (EU)",
        type: "Full-time",
        department: "Engineering",
        description: "Build scalable APIs and services to power our global platform.",
        postedAt: "2025-12-03",
        salary: "$130k - $170k",
        applicants: 12,
        tags: ["Node.js", "PostgreSQL", "Redis"],
        experienceLevel: "Mid-Level",
        responsibilities: [
            "Design and implement RESTful APIs",
            "Optimize database performance",
            "Ensure system reliability and security"
        ],
        skills: ["Node.js", "SQL", "System Design"],
        benefits: ["Health Insurance", "Stock Options", "Learning Budget"]
    }
]

export const GROUPS = {
    countries: [
        { id: 1, name: "Indians in USA", flag: "🇺🇸", members: "45k" },
        { id: 2, name: "Indians in Canada", flag: "🇨🇦", members: "32k" },
        { id: 3, name: "Indians in UK", flag: "🇬🇧", members: "28k" },
        { id: 4, name: "Indians in Australia", flag: "🇦🇺", members: "18k" },
        { id: 5, name: "Indians in Germany", flag: "🇩🇪", members: "12k" },
    ],
    cities: [
        {
            id: 1,
            title: "Indians in Dallas",
            description: "Connect with the vibrant Indian community in Dallas-Fort Worth.",
            image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071&auto=format&fit=crop",
            members: "12.5k"
        },
        {
            id: 2,
            title: "Telugu in London",
            description: "A community for Telugu speakers living in London.",
            image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop",
            members: "8.2k"
        },
        {
            id: 3,
            title: "Malayalis in Toronto",
            description: "Welcome to the Malayali community in Greater Toronto Area.",
            image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?q=80&w=1965&auto=format&fit=crop",
            members: "9.1k"
        },
        {
            id: 4,
            title: "Students in Berlin",
            description: "Support group for Indian students in Berlin.",
            image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=2070&auto=format&fit=crop",
            members: "5.4k"
        }
    ],
    purpose: [
        { id: 1, title: "Accommodation Help", icon: Home, members: "45k", description: "Find rooms, flatmates, and housing tips." },
        { id: 2, title: "Jobs & Careers", icon: Briefcase, members: "32k", description: "Job postings, career advice, and networking." },
        { id: 3, title: "Visa & Immigration", icon: Plane, members: "28k", description: "Visa help, immigration news, and support." },
        { id: 4, title: "Buy & Sell", icon: ShoppingBag, members: "18k", description: "Marketplace for furniture, books, and more." },
        { id: 5, title: "Women-Only", icon: Heart, members: "12k", description: "Safe space for women to connect and share." },
        { id: 6, title: "Travel & Exploration", icon: Map, members: "25k", description: "Travel buddies, trip planning, and tips." },
    ],
    trending: [
        {
            id: 1,
            name: "Tech Workers in Bay Area",
            image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop",
            activePosts: 156
        },
        {
            id: 2,
            name: "Newcomers in Dubai",
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
            activePosts: 92
        },
        {
            id: 3,
            name: "Indian Students in Melbourne",
            image: "https://images.unsplash.com/photo-1514395465013-2dc0bebb3639?q=80&w=2070&auto=format&fit=crop",
            activePosts: 230
        }
    ],
    recommended: [
        {
            id: 1,
            title: "Based on your destination",
            groupName: "New Arrivals in New Jersey",
            members: "3.5k"
        },
        {
            id: 2,
            title: "For students like you",
            groupName: "MS Students Fall 2025",
            members: "10.2k"
        }
    ]
}

export const GROUP_FEED = [
    {
        id: 1,
        author: "Sarah Jenkins",
        avatar: "SJ",
        time: "2 hours ago",
        content: "Hey everyone! I just moved to Sydney and I'm looking for recommendations for good coffee spots in Surry Hills. Any tips?",
        likes: 24,
        comments: 5
    },
    {
        id: 2,
        author: "Raj Patel",
        avatar: "RP",
        time: "5 hours ago",
        content: "Does anyone know the process for extending a student visa? I'm a bit confused about the new requirements.",
        likes: 45,
        comments: 12
    },
    {
        id: 3,
        author: "Maria Garcia",
        avatar: "MG",
        time: "1 day ago",
        content: "Just wanted to share that there's a networking event for tech workers this Friday at the CBD. Who's going?",
        likes: 89,
        comments: 34
    }
]


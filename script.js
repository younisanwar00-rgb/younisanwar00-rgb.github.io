const quranAyahs = [
    { ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", ku: "بێگومان لەگەڵ هەموو ناڕەحەتییەکدا ئاسودەیی و سانایی هەیه." },
    { ar: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", ku: "داوای یارمه‌تی بكه‌ن (له‌ خودا) به‌ هۆی ئارامگرتن و نوێژه‌وه." },
    { ar: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", ku: "ئاگادار بن هه‌ر به‌ یادی خودا دڵه‌كان ئارام ده‌بێت." }
];

const hadiths = [
    "پێغەمبەر ﷺ: باشترینتان ئەو کەسەیە کە قورئان فێر دەبێت و فێری خەڵکی دەکات.",
    "پێغەمبەر ﷺ: خۆشەویستترین کردەوە لای خودا، نوێژە لە کاتی خۆیدا.",
    "پێغەمبەر ﷺ: پاکوخاوێنی نیوەی ئیمانە."
];

const azkar = [
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", "لَا إِلَهَ إِلَّا اللَّهُ", "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ", 
    "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ"
];

const asma = [
    "اللَّهُ", "الرَّحْمَنُ", "الرَّحِيمُ", "الْمَلِكُ", "الْقُدُّوسُ", "السَّلَامُ", 
    "الْمُؤْمِنُ", "الْمُهَيْمِنُ", "الْعَزِيزُ", "الْجَبَّارُ", "الْمُتَكَبِّرُ", "الْخَالِقُ"
];

const daysOfWeekKurdish = ["یەکشەممە", "دووشەممە", "سێشەممە", "چوارشەممە", "پێنجشەممە", "هەینی", "شەممە"];

let qIdx = 0, hIdx = 0, zIdx = 0, aIdx = 0;
let lastCheckedDay = -1; // گۆڕاوێکی نوێ بۆ چاودێریکردنی گۆڕینی کاتی لاپتۆپ

// خشتەی کاتەکانی بانگ (داتاکانی خۆت لێرە دابنێوە)
const prayerData = {
    4: { 23:["3:53","5:15","12:03","3:40","6:46","8:02"], 24:["3:52","5:14","12:02","3:40","6:47","8:03"], 30:["3:45","5:07","12:01","3:41","6:52","8:08"] },
    5: { 1:["3:44","5:06","12:01","3:41","6:53","8:09"] } 
};

async function fetchWeather() {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=36.25&longitude=44.88&current_weather=true`);
        const data = await response.json();
        document.getElementById('temp').innerText = Math.round(data.current_weather.temperature) + "°C";
    } catch (error) {
        document.getElementById('temp').innerText = "--°C";
    }
}

function getRanyaTimeData(timeStr, isPM) {
    if(!timeStr) return null;
    let [h, m] = timeStr.split(':').map(Number);
    let internalH = h;
    if (isPM && h >= 1 && h <= 11) internalH += 12;
    if (!isPM && h === 12) internalH = 0;
    
    let d = new Date();
    d.setHours(internalH, m + 3, 0, 0); 
    
    let displayH = d.getHours() % 12; if (displayH === 0) displayH = 12;
    let displayM = d.getMinutes().toString().padStart(2, '0');
    return { dateObj: d, display: `${displayH}:${displayM}` };
}

function setTodayPrayerTimes() {
    const today = new Date();
    const m = today.getMonth() + 1; const d = today.getDate(); 
    const dayData = prayerData[m] ? prayerData[m][d] : null; 

    if(dayData) {
        const timesObj = {
            p1: { data: getRanyaTimeData(dayData[0], false), element: "time-fajr" },
            p2: { data: getRanyaTimeData(dayData[1], false), element: "time-sunrise" },
            p3: { data: getRanyaTimeData(dayData[2], true),  element: "time-dhuhr" },
            p4: { data: getRanyaTimeData(dayData[3], true),  element: "time-asr" },
            p5: { data: getRanyaTimeData(dayData[4], true),  element: "time-maghrib" },
            p6: { data: getRanyaTimeData(dayData[5], true),  element: "time-isha" }
        };

        for (let key in timesObj) {
            let tData = timesObj[key].data;
            if(tData) {
                document.getElementById(key).setAttribute('data-internal-time', tData.dateObj.getTime());
                document.getElementById(timesObj[key].element).innerText = tData.display;
            }
        }
    }
}

// فەنکشنی دروستکردنی بەرواری کوردی
function getKurdishDate() {
    const today = new Date();
    const faDate = new Intl.DateTimeFormat('fa-IR-u-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(today);
    const parts = faDate.split('/');
    if (parts.length !== 3) return "";
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    const kurdishMonths = ['خاکەلێوە', 'بانەمەڕ', 'جۆزەردان', 'پووشپەڕ', 'گەلاوێژ', 'خەرمانان', 'ڕەزبەر', 'خەزەڵوەر', 'سەرماوەز', 'بەفرانبار', 'ڕێبەندان', 'ڕەشەمە'];
    const kurdishYear = year + 1321; 
    return `${day}ی ${kurdishMonths[month - 1]}ی ${kurdishYear}`;
}

function updateDates() {
    const today = new Date();
    document.getElementById("day-of-week").innerText = daysOfWeekKurdish[today.getDay()];
    const hijri = new Intl.DateTimeFormat('ar-TN-u-ca-islamic', {day: 'numeric', month: 'long', year: 'numeric'}).format(today);
    document.getElementById("hijri").innerText = hijri;
    document.getElementById('date-gregorian').textContent = today.toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'});
    
    // دانانی بەرواری کوردی
    document.getElementById('date-kurdish').textContent = getKurdishDate();

    if(today.getDay() === 5) document.getElementById('friday-banner').classList.add('active');
    else document.getElementById('friday-banner').classList.remove('active');
}

function updateUI() {
    const now = new Date();
    
    // زیرەککردنی سیستەمەکە بۆ تاقیکردنەوە (خۆی ڕیفرێش دەکات ئەگەر ڕۆژ گۆڕدرا)
    if (now.getDate() !== lastCheckedDay) {
        setTodayPrayerTimes();
        updateDates();
        lastCheckedDay = now.getDate();
    }
    
    let clockH = now.getHours() % 12; if(clockH === 0) clockH = 12;
    let clockM = now.getMinutes().toString().padStart(2, '0');
    let clockS = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('clock').textContent = `${clockH}:${clockM}`;
    document.getElementById('seconds-display').textContent = `:${clockS}`;

    const cards = Array.from(document.querySelectorAll('.prayer-card'));
    cards.forEach(c => c.classList.remove('active'));

    let activeCard = null; 
    let currentCard = null; 

    for (let i = 0; i < cards.length; i++) {
        let pTime = new Date(parseInt(cards[i].getAttribute('data-internal-time')));
        if (now < pTime) {
            activeCard = cards[i];
            currentCard = (i > 0) ? cards[i-1] : cards[cards.length - 1];
            break;
        }
    }

    if (!activeCard) {
        activeCard = cards[0];
        currentCard = cards[cards.length - 1];
    }

    let cTime = new Date(parseInt(currentCard.getAttribute('data-internal-time')));
    if (activeCard === cards[0] && cTime > now) {
        cTime.setDate(cTime.getDate() - 1);
    }

    let cWait = parseInt(currentCard.getAttribute('data-wait'));
    let cIqamah = new Date(cTime.getTime() + cWait * 60000);
    let cName = currentCard.getAttribute('data-name');

    let isIqamahWait = false;
    let showPostAzkar = false;
    let iqamahSeconds = 0;

    if (cWait > 0) {
        if (now >= cTime && now < cIqamah) {
            isIqamahWait = true;
            iqamahSeconds = Math.floor((cIqamah - now) / 1000);
            currentCard.classList.add('active');
        } else if (now >= cIqamah && now < new Date(cIqamah.getTime() + 5 * 60000)) {
            activeCard.classList.add('active');
        } else if (now >= new Date(cIqamah.getTime() + 5 * 60000) && now < new Date(cIqamah.getTime() + 15 * 60000)) {
            showPostAzkar = true;
            activeCard.classList.add('active');
        } else {
            activeCard.classList.add('active');
        }
    } else {
        activeCard.classList.add('active');
    }

    let nextPTime = new Date(parseInt(activeCard.getAttribute('data-internal-time')));
    if (now > nextPTime) nextPTime.setDate(nextPTime.getDate() + 1);
    let diffSecMain = Math.floor((nextPTime - now) / 1000);

    if (isIqamahWait) {
        document.getElementById('iqamah-overlay').classList.add('active');
        document.getElementById('iqamah-prayer-name').innerText = cName;
        let m = Math.floor(iqamahSeconds / 60).toString().padStart(2, '0');
        let s = (iqamahSeconds % 60).toString().padStart(2, '0');
        document.getElementById('iqamah-large-timer').innerText = `${m}:${s}`;
        document.getElementById('countdown-box').style.opacity = 0;
    } else {
        document.getElementById('iqamah-overlay').classList.remove('active');
        document.getElementById('countdown-box').style.opacity = 1;
        
        if (diffSecMain >= 0) {
            let h = Math.floor(diffSecMain / 3600).toString().padStart(2, '0');
            let m = Math.floor((diffSecMain % 3600) / 60).toString().padStart(2, '0');
            let s = (diffSecMain % 60).toString().padStart(2, '0');
            document.getElementById('countdown-timer').innerText = `${h}:${m}:${s}`;
            document.getElementById('countdown-label').innerText = "ماوە بۆ بانگی";
            document.getElementById('next-prayer-name').innerText = activeCard.getAttribute('data-name');
        }
    }

    if (showPostAzkar) document.getElementById('post-azkar-overlay').classList.add('active');
    else document.getElementById('post-azkar-overlay').classList.remove('active');

    if (!isIqamahWait && !showPostAzkar && cWait > 0 && now >= cIqamah && now < new Date(cIqamah.getTime() + 5 * 60000)) {
        document.body.classList.add('dim-mode');
    } else {
        document.body.classList.remove('dim-mode');
    }
    
    let secSinceAdhan = Math.floor((now - cTime) / 1000);
    if (secSinceAdhan >= 0 && secSinceAdhan < 120 && cWait > 0) {
        document.body.classList.add('adhan-mode');
    } else {
        document.body.classList.remove('adhan-mode');
    }
}

function rotateContent() {
    const zEl = document.getElementById('zikr-text');
    zEl.style.opacity = 0; setTimeout(() => { zEl.innerText = azkar[zIdx]; zEl.style.opacity = 1; zIdx = (zIdx + 1) % azkar.length; }, 800);

    const hEl = document.getElementById('hadith-content');
    hEl.style.opacity = 0; setTimeout(() => { document.getElementById('h-text').innerText = hadiths[hIdx]; hEl.style.opacity = 1; hIdx = (hIdx + 1) % hadiths.length; }, 800);

    const asEl = document.getElementById('asma-text');
    asEl.style.opacity = 0; setTimeout(() => { asEl.innerText = asma[aIdx]; asEl.style.opacity = 1; aIdx = (aIdx + 1) % asma.length; }, 800);

    const qContainer = document.getElementById('quran-content');
    qContainer.style.opacity = 0; setTimeout(() => {
        document.getElementById('q-ar').innerText = quranAyahs[qIdx].ar;
        document.getElementById('q-ku').innerText = quranAyahs[qIdx].ku;
        qContainer.style.opacity = 1; qIdx = (qIdx + 1) % quranAyahs.length;
    }, 800);
}

fetchWeather(); 
updateUI(); 
rotateContent();

setInterval(updateUI, 1000);
setInterval(rotateContent, 20000); 
setInterval(fetchWeather, 1800000);
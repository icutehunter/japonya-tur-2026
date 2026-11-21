import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin, Navigation, Compass, Wallet, Lightbulb, Settings,
  Moon, Sun, Check, Plus, Trash2, Edit3, ArrowUp, ArrowDown,
  Camera, Lock, X, Train, Car, Bus, Footprints, Info
} from "lucide-react";

const TOKYO_COORDS = "35.7534716,139.7996485";
const OSAKA_COORDS = "34.6303610,135.4933890";

const LANDMARK_PHOTOS = {
  flight: "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=900&q=80",
  home: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=80",
  food: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
  shinkansen: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=900&q=80",
  osaka_night: "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=900&q=80",
  usj: "https://images.unsplash.com/photo-1624601573012-efb68931cc8f?auto=format&fit=crop&w=900&q=80",
  nara: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=80",
  castle: "https://images.unsplash.com/photo-1590253230532-a67f6bc61c9e?auto=format&fit=crop&w=900&q=80",
  disney: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=900&q=80",
  harry: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?auto=format&fit=crop&w=900&q=80",
  shopping: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80",
  wagyu: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
  shibuya: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=900&q=80",
  drift: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
  flea: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=900&q=80"
};

const VISUAL_KANJI = {
  flight: "空港", home: "宿泊先", food: "グルメ", shinkansen: "新幹線",
  osaka_night: "道頓堀", usj: "USJ大阪", nara: "奈良公園", castle: "歴史・城",
  disney: "ディズニー", harry: "ハリポタ", shopping: "カメラ・買物", wagyu: "A5和牛",
  shibuya: "渋谷スカイ", drift: "東京ドリフト", flea: "蚤の市"
};

const DEFAULT_DATA = {
  exchangeRate: 0.316,
  shoppingBudgetJpy: 0,
  adminPin: "2026",
  groupNotes: [
    { id: 1, author: "Sistem", text: "27 Kasım 10:00 Bic Camera Yurakucho için pasaport asıllarını unutmayalım!", time: "26 Kas" }
  ],
  days: [
    {
      dayNum: 1, date: "26 Kasım 2026, Perşembe", city: "TOKYO",
      fatigue: "Hafif Tempo • Varış & Dinlenme",
      title: "İstanbul → Tokyo Haneda & Adachi Eve Yerleşme",
      subtitle: "Uzun uçuş sonrası minimum aktarmayla eve varış",
      stops: [
        {
          id: "d1_1", time: "19:30", type: "transit", visual: "flight", completed: false,
          title: "Haneda Havalimanı (HND) → Tokyo Evi",
          desc: "02:30 İstanbul uçuşu sonrası akşam varış. Pasaport, eSIM ve Apple Wallet Suica kurulumu.",
          longDesc: "Tokyo Haneda Havalimanı Terminal 3'e iniş yaptıktan sonra Visit Japan Web QR kodlarınızla hızlıca geçiş yapabilirsiniz.",
          highlights: "Terminal 3 geliş katında 7-Eleven ATM'den nakit Yen çekimi, eSIM aktivasyonu ve iPhone Wallet Suica yüklemesi.",
          transportReason: "11 saatlik uçuş yorgunluğu sonrası 4 kişi için kapıdan kapıya Taksi (¥13,200) aktarmalı trene kıyasla yorgunluğu sıfırlar.",
          cost4: 0, distanceSummary: "28.5 km • 40 dk", coords: TOKYO_COORDS,
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: {
            train: { cost4: 2680, note: "28.5 km • 52 dk | Keikyu → Shinagawa → JR Joban (2 aktarma)" },
            taxi: { cost4: 13200, note: "28.5 km • 40 dk | Otoban dahil direkt ev kapısına (4 kişi konforlu)" },
            bus: { cost4: 5200, note: "29 km • 55 dk | Limousine Bus → Kitasenju East Exit" },
            walk: { cost4: 0, note: "28.5 km • ~6 saat (Uygun değil)" }
          }
        },
        {
          id: "d1_2", time: "21:15", type: "transit", visual: "home", completed: false,
          title: "Tokyo Evi Check-in (Adachi)",
          desc: "Senjukotobukichō 19-3 (35.7534716, 139.7996485). Eve yerleşme ve dinlenme.",
          longDesc: "Adachi bölgesindeki eviniz Kita-Senju merkezine sadece 550 metre mesafededir.",
          highlights: "Ev anahtar kutusu/şifresi ile giriş ve yerleşme.",
          transportReason: "Kita-Senju istasyonu ile ev arası düz ve geniş kaldırımlıdır.",
          cost4: 0, distanceSummary: "550 m • 7 dk yürüyüş", coords: TOKYO_COORDS,
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "İstasyon çıkışından yürüme mesafesi" },
            taxi: { cost4: 600, note: "550 m • 2 dk" },
            bus: { cost4: 0, note: "Yürüme mesafesi" },
            walk: { cost4: 0, note: "550 m • 7 dk düz yürüyüş" }
          }
        },
        {
          id: "d1_3", time: "22:00", type: "food", visual: "food", completed: false,
          title: "Kita-Senju Ramen & Gyoza",
          desc: "Ev sokağındaki sıcak Tonkotsu Ramen dükkanlarında ilk Japonya akşam yemeği.",
          longDesc: "Kita-Senju çevresi yerel halkın tercih ettiği otantik ramen ve gyoza dükkanlarıyla ünlüdür.",
          highlights: "Sıcak kemik suyu bazlı ramen ve tavada kızarmış gyoza.",
          transportReason: "Eve sadece 400 metre mesafededir.",
          cost4: 5200, distanceSummary: "400 m • 5 dk yürüyüş", coords: "35.7498,139.8048",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Yürüme mesafesi" },
            taxi: { cost4: 500, note: "400 m • 2 dk" },
            bus: { cost4: 0, note: "Yürüme mesafesi" },
            walk: { cost4: 0, note: "400 m • 5 dk yürüyüş" }
          }
        }
      ]
    },
    {
      dayNum: 2, date: "27 Kasım 2026, Cuma", city: "OSAKA",
      fatigue: "Orta Tempo • Kamera Alışverişi & Shinkansen",
      title: "Bic Camera Yurakucho & Shinkansen ile Osaka",
      subtitle: "Sırt çantalarıyla yolda Bic Camera Yurakucho (10:00) ve hızlı trenle Osaka'ya geçiş",
      stops: [
        {
          id: "d2_1", time: "08:45", type: "food", visual: "food", completed: false,
          title: "Kahvaltı: Tokyo İstasyonu / Yurakucho",
          desc: "Kita-Senju'dan sırt çantalarıyla çıkış, Yurakucho'da kahvaltı ve açılışı bekleme.",
          longDesc: "Sadece sırt çantalarınızla hareket edeceğiniz için doğrudan Yurakucho bölgesine geçebilirsiniz.",
          highlights: "Yurakucho çıkışında taze kahve ve sandviç.",
          transportReason: "Kita-Senju'dan JR Joban/Ueno-Tokyo hattıyla Tokyo İstasyonu'na 22 dakikada ulaşırsınız.",
          cost4: 4400, distanceSummary: "11.5 km • 25 dk tren", coords: "35.6752,139.7634",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 1120, note: "11.5 km • 25 dk | Kita-Senju → Tokyo İst. + 5 dk yürüyüş" },
            taxi: { cost4: 4800, note: "11.5 km • 22 dk | 4 kişi taksi" },
            bus: { cost4: 920, note: "12 km • 45 dk | Toei Bus" },
            walk: { cost4: 0, note: "11.5 km • 2 sa 20 dk" }
          }
        },
        {
          id: "d2_2", time: "10:00", type: "shop", visual: "shopping", completed: false,
          title: "Bic Camera Yurakucho (Kamera Alımı)",
          desc: "Tokyo İstasyonu'na 5 dk mesafedeki ana mağazadan kamera alımı (%10 Tax-Free + Kupon).",
          longDesc: "Osaka yolunuzun tam üzerindeki en büyük Bic Camera ana şubesidir. Pasaportunuzun aslıyla %10 Tax-Free + %5-7 turist indirim kuponunu birlikte kullanabilirsiniz.",
          highlights: "Pasaportun fiziksel aslı şarttır! Kutu ve garanti belgesini kontrol ettirin.",
          transportReason: "Tokyo İstasyonu Yaesu/Marunouchi çıkışına sadece 450 metre (5 dk yürüyüş) mesafededir.",
          cost4: 0, distanceSummary: "450 m • 5 dk yürüyüş", coords: "35.6752,139.7634",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 600, note: "Yurakucho → Tokyo İst. 1 durak (Gereksiz)" },
            taxi: { cost4: 500, note: "450 m • 2 dk" },
            bus: { cost4: 0, note: "Yürüme mesafesi" },
            walk: { cost4: 0, note: "450 m • 5 dk | Doğrudan Shinkansen gişelerine yürüyüş" }
          }
        },
        {
          id: "d2_3", time: "11:30", type: "transit", visual: "shinkansen", completed: false,
          title: "Shinkansen Nozomi: Tokyo → Shin-Osaka",
          desc: "11:30 hızlı treniyle Osaka'ya geçiş (2 saat 30 dk). Sağ camdan Fuji manzarası!",
          longDesc: "Tokyo İstasyonu'ndan Ekiben alıp 11:30 Nozomi Shinkansen'e binerek 14:00'te Shin-Osaka'da olursunuz.",
          highlights: "Trende Ekiben öğle yemeği ve sırt çantalarıyla kolay yerleşim.",
          transportReason: "2.5 saatte sıfır yorgunlukla Osaka'ya ulaştırır.",
          cost4: 5600, distanceSummary: "515 km • 2 sa 30 dk", coords: "34.7335,135.5003",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 58880, note: "515 km • 2 sa 30 dk | Shinkansen Nozomi (Kişi ¥14,720)" },
            taxi: { cost4: 59500, note: "İstasyona taksi + Shinkansen bileti" },
            bus: { cost4: 28000, note: "515 km • 8 sa | Uzun otoyol otobüsü" },
            walk: { cost4: 0, note: "515 km • Şehirler arası" }
          }
        },
        {
          id: "d2_4", time: "14:15", type: "transit", visual: "home", completed: false,
          title: "Osaka Evi Check-in (Kishinosato)",
          desc: "Kishinosato 3-chōme-5-6 (34.6303610, 135.4933890). Sırt çantalarını bırakma.",
          longDesc: "Kishinosato eviniz Yotsubashi metro hattına çok yakın sakin bir mahallededir.",
          highlights: "Ev girişi, yeni kameranın kurulumu ve 30 dk dinlenme.",
          transportReason: "Sadece sırt çantalarınız olduğu için metroyla 32 dk'da çok ucuza (¥1,320) geçebilirsiniz.",
          cost4: 0, distanceSummary: "12.4 km • 32 dk metro", coords: OSAKA_COORDS,
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 1320, note: "12.4 km • 32 dk | Shin-Osaka → Namba → Kishinosato" },
            taxi: { cost4: 5400, note: "12.4 km • 25 dk | Direkt kapıya taksi" },
            bus: { cost4: 1200, note: "13 km • 50 dk | Aktarmalı otobüs" },
            walk: { cost4: 0, note: "12.4 km • 2 sa 35 dk" }
          }
        },
        {
          id: "d2_5", time: "16:00", type: "sight", visual: "osaka_night", completed: false,
          title: "Miracle World Osaka",
          desc: "Namba merkezindeki dijital sanat, ayna ve ışık illüzyon deneyimi.",
          longDesc: "Namba Oriental Hotel B1F bölgesinde yer alan bu interaktif mekan yeni kameranız için harika açılar sunar.",
          highlights: "Sonsuz ayna odası ve dijital projeksiyon alanları.",
          transportReason: "Kishinosato'dan Yotsubashi metro hattı Namba'ya aktarmasız 8 dakikada ulaşır.",
          cost4: 8800, distanceSummary: "4.1 km • 8 dk metro", coords: "34.6672,135.5028",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 960, note: "4.1 km • 8 dk | Kishinosato → Namba Yotsubashi Line" },
            taxi: { cost4: 1900, note: "4.1 km • 11 dk | 4 kişi taksi" },
            bus: { cost4: 840, note: "4.3 km • 20 dk | Belediye otobüsü" },
            walk: { cost4: 0, note: "4.1 km • 52 dk" }
          }
        },
        {
          id: "d2_6", time: "18:30", type: "sight", visual: "osaka_night", completed: false,
          title: "Dotonbori Akşam Turu & Sokak Lezzetleri",
          desc: "Glico tabelası, kanal gece çekimleri, Okonomiyaki ve Takoyaki akşam ziyafeti.",
          longDesc: "Hava karardığında Dotonbori kanalı çevresi dev neon tabelalarla tam bir görsel şölene dönüşür.",
          highlights: "Ebisubashi köprüsünde Glico gece fotoğrafı, Okonomiyaki ve Takoyaki.",
          transportReason: "Miracle World çıkışında hemen Dotonbori caddesindesiniz.",
          cost4: 12000, distanceSummary: "350 m • 4 dk yürüyüş", coords: "34.6687,135.5013",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Yürüme mesafesi" },
            taxi: { cost4: 600, note: "350 m • 2 dk" },
            bus: { cost4: 0, note: "Yürüme mesafesi" },
            walk: { cost4: 0, note: "350 m • 4 dk yürüyüş" }
          }
        },
        {
          id: "d2_7", time: "22:15", type: "transit", visual: "home", completed: false,
          title: "Kishinosato Eve Dönüş",
          desc: "Dotonbori'den Nishinari evinize gece dönüşü.",
          longDesc: "Gün boyu süren kamera alışverişi, Shinkansen ve Dotonbori yürüyüşü sonrası eve dönüş.",
          highlights: "4 kişi kapıdan kapıya Taksi (¥2,300) maksimum konfor sağlar.",
          transportReason: "Gece yorgunluğunda 4 kişi Taksi (¥2,300) en rahat seçenektir.",
          cost4: 0, distanceSummary: "4.3 km • 10 dk", coords: OSAKA_COORDS,
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: {
            train: { cost4: 960, note: "4.3 km • 8 dk | Namba → Kishinosato Metro" },
            taxi: { cost4: 2300, note: "4.3 km • 10 dk | Gece tarifesi dahil kapıya kadar" },
            bus: { cost4: 840, note: "4.5 km • 22 dk | Belediye otobüsü" },
            walk: { cost4: 0, note: "4.3 km • 54 dk yürüyüş" }
          }
        }
      ]
    },
    {
      dayNum: 3, date: "28 Kasım 2026, Cumartesi", city: "OSAKA",
      fatigue: "Yüksek Tempo • Tema Park Günü",
      title: "Universal Studios Japan (USJ) & Shinsekai",
      subtitle: "Super Nintendo World, Harry Potter ve akşam yakındaki Shinsekai",
      stops: [
        {
          id: "d3_1", time: "07:15", type: "food", visual: "food", completed: false,
          title: "Kahvaltı: Kishinosato Konbini",
          desc: "USJ kapı açılışına yetişmek için taze Onigiri, sandviç ve sıcak kahve.",
          longDesc: "USJ Cumartesi günleri resmi açılış saatinden 30-45 dk önce kapılarını açar.",
          highlights: "7-Eleven Tamago Sando ve sıcak kahve.",
          transportReason: "İstasyon yolunda 200 metre yürüyüş mesafesindedir.",
          cost4: 2800, distanceSummary: "200 m • 3 dk yürüyüş", coords: "34.6295,135.4955",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Yol üzeri" },
            taxi: { cost4: 0, note: "Yol üzeri" },
            bus: { cost4: 0, note: "Yol üzeri" },
            walk: { cost4: 0, note: "200 m • 3 dk yürüyüş" }
          }
        },
        {
          id: "d3_2", time: "08:30", type: "sight", visual: "usj", completed: false,
          title: "Universal Studios Japan (USJ) Tam Gün",
          desc: "Super Nintendo World (Mario Kart), Harry Potter ve Jurassic Park (4 Kişi Giriş).",
          longDesc: "Kapıdan girer girmez USJ mobil uygulamasından Super Nintendo World için ücretsiz 'Area Timed Entry Ticket' almayı unutmayın.",
          highlights: "Mario Kart: Koopa's Challenge, Harry Potter ve Flying Dinosaur.",
          transportReason: "Sabah erken saatte 2 tren aktarması yapmadan doğrudan kapı önünde olmak için 4 kişi Taksi (¥4,600) zaman ve enerji kazandırır.",
          cost4: 38400, distanceSummary: "10.2 km • 20 dk taksi", coords: "34.6654,135.4323",
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: {
            train: { cost4: 1760, note: "10.2 km • 35 dk | Kishinosato → Namba → Nishikujo → Universal City" },
            taxi: { cost4: 4600, note: "10.2 km • 20 dk | Sabah açılışa yetişmek için aktarmasız kapıya" },
            bus: { cost4: 1600, note: "11 km • 45 dk | Aktarmalı otobüs" },
            walk: { cost4: 0, note: "10.2 km • 2 sa 10 dk" }
          }
        },
        {
          id: "d3_3", time: "13:30", type: "food", visual: "food", completed: false,
          title: "Öğle Yemeği: Three Broomsticks",
          desc: "Harry Potter köyünde Butterbeer eşliğinde öğle yemeği.",
          longDesc: "Hogsmeade köyündeki restoranın arka terası Hogwarts Şatosu'nu görür.",
          highlights: "Butterbeer ve tavuk/kaburga tabağı.",
          transportReason: "Park içi yürüyüş mesafesindedir.",
          cost4: 9600, distanceSummary: "Park içi", coords: "34.6665,135.4305",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Park içi" },
            taxi: { cost4: 0, note: "Park içi" },
            bus: { cost4: 0, note: "Park içi" },
            walk: { cost4: 0, note: "Park içi 300 m yürüyüş" }
          }
        },
        {
          id: "d3_4", time: "19:30", type: "food", visual: "osaka_night", completed: false,
          title: "Akşam Yemeği: Shinsekai & Tsutenkaku",
          desc: "Evinize çok yakın nostaljik neon mahallesi ve Kushikatsu Daruma.",
          longDesc: "1960'ların retro Japonya atmosferini koruyan renkli mahalle.",
          highlights: "Kushikatsu ve Tsutenkaku Kulesi ışıkları.",
          transportReason: "Universal City istasyonundan JR hattıyla Shin-Imamiya'ya hızlı ulaşılır.",
          cost4: 8400, distanceSummary: "9.4 km • 26 dk tren", coords: "34.6525,135.5063",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 1640, note: "9.4 km • 26 dk | Universal City → Shin-Imamiya JR" },
            taxi: { cost4: 4200, note: "9.4 km • 18 dk | USJ çıkışından direkt Shinsekai" },
            bus: { cost4: 1500, note: "10 km • 42 dk | Şehir otobüsü" },
            walk: { cost4: 0, note: "9.4 km • 1 sa 55 dk" }
          }
        },
        {
          id: "d3_5", time: "21:45", type: "transit", visual: "home", completed: false,
          title: "Kishinosato Eve Dönüş",
          desc: "Shinsekai'den Nishinari evinize 6 dakikalık dönüş.",
          longDesc: "Tüm gün USJ yorgunluğu sonrası evinize en yakın noktadan hızlı dönüş.",
          highlights: "Mesafe 2.1 km olduğu için 4 kişi taksi metro ile aynı fiyata gelir.",
          transportReason: "4 kişi toplam ¥1,200 (kişi ¥300) taksi en akıllıca seçenektir.",
          cost4: 0, distanceSummary: "2.1 km • 6 dk taksi", coords: OSAKA_COORDS,
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: {
            train: { cost4: 760, note: "2.1 km • 8 dk | Dobutsuen-mae → Kishinosato" },
            taxi: { cost4: 1200, note: "2.1 km • 6 dk | 4 kişi toplam ~¥1,200 (Kişi başı ¥300!)" },
            bus: { cost4: 840, note: "2.2 km • 12 dk | Belediye otobüsü" },
            walk: { cost4: 0, note: "2.1 km • 25 dk yürüyüş" }
          }
        }
      ]
    },
    {
      dayNum: 4, date: "29 Kasım 2026, Pazar", city: "OSAKA",
      fatigue: "Orta Tempo • Doğa & Tarih (USJ Sonrası Rahat)",
      title: "Nara Geyikli Park, Osaka Kalesi & Aslan Tapınağı",
      subtitle: "USJ ertesi sabah 08:30 rahat başlangıçla kutsal geyikler ve kale turu",
      stops: [
        {
          id: "d4_1", time: "08:30", type: "food", visual: "food", completed: false,
          title: "Kahvaltı: Namba İstasyonu",
          desc: "Kintetsu-Namba treni öncesi kahvaltı.",
          longDesc: "Sabah 08:30'da sakin bir başlangıç.",
          highlights: "Namba Walk sabah kafeleri.",
          transportReason: "Kishinosato'dan Namba'ya direkt metro 8 dakikadır.",
          cost4: 4200, distanceSummary: "4.1 km • 8 dk metro", coords: "34.6669,135.5015",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 960, note: "4.1 km • 8 dk | Kishinosato → Namba" },
            taxi: { cost4: 1900, note: "4.1 km • 11 dk | Taksi" },
            bus: { cost4: 840, note: "4.3 km • 20 dk | Otobüs" },
            walk: { cost4: 0, note: "4.1 km • 52 dk" }
          }
        },
        {
          id: "d4_2", time: "09:45", type: "sight", visual: "nara", completed: false,
          title: "Nara Park (Geyikli Park) & Todai-ji",
          desc: "1.200'den fazla serbest geyik ve dünyanın en büyük ahşap yapısı Todai-ji.",
          longDesc: "Nara'da geyikler kutsal kabul edilir ve parkta özgürce dolaşır.",
          highlights: "Todai-ji Dev Buda heykeli ve geyik besleme.",
          transportReason: "Kintetsu Rapid Express treni 38 dakikada doğrudan Nara Park girişine ulaşır.",
          cost4: 4000, distanceSummary: "34.5 km • 38 dk tren", coords: "34.6851,135.8430",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 2720, note: "34.5 km • 38 dk | Kintetsu-Namba → Kintetsu-Nara Rapid Express" },
            taxi: { cost4: 15500, note: "35 km • 45 dk | Şehirler arası taksi" },
            bus: { cost4: 2600, note: "36 km • 65 dk | Otobüs" },
            walk: { cost4: 0, note: "34.5 km • Şehirler arası" }
          }
        },
        {
          id: "d4_3", time: "13:00", type: "food", visual: "food", completed: false,
          title: "Öğle Yemeği: Nara Çarşısı & Nakatanidou Mochi",
          desc: "Nara güveç pilavı ve ünlü yeşil çaylı dövme Mochi.",
          longDesc: "Kintetsu-Nara istasyonunun hemen yanındaki alışveriş pasajı.",
          highlights: "Nakatanidou sıcak Yomogi Mochi.",
          transportReason: "Yürüme mesafesindedir.",
          cost4: 6800, distanceSummary: "900 m • 12 dk yürüyüş", coords: "34.6826,135.8286",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Yürüme mesafesi" },
            taxi: { cost4: 700, note: "900 m • 4 dk" },
            bus: { cost4: 880, note: "900 m • 5 dk" },
            walk: { cost4: 0, note: "900 m • 12 dk yürüyüş" }
          }
        },
        {
          id: "d4_4", time: "15:15", type: "sight", visual: "castle", completed: false,
          title: "Osaka Kalesi & Sonbahar Bahçesi",
          desc: "Kasım sonu altın sarısı ginkgo ağaçları eşliğinde ikonik Japon kalesi.",
          longDesc: "Devasa taş surları ve hendekleriyle Osaka'nın simgesi.",
          highlights: "8. kat seyir terası ve sonbahar yaprakları.",
          transportReason: "Nara'dan trenle 42 dakikada ulaşılır.",
          cost4: 2400, distanceSummary: "31.0 km • 42 dk tren", coords: "34.6873,135.5262",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 3200, note: "31 km • 42 dk | Kintetsu-Nara → Tsuruhashi → Morinomiya" },
            taxi: { cost4: 14200, note: "31 km • 40 dk | Şehirler arası taksi" },
            bus: { cost4: 3000, note: "32 km • 70 dk | Aktarmalı otobüs" },
            walk: { cost4: 0, note: "31 km • Şehirler arası" }
          }
        },
        {
          id: "d4_5", time: "17:30", type: "sight", visual: "castle", completed: false,
          title: "Namba Yasaka Jinja (Aslan Tapınağı)",
          desc: "12 metre yüksekliğinde devasa aslan ağzı sahnesiyle ünlü tapınak.",
          longDesc: "Dev aslan ağzının ziyaretçilere şans getirdiğine inanılır.",
          highlights: "Işıklandırılan dev aslan başı önünde fotoğraf.",
          transportReason: "Kale çıkışından 4 kişi Taksi (¥2,300) doğrudan tapınak kapısına 13 dakikada bırakır.",
          cost4: 0, distanceSummary: "5.2 km • 13 dk taksi", coords: "34.6612,135.4966",
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: {
            train: { cost4: 960, note: "5.2 km • 22 dk | Yürüyüş + Metro" },
            taxi: { cost4: 2300, note: "5.2 km • 13 dk | Direkt kapıya 4 kişi taksi" },
            bus: { cost4: 840, note: "5.4 km • 25 dk | Belediye otobüsü" },
            walk: { cost4: 0, note: "5.2 km • 1 sa 5 dk" }
          }
        },
        {
          id: "d4_6", time: "19:30", type: "food", visual: "food", completed: false,
          title: "Akşam Yemeği: Namba Yakiniku & Eve Dönüş",
          desc: "Osaka'daki son akşam yemeği ve Nishinari evine dönüş.",
          longDesc: "Namba bölgesinde ızgara Japon etleri.",
          highlights: "Yakiniku ziyafeti sonrası eve dönüş.",
          transportReason: "Namba'dan Kishinosato'ya tek hat metro sadece 8 dakikadır.",
          cost4: 9200, distanceSummary: "3.8 km • 8 dk metro", coords: OSAKA_COORDS,
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 960, note: "3.8 km • 8 dk | Namba → Kishinosato Metro" },
            taxi: { cost4: 1800, note: "3.8 km • 10 dk | Direkt eve taksi" },
            bus: { cost4: 840, note: "4.0 km • 18 dk | Otobüs" },
            walk: { cost4: 0, note: "3.8 km • 48 dk" }
          }
        }
      ]
    },
    {
      dayNum: 5, date: "30 Kasım 2026, Pazartesi", city: "TOKYO",
      fatigue: "Orta Tempo • Transfer Günü",
      title: "Kuromon Pazarı, Umeda Sky & Tokyo'ya Dönüş",
      subtitle: "Osaka vedası, Shinkansen dönüşü ve Adachi eve yerleşme",
      stops: [
        {
          id: "d5_1", time: "09:00", type: "food", visual: "food", completed: false,
          title: "Kuromon Ichiba Pazarı Kahvaltısı",
          desc: "'Osaka'nın Mutfağı'nda taze deniz ürünleri, Wagyu şiş ve sabah kahvaltısı.",
          longDesc: "150'den fazla tezgahıyla sabah saatlerinde en taze ürünleri sunar.",
          highlights: "Izgara deniz tarağı ve Wagyu et şişleri.",
          transportReason: "Kishinosato'dan Namba hattıyla 10 dakikada ulaşılır.",
          cost4: 8000, distanceSummary: "4.3 km • 10 dk metro", coords: "34.6654,135.5063",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 960, note: "4.3 km • 10 dk | Kishinosato → Namba + 4 dk yürüyüş" },
            taxi: { cost4: 2000, note: "4.3 km • 11 dk | Direkt pazar kapısına taksi" },
            bus: { cost4: 840, note: "4.5 km • 22 dk | Otobüs" },
            walk: { cost4: 0, note: "4.3 km • 54 dk" }
          }
        },
        {
          id: "d5_2", time: "11:30", type: "sight", visual: "shibuya", completed: false,
          title: "Umeda Sky Building Gözlemevi",
          desc: "173 metre yükseklikte açık hava köprüsü ve Osaka panoraması.",
          longDesc: "360 derecelik açık hava terası etkileyici bir manzara sunar.",
          highlights: "Cam tünelli yürüyen merdivenler.",
          transportReason: "Midosuji metro hattıyla Umeda'ya 9 dakikada ulaşılır.",
          cost4: 6000, distanceSummary: "5.4 km • 14 dk metro", coords: "34.7052,135.4897",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 960, note: "5.4 km • 14 dk | Namba → Umeda (Midosuji Line)" },
            taxi: { cost4: 2400, note: "5.4 km • 14 dk | Taksi" },
            bus: { cost4: 840, note: "5.8 km • 28 dk | Otobüs" },
            walk: { cost4: 0, note: "5.4 km • 1 sa 8 dk" }
          }
        },
        {
          id: "d5_3", time: "13:30", type: "food", visual: "food", completed: false,
          title: "Öğle Yemeği: Shin-Osaka Katsu Curry",
          desc: "Shinkansen öncesi istasyon içinde doyurucu Japon köri yemeği.",
          longDesc: "Shin-Osaka istasyonu içindeki gurme çarşısında sıcak öğle yemeği.",
          highlights: "Çıtır Katsu Curry.",
          transportReason: "Umeda'dan Shin-Osaka'ya 6 dakikada bağlanır.",
          cost4: 5600, distanceSummary: "3.9 km • 6 dk metro", coords: "34.7335,135.5003",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 760, note: "3.9 km • 6 dk | Umeda → Shin-Osaka (Midosuji Line)" },
            taxi: { cost4: 1800, note: "3.9 km • 10 dk | Taksi" },
            bus: { cost4: 840, note: "4.2 km • 18 dk | Otobüs" },
            walk: { cost4: 0, note: "3.9 km • 48 dk" }
          }
        },
        {
          id: "d5_4", time: "15:00", type: "transit", visual: "shinkansen", completed: false,
          title: "Shinkansen Nozomi: Shin-Osaka → Tokyo",
          desc: "2 saat 30 dk hızlı tren dönüşü ve Kita-Senju evine yerleşme.",
          longDesc: "Tokyo İstasyonu'na varışta akşam kalabalığına girmeden eve dönüş.",
          highlights: "Sol cam kenarından Fuji Dağı silueti.",
          transportReason: "Shinkansen + akşam saatinde Tokyo İstasyonu'ndan Adachi eve 4 kişi Taksi (¥4,600) kalabalığı önler.",
          cost4: 0, distanceSummary: "515 km • 2 sa 30 dk", coords: TOKYO_COORDS,
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: {
            train: { cost4: 59600, note: "515 km • 2 sa 30 dk | Shinkansen + Akşam metrosu" },
            taxi: { cost4: 63200, note: "Shinkansen + Tokyo İst.'ndan Adachi eve direkt taksi" },
            bus: { cost4: 28000, note: "515 km • 8 sa | Otobüs" },
            walk: { cost4: 0, note: "515 km • Şehirler arası" }
          }
        },
        {
          id: "d5_5", time: "19:30", type: "food", visual: "food", completed: false,
          title: "Kita-Senju Yakitori & Dinlenme",
          desc: "Yarınki tam gün DisneySea öncesi ev sokağında yemek ve erken uyku.",
          longDesc: "Kita-Senju Nomiyokocho bölgesinde kömür ateşinde tavuk şişler.",
          highlights: "Negima ve Tsukune.",
          transportReason: "Eve 350 metre mesafededir.",
          cost4: 6400, distanceSummary: "350 m • 4 dk yürüyüş", coords: TOKYO_COORDS,
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Yürüme mesafesi" },
            taxi: { cost4: 500, note: "350 m • 2 dk" },
            bus: { cost4: 0, note: "Yürüme mesafesi" },
            walk: { cost4: 0, note: "350 m • 4 dk yürüyüş" }
          }
        }
      ]
    },
    {
      dayNum: 6, date: "1 Aralık 2026, Salı", city: "TOKYO",
      fatigue: "Yüksek Tempo • Tam Gün Tema Park",
      title: "Tokyo DisneySea Tam Gün Macerası",
      subtitle: "Fantasy Springs & gece su gösterisi",
      stops: [
        {
          id: "d6_1", time: "07:15", type: "food", visual: "food", completed: false,
          title: "Kahvaltı: Kita-Senju İstasyonu",
          desc: "Sabah erken hareket öncesi kahve ve sandviç.",
          longDesc: "DisneySea kapı açılışına yetişmek için pratik sabah kahvaltısı.",
          highlights: "Sıcak kahve ve taze kruvasan.",
          transportReason: "İstasyona 7 dk yürüyüş mesafesindedir.",
          cost4: 3200, distanceSummary: "550 m • 7 dk yürüyüş", coords: "35.7496,139.8049",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Yürüme mesafesi" },
            taxi: { cost4: 600, note: "550 m • 3 dk" },
            bus: { cost4: 0, note: "Yürüme mesafesi" },
            walk: { cost4: 0, note: "550 m • 7 dk yürüyüş" }
          }
        },
        {
          id: "d6_2", time: "08:30", type: "sight", visual: "disney", completed: false,
          title: "Tokyo DisneySea (Tam Gün)",
          desc: "Dünyada sadece Tokyo'da olan deniz temalı Disney parkı & Fantasy Springs.",
          longDesc: "Görkemli volkan manzarası, Venedik kanalları ve yeni açılan Fantasy Springs bölgesiyle benzersizdir.",
          highlights: "Journey to the Center of the Earth, Tower of Terror ve gece Believe! Sea of Dreams şovu.",
          transportReason: "Sabah 08:00 Tokyo metrosu yoğun iş saatine denk geldiği için 4 kişi direkt Taksi (¥9,600) kapıya bırakır.",
          cost4: 37600, distanceSummary: "21.5 km • 35 dk taksi", coords: "35.6267,139.8851",
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: {
            train: { cost4: 2680, note: "21.5 km • 48 dk | Kita-Senju → Hatchobori → Maihama" },
            taxi: { cost4: 9600, note: "21.5 km • 35 dk | Sabah kalabalığına girmeden direkt kapıya" },
            bus: { cost4: 4000, note: "22 km • 60 dk | Tokyo İst. aktarmalı Shuttle" },
            walk: { cost4: 0, note: "21.5 km • 4 sa 30 dk" }
          }
        },
        {
          id: "d6_3", time: "13:30", type: "food", visual: "food", completed: false,
          title: "Öğle & Akşam Yemeği: DisneySea",
          desc: "Arendelle Royal Banquet veya Vulcania restoranlarında yemek.",
          longDesc: "Park içindeki temalı restoranlarda dinlenme ve yemek molaları.",
          highlights: "Arendelle Kalesi içi yemek salonu.",
          transportReason: "Park içi yürüyüş mesafesindedir.",
          cost4: 12000, distanceSummary: "Park içi", coords: "35.6267,139.8851",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Park içi" },
            taxi: { cost4: 0, note: "Park içi" },
            bus: { cost4: 0, note: "Park içi" },
            walk: { cost4: 0, note: "Park içi 400 m yürüyüş" }
          }
        },
        {
          id: "d6_4", time: "21:15", type: "transit", visual: "home", completed: false,
          title: "Kita-Senju Eve Dönüş",
          desc: "Gece gösterisi sonrası Tokyo evinize dönüş.",
          longDesc: "DisneySea kapanışı sonrası eve dönüş.",
          highlights: "21:30'da trenler rahatlamış olur.",
          transportReason: "21:30'da trenler rahatlamış olur; hem ekonomik hem hızlı tren (48 dk) uygundur.",
          cost4: 0, distanceSummary: "21.5 km • 48 dk tren", coords: TOKYO_COORDS,
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 2680, note: "21.5 km • 48 dk | Maihama → Hatchobori → Kita-Senju" },
            taxi: { cost4: 9800, note: "21.5 km • 35 dk | Kapıya direkt taksi" },
            bus: { cost4: 4000, note: "22 km • 60 dk | Shuttle + Metro" },
            walk: { cost4: 0, note: "21.5 km • 4 sa 30 dk" }
          }
        }
      ]
    },
    {
      dayNum: 7, date: "2 Aralık 2026, Çarşamba", city: "TOKYO",
      fatigue: "Düşük / Rahat Tempo • Dinlenme Dengeli",
      title: "Geç Kahvaltı, Harry Potter Studio & Shinjuku",
      subtitle: "DisneySea ertesi sabah 10:00 geç başlangıçla yorgunluk dengeleyici program",
      stops: [
        {
          id: "d7_1", time: "10:00", type: "food", visual: "food", completed: false,
          title: "Geç Kahvaltı: Komeda's Coffee",
          desc: "Dünkü DisneySea yorgunluğunu atmak için sabah uyku sonrası rahat kahvaltı.",
          longDesc: "İki yoğun gün üst üste olmaması için bugün program 10:00'da başlıyor.",
          highlights: "Katsupan ve Japon kahvesi.",
          transportReason: "Eve 500 metre yürüme mesafesindedir.",
          cost4: 4200, distanceSummary: "500 m • 6 dk yürüyüş", coords: "35.7495,139.8035",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Yürüme mesafesi" },
            taxi: { cost4: 500, note: "500 m • 2 dk" },
            bus: { cost4: 0, note: "Yürüme mesafesi" },
            walk: { cost4: 0, note: "500 m • 6 dk yürüyüş" }
          }
        },
        {
          id: "d7_2", time: "12:00", type: "sight", visual: "harry", completed: false,
          title: "Warner Bros. Studio Tour – Harry Potter",
          desc: "Kapalı alanda rahat tempoda Büyük Salon, Diagon Yolu ve 9¾ Peronu turu.",
          longDesc: "Dünyanın en büyük kapalı Harry Potter stüdyosu.",
          highlights: "Büyük Salon, Yasak Orman, Hogwarts Ekspresi.",
          transportReason: "Öğle saatinde metro boş ve hızlıdır; Toshimaen stüdyo kapısının tam önünde inersiniz.",
          cost4: 26000, distanceSummary: "18.8 km • 45 dk tren", coords: "35.7456,139.6461",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 1840, note: "18.8 km • 45 dk | Kita-Senju → Ikebukuro → Toshimaen (Kapı önü)" },
            taxi: { cost4: 8100, note: "18.8 km • 36 dk | Taksi" },
            bus: { cost4: 1800, note: "19 km • 65 dk | Otobüs" },
            walk: { cost4: 0, note: "18.8 km • 3 sa 55 dk" }
          }
        },
        {
          id: "d7_3", time: "15:00", type: "food", visual: "food", completed: false,
          title: "Öğle Yemeği: Backlot Cafe & Butterbeer",
          desc: "Stüdyo ortasındaki kafede Hogwarts temalı yemek molası.",
          longDesc: "Turun tam ortasında yer alan geniş dinlenme ve yemek alanı.",
          highlights: "Hatıra bardaklı Butterbeer.",
          transportReason: "Stüdyo içi yürüme mesafesindedir.",
          cost4: 9600, distanceSummary: "Stüdyo içi", coords: "35.7456,139.6461",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Stüdyo içi" },
            taxi: { cost4: 0, note: "Stüdyo içi" },
            bus: { cost4: 0, note: "Stüdyo içi" },
            walk: { cost4: 0, note: "Stüdyo içi 150 m" }
          }
        },
        {
          id: "d7_4", time: "17:30", type: "sight", visual: "shibuya", completed: false,
          title: "Shinjuku: 3D Kedi Tabelası & Kabukicho",
          desc: "Dev 3D ekranlar, Godzilla başı ve tarihi dar sokak atmosferi.",
          longDesc: "Tokyo'nun gökdelenler ve neon ışıklarıyla ünlü eğlence merkezi.",
          highlights: "Shinjuku 3D dev kedi ekranı ve Omoide Yokocho.",
          transportReason: "Toei Oedo metro hattı aktarmasız 20 dakikada doğrudan Shinjuku'ya iner.",
          cost4: 0, distanceSummary: "11.2 km • 20 dk metro", coords: "35.6938,139.7005",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 1120, note: "11.2 km • 20 dk | Toshimaen → Shinjuku Toei Oedo Line direkt" },
            taxi: { cost4: 4800, note: "11.2 km • 24 dk | Taksi" },
            bus: { cost4: 920, note: "11.5 km • 40 dk | Toei Bus" },
            walk: { cost4: 0, note: "11.2 km • 2 sa 20 dk" }
          }
        },
        {
          id: "d7_5", time: "19:45", type: "food", visual: "food", completed: false,
          title: "Akşam Yemeği: Shinjuku Gyukatsu & Dönüş",
          desc: "Taş ızgarada çıtır dana eti (Gyukatsu) ve Kita-Senju eve dönüş.",
          longDesc: "Masadaki sıcak taşta kendi zevkinize göre pişireceğiniz eşsiz lezzet.",
          highlights: "Gyukatsu Motomura set menüsü.",
          transportReason: "Tren ile 32 dk ekonomik dönüş sağlanabilir.",
          cost4: 9600, distanceSummary: "15.4 km • 32 dk tren", coords: TOKYO_COORDS,
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 1480, note: "15.4 km • 32 dk | Shinjuku → Kanda/Ueno → Kita-Senju" },
            taxi: { cost4: 6600, note: "15.4 km • 28 dk | Direkt kapıya taksi" },
            bus: { cost4: 1400, note: "16 km • 55 dk | Otobüs + Metro" },
            walk: { cost4: 0, note: "15.4 km • 3 sa 10 dk" }
          }
        }
      ]
    },
    {
      dayNum: 8, date: "3 Aralık 2026, Perşembe", city: "TOKYO",
      fatigue: "Orta Tempo • Otobüs Konforu & Gastronomi",
      title: "Gotemba Premium Outlets & Ginza Steak Akasaka",
      subtitle: "Oturarak otobüs yolculuğu ile outlet alışverişi ve akşam A5 Wagyu Teppanyaki",
      stops: [
        {
          id: "d8_1", time: "07:45", type: "food", visual: "food", completed: false,
          title: "Kahvaltı: Tokyo İstasyonu Yaesu",
          desc: "Gotemba otobüs kalkış noktası öncesi istasyonda kahvaltı.",
          longDesc: "Tokyo İstasyonu yeraltı çarşısı 'First Avenue'.",
          highlights: "Taze kahve ve Japon fırın ürünleri.",
          transportReason: "Kita-Senju'dan Ueno aktarmasıyla 22 dakikada Tokyo İstasyonu'na ulaşılır.",
          cost4: 3600, distanceSummary: "11.0 km • 22 dk tren", coords: "35.6812,139.7671",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 1120, note: "11.0 km • 22 dk | Kita-Senju → Ueno → Tokyo İstasyonu" },
            taxi: { cost4: 4700, note: "11.0 km • 22 dk | Taksi" },
            bus: { cost4: 920, note: "11.5 km • 40 dk | Toei Bus" },
            walk: { cost4: 0, note: "11.0 km • 2 sa 15 dk" }
          }
        },
        {
          id: "d8_2", time: "09:00", type: "shop", visual: "shopping", completed: false,
          title: "Gotemba Premium Outlets",
          desc: "290+ marka, Tax-Free alışveriş ve açık havada Fuji Dağı manzarası.",
          longDesc: "Japonya'nın en büyük ve en prestijli outlet merkezi.",
          highlights: "Yume no Ohashi köprüsünden Fuji Dağı fotoğrafı ve %10 Tax-Free alışveriş.",
          transportReason: "Tokyo İstasyonu Yaesu Güney Çıkışı'ndan kalkan direkt JR Highway Bus (95 dk) en konforlu seçenektir.",
          cost4: 0, distanceSummary: "96 km • 95 dk otobüs", coords: "35.3071,138.9665",
          recommendedMode: "bus", selectedMode: "bus",
          modes: {
            train: { cost4: 14800, note: "96 km • 110 dk | Tren + Shuttle" },
            taxi: { cost4: 42000, note: "96 km • 85 dk | Uzun mesafe" },
            bus: { cost4: 14400, note: "96 km • 95 dk | Tokyo İst. Yaesu direkt otobüs (Kişi ¥3,600)" },
            walk: { cost4: 0, note: "96 km • Şehirler arası" }
          }
        },
        {
          id: "d8_3", time: "13:30", type: "food", visual: "food", completed: false,
          title: "Öğle Yemeği: Gotemba Food Bazaar",
          desc: "Outlet içinde öğle molası ve alışverişe devam.",
          longDesc: "Yerel Shizuoka lezzetleri.",
          highlights: "Fujinomiya Yakisoba veya Sawayaka Hamburg.",
          transportReason: "Outlet içi yürüme mesafesindedir.",
          cost4: 7600, distanceSummary: "Outlet içi", coords: "35.3071,138.9665",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Outlet içi" },
            taxi: { cost4: 0, note: "Outlet içi" },
            bus: { cost4: 0, note: "Outlet içi" },
            walk: { cost4: 0, note: "Outlet içi 200 m" }
          }
        },
        {
          id: "d8_4", time: "19:30", type: "food", visual: "wagyu", completed: false,
          title: "Ginza Steak Akasaka (銀座のステーキ 赤坂店)",
          desc: "Şeflerin önünüzde pişirdiği sınırsız A5 Kuroge Wagyu Teppanyaki ziyafeti!",
          longDesc: "En üst kalite A5 sınıfı siyah Japon sığırı bifteklerinin sınırsız servis edildiği unutulmaz gastronomi durağı.",
          highlights: "Sınırsız A5 Wagyu Sirloin & Filet mignon Teppanyaki kursu.",
          transportReason: "Gotemba dönüş otobüsü + Akasaka-mitsuke Metro.",
          cost4: 48000, distanceSummary: "98 km • Otobüs + Metro", coords: "35.6768,139.7369",
          recommendedMode: "bus", selectedMode: "bus",
          modes: {
            train: { cost4: 15200, note: "98 km • 115 dk | Tren + Metro" },
            taxi: { cost4: 43500, note: "98 km • 90 dk | Direkt taksi" },
            bus: { cost4: 15120, note: "98 km • 105 dk | Gotemba → Tokyo İst. Otobüs + Akasaka Metro" },
            walk: { cost4: 0, note: "98 km • Şehirler arası" }
          }
        },
        {
          id: "d8_5", time: "22:00", type: "transit", visual: "home", completed: false,
          title: "Kita-Senju Eve Dönüş",
          desc: "Akasaka'dan poşetlerle Kita-Senju evinize dönüş.",
          longDesc: "Harika bir Wagyu akşam yemeği ve outlet alışverişi sonrası eve dönüş.",
          highlights: "Chiyoda metro hattı aktarmasız tek tren gider.",
          transportReason: "Outlet alışveriş poşetleri elinizdeyse 4 kişi Taksi (¥6,400) kapıya kadar taşır.",
          cost4: 0, distanceSummary: "13.2 km • 25 dk", coords: TOKYO_COORDS,
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: {
            train: { cost4: 1120, note: "13.2 km • 25 dk | Akasaka → Kita-Senju Chiyoda Line TEK TREN" },
            taxi: { cost4: 6400, note: "13.2 km • 24 dk | Alışveriş poşetleriyle kapıya kadar konforlu" },
            bus: { cost4: 920, note: "13.5 km • 48 dk | Şehir otobüsü" },
            walk: { cost4: 0, note: "13.2 km • 2 sa 45 dk" }
          }
        }
      ]
    },
    {
      dayNum: 9, date: "4 Aralık 2026, Cuma", city: "TOKYO",
      fatigue: "Orta-Yüksek Tempo • Kültür, Teknoloji & Gece Drift",
      title: "Asakusa, Yodobashi Akiba & Tokyo Drift Gece",
      subtitle: "Tarihi tapınak, teknoloji alışverişi ve Cuma gecesi JDM otomobil kültürü",
      stops: [
        {
          id: "d9_1", time: "08:30", type: "food", visual: "food", completed: false,
          title: "Kahvaltı: Asakusa Fırın & Matcha",
          desc: "Kaminarimon kapısı çevresinde taze Melonpan ve kahve.",
          longDesc: "Asakusa sabah saatlerinde geleneksel fırın kokularıyla büyüleyicidir.",
          highlights: "Asakusa Kagetsudo Melonpan ve sıcak Matcha.",
          transportReason: "Tobu Skytree Line ile Asakusa sadece 12 dakika ve aktarmasızdır.",
          cost4: 3400, distanceSummary: "6.4 km • 12 dk tren", coords: "35.7147,139.7966",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 920, note: "6.4 km • 12 dk | Kita-Senju → Asakusa Tobu Line direkt" },
            taxi: { cost4: 2800, note: "6.4 km • 14 dk | Taksi" },
            bus: { cost4: 880, note: "6.8 km • 25 dk | Toei Bus" },
            walk: { cost4: 0, note: "6.4 km • 1 sa 18 dk" }
          }
        },
        {
          id: "d9_2", time: "09:30", type: "sight", visual: "castle", completed: false,
          title: "Senso-ji Tapınağı & Nakamise Caddesi",
          desc: "Tokyo'nun en eski tapınağı, dev kırmızı fener ve geleneksel hediyelikler.",
          longDesc: "MS 645 yılında kurulan Senso-ji eski Edo ruhunu yaşatır.",
          highlights: "Omikuji şans falı ve Tokyo Skytree manzarası.",
          transportReason: "Kahvaltı noktasından 300 metre yürüme mesafesindedir.",
          cost4: 0, distanceSummary: "300 m • 4 dk yürüyüş", coords: "35.7148,139.7967",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Yürüme mesafesi" },
            taxi: { cost4: 500, note: "300 m • 2 dk" },
            bus: { cost4: 0, note: "Yürüme mesafesi" },
            walk: { cost4: 0, note: "300 m • 4 dk yürüyüş" }
          }
        },
        {
          id: "d9_3", time: "12:00", type: "shop", visual: "shopping", completed: false,
          title: "Yodobashi Camera Multimedia Akiba",
          desc: "9 katlı devasa teknoloji, lens, aksesuar, saat ve figür merkezi.",
          longDesc: "Kameranız için ekstra lens, filtre, tripod ve koleksiyon figürleri.",
          highlights: "Pasaportla %10 Tax-Free + 6. kat oyun/figür bölümü.",
          transportReason: "Tsukuba Express treni Asakusa'dan Akihabara'ya 4 dakikada ulaşır.",
          cost4: 0, distanceSummary: "3.1 km • 4 dk tren", coords: "35.6987,139.7747",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 840, note: "3.1 km • 4 dk | Asakusa → Akihabara Tsukuba Express" },
            taxi: { cost4: 1500, note: "3.1 km • 9 dk | 4 kişi taksi" },
            bus: { cost4: 880, note: "3.4 km • 16 dk | Toei Bus" },
            walk: { cost4: 0, note: "3.1 km • 38 dk" }
          }
        },
        {
          id: "d9_4", time: "14:30", type: "food", visual: "food", completed: false,
          title: "Öğle Yemeği: Yodobashi 8. Kat Restoranları",
          desc: "Tonkatsu, Sushi veya Hamburg seçeneklerinin bulunduğu gurme katı.",
          longDesc: "30 farklı Japon restoranı.",
          highlights: "Wagyu Hamburg veya çıtır Tonkatsu.",
          transportReason: "Bina içi asansörle 8. kat.",
          cost4: 7200, distanceSummary: "Bina içi", coords: "35.6987,139.7747",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Bina içi" },
            taxi: { cost4: 0, note: "Bina içi" },
            bus: { cost4: 0, note: "Bina içi" },
            walk: { cost4: 0, note: "Bina içi 8. kat" }
          }
        },
        {
          id: "d9_5", time: "17:00", type: "sight", visual: "drift", completed: false,
          title: "Tokyo Drift Caddesi (Shibuya Center-Gai) & Akşam",
          desc: "Fast & Furious: Tokyo Drift filmine ilham veren neon caddeler ve Cuma gecesi JDM otomobil kültürü.",
          longDesc: "Cuma geceleri modifiye JDM araçların ve sokak kültürünün nabzının attığı yer.",
          highlights: "Shibuya Center-Gai neon drift caddesi gece çekimleri ve Ichiran/Izakaya.",
          transportReason: "Akihabara'dan Ginza/Yamanote hattıyla Shibuya'ya direkt ulaşım çok pratiktir.",
          cost4: 9200, distanceSummary: "10.5 km • 24 dk tren", coords: "35.6601,139.6989",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 2040, note: "10.5 km • 24 dk | Akihabara → Shibuya + Dönüş Kita-Senju" },
            taxi: { cost4: 8800, note: "Shibuya geçişi + Gece teknoloji kutularıyla eve direkt taksi" },
            bus: { cost4: 1800, note: "Otobüs" },
            walk: { cost4: 0, note: "10.5 km • 2 sa 10 dk" }
          }
        }
      ]
    },
    {
      dayNum: 10, date: "5 Aralık 2026, Cumartesi", city: "TOKYO",
      fatigue: "Hafif-Orta Tempo • Bit Pazarı & Veda Günü",
      title: "Hafta Sonu Bit Pazarı (Oi Flea Market), Meiji Jingu & Shibuya Sky",
      subtitle: "Cumartesi sabahı vintage/antika bit pazarı ve gün batımı manzarası",
      stops: [
        {
          id: "d10_1", time: "09:30", type: "shop", visual: "flea", completed: false,
          title: "Hafta Sonu Bit Pazarı: Oi Racecourse Flea Market",
          desc: "Hafta sonu kurulan Tokyo'nun en büyük açık hava bit pazarı (35.5924, 139.7405) + Kahvaltı.",
          longDesc: "300'den fazla tezgahta vintage kimonolar, eski analog kameralar, plaklar, saatler ve antika eşyalar bulunur.",
          highlights: "Vintage analog kamera/saat tezgahları ve sokak lezzetleri.",
          transportReason: "Tokyo Monorail ile Oi Keibajo-mae durağına inip 3 dk yürüyerek pazara ulaşmak çok hızlıdır.",
          cost4: 4500, distanceSummary: "21.8 km • 38 dk monorail", coords: "35.5924,139.7405",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 2480, note: "21.8 km • 38 dk | Kita-Senju → Hamamatsucho → Oi Keibajo-mae Monorail" },
            taxi: { cost4: 9400, note: "21.8 km • 34 dk | 4 kişi direkt taksi" },
            bus: { cost4: 2200, note: "23 km • 65 dk | Otobüs" },
            walk: { cost4: 0, note: "21.8 km • 4 sa 30 dk" }
          }
        },
        {
          id: "d10_2", time: "12:30", type: "sight", visual: "nara", completed: false,
          title: "Meiji Jingu Tapınağı & Omotesando",
          desc: "Şehrin kalbindeki dev sedir ormanı içindeki tapınak ve modern bulvar.",
          longDesc: "100.000'den fazla ağacın bulunduğu huzurlu orman yürüyüşü.",
          highlights: "Dev ahşap Torii kapıları ve sake fıçıları duvarı.",
          transportReason: "Monorail + JR Yamanote hattı ile Harajuku'ya 28 dakikada ulaşılır.",
          cost4: 0, distanceSummary: "13.5 km • 28 dk tren", coords: "35.6764,139.6993",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 1840, note: "13.5 km • 28 dk | Oi Keibajo-mae → Hamamatsucho → Harajuku" },
            taxi: { cost4: 5900, note: "13.5 km • 25 dk | 4 kişi taksi" },
            bus: { cost4: 1600, note: "14 km • 55 dk | Otobüs" },
            walk: { cost4: 0, note: "13.5 km • 2 sa 45 dk" }
          }
        },
        {
          id: "d10_3", time: "14:15", type: "food", visual: "food", completed: false,
          title: "Öğle Yemeği: Shibuya Uobei Dönen Suşi",
          desc: "Cat Street üzerinden keyifli yürüyüşle Shibuya'da tablet siparişli hızlı tren suşi.",
          longDesc: "Harajuku ile Shibuya arasındaki butik sokak Cat Street üzerinden keyifli yürüyüş.",
          highlights: "Mini hızlı trenle gelen suşiler.",
          transportReason: "Cat Street üzeri düz ve keyifli bir yürüyüş rotasıdır.",
          cost4: 6400, distanceSummary: "1.4 km • 18 dk yürüyüş", coords: "35.6596,139.6983",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 600, note: "1.4 km • 3 dk | Harajuku → Shibuya" },
            taxi: { cost4: 700, note: "1.4 km • 5 dk | Taksi" },
            bus: { cost4: 880, note: "1.5 km • 8 dk | Hachiko Bus" },
            walk: { cost4: 0, note: "1.4 km • 18 dk | Cat Street yürüyüşü" }
          }
        },
        {
          id: "d10_4", time: "16:00", type: "sight", visual: "shibuya", completed: false,
          title: "Shibuya Crossing & Shibuya Sky (Gün Batımı)",
          desc: "229 metre yükseklikteki açık hava terasından Tokyo gün batımı ve gece ışıkları.",
          longDesc: "360 derece Tokyo manzarasını izleyeceğiniz zirve noktası.",
          highlights: "Gün batımı ve gece ışıklarını yeni kameranızla çekme.",
          transportReason: "Shibuya Scramble Square binasındadır.",
          cost4: 10000, distanceSummary: "350 m • 4 dk yürüyüş", coords: "35.6584,139.7022",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Yürüme mesafesi" },
            taxi: { cost4: 500, note: "350 m • 2 dk" },
            bus: { cost4: 0, note: "Yürüme mesafesi" },
            walk: { cost4: 0, note: "350 m • 4 dk yürüyüş" }
          }
        },
        {
          id: "d10_5", time: "19:30", type: "food", visual: "wagyu", completed: false,
          title: "Veda Yemeği: Shibuya Wagyu Shabu-Shabu & Dönüş",
          desc: "Japonya'daki son akşam yemeği ve yarın sabah 06:15 uçuş hazırlığı için eve dönüş.",
          longDesc: "İncecik dilimlenmiş Wagyu etleriyle veda ziyafeti.",
          highlights: "Son gece kutlaması ve Kita-Senju evine dönüş.",
          transportReason: "Shibuya'dan Kita-Senju'ya aktarmasız tek tren gider (35 dk).",
          cost4: 14000, distanceSummary: "17.2 km • 35 dk tren", coords: TOKYO_COORDS,
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 1240, note: "17.2 km • 35 dk | Shibuya → Kita-Senju Hanzomon/Tobu direkt" },
            taxi: { cost4: 7200, note: "17.2 km • 32 dk | Son gece kapıya direkt taksi" },
            bus: { cost4: 920, note: "18 km • 60 dk | Otobüs" },
            walk: { cost4: 0, note: "17.2 km • 3 sa 35 dk" }
          }
        }
      ]
    },
    {
      dayNum: 11, date: "6 Aralık 2026, Pazar", city: "TOKYO → NRT",
      fatigue: "Hafif Tempo • Valiz Dostu Dönüş",
      title: "Narita Havalimanı Transferi & İstanbul Dönüşü (10:10)",
      subtitle: "Direkt Airport Limousine Bus ve İstanbul uçuşu",
      stops: [
        {
          id: "d11_1", time: "06:15", type: "food", visual: "food", completed: false,
          title: "Evden Çıkış & Hızlı Kahvaltı (Kita-Senju)",
          desc: "10:10 Narita uçağı için en geç 06:15'te evden çıkış ve durak yanında kahve.",
          longDesc: "Tokyo evinizden Kita-Senju Doğu Çıkışı otobüs durağına 550m yürüyüş.",
          highlights: "Konbini'den sıcak kahve.",
          transportReason: "550m düz yol yürüyüşü.",
          cost4: 2400, distanceSummary: "550 m • 7 dk yürüyüş", coords: "35.7496,139.8062",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Yürüme mesafesi" },
            taxi: { cost4: 600, note: "550 m • 2 dk" },
            bus: { cost4: 0, note: "Yürüme mesafesi" },
            walk: { cost4: 0, note: "550 m • 7 dk | Kita-Senju Doğu Çıkışı durağına" }
          }
        },
        {
          id: "d11_2", time: "06:45", type: "transit", visual: "flight", completed: false,
          title: "Narita Havalimanı Transferi (Direkt Otobüs)",
          desc: "Kita-Senju Doğu Çıkışı'ndan kalkan otobüs ile aktarmasız direkt Narita Terminal kapısına ulaşım.",
          longDesc: "Sabah trafiği olmadan ~75 dakikada doğrudan Narita giden yolcu terminal kapısında iniş.",
          highlights: "Çantalar alt bagajda, sıfır aktarma konforu.",
          transportReason: "Fiyat (¥11,200) ve sıfır aktarma konforu nedeniyle Otobüs en iyi seçenektir.",
          cost4: 0, distanceSummary: "64 km • 75 dk direkt otobüs", coords: "35.7720,140.3929",
          recommendedMode: "bus", selectedMode: "bus",
          modes: {
            train: { cost4: 10800, note: "64 km • 55 dk | Kita-Senju → Nippori → Keisei Skyliner" },
            taxi: { cost4: 26500, note: "64 km • 60 dk | Kapıdan Narita'ya VIP taksi" },
            bus: { cost4: 11200, note: "64 km • 75 dk | Airport Limousine Bus Direkt (Kişi ¥2,800)" },
            walk: { cost4: 0, note: "64 km • Şehirler arası" }
          }
        },
        {
          id: "d11_3", time: "08:15", type: "transit", visual: "flight", completed: false,
          title: "Narita Check-in, Tax-Free & 10:10 Uçuşu",
          desc: "Bagaj teslimi, gümrük işlemleri ve 10:10 uçağı ile İstanbul'a dönüş.",
          longDesc: "Terminalde check-in ve pasaport kontrolü.",
          highlights: "Duty-Free son alışveriş.",
          transportReason: "Terminal içi yürüme mesafesindedir.",
          cost4: 0, distanceSummary: "Terminal içi", coords: "35.7720,140.3929",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Terminal içi" },
            taxi: { cost4: 0, note: "Terminal içi" },
            bus: { cost4: 0, note: "Terminal kapısı" },
            walk: { cost4: 0, note: "Terminal içi 150 m" }
          }
        }
      ]
    }
  ]
};

function getOrCreateDeviceToken() {
  let token = localStorage.getItem("japan_device_token_v1");
  if (!token) {
    const arr = new Uint8Array(24);
    crypto.getRandomValues(arr);
    token = Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
    localStorage.setItem("japan_device_token_v1", token);
  }
  return token;
}

// Opens native Google Maps app on mobile with selected transport mode & ZERO API key errors
function openGoogleMapsNative(stop) {
  const dest = stop?.coords || encodeURIComponent(stop?.title || "Tokyo");
  const mode = stop?.selectedMode || stop?.recommendedMode || "train";
  const gMode = mode === "taxi" ? "driving" : mode === "walk" ? "walking" : "transit";

  const webFallback = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=${gMode}`;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    const appScheme = `comgooglemaps://?daddr=${encodeURIComponent(dest)}&directionsmode=${gMode}`;
    window.location.href = appScheme;
    setTimeout(() => {
      if (!document.hidden) {
        window.open(webFallback, "_blank", "noopener,noreferrer");
      }
    }, 600);
  } else {
    window.open(webFallback, "_blank", "noopener,noreferrer");
  }
}

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        const side = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// --- IN-APP INTERACTIVE MAP COMPONENT (ZERO API KEY) ---
function InteractiveRouteMap({ dayObj, onSelectStop }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [activePinStop, setActivePinStop] = useState(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, { zoomControl: false }).setView([35.6895, 139.6917], 12);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap"
      }).addTo(mapInstanceRef.current);
      layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    setTimeout(() => map.invalidateSize(), 150);
    group.clearLayers();

    const tokyoIcon = L.divIcon({
      html: `<div style="background:#059669;color:#fff;padding:3px 8px;border-radius:99px;font-size:10px;font-weight:800;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.2);white-space:nowrap;">🏠 Tokyo Evi</div>`,
      className: ""
    });
    const osakaIcon = L.divIcon({
      html: `<div style="background:#0d9488;color:#fff;padding:3px 8px;border-radius:99px;font-size:10px;font-weight:800;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.2);white-space:nowrap;">🏠 Osaka Evi</div>`,
      className: ""
    });
    L.marker([35.7534716, 139.7996485], { icon: tokyoIcon }).addTo(group);
    L.marker([34.6303610, 135.4933890], { icon: osakaIcon }).addTo(group);

    const points = [];
    const validStops = [];

    dayObj.stops.forEach((st, idx) => {
      if (!st.coords) return;
      const parts = st.coords.split(",").map(Number);
      if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return;
      points.push(parts);
      validStops.push({ stop: st, num: idx + 1 });

      const pinHtml = `<div style="width:30px;height:30px;border-radius:99px;background:${st.completed ? "#10b981" : "#2563eb"};color:#fff;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;border:2.5px solid #fff;box-shadow:0 4px 12px rgba(37,99,235,0.45);">${idx + 1}</div>`;
      const icon = L.divIcon({ html: pinHtml, className: "", iconSize: [30, 30], iconAnchor: [15, 15] });
      const marker = L.marker(parts, { icon }).addTo(group);
      marker.on("click", () => setActivePinStop({ stop: st, num: idx + 1 }));
    });

    if (points.length > 1) {
      L.polyline(points, { color: "#2563eb", weight: 3.5, opacity: 0.8, dashArray: "6, 8" }).addTo(group);
    }
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [45, 45], maxZoom: 14 });
      setActivePinStop(validStops[0]);
    }
  }, [dayObj]);

  const focusHome = (which) => {
    if (!mapInstanceRef.current) return;
    if (which === "tokyo") mapInstanceRef.current.setView([35.7534716, 139.7996485], 15);
    else mapInstanceRef.current.setView([34.6303610, 135.4933890], 15);
  };

  return (
    <div className="glass-card rounded-[28px] overflow-hidden border border-white/80 dark:border-slate-800 shadow-lg">
      <div className="p-3 bg-white/90 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <span className="text-xs font-extrabold text-slate-800 dark:text-white">
          {dayObj.dayNum}. Gün • {dayObj.city} Rotası
        </span>
        <div className="flex gap-1.5 text-[10px] font-extrabold">
          <button onClick={() => focusHome("tokyo")} className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300">🏠 Tokyo</button>
          <button onClick={() => focusHome("osaka")} className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">🏠 Osaka</button>
        </div>
      </div>

      <div ref={mapContainerRef} className="w-full h-[380px] sm:h-[440px]" />

      {activePinStop && (
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <img src={LANDMARK_PHOTOS[activePinStop.stop.visual] || LANDMARK_PHOTOS.castle} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold inline-flex items-center justify-center">{activePinStop.num}</span>
                <span className="text-xs font-bold text-slate-500">{activePinStop.stop.time} • {activePinStop.stop.distanceSummary}</span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate mt-0.5">{activePinStop.stop.title}</h4>
              <p className="text-[11px] text-slate-500 truncate">{activePinStop.stop.desc}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => openGoogleMapsNative(activePinStop.stop)}
              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white text-xs font-extrabold text-center shadow-xs flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5" /> Google Maps ile Başlat
            </button>
            <button
              onClick={() => onSelectStop(activePinStop.stop)}
              className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-extrabold flex items-center justify-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5" /> Detaylar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [appState, setAppState] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [focusedStopId, setFocusedStopId] = useState(null);
  const [mainView, setMainView] = useState("timeline");
  const [darkMode, setDarkMode] = useState(false);

  const [activeModal, setActiveModal] = useState(null);
  const [detailStop, setDetailStop] = useState(null);
  const [editingStop, setEditingStop] = useState(null);

  const [authTab, setAuthTab] = useState("guest");
  const [guestName, setGuestName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [adminPinInput, setAdminPinInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [newNoteText, setNewNoteText] = useState("");
  const [newPinValue, setNewPinValue] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("japan_theme") === "dark";
    setDarkMode(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme);
    bootstrapApp();
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("japan_theme", next ? "dark" : "light");
  };

  const bootstrapApp = async () => {
    let loaded = JSON.parse(JSON.stringify(DEFAULT_DATA));
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (res.ok) {
        const srv = await res.json();
        if (srv.users) setRegisteredUsers(srv.users);
        if (srv && srv.days && srv.days.length > 0) {
          loaded = srv;
        } else {
          await fetch("/api/state", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loaded)
          });
        }
      }
    } catch (e) {}

    try {
      const rRes = await fetch("/api/rate");
      if (rRes.ok) {
        const rData = await rRes.json();
        if (rData.rate) loaded.exchangeRate = rData.rate;
      }
    } catch (e) {}

    setAppState(loaded);

    const token = getOrCreateDeviceToken();
    if (localStorage.getItem("japan_admin_unlocked") === "true") {
      setCurrentUser({ role: "admin", name: "Admin", device_token: token });
      setLoadingAuth(false);
    } else {
      try {
        const vRes = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ device_token: token })
        });
        if (vRes.ok) {
          const vData = await vRes.json();
          if (vData.users) setRegisteredUsers(vData.users);
          if (vData.authenticated && vData.user) {
            setCurrentUser({ role: "guest", ...vData.user });
          }
        }
      } catch (e) {}
      setLoadingAuth(false);
    }

    try {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${proto}//${window.location.host}/ws`);
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === "state_update" && msg.state) {
            setAppState(msg.state);
            if (msg.state.users) setRegisteredUsers(msg.state.users);
          } else if (msg.type === "users_update" && msg.users) {
            setRegisteredUsers(msg.users);
          }
        } catch (e) {}
      };
    } catch (e) {}
  };

  const persistState = async (nextState) => {
    setAppState(nextState);
    try {
      await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextState)
      });
    } catch (e) {}
  };

  const handleGuestSubmit = async () => {
    setAuthError("");
    if (!guestName.trim()) {
      setAuthError("Lütfen adınızı ve soyadınızı girin.");
      return;
    }
    const token = getOrCreateDeviceToken();
    try {
      const res = await fetch("/api/auth/register_or_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: guestName.trim(),
          device_token: token,
          avatar_base64: avatarPreview
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Giriş başarısız.");
        return;
      }
      if (data.users) setRegisteredUsers(data.users);
      setCurrentUser({ role: "guest", ...data.user });
    } catch (e) {
      setAuthError("Sunucuya bağlanılamadı.");
    }
  };

  const handleAdminSubmit = () => {
    setAuthError("");
    if (adminPinInput.trim() !== (appState?.adminPin || "2026")) {
      setAuthError("Hatalı Admin PIN kodu!");
      return;
    }
    localStorage.setItem("japan_admin_unlocked", "true");
    setCurrentUser({ role: "admin", name: "Admin", device_token: getOrCreateDeviceToken() });
  };

  const handleAvatarChange = async (e, isUpdate = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await compressImage(file);
    if (!isUpdate) {
      setAvatarPreview(b64);
    } else if (currentUser?.device_token) {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_token: currentUser.device_token, avatar_base64: b64
                });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(prev => ({ ...prev, ...data.user }));
        if (data.users) setRegisteredUsers(data.users);
      }
    }
  };

  if (!appState || loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-sm font-extrabold text-slate-500">Japonya Rotamız Yükleniyor...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[32px] max-w-md w-full p-6 shadow-2xl border border-white/60 dark:border-slate-800 max-h-[92vh] overflow-y-auto"
        >
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[11px] font-extrabold uppercase mb-1.5">
              26 Kas – 06 Ara 2026
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Japonya Rotamız 🇯🇵</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tokyo & Osaka • Cihaz Kilitli Grup Rehberi</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3.5 mb-4 border border-slate-200/70 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
              <span>Kayıtlı Yolcular</span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold">
                {registeredUsers.length} / 4
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {registeredUsers.length === 0 ? (
                <span className="text-slate-400 italic">Henüz kayıtlı cihaz yok.</span>
              ) : (
                registeredUsers.map(u => (
                  <div key={u.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold">
                    {u.avatar_url ? <img src={u.avatar_url} className="w-4 h-4 rounded-full object-cover" /> : <span>👤</span>}
                    <span>{u.name}</span>
                    <Lock className="w-3 h-3 text-emerald-500" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-4">
            <button onClick={() => { setAuthTab("guest"); setAuthError(""); }} className={`py-2.5 rounded-xl text-xs font-extrabold transition ${authTab === "guest" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"}`}>
              👤 Yolcu Girişi
            </button>
            <button onClick={() => { setAuthTab("admin"); setAuthError(""); }} className={`py-2.5 rounded-xl text-xs font-extrabold transition ${authTab === "admin" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"}`}>
              👑 Admin Girişi
            </button>
          </div>

          {authTab === "guest" ? (
            <div className="space-y-3">
              <div className="flex flex-col items-center">
                <label className="cursor-pointer relative">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-sky-400 flex flex-col items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-sky-500" />
                        <span className="text-[9px] font-extrabold text-slate-500 mt-1">Fotoğraf Seç</span>
                      </>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-extrabold flex items-center justify-center shadow">+</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarChange(e, false)} />
                </label>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase mb-1">Adınız Soyadınız</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="Örn: Aykut Avcı"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold"
                />
              </div>
              {authError && <p className="text-xs text-rose-500 font-bold">{authError}</p>}
              <button onClick={handleGuestSubmit} className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-rose-600 text-white font-extrabold text-sm shadow-lg">
                Cihazımı Kaydet & Giriş Yap ↗
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase mb-1">Admin PIN Kodu</label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={adminPinInput}
                  onChange={e => setAdminPinInput(e.target.value)}
                  placeholder="PIN (Varsayılan: 2026)"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold"
                />
              </div>
              {authError && <p className="text-xs text-rose-500 font-bold">{authError}</p>}
              <button onClick={handleAdminSubmit} className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white font-extrabold text-sm shadow-lg">
                Yönetici Olarak Gir ↗
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  const isAdmin = currentUser.role === "admin";
  const rate = appState.exchangeRate || 0.316;
  const fmtJpy = (v) => "¥" + Math.round(v || 0).toLocaleString("tr-TR");
  const fmtTry = (v) => "₺" + Math.round((v || 0) * rate).toLocaleString("tr-TR");

  const getStopTotal = (st) => {
    const m = st.modes?.[st.selectedMode || st.recommendedMode || "train"] || { cost4: 0 };
    return (Number(st.cost4) || 0) + (Number(m.cost4) || 0);
  };

  let grandTransport = 0, grandActivity = 0;
  appState.days.forEach(d => d.stops.forEach(st => {
    grandActivity += Number(st.cost4) || 0;
    grandTransport += Number(st.modes?.[st.selectedMode || st.recommendedMode || "train"]?.cost4) || 0;
  }));
  const grandTotal = grandTransport + grandActivity;

  const currentDayObj = appState.days.find(d => d.dayNum === selectedDay) || appState.days[0];

  const toggleComplete = (stopId) => {
    if (!isAdmin) return;
    const next = {
      ...appState,
      days: appState.days.map(d => ({
        ...d,
        stops: d.stops.map(s => s.id === stopId ? { ...s, completed: !s.completed } : s)
      }))
    };
    persistState(next);
  };

  const changeTransport = (stopId, mode) => {
    if (!isAdmin) return;
    const next = {
      ...appState,
      days: appState.days.map(d => ({
        ...d,
        stops: d.stops.map(s => s.id === stopId ? { ...s, selectedMode: mode } : s)
      }))
    };
    persistState(next);
  };

  const moveStopOrder = (idx, dir) => {
    if (!isAdmin) return;
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= currentDayObj.stops.length) return;
    const newStops = [...currentDayObj.stops];
    [newStops[idx], newStops[targetIdx]] = [newStops[targetIdx], newStops[idx]];
    const next = {
      ...appState,
      days: appState.days.map(d => d.dayNum === selectedDay ? { ...d, stops: newStops } : d)
    };
    persistState(next);
  };

  const deleteStopItem = (stopId) => {
    if (!isAdmin || !window.confirm("Bu durağı silmek istiyor musunuz?")) return;
    const next = {
      ...appState,
      days: appState.days.map(d => d.dayNum === selectedDay ? { ...d, stops: d.stops.filter(s => s.id !== stopId) } : d)
    };
    persistState(next);
  };

  const saveStopModal = () => {
    if (!editingStop) return;
    const isNew = !editingStop.id;
    const prepared = {
      ...editingStop,
      id: editingStop.id || `custom_${Date.now()}`,
      cost4: Number(editingStop.cost4) || 0,
      selectedMode: editingStop.recommendedMode || "train"
    };
    const next = {
      ...appState,
      days: appState.days.map(d => {
        if (d.dayNum !== selectedDay) return d;
        const list = isNew ? [...d.stops, prepared] : d.stops.map(s => s.id === prepared.id ? prepared : s);
        return { ...d, stops: list };
      })
    };
    persistState(next);
    setEditingStop(null);
  };

  const addNote = () => {
    if (!newNoteText.trim()) return;
    const item = {
      id: Date.now(),
      author: currentUser.name,
      text: newNoteText.trim(),
      time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    };
    persistState({ ...appState, groupNotes: [item, ...(appState.groupNotes || [])] });
    setNewNoteText("");
  };

  const deleteNote = (id) => {
    persistState({ ...appState, groupNotes: (appState.groupNotes || []).filter(n => n.id !== id) });
  };

  const removeRegisteredDevice = async (userId) => {
    if (!window.confirm("Bu kullanıcının cihaz kilidi kaldırılacak. Emin misiniz?")) return;
    const res = await fetch("/api/admin/remove_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, admin_pin: appState.adminPin || "2026" })
    });
    if (res.ok) {
      const data = await res.json();
      setRegisteredUsers(data.users || []);
    }
  };

  const focusStopCard = (stopId) => {
    setFocusedStopId(stopId);
    const el = document.getElementById(`stop-card-${stopId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const avatarColors = ["bg-rose-600", "bg-indigo-600", "bg-amber-500", "bg-emerald-600"];

  return (
    <div className="min-h-screen">
      {/* CLEAN TURKISH HEADER */}
      <header className="max-w-2xl mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* 4-Member Circular Photo Avatars */}
          <div className="flex items-center -space-x-2">
            {[0, 1, 2, 3].map(idx => {
              const u = registeredUsers[idx];
              if (!u) {
                return (
                  <div key={idx} className="w-9 h-9 rounded-full bg-white/80 dark:bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 border border-dashed border-slate-300 dark:border-slate-600">
                    ?
                  </div>
                );
              }
              return u.avatar_url ? (
                <img
                  key={u.id}
                  onClick={() => !isAdmin && setActiveModal("profile")}
                  src={u.avatar_url}
                  alt={u.name}
                  title={u.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-xs cursor-pointer"
                />
              ) : (
                <div
                  key={u.id}
                  onClick={() => !isAdmin && setActiveModal("profile")}
                  className={`w-9 h-9 rounded-full ${avatarColors[idx]} text-white text-xs font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs cursor-pointer`}
                >
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setActiveModal("notes")} className="glass-card px-3 h-9 rounded-full border border-white/80 dark:border-slate-700/80 text-xs font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs active:scale-95 transition">
              <span>📌</span>
              <span>Not ({(appState.groupNotes || []).length})</span>
            </button>
            <button onClick={() => setActiveModal("cards")} className="glass-card px-3 h-9 rounded-full border border-white/80 dark:border-slate-700/80 text-xs font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs active:scale-95 transition">
              <span>🗣️</span>
              <span>Kartlar</span>
            </button>
            <button onClick={toggleTheme} className="glass-card w-9 h-9 rounded-full border border-white/80 dark:border-slate-700/80 text-slate-700 dark:text-amber-300 flex items-center justify-center shadow-2xs active:scale-95 transition">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Clean Turkish Title */}
        <div className="mb-3" onClick={() => !isAdmin && setActiveModal("profile")}>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span>{isAdmin ? "👑 Admin Modu" : `👤 ${currentUser.name}`}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>• 26 Kas – 6 Ara • Tokyo & Osaka</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Japonya Rotamız 🇯🇵
          </h1>
        </div>

        {/* Horizontal Day Selector Pills */}
        <div className="overflow-x-auto no-scrollbar flex gap-1.5 pb-2">
          {appState.days.map(d => {
            const active = d.dayNum === selectedDay;
            const done = d.stops.length > 0 && d.stops.every(s => s.completed);
            return (
              <button
                key={d.dayNum}
                onClick={() => { setSelectedDay(d.dayNum); setFocusedStopId(null); }}
                className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-extrabold border transition flex items-center gap-1 ${
                  active
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "glass-card text-slate-600 dark:text-slate-300 border-white/80 dark:border-slate-800"
                }`}
              >
                <span>{d.dayNum}. Gün</span>
                <span className="text-[10px] opacity-80">{d.date.split(" ")[0]} {d.date.split(" ")[1].slice(0, 3)}</span>
                {done && <span>✅</span>}
              </button>
            );
          })}
        </div>

        {/* Segmented Control: Timeline vs Interactive Map */}
        <div className="glass-card p-1 rounded-2xl border border-white/80 dark:border-slate-800 grid grid-cols-2 gap-1 shadow-2xs mt-1">
          <button
            onClick={() => setMainView("timeline")}
            className={`py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
              mainView === "timeline"
                ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Zaman Çizelgesi
          </button>
          <button
            onClick={() => setMainView("map")}
            className={`py-2 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
              mainView === "map"
                ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Harita Görünümü
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      {mainView === "map" ? (
        <section className="max-w-2xl mx-auto px-4 pt-2">
          <InteractiveRouteMap dayObj={currentDayObj} onSelectStop={(st) => setDetailStop(st)} />
        </section>
      ) : (
        <main className="max-w-2xl mx-auto px-4 pt-2 space-y-4">
          {/* HORIZONTAL SCROLLABLE CINEMATIC SHOWCASE CARDS */}
          <div className="overflow-x-auto no-scrollbar flex gap-2.5 pb-1">
            {currentDayObj.stops.map((st, idx) => (
              <div
                key={st.id}
                onClick={() => focusStopCard(st.id)}
                className={`relative w-36 h-44 rounded-[24px] overflow-hidden shrink-0 cursor-pointer shadow-md border-2 transition ${
                  focusedStopId === st.id ? "border-blue-500 scale-[1.02]" : "border-white/60 dark:border-slate-800"
                }`}
              >
                <img src={LANDMARK_PHOTOS[st.visual] || LANDMARK_PHOTOS.castle} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent" />
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-xs text-white text-[10px] font-extrabold">
                  {idx + 1} • {st.time}
                </div>
                {st.completed && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div className="absolute bottom-2.5 inset-x-2.5 text-white">
                  <div className="text-[10px] text-white/75 font-bold">{VISUAL_KANJI[st.visual] || "日本"}</div>
                  <div className="text-xs font-extrabold leading-tight line-clamp-2 mt-0.5">{st.title}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Day Summary Banner */}
          <div className="glass-card rounded-[24px] p-4 border border-white/80 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  {currentDayObj.city}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  ⚡ {currentDayObj.fatigue}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                {currentDayObj.dayNum}. Gün: {currentDayObj.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{currentDayObj.date}</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setEditingStop({
                  id: "", time: "15:00", type: "sight", visual: "castle", title: "", desc: "",
                  cost4: 0, coords: "", distanceSummary: "2 km • 10 dk", recommendedMode: "train",
                  modes: {
                    train: { cost4: 0, note: "Metro / Tren" },
                    taxi: { cost4: 0, note: "4 Kişi Taksi" },
                    bus: { cost4: 0, note: "Otobüs" },
                    walk: { cost4: 0, note: "Yürüyüş" }
                  }
                })}
                className="px-3.5 py-2 rounded-full bg-slate-900 dark:bg-blue-600 text-white text-xs font-extrabold shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Durak
              </button>
            )}
          </div>

          {/* Clean Itinerary Stop Cards */}
          <div className="space-y-3.5">
            {currentDayObj.stops.map((stop, idx) => {
              const modeKey = stop.selectedMode || stop.recommendedMode || "train";
              const recKey = stop.recommendedMode || "train";
              const activeMode = stop.modes?.[modeKey] || { cost4: 0, note: "" };
              const total4 = getStopTotal(stop);
              const modeNames = { train: "Tren / Metro", taxi: "Taksi (4 Kişi)", bus: "Otobüs", walk: "Yürüyüş" };

              return (
                <motion.div
                  id={`stop-card-${stop.id}`}
                  key={stop.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glass-card rounded-[26px] border overflow-hidden transition shadow-2xs ${
                    focusedStopId === stop.id
                      ? "ring-2 ring-blue-500 border-blue-400"
                      : stop.completed
                        ? "border-emerald-300 dark:border-emerald-800 opacity-75"
                        : "border-white/90 dark:border-slate-800"
                  }`}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={LANDMARK_PHOTOS[stop.visual] || LANDMARK_PHOTOS.castle}
                        alt=""
                        onClick={() => setDetailStop(stop)}
                        className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-xs cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-extrabold">{stop.time}</span>
                            {stop.distanceSummary && <span className="text-[10px] font-bold text-slate-400">📏 {stop.distanceSummary}</span>}
                          </div>
                          <button
                            onClick={() => toggleComplete(stop.id)}
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                              stop.completed
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : isAdmin
                                  ? "border-slate-300 dark:border-slate-600 text-transparent hover:border-blue-500"
                                  : "border-slate-200 dark:border-slate-700 text-transparent cursor-default"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className={`text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug mt-1 ${stop.completed ? "line-through text-slate-400" : ""}`}>
                          {stop.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{stop.desc}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => setDetailStop(stop)}
                        className="px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 text-[11px] font-extrabold"
                      >
                        ℹ️ Mekan Rehberi
                      </button>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">{fmtJpy(total4)}</span>
                        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 ml-1">{fmtTry(total4)}</span>
                      </div>
                    </div>

                    {/* 4-Mode Transport Selector */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-4 gap-1.5">
                      {[
                        { key: "train", label: "Tren", Icon: Train },
                        { key: "taxi", label: "Taksi", Icon: Car },
                        { key: "bus", label: "Otobüs", Icon: Bus },
                        { key: "walk", label: "Yürü", Icon: Footprints }
                      ].map(({ key, label, Icon }) => {
                        const active = modeKey === key;
                        const isRec = recKey === key;
                        const cost = stop.modes?.[key]?.cost4 ?? 0;
                        return (
                          <button
                            key={key}
                            onClick={() => changeTransport(stop.id, key)}
                            className={`relative py-2 px-1 rounded-2xl text-[11px] font-extrabold border flex flex-col items-center transition ${
                              active
                                ? "bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-xs"
                                : isAdmin
                                  ? "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700"
                                  : "bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 border-slate-100 dark:border-slate-800 cursor-default"
                            }`}
                          >
                            {isRec && <span className="absolute -top-1.5 right-1 px-1 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black">⭐</span>}
                            <div className="flex items-center gap-1"><Icon className="w-3 h-3" /> {label}</div>
                            <span className={`text-[10px] mt-0.5 ${active ? "text-slate-200" : "text-slate-500"}`}>{cost === 0 ? "¥0" : fmtJpy(cost)}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Route Note & Google Maps App Launcher */}
                    <div className="bg-slate-100/80 dark:bg-slate-800/70 p-3 rounded-2xl space-y-2">
                      <div className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed">
                        <span className="font-extrabold text-blue-700 dark:text-blue-400">Rota:</span> {activeMode.note}
                      </div>
                      <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-200/70 dark:border-slate-700">
                        <button
                          onClick={() => openGoogleMapsNative(stop)}
                          className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-extrabold text-xs text-center shadow-2xs flex items-center justify-center gap-1.5 active:scale-[0.99] transition"
                        >
                          <Navigation className="w-3.5 h-3.5" /> Google Maps'te Aç ({modeNames[modeKey]})
                        </button>
                        {isAdmin && (
                          <>
                            <button onClick={() => moveStopOrder(idx, -1)} disabled={idx === 0} className="p-2 rounded-xl bg-white dark:bg-slate-900 disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                            <button onClick={() => moveStopOrder(idx, 1)} disabled={idx === currentDayObj.stops.length - 1} className="p-2 rounded-xl bg-white dark:bg-slate-900 disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditingStop(stop)} className="p-2 rounded-xl bg-white dark:bg-slate-900"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteStopItem(stop.id)} className="p-2 rounded-xl bg-white dark:bg-slate-900 text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </main>
      )}

      {/* FLOATING PILL NAVIGATION DOCK */}
      <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <nav className="floating-dock pointer-events-auto rounded-full px-3 py-2 border border-white/80 dark:border-slate-700/80 flex items-center gap-1.5">
          <button
            onClick={() => { setMainView("timeline"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className={`px-3.5 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition ${
              mainView === "timeline" ? "bg-slate-900 dark:bg-blue-600 text-white" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <Compass className="w-4 h-4" /> Plan
          </button>
          <button
            onClick={() => setMainView("map")}
            className={`px-3.5 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition ${
              mainView === "map" ? "bg-slate-900 dark:bg-blue-600 text-white" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <MapPin className="w-4 h-4" /> Harita
          </button>
          <button
            onClick={() => setActiveModal("budget")}
            className="px-3.5 py-2 rounded-full text-slate-600 dark:text-slate-300 text-xs font-extrabold flex items-center gap-1.5"
          >
            <Wallet className="w-4 h-4" /> Bütçe
          </button>
          <button
            onClick={() => setActiveModal("tips")}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300"
            title="İpuçları"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveModal("settings")}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300"
            title="Ayarlar"
          >
            <Settings className="w-4 h-4" />
          </button>
        </nav>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {activeModal === "budget" && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold">11 Günlük Bütçe (4 Kişi)</h3>
                  <p className="text-[11px] text-slate-500">1 ¥ = {rate.toFixed(3)} ₺ (Canlı Kur)</p>
                </div>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60">
                    <div className="text-[10px] font-bold text-indigo-600">Ulaşım (4 Kişi)</div>
                    <div className="text-sm font-extrabold mt-0.5">{fmtJpy(grandTransport)}</div>
                    <div className="text-[11px] font-bold text-indigo-700">{fmtTry(grandTransport)}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60">
                    <div className="text-[10px] font-bold text-rose-600">Giriş & Yemek</div>
                    <div className="text-sm font-extrabold mt-0.5">{fmtJpy(grandActivity)}</div>
                    <div className="text-[11px] font-bold text-rose-700">{fmtTry(grandActivity)}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-600 text-white">
                    <div className="text-[10px] font-bold text-emerald-100">GENEL TOPLAM</div>
                    <div className="text-sm font-extrabold mt-0.5">{fmtJpy(grandTotal)}</div>
                    <div className="text-[11px] font-bold text-emerald-100">{fmtTry(grandTotal)}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-extrabold text-violet-900 dark:text-violet-300">📷 Kamera & Alışveriş Bütçesi (¥)</div>
                    <div className="text-[11px] text-violet-700">Karşılığı: {fmtTry(appState.shoppingBudgetJpy || 0)}</div>
                  </div>
                  <input
                    type="number"
                    step="5000"
                    value={appState.shoppingBudgetJpy || ""}
                    onChange={(e) => persistState({ ...appState, shoppingBudgetJpy: Number(e.target.value) || 0 })}
                    placeholder="150000"
                    className="w-28 px-3 py-2 rounded-xl border border-violet-300 dark:border-violet-700 bg-white dark:bg-slate-800 font-extrabold text-right"
                  />
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 font-bold">
                      <tr><th className="p-2.5">Gün</th><th className="p-2.5">Ulaşım</th><th className="p-2.5">Aktivite</th><th className="p-2.5 text-right">Toplam</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {appState.days.map(d => {
                        const tr = d.stops.reduce((a, s) => a + (Number(s.modes?.[s.selectedMode || s.recommendedMode || "train"]?.cost4) || 0), 0);
                        const ac = d.stops.reduce((a, s) => a + (Number(s.cost4) || 0), 0);
                        return (
                          <tr key={d.dayNum}>
                            <td className="p-2.5 font-extrabold">{d.dayNum}. Gün</td>
                            <td className="p-2.5">{fmtJpy(tr)}</td>
                            <td className="p-2.5">{fmtJpy(ac)}</td>
                            <td className="p-2.5 text-right font-extrabold">{fmtJpy(tr + ac)} <span className="block text-[10px] text-emerald-600">{fmtTry(tr + ac)}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {detailStop && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="relative h-48 bg-slate-900 text-white flex flex-col justify-end p-5">
                <img src={LANDMARK_PHOTOS[detailStop.visual] || LANDMARK_PHOTOS.castle} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
                <button onClick={() => setDetailStop(null)} className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center"><X className="w-4 h-4" /></button>
                <div className="relative z-10">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold">Saat {detailStop.time}</span>
                  <h3 className="text-lg font-extrabold mt-1">{detailStop.title}</h3>
                </div>
              </div>
              <div className="p-5 overflow-y-auto space-y-3 text-xs leading-relaxed">
                <p className="text-slate-600 dark:text-slate-300">{detailStop.longDesc || detailStop.desc}</p>
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50">
                  <div className="font-extrabold text-indigo-900 dark:text-indigo-300 mb-1">✨ Mutlaka Yapılması Gerekenler</div>
                  <p>{detailStop.highlights || "Bölge gezisi ve fotoğraf noktaları."}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40">
                  <div className="font-extrabold text-amber-900 dark:text-amber-300 mb-1">⚖️ Ulaşım Analizi</div>
                  <p>{detailStop.transportReason || "Fiyat ve süre dengesine göre önerilmiştir."}</p>
                </div>
                <button onClick={() => openGoogleMapsNative(detailStop)} className="w-full py-3 rounded-2xl bg-blue-600 text-white font-extrabold text-center shadow flex items-center justify-center gap-1.5">
                  <Navigation className="w-4 h-4" /> Google Maps'te Aç
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeModal === "notes" && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-extrabold">📌 Ortak Grup Panosu</h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 overflow-y-auto space-y-2.5 flex-1 text-xs">
                {(appState.groupNotes || []).map(n => (
                  <div key={n.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-extrabold text-indigo-600">{n.author} • {n.time}</div>
                      <div className="mt-0.5 font-medium">{n.text}</div>
                    </div>
                    {(isAdmin || currentUser.name === n.author) && (
                      <button onClick={() => deleteNote(n.id)} className="text-rose-500 font-bold">✕</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  placeholder="Grup notu yaz..."
                  className="flex-1 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
                <button onClick={addNote} className="px-4 py-2.5 rounded-2xl bg-blue-600 text-white font-extrabold text-xs">Gönder</button>
              </div>
            </motion.div>
          </div>
        )}

        {activeModal === "cards" && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-extrabold">🗣️ Japonca "Göster & Geç" Kartları</h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 overflow-y-auto space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900 text-white">
                  <div className="text-[10px] font-bold text-rose-400">🚕 Taksi Şoförüne: Tokyo Evimiz</div>
                  <div className="text-base font-extrabold mt-1">東京都足立区千住寿町 19-3</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">北千住駅の近くまでお願いします。</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 text-white">
                  <div className="text-[10px] font-bold text-amber-400">🚕 Taksi Şoförüne: Osaka Evimiz</div>
                  <div className="text-base font-extrabold mt-1">大阪府大阪市西成区岸里 3-5-6</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">岸里駅の近くまでお願いします。</div>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900">
                  <div className="text-[10px] font-extrabold text-indigo-600">📷 Bic Camera / Yodobashi Kasa</div>
                  <div className="text-sm font-extrabold mt-1">免税（Tax-Free）と観光客クーポンを使いたいです。</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Vergi iadesi ve turist kuponunu kullanmak istiyorum.</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeModal === "tips" && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-extrabold">💡 Japonya 2026 Altın İpuçları</h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 overflow-y-auto space-y-3 text-xs leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40">
                  <div className="font-extrabold text-violet-900 dark:text-violet-300 mb-1">📷 1. Bic Camera Yurakucho (27 Kas 10:00)</div>
                  Pasaportunuzun fiziksel aslını göstererek %10 Tax-Free + Google turist kuponu ile ekstra %5–7 indirim alabilirsiniz.
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40">
                  <div className="font-extrabold text-amber-900 dark:text-amber-300 mb-1">🚕 2. 4 Kişi Taksi & Otomatik Kapı</div>
                  Tokyo'da açılış ¥500, Osaka'da ¥600'dür. Arka kapı otomatik açılır/kapanır, kapıya el sürmeyin.
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40">
                  <div className="font-extrabold text-rose-900 dark:text-rose-300 mb-1">🏎️ 3. Tokyo Drift & Oi Bit Pazarı</div>
                  Cuma gecesi Shibuya Center-Gai neon drift caddesi, Cumartesi sabahı ise Oi Racecourse Bit Pazarı için yanınızda nakit Yen bulundurun.
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeModal === "profile" && !isAdmin && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-[32px] max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold">Profil Kartım</h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-3xl font-extrabold">
                {currentUser.avatar_url ? <img src={currentUser.avatar_url} className="w-full h-full object-cover" /> : currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-extrabold">{currentUser.name}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-0.5">🔒 Bu cihaza kalıcı olarak kilitli</div>
              </div>
              <label className="block w-full py-3 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-extrabold cursor-pointer">
                📸 Profil Fotoğrafını Değiştir
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarChange(e, true)} />
              </label>
            </motion.div>
          </div>
        )}

        {activeModal === "settings" && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] max-w-md w-full p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-extrabold">Sistem & Cihaz Yönetimi</h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="text-xs space-y-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 font-bold">Aktif Oturum</div>
                    <div className="font-extrabold mt-0.5">{isAdmin ? "👑 Admin Modu" : `👤 ${currentUser.name}`}</div>
                  </div>
                  {!isAdmin && (
                    <button onClick={() => setActiveModal("profile")} className="px-3 py-1.5 rounded-xl bg-indigo-100 text-indigo-700 font-extrabold">Profilim</button>
                  )}
                </div>

                {isAdmin && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="font-extrabold mb-1.5">Cihaz Kilitli Yolcular</div>
                      <div className="space-y-1.5">
                        {registeredUsers.map((u, i) => (
                          <div key={u.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl">
                            <span className="font-bold">{i + 1}. {u.name}</span>
                            <button onClick={() => removeRegisteredDevice(u.id)} className="text-rose-600 font-extrabold">Kilidi Sil</button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newPinValue} onChange={e => setNewPinValue(e.target.value)} placeholder="Yeni Admin PIN" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
                      <button
                        onClick={() => {
                          if (newPinValue.trim().length >= 4) {
                            persistState({ ...appState, adminPin: newPinValue.trim() });
                            setNewPinValue("");
                            alert("Admin PIN güncellendi!");
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 text-white font-bold"
                      >
                        PIN Güncelle
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm("Plan varsayılan verilere sıfırlansın mı?")) {
                          persistState({ ...DEFAULT_DATA, adminPin: appState.adminPin, exchangeRate: appState.exchangeRate });
                          setActiveModal(null);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 font-extrabold"
                    >
                      Varsayılan Plana Sıfırla
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (isAdmin) {
                      localStorage.removeItem("japan_admin_unlocked");
                      window.location.reload();
                    } else {
                      setActiveModal(null);
                      setAuthTab("admin");
                      setCurrentUser(null);
                    }
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white font-extrabold"
                >
                  {isAdmin ? "🚪 Admin Modundan Çık" : "👑 Admin Moduna Geç"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {editingStop && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-extrabold">{editingStop.id ? "Durağı Düzenle" : "Yeni Durak Ekle"}</h3>
                <button onClick={() => setEditingStop(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 overflow-y-auto space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={editingStop.time} onChange={e => setEditingStop({ ...editingStop, time: e.target.value })} placeholder="Saat (09:30)" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-bold" />
                  <input type="text" value={editingStop.coords || ""} onChange={e => setEditingStop({ ...editingStop, coords: e.target.value })} placeholder="GPS (35.75,139.79)" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-mono" />
                </div>
                <input type="text" value={editingStop.title} onChange={e => setEditingStop({ ...editingStop, title: e.target.value })} placeholder="Mekan Adı" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-bold" />
                <textarea rows="2" value={editingStop.desc} onChange={e => setEditingStop({ ...editingStop, desc: e.target.value })} placeholder="Açıklama" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={editingStop.cost4} onChange={e => setEditingStop({ ...editingStop, cost4: e.target.value })} placeholder="Giriş/Yemek 4 Kişi ¥" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
                  <select value={editingStop.recommendedMode || "train"} onChange={e => setEditingStop({ ...editingStop, recommendedMode: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-bold">
                    <option value="train">🚆 Önerilen: Tren</option>
                    <option value="taxi">🚕 Önerilen: Taksi</option>
                    <option value="bus">🚌 Önerilen: Otobüs</option>
                    <option value="walk">🚶 Önerilen: Yürüyüş</option>
                  </select>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button onClick={() => setEditingStop(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs">İptal</button>
                <button onClick={saveStopModal} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xs">Kaydet</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


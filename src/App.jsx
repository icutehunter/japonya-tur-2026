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
  flight: "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=800&q=80",
  home: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
  food: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
  shinkansen: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=800&q=80",
  osaka_night: "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80",
  usj: "https://images.unsplash.com/photo-1624601573012-efb68931cc8f?auto=format&fit=crop&w=800&q=80",
  nara: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80",
  castle: "https://images.unsplash.com/photo-1590253230532-a67f6bc61c9e?auto=format&fit=crop&w=800&q=80",
  disney: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=800&q=80",
  harry: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?auto=format&fit=crop&w=800&q=80",
  shopping: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
  wagyu: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  shibuya: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80",
  drift: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
  flea: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80"
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
      stops: [
        {
          id: "d1_1", time: "19:30", visual: "flight", completed: false,
          title: "Haneda Havalimanı (HND) → Tokyo Evi",
          desc: "02:30 İstanbul uçuşu sonrası akşam varış. Pasaport, eSIM ve Apple Wallet Suica.",
          longDesc: "Tokyo Haneda Terminal 3'e iniş sonrası Visit Japan Web QR kodlarıyla hızlı geçiş. Terminal 3 geliş katında 7-Eleven ATM'den nakit Yen çekimi yapabilirsiniz.",
          cost4: 0, distanceSummary: "28.5 km • 40 dk", coords: TOKYO_COORDS,
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: {
            train: { cost4: 2680, note: "28.5 km • 52 dk | Keikyu → Shinagawa → JR Joban (2 aktarma)" },
            taxi: { cost4: 13200, note: "28.5 km • 40 dk | Otoban dahil direkt ev kapısına (4 kişi konforlu)" },
            bus: { cost4: 5200, note: "29 km • 55 dk | Limousine Bus → Kitasenju East Exit" },
            walk: { cost4: 0, note: "28.5 km • Uygun değil" }
          }
        },
        {
          id: "d1_2", time: "21:15", visual: "home", completed: false,
          title: "Tokyo Evi Check-in (Adachi)",
          desc: "Senjukotobukichō 19-3 (35.7534716, 139.7996485). Eve yerleşme ve dinlenme.",
          longDesc: "Kita-Senju merkezine 550 metre mesafedeki Tokyo eviniz.",
          cost4: 0, distanceSummary: "550 m • 7 dk yürüyüş", coords: TOKYO_COORDS,
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 0, note: "Yürüme mesafesi" },
            taxi: { cost4: 600, note: "550 m • 2 dk" },
            bus: { cost4: 0, note: "Yürüme mesafesi" },
            walk: { cost4: 0, note: "550 m • 7 dk düz yürüyüş" }
          }
        },
        {
          id: "d1_3", time: "22:00", visual: "food", completed: false,
          title: "Kita-Senju Ramen & Gyoza",
          desc: "Ev sokağındaki sıcak Tonkotsu Ramen dükkanlarında ilk Japonya akşam yemeği.",
          longDesc: "Kita-Senju çevresi yerel halkın tercih ettiği otantik ramen dükkanlarıyla ünlüdür.",
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
      fatigue: "Orta Tempo • Kamera & Shinkansen",
      title: "Bic Camera Yurakucho & Shinkansen ile Osaka",
      stops: [
        {
          id: "d2_1", time: "08:45", visual: "food", completed: false,
          title: "Kahvaltı: Tokyo İstasyonu / Yurakucho",
          desc: "Sırt çantalarıyla çıkış, Yurakucho'da kahvaltı ve Bic Camera açılışını bekleme.",
          longDesc: "Tokyo İstasyonu Marunouchi/Yurakucho çıkışında kahvaltı.",
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
          id: "d2_2", time: "10:00", visual: "shopping", completed: false,
          title: "Bic Camera Yurakucho (Kamera Alımı)",
          desc: "Tokyo İstasyonu'na 5 dk mesafedeki ana mağazadan kamera alımı (%10 Tax-Free + Kupon).",
          longDesc: "Pasaportun fiziksel aslı ile %10 Tax-Free + Google turist kuponu ile ekstra %5-7 indirim alın.",
          cost4: 0, distanceSummary: "450 m • 5 dk yürüyüş", coords: "35.6752,139.7634",
          recommendedMode: "walk", selectedMode: "walk",
          modes: {
            train: { cost4: 600, note: "1 durak (Gereksiz)" },
            taxi: { cost4: 500, note: "450 m • 2 dk" },
            bus: { cost4: 0, note: "Yürüme mesafesi" },
            walk: { cost4: 0, note: "450 m • 5 dk | Doğrudan Shinkansen gişelerine yürüyüş" }
          }
        },
        {
          id: "d2_3", time: "11:30", visual: "shinkansen", completed: false,
          title: "Shinkansen Nozomi: Tokyo → Shin-Osaka",
          desc: "11:30 hızlı treniyle Osaka'ya geçiş (2 sa 30 dk). Sağ cam (D-E) Fuji manzarası!",
          longDesc: "Ekiben öğle yemeği eşliğinde 2.5 saatte Shin-Osaka'ya konforlu yolculuk.",
          cost4: 5600, distanceSummary: "515 km • 2 sa 30 dk", coords: "34.7335,135.5003",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 58880, note: "515 km • 2 sa 30 dk | Shinkansen Nozomi (Kişi ¥14,720)" },
            taxi: { cost4: 59500, note: "İstasyona taksi + Shinkansen" },
            bus: { cost4: 28000, note: "515 km • 8 sa | Otoyol otobüsü" },
            walk: { cost4: 0, note: "Şehirler arası" }
          }
        },
        {
          id: "d2_4", time: "14:15", visual: "home", completed: false,
          title: "Osaka Evi Check-in (Kishinosato)",
          desc: "Kishinosato 3-5-6 (34.6303610, 135.4933890). Sırt çantalarını bırakma.",
          longDesc: "Yotsubashi metro hattıyla Namba ve Dotonbori'ye 4 durak mesafedeki eviniz.",
          cost4: 0, distanceSummary: "12.4 km • 32 dk metro", coords: OSAKA_COORDS,
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 1320, note: "12.4 km • 32 dk | Shin-Osaka → Namba → Kishinosato" },
            taxi: { cost4: 5400, note: "12.4 km • 25 dk | Direkt kapıya taksi" },
            bus: { cost4: 1200, note: "13 km • 50 dk | Otobüs" },
            walk: { cost4: 0, note: "12.4 km • 2 sa 35 dk" }
          }
        },
        {
          id: "d2_5", time: "16:00", visual: "osaka_night", completed: false,
          title: "Miracle World Osaka",
          desc: "Namba merkezindeki dijital sanat, ayna ve ışık illüzyon deneyimi.",
          longDesc: "Sonsuz ayna odaları ve dijital projeksiyon alanlarıyla yeni kameranız için harika çekim noktası.",
          cost4: 8800, distanceSummary: "4.1 km • 8 dk metro", coords: "34.6672,135.5028",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 960, note: "4.1 km • 8 dk | Kishinosato → Namba Yotsubashi Line" },
            taxi: { cost4: 1900, note: "4.1 km • 11 dk | 4 kişi taksi" },
            bus: { cost4: 840, note: "4.3 km • 20 dk | Otobüs" },
            walk: { cost4: 0, note: "4.1 km • 52 dk" }
          }
        },
        {
          id: "d2_6", time: "18:30", visual: "osaka_night", completed: false,
          title: "Dotonbori Akşam Turu & Sokak Lezzetleri",
          desc: "Glico tabelası, kanal gece çekimleri, Okonomiyaki ve Takoyaki ziyafeti.",
          longDesc: "Ebisubashi köprüsünde Glico gece fotoğrafı ve Dotonbori sokak lezzetleri.",
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
          id: "d2_7", time: "22:15", visual: "home", completed: false,
          title: "Kishinosato Eve Dönüş",
          desc: "Dotonbori'den Nishinari evinize gece dönüşü.",
          longDesc: "Gece yorgunluğunda kapıya kadar konforlu dönüş.",
          cost4: 0, distanceSummary: "4.3 km • 10 dk", coords: OSAKA_COORDS,
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: {
            train: { cost4: 960, note: "4.3 km • 8 dk | Namba → Kishinosato Metro" },
            taxi: { cost4: 2300, note: "4.3 km • 10 dk | Kapıya kadar direkt taksi" },
            bus: { cost4: 840, note: "4.5 km • 22 dk | Otobüs" },
            walk: { cost4: 0, note: "4.3 km • 54 dk" }
          }
        }
      ]
    },
    {
      dayNum: 3, date: "28 Kasım 2026, Cumartesi", city: "OSAKA",
      fatigue: "Yüksek Tempo • Tema Park Günü",
      title: "Universal Studios Japan (USJ) & Shinsekai",
      stops: [
        {
          id: "d3_1", time: "07:15", visual: "food", completed: false,
          title: "Kahvaltı: Kishinosato Konbini",
          desc: "USJ kapı açılışına yetişmek için taze Onigiri, sandviç ve kahve.",
          cost4: 2800, distanceSummary: "200 m • 3 dk", coords: "34.6295,135.4955",
          recommendedMode: "walk", selectedMode: "walk",
          modes: { train: { cost4: 0, note: "Yol üzeri" }, taxi: { cost4: 0, note: "Yol üzeri" }, bus: { cost4: 0, note: "Yol üzeri" }, walk: { cost4: 0, note: "200 m • 3 dk" } }
        },
        {
          id: "d3_2", time: "08:30", visual: "usj", completed: false,
          title: "Universal Studios Japan (USJ) Tam Gün",
          desc: "Super Nintendo World, Harry Potter ve Jurassic Park (4 Kişi Giriş).",
          longDesc: "Girişte USJ uygulamasından Super Nintendo World için Timed Entry Ticket almayı unutmayın.",
          cost4: 38400, distanceSummary: "10.2 km • 20 dk taksi", coords: "34.6654,135.4323",
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: {
            train: { cost4: 1760, note: "10.2 km • 35 dk | 2 aktarmalı tren" },
            taxi: { cost4: 4600, note: "10.2 km • 20 dk | Sabah açılışa aktarmasız kapıya" },
            bus: { cost4: 1600, note: "11 km • 45 dk | Otobüs" },
            walk: { cost4: 0, note: "2 sa 10 dk" }
          }
        },
        {
          id: "d3_3", time: "13:30", visual: "food", completed: false,
          title: "Öğle Yemeği: Three Broomsticks",
          desc: "Harry Potter köyünde Butterbeer eşliğinde öğle yemeği.",
          cost4: 9600, distanceSummary: "Park içi", coords: "34.6665,135.4305",
          recommendedMode: "walk", selectedMode: "walk",
          modes: { train: { cost4: 0, note: "Park içi" }, taxi: { cost4: 0, note: "Park içi" }, bus: { cost4: 0, note: "Park içi" }, walk: { cost4: 0, note: "Park içi 300 m" } }
        },
        {
          id: "d3_4", time: "19:30", visual: "osaka_night", completed: false,
          title: "Akşam Yemeği: Shinsekai & Tsutenkaku",
          desc: "Nostaljik neon mahallesi ve Kushikatsu Daruma.",
          cost4: 8400, distanceSummary: "9.4 km • 26 dk tren", coords: "34.6525,135.5063",
          recommendedMode: "train", selectedMode: "train",
          modes: {
            train: { cost4: 1640, note: "9.4 km • 26 dk | Universal City → Shin-Imamiya JR" },
            taxi: { cost4: 4200, note: "9.4 km • 18 dk | Taksi" },
            bus: { cost4: 1500, note: "10 km • 42 dk | Otobüs" },
            walk: { cost4: 0, note: "1 sa 55 dk" }
          }
        },
        {
          id: "d3_5", time: "21:45", visual: "home", completed: false,
          title: "Kishinosato Eve Dönüş",
          desc: "Shinsekai'den Nishinari evinize 6 dakikalık dönüş.",
          cost4: 0, distanceSummary: "2.1 km • 6 dk taksi", coords: OSAKA_COORDS,
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: {
            train: { cost4: 760, note: "2.1 km • 8 dk | Metro" },
            taxi: { cost4: 1200, note: "2.1 km • 6 dk | 4 kişi toplam ~¥1,200 (Kişi ¥300!)" },
            bus: { cost4: 840, note: "2.2 km • 12 dk | Otobüs" },
            walk: { cost4: 0, note: "25 dk yürüyüş" }
          }
        }
      ]
    },
    {
      dayNum: 4, date: "29 Kasım 2026, Pazar", city: "OSAKA",
      fatigue: "Orta Tempo • Doğa & Tarih",
      title: "Nara Geyikli Park, Osaka Kalesi & Aslan Tapınağı",
      stops: [
        {
          id: "d4_1", time: "08:30", visual: "food", completed: false,
          title: "Kahvaltı: Namba İstasyonu",
          desc: "USJ ertesi 08:30 rahat başlangıçla kahvaltı.",
          cost4: 4200, distanceSummary: "4.1 km • 8 dk metro", coords: "34.6669,135.5015",
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 960, note: "4.1 km • 8 dk | Kishinosato → Namba" }, taxi: { cost4: 1900, note: "11 dk taksi" }, bus: { cost4: 840, note: "20 dk otobüs" }, walk: { cost4: 0, note: "52 dk" } }
        },
        {
          id: "d4_2", time: "09:45", visual: "nara", completed: false,
          title: "Nara Park (Geyikli Park) & Todai-ji",
          desc: "1.200+ serbest geyik ve dünyanın en büyük ahşap yapısı Todai-ji.",
          cost4: 4000, distanceSummary: "34.5 km • 38 dk tren", coords: "34.6851,135.8430",
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 2720, note: "34.5 km • 38 dk | Kintetsu Rapid Express" }, taxi: { cost4: 15500, note: "45 dk taksi" }, bus: { cost4: 2600, note: "65 dk otobüs" }, walk: { cost4: 0, note: "Şehirler arası" } }
        },
        {
          id: "d4_3", time: "13:00", visual: "food", completed: false,
          title: "Öğle Yemeği: Nara Çarşısı & Nakatanidou Mochi",
          desc: "Nara güveç pilavı ve yeşil çaylı taze dövme Mochi.",
          cost4: 6800, distanceSummary: "900 m • 12 dk", coords: "34.6826,135.8286",
          recommendedMode: "walk", selectedMode: "walk",
          modes: { train: { cost4: 0, note: "Yürüme" }, taxi: { cost4: 700, note: "4 dk" }, bus: { cost4: 880, note: "5 dk" }, walk: { cost4: 0, note: "900 m • 12 dk yürüyüş" } }
        },
        {
          id: "d4_4", time: "15:15", visual: "castle", completed: false,
          title: "Osaka Kalesi & Sonbahar Bahçesi",
          desc: "Altın sarısı ginkgo ağaçları eşliğinde ikonik Japon kalesi.",
          cost4: 2400, distanceSummary: "31.0 km • 42 dk tren", coords: "34.6873,135.5262",
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 3200, note: "31 km • 42 dk | Kintetsu → Morinomiya" }, taxi: { cost4: 14200, note: "40 dk taksi" }, bus: { cost4: 3000, note: "70 dk otobüs" }, walk: { cost4: 0, note: "Şehirler arası" } }
        },
        {
          id: "d4_5", time: "17:30", visual: "castle", completed: false,
          title: "Namba Yasaka Jinja (Aslan Tapınağı)",
          desc: "12 metre yüksekliğinde devasa aslan ağzı sahnesiyle ünlü tapınak.",
          cost4: 0, distanceSummary: "5.2 km • 13 dk taksi", coords: "34.6612,135.4966",
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: { train: { cost4: 960, note: "22 dk metro" }, taxi: { cost4: 2300, note: "5.2 km • 13 dk | Direkt kapıya 4 kişi taksi" }, bus: { cost4: 840, note: "25 dk otobüs" }, walk: { cost4: 0, note: "1 sa 5 dk" } }
        },
        {
          id: "d4_6", time: "19:30", visual: "food", completed: false,
          title: "Akşam Yemeği: Namba Yakiniku & Eve Dönüş",
          desc: "Osaka'daki son akşam yemeği ve Nishinari evine dönüş.",
          cost4: 9200, distanceSummary: "3.8 km • 8 dk metro", coords: OSAKA_COORDS,
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 960, note: "3.8 km • 8 dk | Namba → Kishinosato" }, taxi: { cost4: 1800, note: "10 dk taksi" }, bus: { cost4: 840, note: "18 dk otobüs" }, walk: { cost4: 0, note: "48 dk" } }
        }
      ]
    },
    {
      dayNum: 5, date: "30 Kasım 2026, Pazartesi", city: "TOKYO",
      fatigue: "Orta Tempo • Transfer Günü",
      title: "Kuromon Pazarı, Umeda Sky & Tokyo'ya Dönüş",
      stops: [
        {
          id: "d5_1", time: "09:00", visual: "food", completed: false,
          title: "Kuromon Ichiba Pazarı Kahvaltısı",
          desc: "'Osaka'nın Mutfağı'nda deniz ürünleri, Wagyu şiş ve sabah kahvaltısı.",
          cost4: 8000, distanceSummary: "4.3 km • 10 dk metro", coords: "34.6654,135.5063",
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 960, note: "10 dk | Kishinosato → Namba" }, taxi: { cost4: 2000, note: "11 dk taksi" }, bus: { cost4: 840, note: "22 dk otobüs" }, walk: { cost4: 0, note: "54 dk" } }
        },
        {
          id: "d5_2", time: "11:30", visual: "shibuya", completed: false,
          title: "Umeda Sky Building Gözlemevi",
          desc: "173 metre yükseklikte açık hava köprüsü ve Osaka panoraması.",
          cost4: 6000, distanceSummary: "5.4 km • 14 dk metro", coords: "34.7052,135.4897",
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 960, note: "14 dk | Namba → Umeda" }, taxi: { cost4: 2400, note: "14 dk taksi" }, bus: { cost4: 840, note: "28 dk otobüs" }, walk: { cost4: 0, note: "1 sa 8 dk" } }
        },
        {
          id: "d5_3", time: "13:30", visual: "food", completed: false,
          title: "Öğle Yemeği: Shin-Osaka Katsu Curry",
          desc: "Shinkansen öncesi istasyon içinde doyurucu Japon köri yemeği.",
          cost4: 5600, distanceSummary: "3.9 km • 6 dk metro", coords: "34.7335,135.5003",
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 760, note: "6 dk | Umeda → Shin-Osaka" }, taxi: { cost4: 1800, note: "10 dk taksi" }, bus: { cost4: 840, note: "18 dk otobüs" }, walk: { cost4: 0, note: "48 dk" } }
        },
        {
          id: "d5_4", time: "15:00", visual: "shinkansen", completed: false,
          title: "Shinkansen Nozomi: Shin-Osaka → Tokyo",
          desc: "2 sa 30 dk hızlı tren dönüşü ve Kita-Senju evine yerleşme.",
          cost4: 0, distanceSummary: "515 km • 2 sa 30 dk", coords: TOKYO_COORDS,
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: { train: { cost4: 59600, note: "Shinkansen + Metro" }, taxi: { cost4: 63200, note: "Shinkansen + Tokyo İst.'ndan Adachi eve taksi" }, bus: { cost4: 28000, note: "8 sa otobüs" }, walk: { cost4: 0, note: "Şehirler arası" } }
        },
        {
          id: "d5_5", time: "19:30", visual: "food", completed: false,
          title: "Kita-Senju Yakitori & Dinlenme",
          desc: "Yarınki tam gün DisneySea öncesi ev sokağında yemek ve erken uyku.",
          cost4: 6400, distanceSummary: "350 m • 4 dk", coords: TOKYO_COORDS,
          recommendedMode: "walk", selectedMode: "walk",
          modes: { train: { cost4: 0, note: "Yürüme" }, taxi: { cost4: 500, note: "2 dk" }, bus: { cost4: 0, note: "Yürüme" }, walk: { cost4: 0, note: "350 m • 4 dk yürüyüş" } }
        }
      ]
    },
    {
      dayNum: 6, date: "1 Aralık 2026, Salı", city: "TOKYO",
      fatigue: "Yüksek Tempo • Tam Gün Tema Park",
      title: "Tokyo DisneySea Tam Gün Macerası",
      stops: [
        {
          id: "d6_1", time: "07:15", visual: "food", completed: false,
          title: "Kahvaltı: Kita-Senju İstasyonu",
          desc: "Sabah erken hareket öncesi kahve ve sandviç.",
          cost4: 3200, distanceSummary: "550 m • 7 dk", coords: "35.7496,139.8049",
          recommendedMode: "walk", selectedMode: "walk",
          modes: { train: { cost4: 0, note: "Yürüme" }, taxi: { cost4: 600, note: "3 dk" }, bus: { cost4: 0, note: "Yürüme" }, walk: { cost4: 0, note: "550 m • 7 dk" } }
        },
        {
          id: "d6_2", time: "08:30", visual: "disney", completed: false,
          title: "Tokyo DisneySea (Tam Gün)",
          desc: "Fantasy Springs & gece su gösterisi (4 Kişi Giriş).",
          cost4: 37600, distanceSummary: "21.5 km • 35 dk taksi", coords: "35.6267,139.8851",
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: { train: { cost4: 2680, note: "48 dk tren (Sabah yoğun)" }, taxi: { cost4: 9600, note: "21.5 km • 35 dk | Kalabalığa girmeden direkt kapıya" }, bus: { cost4: 4000, note: "60 dk shuttle" }, walk: { cost4: 0, note: "4 sa 30 dk" } }
        },
        {
          id: "d6_3", time: "13:30", visual: "food", completed: false,
          title: "Öğle & Akşam Yemeği: DisneySea",
          desc: "Arendelle Royal Banquet veya Vulcania restoranlarında yemek.",
          cost4: 12000, distanceSummary: "Park içi", coords: "35.6267,139.8851",
          recommendedMode: "walk", selectedMode: "walk",
          modes: { train: { cost4: 0, note: "Park içi" }, taxi: { cost4: 0, note: "Park içi" }, bus: { cost4: 0, note: "Park içi" }, walk: { cost4: 0, note: "Park içi 400 m" } }
        },
        {
          id: "d6_4", time: "21:15", visual: "home", completed: false,
          title: "Kita-Senju Eve Dönüş",
          desc: "Gece gösterisi sonrası Tokyo evinize dönüş.",
          cost4: 0, distanceSummary: "21.5 km • 48 dk tren", coords: TOKYO_COORDS,
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 2680, note: "48 dk | Maihama → Hatchobori → Kita-Senju" }, taxi: { cost4: 9800, note: "35 dk taksi" }, bus: { cost4: 4000, note: "60 dk" }, walk: { cost4: 0, note: "4 sa 30 dk" } }
        }
      ]
    },
    {
      dayNum: 7, date: "2 Aralık 2026, Çarşamba", city: "TOKYO",
      fatigue: "Düşük / Rahat Tempo • Dinlenme",
      title: "Geç Kahvaltı, Harry Potter Studio & Shinjuku",
      stops: [
        {
          id: "d7_1", time: "10:00", visual: "food", completed: false,
          title: "Geç Kahvaltı: Komeda's Coffee",
          desc: "DisneySea ertesi 10:00 rahat başlangıç kahvaltısı.",
          cost4: 4200, distanceSummary: "500 m • 6 dk", coords: "35.7495,139.8035",
          recommendedMode: "walk", selectedMode: "walk",
          modes: { train: { cost4: 0, note: "Yürüme" }, taxi: { cost4: 500, note: "2 dk" }, bus: { cost4: 0, note: "Yürüme" }, walk: { cost4: 0, note: "500 m • 6 dk" } }
        },
        {
          id: "d7_2", time: "12:00", visual: "harry", completed: false,
          title: "Warner Bros. Studio Tour – Harry Potter",
          desc: "Büyük Salon, Diagon Yolu ve 9¾ Peronu turu.",
          cost4: 26000, distanceSummary: "18.8 km • 45 dk tren", coords: "35.7456,139.6461",
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 1840, note: "45 dk | Kita-Senju → Ikebukuro → Toshimaen" }, taxi: { cost4: 8100, note: "36 dk taksi" }, bus: { cost4: 1800, note: "65 dk otobüs" }, walk: { cost4: 0, note: "3 sa 55 dk" } }
        },
        {
          id: "d7_3", time: "15:00", visual: "food", completed: false,
          title: "Öğle Yemeği: Backlot Cafe & Butterbeer",
          desc: "Hogwarts temalı yemek molası.",
          cost4: 9600, distanceSummary: "Stüdyo içi", coords: "35.7456,139.6461",
          recommendedMode: "walk", selectedMode: "walk",
          modes: { train: { cost4: 0, note: "Stüdyo içi" }, taxi: { cost4: 0, note: "Stüdyo içi" }, bus: { cost4: 0, note: "Stüdyo içi" }, walk: { cost4: 0, note: "150 m" } }
        },
        {
          id: "d7_4", time: "17:30", visual: "shibuya", completed: false,
          title: "Shinjuku: 3D Kedi Tabelası & Kabukicho",
          desc: "Dev 3D ekranlar, Godzilla başı ve Omoide Yokocho.",
          cost4: 0, distanceSummary: "11.2 km • 20 dk metro", coords: "35.6938,139.7005",
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 1120, note: "20 dk | Toshimaen → Shinjuku Toei Oedo Line" }, taxi: { cost4: 4800, note: "24 dk taksi" }, bus: { cost4: 920, note: "40 dk otobüs" }, walk: { cost4: 0, note: "2 sa 20 dk" } }
        },
        {
          id: "d7_5", time: "19:45", visual: "food", completed: false,
          title: "Akşam Yemeği: Shinjuku Gyukatsu & Dönüş",
          desc: "Taş ızgarada çıtır dana eti (Gyukatsu) ve Kita-Senju eve dönüş.",
          cost4: 9600, distanceSummary: "15.4 km • 32 dk tren", coords: TOKYO_COORDS,
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 1480, note: "32 dk | Shinjuku → Kanda/Ueno → Kita-Senju" }, taxi: { cost4: 6600, note: "28 dk taksi" }, bus: { cost4: 1400, note: "55 dk" }, walk: { cost4: 0, note: "3 sa 10 dk" } }
        }
      ]
    },
    {
      dayNum: 8, date: "3 Aralık 2026, Perşembe", city: "TOKYO",
      fatigue: "Orta Tempo • Otobüs & A5 Wagyu",
      title: "Gotemba Premium Outlets & Ginza Steak Akasaka",
      stops: [
        {
          id: "d8_1", time: "07:45", visual: "food", completed: false,
          title: "Kahvaltı: Tokyo İstasyonu Yaesu",
          desc: "Gotemba otobüs kalkış noktası öncesi kahvaltı.",
          cost4: 3600, distanceSummary: "11.0 km • 22 dk tren", coords: "35.6812,139.7671",
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 1120, note: "22 dk | Kita-Senju → Tokyo İst." }, taxi: { cost4: 4700, note: "22 dk taksi" }, bus: { cost4: 920, note: "40 dk" }, walk: { cost4: 0, note: "2 sa 15 dk" } }
        },
        {
          id: "d8_2", time: "09:00", visual: "shopping", completed: false,
          title: "Gotemba Premium Outlets",
          desc: "290+ marka, Tax-Free alışveriş ve Fuji Dağı manzarası.",
          cost4: 0, distanceSummary: "96 km • 95 dk otobüs", coords: "35.3071,138.9665",
          recommendedMode: "bus", selectedMode: "bus",
          modes: { train: { cost4: 14800, note: "110 dk tren" }, taxi: { cost4: 42000, note: "85 dk taksi" }, bus: { cost4: 14400, note: "95 dk | Tokyo İst. Yaesu direkt otobüs" }, walk: { cost4: 0, note: "Şehirler arası" } }
        },
        {
          id: "d8_3", time: "13:30", visual: "food", completed: false,
          title: "Öğle Yemeği: Gotemba Food Bazaar",
          desc: "Outlet içinde öğle molası.",
          cost4: 7600, distanceSummary: "Outlet içi", coords: "35.3071,138.9665",
          recommendedMode: "walk", selectedMode: "walk",
          modes: { train: { cost4: 0, note: "Outlet içi" }, taxi: { cost4: 0, note: "Outlet içi" }, bus: { cost4: 0, note: "Outlet içi" }, walk: { cost4: 0, note: "200 m" } }
        },
        {
          id: "d8_4", time: "19:30", visual: "wagyu", completed: false,
          title: "Ginza Steak Akasaka (銀座のステーキ 赤坂店)",
          desc: "Şeflerin önünüzde pişirdiği sınırsız A5 Kuroge Wagyu Teppanyaki!",
          cost4: 48000, distanceSummary: "98 km • Otobüs + Metro", coords: "35.6768,139.7369",
          recommendedMode: "bus", selectedMode: "bus",
          modes: { train: { cost4: 15200, note: "115 dk" }, taxi: { cost4: 43500, note: "90 dk" }, bus: { cost4: 15120, note: "Gotemba → Tokyo İst. Otobüs + Akasaka Metro" }, walk: { cost4: 0, note: "Şehirler arası" } }
        },
        {
          id: "d8_5", time: "22:00", visual: "home", completed: false,
          title: "Kita-Senju Eve Dönüş",
          desc: "Akasaka'dan poşetlerle Kita-Senju evinize dönüş.",
          cost4: 0, distanceSummary: "13.2 km • 25 dk", coords: TOKYO_COORDS,
          recommendedMode: "taxi", selectedMode: "taxi",
          modes: { train: { cost4: 1120, note: "25 dk | Chiyoda Line tek tren" }, taxi: { cost4: 6400, note: "24 dk | Poşetlerle kapıya kadar taksi" }, bus: { cost4: 920, note: "48 dk" }, walk: { cost4: 0, note: "2 sa 45 dk" } }
        }
      ]
    },
    {
      dayNum: 9, date: "4 Aralık 2026, Cuma", city: "TOKYO",
      fatigue: "Orta-Yüksek Tempo • Kültür & Gece Drift",
      title: "Asakusa, Yodobashi Akiba & Tokyo Drift Gece",
      stops: [
        {
          id: "d9_1", time: "08:30", visual: "food", completed: false,
          title: "Kahvaltı: Asakusa Fırın & Matcha",
          desc: "Kaminarimon çevresinde taze Melonpan ve kahve.",
          cost4: 3400, distanceSummary: "6.4 km • 12 dk tren", coords: "35.7147,139.7966",
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 920, note: "12 dk | Kita-Senju → Asakusa direkt" }, taxi: { cost4: 2800, note: "14 dk" }, bus: { cost4: 880, note: "25 dk" }, walk: { cost4: 0, note: "1 sa 18 dk" } }
        },
        {
          id: "d9_2", time: "09:30", visual: "castle", completed: false,
          title: "Senso-ji Tapınağı & Nakamise Caddesi",
          desc: "Tokyo'nun en eski tapınağı ve dev kırmızı fener.",
          cost4: 0, distanceSummary: "300 m • 4 dk", coords: "35.7148,139.7967",
          recommendedMode: "walk", selectedMode: "walk",
          modes: { train: { cost4: 0, note: "Yürüme" }, taxi: { cost4: 500, note: "2 dk" }, bus: { cost4: 0, note: "Yürüme" }, walk: { cost4: 0, note: "300 m • 4 dk" } }
        },
        {
          id: "d9_3", time: "12:00", visual: "shopping", completed: false,
          title: "Yodobashi Camera Multimedia Akiba",
          desc: "9 katlı teknoloji, lens, aksesuar, saat ve figür merkezi.",
          cost4: 0, distanceSummary: "3.1 km • 4 dk tren", coords: "35.6987,139.7747",
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 840, note: "4 dk | Tsukuba Express" }, taxi: { cost4: 1500, note: "9 dk taksi" }, bus: { cost4: 880, note: "16 dk" }, walk: { cost4: 0, note: "38 dk" } }
        },
        {
          id: "d9_4", time: "14:30", visual: "food", completed: false,
          title: "Öğle Yemeği: Yodobashi 8. Kat Restoranları",
          desc: "Tonkatsu, Sushi veya Hamburg seçenekleri.",
          cost4: 7200, distanceSummary: "Bina içi", coords: "35.6987,139.7747",
          recommendedMode: "walk", selectedMode: "walk",
          modes: { train: { cost4: 0, note: "Bina içi" }, taxi: { cost4: 0, note: "Bina içi" }, bus: { cost4: 0, note: "Bina içi" }, walk: { cost4: 0, note: "8. kat" } }
        },
        {
          id: "d9_5", time: "17:00", visual: "drift", completed: false,
          title: "Tokyo Drift Caddesi (Shibuya Center-Gai) & Akşam",
          desc: "Cuma gecesi neon drift caddeleri ve JDM modifiye otomobil kültürü.",
          cost4: 9200, distanceSummary: "10.5 km • 24 dk tren", coords: "35.6601,139.6989",
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 2040, note: "24 dk | Akihabara → Shibuya + Dönüş" }, taxi: { cost4: 8800, note: "Direkt taksi" }, bus: { cost4: 1800, note: "Otobüs" }, walk: { cost4: 0, note: "2 sa 10 dk" } }
        }
      ]
    },
    {
      dayNum: 10, date: "5 Aralık 2026, Cumartesi", city: "TOKYO",
      fatigue: "Hafif-Orta Tempo • Bit Pazarı & Veda",
      title: "Hafta Sonu Bit Pazarı (Oi Flea Market) & Shibuya Sky",
      stops: [
        {
          id: "d10_1", time: "09:30", visual: "flea", completed: false,
          title: "Hafta Sonu Bit Pazarı: Oi Racecourse Flea Market",
          desc: "Cumartesi kurulan Tokyo'nun en büyük açık hava bit pazarı (35.5924, 139.7405) + Kahvaltı.",
          longDesc: "300+ tezgahta vintage kameralar, saatler, kimonolar ve antikalar.",
          cost4: 4500, distanceSummary: "21.8 km • 38 dk monorail", coords: "35.5924,139.7405",
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 2480, note: "38 dk | Tokyo Monorail → Oi Keibajo-mae" }, taxi: { cost4: 9400, note: "34 dk taksi" }, bus: { cost4: 2200, note: "65 dk" }, walk: { cost4: 0, note: "4 sa 30 dk" } }
        },
        {
          id: "d10_2", time: "12:30", visual: "nara", completed: false,
          title: "Meiji Jingu Tapınağı & Omotesando",
          desc: "Sedir ormanı içindeki tapınak ve modern bulvar.",
          cost4: 0, distanceSummary: "13.5 km • 28 dk tren", coords: "35.6764,139.6993",
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 1840, note: "28 dk | Monorail + Yamanote" }, taxi: { cost4: 5900, note: "25 dk taksi" }, bus: { cost4: 1600, note: "55 dk" }, walk: { cost4: 0, note: "2 sa 45 dk" } }
        },
        {
          id: "d10_3", time: "14:15", visual: "food", completed: false,
          title: "Öğle Yemeği: Shibuya Uobei Dönen Suşi",
          desc: "Cat Street yürüyüşü sonrası hızlı tren suşi deneyimi.",
          cost4: 6400, distanceSummary: "1.4 km • 18 dk yürüyüş", coords: "35.6596,139.6983",
          recommendedMode: "walk", selectedMode: "walk",
          modes: { train: { cost4: 600, note: "3 dk" }, taxi: { cost4: 700, note: "5 dk" }, bus: { cost4: 880, note: "8 dk" }, walk: { cost4: 0, note: "1.4 km • 18 dk Cat Street yürüyüşü" } }
        },
        {
          id: "d10_4", time: "16:00", visual: "shibuya", completed: false,
          title: "Shibuya Crossing & Shibuya Sky (Gün Batımı)",
          desc: "229 metre yükseklikten Tokyo gün batımı ve gece ışıkları.",
          cost4: 10000, distanceSummary: "350 m • 4 dk", coords: "35.6584,139.7022",
          recommendedMode: "walk", selectedMode: "walk",
          modes: { train: { cost4: 0, note: "Yürüme" }, taxi: { cost4: 500, note: "2 dk" }, bus: { cost4: 0, note: "Yürüme" }, walk: { cost4: 0, note: "350 m • 4 dk" } }
        },
        {
          id: "d10_5", time: "19:30", visual: "wagyu", completed: false,
          title: "Veda Yemeği: Shibuya Wagyu Shabu-Shabu & Dönüş",
          desc: "Son akşam yemeği ve yarınki uçuş için Kita-Senju eve dönüş.",
          cost4: 14000, distanceSummary: "17.2 km • 35 dk tren", coords: TOKYO_COORDS,
          recommendedMode: "train", selectedMode: "train",
          modes: { train: { cost4: 1240, note: "35 dk | Shibuya → Kita-Senju direkt" }, taxi: { cost4: 7200, note: "32 dk taksi" }, bus: { cost4: 920, note: "60 dk" }, walk: { cost4: 0, note: "3 sa 35 dk" } }
        }
      ]
    },
    {
      dayNum: 11, date: "6 Aralık 2026, Pazar", city: "TOKYO → NRT",
      fatigue: "Hafif Tempo • Valiz Dostu Dönüş",
      title: "Narita Havalimanı Transferi & İstanbul Dönüşü (10:10)",
      stops: [
        {
          id: "d11_1", time: "06:15", visual: "food", completed: false,
          title: "Evden Çıkış & Hızlı Kahvaltı (Kita-Senju)",
          desc: "06:15'te evden çıkış ve otobüs durağı yanında kahve.",
          cost4: 2400, distanceSummary: "550 m • 7 dk", coords: "35.7496,139.8062",
          recommendedMode: "walk", selectedMode: "walk",
          modes: { train: { cost4: 0, note: "Yürüme" }, taxi: { cost4: 600, note: "2 dk" }, bus: { cost4: 0, note: "Yürüme" }, walk: { cost4: 0, note: "550 m • 7 dk" } }
        },
        {
          id: "d11_2", time: "06:45", visual: "flight", completed: false,
          title: "Narita Transferi (Direkt Limousine Bus)",
          desc: "Kita-Senju Doğu Çıkışı'ndan aktarmasız direkt Narita Terminal kapısına.",
          cost4: 0, distanceSummary: "64 km • 75 dk otobüs", coords: "35.7720,140.3929",
          recommendedMode: "bus", selectedMode: "bus",
          modes: { train: { cost4: 10800, note: "55 dk Skyliner" }, taxi: { cost4: 26500, note: "60 dk VIP taksi" }, bus: { cost4: 11200, note: "64 km • 75 dk | Direkt Airport Limousine Bus" }, walk: { cost4: 0, note: "Şehirler arası" } }
        },
        {
          id: "d11_3", time: "08:15", visual: "flight", completed: false,
          title: "Narita Check-in & 10:10 İstanbul Uçuşu",
          desc: "Bagaj teslimi, Tax-Free ve İstanbul'a dönüş.",
          cost4: 0, distanceSummary: "Terminal içi", coords: "35.7720,140.3929",
          recommendedMode: "walk", selectedMode: "walk",
          modes: { train: { cost4: 0, note: "Terminal içi" }, taxi: { cost4: 0, note: "Terminal içi" }, bus: { cost4: 0, note: "Terminal kapısı" }, walk: { cost4: 0, note: "150 m" } }
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

function openGoogleMapsNative(stop) {
  const dest = stop?.coords || encodeURIComponent(stop?.title || "Tokyo");
  const mode = stop?.selectedMode || stop?.recommendedMode || "train";
  const gMode = mode === "taxi" ? "driving" : mode === "walk" ? "walking" : "transit";
  const webFallback = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=${gMode}`;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS && stop?.coords) {
    window.location.href = `comgooglemaps://?daddr=${stop.coords}&directionsmode=${gMode}`;
    setTimeout(() => {
      if (!document.hidden) window.open(webFallback, "_blank", "noopener,noreferrer");
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
      html: `<div style="background:#059669;color:#fff;padding:3px 8px;border-radius:99px;font-size:10px;font-weight:800;border:2px solid #fff;white-space:nowrap;">🏠 Tokyo Evi</div>`,
      className: ""
    });
    const osakaIcon = L.divIcon({
      html: `<div style="background:#0d9488;color:#fff;padding:3px 8px;border-radius:99px;font-size:10px;font-weight:800;border:2px solid #fff;white-space:nowrap;">🏠 Osaka Evi</div>`,
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
        <span className="text-xs font-extrabold">{dayObj.dayNum}. Gün • {dayObj.city} Rotası</span>
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
              <h4 className="text-sm font-extrabold truncate mt-0.5">{activePinStop.stop.title}</h4>
              <p className="text-[11px] text-slate-500 truncate">{activePinStop.stop.desc}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => openGoogleMapsNative(activePinStop.stop)} className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" /> Google Maps ile Başlat
            </button>
            <button onClick={() => onSelectStop(activePinStop.stop)} className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-extrabold flex items-center justify-center gap-1.5">
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
        if (srv && srv.days && srv.days.length > 0) loaded = srv;
        else await fetch("/api/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(loaded) });
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
        const vRes = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ device_token: token }) });
        if (vRes.ok) {
          const vData = await vRes.json();
          if (vData.users) setRegisteredUsers(vData.users);
          if (vData.authenticated && vData.user) setCurrentUser({ role: "guest", ...vData.user });
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
      await fetch("/api/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nextState) });
    } catch (e) {}
  };

  const handleGuestSubmit = async () => {
    setAuthError("");
    if (!guestName.trim()) return setAuthError("Lütfen adınızı ve soyadınızı girin.");
    const token = getOrCreateDeviceToken();
    try {
      const res = await fetch("/api/auth/register_or_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: guestName.trim(), device_token: token, avatar_base64: avatarPreview })
      });
      const data = await res.json();
      if (!res.ok) return setAuthError(data.error || "Giriş başarısız.");
      if (data.users) setRegisteredUsers(data.users);
      setCurrentUser({ role: "guest", ...data.user });
    } catch (e) {
      setAuthError("Sunucuya bağlanılamadı.");
    }
  };

  const handleAdminSubmit = () => {
    setAuthError("");
    if (adminPinInput.trim() !== (appState?.adminPin || "2026")) return setAuthError("Hatalı Admin PIN kodu!");
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
        body: JSON.stringify({ device_token: currentUser.device_token, avatar_base64: b64 })
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
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[32px] max-w-md w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[11px] font-extrabold uppercase mb-1.5">26 Kas – 06 Ara 2026</span>
            <h1 className="text-2xl font-extrabold">Japonya Rotamız 🇯🇵</h1>
            <p className="text-xs text-slate-500 mt-0.5">Tokyo & Osaka • Cihaz Kilitli Grup Rehberi</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3.5 mb-4 border border-slate-200/70 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span>Kayıtlı Yolcular</span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold">{registeredUsers.length} / 4</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {registeredUsers.length === 0 ? <span className="text-slate-400 italic">Henüz kayıtlı cihaz yok.</span> : registeredUsers.map(u => (
                <div key={u.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold">
                  {u.avatar_url ? <img src={u.avatar_url} className="w-4 h-4 rounded-full object-cover" /> : <span>👤</span>}
                  <span>{u.name}</span>
                  <Lock className="w-3 h-3 text-emerald-500" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-4">
            <button onClick={() => { setAuthTab("guest"); setAuthError(""); }} className={`py-2.5 rounded-xl text-xs font-extrabold ${authTab === "guest" ? "bg-white dark:bg-slate-700 shadow-xs" : "text-slate-500"}`}>👤 Yolcu Girişi</button>
            <button onClick={() => { setAuthTab("admin"); setAuthError(""); }} className={`py-2.5 rounded-xl text-xs font-extrabold ${authTab === "admin" ? "bg-white dark:bg-slate-700 shadow-xs" : "text-slate-500"}`}>👑 Admin Girişi</button>
          </div>

          {authTab === "guest" ? (
            <div className="space-y-3">
              <div className="flex flex-col items-center">
                <label className="cursor-pointer relative">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-sky-400 flex flex-col items-center justify-center overflow-hidden">
                    {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" /> : <><Camera className="w-6 h-6 text-sky-500" /><span className="text-[9px] font-extrabold text-slate-500 mt-1">Fotoğraf Seç</span></>}
                  </div>
                  <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-extrabold flex items-center justify-center shadow">+</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarChange(e, false)} />
                </label>
              </div>
              <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Adınız Soyadınız (Örn: Aykut Avcı)" className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
              {authError && <p className="text-xs text-rose-500 font-bold">{authError}</p>}
              <button onClick={handleGuestSubmit} className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-rose-600 text-white font-extrabold text-sm shadow-lg">Cihazımı Kaydet & Giriş Yap ↗</button>
            </div>
          ) : (
            <div className="space-y-3">
              <input type="password" inputMode="numeric" value={adminPinInput} onChange={e => setAdminPinInput(e.target.value)} placeholder="Admin PIN (Varsayılan: 2026)" className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold" />
              {authError && <p className="text-xs text-rose-500 font-bold">{authError}</p>}
              <button onClick={handleAdminSubmit} className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white font-extrabold text-sm shadow-lg">Yönetici Olarak Gir ↗</button>
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
  const getStopTotal = (st) => (Number(st.cost4) || 0) + (Number(st.modes?.[st.selectedMode || st.recommendedMode || "train"]?.cost4) || 0);

  let grandTransport = 0, grandActivity = 0;
  appState.days.forEach(d => d.stops.forEach(st => {
    grandActivity += Number(st.cost4) || 0;
    grandTransport += Number(st.modes?.[st.selectedMode || st.recommendedMode || "train"]?.cost4) || 0;
  }));
  const grandTotal = grandTransport + grandActivity;
  const currentDayObj = appState.days.find(d => d.dayNum === selectedDay) || appState.days[0];

  const toggleComplete = (stopId) => {
    if (!isAdmin) return;
    persistState({ ...appState, days: appState.days.map(d => ({ ...d, stops: d.stops.map(s => s.id === stopId ? { ...s, completed: !s.completed } : s) })) });
  };

  const changeTransport = (stopId, mode) => {
    if (!isAdmin) return;
    persistState({ ...appState, days: appState.days.map(d => ({ ...d, stops: d.stops.map(s => s.id === stopId ? { ...s, selectedMode: mode } : s) })) });
  };

  const moveStopOrder = (idx, dir) => {
    if (!isAdmin) return;
    const t = idx + dir;
    if (t < 0 || t >= currentDayObj.stops.length) return;
    const arr = [...currentDayObj.stops];
    [arr[idx], arr[t]] = [arr[t], arr[idx]];
    persistState({ ...appState, days: appState.days.map(d => d.dayNum === selectedDay ? { ...d, stops: arr } : d) });
  };

  const deleteStopItem = (stopId) => {
    if (!isAdmin || !window.confirm("Bu durağı silmek istiyor musunuz?")) return;
    persistState({ ...appState, days: appState.days.map(d => d.dayNum === selectedDay ? { ...d, stops: d.stops.filter(s => s.id !== stopId) } : d) });
  };

  const saveStopModal = () => {
    if (!editingStop) return;
    const isNew = !editingStop.id;
    const prepared = { ...editingStop, id: editingStop.id || `custom_${Date.now()}`, cost4: Number(editingStop.cost4) || 0, selectedMode: editingStop.recommendedMode || "train" };
    persistState({
      ...appState,
      days: appState.days.map(d => d.dayNum !== selectedDay ? d : { ...d, stops: isNew ? [...d.stops, prepared] : d.stops.map(s => s.id === prepared.id ? prepared : s) })
    });
    setEditingStop(null);
  };

  const focusStopCard = (stopId) => {
    setFocusedStopId(stopId);
    const el = document.getElementById(`stop-card-${stopId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const avatarColors = ["bg-rose-600", "bg-indigo-600", "bg-amber-500", "bg-emerald-600"];

  return (
    <div className="min-h-screen">
      <header className="max-w-2xl mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center -space-x-2">
            {[0, 1, 2, 3].map(idx => {
              const u = registeredUsers[idx];
              if (!u) return <div key={idx} className="w-9 h-9 rounded-full bg-white/80 dark:bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 border border-dashed border-slate-300">?</div>;
              return u.avatar_url
                ? <img key={u.id} onClick={() => !isAdmin && setActiveModal("profile")} src={u.avatar_url} alt={u.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-xs cursor-pointer" />
                : <div key={u.id} onClick={() => !isAdmin && setActiveModal("profile")} className={`w-9 h-9 rounded-full ${avatarColors[idx]} text-white text-xs font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 cursor-pointer`}>{u.name.slice(0, 2).toUpperCase()}</div>;
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setActiveModal("notes")} className="glass-card px-3 h-9 rounded-full border border-white/80 dark:border-slate-700/80 text-xs font-extrabold flex items-center gap-1.5">
              <span>📌</span><span>Not ({(appState.groupNotes || []).length})</span>
            </button>
            <button onClick={() => setActiveModal("cards")} className="glass-card px-3 h-9 rounded-full border border-white/80 dark:border-slate-700/80 text-xs font-extrabold flex items-center gap-1.5">
              <span>🗣️</span><span>Kartlar</span>
            </button>
            <button onClick={toggleTheme} className="glass-card w-9 h-9 rounded-full border border-white/80 dark:border-slate-700/80 flex items-center justify-center">
              {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="mb-3" onClick={() => !isAdmin && setActiveModal("profile")}>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span>{isAdmin ? "👑 Admin Modu" : `👤 ${currentUser.name}`}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>• 26 Kas – 6 Ara • Tokyo & Osaka</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">Japonya Rotamız 🇯🇵</h1>
        </div>

        <div className="overflow-x-auto no-scrollbar flex gap-1.5 pb-2">
          {appState.days.map(d => {
            const active = d.dayNum === selectedDay;
            const done = d.stops.length > 0 && d.stops.every(s => s.completed);
            return (
              <button key={d.dayNum} onClick={() => { setSelectedDay(d.dayNum); setFocusedStopId(null); }}
                className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-extrabold border transition flex items-center gap-1 ${active ? "bg-blue-600 text-white border-blue-600 shadow-xs" : "glass-card text-slate-600 dark:text-slate-300 border-white/80 dark:border-slate-800"}`}>
                <span>{d.dayNum}. Gün</span>
                <span className="text-[10px] opacity-80">{d.date.split(" ")[0]} {d.date.split(" ")[1].slice(0, 3)}</span>
                {done && <span>✅</span>}
              </button>
            );
          })}
        </div>

        <div className="glass-card p-1 rounded-2xl border border-white/80 dark:border-slate-800 grid grid-cols-2 gap-1 mt-1">
          <button onClick={() => setMainView("timeline")} className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 ${mainView === "timeline" ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300"}`}>
            <Compass className="w-3.5 h-3.5" /> Zaman Çizelgesi
          </button>
          <button onClick={() => setMainView("map")} className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 ${mainView === "map" ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300"}`}>
            <MapPin className="w-3.5 h-3.5" /> Harita Görünümü
          </button>
        </div>
      </header>

      {mainView === "map" ? (
        <section className="max-w-2xl mx-auto px-4 pt-2">
          <InteractiveRouteMap dayObj={currentDayObj} onSelectStop={(st) => setDetailStop(st)} />
        </section>
      ) : (
        <main className="max-w-2xl mx-auto px-4 pt-2 space-y-4">
          <div className="overflow-x-auto no-scrollbar flex gap-2.5 pb-1">
            {currentDayObj.stops.map((st, idx) => (
              <div key={st.id} onClick={() => focusStopCard(st.id)}
                className={`relative w-36 h-44 rounded-[24px] overflow-hidden shrink-0 cursor-pointer shadow-md border-2 transition ${focusedStopId === st.id ? "border-blue-500 scale-[1.02]" : "border-white/60 dark:border-slate-800"}`}>
                <img src={LANDMARK_PHOTOS[st.visual] || LANDMARK_PHOTOS.castle} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent" />
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/45 text-white text-[10px] font-extrabold">{idx + 1} • {st.time}</div>
                {st.completed && <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Check className="w-3 h-3" /></div>}
                <div className="absolute bottom-2.5 inset-x-2.5 text-white">
                  <div className="text-[10px] text-white/75 font-bold">{VISUAL_KANJI[st.visual] || "日本"}</div>
                  <div className="text-xs font-extrabold leading-tight line-clamp-2 mt-0.5">{st.title}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-[24px] p-4 border border-white/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">{currentDayObj.city}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">⚡ {currentDayObj.fatigue}</span>
              </div>
              <h3 className="text-base font-extrabold leading-snug">{currentDayObj.dayNum}. Gün: {currentDayObj.title}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{currentDayObj.date}</p>
            </div>
            {isAdmin && (
              <button onClick={() => setEditingStop({ id: "", time: "15:00", visual: "castle", title: "", desc: "", cost4: 0, coords: "", distanceSummary: "2 km • 10 dk", recommendedMode: "train", modes: { train: { cost4: 0, note: "Metro" }, taxi: { cost4: 0, note: "Taksi" }, bus: { cost4: 0, note: "Otobüs" }, walk: { cost4: 0, note: "Yürüyüş" } } })}
                className="px-3.5 py-2 rounded-full bg-slate-900 dark:bg-blue-600 text-white text-xs font-extrabold shrink-0 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Durak
              </button>
            )}
          </div>

          <div className="space-y-3.5">
            {currentDayObj.stops.map((stop, idx) => {
              const modeKey = stop.selectedMode || stop.recommendedMode || "train";
              const recKey = stop.recommendedMode || "train";
              const activeMode = stop.modes?.[modeKey] || { cost4: 0, note: "" };
              const total4 = getStopTotal(stop);
              const modeNames = { train: "Tren / Metro", taxi: "Taksi (4 Kişi)", bus: "Otobüs", walk: "Yürüyüş" };

              return (
                <div id={`stop-card-${stop.id}`} key={stop.id} className={`glass-card rounded-[26px] border overflow-hidden transition ${focusedStopId === stop.id ? "ring-2 ring-blue-500 border-blue-400" : stop.completed ? "border-emerald-300 dark:border-emerald-800 opacity-75" : "border-white/90 dark:border-slate-800"}`}>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <img src={LANDMARK_PHOTOS[stop.visual] || LANDMARK_PHOTOS.castle} alt="" onClick={() => setDetailStop(stop)} className="w-16 h-16 rounded-2xl object-cover shrink-0 cursor-pointer" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-extrabold">{stop.time}</span>
                            {stop.distanceSummary && <span className="text-[10px] font-bold text-slate-400">📏 {stop.distanceSummary}</span>}
                          </div>
                          <button onClick={() => toggleComplete(stop.id)} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${stop.completed ? "bg-emerald-500 border-emerald-500 text-white" : isAdmin ? "border-slate-300 dark:border-slate-600 text-transparent" : "border-slate-200 dark:border-slate-700 text-transparent"}`}>
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className={`text-sm sm:text-base font-extrabold leading-snug mt-1 ${stop.completed ? "line-through text-slate-400" : ""}`}>{stop.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{stop.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button onClick={() => setDetailStop(stop)} className="px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 text-[11px] font-extrabold">ℹ️ Mekan Rehberi</button>
                      <div className="text-right">
                        <span className="text-sm font-extrabold">{fmtJpy(total4)}</span>
                        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 ml-1">{fmtTry(total4)}</span>
                      </div>
                    </div>

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
                          <button key={key} onClick={() => changeTransport(stop.id, key)}
                            className={`relative py-2 px-1 rounded-2xl text-[11px] font-extrabold border flex flex-col items-center ${active ? "bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600" : isAdmin ? "bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700" : "bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 border-slate-100 dark:border-slate-800"}`}>
                            {isRec && <span className="absolute -top-1.5 right-1 px-1 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black">⭐</span>}
                            <div className="flex items-center gap-1"><Icon className="w-3 h-3" /> {label}</div>
                            <span className="text-[10px] mt-0.5 opacity-80">{cost === 0 ? "¥0" : fmtJpy(cost)}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="bg-slate-100/80 dark:bg-slate-800/70 p-3 rounded-2xl space-y-2">
                      <div className="text-[11px] leading-relaxed"><span className="font-extrabold text-blue-700 dark:text-blue-400">Rota:</span> {activeMode.note}</div>
                      <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-200/70 dark:border-slate-700">
                        <button onClick={() => openGoogleMapsNative(stop)} className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center gap-1.5">
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
                </div>
              );
            })}
          </div>
        </main>
      )}

      <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <nav className="floating-dock pointer-events-auto rounded-full px-3 py-2 border border-white/80 dark:border-slate-700/80 flex items-center gap-1.5">
          <button onClick={() => { setMainView("timeline"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`px-3.5 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${mainView === "timeline" ? "bg-slate-900 dark:bg-blue-600 text-white" : "text-slate-600 dark:text-slate-300"}`}>
            <Compass className="w-4 h-4" /> Plan
          </button>
          <button onClick={() => setMainView("map")} className={`px-3.5 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${mainView === "map" ? "bg-slate-900 dark:bg-blue-600 text-white" : "text-slate-600 dark:text-slate-300"}`}>
            <MapPin className="w-4 h-4" /> Harita
          </button>
          <button onClick={() => setActiveModal("budget")} className="px-3.5 py-2 rounded-full text-slate-600 dark:text-slate-300 text-xs font-extrabold flex items-center gap-1.5">
            <Wallet className="w-4 h-4" /> Bütçe
          </button>
          <button onClick={() => setActiveModal("tips")} className="p-2 rounded-full text-slate-600 dark:text-slate-300"><Lightbulb className="w-4 h-4" /></button>
          <button onClick={() => setActiveModal("settings")} className="p-2 rounded-full text-slate-600 dark:text-slate-300"><Settings className="w-4 h-4" /></button>
        </nav>
      </div>

      <AnimatePresence>
        {activeModal === "budget" && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div><h3 className="text-base font-extrabold">11 Günlük Bütçe (4 Kişi)</h3><p className="text-[11px] text-slate-500">1 ¥ = {rate.toFixed(3)} ₺</p></div>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60"><div className="text-[10px] font-bold text-indigo-600">Ulaşım (4 Kişi)</div><div className="text-sm font-extrabold mt-0.5">{fmtJpy(grandTransport)}</div><div className="text-[11px] font-bold text-indigo-700">{fmtTry(grandTransport)}</div></div>
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60"><div className="text-[10px] font-bold text-rose-600">Giriş & Yemek</div><div className="text-sm font-extrabold mt-0.5">{fmtJpy(grandActivity)}</div><div className="text-[11px] font-bold text-rose-700">{fmtTry(grandActivity)}</div></div>
                  <div className="p-3 rounded-2xl bg-emerald-600 text-white"><div className="text-[10px] font-bold text-emerald-100">GENEL TOPLAM</div><div className="text-sm font-extrabold mt-0.5">{fmtJpy(grandTotal)}</div><div className="text-[11px] font-bold text-emerald-100">{fmtTry(grandTotal)}</div></div>
                </div>
                <div className="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900 flex items-center justify-between gap-2">
                  <div><div className="font-extrabold">📷 Kamera & Alışveriş Bütçesi (¥)</div><div className="text-[11px] text-violet-700">Karşılığı: {fmtTry(appState.shoppingBudgetJpy || 0)}</div></div>
                  <input type="number" step="5000" value={appState.shoppingBudgetJpy || ""} onChange={(e) => persistState({ ...appState, shoppingBudgetJpy: Number(e.target.value) || 0 })} placeholder="150000" className="w-28 px-3 py-2 rounded-xl border border-violet-300 dark:border-violet-700 bg-white dark:bg-slate-800 font-extrabold text-right" />
                </div>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 font-bold"><tr><th className="p-2.5">Gün</th><th className="p-2.5">Ulaşım</th><th className="p-2.5">Aktivite</th><th className="p-2.5 text-right">Toplam</th></tr></thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {appState.days.map(d => {
                        const tr = d.stops.reduce((a, s) => a + (Number(s.modes?.[s.selectedMode || s.recommendedMode || "train"]?.cost4) || 0), 0);
                        const ac = d.stops.reduce((a, s) => a + (Number(s.cost4) || 0), 0);
                        return <tr key={d.dayNum}><td className="p-2.5 font-extrabold">{d.dayNum}. Gün</td><td className="p-2.5">{fmtJpy(tr)}</td><td className="p-2.5">{fmtJpy(ac)}</td><td className="p-2.5 text-right font-extrabold">{fmtJpy(tr + ac)} <span className="block text-[10px] text-emerald-600">{fmtTry(tr + ac)}</span></td></tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {detailStop && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="relative h-48 bg-slate-900 text-white flex flex-col justify-end p-5">
                <img src={LANDMARK_PHOTOS[detailStop.visual] || LANDMARK_PHOTOS.castle} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
                <button onClick={() => setDetailStop(null)} className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center"><X className="w-4 h-4" /></button>
                <div className="relative z-10"><span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold">Saat {detailStop.time}</span><h3 className="text-lg font-extrabold mt-1">{detailStop.title}</h3></div>
              </div>
              <div className="p-5 overflow-y-auto space-y-3 text-xs leading-relaxed">
                <p>{detailStop.longDesc || detailStop.desc}</p>
                <button onClick={() => openGoogleMapsNative(detailStop)} className="w-full py-3 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center gap-1.5"><Navigation className="w-4 h-4" /> Google Maps'te Aç</button>
              </div>
            </div>
          </div>
        )}

        {activeModal === "notes" && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-extrabold">📌 Ortak Grup Panosu</h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 overflow-y-auto space-y-2.5 flex-1 text-xs">
                {(appState.groupNotes || []).map(n => (
                  <div key={n.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-start justify-between gap-2">
                    <div><div className="text-[10px] font-extrabold text-indigo-600">{n.author} • {n.time}</div><div className="mt-0.5">{n.text}</div></div>
                    {(isAdmin || currentUser.name === n.author) && <button onClick={() => persistState({ ...appState, groupNotes: (appState.groupNotes || []).filter(x => x.id !== n.id) })} className="text-rose-500 font-bold">✕</button>}
                  </div>
                ))}
              </div>
              <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <input type="text" value={newNoteText} onChange={e => setNewNoteText(e.target.value)} placeholder="Grup notu yaz..." className="flex-1 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs" />
                <button onClick={() => { if (!newNoteText.trim()) return; persistState({ ...appState, groupNotes: [{ id: Date.now(), author: currentUser.name, text: newNoteText.trim(), time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) }, ...(appState.groupNotes || [])] }); setNewNoteText(""); }} className="px-4 py-2.5 rounded-2xl bg-blue-600 text-white font-extrabold text-xs">Gönder</button>
              </div>
            </div>
          </div>
        )}

        {activeModal === "cards" && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-extrabold">🗣️ Japonca "Göster & Geç" Kartları</h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 overflow-y-auto space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900 text-white"><div className="text-[10px] font-bold text-rose-400">🚕 Taksi Şoförüne: Tokyo Evimiz</div><div className="text-base font-extrabold mt-1">東京都足立区千住寿町 19-3</div><div className="text-[11px] text-slate-300 mt-0.5">北千住駅の近くまでお願いします。</div></div>
                <div className="p-4 rounded-2xl bg-slate-900 text-white"><div className="text-[10px] font-bold text-amber-400">🚕 Taksi Şoförüne: Osaka Evimiz</div><div className="text-base font-extrabold mt-1">大阪府大阪市西成区岸里 3-5-6</div><div className="text-[11px] text-slate-300 mt-0.5">岸里駅の近くまでお願いします。</div></div>
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900"><div className="text-[10px] font-extrabold text-indigo-600">📷 Bic Camera / Yodobashi Kasa</div><div className="text-sm font-extrabold mt-1">免税（Tax-Free）と観光客クーポンを使いたいです。</div><div className="text-[11px] text-slate-500 mt-0.5">Vergi iadesi ve turist kuponunu kullanmak istiyorum.</div></div>
              </div>
            </div>
          </div>
        )}

        {activeModal === "tips" && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-extrabold">💡 Japonya 2026 Altın İpuçları</h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 overflow-y-auto space-y-3 text-xs leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40"><div className="font-extrabold mb-1">📷 1. Bic Camera Yurakucho (27 Kas 10:00)</div>Pasaportunuzun fiziksel aslını göstererek %10 Tax-Free + Google turist kuponu ile ekstra %5–7 indirim alabilirsiniz.</div>
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40"><div className="font-extrabold mb-1">🚕 2. 4 Kişi Taksi & Otomatik Kapı</div>Tokyo'da açılış ¥500, Osaka'da ¥600'dür. Arka kapı otomatik açılır/kapanır, kapıya el sürmeyin.</div>
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40"><div className="font-extrabold mb-1">🏎️ 3. Tokyo Drift & Oi Bit Pazarı</div>Cuma gecesi Shibuya Center-Gai neon drift caddesi, Cumartesi sabahı Oi Racecourse Bit Pazarı için nakit Yen bulundurun.</div>
              </div>
            </div>
          </div>
        )}

        {activeModal === "profile" && !isAdmin && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
              <div className="flex items-center justify-between"><h3 className="text-base font-extrabold">Profil Kartım</h3><button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><X className="w-4 h-4" /></button></div>
              <div className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-3xl font-extrabold">{currentUser.avatar_url ? <img src={currentUser.avatar_url} className="w-full h-full object-cover" /> : currentUser.name.slice(0, 2).toUpperCase()}</div>
              <div><div className="text-lg font-extrabold">{currentUser.name}</div><div className="text-[11px] text-emerald-600 font-bold mt-0.5">🔒 Bu cihaza kalıcı olarak kilitli</div></div>
              <label className="block w-full py-3 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-extrabold cursor-pointer">📸 Profil Fotoğrafını Değiştir<input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarChange(e, true)} /></label>
            </div>
          </div>
        )}

        {activeModal === "settings" && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] max-w-md w-full p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3"><h3 className="text-base font-extrabold">Sistem & Cihaz Yönetimi</h3><button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><X className="w-4 h-4" /></button></div>
              <div className="text-xs space-y-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <div><div className="text-slate-400 font-bold">Aktif Oturum</div><div className="font-extrabold mt-0.5">{isAdmin ? "👑 Admin Modu" : `👤 ${currentUser.name}`}</div></div>
                  {!isAdmin && <button onClick={() => setActiveModal("profile")} className="px-3 py-1.5 rounded-xl bg-indigo-100 text-indigo-700 font-extrabold">Profilim</button>}
                </div>
                {isAdmin && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="font-extrabold mb-1.5">Cihaz Kilitli Yolcular</div>
                      <div className="space-y-1.5">
                        {registeredUsers.map((u, i) => (
                          <div key={u.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl">
                            <span className="font-bold">{i + 1}. {u.name}</span>
                            <button onClick={async () => { if (!window.confirm("Kilidi kaldırılsın mı?")) return; const r = await fetch("/api/admin/remove_user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: u.id, admin_pin: appState.adminPin || "2026" }) }); if (r.ok) { const d = await r.json(); setRegisteredUsers(d.users || []); } }} className="text-rose-600 font-extrabold">Kilidi Sil</button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newPinValue} onChange={e => setNewPinValue(e.target.value)} placeholder="Yeni Admin PIN" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
                      <button onClick={() => { if (newPinValue.trim().length >= 4) { persistState({ ...appState, adminPin: newPinValue.trim() }); setNewPinValue(""); alert("PIN güncellendi!"); } }} className="px-3.5 py-2 rounded-xl bg-slate-800 text-white font-bold">PIN Güncelle</button>
                    </div>
                    <button onClick={() => { if (window.confirm("Plan varsayılan verilere sıfırlansın mı?")) { persistState({ ...DEFAULT_DATA, adminPin: appState.adminPin, exchangeRate: appState.exchangeRate }); setActiveModal(null); } }} className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 font-extrabold">Varsayılan Plana Sıfırla</button>
                  </div>
                )}
                <button onClick={() => { if (isAdmin) { localStorage.removeItem("japan_admin_unlocked"); window.location.reload(); } else { setActiveModal(null); setAuthTab("admin"); setCurrentUser(null); } }} className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white font-extrabold">
                  {isAdmin ? "🚪 Admin Modundan Çık" : "👑 Admin Moduna Geç"}
                </button>
              </div>
            </div>
          </div>
        )}

        {editingStop && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"><h3 className="text-base font-extrabold">{editingStop.id ? "Durağı Düzenle" : "Yeni Durak Ekle"}</h3><button onClick={() => setEditingStop(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><X className="w-4 h-4" /></button></div>
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
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

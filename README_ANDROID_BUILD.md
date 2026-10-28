# Suuqa App - Buugga Dhisidda APK & Daabacaadda Dhabta ah (Production Guide)

Ku soo dhowow **Suuqa App**, suuqa casriga ah ee ganacsiyada iyo macaamiisha Soomaaliyeed oo leh nidaamka lacag bixinta mobaylada (**EVC Plus, Zaad, eDahab, Sahal**) iyo xaqiijinta caddaynta fariimaha (**TxID Verification**) iyo maamulka shaqaalaha (Diraha gaarsiinta, Adeegga macaamiisha, Maamulaha kaydka, Khasnajiga).

---

## 📁 1. Qaabka Folder-ka Mashruuca (Project Structure)
Mashruucan waa mid dhammaystiran oo diyaarsan:
- `src/` - Koodhka buuxa ee React 19 + TypeScript + Tailwind CSS
- `src/components/screens/` - Shaashadaha macaamiisha, dukaamada, shaqaalaha, iyo maamulka sare
- `src/components/apk/` - Xarunta APK-ga iyo soo dejinta
- `public/` - Astaamaha PWA, icons, iyo faylasha dadweynaha
- `capacitor.config.json` - Xiraha tooska ah ee Android APK
- `vite.config.ts` - Qaabeynta Vite iyo PWA Service Worker

---

## 🚀 2. Sida Loo Kiciyo Mashruuca (Local Development)

Hubi in aad kombiyuutarkaaga ku haysato **Node.js 18+** ama ka sareeya.

```bash
# 1. Ku rakib dhammaan xirmooyinka (dependencies)
npm install

# 2. Kici server-ka tijaabada
npm run dev
```

Kadib ka fur browser-kaaga: `http://localhost:3000` ama `http://localhost:5173`.

---

## 📱 3. Sida Loo Dhiso Android APK Dhab ah (Native APK Build with Capacitor)

Waxaad u rogi kartaa app-kan fayl **APK dhab ah** oo lagu shuban karo taleefan kasta adigoo isticmaalaya Capacitor iyo Android Studio:

### Tallaabada 1: Dhis Koodhka Web-ka
```bash
npm run build
```

### Tallaabada 2: Ku Dar Madasha Android (Install Capacitor Android)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
```

### Tallaabada 3: Waafaji Faylasha
```bash
npx cap sync
```

### Tallaabada 4: Ku Fur Android Studio
```bash
npx cap open android
```

### Tallaabada 5: Dhis Faylka APK (Generate APK)
Gudaha **Android Studio**:
1. Guji menu-ga sare: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. Marka uu dhameeyo wuxuu ku siinayaa fariin oranaysa *APK(s) generated successfully*.
3. Guji **locate** si aad u hesho faylka:
   `app/build/outputs/apk/debug/app-debug.apk` ama `app-release.apk`.
4. U dir taleefankaaga adigoo isticmaalaya WhatsApp ama USB cable, wuuna furmayaa bilaa qalad!

---

## ⚡ 4. Xalka Ugu Degdegsan ee Taleefanka (PWA / WebAPK)
Haddii aadan haysan Android Studio ama aad rabto in macmiilku helo app-ka 1 ilbiriqsi gudaheed:
1. Ka fur link-ga app-ka taleefankaaga Chrome ama Safari.
2. Guji 3-da dhibcood ee geeska sare ee Chrome.
3. Dooro **"Install app"** ama **"Ku dar shaashadda guriga (Add to Home screen)"**.
4. Wuxuu noqonayaa App buuxa oo shaashadda taleefanka kaga jira astaanta Suuqa App, oo u shaqeynaya sida APK caadi ah!

---

## 💳 5. Habaynta Lacag Bixinta (Somali Mobile Money & API Gateway)
App-ku wuxuu taageeraa:
- **EVC Plus, Zaad, eDahab, Sahal & Merchant Till Number**
- **Automated API Gateway** (Waafi Pay, Hormuud Merchant API, Somtel eDahab API)
- **Hubinta TxID**: Khasnajiga ayaa xaqiijiya ama diida caddaynta macaamiisha ka hor inta aan alaabta la dirin.

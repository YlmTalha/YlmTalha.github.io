# GitHub Pages'te Yayınlama

Bu proje `https://ylmtalha.github.io/` adresinde yayınlanacak şekilde hazırlanmıştır.

## 1. Repository oluştur

GitHub hesabında yeni ve herkese açık bir repository oluştur:

```text
ylmtalha.github.io
```

Repository adında büyük harf, boşluk veya ek kelime kullanma.

## 2. Proje dosyalarını yükle

ZIP dosyasının içindeki `talha-portfolio` klasörüne gir. GitHub repository'sinin kökünde `package.json`, `index.html`, `assets`, `public` ve `.github` klasörleri görünmelidir.

Terminal kullanacaksan:

```bash
git init
git add .
git commit -m "Yeni portfolyo sitesini ekle"
git branch -M main
git remote add origin https://github.com/YlmTalha/ylmtalha.github.io.git
git push -u origin main
```

## 3. GitHub Pages'i etkinleştir

Repository içerisinde:

1. `Settings` bölümünü aç.
2. Sol menüden `Pages` seçeneğine gir.
3. `Build and deployment` altındaki `Source` seçeneğini `GitHub Actions` yap.
4. `Actions` sekmesinde `Deploy portfolio to GitHub Pages` işleminin tamamlanmasını bekle.

Yayın tamamlandığında site şu adreste açılır:

```text
https://ylmtalha.github.io/
```

Sonraki değişikliklerde yalnızca dosyaları `main` dalına göndermen yeterlidir. GitHub Actions siteyi otomatik olarak yeniden oluşturup yayınlar.

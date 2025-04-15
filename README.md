# AI Track: Use Case #1
# Project: Receipts Analysis

Proyek ini berisi script sederhana untuk mengekstrak informasi dari gambar struk menggunakan layanan Azure AI Document Intelligence. Proyek ini menggunakan Python dan beberapa library untuk memproses gambar dan mengekstrak teks dari struk.

## Menjalankan Proyek

1. Pastikan Anda telah menginstal Python 3.x di sistem Anda.
2. Buat virtual environment untuk proyek ini dengan menjalankan perintah berikut di terminal atau command prompt:

```bash
python -m venv .venv
```

3. Instal dependensi yang diperlukan dengan menjalankan perintah berikut di terminal atau command prompt:

```bash
pip install -r requirements.txt
```

4. Anda bisa membuat folder dengan nama `input` dan isikan dengan gambar struk yang ingin Anda analisis. Anda juga bisa mengubah nama folder input sesuai keinginan Anda, tetapi pastikan untuk memperbarui nama folder di dalam kode jika Anda melakukannya.

5. Jalankan script `main.py` dengan menjalankan perintah berikut di terminal atau command prompt:

```bash
python main.py
```
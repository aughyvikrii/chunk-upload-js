# chunk-upload-js

Digunakan untuk menghandle upload file berukuran besar, agar lebih informatif kepada user sudah sampai mana proses upload berlangsung.

Yang dibutuhkan:
  1. API untuk membuat file kosong
  2. API untuk mengupload bagian ke file kosong tadi

Cara Kerja:

  1. Membuat file kosong ( API create_file )
  2. Membagi file yang akan diupload menjadi beberapa bagian
  3. Mengupload bagian perbagian ( API upload_chunk )

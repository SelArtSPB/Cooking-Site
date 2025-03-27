import os
import random
import io
from base64 import b64encode, b64decode 
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from PIL import Image, ImageDraw, ImageFont

def encrypt(data: str, key: bytes) -> str:
    """Шифрует данные с помощью AES-256"""
    try:
        cipher = AES.new(key, AES.MODE_CBC)
        ct_bytes = cipher.encrypt(pad(data.encode(), AES.block_size))
        return b64encode(cipher.iv + ct_bytes).decode()
    except Exception as e:
        print(f"Ошибка шифрования: {e}")
        raise

def decrypt(data: str, key: bytes) -> str:
    """Расшифровывает данные с помощью AES-256"""
    try:
        raw = b64decode(data)
        if len(raw) < 16:  # Проверка на минимальную длину (должен быть хотя бы IV)
            print(f"Ошибка: Недостаточная длина зашифрованных данных ({len(raw)} байт)")
            return ""
            
        iv, ct = raw[:16], raw[16:]
        cipher = AES.new(key, AES.MODE_CBC, iv)
        return unpad(cipher.decrypt(ct), AES.block_size).decode()
    except ValueError as ve:
        # Ошибка padding обычно возникает при неправильном ключе или формате данных
        print(f"Ошибка при расшифровке (padding): {ve}")
        return ""
    except Exception as e:
        print(f"Общая ошибка при расшифровке: {e}")
        return ""

def generate_avatar(login: str) -> bytes:
    """
    Генерирует аватар пользователя с первой буквой его логина на цветном фоне.
    Возвращает изображение в формате bytes.
    """
    # Размер изображения
    width, height = 256, 256
    
    # Получаем первую букву логина (в верхнем регистре)
    first_letter = login[0].upper()
    
    # Генерируем случайный цвет фона (не слишком темный)
    background_colors = [
        (52, 152, 219),  # Голубой
        (155, 89, 182),  # Пурпурный
        (52, 73, 94),    # Темно-синий
        (231, 76, 60),   # Красный
        (241, 196, 15),  # Желтый
        (46, 204, 113),  # Зеленый
        (230, 126, 34),  # Оранжевый
    ]
    bg_color = random.choice(background_colors)
    
    # Создаем новое изображение с выбранным фоном
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Попытка загрузить шрифт, если не получится - используем дефолтный
    try:
        # Путь к шрифту может отличаться в зависимости от системы
        font_path = "arial.ttf"  # Стандартный шрифт, который должен быть на большинстве систем
        # Если шрифт не найден, будет использован встроенный шрифт PIL
        font = ImageFont.truetype(font_path, size=120)
    except IOError:
        # Если не можем загрузить шрифт, используем дефолтный
        font = ImageFont.load_default().font_variant(size=120)
    
    # Рисуем букву белым цветом в центре изображения
    text_width, text_height = draw.textbbox((0, 0), first_letter, font=font)[2:4]
    position = ((width - text_width) // 2, (height - text_height) // 3)  # Немного выше центра
    draw.text(position, first_letter, font=font, fill=(255, 255, 255))  # Белый цвет
    
    # Конвертируем изображение в байты
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    return img_byte_arr.getvalue()

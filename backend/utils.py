import os
import shutil


# 🔹 KEEP THIS (used in /files API)
def list_recovered_files(folder):
    files = []
    for root, dirs, filenames in os.walk(folder):
        for f in filenames:
            files.append(os.path.join(root, f))
    return files


# 🔹 EXTENSION DETECTION (NEW)
def get_extension(filename):
    # Case 1: normal extension (.jpg)
    if "." in filename:
        return filename.split(".")[-1].lower()

    # Case 2: photorec style (_jpg)
    parts = filename.split("_")
    if len(parts) > 1:
        return parts[-1].lower()

    return ""


# 🔹 MOVE FILE
def move_file(src, base, folder_name):
    dest_folder = os.path.join(base, folder_name)
    os.makedirs(dest_folder, exist_ok=True)

    try:
        shutil.move(src, os.path.join(dest_folder, os.path.basename(src)))
    except:
        pass


# 🔹 ORGANIZE FILES
def organize_files(base_folder):
    for folder in os.listdir(base_folder):
        full_path = os.path.join(base_folder, folder)

        if os.path.isdir(full_path):
            for file in os.listdir(full_path):
                file_path = os.path.join(full_path, file)

                ext = get_extension(file)

                if ext in ["jpg", "png", "jpeg"]:
                    move_file(file_path, base_folder, "images")

                elif ext in ["pdf", "docx", "txt"]:
                    move_file(file_path, base_folder, "documents")

                elif ext in ["mp4", "avi", "mkv"]:
                    move_file(file_path, base_folder, "videos")

                elif ext in ["exe", "dll"]:
                    move_file(file_path, base_folder, "programs")

                elif ext in ["ttf", "otf"]:
                    move_file(file_path, base_folder, "fonts")

                elif ext in ["reg"]:
                    move_file(file_path, base_folder, "system_files")
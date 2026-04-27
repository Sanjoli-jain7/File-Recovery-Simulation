import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

RECOVERY_OUTPUT = os.path.join(BASE_DIR, "recovered_files")

# Change this path to your photorec executable
# PHOTOREC_PATH = "photorec"  # or full path like "C:\\testdisk\\photorec_win.exe"
# PHOTOREC_PATH = r"C:\Users\saksh\Downloads\testdisk-7.3-WIP.win64\testdisk-7.3-WIP\photorec_win.exe"
PHOTOREC_PATH = os.getenv("PHOTOREC_PATH", "photorec")
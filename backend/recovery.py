import subprocess
import os
from config import PHOTOREC_PATH, RECOVERY_OUTPUT


def start_recovery(drive):
    try:
        # Ensure output folder exists
        os.makedirs(RECOVERY_OUTPUT, exist_ok=True)

        command = [
            PHOTOREC_PATH,
            "/d", RECOVERY_OUTPUT,
            "/cmd", drive,
            "search"
        ]

        print("Running command:", command)

        subprocess.run(command, check=True)

        return {"status": "success", "message": "Recovery completed"}

    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": str(e)}
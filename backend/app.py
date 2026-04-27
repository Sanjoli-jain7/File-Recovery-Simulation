from flask import Flask, request, jsonify
from flask_cors import CORS
from recovery import start_recovery
from utils import list_recovered_files
from config import RECOVERY_OUTPUT
from utils import organize_files
import time

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return {"message": "File Recovery Backend Running"}


# 🔥 MAIN API
@app.route("/recover", methods=["POST"])
def recover():
    data = request.get_json()
    drive = data.get("drive")

    if not drive:
        return jsonify({"error": "Drive is required"}), 400

    result = start_recovery(drive)
    time.sleep(10)
    organize_files(RECOVERY_OUTPUT)
    return jsonify(result)


# 📂 GET RECOVERED FILES
@app.route("/files", methods=["GET"])
def get_files():
    files = list_recovered_files(RECOVERY_OUTPUT)
    return jsonify({"files": files})


if __name__ == "__main__":
    app.run(debug=True)
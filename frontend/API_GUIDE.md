# Frontend-Backend API Connection Guide

## Quick Start

### 1. What is an API?

An API (Application Programming Interface) is how your frontend talks to your backend. Think of it like a waiter in a restaurant:
- **Frontend (You)**: Orders food
- **API (Waiter)**: Takes your order to the kitchen
- **Backend (Kitchen)**: Prepares the food
- **API (Waiter)**: Brings food back to you

### 2. How This Project Works

```
User clicks "Start Recovery"
        ↓
React Frontend creates a request
        ↓
fetch() sends HTTP request to Flask
        ↓
Flask receives request → runs PhotoRec
        ↓
Flask sends response back
        ↓
React receives response → updates UI
```

## API Calls Explained

### Example 1: Starting Recovery

**Frontend Code (src/App.tsx):**
```typescript
const result = await api.startRecovery(drive);
```

**What Happens Behind the Scenes (src/services/api.ts):**
```typescript
async startRecovery(drive: string) {
  // 1. Create HTTP POST request
  const response = await fetch('http://localhost:5000/recover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ drive })  // Send drive path
  });

  // 2. Convert response to JSON
  return response.json();  // Returns { status: "success", message: "..." }
}
```

**Backend Code (app.py):**
```python
@app.route("/recover", methods=["POST"])
def recover():
    data = request.get_json()        # Receive data from frontend
    drive = data.get("drive")        # Extract drive path
    result = start_recovery(drive)   # Do the work
    return jsonify(result)           # Send response back
```

### Example 2: Getting Files List

**Frontend:**
```typescript
const response = await api.getRecoveredFiles();
setFiles(response.files);  // Update UI with files
```

**Backend:**
```python
@app.route("/files", methods=["GET"])
def get_files():
    files = list_recovered_files(RECOVERY_OUTPUT)
    return jsonify({"files": files})
```

## Common Patterns

### Pattern 1: GET Request (Fetch Data)

```typescript
// Frontend - Just asking for data
const response = await fetch('http://localhost:5000/files');
const data = await response.json();
```

```python
# Backend - Just return data
@app.route("/files", methods=["GET"])
def get_files():
    return jsonify({"files": ["file1", "file2"]})
```

### Pattern 2: POST Request (Send Data)

```typescript
// Frontend - Sending data to backend
const response = await fetch('http://localhost:5000/recover', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ drive: 'C:' })
});
```

```python
# Backend - Receive and process data
@app.route("/recover", methods=["POST"])
def recover():
    data = request.get_json()
    drive = data.get("drive")
    # Do something with drive...
    return jsonify({"status": "success"})
```

## Adding Your Own API Endpoint

### Step 1: Add Route to Backend

```python
# In app.py
@app.route("/my-new-endpoint", methods=["POST"])
def my_function():
    data = request.get_json()
    # Your logic here
    return jsonify({"result": "success"})
```

### Step 2: Add Function to API Service

```typescript
// In src/services/api.ts
export const api = {
  // ... existing methods ...

  async myNewFunction(param: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/my-new-endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ param })
    });
    return response.json();
  }
};
```

### Step 3: Use in Component

```typescript
// In src/App.tsx or any component
import { api } from './services/api';

const handleClick = async () => {
  const result = await api.myNewFunction("test");
  console.log(result);
};
```

## Error Handling

### Frontend Side

```typescript
try {
  const result = await api.startRecovery(drive);
  // Success!
} catch (error) {
  // Backend is down or returned error
  console.error('Failed:', error);
}
```

### Backend Side

```python
@app.route("/recover", methods=["POST"])
def recover():
    try:
        # Your code
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

## Testing Your API

### Option 1: Use the Frontend
Just use the UI you built!

### Option 2: Use Browser Console

Open DevTools (F12) and run:

```javascript
fetch('http://localhost:5000/files')
  .then(r => r.json())
  .then(data => console.log(data));
```

### Option 3: Use curl (Command Line)

```bash
# GET request
curl http://localhost:5000/files

# POST request
curl -X POST http://localhost:5000/recover \
  -H "Content-Type: application/json" \
  -d '{"drive": "C:"}'
```

## Common Issues

### Issue: "Failed to fetch"
- Backend isn't running
- Wrong port number
- CORS not enabled

**Fix:** Make sure Flask is running and has `CORS(app)`

### Issue: "404 Not Found"
- URL is wrong
- Route doesn't exist in Flask

**Fix:** Check the URL matches your Flask route exactly

### Issue: "500 Internal Server Error"
- Backend code has an error

**Fix:** Check Flask console for error messages

## Key Concepts

1. **fetch()**: Browser function to make HTTP requests
2. **async/await**: Handle asynchronous operations cleanly
3. **JSON**: Format for sending/receiving data
4. **HTTP Methods**:
   - GET: Retrieve data
   - POST: Send data
   - PUT: Update data
   - DELETE: Delete data
5. **CORS**: Allows cross-origin requests (different ports)

## Next Steps

1. Run both servers (Flask + React)
2. Try the recovery feature
3. Open browser DevTools → Network tab
4. Watch the API calls happen in real-time
5. Try modifying the API to add new features!

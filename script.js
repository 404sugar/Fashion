let token = "";

async function unlock() {
  const password = document.getElementById('password').value;

  try {
    const res = await fetch("fashioncrypt.txt");
    const rawText = await res.text();

    // Clean encrypted token
    const encryptedToken = rawText.replace(/^\uFEFF/, '').trim();

    // Decrypt and clean result
    const decrypted = CryptoJS.AES.decrypt(encryptedToken, password);
    const plain = decrypted.toString(CryptoJS.enc.Utf8);
    const cleaned = plain.replace(/[^\x20-\x7E]/g, '').trim();

    if (!cleaned || (!cleaned.startsWith("ghp_") && !cleaned.startsWith("github_pat_"))) {
      alert("Token decrypted but format is unrecognized.");
      return;
    }

    token = cleaned;
    document.getElementById('uploadUI').style.display = 'block';
    alert("Unlocked successfully.");
  } catch (err) {
    alert("Failed to unlock: wrong password or corrupted token.");
    console.error("Decryption error:", err);
  }
}

async function upload() {
  const repo = 'Fashion';
  const owner = '404sugar';

  const imageFile = document.getElementById('imageFile').files[0];
  const designer = document.getElementById('designer').value.trim();
  const collection = document.getElementById('collection').value.trim();
  const rating = document.getElementById('rating').value.trim();
  const review = document.getElementById('review').value.trim();

  if (!imageFile) return alert("No image selected.");
  if (!designer || !collection || !rating || !review) return alert("Please fill in all fields.");

  const reader = new FileReader();

  reader.onload = async () => {
    const base64 = reader.result.split(',')[1];
    const imgName = `${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const newEntry = `{"./Pics/${imgName}", "${designer}", "${collection}", "${rating}", "${review.replace(/\n/g, '\\n')}"}\n`;

    try {
      // Upload image
      await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/Pics/${imgName}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add ${imgName}`,
          content: base64
        })
      });

      // Try to get Fashion.txt
      let data, content = "", sha = null;

      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/Fashion.txt`, {
          headers: { Authorization: `token ${token}` }
        });
        data = await res.json();

        const rawContent = (data.content || '').replace(/\n/g, '').trim();
        try {
          content = rawContent ? atob(rawContent) : "";
          sha = data.sha;
        } catch (decodeErr) {
          console.warn("Base64 decode failed. Starting fresh.");
          content = "";
        }
      } catch (err) {
        console.warn("Fashion.txt not found. Creating a new one.");
        content = "";
      }

      // Append new entry
      content += newEntry;

      // Upload Fashion.txt (new or update)
      await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/Fashion.txt`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update Fashion.txt with ${imgName}`,
          content: btoa(content),
          ...(sha ? { sha } : {}) // Only include SHA if updating existing file
        })
      });

      alert("Upload complete!");

      // Reset form
      document.getElementById('imageFile').value = "";
      document.getElementById('designer').value = "";
      document.getElementById('collection').value = "";
      document.getElementById('rating').value = "";
      document.getElementById('review').value = "";

    } catch (err) {
      alert("Upload failed: " + err.message);
      console.error("Upload error:", err);
    }
  };

  reader.readAsDataURL(imageFile);
}

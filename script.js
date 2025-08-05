let token = "";

  async function unlock() {
    const password = document.getElementById('password').value;
    try {
      const res = await fetch("https://ava-music.org/fashioncrypt.txt");
      const encryptedToken = (await res.text()).trim();

      const decrypted = CryptoJS.AES.decrypt(encryptedToken, password);
      const plain = decrypted.toString(CryptoJS.enc.Utf8);

      if (!plain.startsWith("ghp_")) throw "Invalid token";

      token = plain;
      document.getElementById('uploadUI').style.display = 'block';
      alert("Unlocked successfully.");
    } catch (err) {
      alert("Failed to unlock: wrong password or corrupt token.");
      console.error(err);
    }
  }

  async function upload() {
    const repo = 'Fashion';
    const owner = '404sugar';
    const imageFile = document.getElementById('imageFile').files[0];
    const designer = document.getElementById('designer').value;
    const collection = document.getElementById('collection').value;
    const rating = document.getElementById('rating').value;
    const review = document.getElementById('review').value;

    if (!imageFile) return alert("No image selected.");

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      const imgName = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
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

        // Get and update Fashion.txt
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/Fashion.txt`, {
          headers: { Authorization: `token ${token}` }
        });
        const data = await res.json();
        const content = atob(data.content) + newEntry;

        await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/Fashion.txt`, {
          method: 'PUT',
          headers: {
            Authorization: `token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Update Fashion.txt with ${imgName}`,
            content: btoa(content),
            sha: data.sha
          })
        });

        alert("Upload complete!");
      } catch (err) {
        alert("Upload failed: " + err);
        console.error(err);
      }
    };

    reader.readAsDataURL(imageFile);
  }

async function upload() {
  const token = 'YOUR_GITHUB_PAT'; // keep secret if deploying publicly
  const repo = 'your-repo';
  const owner = 'your-username';
  const imageFile = document.getElementById('imageFile').files[0];
  const designer = document.getElementById('designer').value;
  const collection = document.getElementById('collection').value;
  const rating = document.getElementById('rating').value;
  const review = document.getElementById('review').value;

  if (!imageFile) return alert("No image selected.");

  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result.split(',')[1];
    const imgName = imageFile.name.replace(/\s+/g, '_');

    // Upload image to Pics/
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

    // Append to Fashion.txt
    const newEntry = `{“./Pics/${imgName}”, “${designer}”, “${collection}”, “${rating}”, “${review.replace(/\n/g, '\\n')}”}\n`;

    // Fetch current content
    const fashionRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/Fashion.txt`);
    const fashionData = await fashionRes.json();
    const fashionContent = atob(fashionData.content) + newEntry;

    // Update file
    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/Fashion.txt`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Update Fashion.txt with ${imgName}`,
        content: btoa(fashionContent),
        sha: fashionData.sha
      })
    });

    alert("Upload complete!");
  };

  reader.readAsDataURL(imageFile);
}

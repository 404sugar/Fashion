async function upload() {
  const token = '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';
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

    // Append to fashion.txt
    const newEntry = `{"./Pics/${imgName}", "${designer}", "${collection}", "${rating}", "${review.replace(/\n/g, '\\n')}"}\n`;

    // Fetch current content
    const fashionRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/fashion.txt`);
    const fashionData = await fashionRes.json();
    const fashionContent = atob(fashionData.content) + newEntry;

    // Update file
    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/fashion.txt`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Update fashion.txt with ${imgName}`,
        content: btoa(fashionContent),
        sha: fashionData.sha
      })
    });

    alert("Upload complete!");
  };

  reader.readAsDataURL(imageFile);
}

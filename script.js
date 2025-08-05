const FASHION_TXT_URL = "https://404sugar.github.io/Fashion/Fashion.txt";
const IMAGE_BASE_URL = "https://404sugar.github.io/Fashion/";

async function loadReviews() {
  try {
    const res = await fetch(FASHION_TXT_URL);
    const text = await res.text();

    const entries = text
      .split('\n')
      .filter(line => line.trim().startsWith('{'))
      .reverse(); // Newest first

    const reviewsDiv = document.getElementById("reviews");
    reviewsDiv.innerHTML = '';

    for (const entry of entries) {
      const match = entry.match(/^\{(.*?)\}$/);
      if (!match) continue;

      const parts = match[1].split('", "').map(p =>
        p.replace(/^["{]/, '').replace(/["}]$/, '')
      );

      const [imgPath, designer, collection, rating, review] = parts;

      const container = document.createElement('div');
      container.className = 'review';
      container.innerHTML = `
        <img src="${IMAGE_BASE_URL + imgPath}" alt="${designer}"><br>
        <strong>${designer}</strong> — ${collection} — Rating: ${rating}/5<br>
        <p style="white-space: pre-wrap;">${review.replace(/\\n/g, '\n')}</p>
      `;
      reviewsDiv.appendChild(container);
    }
  } catch (err) {
    document.getElementById("reviews").innerText = "Failed to load reviews.";
    console.error(err);
  }
}

loadReviews();

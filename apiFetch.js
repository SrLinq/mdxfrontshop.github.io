class ApiFetch {
  constructor() {
    this.baseUrl = "https://mdxbackshop.onrender.com";
  }

  async get(url) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return this.handleResponse(response);
  }

  async post(url, data) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async put(url, data) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async handleResponse(response) {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(` request failed: ${response.status} ${text}`);
    }
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (err) {
      return text;
    }
  }
}

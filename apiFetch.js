// ApiFetch class to handle API requests
class ApiFetch {
  constructor() {
    // Base URL for API
    this.baseUrl = "https://mdxbackshop.onrender.com";
  }

  // GET request method
  async get(url) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return this.handleResponse(response);
  }

  // POST request method
  async post(url, data) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  // PUT request method
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

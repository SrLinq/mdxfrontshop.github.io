const apiFunc = new ApiFetch();

new Vue({
  el: "#app",
  data: {
    productsss: [],
    searchTerm: "",
    products: [],
    cart: [],
    currentPage: "catalog",
    activeFilter: "all",
    activeSort: "name-asc",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerCountry: "",
    customerCity: "",
    customerPostcode: "",
    customerAddress: "",
    minPrice: 0,
    maxPrice: 1000,
    selectedLocations: [],
  },
  async created() {
    await this.loadProducts();
  },
  computed: {
    availableLocations() {
      return Array.from(
        new Set(this.products.map((product) => product.location))
      );
    },

    filteredProducts() {
      let products = this.products;

      products = products.filter(
        (product) =>
          this.minPrice <= product.price && product.price <= this.maxPrice
      );

      if (this.activeFilter === "in-stock") {
        products = products.filter((product) => product.stock > 0);
      } else if (this.activeFilter === "out-of-stock") {
        products = products.filter((product) => product.stock === 0);
      } else if (
        this.activeFilter === "location" &&
        this.selectedLocations.length
      ) {
        products = products.filter((product) =>
          this.selectedLocations.includes(product.location)
        );
      }

      const sorted = [...products];
      switch (this.activeSort) {
        case "place-asc":
          sorted.sort((a, b) => a.location.localeCompare(b.location));
          break;
        case "place-desc":
          sorted.sort((a, b) => b.location.localeCompare(a.location));
          break;
        case "name-desc":
          sorted.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "price-asc":
          sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case "price-desc":
          sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        default:
          sorted.sort((a, b) => a.name.localeCompare(b.name));
      }

      return sorted;
    },
    isDetailsComplete() {
      const name = this.customerName.trim();
      const phone = this.customerPhone.trim();
      const email = this.customerEmail.trim();
      const address = this.customerAddress.trim();
      const country = this.customerCountry.trim();
      const city = this.customerCity.trim();
      const postcode = this.customerPostcode.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+?[0-9\s\-()]{7,}$/;
      return Boolean(
        name &&
          country &&
          city &&
          postcode &&
          address &&
          emailRegex.test(email) &&
          phoneRegex.test(phone)
      );
    },
    cartCount() {
      return this.cart.length;
    },
    cartMessage() {
      if (!this.cartCount) {
        return "Your cart is empty.";
      }
      return `You have ${this.cartCount} item${
        this.cartCount === 1 ? "" : "s"
      } in the cart.`;
    },
    cartDetails() {
      const grouped = this.cart.reduce((acc, product) => {
        const id = product._id;
        if (!id) return acc;
        const existing = acc[id] || {
          _id: id,
          name: product.name,
          price: product.price,
          imageUrls: product.imageUrls,
          stock: 0,
        };
        existing.stock += 1;
        acc[id] = existing;
        return acc;
      }, {});
      return Object.values(grouped);
    },
    overallPrice() {
      return this.cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
    },
    overallPriceFormatted() {
      return this.overallPrice.toFixed(2);
    },
  },
  methods: {
    cartCounts(product) {
      const id = product._id;
      if (!id) return 0;
      return this.cart.filter((item) => item._id === id).length;
    },
    async postOrder() {
      if (!this.cartCount || !this.isDetailsComplete) return;
      const order = {
        name: this.customerName,
        phone: this.customerPhone,
        email: this.customerEmail,
        country: this.customerCountry,
        city: this.customerCity,
        postcode: this.customerPostcode,
        address: this.customerAddress,
        cart: this.cartDetails,
        total: this.overallPrice,
      };
      await apiFunc.post("/collection/Orders/order", order);
      await this.resetCheckout();
    },
    async loadProducts() {
      this.products = await apiFunc.get("/collection/Lessons");
    },
    async searchProducts() {
      const term = this.searchTerm.trim();
      if (!term) {
        await this.loadProducts();
        return;
      }
      this.products = await apiFunc.get(`/collection/Lessons/search?q=${term}`);
    },
    goToPage(page) {
      this.currentPage = page;
    },
    proceedToDetails() {
      if (!this.cartCount) {
        return;
      }
      this.goToPage("details");
    },
    reviewOrder() {
      if (!this.isDetailsComplete) {
        return;
      }
      this.goToPage("summary");
    },
    async addToCart(product) {
      const productId = product._id;
      if (!productId || product.stock <= 0) {
        return;
      }
      this.cart.push({
        _id: productId,
        name: product.name,
        price: Number(product.price) || 0,
        imageUrls: product.imageUrls,
      });
      const updatedProduct = await apiFunc.put(
        `/collection/Lessons/${productId}`,
        { stock: -1 }
      );
      if (updatedProduct && updatedProduct.stock !== undefined) {
        product.stock = updatedProduct.stock;
      }
    },
    async deleteFromCart(product) {
      const productId = product._id;
      if (!productId) return;
      const index = this.cart.findIndex((item) => item._id === productId);
      if (index === -1) return;
      const [removed] = this.cart.splice(index, 1);
      const updatedProduct = await apiFunc.put(
        `/collection/Lessons/${removed._id}`,
        { stock: 1 }
      );

      const productInStore = this.products.find((p) => p._id === removed._id);
      if (
        productInStore &&
        updatedProduct &&
        updatedProduct.stock !== undefined
      ) {
        productInStore.stock = updatedProduct.stock;
      }
    },
    async increaseCartItem(item) {
      const product = this.products.find((product) => product._id === item._id);
      if (!product || product.stock <= 0) return;
      await this.addToCart(product);
    },
    async resetCheckout() {
      this.cart = [];
      this.customerName = "";
      this.customerPhone = "";
      this.customerEmail = "";
      this.customerCountry = "";
      this.customerCity = "";
      this.customerPostcode = "";
      this.customerAddress = "";
      this.searchTerm = "";
      this.minPrice = 0;
      this.maxPrice = 1000;
      this.selectedLocations = [];
      this.activeFilter = "all";
      this.activeSort = "name-asc";
      this.goToPage("success");
      await this.loadProducts();
    },
  },
});

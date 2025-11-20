
const apiFunc= new ApiFetch()
const { createApp } = Vue;
      createApp({
        data() {
          return {
            productsss:[],
            searchTerm: "",
            products: [],
            cart: [],
            currentPage: "catalog",
            activeFilter: "all",
            activeSort: "name-asc",
            customerName: "",
            customerPhone: "",
            customerEmail: "",
            customerAddress: "",
            minPrice:0,
            maxPrice:1000,
            selectedLocations: []
          };
        },
        async created(){
        await this.loadProducts()
        },
        computed: {
          availableLocations() {
            return Array.from(
              new Set(this.products.map((product) => product.location))
            );
          },
            
         filteredProducts() {
            const term = this.searchTerm.trim().toLowerCase();
            let products = this.products;

            if (term) {
              products = products.filter((product) => {
                const nameMatch = (product.name || "").toLowerCase().includes(term);
                const locationMatch = (product.location || "").toLowerCase().includes(term);
                return nameMatch || locationMatch;
              });
            }
            
                
             products = products.filter((product)=>this.minPrice<=product.price && product.price<=this.maxPrice)
          

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
                 sorted.sort((a,b)=>a.location.localeCompare(b.location))
                 break;
              case"place-desc":
                   sorted.sort((a,b)=>b.location.localeCompare(a.location))
                   break
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
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^\+?[0-9\s\-()]{7,}$/;
            return Boolean(
              name &&
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
            const counts = new Map();
            this.cart.forEach((product) => {
              const existing = counts.get(product._id);
              if (existing) {
                existing.stock += 1;
              } else {
                counts.set(product._id, {
                  id: product._id,
                  name: product.name,
                  price: product.price,
                  stock: 1,
                });
              }
            });
            return Array.from(counts.values());
          },
          overallPrice() {
            return this.cart.reduce((sum, item) => sum + (item.price || 0), 0);
          },
        },
        methods: {
        async loadProducts(){
        this.products=await apiFunc.get("/collection/Lessons")
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
          addToCart(product) {
            if (product.stock <= 0) {
              return;
            }
            this.cart.push({
              id: product._id,
              name: product.name,
              price: product.price,
            });
            product.stock -= 1;
          },
          deleteFromCart(product) {
            this.cart.shift(product);
            const match = this.products.find((item) => item._id === product._id);
            if (match) {
              match.stock += 1;
            }
          },
        },
      }).mount("#app");

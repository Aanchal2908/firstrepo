const cart = {};

const cartItemsEl = document.getElementById("cart-items");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const cartEmptyEl = document.getElementById("cart-empty");
const clearCartBtn = document.getElementById("clear-cart");
const cartLinkEl = document.getElementById("cart-link");
const addButtons = document.querySelectorAll(".btn-cart");

function getItemCount() {
  return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return Object.values(cart).reduce((sum, item) => sum + item.qty * item.price, 0);
}

function updateCartMeta() {
  const itemCount = getItemCount();
  cartCountEl.textContent = String(itemCount);
  cartTotalEl.textContent = getCartTotal().toFixed(2);
  cartLinkEl.textContent = `Cart (${itemCount})`;
  cartEmptyEl.style.display = itemCount === 0 ? "block" : "none";
}

function renderCart() {
  cartItemsEl.innerHTML = "";
  const items = Object.values(cart);

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <div>
        <h4>${item.name}</h4>
        <p>$${item.price.toFixed(2)} each</p>
      </div>
      <div class="cart-item-controls">
        <button type="button" class="qty-btn" data-action="decrease" data-name="${item.name}">-</button>
        <span>${item.qty}</span>
        <button type="button" class="qty-btn" data-action="increase" data-name="${item.name}">+</button>
      </div>
      <button type="button" class="remove-btn" data-action="remove" data-name="${item.name}">Remove</button>
    `;
    cartItemsEl.appendChild(li);
  });

  updateCartMeta();
}

function addToCart(name, price) {
  if (!cart[name]) {
    cart[name] = { name, price, qty: 0 };
  }
  cart[name].qty += 1;
  renderCart();
}

function updateQty(name, action) {
  if (!cart[name]) return;

  if (action === "increase") {
    cart[name].qty += 1;
  } else if (action === "decrease") {
    cart[name].qty -= 1;
    if (cart[name].qty <= 0) {
      delete cart[name];
    }
  } else if (action === "remove") {
    delete cart[name];
  }

  renderCart();
}

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);
    addToCart(name, price);
  });
});

cartItemsEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.dataset.action;
  const name = target.dataset.name;
  if (!action || !name) return;

  updateQty(name, action);
});

clearCartBtn.addEventListener("click", () => {
  Object.keys(cart).forEach((key) => delete cart[key]);
  renderCart();
});

renderCart();
const CART_STORAGE_KEY = "brightbox-cart";

const cartLink = document.querySelector(".nav-cta");
const addToCartButtons = document.querySelectorAll(".btn-cart");

let cartItems = loadCart();

updateCartDisplay();

addToCartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const productCard = button.closest(".product-card");
    const name = productCard.querySelector("h3")?.textContent?.trim() || "Item";
    const priceText = productCard.querySelector(".price")?.textContent || "$0";
    const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;

    cartItems.push({
      name,
      price,
      quantity: 1,
    });

    persistCart();
    updateCartDisplay();
    button.textContent = "Added!";
    setTimeout(() => {
      button.textContent = "Add to cart";
    }, 700);
  });
});

if (cartLink) {
  cartLink.addEventListener("click", (event) => {
    event.preventDefault();
    const totalItems = cartItems.length;
    const totalPrice = getCartTotal();

    if (totalItems === 0) {
      alert("Your cart is empty.");
      return;
    }

    const shouldClear = confirm(
      `Cart items: ${totalItems}\nTotal: $${totalPrice.toFixed(2)}\n\nPress OK to clear cart or Cancel to keep shopping.`
    );

    if (shouldClear) {
      cartItems = [];
      persistCart();
      updateCartDisplay();
    }
  });
}

function getCartTotal() {
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function updateCartDisplay() {
  if (!cartLink) {
    return;
  }
  cartLink.textContent = `Cart (${cartItems.length})`;
}

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function persistCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

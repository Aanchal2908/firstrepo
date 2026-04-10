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

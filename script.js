// script.js - simple cart stored in localStorage, WhatsApp checkout
(function () {
  const WA_NUMBER = "26778177347"; // your WhatsApp number without plus sign
  const CURRENCY = "P";

  // Helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const formatPrice = p => `${CURRENCY}${p}`;

  // product buttons on shop page
  function initProductButtons() {
    $$(".add-cart").forEach(btn => btn.addEventListener("click", onAddToCartClick));
    $$(".buy-now").forEach(btn => btn.addEventListener("click", onBuyNowClick));
  }

  // Cart management
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem("hp_cart") || "[]");
    } catch {
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem("hp_cart", JSON.stringify(cart));
    updateCartUI();
  }

  function addToCart(item) {
    const cart = getCart();
    const found = cart.find(i => i.id === item.id);
    if (found) found.qty += 1;
    else cart.push({...item, qty: 1});
    saveCart(cart);
  }
  function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(i => i.id !== id);
    saveCart(cart);
  }
  function clearCart() { saveCart([]); }

  function cartCount() {
    return getCart().reduce((s,i)=>s+i.qty,0);
  }
  function cartTotal() {
    return getCart().reduce((s,i)=>s + (i.price * i.qty),0);
  }

  // UI
  function updateCartUI() {
    const countEls = $$("#cart-count");
    countEls.forEach(el => el.textContent = cartCount());
    // if cart modal exists update items
    const cartItemsEl = $("#cart-items");
    if (cartItemsEl) {
      cartItemsEl.innerHTML = "";
      const cart = getCart();
      if (cart.length === 0) {
        cartItemsEl.innerHTML = `<p class="muted">Your cart is empty.</p>`;
      } else {
        cart.forEach(i => {
          const div = document.createElement("div");
          div.className = "cart-item";
          div.innerHTML = `<div><strong>${i.name}</strong> <div class="muted">x${i.qty}</div></div><div>${formatPrice(i.price * i.qty)} <button data-id="${i.id}" class="remove-item muted">Remove</button></div>`;
          cartItemsEl.appendChild(div);
        });
      }
      $("#cart-total").textContent = formatPrice(cartTotal());
      $$(".remove-item", cartItemsEl).forEach(b => b.addEventListener("click", e => removeFromCart(b.dataset.id)));
    }
  }

  // Events
  function onAddToCartClick(e) {
    const card = e.target.closest(".product-card");
    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = Number(card.dataset.price);
    addToCart({id, name, price});
    flash("Added to cart");
  }

  function onBuyNowClick(e) {
    const card = e.target.closest(".product-card");
    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = Number(card.dataset.price);
    // Build WhatsApp message for single item purchase
    const msg = `Hello Huncho! I'd like to buy:\n- ${name} x1\nPrice: ${CURRENCY}${price}\n\nPlease confirm payment and delivery. Thanks!`;
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  // Cart modal controls
  function initCartModal() {
    const cartBtn = document.querySelectorAll("#cart-btn");
    const modal = $("#cart-modal");
    const close = $("#cart-close");
    const checkout = $("#checkout-wa");
    const clear = $("#clear-cart");

    cartBtn.forEach(b => b.addEventListener("click", () => {
      if (modal) {
        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
        updateCartUI();
      }
    }));
    if (close) close.addEventListener("click", () => { modal.classList.add("hidden"); modal.setAttribute("aria-hidden","true"); });
    if (clear) clear.addEventListener("click", () => { clearCart(); flash("Cart cleared"); });

    if (checkout) checkout.addEventListener("click", () => {
      const cart = getCart();
      if (cart.length === 0) { flash("Your cart is empty"); return; }
      let text = `Hello Huncho! I'd like to place an order:%0A`;
      cart.forEach(i => text += `- ${i.name} x${i.qty} (P${i.price})%0A`);
      text += `%0ATotal: P${cartTotal()}%0A%0APlease confirm payment and delivery. Thanks!`;
      const url = `https://wa.me/${WA_NUMBER}?text=${text}`;
      window.open(url, "_blank");
    });
  }

  // helper flash message
  function flash(msg) {
    const el = document.createElement("div");
    el.className = "flash";
    el.textContent = msg;
    Object.assign(el.style, {position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",background:"#07231a",color:"#fff",padding:"10px 14px",borderRadius:"8px",zIndex:9999});
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),1800);
  }

  // prepare mailto form on contact page
  window.prepareMail = function () {
    const name = document.getElementById("sender-name").value;
    const email = document.getElementById("sender-email").value;
    const msg = document.getElementById("sender-msg").value;
    const subject = encodeURIComponent(`Contact from website: ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`);
    window.location.href = `mailto:solololejwadilwe@gmail.com?subject=${subject}&body=${body}`;
    return false; // prevent default (we handled redirect)
  };

  // On load - attach events
  document.addEventListener("DOMContentLoaded", () => {
    initProductButtons();
    initCartModal();
    updateCartUI();
    // hook up add-to-cart buttons that might be added after load
    document.body.addEventListener("click", (e) => {
      if (e.target && e.target.matches(".add-cart")) onAddToCartClick(e);
      if (e.target && e.target.matches(".buy-now")) onBuyNowClick(e);
    });

    // set year in footer
    const yearEls = document.querySelectorAll("#year");
    yearEls.forEach(y => y.textContent = new Date().getFullYear());
  });
})();

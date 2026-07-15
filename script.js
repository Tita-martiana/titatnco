// Cart Management
class ShoppingCart {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderCart();
    this.updateBadge();
  }

  setupEventListeners() {
    const cartBtn = document.getElementById('cartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

    cartBtn.addEventListener('click', () => this.toggleCart());
    closeCartBtn.addEventListener('click', () => this.toggleCart());
    cartOverlay.addEventListener('click', () => this.toggleCart());
    checkoutBtn.addEventListener('click', () => this.checkout());
    clearCartBtn.addEventListener('click', () => this.clearCart());

    addToCartBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const product = e.target.dataset.product;
        const price = parseInt(e.target.dataset.price);
        this.addItem(product, price);
        this.showNotification(`${product} ditambahkan ke keranjang!`);
      });
    });
  }

  toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  }

  addItem(product, price) {
    const existingItem = this.cart.find(item => item.product === product);

    if (existingItem) {
      existingItem.qty++;
    } else {
      this.cart.push({ product, price, qty: 1 });
    }

    this.saveCart();
    this.renderCart();
    this.updateBadge();
  }

  removeItem(product) {
    this.cart = this.cart.filter(item => item.product !== product);
    this.saveCart();
    this.renderCart();
    this.updateBadge();
  }

  updateQuantity(product, qty) {
    const item = this.cart.find(item => item.product === product);
    if (item) {
      item.qty = Math.max(1, qty);
      if (item.qty === 0) {
        this.removeItem(product);
      } else {
        this.saveCart();
        this.renderCart();
        this.updateBadge();
      }
    }
  }

  clearCart() {
    if (confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
      this.cart = [];
      this.saveCart();
      this.renderCart();
      this.updateBadge();
      this.showNotification('Keranjang telah dikosongkan');
    }
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (this.cart.length === 0) {
      cartItems.innerHTML = '<div class="cart-empty">Keranjang Anda kosong</div>';
      cartTotal.textContent = 'Rp 0';
      return;
    }

    let total = 0;
    let html = '';

    this.cart.forEach(item => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;

      html += `
        <div class="cart-item">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.product}</div>
            <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
            <div class="cart-item-controls">
              <button class="qty-btn" onclick="cart.updateQuantity('${item.product}', ${item.qty - 1})">−</button>
              <div class="qty-display">${item.qty}</div>
              <button class="qty-btn" onclick="cart.updateQuantity('${item.product}', ${item.qty + 1})">+</button>
              <button class="remove-btn" onclick="cart.removeItem('${item.product}')">Hapus</button>
            </div>
          </div>
        </div>
      `;
    });

    cartItems.innerHTML = html;
    cartTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
  }

  updateBadge() {
    const badge = document.getElementById('cartBadge');
    const total = this.cart.reduce((sum, item) => sum + item.qty, 0);

    if (total > 0) {
      badge.textContent = total;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  getTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }

  checkout() {
    if (this.cart.length === 0) {
      this.showNotification('Keranjang Anda kosong!');
      return;
    }

    const total = this.getTotal();
    const items = this.cart.map(item => `${item.product} (x${item.qty})`).join(', ');

    document.getElementById('product').value = items.substring(0, 50);
    document.getElementById('message').value = `Pesanan: ${items}\n\nTotal: Rp ${total.toLocaleString('id-ID')}`;

    this.toggleCart();
    this.showNotification('Silakan isi form untuk melanjutkan checkout');

    setTimeout(() => {
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }

  showNotification(message) {
    const toast = document.getElementById('notification');
    toast.querySelector('span').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

// Initialize Cart
const cart = new ShoppingCart();

// Form Management
const form = document.getElementById('contactForm');
const closeBtn = document.getElementById('closeToast');
const message = document.querySelector('#notification span');

// Payment instructions by method
const paymentInstructions = {
  'Transfer Bank': `
    <strong>Instruksi Transfer Bank:</strong>
    <p>1. Salin nomor rekening yang akan diberikan via WhatsApp/Email</p>
    <p>2. Lakukan transfer sesuai total yang ditampilkan</p>
    <p>3. Kirim bukti transfer ke WhatsApp kami</p>
    <p>4. Pesanan akan diproses setelah kami konfirmasi pembayaran</p>
  `,
  'E-Wallet': `
    <strong>Instruksi E-Wallet (GCash, Dana, OVO, GoPay):</strong>
    <p>1. Kami akan mengirimkan link pembayaran via WhatsApp/Email</p>
    <p>2. Buka link dan pilih metode e-wallet Anda</p>
    <p>3. Selesaikan pembayaran sesuai instruksi</p>
    <p>4. Pesanan akan diproses secara otomatis setelah pembayaran</p>
  `,
  'COD': `
    <strong>Instruksi Cash on Delivery (COD):</strong>
    <p>1. Pesanan Anda akan dikemas dan disiapkan</p>
    <p>2. Kurir akan menghubungi untuk jadwal pengiriman</p>
    <p>3. Bayar langsung saat barang tiba</p>
    <p>4. Pastikan uang pas atau siapkan kembalian</p>
  `
};

function showPaymentModal(formData) {
  const modal = document.getElementById('paymentModal');

  document.getElementById('modalName').textContent = formData.name;
  document.getElementById('modalEmail').textContent = formData.email;
  document.getElementById('modalPhone').textContent = formData.phone;
  document.getElementById('modalAddress').textContent = formData.address;
  document.getElementById('modalProduct').textContent = formData.product;
  document.getElementById('modalPayment').textContent = formData.payment;
  document.getElementById('modalDate').textContent = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let total = cart.getTotal();
  if (total === 0) {
    total = 250000; // Default amount if cart is empty
  }
  document.getElementById('modalTotal').textContent = `Rp ${total.toLocaleString('id-ID')}`;

  const instructionsDiv = document.getElementById('paymentInstructions');
  instructionsDiv.innerHTML = paymentInstructions[formData.payment] || '';

  modal.style.display = 'flex';
  modal.classList.add('active');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const product = document.getElementById('product').value;
  const payment = document.getElementById('payment').value;
  const notes = document.getElementById('message').value.trim();

  if (!name || !email || !phone || !address || !product || !payment || !notes) {
    message.textContent = 'Silakan lengkapi semua data sebelum melanjutkan.';
    document.getElementById('notification').classList.add('show');
    setTimeout(() => document.getElementById('notification').classList.remove('show'), 3200);
    return;
  }

  if (!/\d{10,}/.test(phone.replace(/\D/g, ''))) {
    message.textContent = 'Nomor WhatsApp harus valid (minimal 10 digit).';
    document.getElementById('notification').classList.add('show');
    setTimeout(() => document.getElementById('notification').classList.remove('show'), 3200);
    return;
  }

  showPaymentModal({
    name,
    email,
    phone,
    address,
    product,
    payment
  });

  form.reset();
  cart.clearCart();
});

closeBtn.addEventListener('click', () => {
  document.getElementById('notification').classList.remove('show');
});

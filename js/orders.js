// Orders page logic

(function() {
  var orders = [];
  var currentFilter = 'All';

  fetchJSON('/data/orders.json', function(err, data) {
    if (!err) {
      orders = data;
      var stored = localStorage.getItem('restock_orders');
      if (stored) {
        try { orders = orders.concat(JSON.parse(stored)); } catch(e) {}
      }
      renderOrders();
    }
  });

  function renderOrders() {
    var filtered = currentFilter === 'All'
      ? orders
      : orders.filter(function(o) { return o.status === currentFilter; });

    var tbody = document.getElementById('orders-body');
    tbody.innerHTML = '';
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No orders found.</td></tr>';
      return;
    }
    filtered.forEach(function(o) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><strong>' + o.id + '</strong></td>' +
        '<td>' + o.customerName + '</td>' +
        '<td>' + o.productName + '</td>' +
        '<td>' + o.quantity + '</td>' +
        '<td>' + getStatusBadge(o.status) + '</td>' +
        '<td>' + formatDate(o.orderDate) + '</td>' +
        '<td><strong>' + formatCurrency(o.total) + '</strong></td>';
      tbody.appendChild(tr);
    });

    // Update count label
    var countEl = document.getElementById('orders-count');
    if (countEl) countEl.textContent = filtered.length + ' order' + (filtered.length !== 1 ? 's' : '');
  }

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      currentFilter = btn.getAttribute('data-filter');
      document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderOrders();
    });
  });
})();

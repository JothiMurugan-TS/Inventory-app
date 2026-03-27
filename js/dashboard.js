// Dashboard page logic

(function() {
  var products = [];
  var orders = [];
  var loadedCount = 0;

  function onLoaded() {
    loadedCount++;
    if (loadedCount === 2) renderDashboard();
  }

  fetchJSON('/data/products.json', function(err, data) {
    if (!err) products = data;
    onLoaded();
  });

  fetchJSON('/data/orders.json', function(err, data) {
    if (!err) orders = data;
    onLoaded();
  });

  function renderDashboard() {
    var totalProducts = products.length;
    var totalOrders = orders.length;
    var totalRevenue = orders.reduce(function(sum, o) { return sum + o.total; }, 0);
    var lowStockCount = products.filter(function(p) { return p.stock <= p.reorderLevel; }).length;

    document.getElementById('kpi-products').textContent = totalProducts;
    document.getElementById('kpi-orders').textContent = totalOrders;
    document.getElementById('kpi-revenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('kpi-lowstock').textContent = lowStockCount;

    // Orders by status
    var statusCounts = { Pending: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
    orders.forEach(function(o) {
      if (statusCounts.hasOwnProperty(o.status)) statusCounts[o.status]++;
    });
    document.getElementById('count-pending').textContent = statusCounts.Pending;
    document.getElementById('count-shipped').textContent = statusCounts.Shipped;
    document.getElementById('count-delivered').textContent = statusCounts.Delivered;
    document.getElementById('count-cancelled').textContent = statusCounts.Cancelled;

    // Recent orders (last 10 by date)
    var sorted = orders.slice().sort(function(a, b) {
      return new Date(b.orderDate) - new Date(a.orderDate);
    });
    var recent = sorted.slice(0, 10);
    var tbody = document.getElementById('recent-orders-body');
    tbody.innerHTML = '';
    recent.forEach(function(o) {
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
  }
})();

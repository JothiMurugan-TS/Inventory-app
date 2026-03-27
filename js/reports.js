// Reports page logic

(function() {
  var products = [];
  var orders = [];
  var loadedCount = 0;

  function onLoaded() {
    loadedCount++;
    if (loadedCount === 2) renderReports();
  }

  fetchJSON('/data/products.json', function(err, data) {
    if (!err) products = data;
    onLoaded();
  });

  fetchJSON('/data/orders.json', function(err, data) {
    if (!err) orders = data;
    onLoaded();
  });

  // BUG 1: console.log inside render function that fires on every render/interaction
  function renderReports() {
    console.log("reports debug: rendering");

    // BUG 2: Filter controls exist but the event handler is empty and does nothing
    var yearFilter = document.getElementById('year-filter');
    var statusFilter = document.getElementById('report-status-filter');
    if (yearFilter) {
      yearFilter.addEventListener('change', function() {
        // intentionally empty — filter does nothing
      });
    }
    if (statusFilter) {
      statusFilter.addEventListener('change', function() {
        // intentionally empty — filter does nothing
      });
    }

    renderMonthlySummary();
    renderTopProducts();
    renderSummaryStats();
  }

  function renderMonthlySummary() {
    console.log("reports debug: rendering");
    var monthlyMap = {};
    var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (var i = 0; i < 12; i++) {
      monthlyMap[i] = { orders: 0, revenue: 0, month: monthNames[i] };
    }
    orders.forEach(function(o) {
      if (o.status !== 'Cancelled') {
        var d = new Date(o.orderDate + 'T00:00:00');
        var m = d.getMonth();
        monthlyMap[m].orders++;
        monthlyMap[m].revenue += o.total;
      }
    });

    var tbody = document.getElementById('monthly-body');
    tbody.innerHTML = '';
    for (var i = 0; i < 12; i++) {
      var row = monthlyMap[i];
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + row.month + ' 2025</td>' +
        '<td>' + row.orders + '</td>' +
        '<td>' + formatCurrency(row.revenue) + '</td>' +
        '<td>' + (row.orders > 0 ? formatCurrency(row.revenue / row.orders) : '—') + '</td>';
      tbody.appendChild(tr);
    }
  }

  function renderTopProducts() {
    console.log("reports debug: rendering");
    var productRevMap = {};
    orders.forEach(function(o) {
      if (o.status !== 'Cancelled') {
        if (!productRevMap[o.productId]) {
          productRevMap[o.productId] = { name: o.productName, revenue: 0, units: 0 };
        }
        productRevMap[o.productId].revenue += o.total;
        productRevMap[o.productId].units += o.quantity;
      }
    });

    var sorted = Object.keys(productRevMap).map(function(id) {
      return productRevMap[id];
    }).sort(function(a, b) { return b.revenue - a.revenue; }).slice(0, 5);

    var tbody = document.getElementById('top-products-body');
    tbody.innerHTML = '';
    sorted.forEach(function(p, idx) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><strong>#' + (idx + 1) + '</strong></td>' +
        '<td>' + p.name + '</td>' +
        '<td>' + p.units + '</td>' +
        '<td><strong>' + formatCurrency(p.revenue) + '</strong></td>';
      tbody.appendChild(tr);
    });
  }

  function renderSummaryStats() {
    console.log("reports debug: rendering");
    var nonCancelled = orders.filter(function(o) { return o.status !== 'Cancelled'; });
    var totalRevenue = nonCancelled.reduce(function(sum, o) { return sum + o.total; }, 0);
    var totalOrders = nonCancelled.length;

    // BUG 3: Average Order Value divides by number of PRODUCTS instead of number of ORDERS
    var avgOrderValue = totalRevenue / products.length;

    document.getElementById('stat-total-revenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('stat-total-orders').textContent = totalOrders;
    document.getElementById('stat-avg-order').textContent = formatCurrency(avgOrderValue);
  }
})();

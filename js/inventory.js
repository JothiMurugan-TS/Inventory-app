// Inventory page logic

(function() {
  var products = [];

  fetchJSON('/data/products.json', function(err, data) {
    if (!err) {
      products = data;
      renderInventory(products);
    }
  });

  function renderInventory(list) {
    var tbody = document.getElementById('inventory-body');
    tbody.innerHTML = '';
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No products found.</td></tr>';
      return;
    }
    list.forEach(function(p) {
      var isLow = p.stock <= p.reorderLevel;
      var tr = document.createElement('tr');
      if (isLow) tr.classList.add('low-stock');
      tr.innerHTML =
        '<td><strong>' + p.id + '</strong></td>' +
        '<td>' + p.name + '</td>' +
        '<td><code style="font-size:12px;color:#64748b">' + p.sku + '</code></td>' +
        '<td><span class="badge badge-gray">' + p.category + '</span></td>' +
        '<td>' + formatCurrency(p.price) + '</td>' +
        '<td>' +
          (isLow
            ? '<span style="color:#c2410c;font-weight:700">' + p.stock + '</span> <span style="font-size:11px;color:#f97316">&#9650; Low</span>'
            : p.stock) +
        '</td>' +
        '<td style="color:#94a3b8">' + p.reorderLevel + '</td>' +
        '<td>' + p.warehouse + '</td>';
      tbody.appendChild(tr);
    });
  }

  function applyFilters() {
    var searchVal = document.getElementById('search-input').value.toLowerCase().trim();
    var categoryVal = document.getElementById('category-filter').value;
    var filtered = products.filter(function(p) {
      var matchSearch = !searchVal ||
        p.name.toLowerCase().includes(searchVal) ||
        p.sku.toLowerCase().includes(searchVal) ||
        p.id.toLowerCase().includes(searchVal);
      var matchCategory = !categoryVal || p.category === categoryVal;
      return matchSearch && matchCategory;
    });
    renderInventory(filtered);
  }

  document.getElementById('search-input').addEventListener('input', applyFilters);
  document.getElementById('category-filter').addEventListener('change', applyFilters);
})();

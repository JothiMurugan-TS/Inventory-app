// Restocking page logic

(function() {
  var lowStockItems = [];  // sorted by deficit desc

  fetchJSON('/data/products.json', function(err, data) {
    if (err) return;

    // Filter to items at or below reorder level, sort by deficit (most critical first)
    lowStockItems = data
      .filter(function(p) { return p.stock <= p.reorderLevel; })
      .sort(function(a, b) {
        return (b.reorderLevel - b.stock) - (a.reorderLevel - a.stock);
      });

    if (lowStockItems.length === 0) {
      document.getElementById('restock-body').innerHTML =
        '<tr><td colspan="9" class="empty-state">No items are below reorder level. Stock levels look good!</td></tr>';
      document.getElementById('budget-section').style.display = 'none';
      document.getElementById('place-order-btn').disabled = true;
      return;
    }

    // Compute max budget = full cost to restock everything at default qty
    var maxBudget = lowStockItems.reduce(function(sum, p) {
      return sum + (p.reorderLevel - p.stock) * p.price;
    }, 0);
    maxBudget = Math.ceil(maxBudget);

    var slider = document.getElementById('budget-slider');
    slider.max = maxBudget;
    slider.value = Math.round(maxBudget * 0.5);
    document.getElementById('budget-display').textContent = formatCurrency(slider.value);

    renderTable();
    updateSummary();
  });

  function renderTable() {
    var tbody = document.getElementById('restock-body');
    tbody.innerHTML = '';
    lowStockItems.forEach(function(p, idx) {
      var defaultQty = p.reorderLevel - p.stock;
      var rowTotal = defaultQty * p.price;
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="badge badge-gray" style="font-size:11px">#' + (idx + 1) + '</span></td>' +
        '<td>' +
          '<div style="font-weight:700;color:#1a2332">' + p.name + '</div>' +
          '<div style="font-size:11px;color:#94a3b8">' + p.category + '</div>' +
        '</td>' +
        '<td style="color:#64748b;font-size:13px">' + p.warehouse + '</td>' +
        '<td>' + formatCurrency(p.price) + '</td>' +
        '<td>' +
          '<span style="color:#c2410c;font-weight:700">' + p.stock + '</span>' +
          ' <span style="font-size:11px;color:#94a3b8">/ ' + p.reorderLevel + '</span>' +
        '</td>' +
        '<td style="color:#64748b">' + defaultQty + ' units short</td>' +
        '<td>' +
          '<input type="number" class="restock-qty filter-input" ' +
            'data-idx="' + idx + '" ' +
            'data-price="' + p.price + '" ' +
            'value="' + defaultQty + '" min="1" ' +
            'style="width:80px;min-width:unset;padding:5px 8px">' +
        '</td>' +
        '<td class="row-total" data-idx="' + idx + '" style="font-weight:700">' +
          formatCurrency(rowTotal) +
        '</td>' +
        '<td style="text-align:center">' +
          '<input type="checkbox" class="restock-check" data-idx="' + idx + '" ' +
            'checked style="width:16px;height:16px;cursor:pointer">' +
        '</td>';
      tbody.appendChild(tr);
    });

    // Attach events after DOM is built
    document.querySelectorAll('.restock-qty').forEach(function(input) {
      input.addEventListener('input', function() {
        var idx = parseInt(this.getAttribute('data-idx'));
        var price = parseFloat(this.getAttribute('data-price'));
        var qty = Math.max(1, parseInt(this.value) || 1);
        this.value = qty;
        var rowTotalEl = document.querySelector('.row-total[data-idx="' + idx + '"]');
        rowTotalEl.textContent = formatCurrency(qty * price);
        updateSummary();
      });
    });

    document.querySelectorAll('.restock-check').forEach(function(cb) {
      cb.addEventListener('change', updateSummary);
    });
  }

  function updateSummary() {
    var budget = parseFloat(document.getElementById('budget-slider').value) || 0;
    var selected = 0;
    var checkedCount = 0;

    document.querySelectorAll('.restock-check').forEach(function(cb) {
      if (cb.checked) {
        var idx = parseInt(cb.getAttribute('data-idx'));
        var qtyInput = document.querySelector('.restock-qty[data-idx="' + idx + '"]');
        var qty = Math.max(1, parseInt(qtyInput.value) || 1);
        selected += qty * lowStockItems[idx].price;
        checkedCount++;
      }
    });

    var overBudget = selected > budget;
    var summaryEl = document.getElementById('order-summary');
    summaryEl.innerHTML =
      '<span>Selected: <strong>' + formatCurrency(selected) + '</strong></span>' +
      '<span style="margin:0 10px;color:#cbd5e1">|</span>' +
      '<span>Budget: <strong>' + formatCurrency(budget) + '</strong></span>';

    if (overBudget) {
      summaryEl.style.color = '#dc2626';
      document.getElementById('over-budget-warn').style.display = 'inline';
    } else {
      summaryEl.style.color = '#166534';
      document.getElementById('over-budget-warn').style.display = 'none';
    }

    var btn = document.getElementById('place-order-btn');
    btn.disabled = (checkedCount === 0 || overBudget);
  }

  // Budget slider
  document.getElementById('budget-slider').addEventListener('input', function() {
    document.getElementById('budget-display').textContent = formatCurrency(this.value);
    updateSummary();
  });

  // Place Order
  document.getElementById('place-order-btn').addEventListener('click', function() {
    var stored = localStorage.getItem('restock_orders');
    var existing = [];
    try { existing = stored ? JSON.parse(stored) : []; } catch(e) {}

    var nextNum = existing.length + 1;
    var today = new Date();
    var dateStr = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');

    var newOrders = [];
    document.querySelectorAll('.restock-check').forEach(function(cb) {
      if (cb.checked) {
        var idx = parseInt(cb.getAttribute('data-idx'));
        var p = lowStockItems[idx];
        var qtyInput = document.querySelector('.restock-qty[data-idx="' + idx + '"]');
        var qty = Math.max(1, parseInt(qtyInput.value) || 1);
        var id = 'RS' + String(nextNum).padStart(3, '0');
        nextNum++;
        newOrders.push({
          id: id,
          customerName: 'Internal Restock',
          productId: p.id,
          productName: p.name,
          quantity: qty,
          status: 'Restocking',
          orderDate: dateStr,
          total: qty * p.price
        });
      }
    });

    localStorage.setItem('restock_orders', JSON.stringify(existing.concat(newOrders)));

    // Show success, reset form
    document.getElementById('order-success').style.display = 'flex';
    document.querySelectorAll('.restock-check').forEach(function(cb) { cb.checked = false; });
    updateSummary();

    // Auto-hide after 4s
    setTimeout(function() {
      document.getElementById('order-success').style.display = 'none';
    }, 4000);
  });
})();

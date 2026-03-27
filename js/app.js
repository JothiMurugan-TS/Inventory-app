// Shared navigation and utility functions

function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-item');
  links.forEach(function(link) {
    const href = link.getAttribute('data-href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function formatCurrency(value) {
  return '$' + Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusBadge(status) {
  const map = {
    'Pending':   '<span class="badge badge-yellow">Pending</span>',
    'Shipped':   '<span class="badge badge-blue">Shipped</span>',
    'Delivered': '<span class="badge badge-green">Delivered</span>',
    'Cancelled':   '<span class="badge badge-red">Cancelled</span>',
    'Restocking':  '<span class="badge badge-teal">Restocking</span>'
  };
  return map[status] || '<span class="badge badge-gray">' + status + '</span>';
}

function fetchJSON(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          callback(null, JSON.parse(xhr.responseText));
        } catch(e) {
          callback(e, null);
        }
      } else {
        callback(new Error('HTTP ' + xhr.status), null);
      }
    }
  };
  xhr.send();
}

function buildSidebar(activePage) {
  return '<div class="sidebar">' +
    '<div class="sidebar-brand">' +
      '<div class="brand-icon">&#9783;</div>' +
      '<div>' +
        '<div class="brand-name">InvTrack</div>' +
        '<div class="brand-sub">Inventory Manager</div>' +
      '</div>' +
    '</div>' +
    '<nav class="sidebar-nav">' +
      '<div class="nav-section-label">Main Menu</div>' +
      '<a href="index.html" class="nav-item' + (activePage === 'dashboard' ? ' active' : '') + '" data-href="index.html">' +
        '<span class="nav-icon">&#9783;</span> Dashboard' +
      '</a>' +
      '<a href="inventory.html" class="nav-item' + (activePage === 'inventory' ? ' active' : '') + '" data-href="inventory.html">' +
        '<span class="nav-icon">&#9741;</span> Inventory' +
      '</a>' +
      '<a href="orders.html" class="nav-item' + (activePage === 'orders' ? ' active' : '') + '" data-href="orders.html">' +
        '<span class="nav-icon">&#128666;</span> Orders' +
      '</a>' +
      '<a href="reports.html" class="nav-item' + (activePage === 'reports' ? ' active' : '') + '" data-href="reports.html">' +
        '<span class="nav-icon">&#128202;</span> Reports' +
      '</a>' +
    '</nav>' +
    '<div class="sidebar-footer">&#169; 2025 InvTrack</div>' +
  '</div>';
}

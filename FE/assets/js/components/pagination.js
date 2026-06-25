/**
 * pagination.js — Pagination component
 */
export const Pagination = {
  render: (total, page, limit, onPageChangeName) => {
    const totalPages = Math.ceil(total / limit) || 1;
    if (totalPages <= 1) return '';

    let html = `<div class="pagination" style="margin-top: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%;">`;
    html += `<span class="text-muted" style="color: var(--ink-mute); font-size: 13px;">Trang ${page}/${totalPages} (Tổng ${total} bản ghi)</span>`;
    html += `<div style="display: flex; gap: 8px; align-items: center;">`;

    // Back button
    html += `<button class="btn btn-secondary btn-sm" ${page === 1 ? 'disabled' : ''} onclick="${onPageChangeName}(${page - 1})">◀ Trước</button>`;

    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        html += `<button class="btn btn-sm ${i === page ? 'btn-primary' : 'btn-secondary'}" onclick="${onPageChangeName}(${i})">${i}</button>`;
      } else if (i === 2 || i === totalPages - 1) {
        html += `<span style="padding: 0 4px; color: var(--ink-mute);">...</span>`;
      }
    }

    // Next button
    html += `<button class="btn btn-secondary btn-sm" ${page === totalPages ? 'disabled' : ''} onclick="${onPageChangeName}(${page + 1})">Sau ▶</button>`;
    html += `</div></div>`;

    return html;
  }
};

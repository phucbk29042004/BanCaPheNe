/**
 * confirm.js — Confirmation Dialog Component wrapping modal.js
 */
import { Modal } from './modal.js';

export const Confirm = {
  ask: (message, danger = false) => {
    return new Promise((resolve) => {
      Modal.open({
        title: 'Xác nhận hành động',
        content: `
          <div style="padding: 12px 0;">
            <p style="font-size: 16px; color: var(--ink); line-height: 1.5;">${message}</p>
          </div>
        `,
        onConfirm: () => {
          resolve(true);
        },
        size: 'sm',
        danger
      });

      // Catch modal close/cancel
      const modalOverlay = document.getElementById('modal-overlay');
      const closeBtn = modalOverlay?.querySelector('.modal-close');
      const cancelBtn = modalOverlay?.querySelector('[data-action="cancel"]');

      const handleCancel = () => {
        resolve(false);
      };

      closeBtn?.addEventListener('click', handleCancel);
      cancelBtn?.addEventListener('click', handleCancel);
    });
  }
};

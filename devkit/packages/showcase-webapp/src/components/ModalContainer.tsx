import { useModals } from '@conflux-devkit/ui-primitives';

export function ModalContainer() {
  const { modals, close } = useModals();

  return (
    <>
      {modals.map((modal: any) => (
        <div
          key={modal.id}
          className="modal-overlay"
          onClick={() => modal.closable !== false && (close as any)(modal.id)}
        >
          <div
            className={`modal ${modal.size || 'medium'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">{modal.title || 'Modal'}</h3>
              {modal.closable !== false && (
                <button
                  className="modal-close"
                  onClick={() => (close as any)(modal.id)}
                >
                  ×
                </button>
              )}
            </div>
            <div className="modal-content">{modal.content || 'No content'}</div>
            {modal.footer && <div className="modal-footer">{modal.footer}</div>}
          </div>
        </div>
      ))}
    </>
  );
}

// Modal styles
const modalStyles = `
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.2s ease-out;
}

.modal.small {
  max-width: 300px;
}

.modal.medium {
  max-width: 500px;
}

.modal.large {
  max-width: 800px;
}

.modal.fullscreen {
  max-width: 95vw;
  max-height: 95vh;
  width: 95vw;
  height: 95vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-content {
  padding: 1.5rem;
  color: #4a5568;
  line-height: 1.6;
  overflow-y: auto;
  max-height: calc(80vh - 120px);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .modal {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem);
  }
  
  .modal-header,
  .modal-content,
  .modal-footer {
    padding: 1rem;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = modalStyles;
  document.head.appendChild(styleSheet);
}

'use client';

import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const bgColor = {
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  }[type];

  const hoverColor = {
    info: 'hover:bg-blue-600',
    warning: 'hover:bg-yellow-600',
    danger: 'hover:bg-red-600',
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {title}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 ${bgColor} ${hoverColor} text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition`}
          >
            {isLoading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
